import math
from typing import Any

import comfy.utils
import torch
from comfy_api.latest import io


class DuffyLatentScalingCalculator(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="Duffy_LatentScalingCalculator",
            display_name="Dynamic Latent Scaling & Dimension Calculator",
            category="Duffy/Latent",
            description=(
                "Advanced latent scaling and dimension calculation custom node for Nodes 2.0. "
                "Calculates aspect-ratio-locked target resolutions dynamically based on the selected "
                "diffusion architecture (Flux 1, Flux 2, or SD3) and VAE compression factor."
            ),
            inputs=[
                io.Latent.Input("samples", tooltip="The input latent tensor dictionary to scale."),
                io.Vae.Input("vae", tooltip="The Variational Autoencoder object (for future property inheritance)."),
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
                    tooltip="The model family which dictates the VAE spatial downscale factor."
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
        del vae, unique_id, prompt, kwargs

        if samples is None or "samples" not in samples:
            return io.NodeOutput(block_execution="Duffy_LatentScalingCalculator: missing LATENT input.")

        latent_tensor = samples["samples"]
        if not isinstance(latent_tensor, torch.Tensor):
            return io.NodeOutput(block_execution="Duffy_LatentScalingCalculator: LATENT samples must be a PyTorch tensor.")

        # 1. Establish absolute spatial compression factor (f) based on architecture
        factor_map = {
            "Flux 1": 8,
            "SD3": 8,
            "Flux 2": 6
        }
        f = factor_map.get(model_family, 8)

        # 2. Extract latent spatial dimensions dynamically (supporting batched/multidimensional topologies safely)
        # Latent dimensions are expected to be (Batch, Channels, Height, Width)
        # or (Batch, Temporal, Channels, Height, Width)
        h_lat = latent_tensor.shape[-2]
        w_lat = latent_tensor.shape[-1]
        channels = latent_tensor.shape[-3] if len(latent_tensor.shape) >= 3 else 0

        # Derive input Aspect Ratio
        ar = w_lat / float(h_lat)

        # 3. Align reduced size to VAE downscale factor (using floor alignment as per PRD)
        aligned_reduced = (reduced_image_size // f) * f

        # Calculate new pixel dimensions preserving aspect ratio
        if ar >= 1.0:
            w_new_pix = aligned_reduced
            h_new_pix = (round(aligned_reduced / ar) // f) * f
        else:
            h_new_pix = aligned_reduced
            w_new_pix = (round(aligned_reduced * ar) // f) * f

        # Latent spatial matrix dimensions for the output latent tensor
        w_new_lat = w_new_pix // f
        h_new_lat = h_new_pix // f

        # 4. Safeguard against sub-pixel collapses (min 8 blocks / 64 pixels)
        if w_new_lat < 8 or h_new_lat < 8:
            raise ValueError(
                f"Dimensional collapse: calculated latent shape ({h_new_lat}, {w_new_lat}) "
                f"is below the minimum limit of 8 blocks (64 pixels) on the short side due to "
                f"extreme aspect ratio {ar:.4f} and/or small reduced size {reduced_image_size}. "
                f"Please select a larger reduced_image_size."
            )

        # 5. Execute Hardware-Accelerated Interpolation via ComfyUI utilities
        upscaled_latent = comfy.utils.common_upscale(
            latent_tensor,
            w_new_lat,
            h_new_lat,
            upscale_method="bicubic",
            crop="center"
        )

        # Reconstruct output dictionary preserving metadata
        output_samples = samples.copy()
        output_samples["samples"] = upscaled_latent

        # 6. Recalculate true aspect ratio post-interpolation to prevent precision drift
        new_ar = w_new_lat / float(h_new_lat)

        # 7. Align target size constraints (using ceiling alignment as per PRD)
        aligned_target = math.ceil(target_size / f) * f

        if new_ar >= 1.0:
            calc_width = aligned_target
            calc_height = (round(aligned_target / new_ar) // f) * f
        else:
            calc_height = aligned_target
            calc_width = (round(aligned_target * new_ar) // f) * f

        # 8. Type validation / Channel depth checks
        warnings = []
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

        # Package UI metadata for frontend consumption
        ui_metadata = {
            "calc_width": [calc_width],
            "calc_height": [calc_height],
            "input_width": [w_lat * f],
            "input_height": [h_lat * f],
            "input_channels": [channels],
            "warnings": warnings,
            "model_family": [model_family]
        }

        return io.NodeOutput(output_samples, calc_width, calc_height, ui=ui_metadata)
