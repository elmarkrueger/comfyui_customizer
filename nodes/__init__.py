from .latent_scaling_calculator import DuffyLatentScalingCalculator
from .real_time_grading_processor import DuffyRealTimeGradingProcessor
from .sam3_morphological_refiner import SAM3_Morphological_Refiner_Duffy
from .theme_control_panel import DuffyThemeControlPanel

NODE_LIST = [
    DuffyThemeControlPanel,
    DuffyRealTimeGradingProcessor,
    DuffyLatentScalingCalculator,
    SAM3_Morphological_Refiner_Duffy,
]

