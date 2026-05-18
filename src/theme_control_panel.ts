import { app as comfyApp } from "COMFY_APP";
import { createApp } from "vue";

import ThemeControlPanel from "./components/ThemeControlPanel.vue";
import { applyThemeNow } from "./modules/css-style-injector";
import { DEFAULT_THEME_PANEL_STATE, deserializeThemeState } from "./modules/state-sync";

const MIN_W = 430;
const MIN_H = 720;

function notifyThemeConflict(nodeId: number): void {
  const appAny = comfyApp as any;
  const message = "Multiple Theme Control Panel nodes are active. The most recently changed panel will override global theme output.";

  try {
    appAny?.extensionManager?.toast?.addAlert?.({
      severity: "warn",
      summary: "Theme Node Conflict",
      detail: message,
      life: 6500,
    });
  } catch {
    // Ignore toast failures and fallback to console warning.
  }

  console.warn(`[Duffy_ThemeControl] ${message} (node id: ${nodeId})`);
}

function countThemeNodes(): number {
  const graphAny = comfyApp.graph as any;
  const nodes = Array.isArray(graphAny?._nodes) ? graphAny._nodes : [];
  return nodes.filter((node: any) => node?.comfyClass === "Duffy_ThemeControlPanel").length;
}

function isolateContainerEvents(container: HTMLDivElement): void {
  const stopPropagation = (event: Event) => {
    event.stopPropagation();
  };

  container.addEventListener("pointerdown", stopPropagation);
  container.addEventListener("mousedown", stopPropagation);
  container.addEventListener("mouseup", stopPropagation);
  container.addEventListener("wheel", stopPropagation);
  container.addEventListener("dblclick", stopPropagation);
  container.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
}

comfyApp.registerExtension({
  name: "Duffy.ThemeControlPanel.Vue",

  async nodeCreated(node: any) {
    if (node.comfyClass !== "Duffy_ThemeControlPanel") {
      return;
    }

    if (countThemeNodes() > 1) {
      notifyThemeConflict(Number(node?.id ?? -1));
    }

    const stateWidget = node.widgets?.find((widget: any) => widget.name === "panel_state");
    if (stateWidget) {
      stateWidget.type = "hidden";
      stateWidget.computeSize = () => [0, -4];
    }

    const initialState =
      typeof stateWidget?.value === "string" && stateWidget.value.trim()
        ? deserializeThemeState(stateWidget.value)
        : { ...DEFAULT_THEME_PANEL_STATE };
    applyThemeNow(initialState);

    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);

    const vueApp = createApp(ThemeControlPanel, {
      onChange: (json: string) => {
        if (stateWidget) {
          stateWidget.value = json;
        }

        comfyApp.graph?.setDirtyCanvas?.(true, false);
        node.setDirtyCanvas?.(true, true);
      },
    });

    const instance = vueApp.mount(container) as any;

    const domWidget = node.addDOMWidget("theme_panel_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => {
      const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
      const currentHeight = Array.isArray(node.size) ? Number(node.size[1]) : MIN_H;

      return [Math.max(MIN_W, currentWidth), Math.max(MIN_H, currentHeight)];
    };

    const hydrateFromWidget = (value: unknown) => {
      if (typeof value !== "string" || !value.trim()) {
        return;
      }

      applyThemeNow(deserializeThemeState(value));
      instance.deserialise?.(value);
    };

    if (stateWidget?.value) {
      hydrateFromWidget(stateWidget.value);
    }

    const originalConfigure = node.configure;
    node.configure = function configureNode(info: any) {
      const result = originalConfigure?.call(this, info);
      if (stateWidget?.value) {
        hydrateFromWidget(stateWidget.value);
      }
      return result;
    };

    const originalWidgetCallback = stateWidget?.callback;
    if (stateWidget) {
      stateWidget.callback = function widgetCallback(value: string) {
        hydrateFromWidget(value);
        originalWidgetCallback?.apply(this, arguments);
      };
    }

    const originalOnResize = node.onResize;
    node.onResize = function onResize(size: [number, number]) {
      size[0] = Math.max(MIN_W, size[0]);
      size[1] = Math.max(MIN_H, size[1]);
      originalOnResize?.call(this, size);
    };

    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    const initialHeight = Array.isArray(node.size) ? Number(node.size[1]) : MIN_H;
    node.setSize([Math.max(MIN_W, initialWidth), Math.max(MIN_H, initialHeight)]);

    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      if (stateWidget) {
        stateWidget.callback = originalWidgetCallback;
      }

      instance.cleanup?.();
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  },
});
