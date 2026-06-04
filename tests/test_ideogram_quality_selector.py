import os
import sys
import unittest

# Ensure ComfyUI and custom nodes paths are available
sys.path.insert(0, r"D:\Easy_Installer\ComfyUI-Easy-Install\ComfyUI")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nodes.ideogram_quality_selector import DuffyIdeogramQualitySelector


class TestIdeogramQualitySelector(unittest.TestCase):
    def test_apply_preset_quality(self):
        num_steps, mu, std = DuffyIdeogramQualitySelector.apply_preset("Quality")
        self.assertEqual(num_steps, 48)
        self.assertEqual(mu, 0.0)
        self.assertEqual(std, 1.5)

    def test_apply_preset_default(self):
        num_steps, mu, std = DuffyIdeogramQualitySelector.apply_preset("Default")
        self.assertEqual(num_steps, 20)
        self.assertEqual(mu, 0.0)
        self.assertEqual(std, 1.8)

    def test_apply_preset_turbo(self):
        num_steps, mu, std = DuffyIdeogramQualitySelector.apply_preset("Turbo")
        self.assertEqual(num_steps, 12)
        self.assertEqual(mu, 0.5)
        self.assertEqual(std, 1.8)

    def test_apply_preset_invalid(self):
        with self.assertRaises(ValueError):
            DuffyIdeogramQualitySelector.apply_preset("Ultra")

    def test_execute_quality(self):
        result = DuffyIdeogramQualitySelector.execute("Quality")
        self.assertEqual(result.args[0], 48)
        self.assertEqual(result.args[1], 0.0)
        self.assertEqual(result.args[2], 1.5)

    def test_execute_default(self):
        result = DuffyIdeogramQualitySelector.execute("Default")
        self.assertEqual(result.args[0], 20)
        self.assertEqual(result.args[1], 0.0)
        self.assertEqual(result.args[2], 1.8)

    def test_execute_turbo(self):
        result = DuffyIdeogramQualitySelector.execute("Turbo")
        self.assertEqual(result.args[0], 12)
        self.assertEqual(result.args[1], 0.5)
        self.assertEqual(result.args[2], 1.8)

    def test_validate_inputs(self):
        self.assertTrue(DuffyIdeogramQualitySelector.validate_inputs("Quality"))
        self.assertTrue(DuffyIdeogramQualitySelector.validate_inputs("Default"))
        self.assertTrue(DuffyIdeogramQualitySelector.validate_inputs("Turbo"))
        self.assertNotEqual(DuffyIdeogramQualitySelector.validate_inputs("Ultra"), True)


if __name__ == "__main__":
    unittest.main()
