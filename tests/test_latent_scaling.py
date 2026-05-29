import sys
import os
import unittest
import torch

# Ensure ComfyUI and custom nodes paths are available
sys.path.insert(0, r"D:\Easy_Installer\ComfyUI-Easy-Install\ComfyUI")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nodes.latent_scaling_calculator import DuffyLatentScalingCalculator

class TestLatentScalingCalculator(unittest.TestCase):
    def test_prd_vectors(self):
        # The 5 test cases from the PRD
        test_cases = [
            {
                "name": "Row 1: Square, Flux 1 (f=8)",
                "shape": (1, 16, 128, 128),
                "reduced_size": 2048,
                "target_size": 4096,
                "model_family": "Flux 1",
                "expected_shape": (1, 16, 256, 256),
                "expected_w": 4096,
                "expected_h": 4096,
                "expected_warnings": []
            },
            {
                "name": "Row 2: Portrait/Landscape, SD3 (f=8)",
                "shape": (1, 16, 96, 144),
                "reduced_size": 1536,
                "target_size": 2048,
                "model_family": "SD3",
                "expected_shape": (1, 16, 128, 192),
                "expected_w": 2048,
                "expected_h": 1360,
                "expected_warnings": []
            },
            {
                "name": "Row 3: Landscape, Flux 2 (f=6)",
                "shape": (1, 32, 100, 150),
                "reduced_size": 1200,
                "target_size": 2400,
                "model_family": "Flux 2",
                "expected_shape": (1, 32, 133, 200),
                "expected_w": 2400,
                "expected_h": 1596,
                "expected_warnings": []
            },
            {
                "name": "Row 4: Square, Flux 1 (f=8), 4 channels (warning)",
                "shape": (1, 4, 100, 100),
                "reduced_size": 512,
                "target_size": 1024,
                "model_family": "Flux 1",
                "expected_shape": (1, 4, 64, 64),
                "expected_w": 1024,
                "expected_h": 1024,
                "expected_warnings": [
                    "Channel Depth Mismatch: Detected 4-channel latent (SD1.5/SDXL), but model family is 'Flux 1' (expects 16 or 32 channels). Downstream models may fail."
                ]
            },
            {
                "name": "Row 5: Landscape (2:1), Flux 2 (f=6)",
                "shape": (1, 16, 64, 128),
                "reduced_size": 1024,
                "target_size": 8192,
                "model_family": "Flux 2",
                "expected_shape": (1, 16, 85, 170),
                "expected_w": 8196,
                "expected_h": 4098,
                "expected_warnings": [
                    "Channel Depth Mismatch: Detected 16-channel latent (Flux 1/SD3), but model family is 'Flux 2' (expects 32 channels)."
                ]
            }
        ]

        for tc in test_cases:
            with self.subTest(name=tc["name"]):
                # Construct mock input latent dict
                dummy_latent = torch.zeros(tc["shape"], dtype=torch.float32)
                samples = {"samples": dummy_latent}

                # Execute node scaling calculation
                res = DuffyLatentScalingCalculator.execute(
                    samples=samples,
                    vae=None,
                    reduced_image_size=tc["reduced_size"],
                    target_size=tc["target_size"],
                    model_family=tc["model_family"]
                )

                # Unpack results
                output_latent_dict = res.args[0]
                calc_width = res.args[1]
                calc_height = res.args[2]
                ui_metadata = res.ui

                # Assert shape and dimensions
                output_tensor = output_latent_dict["samples"]
                self.assertEqual(output_tensor.shape, tc["expected_shape"])
                self.assertEqual(calc_width, tc["expected_w"])
                self.assertEqual(calc_height, tc["expected_h"])

                # Assert warning list matches exactly
                self.assertEqual(ui_metadata["warnings"], tc["expected_warnings"])

    def test_subpixel_collapse_error(self):
        # Test that extreme aspect ratios collapse raising a ValueError
        dummy_latent = torch.zeros((1, 16, 16, 256), dtype=torch.float32) # 16:1 aspect ratio
        samples = {"samples": dummy_latent}

        with self.assertRaises(ValueError) as context:
            DuffyLatentScalingCalculator.execute(
                samples=samples,
                vae=None,
                reduced_image_size=64, # Small size collapses height
                target_size=1024,
                model_family="Flux 1"
            )

        self.assertIn("Dimensional collapse", str(context.exception))

if __name__ == "__main__":
    unittest.main()
