import gc
import logging
import math
import sys
import time
from typing import Any

import psutil
import torch
from comfy_api.latest import io

# Logger setup
logger = logging.getLogger("IntelligentBlockSwapV2")

# Safety proxy for torch.backends.cuda.matmul
class MatMulProxy:
    def __init__(self, obj):
        object.__setattr__(self, "_obj", obj)
        
    def __getattr__(self, name):
        if name == "allow_fp16_accumulation":
            return getattr(self._obj, "allow_fp16_accumulation", False)
        return getattr(self._obj, name)
        
    def __setattr__(self, name, value):
        if name == "allow_fp16_accumulation":
            try:
                if hasattr(self._obj, "allow_fp16_accumulation"):
                    self._obj.allow_fp16_accumulation = value
            except Exception as e:
                logger.warning(f"Failed to set allow_fp16_accumulation to {value}: {e}")
        else:
            setattr(self._obj, name, value)

if torch.cuda.is_available():
    try:
        if not isinstance(torch.backends.cuda.matmul, MatMulProxy):
            torch.backends.cuda.matmul = MatMulProxy(torch.backends.cuda.matmul)
            logger.info("Successfully wrapped torch.backends.cuda.matmul with Safe Proxy")
    except Exception as e:
        logger.warning(f"Failed to wrap torch.backends.cuda.matmul: {e}")


class IntelligentBlockSwapV2(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="IntelligentBlockSwapV2",
            display_name="Intelligent VRAM & BlockSwap Node 2.0",
            category="Duffy/Latent",
            description=(
                "Next-generation memory load balancer that automatically profiles system memory, "
                "optimizes multi-stream parallel GPU-CPU transfers, and dynamically handles text embedding "
                "context sizes to resolve out-of-memory and negative dimension crash scenarios."
            ),
            inputs=[
                io.Custom("WANVIDEOMODEL").Input(
                    "model",
                    tooltip="The upstream Wan Video transformer model object to be patched."
                ),
                io.Boolean.Input(
                    "auto_hardware_tuning",
                    default=True,
                    optional=True,
                    tooltip="Automatically profile VRAM/DRAM to configure block offload counts dynamically."
                ),
                io.Float.Input(
                    "vram_threshold_percent",
                    default=50.0,
                    min=30.0,
                    max=90.0,
                    step=0.1,
                    optional=True,
                    tooltip="Max allowable VRAM saturation percentage. Swaps blocks to CPU DRAM above this."
                ),
                io.Int.Input(
                    "blocks_to_swap",
                    default=0,
                    min=0,
                    max=48,
                    step=1,
                    optional=True,
                    tooltip="Manual offload override. Defines exact number of blocks to swap."
                ),
                io.Boolean.Input(
                    "enable_cuda_optimization",
                    default=True,
                    optional=True,
                    tooltip="Enables asynchronous multi-stream transfers and overlap computation."
                ),
                io.Boolean.Input(
                    "enable_dram_optimization",
                    default=True,
                    optional=True,
                    tooltip="Enables memory pinning in system RAM to establish high-speed Direct Memory Access (DMA)."
                ),
                io.Int.Input(
                    "num_cuda_streams",
                    default=8,
                    min=1,
                    max=16,
                    step=1,
                    optional=True,
                    tooltip="Count of asynchronous parallel CUDA stream transfers."
                ),
                io.Float.Input(
                    "bandwidth_target",
                    default=0.8,
                    min=0.1,
                    max=1.0,
                    step=0.01,
                    optional=True,
                    tooltip="PCIe bus saturation governor percentage to maintain operating system stability."
                ),
                io.Boolean.Input(
                    "offload_txt_emb",
                    default=True,
                    optional=True,
                    tooltip="Offloads massive T5 text embedding context matrix to CPU DRAM."
                ),
                io.Boolean.Input(
                    "offload_img_emb",
                    default=False,
                    optional=True,
                    tooltip="Offloads CLIP image embeddings to CPU DRAM."
                ),
                io.Int.Input(
                    "vace_blocks_to_swap",
                    default=0,
                    min=0,
                    max=15,
                    step=1,
                    optional=True,
                    tooltip="Variable Auto-Conditioning Encoder (VACE) block swapping count."
                ),
                io.Boolean.Input(
                    "use_non_blocking",
                    default=True,
                    optional=True,
                    tooltip="Enforces non-blocking=True on PyTorch CPU-GPU transfers."
                ),
                io.Boolean.Input(
                    "debug_mode",
                    default=False,
                    optional=True,
                    tooltip="Enables verbose debugging output in the server console."
                ),
            ],
            outputs=[
                io.Custom("WANVIDEOMODEL").Output(
                    "model",
                    tooltip="The patched model object configured with intelligent block swapping intercepts."
                ),
                io.Custom("BLOCKSWAPARGS").Output(
                    "enhanced_block_swap_args",
                    tooltip="Calculated block swap arguments passed to downstream nodes."
                ),
            ]
        )

    @classmethod
    def get_module_size_bytes(cls, module: torch.nn.Module) -> int:
        size = 0
        for p in module.parameters():
            size += p.numel() * p.element_size()
        for b in module.buffers():
            size += b.numel() * b.element_size()
        return size

    @classmethod
    def execute(
        cls,
        model: Any,
        auto_hardware_tuning: bool = True,
        vram_threshold_percent: float = 50.0,
        blocks_to_swap: int = 0,
        enable_cuda_optimization: bool = True,
        enable_dram_optimization: bool = True,
        num_cuda_streams: int = 8,
        bandwidth_target: float = 0.8,
        offload_txt_emb: bool = True,
        offload_img_emb: bool = False,
        vace_blocks_to_swap: int = 0,
        use_non_blocking: bool = True,
        debug_mode: bool = False,
        **kwargs
    ) -> io.NodeOutput:
        del kwargs
        
        patcher = model
        # Unpack the underlying model object
        diffusion_model = patcher.model
        transformer = diffusion_model.diffusion_model
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        offload_device = torch.device("cpu")
        
        is_rocm = False
        if torch.cuda.is_available():
            is_rocm = getattr(torch, "version", None) is not None and getattr(torch.version, "hip", None) is not None
            if is_rocm:
                # scale down streams to prevent AMD driver timeouts
                num_cuda_streams = min(num_cuda_streams, 4)
                if debug_mode:
                    logger.info("[IntelligentBlockSwapV2] ROCm detected. Capped CUDA stream count to 4.")

        # VRAM and DRAM Polling
        if torch.cuda.is_available():
            free_vram_bytes, total_vram_bytes = torch.cuda.mem_get_info(device)
        else:
            free_vram_bytes, total_vram_bytes = 0, 0
            
        dram_info = psutil.virtual_memory()
        dram_total_bytes = dram_info.total
        dram_free_bytes = dram_info.available

        # Size of single block
        if hasattr(transformer, "blocks") and len(transformer.blocks) > 0:
            block_size_bytes = cls.get_module_size_bytes(transformer.blocks[0])
            num_blocks = len(transformer.blocks)
        else:
            block_size_bytes = 0
            num_blocks = 0

        # VRAM Balancing Algorithm
        if auto_hardware_tuning and torch.cuda.is_available() and block_size_bytes > 0:
            max_allowed_vram = total_vram_bytes * (vram_threshold_percent / 100.0)
            total_trans_bytes = cls.get_module_size_bytes(transformer)
            non_block_bytes = total_trans_bytes - (block_size_bytes * num_blocks)
            
            # activation overhead estimated (default 2.5 GB or 15% of total VRAM)
            estimated_overhead = max(2.5 * 1024 * 1024 * 1024, total_vram_bytes * 0.15)
            
            vram_budget_for_blocks = max_allowed_vram - non_block_bytes - estimated_overhead
            blocks_to_keep = int(math.floor(vram_budget_for_blocks / block_size_bytes))
            blocks_to_keep = max(0, min(blocks_to_keep, num_blocks))
            calculated_blocks_to_swap = num_blocks - blocks_to_keep
            
            if debug_mode:
                logger.info(
                    f"[IntelligentBlockSwapV2] Auto hardware tuning:\n"
                    f"  Total VRAM: {total_vram_bytes / (1024**2):.1f} MB\n"
                    f"  Threshold Allowed VRAM: {max_allowed_vram / (1024**2):.1f} MB\n"
                    f"  Non-block weights: {non_block_bytes / (1024**2):.1f} MB\n"
                    f"  Single block size: {block_size_bytes / (1024**2):.1f} MB\n"
                    f"  Overhead reserve: {estimated_overhead / (1024**2):.1f} MB\n"
                    f"  Calculated blocks to keep: {blocks_to_keep} / {num_blocks}\n"
                    f"  Swapping blocks: {calculated_blocks_to_swap}"
                )
        else:
            calculated_blocks_to_swap = blocks_to_swap

        # Package the block swap arguments
        enhanced_block_swap_args = {
            "blocks_to_swap": calculated_blocks_to_swap,
            "use_non_blocking": use_non_blocking,
            "enable_cuda_optimization": enable_cuda_optimization,
            "enable_dram_optimization": enable_dram_optimization,
            "num_cuda_streams": num_cuda_streams,
            "bandwidth_target": bandwidth_target,
            "offload_txt_emb": offload_txt_emb,
            "offload_img_emb": offload_img_emb,
            "vace_blocks_to_swap": vace_blocks_to_swap,
            "block_swap_debug": debug_mode,
        }

        # Apply settings to the ComfyUI Patcher options
        patcher.model_options.setdefault("transformer_options", {})
        patcher.model_options["transformer_options"]["block_swap_args"] = enhanced_block_swap_args

        # Apply memory optimizations directly to the PyTorch layers
        if torch.cuda.is_available() and block_size_bytes > 0:
            # 1. Pinned memory optimization
            if enable_dram_optimization:
                swap_start_idx = num_blocks - calculated_blocks_to_swap
                pinned_count = 0
                for b in range(max(0, swap_start_idx), num_blocks):
                    for p in transformer.blocks[b].parameters():
                        if not p.data.is_pinned():
                            p.data = p.data.pin_memory()
                            pinned_count += 1
                if debug_mode and pinned_count > 0:
                    logger.info(f"[IntelligentBlockSwapV2] Pinned {pinned_count} weight tensors to host memory.")

            # 2. CUDA multi-stream optimization
            if enable_cuda_optimization:
                # Initialize streams if needed
                if not hasattr(transformer, "prefetch_stream") or transformer.prefetch_stream is None:
                    transformer.prefetch_stream = torch.cuda.Stream(device=device, priority=-1)
                if not hasattr(transformer, "offload_stream") or transformer.offload_stream is None:
                    transformer.offload_stream = torch.cuda.Stream(device=device, priority=0)
                
                transformer.enable_cuda_optimization = True
                transformer.offload_stream = transformer.offload_stream
                
                # Setup global torch.cuda.stream hook to redirect None stream parameter to our prefetch stream context
                # inside model's prefetching steps.
                current_module = sys.modules[__name__]
                if not getattr(current_module, "_cuda_stream_hooked", False):
                    original_cuda_stream_fn = torch.cuda.stream
                    
                    def custom_cuda_stream_fn(stream):
                        if stream is None:
                            # Safely fetch active stream
                            if getattr(transformer, "prefetch_stream", None) is not None:
                                return original_cuda_stream_fn(transformer.prefetch_stream)
                        return original_cuda_stream_fn(stream)
                        
                    torch.cuda.stream = custom_cuda_stream_fn
                    current_module._cuda_stream_hooked = True
                    if debug_mode:
                        logger.info("[IntelligentBlockSwapV2] Hooked torch.cuda.stream context manager.")

                # Setup custom `.to()` method for asynchronous offloading & bandwidth throttling
                for block in transformer.blocks:
                    if not getattr(block, "_to_hooked", False):
                        orig_to = block.to
                        
                        def make_custom_to(o_to, blk):
                            def custom_to(dev, *args, **kwargs):
                                # If offloading to CPU
                                if dev == "cpu" or (isinstance(dev, torch.device) and dev.type == "cpu"):
                                    if getattr(transformer, "offload_stream", None) is not None:
                                        start_t = time.perf_counter()
                                        with torch.cuda.stream(transformer.offload_stream):
                                            res = o_to(dev, *args, **kwargs)
                                            # Governor
                                            if bandwidth_target < 1.0:
                                                blk_size = sum(p.numel() * p.element_size() for p in blk.parameters())
                                                max_bw = 16.0 * 1024 * 1024 * 1024 # 16 GB/s
                                                target_bps = max_bw * bandwidth_target
                                                expected_t = blk_size / target_bps
                                                elapsed_t = time.perf_counter() - start_t
                                                if elapsed_t < expected_t:
                                                    time.sleep(expected_t - elapsed_t)
                                            return res
                                return o_to(dev, *args, **kwargs)
                            return custom_to
                            
                        block.to = make_custom_to(orig_to, block)
                        block._to_hooked = True
                if debug_mode:
                    logger.info("[IntelligentBlockSwapV2] Patched blocks `.to()` method with bandwidth governor.")

        # 3. Dynamic sequence length wrapper for context padding (Negative dimension fix)
        model_module = None
        for k, m in list(sys.modules.items()):
            if k.endswith("wanvideo.modules.model"):
                model_module = m
                break
                
        if model_module is not None and hasattr(model_module, "WanVideoModel"):
            WanVideoModel = model_module.WanVideoModel
            if not getattr(WanVideoModel, "_intelligent_swap_patched", False):
                original_forward = WanVideoModel.forward
                
                def wrapped_forward(self, *args, **kwargs):
                    context = kwargs.get("context", None)
                    if context is None and len(args) > 6:
                        context = args[6]
                    nag_context = kwargs.get("nag_context", None)
                    context_ovi = kwargs.get("context_ovi", None)
                    
                    max_seq_len = 512
                    def check_tensors(tensors):
                        nonlocal max_seq_len
                        if tensors is None:
                            return
                        if isinstance(tensors, list):
                            for u in tensors:
                                if u is not None and hasattr(u, "shape"):
                                    max_seq_len = max(max_seq_len, u.shape[0])
                        elif hasattr(tensors, "shape"):
                            if tensors.ndim > 2:
                                max_seq_len = max(max_seq_len, tensors.shape[1])
                            else:
                                max_seq_len = max(max_seq_len, tensors.shape[0])
                                
                    check_tensors(context)
                    check_tensors(nag_context)
                    check_tensors(context_ovi)
                    
                    original_text_len = getattr(self, "text_len", 512)
                    if max_seq_len > original_text_len:
                        self.text_len = max_seq_len
                        if getattr(self, "block_swap_debug", False) or debug_mode:
                            logger.info(f"[IntelligentBlockSwapV2] Dynamic Context: Mutated self.text_len from {original_text_len} to {max_seq_len}")
                            
                    try:
                        result = original_forward(self, *args, **kwargs)
                    finally:
                        if self.text_len != original_text_len:
                            self.text_len = original_text_len
                            
                    return result
                    
                WanVideoModel.forward = wrapped_forward
                WanVideoModel._intelligent_swap_patched = True
                logger.info("Successfully patched WanVideoModel forward pass with Dynamic Context bridge.")

        # Prepare Telemetry output for frontend
        ui_metadata = {
            "calculated_blocks_to_swap": calculated_blocks_to_swap,
            "vram_total": round(total_vram_bytes / (1024 * 1024), 1) if torch.cuda.is_available() else 0,
            "vram_free": round(free_vram_bytes / (1024 * 1024), 1) if torch.cuda.is_available() else 0,
            "dram_total": round(dram_total_bytes / (1024 * 1024), 1),
            "dram_free": round(dram_free_bytes / (1024 * 1024), 1),
            "block_size": round(block_size_bytes / (1024 * 1024), 1) if block_size_bytes > 0 else 0,
            "is_rocm": is_rocm,
        }

        return io.NodeOutput(patcher, enhanced_block_swap_args, ui=ui_metadata)
