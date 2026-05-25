import { api as comfyApi } from "COMFY_API";
import { app as comfyApp } from "COMFY_APP";
import { createApp } from "vue";
import RealTimeGradingProcessor from "./components/RealTimeGradingProcessor.vue";

const MIN_W = 840;
const MIN_H = 820;

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

function updateParamsWidget(node: any, paramsWidget: any, json: string): void {
  if (!paramsWidget) {
    notifyGraphChanged(node);
    return;
  }

  paramsWidget.value = json;

  notifyGraphChanged(node);
}

comfyApp.registerExtension({
  name: "Duffy.RealTimeGradingProcessor.Vue",

  async nodeCreated(node: any) {
    if (node.comfyClass !== "Duffy_RealTimeGradingProcessor") {
      return;
    }

    // Find and hide the shader_params state widget
    const paramsWidget = node.widgets?.find((widget: any) => widget.name === "shader_params");
    if (paramsWidget) {
      paramsWidget.type = "hidden";
      paramsWidget.hidden = true;
      paramsWidget.disabled = true;
      paramsWidget.computeSize = () => [0, 0];
    }

    // Create Vue mount container
    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);

    const initialParamsStr = typeof paramsWidget?.value === "string" ? paramsWidget.value : "{}";

    // Initialize and mount Vue application
    const vueApp = createApp(RealTimeGradingProcessor, {
      initialParams: initialParamsStr,
      nodeId: node.id,
      onChange: (json: string) => {
        updateParamsWidget(node, paramsWidget, json);
      },
      onResize: (height: number) => {
        const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
        node.setSize([currentWidth, Math.max(MIN_H, height)]);
        notifyGraphChanged(node);
      }
    });

    const instance = vueApp.mount(container) as any;

    // Add DOM widget
    const domWidget = node.addDOMWidget("grading_processor_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];

    // Hydration helper
    const hydrateFromWidget = (value: unknown) => {
      if (typeof value !== "string" || !value.trim()) {
        return;
      }
      instance.hydrateState?.(value);
    };

    // Telemetry event listener
    const getFirstPayloadItem = (value: unknown) => {
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
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

      const thumbPayload = getFirstPayloadItem(uiPayload.original_thumbnail);
      const processedPayload = getFirstPayloadItem(uiPayload.processed_thumbnail)
        ?? getFirstPayloadItem(uiPayload.images);
      const comparePayload = uiPayload.compare_images;
      const histogramPayload = getFirstPayloadItem(uiPayload.histogram);

      if (Array.isArray(comparePayload) && comparePayload.length >= 2) {
        instance.setCompareImages?.(comparePayload);
      } else {
        if (thumbPayload) {
          instance.setOriginalThumbnail?.(thumbPayload);
        }
        if (processedPayload) {
          instance.setProcessedThumbnail?.(processedPayload);
        }
      }

      if (histogramPayload) {
        instance.setBackendHistogram?.(histogramPayload);
      }
    };

    const onExecuted = (event: any) => {
      const { node: execNodeId, output } = event.detail || {};
      if (String(execNodeId) === String(node.id)) {
        applyExecutionPayload(output);
      }
    };

    comfyApi.addEventListener("executed", onExecuted);

    const originalOnExecuted = node.onExecuted;
    node.onExecuted = function onNodeExecuted(message: any) {
      originalOnExecuted?.apply(this, arguments);
      applyExecutionPayload(message);
    };

    // Node loading configuration hook
    const originalConfigure = node.configure;
    node.configure = function configureNode(info: any) {
      const result = originalConfigure?.call(this, info);
      if (paramsWidget?.value) {
        hydrateFromWidget(paramsWidget.value);
      }
      return result;
    };

    // Callback on state widget value edits
    const originalWidgetCallback = paramsWidget?.callback;
    if (paramsWidget) {
      paramsWidget.callback = function widgetCallback(value: string) {
        hydrateFromWidget(value);
        originalWidgetCallback?.apply(this, arguments);
      };
    }

    // Apply layout constraints
    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    const initialHeight = Array.isArray(node.size) ? Number(node.size[1]) : MIN_H;
    node.setSize([Math.max(MIN_W, initialWidth), Math.max(MIN_H, initialHeight)]);

    // Cleanup callbacks on removal
    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      if (paramsWidget) {
        paramsWidget.callback = originalWidgetCallback;
      }
      node.onExecuted = originalOnExecuted;
      comfyApi.removeEventListener("executed", onExecuted);
      instance.cleanup?.();
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  }
});
