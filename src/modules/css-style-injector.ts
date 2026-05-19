import { sanitizeThemeState, type SlotKey, type ThemePanelState } from "./state-sync";

const STYLE_ELEMENT_ID = "duffy-theme-control-panel-overrides";
const NODE_ROOT_TARGETS = [
  ".comfy-node",
  ".lg-node",
  ".litegraph .lgraphnode",
  ".litegraph .graph-node",
];

const NODE_BACKGROUND_TARGETS = [
  ".comfy-node [data-slot=\"content\"]",
  ".lg-node [data-slot=\"content\"]",
  ".comfy-node .lg-node-content",
  ".lg-node .lg-node-content",
  ".comfy-node > .node-component-surface",
  ".lg-node > .node-component-surface",
];

const NODE_HEADER_TARGETS = [
  ".comfy-node .comfy-node-title",
  ".lg-node .comfy-node-title",
  ".comfy-node [data-slot=\"header\"]",
  ".lg-node [data-slot=\"header\"]",
  ".comfy-node header",
  ".lg-node header",
];

const NODE_OUTLINE_TARGETS = [
  ".comfy-node .node-component-outline",
  ".comfy-node .node-component-border",
  ".comfy-node .border-node-component-outline",
  ".comfy-node .outline-node-component-outline",
  ".comfy-node .border-node-component-border",
  ".lg-node .node-component-outline",
  ".lg-node .node-component-border",
  ".lg-node .border-node-component-outline",
  ".lg-node .outline-node-component-outline",
  ".lg-node .border-node-component-border",
  ".node-component-outline",
  ".node-component-border",
  ".border-node-component-outline",
  ".outline-node-component-outline",
  ".border-node-component-border",
  ".litegraph .lgraphnode > .nodebg",
  ".litegraph .graph-node > .nodebg",
];

const NODE_ROOT_SELECTOR = NODE_ROOT_TARGETS.join(",\n");
const NODE_BACKGROUND_SELECTOR = NODE_BACKGROUND_TARGETS.join(",\n");
const NODE_HEADER_SELECTOR = NODE_HEADER_TARGETS.join(",\n");
const NODE_OUTLINE_SELECTOR = NODE_OUTLINE_TARGETS.join(",\n");

const BODY_TEXT_SUFFIXES = [
  " .comfy-widget label",
  " .comfy-widget input",
  " .comfy-widget select",
  " .comfy-widget button",
  " .p-inputtext",
  " .p-textarea",
  " .p-inputtextarea",
  " .p-inputnumber-input",
  " .p-dropdown-label",
  " .p-select-label",
  " [data-slot=\"content\"] .text-node-component-slot-text",
  " .comfy-widget .text-node-component-slot-text",
];

const BODY_COLOR_SUFFIXES = [
  " [data-slot=\"content\"]",
  " [data-slot=\"content\"] *",
  " .comfy-widget",
  " .comfy-widget *",
  " .comfy-multiline-input",
  " .comfy-multiline-input *",
  " .p-inputtext",
  " .p-inputtextarea",
  " .p-inputnumber-input",
  " .p-dropdown-label",
  " .p-select-label",
  " .text-node-component-content-text",
  " .text-node-component-slot-text",
];

const TITLE_TEXT_SUFFIXES = [
  " .text-node-component-header",
  " .text-node-component-header-text",
  " .comfy-node-title",
  " [data-slot=\"header\"] .text-node-component-header-text",
];

const TITLE_COLOR_SUFFIXES = [
  " .comfy-node-title",
  " .comfy-node-title *",
  " [data-slot=\"header\"]",
  " [data-slot=\"header\"] *",
  " .text-node-component-header",
  " .text-node-component-header-text",
  " .text-node-component-header-icon",
];

const SLOT_TEXT_SUFFIXES = [
  " .lg-slot .text-node-component-slot-text",
  " [data-slot=\"slot\"] .text-node-component-slot-text",
  " .lg-slot label",
  " [data-slot=\"slot\"] label",
];

const SLOT_POINT_SIZE_SUFFIXES = [
  " .node-slot-handle",
  " .node-slot-dot",
  " .slot-handle",
  " .slot-dot",
];

const SLOT_POINT_PSEUDO_SUFFIXES = [
  " .node-slot-handle::before",
  " .node-slot-dot::before",
  " .slot-handle::before",
  " .slot-dot::before",
];

const SLOT_SELECTOR_SUFFIXES = [
  ".lg-slot",
  "[data-slot]",
  "[data-slot-type]",
  "[data-type]",
  ".slot",
];

function expandRootSuffixes(suffixes: string[]): string {
  const selectors: string[] = [];
  for (const root of NODE_ROOT_TARGETS) {
    for (const suffix of suffixes) {
      selectors.push(`${root}${suffix}`);
    }
  }

  return selectors.join(",\n");
}

let styleElement: HTMLStyleElement | null = null;
let lastCss = "";
let pendingState: ThemePanelState | null = null;
let pendingFrame = 0;

function ensureStyleElement(): HTMLStyleElement {
  if (styleElement && styleElement.isConnected) {
    return styleElement;
  }

  const existing = document.getElementById(STYLE_ELEMENT_ID);
  if (existing && existing instanceof HTMLStyleElement) {
    styleElement = existing;
    return styleElement;
  }

  const element = document.createElement("style");
  element.id = STYLE_ELEMENT_ID;
  document.head.appendChild(element);
  styleElement = element;
  return element;
}

function slotSelectorsFor(slotKey: SlotKey): string {
  const lowered = slotKey.toLowerCase();
  const selectors: string[] = [];

  for (const root of NODE_ROOT_TARGETS) {
    for (const suffix of SLOT_SELECTOR_SUFFIXES) {
      selectors.push(`${root} ${suffix}[data-slot-type="${slotKey}"]`);
      selectors.push(`${root} ${suffix}[data-type="${slotKey}"]`);
      selectors.push(`${root} ${suffix}.slot-${lowered}`);
      selectors.push(`${root} ${suffix}.slot_${slotKey}`);
    }
  }

  selectors.push(`.litegraph .slot_${slotKey}`);
  selectors.push(`.litegraph .slot-${lowered}`);
  return selectors.join(",\n");
}

function compileSlotCss(state: ThemePanelState): string {
  const lines: string[] = [];
  const slotMap = state.nodeSlot;
  for (const key of Object.keys(slotMap) as SlotKey[]) {
    const slotColor = slotMap[key];
    const typeSelector = `.slot-dot[style*="--color-datatype-${key}"]`;

    lines.push(`
${slotSelectorsFor(key)} {
  border-color: ${slotColor} !important;
  color: ${slotColor} !important;
  fill: ${slotColor} !important;
  background-color: ${slotColor} !important;
}

${typeSelector} {
  background-color: ${slotColor} !important;
  border-color: ${slotColor} !important;
}`);
  }
  return lines.join("\n");
}

function compileSlotPointSizeCss(pointSize: number): string {
  const pointSelector = expandRootSuffixes(SLOT_POINT_SIZE_SUFFIXES);
  const pseudoPointSelector = expandRootSuffixes(SLOT_POINT_PSEUDO_SUFFIXES);

  return `
${pointSelector} {
  --duffy-slot-point-size: ${pointSize}px !important;
  width: var(--duffy-slot-point-size) !important;
  height: var(--duffy-slot-point-size) !important;
  min-width: var(--duffy-slot-point-size) !important;
  min-height: var(--duffy-slot-point-size) !important;
  border-radius: 999px !important;
}

${pseudoPointSelector} {
  width: var(--duffy-slot-point-size) !important;
  height: var(--duffy-slot-point-size) !important;
  min-width: var(--duffy-slot-point-size) !important;
  min-height: var(--duffy-slot-point-size) !important;
  border-radius: 999px !important;
}
`;
}

function compileOutlineCss(state: ThemePanelState): string {
  const outlineColor = state.uiMeta.outlineColor;
  switch (state.uiMeta.outlineEffect) {
    case "solid":
      return `
${NODE_OUTLINE_SELECTOR} {
  box-shadow: inset 0 0 0 1px ${outlineColor} !important;
  animation: none !important;
}
`;

    case "static-glow":
      return `
${NODE_OUTLINE_SELECTOR} {
  box-shadow: inset 0 0 0 1px ${outlineColor}, 0 0 14px 2px ${outlineColor} !important;
  animation: none !important;
}
`;

    case "pulsing-glow":
      return `
@keyframes duffyThemePulse {
  0% { box-shadow: inset 0 0 0 1px ${outlineColor}, 0 0 6px 1px ${outlineColor}; }
  100% { box-shadow: inset 0 0 0 1px ${outlineColor}, 0 0 20px 5px ${outlineColor}; }
}

${NODE_OUTLINE_SELECTOR} {
  animation: duffyThemePulse 1.8s ease-in-out infinite alternate !important;
}
`;

    case "scanline":
      return `
@keyframes duffyThemeScanline {
  0% {
    box-shadow: inset 0 0 0 1px ${outlineColor}, 0 -10px 12px -10px ${outlineColor}, 0 0 10px 1px ${outlineColor}66;
  }
  50% {
    box-shadow: inset 0 0 0 1px ${outlineColor}, 0 0 16px -8px ${outlineColor}, 0 0 12px 2px ${outlineColor}66;
  }
  100% {
    box-shadow: inset 0 0 0 1px ${outlineColor}, 0 10px 12px -10px ${outlineColor}, 0 0 10px 1px ${outlineColor}66;
  }
}

${NODE_OUTLINE_SELECTOR} {
  animation: duffyThemeScanline 1.4s linear infinite !important;
}
`;

    default:
      return "";
  }
}

function compileCss(state: ThemePanelState): string {
  const ui = state.uiMeta;
  const litegraphBase = state.litegraphBase;
  const comfyBase = state.comfyBase;
  const safeFamily = ui.fontFamily.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Arial";
  const fontFamilyCss = `\"${safeFamily}\", \"Segoe UI\", sans-serif`;
  const bodyTextSelector = expandRootSuffixes(BODY_TEXT_SUFFIXES);
  const bodyColorSelector = expandRootSuffixes(BODY_COLOR_SUFFIXES);
  const titleTextSelector = expandRootSuffixes(TITLE_TEXT_SUFFIXES);
  const titleColorSelector = expandRootSuffixes(TITLE_COLOR_SUFFIXES);
  const slotTextSelector = expandRootSuffixes(SLOT_TEXT_SUFFIXES);

  return `
:root,
body,
.dark-theme {
  --comfy-textarea-font-size: ${ui.textareaFontSize}px !important;
  --duffy-slot-point-size: ${ui.slotPointSize}px !important;
  --duffy-slot-font-size: ${ui.ioTextSize}px !important;
  --component-node-foreground: ${litegraphBase.NODE_TEXT_COLOR} !important;
  --component-node-foreground-secondary: ${litegraphBase.WIDGET_SECONDARY_TEXT_COLOR} !important;
  --component-node-background: ${litegraphBase.NODE_DEFAULT_BGCOLOR} !important;
  --node-component-header: ${litegraphBase.NODE_TITLE_COLOR} !important;
  --node-component-header-surface: ${litegraphBase.NODE_DEFAULT_COLOR} !important;
  --node-component-outline: ${litegraphBase.NODE_BOX_OUTLINE_COLOR} !important;
  --node-component-border: ${litegraphBase.NODE_BOX_OUTLINE_COLOR} !important;
  --node-component-border-selected: ${litegraphBase.NODE_BOX_OUTLINE_COLOR} !important;
  --node-stroke: ${litegraphBase.NODE_BOX_OUTLINE_COLOR} !important;
  --node-stroke-selected: ${litegraphBase.NODE_BOX_OUTLINE_COLOR} !important;
  --node-component-slot-text: ${ui.ioTextColor} !important;
  --node-component-header-icon: ${litegraphBase.NODE_TITLE_COLOR} !important;
  --fg-color: ${comfyBase.fgColor} !important;
  --bg-color: ${comfyBase.bgColor} !important;
  --comfy-menu-bg: ${comfyBase.menuBg} !important;
  --comfy-input-bg: ${comfyBase.inputBg} !important;
  --input-text: ${comfyBase.inputText} !important;
  --descrip-text: ${comfyBase.descriptionText} !important;
  --error-text: ${comfyBase.errorText} !important;
  --border-color: ${comfyBase.borderColor} !important;
  --bar-shadow: ${comfyBase.barShadow} !important;
  --duffy-slot-image: ${state.nodeSlot.IMAGE} !important;
  --duffy-slot-latent: ${state.nodeSlot.LATENT} !important;
  --duffy-slot-conditioning: ${state.nodeSlot.CONDITIONING} !important;
  --duffy-slot-mask: ${state.nodeSlot.MASK} !important;
  --duffy-slot-model: ${state.nodeSlot.MODEL} !important;
  --duffy-slot-vae: ${state.nodeSlot.VAE} !important;
  --duffy-slot-clip: ${state.nodeSlot.CLIP} !important;
  --duffy-slot-control-net: ${state.nodeSlot.CONTROL_NET} !important;
  --duffy-slot-sampler: ${state.nodeSlot.SAMPLER} !important;
  --duffy-slot-sigmas: ${state.nodeSlot.SIGMAS} !important;
  --duffy-slot-noise: ${state.nodeSlot.NOISE} !important;
  --duffy-slot-guider: ${state.nodeSlot.GUIDER} !important;
}

${NODE_ROOT_SELECTOR} {
  font-family: ${fontFamilyCss} !important;
}

${bodyTextSelector} {
  font-size: ${ui.bodyFontSize}px !important;
}

${bodyColorSelector} {
  color: ${ui.contentTextColor} !important;
}

${NODE_HEADER_SELECTOR} {
  background-color: ${ui.titleBgColor} !important;
}

${titleTextSelector} {
  font-size: ${ui.titleFontSize}px !important;
}

${titleColorSelector} {
  color: ${ui.titleTextColor} !important;
}

${expandRootSuffixes([" .text-node-component-header-icon"])} {
  color: ${ui.titleTextColor} !important;
}

${slotTextSelector} {
  color: ${ui.ioTextColor} !important;
  font-size: ${ui.ioTextSize}px !important;
}

${expandRootSuffixes([" [data-slot=\"content\"] .text-node-component-slot-text"])} {
  color: ${ui.contentTextColor} !important;
  font-size: ${ui.bodyFontSize}px !important;
}

${expandRootSuffixes([" .comfy-multiline-input", " textarea", " .p-inputtextarea"])},
.comfy-multiline-input,
textarea.comfy-multiline-input {
  font-size: ${ui.textareaFontSize}px !important;
  color: ${ui.contentTextColor} !important;
}

${NODE_BACKGROUND_SELECTOR} {
  background-color: ${ui.bgColor} !important;
  border-radius: inherit !important;
}

${expandRootSuffixes([" .comfy-widget", " .comfy-widget input", " .comfy-widget select", " .comfy-widget button"])},
.p-inputtext,
.p-inputnumber-input,
.p-inputtextarea,
.p-select,
.p-dropdown {
  background-color: ${litegraphBase.WIDGET_BGCOLOR} !important;
  border-color: ${litegraphBase.WIDGET_OUTLINE_COLOR} !important;
  color: ${litegraphBase.WIDGET_TEXT_COLOR} !important;
}

${expandRootSuffixes([" .comfy-widget .secondary", " .text-node-component-slot-subtext"])},
.text-muted,
.text-secondary {
  color: ${litegraphBase.WIDGET_SECONDARY_TEXT_COLOR} !important;
}

${expandRootSuffixes([" .comfy-widget [disabled]", " .comfy-widget .disabled"])},
.is-disabled {
  color: ${litegraphBase.WIDGET_DISABLED_TEXT_COLOR} !important;
}

svg path,
svg polyline {
  --duffy-link-color: ${litegraphBase.LINK_COLOR};
}

${compileSlotCss(state)}

${compileSlotPointSizeCss(ui.slotPointSize)}

${compileOutlineCss(state)}
`;
}

function applyNow(state: ThemePanelState): void {
  const normalized = sanitizeThemeState(state);
  const css = compileCss(normalized);
  if (css === lastCss) {
    return;
  }

  const style = ensureStyleElement();
  style.textContent = css;
  lastCss = css;
}

export function applyThemeNow(state: ThemePanelState): void {
  pendingState = null;
  if (pendingFrame) {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
  }

  applyNow(state);
}

export function scheduleThemeApply(state: ThemePanelState): void {
  pendingState = sanitizeThemeState(state);

  if (pendingFrame) {
    return;
  }

  pendingFrame = requestAnimationFrame(() => {
    pendingFrame = 0;
    if (!pendingState) {
      return;
    }

    applyNow(pendingState);
    pendingState = null;
  });
}
