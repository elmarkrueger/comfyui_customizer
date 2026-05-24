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

export type PresetCategoryId =
  | "classic-elegant"
  | "nature-earth"
  | "modern-tech"
  | "pastel-soft"
  | "vibrant-bold"
  | "dark-lucifer"
  | "legacy"
  | "custom";

export interface PresetCategoryDefinition {
  id: PresetCategoryId;
  label: string;
}

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
  category: PresetCategoryId;
  snapshot: ThemePresetSnapshot;
}

export interface PresetOption {
  id: string;
  name: string;
  source: "builtin" | "custom";
  category: PresetCategoryId;
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

export const PRESET_CATEGORY_DEFINITIONS: PresetCategoryDefinition[] = [
  { id: "classic-elegant", label: "Classic & Elegant" },
  { id: "nature-earth", label: "Nature & Earth" },
  { id: "modern-tech", label: "Modern & Tech" },
  { id: "pastel-soft", label: "Pastel & Soft" },
  { id: "vibrant-bold", label: "Vibrant & Bold" },
  { id: "dark-lucifer", label: "Dark & Lucifer" },
  { id: "legacy", label: "Legacy" },
  { id: "custom", label: "Custom" },
];

const PRESET_CATEGORY_IDS = new Set<PresetCategoryId>(
  PRESET_CATEGORY_DEFINITIONS.map((category) => category.id),
);

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

interface PalettePresetDefinition {
  id: string;
  name: string;
  category: PresetCategoryId;
  colors: [string, string, string, string, string];
}

function buildPalettePreset(definition: PalettePresetDefinition): ThemePreset {
  const [surface, header, panel, accent, accentAlt] = definition.colors;
  const contentTextColor = ensureReadableColor(accentAlt, surface, DEFAULT_THEME_UI_META.contentTextColor);
  const titleTextColor = ensureReadableColor(contentTextColor, header, contentTextColor);
  const ioTextColor = ensureReadableColor(accent, surface, contentTextColor);

  return {
    id: definition.id,
    name: definition.name,
    category: definition.category,
    snapshot: {
      uiMeta: {
        ...DEFAULT_THEME_UI_META,
        contentTextColor,
        titleTextColor,
        ioTextColor,
        bgColor: surface,
        titleBgColor: header,
        outlineColor: accent,
        activePresetId: definition.id,
      },
      litegraphBase: {
        ...DEFAULT_LITEGRAPH_BASE,
        NODE_TITLE_COLOR: titleTextColor,
        NODE_TEXT_COLOR: contentTextColor,
        NODE_DEFAULT_COLOR: header,
        NODE_DEFAULT_BGCOLOR: surface,
        NODE_DEFAULT_BOXCOLOR: panel,
        NODE_BOX_OUTLINE_COLOR: accent,
        WIDGET_BGCOLOR: panel,
        WIDGET_OUTLINE_COLOR: accent,
        WIDGET_TEXT_COLOR: contentTextColor,
        WIDGET_SECONDARY_TEXT_COLOR: ioTextColor,
        LINK_COLOR: accent,
        EVENT_LINK_COLOR: accentAlt,
        CONNECTING_LINK_COLOR: accent,
        BADGE_FG_COLOR: titleTextColor,
        BADGE_BG_COLOR: header,
      },
      comfyBase: {
        ...DEFAULT_COMFY_BASE,
        fgColor: contentTextColor,
        bgColor: surface,
        menuBg: header,
        inputBg: panel,
        inputText: contentTextColor,
        descriptionText: ioTextColor,
        borderColor: accent,
      },
      nodeSlot: {
        ...DEFAULT_NODE_SLOT,
        IMAGE: accent,
        LATENT: accentAlt,
        MODEL: panel,
        CLIP: accentAlt,
        CONTROL_NET: accent,
        GUIDER: accentAlt,
      },
    },
  };
}

const CURATED_NODE_PRESET_PALETTES: PalettePresetDefinition[] = [
  {
    id: "builtin-classic-midnight-gold",
    name: "Midnight Gold",
    category: "classic-elegant",
    colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#F9A03F"],
  },
  {
    id: "builtin-classic-monochrome-slate",
    name: "Monochrome Slate",
    category: "classic-elegant",
    colors: ["#121212", "#282828", "#3F3F3F", "#575757", "#717171"],
  },
  {
    id: "builtin-classic-executive-blue",
    name: "Executive Blue",
    category: "classic-elegant",
    colors: ["#003049", "#1D4360", "#2F5F80", "#F77F00", "#FCBF49"],
  },
  {
    id: "builtin-classic-chocolate-truffle",
    name: "Chocolate Truffle",
    category: "classic-elegant",
    colors: ["#2C1E16", "#3E2723", "#5D4037", "#D7CCC8", "#E6C8A7"],
  },
  {
    id: "builtin-classic-yacht-club",
    name: "Yacht Club",
    category: "classic-elegant",
    colors: ["#1B263B", "#415A77", "#778DA9", "#E0E1DD", "#D8C3A5"],
  },
  {
    id: "builtin-classic-quiet-luxury",
    name: "Quiet Luxury",
    category: "classic-elegant",
    colors: ["#2C2B29", "#403D39", "#8E8D8A", "#CCC5B9", "#F4DFD0"],
  },
  {
    id: "builtin-nature-forest-retreat",
    name: "Forest Retreat",
    category: "nature-earth",
    colors: ["#2D4A22", "#4A6B3A", "#5E7A48", "#8A9A5B", "#E1D89F"],
  },
  {
    id: "builtin-nature-terracotta-warmth",
    name: "Terracotta Warmth",
    category: "nature-earth",
    colors: ["#3D405B", "#4A506D", "#5E647A", "#E07A5F", "#F2CC8F"],
  },
  {
    id: "builtin-nature-ocean-breeze",
    name: "Ocean Breeze",
    category: "nature-earth",
    colors: ["#03045E", "#023E8A", "#0077B6", "#00B4D8", "#90E0EF"],
  },
  {
    id: "builtin-nature-mossy-cavern",
    name: "Mossy Cavern",
    category: "nature-earth",
    colors: ["#1A2421", "#2C3E35", "#3E574B", "#7E998A", "#C2D5C4"],
  },
  {
    id: "builtin-nature-desert-illusion",
    name: "Desert Illusion",
    category: "nature-earth",
    colors: ["#2D2622", "#4A3F35", "#8B5F4D", "#D8A48F", "#A3B19B"],
  },
  {
    id: "builtin-nature-olive-grove",
    name: "Olive Grove",
    category: "nature-earth",
    colors: ["#283021", "#3B4731", "#5C6A4E", "#9AAB89", "#DCE3D0"],
  },
  {
    id: "builtin-modern-cyber-neon",
    name: "Cyber Neon",
    category: "modern-tech",
    colors: ["#050505", "#1B1B1B", "#252525", "#7209B7", "#4CC9F0"],
  },
  {
    id: "builtin-modern-hacker-green",
    name: "Hacker Green",
    category: "modern-tech",
    colors: ["#0D1B2A", "#1B263B", "#27374F", "#415A77", "#E0E1DD"],
  },
  {
    id: "builtin-modern-tech-purple",
    name: "Tech Purple",
    category: "modern-tech",
    colors: ["#10002B", "#240046", "#3C096C", "#5A189A", "#7B2CBF"],
  },
  {
    id: "builtin-modern-neon-noir",
    name: "Neon Noir",
    category: "modern-tech",
    colors: ["#090909", "#151515", "#222222", "#39FF14", "#BF40FF"],
  },
  {
    id: "builtin-modern-electric-fusion",
    name: "Electric Fusion",
    category: "modern-tech",
    colors: ["#0B0C10", "#141B2D", "#1F2F54", "#2471A3", "#00F0FF"],
  },
  {
    id: "builtin-modern-technicolor-dream",
    name: "Technicolor Dream",
    category: "modern-tech",
    colors: ["#100C1A", "#1C142B", "#2A1D3D", "#FF00FF", "#7FFF00"],
  },
  {
    id: "builtin-pastel-cotton-candy-node",
    name: "Cotton Candy Node",
    category: "pastel-soft",
    colors: ["#2B2735", "#3A3448", "#4A435B", "#CDB4DB", "#A2D2FF"],
  },
  {
    id: "builtin-pastel-muted-spring-node",
    name: "Muted Spring Node",
    category: "pastel-soft",
    colors: ["#2F2A33", "#413846", "#5A4B62", "#D1B3C4", "#E8C2CA"],
  },
  {
    id: "builtin-pastel-sand-stone-node",
    name: "Sand & Stone Node",
    category: "pastel-soft",
    colors: ["#2E2A26", "#3C362F", "#4E473F", "#D5BDAF", "#EDF6F9"],
  },
  {
    id: "builtin-pastel-lavender-fields",
    name: "Lavender Fields",
    category: "pastel-soft",
    colors: ["#282634", "#3D394E", "#615A7A", "#BCA0DC", "#F4E0FF"],
  },
  {
    id: "builtin-pastel-morning-dew",
    name: "Morning Dew",
    category: "pastel-soft",
    colors: ["#212E2E", "#304445", "#476161", "#89B5AF", "#B2D8D8"],
  },
  {
    id: "builtin-pastel-cotton-candy-sky",
    name: "Cotton Candy Sky",
    category: "pastel-soft",
    colors: ["#252131", "#363247", "#524B6B", "#FFB6C1", "#AEEEEE"],
  },
  {
    id: "builtin-vibrant-sunset-pop-node",
    name: "Sunset Pop Node",
    category: "vibrant-bold",
    colors: ["#1E1F29", "#2A2D3A", "#373B4C", "#FF9F1C", "#8AC926"],
  },
  {
    id: "builtin-vibrant-retro-wave-node",
    name: "Retro Wave Node",
    category: "vibrant-bold",
    colors: ["#181428", "#231A3A", "#32224F", "#F72585", "#4CC9F0"],
  },
  {
    id: "builtin-vibrant-citric-node",
    name: "Vibrant Citric Node",
    category: "vibrant-bold",
    colors: ["#1E2422", "#2B3632", "#3A4A45", "#FF9F1C", "#2EC4B6"],
  },
  {
    id: "builtin-vibrant-mango-popsicle",
    name: "Mango Popsicle",
    category: "vibrant-bold",
    colors: ["#2B1A10", "#4A2711", "#823A12", "#FF7F11", "#FFD166"],
  },
  {
    id: "builtin-vibrant-fireworks",
    name: "Fireworks",
    category: "vibrant-bold",
    colors: ["#1C0B11", "#3B111E", "#6B1426", "#D90429", "#FF9F1C"],
  },
  {
    id: "builtin-vibrant-tropical-punch",
    name: "Tropical Punch",
    category: "vibrant-bold",
    colors: ["#24101A", "#451B2D", "#6F2040", "#FF477E", "#FFCA3A"],
  },
  {
    id: "builtin-dark-lucifer-wrath",
    name: "Lucifer's Wrath",
    category: "dark-lucifer",
    colors: ["#000000", "#1D0B0B", "#171414", "#FF1A1A", "#FF5D00"],
  },
  {
    id: "builtin-dark-lucifer-hellfire",
    name: "Hellfire",
    category: "dark-lucifer",
    colors: ["#121212", "#231B16", "#252525", "#FF7700", "#FFB700"],
  },
  {
    id: "builtin-dark-lucifer-abyssal-ash",
    name: "Abyssal Ash",
    category: "dark-lucifer",
    colors: ["#1C1C1C", "#2D2D2D", "#333333", "#CC0000", "#E65C00"],
  },
  {
    id: "builtin-dark-lucifer-brimstone",
    name: "Brimstone",
    category: "dark-lucifer",
    colors: ["#151515", "#2C221A", "#2C2C2C", "#FFD000", "#FF6200"],
  },
  {
    id: "builtin-dark-lucifer-obsidian-eclipse",
    name: "Obsidian Eclipse",
    category: "dark-lucifer",
    colors: ["#080808", "#1A1A1A", "#242424", "#FF2A4B", "#FF007F"],
  },
  {
    id: "builtin-dark-lucifer-nether-portal",
    name: "Nether Portal",
    category: "dark-lucifer",
    colors: ["#1B1B1B", "#2A1D33", "#2C2C2C", "#E0115F", "#FF4500"],
  },
];

export const BUILTIN_PRESETS: ThemePreset[] = [
  {
    id: "builtin-balanced-dark",
    name: "Balanced Dark",
    category: "legacy",
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
    category: "legacy",
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
    category: "legacy",
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
  ...CURATED_NODE_PRESET_PALETTES.map((definition) => buildPalettePreset(definition)),
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

function sanitizePresetId(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (PRESET_ID_RE.test(text)) {
    return text;
  }
  return fallback;
}

function sanitizePresetCategory(value: unknown, fallback: PresetCategoryId): PresetCategoryId {
  const text = typeof value === "string" ? value.trim() as PresetCategoryId : fallback;
  if (PRESET_CATEGORY_IDS.has(text)) {
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

export function sanitizeThemePreset(
  value: unknown,
  fallbackIndex = 0,
  fallbackCategory: PresetCategoryId = "custom",
): ThemePreset | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = sanitizePresetId(value.id, `preset_${fallbackIndex + 1}`);
  const name = sanitizePresetName(value.name);
  const category = sanitizePresetCategory(value.category, fallbackCategory);
  const snapshotSource = isRecord(value.snapshot) ? value.snapshot : value;

  const snapshot: ThemePresetSnapshot = {
    uiMeta: sanitizeUiMeta(snapshotSource.uiMeta),
    litegraphBase: sanitizeLitegraphBase(snapshotSource.litegraphBase),
    comfyBase: sanitizeComfyBase(snapshotSource.comfyBase),
    nodeSlot: sanitizeNodeSlot(snapshotSource.nodeSlot),
  };

  return { id, name, category, snapshot };
}

function sanitizeCustomPresets(value: unknown): ThemePreset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const sanitized: ThemePreset[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const preset = sanitizeThemePreset(value[index], index, "custom");
    if (!preset || seen.has(preset.id)) {
      continue;
    }
    seen.add(preset.id);
    sanitized.push({ ...preset, category: "custom" });
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
    category: "custom",
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

export function listPresetCategories(state: ThemePanelState): PresetCategoryDefinition[] {
  const categoryById = new Set(listPresetOptions(state).map((preset) => preset.category));
  return PRESET_CATEGORY_DEFINITIONS.filter((category) => {
    if (category.id === "custom") {
      return true;
    }
    return categoryById.has(category.id);
  });
}

export function listPresetOptions(
  state: ThemePanelState,
  category?: PresetCategoryId,
): PresetOption[] {
  const normalized = sanitizeThemeState(state);
  const builtins = BUILTIN_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    source: "builtin" as const,
    category: preset.category,
  }));
  const custom = normalized.presets.custom.map((preset) => ({
    id: preset.id,
    name: preset.name,
    source: "custom" as const,
    category: sanitizePresetCategory(preset.category, "custom"),
  }));
  const allOptions = [...builtins, ...custom];
  if (!category) {
    return allOptions;
  }
  return allOptions.filter((preset) => preset.category === category);
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
    let candidate = { ...preset, category: "custom" as const };
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
