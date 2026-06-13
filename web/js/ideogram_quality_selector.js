import { app } from "../../../scripts/app.js";
app.registerExtension({
  name: "Duffy.IdeogramQualitySelector.Extension",
  async nodeCreated(node) {
    if (node.comfyClass !== "Duffy_IdeogramQualitySelector") {
      return;
    }
    const updateOutputLabels = () => {
      const presetWidget2 = node.widgets?.find((w) => w.name === "preset");
      const presetVal = presetWidget2 ? presetWidget2.value : "Default";
      let num_steps = 20;
      let mu = 0;
      let std = 1.8;
      if (presetVal === "Quality") {
        num_steps = 48;
        mu = 0;
        std = 1.5;
      } else if (presetVal === "Default") {
        num_steps = 20;
        mu = 0;
        std = 1.8;
      } else if (presetVal === "Turbo") {
        num_steps = 12;
        mu = 0.5;
        std = 1.8;
      }
      const stepsOutput = node.outputs?.find((o) => o.name === "num_steps");
      if (stepsOutput) {
        stepsOutput.label = `num_steps: ${num_steps}`;
      }
      const muOutput = node.outputs?.find((o) => o.name === "mu");
      if (muOutput) {
        muOutput.label = `mu: ${mu.toFixed(1)}`;
      }
      const stdOutput = node.outputs?.find((o) => o.name === "std");
      if (stdOutput) {
        stdOutput.label = `std: ${std.toFixed(1)}`;
      }
      node.setDirtyCanvas?.(true, true);
    };
    const presetWidget = node.widgets?.find((w) => w.name === "preset");
    if (presetWidget) {
      const originalCallback = presetWidget.callback;
      presetWidget.callback = function(value) {
        const res = originalCallback ? originalCallback.apply(this, arguments) : void 0;
        updateOutputLabels();
        return res;
      };
    }
    const originalConfigure = node.configure;
    node.configure = function(info) {
      const result = originalConfigure?.call(this, info);
      updateOutputLabels();
      return result;
    };
    setTimeout(() => {
      updateOutputLabels();
    }, 1);
  }
});
