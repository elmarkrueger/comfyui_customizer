import { api as comfyApi } from "COMFY_API";
import { app as comfyApp } from "COMFY_APP";
import { createApp } from "vue";
import IntelligentBlockSwapV2 from "./components/IntelligentBlockSwapV2.vue";

const MIN_W = 420;
const MIN_H = 340; // Default height when accordion is collapsed

function isolateContainerEvents(container: HTMLDivElement): void {
  const stopPropagation = (event: Event) => {
    event.stopPropagation();
  };

  container.addEventListener("pointerdown", stopPropagation);
  container.addEventListener("mousedown", stopPropagation);
  container.addEventListener("mouseup", stopPropagation);
  container.addEventListener("pointerup", stopPropagation);
  container.addEventListener("click", stopPropagation);
  container.addEventListener("wheel", stopPropagation);
  container.addEventListener("dblclick", stopPropagation);
  container.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
}

comfyApp.registerExtension({
  name: "Duffy.IntelligentBlockSwapV2.Vue",

  async nodeCreated(node: any) {
    if (node.comfyClass !== "IntelligentBlockSwapV2") {
      return;
    }

    // Determine if Nodes 2.0 view is enabled
    const isNodes2 = (() => {
      const localVal = localStorage.getItem("comfy.settings.Comfy.VueNodes.Enabled");
      if (localVal !== null) {
        try {
          const parsed = JSON.parse(localVal);
          if (Array.isArray(parsed)) return !!parsed[0];
          return !!parsed;
        } catch {
          return localVal === "true";
        }
      }
      const settingsVal = (comfyApp as any).ui?.settings?.getSettingValue?.("Comfy.VueNodes.Enabled");
      if (settingsVal !== undefined) {
        return !!settingsVal;
      }
      return true;
    })();

    if (!isNodes2) {
      // Legacy view (Nodes 2.0 disabled): Keep native LiteGraph widgets visible and functional
      if (node.widgets) {
        const autoTuningWidget = node.widgets.find((x: any) => x.name === "auto_hardware_tuning");
        const blocksWidget = node.widgets.find((x: any) => x.name === "blocks_to_swap");
        
        const updateWidgetStates = () => {
          if (autoTuningWidget && blocksWidget) {
            const isAuto = !!autoTuningWidget.value;
            blocksWidget.disabled = isAuto;
            node.setDirtyCanvas?.(true, true);
          }
        };

        if (autoTuningWidget) {
          const origCallback = autoTuningWidget.callback;
          autoTuningWidget.callback = function() {
            updateWidgetStates();
            return origCallback ? origCallback.apply(this, arguments as any) : undefined;
          };
        }
        
        // Initial state update
        setTimeout(updateWidgetStates, 1);
      }
      return;
    }

    // List of Python widgets to hide from the default canvas widget view
    const widgetsToHide = [
      "auto_hardware_tuning",
      "vram_threshold_percent",
      "blocks_to_swap",
      "enable_cuda_optimization",
      "enable_dram_optimization",
      "num_cuda_streams",
      "bandwidth_target",
      "offload_txt_emb",
      "offload_img_emb",
      "vace_blocks_to_swap",
      "use_non_blocking",
      "debug_mode",
    ];

    for (const wName of widgetsToHide) {
      const w = node.widgets?.find((x: any) => x.name === wName);
      if (w) {
        w.type = "hidden";
        w.hidden = true;
        w.disabled = true;
        w.computeSize = () => [0, -4];
      }
    }

    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);

    const getWidgetVal = (name: string, def: any) => {
      const w = node.widgets?.find((x: any) => x.name === name);
      return w ? w.value : def;
    };

    // Instantiate and mount Vue app inside ComfyUI custom node container
    const vueApp = createApp(IntelligentBlockSwapV2, {
      initialState: {
        auto_hardware_tuning: getWidgetVal("auto_hardware_tuning", true),
        vram_threshold_percent: getWidgetVal("vram_threshold_percent", 50.0),
        blocks_to_swap: getWidgetVal("blocks_to_swap", 0),
        enable_cuda_optimization: getWidgetVal("enable_cuda_optimization", true),
        enable_dram_optimization: getWidgetVal("enable_dram_optimization", true),
        num_cuda_streams: getWidgetVal("num_cuda_streams", 8),
        bandwidth_target: getWidgetVal("bandwidth_target", 0.8),
        offload_txt_emb: getWidgetVal("offload_txt_emb", true),
        offload_img_emb: getWidgetVal("offload_img_emb", false),
        vace_blocks_to_swap: getWidgetVal("vace_blocks_to_swap", 0),
        use_non_blocking: getWidgetVal("use_non_blocking", true),
        debug_mode: getWidgetVal("debug_mode", false),
      },
      nodeId: node.id,
      onStateChange: (key: string, value: any) => {
        const w = node.widgets?.find((x: any) => x.name === key);
        if (w) {
          w.value = value;
        }
        node.setDirtyCanvas?.(true, true);
        node.graph?.change?.();
      },
      onResize: (height: number) => {
        const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
        node.setSize([currentWidth, Math.max(MIN_H, height)]);
        node.setDirtyCanvas?.(true, true);
      }
    });

    const instance = vueApp.mount(container) as any;

    const domWidget = node.addDOMWidget("intelligent_block_swap_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];

    const hydrateFromWidgets = () => {
      const values: any = {};
      for (const wName of widgetsToHide) {
        values[wName] = getWidgetVal(wName, undefined);
      }
      instance.hydrateState?.(values);
    };

    const applyExecutionPayload = (rawPayload: any) => {
      const payload = rawPayload.output?.ui || rawPayload.ui || rawPayload;
      if (payload) {
        instance.setTelemetry?.({
          calculatedBlocksToSwap: payload.calculated_blocks_to_swap?.[0] ?? payload.calculated_blocks_to_swap,
          vramTotal: payload.vram_total?.[0] ?? payload.vram_total,
          vramFree: payload.vram_free?.[0] ?? payload.vram_free,
          dramTotal: payload.dram_total?.[0] ?? payload.dram_total,
          dramFree: payload.dram_free?.[0] ?? payload.dram_free,
          blockSize: payload.block_size?.[0] ?? payload.block_size,
          isRocm: payload.is_rocm?.[0] ?? payload.is_rocm,
        });
      }
    };

    const onExecuted = (event: any) => {
      const { node: execNodeId, output } = event.detail || {};
      if (String(execNodeId) === String(node.id)) {
        applyExecutionPayload(output);
      }
    };

    comfyApi.addEventListener("executed", onExecuted);

    const originalConfigure = node.configure;
    node.configure = function configureNode(info: any) {
      const result = originalConfigure?.call(this, info);
      hydrateFromWidgets();
      return result;
    };

    // Apply initial constraints
    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    node.setSize([Math.max(MIN_W, initialWidth), MIN_H]);

    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      comfyApi.removeEventListener("executed", onExecuted);
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  }
});
