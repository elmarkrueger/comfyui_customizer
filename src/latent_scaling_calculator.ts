import { api as comfyApi } from "COMFY_API";
import { app as comfyApp } from "COMFY_APP";
import { createApp } from "vue";
import LatentScalingCalculator from "./components/LatentScalingCalculator.vue";

const MIN_W = 420;
const MIN_H = 360;

function isolateContainerEvents(container: HTMLDivElement): void {
  const stopPropagation = (event: Event) => {
    event.stopPropagation();
  };

  container.addEventListener("pointerdown", stopPropagation);
  container.addEventListener("pointerup", stopPropagation);
  container.addEventListener("mousedown", stopPropagation);
  container.addEventListener("mouseup", stopPropagation);
  container.addEventListener("touchstart", stopPropagation);
  container.addEventListener("touchend", stopPropagation);
  container.addEventListener("click", stopPropagation);
  container.addEventListener("wheel", stopPropagation);
  container.addEventListener("dblclick", stopPropagation);
  container.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
}

function notifyGraphChanged(node: any): void {
  node?.setDirtyCanvas?.(true, true);
  node?.graph?.setDirtyCanvas?.(true, true);
  node?.graph?.setDirty?.(true, true);
  node?.graph?.change?.();
}

comfyApp.registerExtension({
  name: "Duffy.LatentScalingCalculator.Vue",

  async nodeCreated(node: any) {
    if (node.comfyClass !== "Duffy_LatentScalingCalculator") {
      return;
    }

    // Find and hide the standard inputs
    const sizeWidget = node.widgets?.find((w: any) => w.name === "reduced_image_size");
    if (sizeWidget) {
      sizeWidget.type = "hidden";
      sizeWidget.hidden = true;
      sizeWidget.disabled = true;
      sizeWidget.computeSize = () => [0, -4];
    }

    const targetWidget = node.widgets?.find((w: any) => w.name === "target_size");
    if (targetWidget) {
      targetWidget.type = "hidden";
      targetWidget.hidden = true;
      targetWidget.disabled = true;
      targetWidget.computeSize = () => [0, -4];
    }

    const familyWidget = node.widgets?.find((w: any) => w.name === "model_family");
    if (familyWidget) {
      familyWidget.type = "hidden";
      familyWidget.hidden = true;
      familyWidget.disabled = true;
      familyWidget.computeSize = () => [0, -4];
    }

    // Create Vue mount container
    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);

    const initialReduced = typeof sizeWidget?.value === "number" ? sizeWidget.value : 1024;
    const initialTarget = typeof targetWidget?.value === "number" ? targetWidget.value : 4096;
    const initialFamily = typeof familyWidget?.value === "string" ? familyWidget.value : "Flux 1";

    // Initialize and mount Vue application
    const vueApp = createApp(LatentScalingCalculator, {
      initialReducedSize: initialReduced,
      initialTargetSize: initialTarget,
      initialModelFamily: initialFamily,
      nodeId: node.id,
      onReducedSizeChange: (val: number) => {
        if (sizeWidget) sizeWidget.value = val;
        notifyGraphChanged(node);
      },
      onTargetSizeChange: (val: number) => {
        if (targetWidget) targetWidget.value = val;
        notifyGraphChanged(node);
      },
      onModelFamilyChange: (val: string) => {
        if (familyWidget) familyWidget.value = val;
        notifyGraphChanged(node);
      },
      onResize: (height: number) => {
        const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
        node.setSize([currentWidth, Math.max(MIN_H, height)]);
        notifyGraphChanged(node);
      }
    });

    const instance = vueApp.mount(container) as any;

    // Add DOM widget
    const domWidget = node.addDOMWidget("latent_calculator_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];

    // Hydration helper
    const hydrateFromWidgets = () => {
      instance.hydrateState?.({
        reducedSize: sizeWidget?.value,
        targetSize: targetWidget?.value,
        modelFamily: familyWidget?.value
      });
    };

    const applyExecutionPayload = (rawPayload: any) => {
      if (!rawPayload || typeof rawPayload !== "object") {
        return;
      }

      const payload = rawPayload.output && typeof rawPayload.output === "object"
        ? rawPayload.output
        : rawPayload;

      const uiPayload = payload.ui && typeof payload.ui === "object"
        ? payload.ui
        : payload;

      instance.setTelemetry?.({
        calcWidth: uiPayload.calc_width?.[0],
        calcHeight: uiPayload.calc_height?.[0],
        inputWidth: uiPayload.input_width?.[0],
        inputHeight: uiPayload.input_height?.[0],
        inputChannels: uiPayload.input_channels?.[0],
        vaeFactor: uiPayload.vae_factor?.[0],
        factorSource: uiPayload.factor_source?.[0],
        resizeMode: uiPayload.resize_mode?.[0],
        warnings: uiPayload.warnings || [],
        executedModelFamily: uiPayload.model_family?.[0]
      });
    };

    const onExecuted = (event: any) => {
      const { node: execNodeId, output } = event.detail || {};
      if (String(execNodeId) === String(node.id)) {
        applyExecutionPayload(output);
      }
    };

    comfyApi.addEventListener("executed", onExecuted);

    // Node loading configuration hook
    const originalConfigure = node.configure;
    node.configure = function configureNode(info: any) {
      const result = originalConfigure?.call(this, info);
      hydrateFromWidgets();
      return result;
    };

    // Callbacks on standard widget updates
    const originalSizeWidgetCallback = sizeWidget?.callback;
    const originalTargetWidgetCallback = targetWidget?.callback;
    const originalFamilyWidgetCallback = familyWidget?.callback;

    if (sizeWidget) {
      sizeWidget.callback = function() {
        hydrateFromWidgets();
        originalSizeWidgetCallback?.apply(this, arguments as any);
      };
    }
    if (targetWidget) {
      targetWidget.callback = function() {
        hydrateFromWidgets();
        originalTargetWidgetCallback?.apply(this, arguments as any);
      };
    }
    if (familyWidget) {
      familyWidget.callback = function() {
        hydrateFromWidgets();
        originalFamilyWidgetCallback?.apply(this, arguments as any);
      };
    }

    // Apply layout constraints
    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    const initialHeight = Array.isArray(node.size) ? Number(node.size[1]) : MIN_H;
    node.setSize([Math.max(MIN_W, initialWidth), Math.max(MIN_H, initialHeight)]);

    // Cleanup callbacks on removal
    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      comfyApi.removeEventListener("executed", onExecuted);
      node.configure = originalConfigure;
      if (sizeWidget) sizeWidget.callback = originalSizeWidgetCallback;
      if (targetWidget) targetWidget.callback = originalTargetWidgetCallback;
      if (familyWidget) familyWidget.callback = originalFamilyWidgetCallback;
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  }
});
