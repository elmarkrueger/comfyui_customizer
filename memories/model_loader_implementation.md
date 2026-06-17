# Duffy Model Loader Implementation Memory

## Context
Implemented a new unified `Model_Loader` node for ComfyUI Nodes 2.0 (Schema V3) within the custom node pack workspace.

## Architectural Details
- **Dynamic Routing**: Checks file extensions to distinguish between GGUF and standard formats (Safetensors).
- **Import Handling**: Dynamically loads `ComfyUI-GGUF` dependencies to work around python hyphenated import constraints.
- **Dynamic Bases Patching**: Runtime-patches `GGUFModelPatcher` to inherit from `CoreModelPatcher` (`ModelPatcherDynamic` in ComfyUI 2.0) instead of standard `ModelPatcher`. This ensures GGUF models correctly participate in ComfyUI 2.0 dynamic VRAM announcements and memory management hooks.
- **Fast Header Validation**: Uses `safetensors.safe_open` and `gguf.GGUFReader` to validate the file contents/architecture of model files *before* trigger of multi-gigabyte loading pipelines.
- **Memory Optimization**:
  - Removed manual `LoadedModel` insertion to avoid `AttributeError: 'NoneType' object has no attribute 'detach'` in `load_models_gpu`'s unloading code (triggered by `model_finalizer` being `None` on manually registered models).
  - Let ComfyUI's native execution queue handle registration in `current_loaded_models` during sampler execution, while our base-class patch handles the hook logic.
  - Safely invokes `.partially_unload` in low-VRAM states.
  - Never calls `.to()` directly on memory-mapped quantized tensors to avoid Windows `EXCEPTION_ACCESS_VIOLATION` crashes.
- **Auto-detection**: Automatically detects text encoder types (Flux, SD3, Wan, SDXL) based on filenames if set to `"default"`.
- **CLIP Loading Device option**: Added a `device` input parameter to DuffyModelLoader (`default` or `cpu`), allowing operators to offload standard and GGUF CLIP models to CPU memory (RAM) to save VRAM.
