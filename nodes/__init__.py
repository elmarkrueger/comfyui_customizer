from .latent_scaling_calculator import DuffyLatentScalingCalculator
from .real_time_grading_processor import DuffyRealTimeGradingProcessor
from .theme_control_panel import DuffyThemeControlPanel

NODE_LIST = [
    DuffyThemeControlPanel,
    DuffyRealTimeGradingProcessor,
    DuffyLatentScalingCalculator,
]

