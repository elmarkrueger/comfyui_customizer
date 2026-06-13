from .ideogram_quality_selector import DuffyIdeogramQualitySelector
from .latent_scaling_calculator import DuffyLatentScalingCalculator
from .real_time_grading_processor import DuffyRealTimeGradingProcessor
from .sam3_morphological_refiner import SAM3_Morphological_Refiner_Duffy
from .theme_control_panel import DuffyThemeControlPanel
from .intelligent_block_swap_v2 import IntelligentBlockSwapV2

NODE_LIST = [
    DuffyThemeControlPanel,
    DuffyRealTimeGradingProcessor,
    DuffyLatentScalingCalculator,
    SAM3_Morphological_Refiner_Duffy,
    DuffyIdeogramQualitySelector,
    IntelligentBlockSwapV2,
]


