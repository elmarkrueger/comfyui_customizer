import math
from typing import Any

import comfy.utils
import torch
from comfy_api.latest import io


class DuffyLatentScalingCalculator(io.ComfyNode):
    MODEL_FACTORS = {
        "Flux 1": 8,
        "Flux 2": 6,
        "SD3": 8,
    }
    MODEL_FACTOR_VARIANTS = {
        "Flux 1": (8,),
        "Flux 2": (6, 16),
        "SD3": (8,),
    }

    @staticmethod
    def _is_scalar_ratio(value: Any) -> bool:
        return isinstance(value, (int, float)) and not isinstance(value, bool)

    @staticmethod
    def _round_half_up(value: float) -> int:
        return int(math.floor(value + 0.5))

    @classmethod
    def _align_to_factor(cls, value: float, factor: int) -> int:
        aligned = cls._round_half_up(value / float(factor)) * factor
        return max(factor, aligned)

    @classmethod
    def _resolve_vae_factor(cls, vae: Any) -> int:
        if vae is None:
            raise ValueError("VAE input is required.")
        if not hasattr(vae, "downscale_ratio") or not hasattr(vae, "upscale_ratio"):
            raise ValueError("Connected VAE is missing downscale/upscale ratio metadata.")

        downscale_ratio = getattr(vae, "downscale_ratio")
        upscale_ratio = getattr(vae, "upscale_ratio")

        if not cls._is_scalar_ratio(downscale_ratio) or not cls._is_scalar_ratio(upscale_ratio):
            raise ValueError(
                "Only 2D image VAEs with scalar ratios are supported. Video/temporal VAE ratios are not supported yet."
            )

        factor_down = cls._round_half_up(float(downscale_ratio))
        factor_up = cls._round_half_up(float(upscale_ratio))

        if factor_down <= 0 or factor_up <= 0:
            raise ValueError("VAE ratios must be positive scalars.")
        if factor_down != factor_up:
            raise ValueError(
                f"VAE downscale/upscale mismatch detected ({downscale_ratio} vs {upscale_ratio})."
            )

        return factor_down

    @classmethod
    def _resize_latent_direct(
        cls,
        latent_tensor: torch.Tensor,
        width_latent: int,
        height_latent: int,
    ) -> torch.Tensor:
        return comfy.utils.common_upscale(
            latent_tensor,
            width_latent,
            height_latent,
            upscale_method="bicubic",
            crop="center",
        )

    @classmethod
    def _resize_latent_via_pixels(
        cls,
        latent_tensor: torch.Tensor,
        vae: Any,
        width_pixels: int,
        height_pixels: int,
        width_latent: int,
        height_latent: int,
    ) -> torch.Tensor:
        decode_fn = getattr(vae, "decode", None)
        encode_fn = getattr(vae, "encode", None)
        if not callable(decode_fn) or not callable(encode_fn):
            raise ValueError("Connected VAE does not expose decode/encode for pixel-space resampling.")

        decoded_image = decode_fn(latent_tensor)
        if not isinstance(decoded_image, torch.Tensor) or decoded_image.ndim != 4:
            raise ValueError("VAE.decode returned unexpected image tensor format.")

        # common_upscale expects [B, C, H, W] while ComfyUI image tensors are [B, H, W, C].
        decoded_bchw = decoded_image.movedim(-1, 1)
        resized_bchw = comfy.utils.common_upscale(
            decoded_bchw,
            width_pixels,
            height_pixels,
            upscale_method="bicubic",
            crop="center",
        )
        resized_pixels = resized_bchw.movedim(1, -1).clamp(0.0, 1.0)

        reencoded_latent = encode_fn(resized_pixels)
        if not isinstance(reencoded_latent, torch.Tensor) or reencoded_latent.ndim != 4:
            raise ValueError("VAE.encode returned unexpected latent tensor format.")

        if reencoded_latent.shape[-1] != width_latent or reencoded_latent.shape[-2] != height_latent:
            reencoded_latent = cls._resize_latent_direct(reencoded_latent, width_latent, height_latent)

        return reencoded_latent

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="Duffy_LatentScalingCalculator",
            display_name="Dynamic Latent Scaling & Dimension Calculator",
            category="Duffy/Latent",
            description=(
                "Advanced latent scaling and dimension calculation custom node for Nodes 2.0. "
                "Calculates aspect-ratio-locked target resolutions dynamically based on the selected "
                "diffusion architecture (Flux 1, Flux 2, or SD3). Connected VAE ratio metadata is authoritative."
            ),
            inputs=[
                io.Latent.Input("samples", tooltip="The input latent tensor dictionary to scale."),
                io.Vae.Input("vae", tooltip="The Variational Autoencoder object. Its ratio metadata defines scaling factor."),
                io.Int.Input(
                    "reduced_image_size",
                    default=1024,
                    min=64,
                    max=8192,
                    step=8,
                    tooltip="Desired longest side length (in pixels) for the output latent."
                ),
                io.Int.Input(
                    "target_size",
                    default=4096,
                    min=64,
                    max=16384,
                    step=8,
                    tooltip="Desired longest side length (in pixels) for the final calculated pixel dimensions."
                ),
                io.Combo.Input(
                    "model_family",
                    options=["Flux 1", "Flux 2", "SD3"],
                    default="Flux 1",
                    tooltip="Architecture intent used for compatibility checks and warnings. VAE ratio metadata is authoritative."
                )
            ],
            outputs=[
                io.Latent.Output("latent"),
                io.Int.Output("calc_width"),
                io.Int.Output("calc_height"),
            ],
            hidden=[
                io.Hidden.unique_id,
                io.Hidden.prompt,
            ]
        )

    @classmethod
    def validate_inputs(
        cls,
        samples: Any = None,
        vae: Any = None,
        reduced_image_size: Any = None,
        target_size: Any = None,
        model_family: Any = None,
        **kwargs,
    ) -> bool | str:
        del samples, vae, kwargs

        # Prompt-time validation in ComfyUI may call this with partial or positional-only values.
        # Keep this method permissive and validate concrete tensor/vae contracts at runtime in execute().
        if isinstance(reduced_image_size, (int, float)) and reduced_image_size < 64:
            return "reduced_image_size must be >= 64."

        if isinstance(target_size, (int, float)) and target_size < 64:
            return "target_size must be >= 64."

        if isinstance(model_family, str) and model_family not in cls.MODEL_FACTORS:
            return f"Invalid model_family '{model_family}'. Expected one of: {', '.join(cls.MODEL_FACTORS)}."

        return True

    @classmethod
    def _validate_runtime_inputs(
        cls,
        samples: dict,
        vae: Any,
        reduced_image_size: int,
        target_size: int,
        model_family: str,
    ) -> bool | str:
        if not isinstance(samples, dict) or "samples" not in samples:
            return "Missing LATENT payload: expected dict with a 'samples' tensor."

        latent_tensor = samples["samples"]
        if not isinstance(latent_tensor, torch.Tensor):
            return "LATENT samples must be a PyTorch tensor."

        if latent_tensor.ndim != 4:
            return (
                f"Only 4D image latents are supported ([B, C, H, W]); got {latent_tensor.ndim}D tensor. "
                "Video/temporal latents are not supported yet."
            )

        if model_family not in cls.MODEL_FACTORS:
            return f"Invalid model_family '{model_family}'. Expected one of: {', '.join(cls.MODEL_FACTORS)}."

        if reduced_image_size < 64 or target_size < 64:
            return "reduced_image_size and target_size must both be >= 64."

        try:
            cls._resolve_vae_factor(vae)
        except ValueError as exc:
            return str(exc)

        return True

    @classmethod
    def execute(
        cls,
        samples: dict,
        vae: Any,
        reduced_image_size: int,
        target_size: int,
        model_family: str,
        unique_id: str | None = None,
        prompt: Any = None,
        **kwargs,
    ) -> io.NodeOutput:
        del unique_id, prompt, kwargs

        validation_error = cls._validate_runtime_inputs(
            samples=samples,
            vae=vae,
            reduced_image_size=reduced_image_size,
            target_size=target_size,
            model_family=model_family,
        )
        if validation_error is not True:
            return io.NodeOutput(block_execution=f"Duffy_LatentScalingCalculator: {validation_error}")

        latent_tensor = samples["samples"]
        batch, channels, h_lat, w_lat = latent_tensor.shape

        # 1. Resolve spatial compression factor from the connected VAE (authoritative)
        f = cls._resolve_vae_factor(vae)

        # Derive input Aspect Ratio
        ar = w_lat / float(h_lat)

        # 2. Align reduced size to VAE downscale factor using PRD round-to-nearest behavior
        aligned_reduced = cls._align_to_factor(reduced_image_size, f)

        # Calculate new pixel dimensions preserving aspect ratio
        if ar >= 1.0:
            w_new_pix = aligned_reduced
            h_new_pix = cls._align_to_factor(aligned_reduced / ar, f)
        else:
            h_new_pix = aligned_reduced
            w_new_pix = cls._align_to_factor(aligned_reduced * ar, f)

        # Latent spatial matrix dimensions for the output latent tensor
        w_new_lat = w_new_pix // f
        h_new_lat = h_new_pix // f

        # 3. Safeguard against sub-pixel collapses (min 8 latent blocks)
        min_latent_blocks = 8
        min_pixels = min_latent_blocks * f
        if w_new_lat < 8 or h_new_lat < 8:
            raise ValueError(
                f"Dimensional collapse: calculated latent shape ({h_new_lat}, {w_new_lat}) "
                f"is below the minimum limit of {min_latent_blocks} blocks ({min_pixels} pixels) on the short side due to "
                f"extreme aspect ratio {ar:.4f} and/or small reduced size {reduced_image_size}. "
                f"Please select a larger reduced_image_size."
            )

        warnings = []
        resize_mode = "latent"
        input_long_side = max(w_lat * f, h_lat * f)

        # Latent-space downscaling can amplify facial/detail distortions across model families.
        # If we are reducing below source long side, prefer decode->pixel resize->encode when available.
        prefer_pixel_space_resize = aligned_reduced < input_long_side

        if prefer_pixel_space_resize:
            try:
                upscaled_latent = cls._resize_latent_via_pixels(
                    latent_tensor=latent_tensor,
                    vae=vae,
                    width_pixels=w_new_pix,
                    height_pixels=h_new_pix,
                    width_latent=w_new_lat,
                    height_latent=h_new_lat,
                )
                resize_mode = "pixel"
                warnings.append(
                    "Quality Preservation Mode: downscale detected; applied decode->pixel resize->encode to reduce facial/detail distortion."
                )
            except Exception as exc:
                upscaled_latent = cls._resize_latent_direct(latent_tensor, w_new_lat, h_new_lat)
                warnings.append(
                    f"Pixel-Space Resample Fallback: {exc} Using latent-space interpolation."
                )
        else:
            upscaled_latent = cls._resize_latent_direct(latent_tensor, w_new_lat, h_new_lat)

        # Reconstruct output dictionary preserving metadata
        output_samples = samples.copy()
        output_samples["samples"] = upscaled_latent

        # 5. Recalculate true aspect ratio post-interpolation to prevent precision drift
        new_ar = w_new_lat / float(h_new_lat)

        # 6. Align target size constraints using PRD round-to-nearest behavior
        aligned_target = cls._align_to_factor(target_size, f)

        if new_ar >= 1.0:
            calc_width = aligned_target
            calc_height = cls._align_to_factor(aligned_target / new_ar, f)
        else:
            calc_height = aligned_target
            calc_width = cls._align_to_factor(aligned_target * new_ar, f)

        # 7. Type validation / Channel depth checks
        if channels == 4 and model_family in ("Flux 1", "Flux 2", "SD3"):
            warnings.append(
                f"Channel Depth Mismatch: Detected 4-channel latent (SD1.5/SDXL), "
                f"but model family is '{model_family}' (expects 16 or 32 channels). "
                f"Downstream models may fail."
            )
        elif channels == 16 and model_family == "Flux 2":
            warnings.append(
                "Channel Depth Mismatch: Detected 16-channel latent (Flux 1/SD3), "
                "but model family is 'Flux 2' (expects 32 channels)."
            )
        elif channels == 32 and model_family != "Flux 2":
            warnings.append(
                f"Channel Depth Mismatch: Detected 32-channel latent (Flux 2), "
                f"but model family is '{model_family}' (expects 16 channels)."
            )

        expected_factors = cls.MODEL_FACTOR_VARIANTS.get(model_family, ())
        if expected_factors and f not in expected_factors:
            expected_label = "/".join(f"f={factor}" for factor in expected_factors)
            warnings.append(
                f"VAE/Model Factor Mismatch: model family '{model_family}' usually uses {expected_label}, "
                f"but connected VAE reports f={f}. Using VAE factor."
            )

        if aligned_reduced < input_long_side and resize_mode != "pixel":
            warnings.append(
                f"Detail Loss Advisory: reduced_image_size={reduced_image_size} scales below input long side "
                f"{input_long_side}px at factor f={f}. This can increase face/texture distortion. "
                "For cleaner pixel-space upscaling, set reduced_image_size >= input long side."
            )

        # Package UI metadata for frontend consumption
        ui_metadata = {
            "calc_width": [calc_width],
            "calc_height": [calc_height],
            "vae_factor": [f],
            "factor_source": ["vae.downscale_ratio"],
            "resize_mode": [resize_mode],
            "input_width": [w_lat * f],
            "input_height": [h_lat * f],
            "input_channels": [channels],
            "batch_size": [batch],
            "warnings": warnings,
            "model_family": [model_family]
        }

        return io.NodeOutput(output_samples, calc_width, calc_height, ui=ui_metadata)
