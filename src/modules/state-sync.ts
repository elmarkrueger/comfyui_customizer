export type OutlineEffect = "solid" | "static-glow" | "pulsing-glow" | "scanline";

export type SlotKey =
  | "IMAGE"
  | "LATENT"
  | "CONDITIONING"
  | "MASK"
  | "MODEL"
  | "VAE"
  | "CLIP"
  | "CONTROL_NET"
  | "SAMPLER"
  | "SIGMAS"
  | "NOISE"
  | "GUIDER";

export interface ThemeUiMeta {
  fontFamily: string;
  bodyFontSize: number;
  titleFontSize: number;
  textareaFontSize: number;
  contentTextColor: string;
  titleTextColor: string;
  ioTextColor: string;
  ioTextSize: number;
  slotPointSize: number;
  bgColor: string;
  titleBgColor: string;
  outlineColor: string;
  outlineEffect: OutlineEffect;
  activePresetId: string | null;
}

export interface LitegraphBaseTheme {
  NODE_TITLE_COLOR: string;
  NODE_SELECTED_TITLE_COLOR: string;
  NODE_TEXT_SIZE: number;
  NODE_TEXT_COLOR: string;
  NODE_SUBTEXT_SIZE: number;
  NODE_DEFAULT_COLOR: string;
  NODE_DEFAULT_BGCOLOR: string;
  NODE_DEFAULT_BOXCOLOR: string;
  NODE_BOX_OUTLINE_COLOR: string;
  NODE_BYPASS_BGCOLOR: string;
  DEFAULT_SHADOW_COLOR: string;
  WIDGET_BGCOLOR: string;
  WIDGET_OUTLINE_COLOR: string;
  WIDGET_TEXT_COLOR: string;
  WIDGET_SECONDARY_TEXT_COLOR: string;
  WIDGET_DISABLED_TEXT_COLOR: string;
  LINK_COLOR: string;
  EVENT_LINK_COLOR: string;
  CONNECTING_LINK_COLOR: string;
  BADGE_FG_COLOR: string;
  BADGE_BG_COLOR: string;
}

export interface ComfyBaseTheme {
  fgColor: string;
  bgColor: string;
  menuBg: string;
  inputBg: string;
  inputText: string;
  descriptionText: string;
  errorText: string;
  borderColor: string;
  barShadow: string;
}

export interface NodeSlotTheme {
  IMAGE: string;
  LATENT: string;
  CONDITIONING: string;
  MASK: string;
  MODEL: string;
  VAE: string;
  CLIP: string;
  CONTROL_NET: string;
  SAMPLER: string;
  SIGMAS: string;
  NOISE: string;
  GUIDER: string;
}

export interface ThemePresetSnapshot {
  uiMeta: ThemeUiMeta;
  litegraphBase: LitegraphBaseTheme;
  comfyBase: ComfyBaseTheme;
  nodeSlot: NodeSlotTheme;
}

export interface ThemePreset {
  id: string;
  name: string;
  snapshot: ThemePresetSnapshot;
}

export interface ThemePanelState {
  schemaVersion: 2;
  uiMeta: ThemeUiMeta;
  litegraphBase: LitegraphBaseTheme;
  comfyBase: ComfyBaseTheme;
  nodeSlot: NodeSlotTheme;
  presets: {
    custom: ThemePreset[];
  };
}

interface PresetCollectionPayload {
  schemaVersion: 2;
  presets: ThemePreset[];
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const FAMILY_RE = /^[a-zA-Z0-9 _-]{1,80}$/;
const SIMPLE_CSS_COLOR_RE = /^[#(),.%\sa-zA-Z0-9-]{1,96}$/;
const PRESET_ID_RE = /^[a-z0-9_-]{1,48}$/;
const MIN_CONTRAST_RATIO = 2.2;

const OUTLINE_EFFECTS: Set<OutlineEffect> = new Set([
  "solid",
  "static-glow",
  "pulsing-glow",
  "scanline",
]);

const SLOT_KEYS: SlotKey[] = [
  "IMAGE",
  "LATENT",
  "CONDITIONING",
  "MASK",
  "MODEL",
  "VAE",
  "CLIP",
  "CONTROL_NET",
  "SAMPLER",
  "SIGMAS",
  "NOISE",
  "GUIDER",
];

export const DEFAULT_THEME_UI_META: ThemeUiMeta = {
  fontFamily: "Arial",
  bodyFontSize: 14,
  titleFontSize: 18,
  textareaFontSize: 13,
  contentTextColor: "#d9d9d9",
  titleTextColor: "#d9d9d9",
  ioTextColor: "#d9d9d9",
  ioTextSize: 13,
  slotPointSize: 12,
  bgColor: "#242424",
  titleBgColor: "#2f2f2f",
  outlineColor: "#00d18f",
  outlineEffect: "solid",
  activePresetId: null,
};

export const DEFAULT_LITEGRAPH_BASE: LitegraphBaseTheme = {
  NODE_TITLE_COLOR: "#d9d9d9",
  NODE_SELECTED_TITLE_COLOR: "#ffffff",
  NODE_TEXT_SIZE: 14,
  NODE_TEXT_COLOR: "#d9d9d9",
  NODE_SUBTEXT_SIZE: 12,
  NODE_DEFAULT_COLOR: "#2f2f2f",
  NODE_DEFAULT_BGCOLOR: "#242424",
  NODE_DEFAULT_BOXCOLOR: "#3c3c3c",
  NODE_BOX_OUTLINE_COLOR: "#00d18f",
  NODE_BYPASS_BGCOLOR: "#323232",
  DEFAULT_SHADOW_COLOR: "rgba(0, 0, 0, 0.45)",
  WIDGET_BGCOLOR: "#1c1c1c",
  WIDGET_OUTLINE_COLOR: "#3c3c3c",
  WIDGET_TEXT_COLOR: "#d9d9d9",
  WIDGET_SECONDARY_TEXT_COLOR: "#a8a8a8",
  WIDGET_DISABLED_TEXT_COLOR: "#767676",
  LINK_COLOR: "#9bbdff",
  EVENT_LINK_COLOR: "#ffa14e",
  CONNECTING_LINK_COLOR: "#8be8c7",
  BADGE_FG_COLOR: "#f5f5f5",
  BADGE_BG_COLOR: "#2b2b2b",
};

export const DEFAULT_COMFY_BASE: ComfyBaseTheme = {
  fgColor: "#f2f2f2",
  bgColor: "#202020",
  menuBg: "#2a2a2a",
  inputBg: "#1f1f1f",
  inputText: "#f2f2f2",
  descriptionText: "#a9a9a9",
  errorText: "#ff5f5f",
  borderColor: "#3a3a3a",
  barShadow: "rgba(0, 0, 0, 0.4)",
};

export const DEFAULT_NODE_SLOT: NodeSlotTheme = {
  IMAGE: "#64B5F6",
  LATENT: "#FF9CF9",
  CONDITIONING: "#50FA7B",
  MASK: "#81C784",
  MODEL: "#B39DDB",
  VAE: "#FF6E6E",
  CLIP: "#FFD500",
  CONTROL_NET: "#6EE7B7",
  SAMPLER: "#ECB4B4",
  SIGMAS: "#CDFFCD",
  NOISE: "#B0B0B0",
  GUIDER: "#9fd8ff",
};

export const DEFAULT_THEME_PANEL_STATE: ThemePanelState = {
  schemaVersion: 2,
  uiMeta: { ...DEFAULT_THEME_UI_META },
  litegraphBase: { ...DEFAULT_LITEGRAPH_BASE },
  comfyBase: { ...DEFAULT_COMFY_BASE },
  nodeSlot: { ...DEFAULT_NODE_SLOT },
  presets: {
    custom: [],
  },
};

export const BUILTIN_PRESETS: ThemePreset[] = [
  {
    id: "builtin-balanced-dark",
    name: "Balanced Dark",
    snapshot: {
      uiMeta: { ...DEFAULT_THEME_UI_META, activePresetId: "builtin-balanced-dark" },
      litegraphBase: { ...DEFAULT_LITEGRAPH_BASE },
      comfyBase: { ...DEFAULT_COMFY_BASE },
      nodeSlot: { ...DEFAULT_NODE_SLOT },
    },
  },
  {
    id: "builtin-high-contrast",
    name: "High Contrast",
    snapshot: {
      uiMeta: {
        ...DEFAULT_THEME_UI_META,
        contentTextColor: "#f5f5f5",
        titleTextColor: "#ffffff",
        ioTextColor: "#ffffff",
        bgColor: "#111111",
        titleBgColor: "#1d1d1d",
        outlineColor: "#2ee6a7",
        activePresetId: "builtin-high-contrast",
      },
      litegraphBase: {
        ...DEFAULT_LITEGRAPH_BASE,
        NODE_TITLE_COLOR: "#ffffff",
        NODE_TEXT_COLOR: "#f1f1f1",
        NODE_DEFAULT_BGCOLOR: "#111111",
        NODE_DEFAULT_COLOR: "#1d1d1d",
        NODE_BOX_OUTLINE_COLOR: "#2ee6a7",
        WIDGET_TEXT_COLOR: "#f4f4f4",
        WIDGET_SECONDARY_TEXT_COLOR: "#bbbbbb",
      },
      comfyBase: {
        ...DEFAULT_COMFY_BASE,
        bgColor: "#111111",
        menuBg: "#1a1a1a",
        borderColor: "#2f2f2f",
      },
      nodeSlot: {
        ...DEFAULT_NODE_SLOT,
        MODEL: "#c5b2ff",
        CLIP: "#ffe650",
      },
    },
  },
  {
    id: "builtin-legacy-preview",
    name: "Legacy Preview",
    snapshot: {
      uiMeta: {
        ...DEFAULT_THEME_UI_META,
        bgColor: "#242424",
        titleBgColor: "#2f2f2f",
        contentTextColor: "#d9d9d9",
        titleTextColor: "#d9d9d9",
        ioTextColor: "#d9d9d9",
        outlineColor: "#00d18f",
        activePresetId: "builtin-legacy-preview",
      },
      litegraphBase: {
        ...DEFAULT_LITEGRAPH_BASE,
        NODE_DEFAULT_BGCOLOR: "#242424",
        NODE_DEFAULT_COLOR: "#2f2f2f",
        NODE_BOX_OUTLINE_COLOR: "#00d18f",
      },
      comfyBase: { ...DEFAULT_COMFY_BASE },
      nodeSlot: { ...DEFAULT_NODE_SLOT },
    },
  },
];

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function srgbToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex);
  const r = srgbToLinear(red);
  const g = srgbToLinear(green);
  const b = srgbToLinear(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const fg = relativeLuminance(foregroundHex);
  const bg = relativeLuminance(backgroundHex);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureReadableColor(color: string, background: string, fallback: string): string {
  if (contrastRatio(color, background) >= MIN_CONTRAST_RATIO) {
    return color;
  }

  if (contrastRatio(fallback, background) >= MIN_CONTRAST_RATIO) {
    return fallback;
  }

  const lightContrast = contrastRatio("#ffffff", background);
  const darkContrast = contrastRatio("#000000", background);
  return lightContrast >= darkContrast ? "#ffffff" : "#000000";
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function sanitizeColor(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  return HEX_COLOR_RE.test(text) ? text : fallback;
}

function sanitizeCssColorLike(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  return SIMPLE_CSS_COLOR_RE.test(text) ? text : fallback;
}

function sanitizeFamily(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || !FAMILY_RE.test(text)) {
    return fallback;
  }
  return text;
}

function sanitizeOutlineEffect(value: unknown, fallback: OutlineEffect): OutlineEffect {
  const text = typeof value === "string" ? value : "";
  if (OUTLINE_EFFECTS.has(text as OutlineEffect)) {
    return text as OutlineEffect;
  }
  return fallback;
}

function sanitizePresetId(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (PRESET_ID_RE.test(text)) {
    return text;
  }
  return fallback;
}

function sanitizePresetName(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    return "Untitled Preset";
  }
  return text.slice(0, 60);
}

function sanitizeUiMeta(value: unknown): ThemeUiMeta {
  const source = isRecord(value) ? value : {};
  const normalized: ThemeUiMeta = {
    fontFamily: sanitizeFamily(source.fontFamily, DEFAULT_THEME_UI_META.fontFamily),
    bodyFontSize: clampInt(source.bodyFontSize, 8, 56, DEFAULT_THEME_UI_META.bodyFontSize),
    titleFontSize: clampInt(source.titleFontSize, 8, 72, DEFAULT_THEME_UI_META.titleFontSize),
    textareaFontSize: clampInt(source.textareaFontSize, 8, 56, DEFAULT_THEME_UI_META.textareaFontSize),
    contentTextColor: sanitizeColor(source.contentTextColor, DEFAULT_THEME_UI_META.contentTextColor),
    titleTextColor: sanitizeColor(source.titleTextColor, DEFAULT_THEME_UI_META.titleTextColor),
    ioTextColor: sanitizeColor(source.ioTextColor, DEFAULT_THEME_UI_META.ioTextColor),
    ioTextSize: clampInt(source.ioTextSize, 8, 40, DEFAULT_THEME_UI_META.ioTextSize),
    slotPointSize: clampInt(source.slotPointSize, 6, 26, DEFAULT_THEME_UI_META.slotPointSize),
    bgColor: sanitizeColor(source.bgColor, DEFAULT_THEME_UI_META.bgColor),
    titleBgColor: sanitizeColor(source.titleBgColor, DEFAULT_THEME_UI_META.titleBgColor),
    outlineColor: sanitizeColor(source.outlineColor, DEFAULT_THEME_UI_META.outlineColor),
    outlineEffect: sanitizeOutlineEffect(source.outlineEffect, DEFAULT_THEME_UI_META.outlineEffect),
    activePresetId: typeof source.activePresetId === "string" && source.activePresetId.trim()
      ? sanitizePresetId(source.activePresetId, DEFAULT_THEME_UI_META.activePresetId ?? "")
      : null,
  };

  const contentTextColor = ensureReadableColor(
    normalized.contentTextColor,
    normalized.bgColor,
    DEFAULT_THEME_UI_META.contentTextColor,
  );
  const titleTextColor = ensureReadableColor(normalized.titleTextColor, normalized.titleBgColor, contentTextColor);
  const ioTextColor = ensureReadableColor(normalized.ioTextColor, normalized.bgColor, contentTextColor);

  return {
    ...normalized,
    contentTextColor,
    titleTextColor,
    ioTextColor,
  };
}

function sanitizeLitegraphBase(value: unknown): LitegraphBaseTheme {
  const source = isRecord(value) ? value : {};
  return {
    NODE_TITLE_COLOR: sanitizeColor(source.NODE_TITLE_COLOR, DEFAULT_LITEGRAPH_BASE.NODE_TITLE_COLOR),
    NODE_SELECTED_TITLE_COLOR: sanitizeColor(
      source.NODE_SELECTED_TITLE_COLOR,
      DEFAULT_LITEGRAPH_BASE.NODE_SELECTED_TITLE_COLOR,
    ),
    NODE_TEXT_SIZE: clampInt(source.NODE_TEXT_SIZE, 8, 56, DEFAULT_LITEGRAPH_BASE.NODE_TEXT_SIZE),
    NODE_TEXT_COLOR: sanitizeColor(source.NODE_TEXT_COLOR, DEFAULT_LITEGRAPH_BASE.NODE_TEXT_COLOR),
    NODE_SUBTEXT_SIZE: clampInt(source.NODE_SUBTEXT_SIZE, 8, 48, DEFAULT_LITEGRAPH_BASE.NODE_SUBTEXT_SIZE),
    NODE_DEFAULT_COLOR: sanitizeColor(source.NODE_DEFAULT_COLOR, DEFAULT_LITEGRAPH_BASE.NODE_DEFAULT_COLOR),
    NODE_DEFAULT_BGCOLOR: sanitizeColor(source.NODE_DEFAULT_BGCOLOR, DEFAULT_LITEGRAPH_BASE.NODE_DEFAULT_BGCOLOR),
    NODE_DEFAULT_BOXCOLOR: sanitizeColor(source.NODE_DEFAULT_BOXCOLOR, DEFAULT_LITEGRAPH_BASE.NODE_DEFAULT_BOXCOLOR),
    NODE_BOX_OUTLINE_COLOR: sanitizeColor(
      source.NODE_BOX_OUTLINE_COLOR,
      DEFAULT_LITEGRAPH_BASE.NODE_BOX_OUTLINE_COLOR,
    ),
    NODE_BYPASS_BGCOLOR: sanitizeColor(source.NODE_BYPASS_BGCOLOR, DEFAULT_LITEGRAPH_BASE.NODE_BYPASS_BGCOLOR),
    DEFAULT_SHADOW_COLOR: sanitizeCssColorLike(source.DEFAULT_SHADOW_COLOR, DEFAULT_LITEGRAPH_BASE.DEFAULT_SHADOW_COLOR),
    WIDGET_BGCOLOR: sanitizeColor(source.WIDGET_BGCOLOR, DEFAULT_LITEGRAPH_BASE.WIDGET_BGCOLOR),
    WIDGET_OUTLINE_COLOR: sanitizeColor(source.WIDGET_OUTLINE_COLOR, DEFAULT_LITEGRAPH_BASE.WIDGET_OUTLINE_COLOR),
    WIDGET_TEXT_COLOR: sanitizeColor(source.WIDGET_TEXT_COLOR, DEFAULT_LITEGRAPH_BASE.WIDGET_TEXT_COLOR),
    WIDGET_SECONDARY_TEXT_COLOR: sanitizeColor(
      source.WIDGET_SECONDARY_TEXT_COLOR,
      DEFAULT_LITEGRAPH_BASE.WIDGET_SECONDARY_TEXT_COLOR,
    ),
    WIDGET_DISABLED_TEXT_COLOR: sanitizeColor(
      source.WIDGET_DISABLED_TEXT_COLOR,
      DEFAULT_LITEGRAPH_BASE.WIDGET_DISABLED_TEXT_COLOR,
    ),
    LINK_COLOR: sanitizeColor(source.LINK_COLOR, DEFAULT_LITEGRAPH_BASE.LINK_COLOR),
    EVENT_LINK_COLOR: sanitizeColor(source.EVENT_LINK_COLOR, DEFAULT_LITEGRAPH_BASE.EVENT_LINK_COLOR),
    CONNECTING_LINK_COLOR: sanitizeColor(source.CONNECTING_LINK_COLOR, DEFAULT_LITEGRAPH_BASE.CONNECTING_LINK_COLOR),
    BADGE_FG_COLOR: sanitizeColor(source.BADGE_FG_COLOR, DEFAULT_LITEGRAPH_BASE.BADGE_FG_COLOR),
    BADGE_BG_COLOR: sanitizeColor(source.BADGE_BG_COLOR, DEFAULT_LITEGRAPH_BASE.BADGE_BG_COLOR),
  };
}

function sanitizeComfyBase(value: unknown): ComfyBaseTheme {
  const source = isRecord(value) ? value : {};
  return {
    fgColor: sanitizeColor(source.fgColor, DEFAULT_COMFY_BASE.fgColor),
    bgColor: sanitizeColor(source.bgColor, DEFAULT_COMFY_BASE.bgColor),
    menuBg: sanitizeColor(source.menuBg, DEFAULT_COMFY_BASE.menuBg),
    inputBg: sanitizeColor(source.inputBg, DEFAULT_COMFY_BASE.inputBg),
    inputText: sanitizeColor(source.inputText, DEFAULT_COMFY_BASE.inputText),
    descriptionText: sanitizeColor(source.descriptionText, DEFAULT_COMFY_BASE.descriptionText),
    errorText: sanitizeColor(source.errorText, DEFAULT_COMFY_BASE.errorText),
    borderColor: sanitizeColor(source.borderColor, DEFAULT_COMFY_BASE.borderColor),
    barShadow: sanitizeCssColorLike(source.barShadow, DEFAULT_COMFY_BASE.barShadow),
  };
}

function sanitizeNodeSlot(value: unknown): NodeSlotTheme {
  const source = isRecord(value) ? value : {};
  const normalized = { ...DEFAULT_NODE_SLOT };
  for (const key of SLOT_KEYS) {
    normalized[key] = sanitizeColor(source[key], DEFAULT_NODE_SLOT[key]);
  }
  return normalized;
}

function hasV2Shape(source: Record<string, unknown>): boolean {
  return source.schemaVersion === 2 || (isRecord(source.uiMeta) && isRecord(source.litegraphBase));
}

function migrateLegacyState(source: Record<string, unknown>): ThemePanelState {
  const base = deepClone(DEFAULT_THEME_PANEL_STATE);

  const legacyFontColor = sanitizeColor(source.fontColor, base.uiMeta.contentTextColor);
  const contentTextColor = sanitizeColor(source.contentTextColor, legacyFontColor);
  const titleTextColor = sanitizeColor(source.titleTextColor, legacyFontColor);
  const ioTextColor = sanitizeColor(source.ioTextColor, legacyFontColor);
  const bgColor = sanitizeColor(source.bgColor, base.uiMeta.bgColor);
  const titleBgColor = sanitizeColor(source.titleBgColor, base.uiMeta.titleBgColor);
  const outlineColor = sanitizeColor(source.outlineColor, base.uiMeta.outlineColor);

  base.uiMeta = sanitizeUiMeta({
    ...base.uiMeta,
    fontFamily: source.fontFamily,
    bodyFontSize: source.bodyFontSize,
    titleFontSize: source.titleFontSize,
    textareaFontSize: source.textareaFontSize,
    contentTextColor,
    titleTextColor,
    ioTextColor,
    ioTextSize: source.ioTextSize,
    slotPointSize: source.slotPointSize,
    bgColor,
    titleBgColor,
    outlineColor,
    outlineEffect: source.outlineEffect,
    activePresetId: null,
  });

  base.litegraphBase = sanitizeLitegraphBase({
    ...base.litegraphBase,
    NODE_TEXT_SIZE: source.bodyFontSize,
    NODE_SUBTEXT_SIZE: source.textareaFontSize,
    NODE_TEXT_COLOR: contentTextColor,
    NODE_TITLE_COLOR: titleTextColor,
    NODE_SELECTED_TITLE_COLOR: titleTextColor,
    NODE_DEFAULT_BGCOLOR: bgColor,
    NODE_DEFAULT_COLOR: titleBgColor,
    NODE_BOX_OUTLINE_COLOR: outlineColor,
    WIDGET_BGCOLOR: bgColor,
    WIDGET_OUTLINE_COLOR: outlineColor,
    WIDGET_TEXT_COLOR: contentTextColor,
    WIDGET_SECONDARY_TEXT_COLOR: ioTextColor,
    LINK_COLOR: outlineColor,
  });

  base.comfyBase = sanitizeComfyBase({
    ...base.comfyBase,
    fgColor: contentTextColor,
    bgColor,
    menuBg: titleBgColor,
    inputText: contentTextColor,
  });

  return base;
}

export function sanitizeThemePreset(value: unknown, fallbackIndex = 0): ThemePreset | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = sanitizePresetId(value.id, `preset_${fallbackIndex + 1}`);
  const name = sanitizePresetName(value.name);
  const snapshotSource = isRecord(value.snapshot) ? value.snapshot : value;

  const snapshot: ThemePresetSnapshot = {
    uiMeta: sanitizeUiMeta(snapshotSource.uiMeta),
    litegraphBase: sanitizeLitegraphBase(snapshotSource.litegraphBase),
    comfyBase: sanitizeComfyBase(snapshotSource.comfyBase),
    nodeSlot: sanitizeNodeSlot(snapshotSource.nodeSlot),
  };

  return { id, name, snapshot };
}

function sanitizeCustomPresets(value: unknown): ThemePreset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const sanitized: ThemePreset[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const preset = sanitizeThemePreset(value[index], index);
    if (!preset || seen.has(preset.id)) {
      continue;
    }
    seen.add(preset.id);
    sanitized.push(preset);
  }

  return sanitized;
}

export function sanitizeThemeState(value: unknown): ThemePanelState {
  const source = isRecord(value) ? value : {};
  const seed = hasV2Shape(source) ? source : migrateLegacyState(source);
  const seedRecord = isRecord(seed) ? seed : {};

  const uiMeta = sanitizeUiMeta(seedRecord.uiMeta);
  const litegraphBase = sanitizeLitegraphBase(seedRecord.litegraphBase);
  const comfyBase = sanitizeComfyBase(seedRecord.comfyBase);
  const nodeSlot = sanitizeNodeSlot(seedRecord.nodeSlot);
  const presetsRecord = isRecord(seedRecord.presets) ? seedRecord.presets : {};
  const customPresets = sanitizeCustomPresets(presetsRecord.custom);

  return {
    schemaVersion: 2,
    uiMeta,
    litegraphBase: {
      ...litegraphBase,
      NODE_TEXT_SIZE: uiMeta.bodyFontSize,
      NODE_SUBTEXT_SIZE: clampInt(
        litegraphBase.NODE_SUBTEXT_SIZE,
        8,
        48,
        uiMeta.textareaFontSize,
      ),
      NODE_TEXT_COLOR: ensureReadableColor(
        litegraphBase.NODE_TEXT_COLOR,
        litegraphBase.NODE_DEFAULT_BGCOLOR,
        uiMeta.contentTextColor,
      ),
      NODE_TITLE_COLOR: ensureReadableColor(
        litegraphBase.NODE_TITLE_COLOR,
        litegraphBase.NODE_DEFAULT_COLOR,
        uiMeta.titleTextColor,
      ),
      WIDGET_TEXT_COLOR: ensureReadableColor(
        litegraphBase.WIDGET_TEXT_COLOR,
        litegraphBase.WIDGET_BGCOLOR,
        uiMeta.contentTextColor,
      ),
    },
    comfyBase,
    nodeSlot,
    presets: {
      custom: customPresets,
    },
  };
}

export function serializeThemeState(state: ThemePanelState): string {
  return JSON.stringify(sanitizeThemeState(state));
}

export function deserializeThemeState(raw: unknown): ThemePanelState {
  if (typeof raw !== "string" || !raw.trim()) {
    return deepClone(DEFAULT_THEME_PANEL_STATE);
  }

  try {
    return sanitizeThemeState(JSON.parse(raw));
  } catch {
    return deepClone(DEFAULT_THEME_PANEL_STATE);
  }
}

export function toPresetSnapshot(state: ThemePanelState): ThemePresetSnapshot {
  const normalized = sanitizeThemeState(state);
  return {
    uiMeta: { ...normalized.uiMeta, activePresetId: null },
    litegraphBase: { ...normalized.litegraphBase },
    comfyBase: { ...normalized.comfyBase },
    nodeSlot: { ...normalized.nodeSlot },
  };
}

export function applyPresetSnapshot(
  state: ThemePanelState,
  snapshot: ThemePresetSnapshot,
  presetId: string,
): ThemePanelState {
  const normalized = sanitizeThemeState(state);
  const applied: ThemePanelState = {
    ...normalized,
    uiMeta: sanitizeUiMeta({ ...snapshot.uiMeta, activePresetId: presetId }),
    litegraphBase: sanitizeLitegraphBase(snapshot.litegraphBase),
    comfyBase: sanitizeComfyBase(snapshot.comfyBase),
    nodeSlot: sanitizeNodeSlot(snapshot.nodeSlot),
  };
  return sanitizeThemeState(applied);
}

function toPresetId(name: string): string {
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44);
  if (!sanitized) {
    return "custom-preset";
  }
  return `custom-${sanitized}`;
}

export function saveCustomPreset(state: ThemePanelState, name: string): ThemePanelState {
  const normalized = sanitizeThemeState(state);
  const presetName = sanitizePresetName(name);
  const baseId = toPresetId(presetName);

  const existingIds = new Set(normalized.presets.custom.map((preset) => preset.id));
  let candidateId = baseId;
  let suffix = 2;
  while (existingIds.has(candidateId)) {
    candidateId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const preset: ThemePreset = {
    id: candidateId,
    name: presetName,
    snapshot: toPresetSnapshot(normalized),
  };

  return sanitizeThemeState({
    ...normalized,
    uiMeta: {
      ...normalized.uiMeta,
      activePresetId: preset.id,
    },
    presets: {
      custom: [...normalized.presets.custom, preset],
    },
  });
}

export function removeCustomPreset(state: ThemePanelState, presetId: string): ThemePanelState {
  const normalized = sanitizeThemeState(state);
  const nextCustom = normalized.presets.custom.filter((preset) => preset.id !== presetId);

  return sanitizeThemeState({
    ...normalized,
    uiMeta: {
      ...normalized.uiMeta,
      activePresetId: normalized.uiMeta.activePresetId === presetId ? null : normalized.uiMeta.activePresetId,
    },
    presets: {
      custom: nextCustom,
    },
  });
}

export function listPresetOptions(state: ThemePanelState): Array<{ id: string; name: string; source: "builtin" | "custom" }> {
  const normalized = sanitizeThemeState(state);
  const builtins = BUILTIN_PRESETS.map((preset) => ({ id: preset.id, name: preset.name, source: "builtin" as const }));
  const custom = normalized.presets.custom.map((preset) => ({ id: preset.id, name: preset.name, source: "custom" as const }));
  return [...builtins, ...custom];
}

export function resolvePreset(state: ThemePanelState, presetId: string): ThemePreset | null {
  for (const preset of BUILTIN_PRESETS) {
    if (preset.id === presetId) {
      return preset;
    }
  }

  for (const preset of sanitizeThemeState(state).presets.custom) {
    if (preset.id === presetId) {
      return preset;
    }
  }

  return null;
}

export function serializeCustomPresets(state: ThemePanelState): string {
  const normalized = sanitizeThemeState(state);
  const payload: PresetCollectionPayload = {
    schemaVersion: 2,
    presets: normalized.presets.custom,
  };
  return JSON.stringify(payload, null, 2);
}

export function importCustomPresets(raw: unknown): ThemePreset[] {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const presetArray =
      isRecord(parsed) && Array.isArray(parsed.presets)
        ? parsed.presets
        : Array.isArray(parsed)
          ? parsed
          : [];

    return sanitizeCustomPresets(presetArray);
  } catch {
    return [];
  }
}

export function mergeImportedPresets(state: ThemePanelState, imported: ThemePreset[]): ThemePanelState {
  const normalized = sanitizeThemeState(state);
  const merged: ThemePreset[] = [...normalized.presets.custom];
  const existing = new Set(merged.map((preset) => preset.id));

  for (const preset of imported) {
    let candidate = preset;
    let counter = 2;
    while (existing.has(candidate.id)) {
      candidate = {
        ...candidate,
        id: `${preset.id}-${counter}`,
      };
      counter += 1;
    }

    existing.add(candidate.id);
    merged.push(candidate);
  }

  return sanitizeThemeState({
    ...normalized,
    presets: {
      custom: merged,
    },
  });
}
