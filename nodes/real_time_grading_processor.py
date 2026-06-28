import hashlib
import json
import os
import uuid
from typing import Any

import folder_paths
import numpy as np
import torch
import torch.nn.functional as F
from comfy_api.latest import io
from PIL import Image


def parse_hex_color(hex_str: str) -> list[float]:
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    if len(hex_str) != 6:
        return [0.0, 0.0, 0.0]
    return [int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4)]

def interpolate_monotone_cubic(points: list[list[float]]) -> np.ndarray:
    if not points or len(points) < 2:
        return np.linspace(0.0, 1.0, 256, dtype=np.float32)
    
    # Sort points by x coordinate
    points = sorted(points, key=lambda p: p[0])
    
    # Extract x and y
    xs = np.array([p[0] for p in points], dtype=np.float32)
    ys = np.array([p[1] for p in points], dtype=np.float32)
    
    # Ensure xs are in [0, 1] and unique
    for i in range(1, len(xs)):
        if xs[i] <= xs[i-1]:
            xs[i] = xs[i-1] + 1e-5
            
    n = len(xs)
    # Compute secants
    ms = np.zeros(n - 1, dtype=np.float32)
    for i in range(n - 1):
        ms[i] = (ys[i+1] - ys[i]) / (xs[i+1] - xs[i])
        
    # Compute tangents
    ds = np.zeros(n, dtype=np.float32)
    ds[0] = ms[0]
    ds[-1] = ms[-1]
    for i in range(1, n - 1):
        ds[i] = (ms[i-1] + ms[i]) / 2.0
        
    # Fritsch-Carlson monotonicity adjustment
    for i in range(n - 1):
        if ms[i] == 0.0:
            ds[i] = 0.0
            ds[i+1] = 0.0
        else:
            alpha = ds[i] / ms[i]
            beta = ds[i+1] / ms[i]
            val = alpha**2 + beta**2
            if val > 9.0:
                tau = 3.0 / np.sqrt(val)
                ds[i] = tau * alpha * ms[i]
                ds[i+1] = tau * beta * ms[i]
                
    # Evaluate spline at 256 uniform steps in [0, 1]
    out_x = np.linspace(0.0, 1.0, 256, dtype=np.float32)
    out_y = np.zeros(256, dtype=np.float32)
    
    for idx, x in enumerate(out_x):
        if x <= xs[0]:
            out_y[idx] = ys[0]
            continue
        if x >= xs[-1]:
            out_y[idx] = ys[-1]
            continue
            
        i = 0
        while i < n - 1 and x > xs[i+1]:
            i += 1
            
        h = xs[i+1] - xs[i]
        t = (x - xs[i]) / h
        
        h00 = 2.0 * t**3 - 3.0 * t**2 + 1.0
        h10 = t**3 - 2.0 * t**2 + t
        h01 = -2.0 * t**3 + 3.0 * t**2
        h11 = t**3 - t**2
        
        out_y[idx] = h00 * ys[i] + h10 * h * ds[i] + h01 * ys[i+1] + h11 * h * ds[i+1]
        
    return np.clip(out_y, 0.0, 1.0)

def generate_gradient_lut(stops: list[dict], device, dtype) -> torch.Tensor:
    if not stops:
        stops = [{"offset": 0.0, "color": "#000000"}, {"offset": 1.0, "color": "#ffffff"}]
        
    sorted_stops = sorted(stops, key=lambda s: s["offset"])
    
    if sorted_stops[0]["offset"] > 0.0:
        sorted_stops.insert(0, {"offset": 0.0, "color": sorted_stops[0]["color"]})
    if sorted_stops[-1]["offset"] < 1.0:
        sorted_stops.append({"offset": 1.0, "color": sorted_stops[-1]["color"]})
        
    lut = np.zeros((256, 3), dtype=np.float32)
    offsets = [s["offset"] for s in sorted_stops]
    colors = [parse_hex_color(s["color"]) for s in sorted_stops]
    
    for i in range(256):
        t = i / 255.0
        idx = 0
        while idx < len(offsets) - 1 and t > offsets[idx + 1]:
            idx += 1
            
        t0 = offsets[idx]
        t1 = offsets[idx + 1]
        c0 = np.array(colors[idx])
        c1 = np.array(colors[idx + 1])
        
        if t1 == t0:
            c = c0
        else:
            factor = (t - t0) / (t1 - t0)
            c = c0 + factor * (c1 - c0)
            
        lut[i] = c
        
    return torch.tensor(lut, device=device, dtype=dtype)


def clamp_float(value: Any, minimum: float, maximum: float, fallback: float) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return fallback
    return max(minimum, min(maximum, parsed))


def make_gaussian_kernel_1d(sigma: float, device: torch.device, dtype: torch.dtype) -> torch.Tensor:
    sigma = max(float(sigma), 1e-3)
    radius = max(1, int(np.ceil(sigma * 3.0)))
    coords = torch.arange(-radius, radius + 1, device=device, dtype=dtype)
    kernel = torch.exp(-(coords * coords) / (2.0 * sigma * sigma))
    kernel = kernel / torch.sum(kernel)
    return kernel


def apply_separable_gaussian_blur(image: torch.Tensor, sigma: float) -> torch.Tensor:
    if sigma <= 0.0:
        return image

    _, channels, _, _ = image.shape
    device = image.device
    dtype = image.dtype

    kernel_1d = make_gaussian_kernel_1d(sigma, device=device, dtype=dtype)
    kernel_x = kernel_1d.view(1, 1, 1, -1).repeat(channels, 1, 1, 1)
    kernel_y = kernel_1d.view(1, 1, -1, 1).repeat(channels, 1, 1, 1)

    pad_x = kernel_x.shape[-1] // 2
    pad_y = kernel_y.shape[-2] // 2

    blurred = F.conv2d(F.pad(image, (pad_x, pad_x, 0, 0), mode="replicate"), kernel_x, groups=channels)
    blurred = F.conv2d(F.pad(blurred, (0, 0, pad_y, pad_y), mode="replicate"), kernel_y, groups=channels)
    return blurred


class DuffyRealTimeGradingProcessor(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="Duffy_RealTimeGradingProcessor",
            display_name="Real-Time Shader & Grading Processor",
            category="Duffy/PostProcessing",
            not_idempotent=True,
            description=(
                "Real-time post-processing and color grading suite using Nodes 2.0 and V3 Schema. "
                "Applies curves, chromatic aberration, grain, sharpening, vignette, gradient maps, "
                "lift/gamma/gain, exposure/contrast/saturation, and bloom."
            ),
            inputs=[
                io.Image.Input("image"),
                io.String.Input(
                    "shader_params",
                    default="{}",
                    socketless=True,
                    tooltip="Serialized JSON payload containing curve control points and grading parameters.",
                ),
            ],
            outputs=[
                io.Image.Output("image"),
            ],
            hidden=[
                io.Hidden.unique_id,
                io.Hidden.prompt,
            ]
        )

    @classmethod
    def validate_inputs(cls, shader_params: str, **kwargs) -> bool | str:
        del kwargs
        try:
            data = json.loads(shader_params)
        except json.JSONDecodeError:
            return "shader_params must be valid JSON"
        
        if not isinstance(data, dict):
            return "shader_params must be a JSON object"
            
        if len(shader_params) > 500_000:
            return "shader_params exceeds maximum size limit"
            
        return True

    @classmethod
    def fingerprint_inputs(cls, shader_params: str, **kwargs) -> str:
        del kwargs
        # Standardize whitespace in JSON for consistent fingerprinting
        try:
            parsed = json.loads(shader_params)
            payload = json.dumps(parsed, sort_keys=True, separators=(",", ":"))
        except (json.JSONDecodeError, ValueError):
            payload = shader_params
            
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @classmethod
    def execute(
        cls,
        image: torch.Tensor,
        shader_params: str,
        unique_id: str | None = None,
        prompt: Any = None,
        **kwargs,
    ) -> io.NodeOutput:
        del prompt, kwargs

        def _save_thumbnail_from_tensor(tensor: torch.Tensor, prefix: str) -> dict[str, str] | None:
            temp_dir = folder_paths.get_temp_directory()
            os.makedirs(temp_dir, exist_ok=True)

            temp_name = f"{prefix}_{uuid.uuid4().hex}.png"
            temp_path = os.path.join(temp_dir, temp_name)

            image_np = tensor.detach().cpu().numpy()
            image_np = (image_np * 255.0).clip(0, 255).astype("uint8")

            if image_np.ndim == 2:
                pil_img = Image.fromarray(image_np, mode="L")
            elif image_np.ndim == 3:
                channels = image_np.shape[2]
                if channels == 1:
                    pil_img = Image.fromarray(image_np[:, :, 0], mode="L")
                elif channels == 3:
                    pil_img = Image.fromarray(image_np, mode="RGB")
                elif channels >= 4:
                    pil_img = Image.fromarray(image_np[:, :, :4], mode="RGBA")
                else:
                    pil_img = Image.fromarray(image_np[:, :, :3], mode="RGB")
            else:
                return None

            pil_img.thumbnail((512, 512))

            try:
                pil_img.save(temp_path, "PNG", compress_level=1)
                return {
                    "filename": temp_name,
                    "subfolder": "",
                    "type": "temp",
                }
            except Exception as exc:
                print(f"[Duffy_RealTimeGradingProcessor] Failed to save preview: {exc}")
                return None

        if image is None or not isinstance(image, torch.Tensor):
            return io.NodeOutput(block_execution="Duffy_RealTimeGradingProcessor: missing IMAGE input.")

        if image.ndim == 3:
            image = image.unsqueeze(0)

        if image.ndim != 4:
            return io.NodeOutput(
                block_execution=(
                    "Duffy_RealTimeGradingProcessor: expected IMAGE tensor in [B,H,W,C] format, "
                    f"got shape {tuple(image.shape)}"
                )
            )

        if image.shape[0] == 0:
            return io.NodeOutput(block_execution="Duffy_RealTimeGradingProcessor: input IMAGE batch is empty.")

        # Keep output contract stable for downstream preview/save nodes.
        image = image.detach().to(dtype=torch.float32).clamp(0.0, 1.0)

        # Save a low-resolution thumbnail of the unmodified input image for compare preview.
        original_thumbnail_info = _save_thumbnail_from_tensor(image[0], "duffy_grading_input")

        # Parse params
        try:
            params = json.loads(shader_params)
        except Exception:
            params = {}

        # Extract parameters
        curves = params.get("curves", {})
        chromatic_aberration = clamp_float(params.get("chromatic_aberration", 0.0), 0.0, 0.05, 0.0)
        film_grain = clamp_float(params.get("film_grain", 0.0), 0.0, 0.1, 0.0)
        sharpen = clamp_float(params.get("sharpen", 0.0), 0.0, 2.0, 0.0)
        vignette_intensity = clamp_float(params.get("vignette_intensity", 0.0), 0.0, 1.5, 0.0)

        ecs_params = params.get("exposure_contrast_saturation", {})
        exposure = clamp_float(ecs_params.get("exposure", 0.0), -2.0, 2.0, 0.0)
        contrast = clamp_float(ecs_params.get("contrast", 1.0), 0.0, 3.0, 1.0)
        saturation = clamp_float(ecs_params.get("saturation", 1.0), 0.0, 3.0, 1.0)

        lgg_params = params.get("lift_gamma_gain", {})
        lift = clamp_float(lgg_params.get("lift", 0.0), -1.0, 1.0, 0.0)
        gamma = clamp_float(lgg_params.get("gamma", 1.0), 0.1, 4.0, 1.0)
        gain = clamp_float(lgg_params.get("gain", 1.0), 0.0, 3.0, 1.0)

        bloom_params = params.get("bloom", {})
        bloom_intensity = clamp_float(bloom_params.get("intensity", 0.0), 0.0, 2.0, 0.0)
        bloom_threshold = clamp_float(bloom_params.get("threshold", 0.8), 0.0, 1.0, 0.8)
        bloom_radius = clamp_float(bloom_params.get("radius", 2.0), 0.5, 8.0, 2.0)
        
        grad_map_params = params.get("gradient_map", {})
        grad_enabled = bool(grad_map_params.get("enabled", False))
        grad_stops = grad_map_params.get("stops", [])
        grad_mode = grad_map_params.get("blending_mode", "Normal")
        grad_opacity = float(grad_map_params.get("opacity", 1.0))
        
        # Apply mathematical operators in PyTorch on high-resolution tensor
        # ComfyUI standard: [B, H, W, C]
        B, H, W, C = image.shape
        device = image.device
        dtype = image.dtype
        
        # Permute to PyTorch standard [B, C, H, W] for grid_sample & conv2d
        x = image.permute(0, 3, 1, 2).clone()
        
        # Create coordinate grid in range [-1, 1]
        grid_y = torch.linspace(-1, 1, H, device=device, dtype=dtype)
        grid_x = torch.linspace(-1, 1, W, device=device, dtype=dtype)
        mesh_y, mesh_x = torch.meshgrid(grid_y, grid_x, indexing="ij")
        grid = torch.stack([mesh_x, mesh_y], dim=-1)  # [H, W, 2]
        
        # 1. Sharpening (Laplacian filter)
        if sharpen > 0.0:
            # depthwise Laplacian filter for RGB
            kernel = torch.tensor([[0.0, -1.0, 0.0],
                                   [-1.0, 4.0, -1.0],
                                   [0.0, -1.0, 0.0]], device=device, dtype=dtype)
            kernel = kernel.view(1, 1, 3, 3).repeat(C, 1, 1, 1)
            padded = torch.nn.functional.pad(x, (1, 1, 1, 1), mode="replicate")
            laplacian = torch.nn.functional.conv2d(padded, kernel, groups=C)
            x = torch.clamp(x + sharpen * laplacian, 0.0, 1.0)
            
        # 2. Chromatic Aberration
        if chromatic_aberration > 0.0:
            dist = torch.norm(grid, dim=-1, keepdim=True)  # [H, W, 1]
            norm_grid = grid / (dist + 1e-8)
            offset = norm_grid * (dist * dist) * chromatic_aberration
            
            grid_red = (grid + offset).unsqueeze(0).expand(B, -1, -1, -1)
            grid_blue = (grid - offset).unsqueeze(0).expand(B, -1, -1, -1)
            
            r_chan = torch.nn.functional.grid_sample(x[:, 0:1, :, :], grid_red, mode="bilinear", padding_mode="border", align_corners=True)
            g_chan = x[:, 1:2, :, :]
            b_chan = torch.nn.functional.grid_sample(x[:, 2:3, :, :], grid_blue, mode="bilinear", padding_mode="border", align_corners=True)
            
            x = torch.cat([r_chan, g_chan, b_chan], dim=1)

        # 3. Exposure / Contrast / Saturation
        if exposure != 0.0:
            x = x * (2.0 ** exposure)

        if contrast != 1.0:
            x = (x - 0.5) * contrast + 0.5

        if saturation != 1.0:
            lum = 0.2126 * x[:, 0:1, :, :] + 0.7152 * x[:, 1:2, :, :] + 0.0722 * x[:, 2:3, :, :]
            x = lum + (x - lum) * saturation

        x = torch.clamp(x, 0.0, 1.0)

        # 4. Lift / Gamma / Gain
        if lift != 0.0:
            x = x + lift

        if gamma != 1.0:
            x = torch.pow(torch.clamp(x, 1e-6, 1.0), 1.0 / gamma)

        if gain != 1.0:
            x = x * gain

        x = torch.clamp(x, 0.0, 1.0)
            
        # 5. Tonal Curves
        # Compute Monotone Cubic LUTs for each channel
        lut_rgb = torch.tensor(interpolate_monotone_cubic(curves.get("rgb")), device=device, dtype=dtype)
        lut_r = torch.tensor(interpolate_monotone_cubic(curves.get("r")), device=device, dtype=dtype)
        lut_g = torch.tensor(interpolate_monotone_cubic(curves.get("g")), device=device, dtype=dtype)
        lut_b = torch.tensor(interpolate_monotone_cubic(curves.get("b")), device=device, dtype=dtype)
        
        # Apply channel-specific curves
        idx_r = (x[:, 0] * 255.0).clamp(0.0, 255.0).round().long()
        idx_g = (x[:, 1] * 255.0).clamp(0.0, 255.0).round().long()
        idx_b = (x[:, 2] * 255.0).clamp(0.0, 255.0).round().long()
        
        r_mapped = lut_r[idx_r]
        g_mapped = lut_g[idx_g]
        b_mapped = lut_b[idx_b]
        
        # Apply Master (RGB) curve on top
        idx_mr = (r_mapped * 255.0).clamp(0.0, 255.0).round().long()
        idx_mg = (g_mapped * 255.0).clamp(0.0, 255.0).round().long()
        idx_mb = (b_mapped * 255.0).clamp(0.0, 255.0).round().long()
        
        x = torch.stack([lut_rgb[idx_mr], lut_rgb[idx_mg], lut_rgb[idx_mb]], dim=1)
        
        # 6. Gradient Map Color Balancing
        if grad_enabled:
            # Compute luminance
            luminance = 0.2126 * x[:, 0:1, :, :] + 0.7152 * x[:, 1:2, :, :] + 0.0722 * x[:, 2:3, :, :]
            # Generate gradient map LUT
            grad_lut = generate_gradient_lut(grad_stops, device, dtype)
            # Map luminance
            idx_lum = (luminance * 255.0).clamp(0.0, 255.0).round().long().squeeze(1)
            grad_mapped = grad_lut[idx_lum].permute(0, 3, 1, 2)  # [B, 3, H, W]
            
            # Blend
            if grad_mode == "Normal":
                blended = grad_mapped
            elif grad_mode == "Overlay":
                mask = x < 0.5
                blended = torch.where(mask, 2.0 * x * grad_mapped, 1.0 - 2.0 * (1.0 - x) * (1.0 - grad_mapped))
            elif grad_mode == "Soft Light":
                blended = (1.0 - 2.0 * grad_mapped) * (x ** 2) + 2.0 * grad_mapped * x
            elif grad_mode == "Multiply":
                blended = x * grad_mapped
            elif grad_mode == "Screen":
                blended = 1.0 - (1.0 - x) * (1.0 - grad_mapped)
            else:
                blended = grad_mapped
                
            x = torch.clamp((1.0 - grad_opacity) * x + grad_opacity * blended, 0.0, 1.0)

        # 7. Bloom (highlight threshold + downsampled Gaussian blur)
        if bloom_intensity > 0.0:
            bloom_threshold_scale = max(1e-6, 1.0 - bloom_threshold)
            bloom_luminance = 0.2126 * x[:, 0:1, :, :] + 0.7152 * x[:, 1:2, :, :] + 0.0722 * x[:, 2:3, :, :]
            bloom_mask = torch.clamp((bloom_luminance - bloom_threshold) / bloom_threshold_scale, 0.0, 1.0)
            bloom_source = x * bloom_mask

            down_h = max(1, H // 2)
            down_w = max(1, W // 2)
            bloom_small = F.interpolate(bloom_source, size=(down_h, down_w), mode="bilinear", align_corners=False)

            # Sigma is scaled for lower-resolution blur to keep bloom spread predictable.
            bloom_blurred = apply_separable_gaussian_blur(bloom_small, sigma=max(0.5, bloom_radius * 0.5))
            bloom_full = F.interpolate(bloom_blurred, size=(H, W), mode="bilinear", align_corners=False)

            x = torch.clamp(x + bloom_full * bloom_intensity, 0.0, 1.0)
            
        # 8. Vignette Falloff
        if vignette_intensity > 0.0:
            dist_v = torch.norm(grid, dim=-1, keepdim=True).permute(2, 0, 1).unsqueeze(0)  # [1, 1, H, W]
            # Match coordinate scope: distance to corner in [-1, 1] grid is sqrt(2) = 1.414.
            # To apply vignette properly:
            vignette = torch.clamp(1.0 - (dist_v * dist_v * vignette_intensity), 0.0, 1.0)
            x = x * vignette
            
        # 9. Cinematic Film Grain
        if film_grain > 0.0:
            # Monochromatic grain added to luminance
            noise = torch.randn(B, 1, H, W, device=device, dtype=dtype)
            x = torch.clamp(x + noise * film_grain, 0.0, 1.0)
            
        # Permute back to ComfyUI standard: [B, H, W, C]
        output_tensor = x.permute(0, 2, 3, 1).contiguous()
        output_tensor = torch.nan_to_num(output_tensor, nan=0.0, posinf=1.0, neginf=0.0).clamp(0.0, 1.0)

        # Save a low-resolution thumbnail of processed output for robust compare fallback.
        processed_thumbnail_info = _save_thumbnail_from_tensor(output_tensor[0], "duffy_grading_output")
        
        # 10. Asynchronous Histogram Telemetry (calculated on output_tensor)
        # Flatten channels for histc
        out_r = output_tensor[:, :, :, 0].flatten()
        out_g = output_tensor[:, :, :, 1].flatten()
        out_b = output_tensor[:, :, :, 2].flatten()
        out_lum = (0.2126 * out_r + 0.7152 * out_g + 0.0722 * out_b)
        
        try:
            hist_r = torch.histc(out_r, bins=256, min=0.0, max=1.0).cpu().tolist()
            hist_g = torch.histc(out_g, bins=256, min=0.0, max=1.0).cpu().tolist()
            hist_b = torch.histc(out_b, bins=256, min=0.0, max=1.0).cpu().tolist()
            hist_lum = torch.histc(out_lum, bins=256, min=0.0, max=1.0).cpu().tolist()
        except Exception:
            hist_r = [0] * 256
            hist_g = [0] * 256
            hist_b = [0] * 256
            hist_lum = [0] * 256
            
        histogram_data = {
            "r": hist_r,
            "g": hist_g,
            "b": hist_b,
            "lum": hist_lum
        }

        compare_images = []
        if original_thumbnail_info is not None:
            compare_images.append(original_thumbnail_info)
        if processed_thumbnail_info is not None:
            compare_images.append(processed_thumbnail_info)
        
        # Package and return
        # Comfy execution flattens UI payloads as lists per key.
        ui_metadata = {
            "original_thumbnail": [original_thumbnail_info] if original_thumbnail_info is not None else [],
            "processed_thumbnail": [processed_thumbnail_info] if processed_thumbnail_info is not None else [],
            "compare_images": compare_images,
            "histogram": [histogram_data],
        }
        
        return io.NodeOutput(output_tensor, ui=ui_metadata)
