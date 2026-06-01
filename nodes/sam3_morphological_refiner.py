import gc
import json

import comfy.model_management
import comfy.utils
import numpy as np
import scipy.ndimage
import torch
import torch.nn.functional as F
from comfy_api.latest import io

try:
    from comfy_extras.nodes_sam3 import _extract_text_prompts, _refine_mask
except ImportError:
    # Dynamic import helper in case pathing differs
    import os
    import sys
    comfy_path = os.path.dirname(os.path.dirname(os.path.abspath(comfy.__file__)))
    if comfy_path not in sys.path:
        sys.path.append(comfy_path)
    from comfy_extras.nodes_sam3 import _extract_text_prompts, _refine_mask


class SAM3_Morphological_Refiner_Duffy(io.ComfyNode):
    """
    Unified Segment Anything 3 (SAM 3.1) Custom Node with GPU-Accelerated Morphological and Spatial Blur Refinement.
    """

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="Duffy_SAM3MorphologicalRefiner",
            display_name="SAM3 Morphological Refiner",
            category="Duffy/Segmentation",
            description=(
                "Unified Segment Anything 3.1 node that automatically executes semantic detection "
                "and applies high-performance GPU-native mask dilation, erosion, and Gaussian blurring."
            ),
            inputs=[
                io.Model.Input("model", tooltip="SAM 3.1 model checkpoint used for inference."),
                io.Image.Input("image", tooltip="Source image tensor to segment."),
                io.Conditioning.Input(
                    "conditioning",
                    optional=True,
                    tooltip="Text query embeddings (e.g. from CLIPTextEncode) for target detection."
                ),
                io.BoundingBox.Input(
                    "bboxes",
                    force_input=True,
                    optional=True,
                    tooltip="Bounding boxes to restrict segmentation targeting."
                ),
                io.String.Input(
                    "positive_coords",
                    force_input=True,
                    optional=True,
                    tooltip="Positive point prompts as JSON list of coordinates inside square brackets, e.g. [('x': 100, 'y': 200)] using single quotes instead of curly braces."
                ),
                io.String.Input(
                    "negative_coords",
                    force_input=True,
                    optional=True,
                    tooltip="Negative point prompts as JSON list of coordinates inside square brackets, e.g. [('x': 100, 'y': 200)] using single quotes instead of curly braces."
                ),
                io.Float.Input(
                    "threshold",
                    default=0.40,
                    min=0.0,
                    max=1.0,
                    step=0.01,
                    tooltip="Confidence threshold cutoff for open-vocabulary text detection."
                ),
                io.Int.Input(
                    "refine_iterations",
                    default=1,
                    min=0,
                    max=5,
                    tooltip="Number of SAM decoder refinement passes."
                ),
                io.Int.Input(
                    "expand",
                    default=8,
                    min=-4096,
                    max=4096,
                    step=1,
                    tooltip="Morphological expansion pixels. Positive values dilate; negative values erode."
                ),
                io.Float.Input(
                    "incremental_expandrate",
                    default=0.0,
                    min=0.0,
                    max=100.0,
                    step=0.1,
                    tooltip="Additive delta growth applied sequentially across frames in video batches."
                ),
                io.Float.Input(
                    "blur_radius",
                    default=0.5,
                    min=0.0,
                    max=100.0,
                    step=0.1,
                    tooltip="Gaussian blur standard deviation for softening edge gradients."
                ),
                io.Float.Input(
                    "lerp_alpha",
                    default=1.0,
                    min=0.0,
                    max=1.0,
                    step=0.01,
                    tooltip="Interpolation blending factor between consecutive frames to reduce flickering."
                ),
                io.Float.Input(
                    "decay_factor",
                    default=1.0,
                    min=0.0,
                    max=1.0,
                    step=0.01,
                    tooltip="Decay factor for historical mask accumulation."
                ),
                io.Boolean.Input(
                    "tapered_corners",
                    default=True,
                    tooltip="Use a cross-shaped structuring element when True, or a dense square block when False."
                ),
                io.Boolean.Input(
                    "flip_input",
                    default=False,
                    tooltip="Invert the mask values globally prior to processing."
                ),
                io.Boolean.Input(
                    "fill_holes",
                    default=False,
                    tooltip="Slow CPU-bound morphological hole filling fallback."
                ),
                io.Boolean.Input(
                    "individual_masks",
                    default=False,
                    tooltip="Prevent OR-reducing multiple detected objects into a singular union matte."
                ),
            ],
            outputs=[
                io.Mask.Output("mask", tooltip="The refined and soft-edged output mask tensor."),
                io.Mask.Output("mask_inverted", tooltip="The mathematically inverted refined mask (1.0 - mask)."),
                io.BoundingBox.Output("bboxes", tooltip="Bounding boxes generated during the SAM 3.1 inference pass."),
            ],
        )

    @classmethod
    def execute(
        cls,
        model,
        image,
        conditioning=None,
        bboxes=None,
        positive_coords=None,
        negative_coords=None,
        threshold=0.40,
        refine_iterations=1,
        expand=8,
        incremental_expandrate=0.0,
        blur_radius=0.5,
        lerp_alpha=1.0,
        decay_factor=1.0,
        tapered_corners=True,
        flip_input=False,
        fill_holes=False,
        individual_masks=False,
    ) -> io.NodeOutput:
        B, H, W, C = image.shape

        # Parse coordinate points
        pos_pts = json.loads(positive_coords) if positive_coords else []
        neg_pts = json.loads(negative_coords) if negative_coords else []
        has_points = len(pos_pts) > 0 or len(neg_pts) > 0

        has_text = conditioning is not None and len(conditioning) > 0
        has_boxes = bboxes is not None

        # Check if we should completely bypass SAM 3.1 semantic inference due to null target specifications
        if not has_text and not has_boxes and not has_points:
            # Null input handler: allocate an empty float tensor on the intermediate device
            idev = comfy.model_management.intermediate_device()
            mask_out = torch.zeros((B, H, W), dtype=torch.float32, device=idev)
            all_bbox_dicts = [[] for _ in range(B)]
        else:
            # Execute standard SAM 3.1 semantic inference
            image_in = comfy.utils.common_upscale(
                image[..., :3].movedim(-1, 1), 1008, 1008, "bilinear", crop="disabled"
            )

            # Convert bounding boxes to normalized cxcywh format
            def _boxes_to_tensor(box_list):
                coords = []
                for d in box_list:
                    cx = (d["x"] + d["width"] / 2) / W
                    cy = (d["y"] + d["height"] / 2) / H
                    coords.append([cx, cy, d["width"] / W, d["height"] / H])
                return torch.tensor([coords], dtype=torch.float32)

            per_frame_boxes = None
            if bboxes is not None:
                if isinstance(bboxes, dict):
                    shared = _boxes_to_tensor([bboxes])
                    per_frame_boxes = [shared] * B
                elif isinstance(bboxes, list) and len(bboxes) > 0 and isinstance(bboxes[0], list):
                    per_frame_boxes = [_boxes_to_tensor(frame_boxes) if frame_boxes else None for frame_boxes in bboxes]
                    while len(per_frame_boxes) < B:
                        per_frame_boxes.append(per_frame_boxes[-1] if per_frame_boxes else None)
                elif isinstance(bboxes, list) and len(bboxes) > 0:
                    shared = _boxes_to_tensor(bboxes)
                    per_frame_boxes = [shared] * B

            comfy.model_management.load_model_gpu(model)
            device = comfy.model_management.get_torch_device()
            dtype = model.model.get_dtype()
            sam3_model = model.model.diffusion_model

            # Build point inputs
            point_inputs = None
            if has_points:
                all_coords = [[p["x"] / W * 1008, p["y"] / H * 1008] for p in pos_pts] + \
                             [[p["x"] / W * 1008, p["y"] / H * 1008] for p in neg_pts]
                all_labels = [1] * len(pos_pts) + [0] * len(neg_pts)
                point_inputs = {
                    "point_coords": torch.tensor([all_coords], dtype=dtype, device=device),
                    "point_labels": torch.tensor([all_labels], dtype=torch.int32, device=device),
                }

            cond_list = _extract_text_prompts(conditioning, device, dtype) if has_text else []

            all_bbox_dicts = []
            all_masks = []
            pbar = comfy.utils.ProgressBar(B)

            for b in range(B):
                frame = image_in[b:b+1].to(device=device, dtype=dtype)
                b_boxes = None
                if per_frame_boxes is not None and per_frame_boxes[b] is not None:
                    b_boxes = per_frame_boxes[b].to(device=device, dtype=dtype)

                frame_bbox_dicts = []
                frame_masks = []

                if point_inputs is not None:
                    mask_logit = sam3_model.forward_segment(frame, point_inputs=point_inputs)
                    for _ in range(max(0, refine_iterations - 1)):
                        mask_logit = sam3_model.forward_segment(frame, mask_inputs=mask_logit)
                    mask_t = F.interpolate(mask_logit, size=(H, W), mode="bilinear", align_corners=False)
                    frame_masks.append((mask_t[0] > 0).float())

                if b_boxes is not None and not has_text:
                    for box_cxcywh in b_boxes[0]:
                        cx, cy, bw, bh = box_cxcywh.tolist()
                        sam_box = torch.tensor([[[(cx - bw/2) * 1008, (cy - bh/2) * 1008],
                                                 [(cx + bw/2) * 1008, (cy + bh/2) * 1008]]],
                                               device=device, dtype=dtype)
                        mask_logit = sam3_model.forward_segment(frame, box_inputs=sam_box)
                        for _ in range(max(0, refine_iterations - 1)):
                            mask_logit = sam3_model.forward_segment(frame, mask_inputs=mask_logit)
                        mask_t = F.interpolate(mask_logit, size=(H, W), mode="bilinear", align_corners=False)
                        frame_masks.append((mask_t[0] > 0).float())

                for text_embeddings, text_mask, max_det in cond_list:
                    results = sam3_model(
                        frame, text_embeddings=text_embeddings, text_mask=text_mask,
                        boxes=b_boxes, threshold=threshold, orig_size=(H, W)
                    )
                    pred_boxes = results["boxes"][0]
                    scores = results["scores"][0]
                    masks_pred = results["masks"][0]

                    probs = scores.sigmoid()
                    keep = probs > threshold
                    kept_boxes = pred_boxes[keep].cpu()
                    kept_scores = probs[keep].cpu()
                    kept_masks = masks_pred[keep]

                    order = kept_scores.argsort(descending=True)[:max_det]
                    kept_boxes = kept_boxes[order]
                    kept_scores = kept_scores[order]
                    kept_masks = kept_masks[order]

                    for box, score in zip(kept_boxes, kept_scores):
                        frame_bbox_dicts.append({
                            "x": float(box[0]), "y": float(box[1]),
                            "width": float(box[2] - box[0]), "height": float(box[3] - box[1]),
                            "score": float(score),
                        })
                    for m_slice, box in zip(kept_masks, kept_boxes):
                        frame_masks.append(_refine_mask(
                            sam3_model, image[b], m_slice, box, H, W, device, dtype, refine_iterations
                        ))

                all_bbox_dicts.append(frame_bbox_dicts)
                if len(frame_masks) > 0:
                    combined = torch.cat(frame_masks, dim=0)
                    if individual_masks:
                        all_masks.append(combined)
                    else:
                        all_masks.append((combined > 0).any(dim=0).float())
                else:
                    if individual_masks:
                        all_masks.append(torch.zeros(0, H, W, device=comfy.model_management.intermediate_device()))
                    else:
                        all_masks.append(torch.zeros(H, W, device=comfy.model_management.intermediate_device()))
                pbar.update(1)

            idev = comfy.model_management.intermediate_device()
            all_masks = [m.to(idev) for m in all_masks]
            mask_out = torch.cat(all_masks, dim=0) if individual_masks else torch.stack(all_masks)

        # Zero-state computational short-circuit check
        is_zero_refinement = (
            expand == 0 and
            incremental_expandrate == 0.0 and
            blur_radius == 0.0 and
            not fill_holes and
            not flip_input and
            lerp_alpha == 1.0 and
            decay_factor == 1.0
        )

        if is_zero_refinement:
            # Shortcut bypass of spatial filtering routines
            mask_out = torch.clamp(mask_out, min=0.0, max=1.0)
            mask_inverted = 1.0 - mask_out
            return io.NodeOutput(mask_out, mask_inverted, all_bbox_dicts)

        # Apply global flipping prior to morphology
        if flip_input:
            mask_out = 1.0 - mask_out

        # Prepare for morphology
        import kornia.morphology as morph
        device = mask_out.device
        dtype = mask_out.dtype

        if mask_out.ndim == 2:
            mask_out = mask_out.unsqueeze(0)

        out = []
        previous_output = None
        current_expand = float(expand)

        for m_slice in mask_out:
            output = m_slice.unsqueeze(0).unsqueeze(0) # [1, 1, H, W]

            iterations = abs(round(current_expand))
            if iterations > 0 and output.max() > 0:
                if tapered_corners:
                    kernel = torch.tensor([[0, 1, 0],
                                           [1, 1, 1],
                                           [0, 1, 0]], dtype=torch.float32, device=device)
                else:
                    kernel = torch.tensor([[1, 1, 1],
                                           [1, 1, 1],
                                           [1, 1, 1]], dtype=torch.float32, device=device)

                for _ in range(iterations):
                    if current_expand < 0:
                        output = morph.erosion(output, kernel)
                    else:
                        output = morph.dilation(output, kernel)

            output = output.squeeze(0).squeeze(0) # [H, W]

            if current_expand < 0:
                current_expand -= abs(incremental_expandrate)
            else:
                current_expand += abs(incremental_expandrate)

            if fill_holes:
                binary_mask = output > 0
                output_np = binary_mask.cpu().numpy()
                filled = scipy.ndimage.binary_fill_holes(output_np)
                output = torch.from_numpy(filled.astype(np.float32)).to(device=device, dtype=dtype)

            if lerp_alpha < 1.0 and previous_output is not None:
                output = lerp_alpha * output + (1.0 - lerp_alpha) * previous_output

            if decay_factor < 1.0 and previous_output is not None:
                output = output + decay_factor * previous_output
                omax = output.max()
                if omax > 0:
                    output = output / omax

            previous_output = output
            out.append(output)

        mask_out = torch.stack(out, dim=0)

        # GPU-native spatial blurring using torchvision
        if blur_radius > 0.0:
            sigma = blur_radius
            kernel_size = 2 * int(1.5 * sigma) + 1
            kernel_size = max(3, kernel_size)

            import torchvision.transforms.functional as TF_func
            mask_out_4d = mask_out.unsqueeze(1).to(dtype=torch.float32)
            blurred_4d = TF_func.gaussian_blur(mask_out_4d, kernel_size=[kernel_size, kernel_size], sigma=[sigma, sigma])
            mask_out = blurred_4d.squeeze(1)

        # Absolute value bounding and quantization overflow protection
        mask_out = torch.clamp(mask_out, min=0.0, max=1.0)
        mask_inverted = 1.0 - mask_out

        # Aggressive memory deallocation
        try:
            del out, previous_output, current_expand
            if 'image_in' in locals():
                del image_in
            if 'frame' in locals():
                del frame
            if 'mask_logit' in locals():
                del mask_logit
        except NameError:
            pass

        gc.collect()

        return io.NodeOutput(mask_out, mask_inverted, all_bbox_dicts)
