import os
import sys
import unittest

import torch

# Ensure ComfyUI and custom nodes paths are available
sys.path.insert(0, r"D:\Easy_Installer\ComfyUI-Easy-Install\ComfyUI")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nodes.latent_scaling_calculator import DuffyLatentScalingCalculator


class MockVAE:
    def __init__(self, ratio):
        self.downscale_ratio = ratio
        self.upscale_ratio = ratio


class MockVAEWithCodec(MockVAE):
    def __init__(self, ratio, latent_channels=32):
        super().__init__(ratio)
        self.latent_channels = latent_channels

    def decode(self, latent_tensor):
        image_bchw = torch.nn.functional.interpolate(
            latent_tensor[:, :3, :, :],
            scale_factor=float(self.downscale_ratio),
            mode="bilinear",
            align_corners=False,
        )
        return image_bchw.movedim(1, -1).clamp(0.0, 1.0)

    def encode(self, image_tensor):
        image_bchw = image_tensor.movedim(-1, 1)
        latent = torch.nn.functional.interpolate(
            image_bchw,
            scale_factor=1.0 / float(self.downscale_ratio),
            mode="bilinear",
            align_corners=False,
        )
        if latent.shape[1] < self.latent_channels:
            reps = (self.latent_channels + latent.shape[1] - 1) // latent.shape[1]
            latent = latent.repeat(1, reps, 1, 1)
        return latent[:, : self.latent_channels, :, :]


class TestLatentScalingCalculator(unittest.TestCase):
    def test_uses_vae_factor_as_authoritative_source(self):
        latent = torch.zeros((1, 32, 64, 128), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAE(8),
            reduced_image_size=1024,
            target_size=4096,
            model_family="Flux 2",  # Flux 2 default expectation is f=6
        )

        self.assertIsNone(result.block_execution)
        out_latent = result.args[0]["samples"]

        # f=8 from VAE must be applied, not Flux 2 map f=6
        self.assertEqual(out_latent.shape, (1, 32, 64, 128))
        self.assertEqual(result.ui["vae_factor"][0], 8)
        self.assertTrue(any("VAE/Model Factor Mismatch" in w for w in result.ui["warnings"]))

    def test_prd_rounding_alignment_for_flux2(self):
        latent = torch.zeros((1, 32, 64, 128), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAE(6),
            reduced_image_size=1024,
            target_size=4096,
            model_family="Flux 2",
        )

        self.assertIsNone(result.block_execution)
        out_latent = result.args[0]["samples"]

        # PRD round-to-nearest with f=6: 1024 -> 1026, so latent dims become 171x86
        self.assertEqual(out_latent.shape, (1, 32, 86, 171))
        # target 4096 aligns to 4098 under round-to-nearest and keeps aspect with f alignment
        self.assertEqual(result.args[1], 4098)
        self.assertEqual(result.args[2], 2058)

    def test_invalid_model_family_blocks_execution(self):
        latent = torch.zeros((1, 32, 64, 128), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAE(6),
            reduced_image_size=1024,
            target_size=4096,
            model_family="Flux2",
        )

        self.assertIsNotNone(result.block_execution)
        self.assertIn("Invalid model_family", result.block_execution)

    def test_5d_latent_is_rejected(self):
        latent = torch.zeros((1, 32, 4, 64, 128), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAE(6),
            reduced_image_size=1024,
            target_size=4096,
            model_family="Flux 2",
        )

        self.assertIsNotNone(result.block_execution)
        self.assertIn("Only 4D image latents", result.block_execution)

    def test_channel_warning_still_emitted(self):
        latent = torch.zeros((1, 16, 64, 128), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAE(6),
            reduced_image_size=1200,
            target_size=2400,
            model_family="Flux 2",
        )

        self.assertIsNone(result.block_execution)
        warnings = result.ui["warnings"]
        self.assertTrue(any("expects 32 channels" in warning for warning in warnings))

    def test_flux2_factor16_variant_does_not_emit_factor_mismatch(self):
        # Flux 2 Klein-like setup can report f=16 from VAE metadata.
        latent = torch.zeros((1, 32, 77, 51), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAE(16),
            reduced_image_size=1024,
            target_size=4096,
            model_family="Flux 2",
        )

        self.assertIsNone(result.block_execution)
        warnings = result.ui["warnings"]
        self.assertFalse(any("VAE/Model Factor Mismatch" in warning for warning in warnings))

    def test_flux2_factor16_prefers_pixel_space_resample_when_codec_available(self):
        latent = torch.zeros((1, 32, 77, 51), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAEWithCodec(16, latent_channels=32),
            reduced_image_size=1024,
            target_size=4096,
            model_family="Flux 2",
        )

        self.assertIsNone(result.block_execution)
        self.assertEqual(result.ui.get("resize_mode", [None])[0], "pixel")
        warnings = result.ui["warnings"]
        self.assertTrue(any("Quality Preservation Mode" in warning for warning in warnings))

    def test_flux1_downscale_prefers_pixel_space_resample_when_codec_available(self):
        # Procedure should be model-agnostic: Flux 1 downscales should use the same quality path.
        latent = torch.zeros((1, 16, 128, 96), dtype=torch.float32)
        samples = {"samples": latent}

        result = DuffyLatentScalingCalculator.execute(
            samples=samples,
            vae=MockVAEWithCodec(8, latent_channels=16),
            reduced_image_size=896,
            target_size=2048,
            model_family="Flux 1",
        )

        self.assertIsNone(result.block_execution)
        self.assertEqual(result.ui.get("resize_mode", [None])[0], "pixel")
        warnings = result.ui["warnings"]
        self.assertTrue(any("Quality Preservation Mode" in warning for warning in warnings))

    def test_subpixel_collapse_error(self):
        # Test that extreme aspect ratios collapse raising a ValueError
        dummy_latent = torch.zeros((1, 16, 16, 256), dtype=torch.float32)  # 16:1 aspect ratio
        samples = {"samples": dummy_latent}

        with self.assertRaises(ValueError) as context:
            DuffyLatentScalingCalculator.execute(
                samples=samples,
                vae=MockVAE(8),
                reduced_image_size=64,  # Small size collapses height
                target_size=1024,
                model_family="Flux 1"
            )

        self.assertIn("Dimensional collapse", str(context.exception))

if __name__ == "__main__":
    unittest.main()
