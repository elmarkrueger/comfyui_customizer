# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Added Duffy_LatentScalingCalculator backend node in category Duffy/Latent for dynamic aspect-ratio-locked latent scaling.
- Added Vue-powered interactive control panel for reduced size, target size, model family selection, and live preview telemetry.
- Added calculated dimension outputs (calc_width, calc_height) and frontend warning surfaces for channel-depth/model-family mismatches.
- Added Exposure/Contrast/Saturation grading controls to Duffy_RealTimeGradingProcessor backend and Vue/WebGL preview.
- Added Lift/Gamma/Gain grading controls to Duffy_RealTimeGradingProcessor backend and Vue/WebGL preview.
- Added Bloom controls (intensity, threshold, radius) with high-resolution backend processing and live preview support.

### Fixed

- Fixed reduced_image_size-mismatch softening in Duffy_LatentScalingCalculator by applying quality-first pixel-space resizing for both upscale and downscale paths, with explicit latent fallback diagnostics.
- Fixed gradient map stop dragging so stop markers correctly stop moving on left mouse release.
- Improved gradient-stop drag listener cleanup on blur/unmount to prevent stuck drag state.
