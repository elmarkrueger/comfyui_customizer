import os
import sys
import unittest
import json
import torch

# Ensure ComfyUI and custom nodes paths are available
sys.path.insert(0, r"D:\Easy_Installer\ComfyUI-Easy-Install\ComfyUI")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nodes.real_time_grading_processor import DuffyRealTimeGradingProcessor


class TestRealTimeGradingProcessor(unittest.TestCase):
    def setUp(self):
        # Create a basic input image tensor of shape [B, H, W, C] -> [1, 64, 64, 3]
        # Make it half gray (0.5) and half white (1.0) so we have bright pixels for bloom
        self.image = torch.ones((1, 64, 64, 3), dtype=torch.float32) * 0.5
        self.image[:, 16:48, 16:48, :] = 1.0  # Bright center square

    def test_bloom_applied_with_gradient_map_disabled(self):
        # 1. First run: Bloom intensity is 0
        params_no_bloom = {
            "bloom": {
                "intensity": 0.0,
                "threshold": 0.5,
                "radius": 2.0
            },
            "gradient_map": {
                "enabled": False,
                "stops": []
            }
        }
        
        result_no_bloom = DuffyRealTimeGradingProcessor.execute(
            image=self.image.clone(),
            shader_params=json.dumps(params_no_bloom)
        )
        out_no_bloom = result_no_bloom.args[0]

        # 2. Second run: Bloom intensity is 1.5, gradient map still disabled
        params_with_bloom = {
            "bloom": {
                "intensity": 1.5,
                "threshold": 0.5,
                "radius": 2.0
            },
            "gradient_map": {
                "enabled": False,
                "stops": []
            }
        }

        result_with_bloom = DuffyRealTimeGradingProcessor.execute(
            image=self.image.clone(),
            shader_params=json.dumps(params_with_bloom)
        )
        out_with_bloom = result_with_bloom.args[0]

        # Check that they are different
        diff = torch.abs(out_with_bloom - out_no_bloom).sum().item()
        self.assertGreater(diff, 1e-3, "Bloom should modify the output image even when gradient map is disabled")

        # Also check that with bloom, the image has higher values around the bright region (bloom bleed)
        # For instance, outside the bright 16:48 center, the gray region should be brighter than 0.5
        # The pixel at [0, 10, 10, 0] should be brighter than the quantized base value
        self.assertGreater(out_with_bloom[0, 10, 10, 0].item(), out_no_bloom[0, 10, 10, 0].item())

    def test_bloom_no_effect_when_intensity_zero(self):
        params_zero_bloom = {
            "bloom": {
                "intensity": 0.0,
                "threshold": 0.5,
                "radius": 2.0
            },
            "gradient_map": {
                "enabled": False,
                "stops": []
            }
        }

        result_zero = DuffyRealTimeGradingProcessor.execute(
            image=self.image.clone(),
            shader_params=json.dumps(params_zero_bloom)
        )
        out_zero = result_zero.args[0]
        
        # Compare with another run where bloom key is completely omitted (meaning intensity defaults to 0)
        params_omitted = {
            "gradient_map": {
                "enabled": False,
                "stops": []
            }
        }
        
        result_omitted = DuffyRealTimeGradingProcessor.execute(
            image=self.image.clone(),
            shader_params=json.dumps(params_omitted)
        )
        out_omitted = result_omitted.args[0]
        
        diff = torch.abs(out_zero - out_omitted).sum().item()
        self.assertAlmostEqual(diff, 0.0, places=5)


if __name__ == "__main__":
    unittest.main()
