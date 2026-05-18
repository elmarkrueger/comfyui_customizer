import { app as comfyApp } from "COMFY_APP";
import { createApp } from "vue";

import ThemeControlPanel from "./components/ThemeControlPanel.vue";
import { applyThemeNow } from "./modules/css-style-injector";
import {
    DEFAULT_THEME_PANEL_STATE,
    deserializeThemeState,
    sanitizeThemeState,
    type ThemePanelState,
} from "./modules/state-sync";

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

function collectRuntimeSlotColorMaps(): Array<Record<string, string>> {
  const appAny = comfyApp as any;
  const globalAny = globalThis as any;
  const candidates: unknown[] = [
    appAny?.canvas?.default_connection_color_byType,
    appAny?.canvas?.default_connection_color_byTypeOff,
    globalAny?.app?.canvas?.default_connection_color_byType,
    globalAny?.app?.canvas?.default_connection_color_byTypeOff,
    globalAny?.comfyAPI?.app?.app?.canvas?.default_connection_color_byType,
    globalAny?.comfyAPI?.app?.app?.canvas?.default_connection_color_byTypeOff,
  ];

  const unique = new Set<Record<string, string>>();
  const maps: Array<Record<string, string>> = [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      continue;
    }

    const map = candidate as Record<string, string>;
    if (!unique.has(map)) {
      unique.add(map);
      maps.push(map);
    }
  }

  return maps;
}

function requestCanvasRedraw(): void {
  const appAny = comfyApp as any;
  comfyApp.graph?.setDirtyCanvas?.(true, true);
  appAny?.canvas?.graph?.setDirtyCanvas?.(true, true);
  appAny?.canvas?.setDirty?.(true, true);
  appAny?.canvas?.draw?.(true, true);
}

function applyRuntimeSlotColors(state: ThemePanelState): void {
  const normalized = sanitizeThemeState(state);
  const maps = collectRuntimeSlotColorMaps();
  if (!maps.length) {
    return;
  }

  for (const map of maps) {
    for (const [slotType, color] of Object.entries(normalized.nodeSlot)) {
      const lowerSlotType = slotType.toLowerCase();
      const hasUpper = slotType in map;
      const hasLower = lowerSlotType in map;

      if (hasUpper || !hasLower) {
        map[slotType] = color;
      }

      if (hasLower) {
        map[lowerSlotType] = color;
      }
    }
  }

  requestCanvasRedraw();
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
    applyRuntimeSlotColors(initialState);

    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);

    const vueApp = createApp(ThemeControlPanel, {
      onChange: (json: string) => {
        const nextState = deserializeThemeState(json);
        applyThemeNow(nextState);
        applyRuntimeSlotColors(nextState);

        if (stateWidget) {
          stateWidget.value = json;
        }

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

      const hydratedState = deserializeThemeState(value);
      applyThemeNow(hydratedState);
      applyRuntimeSlotColors(hydratedState);
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
