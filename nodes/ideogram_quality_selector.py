from comfy_api.latest import io


class DuffyIdeogramQualitySelector(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="Duffy_IdeogramQualitySelector",
            display_name="Ideogram Quality Preset Selector",
            category="Duffy/Preset",
            description=(
                "Consolidates the legacy JSON-parsing parameter presets for Ideogram continuous-time "
                "sampling schedules. Automatically shifts step counts and logit-normal weighting parameters (mu, std) "
                "based on Quality, Default, or Turbo semantic presets."
            ),
            inputs=[
                io.Combo.Input(
                    "preset",
                    options=["Quality", "Default", "Turbo"],
                    default="Default",
                    tooltip="Select the semantic generation preset for the Ideogram pipeline.",
                ),
            ],
            outputs=[
                io.Int.Output("num_steps", tooltip="Total number of iterative sampling solver steps."),
                io.Float.Output("mu", tooltip="Shifted logit-normal probability weighting mean (mu)."),
                io.Float.Output("std", tooltip="Shifted logit-normal probability weighting standard deviation (std)."),
            ],
        )

    @classmethod
    def validate_inputs(cls, preset: str, **kwargs) -> bool | str:
        del kwargs
        if preset not in ["Quality", "Default", "Turbo"]:
            return f"Invalid preset selection: '{preset}'. Expected 'Quality', 'Default', or 'Turbo'."
        return True

    @classmethod
    def apply_preset(cls, preset: str) -> tuple[int, float, float]:
        if preset == "Quality":
            num_steps = 48
            mu = 0.0
            std = 1.5
        elif preset == "Default":
            num_steps = 20
            mu = 0.0
            std = 1.8  # Mathematically rounded from 1.75 to adhere to single decimal constraint
        elif preset == "Turbo":
            num_steps = 12
            mu = 0.5
            std = 1.8  # Mathematically rounded from 1.75 to adhere to single decimal constraint
        else:
            raise ValueError(f"Invalid preset selection: '{preset}'. Expected 'Quality', 'Default', or 'Turbo'.")

        return num_steps, round(mu, 1), round(std, 1)

    @classmethod
    def execute(cls, preset: str, **kwargs) -> io.NodeOutput:
        del kwargs
        num_steps, mu, std = cls.apply_preset(preset)
        return io.NodeOutput(num_steps, mu, std)
