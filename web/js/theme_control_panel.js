import { app } from "../../../scripts/app.js";
import { h as defineComponent, m as ref, j as onMounted, o as onBeforeUnmount, l as openBlock, e as createElementBlock, b as createBaseVNode, i as normalizeStyle, w as withDirectives, q as vModelSelect, F as Fragment, p as renderList, t as toDisplayString, d as createCommentVNode, s as vModelText, x as withKeys, y as withModifiers, c as computed, _ as _export_sfc, a as createApp } from "./_plugin-vue_export-helper-83BykQa1.js";
import { api } from "../../../scripts/api.js";
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const FAMILY_RE$1 = /^[a-zA-Z0-9 _-]{1,80}$/;
const SIMPLE_CSS_COLOR_RE = /^[#(),.%\sa-zA-Z0-9-]{1,96}$/;
const PRESET_ID_RE = /^[a-z0-9_-]{1,48}$/;
const MIN_CONTRAST_RATIO = 2.2;
const PRESET_CATEGORY_DEFINITIONS = [
  { id: "classic-elegant", label: "Classic & Elegant" },
  { id: "nature-earth", label: "Nature & Earth" },
  { id: "modern-tech", label: "Modern & Tech" },
  { id: "pastel-soft", label: "Pastel & Soft" },
  { id: "vibrant-bold", label: "Vibrant & Bold" },
  { id: "dark-lucifer", label: "Dark & Lucifer" },
  { id: "legacy", label: "Legacy" },
  { id: "custom", label: "Custom" }
];
const PRESET_CATEGORY_IDS = new Set(
  PRESET_CATEGORY_DEFINITIONS.map((category) => category.id)
);
const SLOT_KEYS = [
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
  "GUIDER"
];
const DEFAULT_THEME_UI_META = {
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
  activePresetId: null
};
const DEFAULT_LITEGRAPH_BASE = {
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
  BADGE_BG_COLOR: "#2b2b2b"
};
const DEFAULT_COMFY_BASE = {
  fgColor: "#f2f2f2",
  bgColor: "#202020",
  menuBg: "#2a2a2a",
  inputBg: "#1f1f1f",
  inputText: "#f2f2f2",
  descriptionText: "#a9a9a9",
  errorText: "#ff5f5f",
  borderColor: "#3a3a3a",
  barShadow: "rgba(0, 0, 0, 0.4)"
};
const DEFAULT_NODE_SLOT = {
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
  GUIDER: "#9fd8ff"
};
const DEFAULT_THEME_PANEL_STATE = {
  schemaVersion: 2,
  uiMeta: { ...DEFAULT_THEME_UI_META },
  litegraphBase: { ...DEFAULT_LITEGRAPH_BASE },
  comfyBase: { ...DEFAULT_COMFY_BASE },
  nodeSlot: { ...DEFAULT_NODE_SLOT },
  presets: {
    custom: []
  }
};
function buildPalettePreset(definition) {
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
        activePresetId: definition.id
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
        BADGE_BG_COLOR: header
      },
      comfyBase: {
        ...DEFAULT_COMFY_BASE,
        fgColor: contentTextColor,
        bgColor: surface,
        menuBg: header,
        inputBg: panel,
        inputText: contentTextColor,
        descriptionText: ioTextColor,
        borderColor: accent
      },
      nodeSlot: {
        ...DEFAULT_NODE_SLOT,
        IMAGE: accent,
        LATENT: accentAlt,
        MODEL: panel,
        CLIP: accentAlt,
        CONTROL_NET: accent,
        GUIDER: accentAlt
      }
    }
  };
}
const CURATED_NODE_PRESET_PALETTES = [
  {
    id: "builtin-classic-midnight-gold",
    name: "Midnight Gold",
    category: "classic-elegant",
    colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#F9A03F"]
  },
  {
    id: "builtin-classic-monochrome-slate",
    name: "Monochrome Slate",
    category: "classic-elegant",
    colors: ["#121212", "#282828", "#3F3F3F", "#575757", "#717171"]
  },
  {
    id: "builtin-classic-executive-blue",
    name: "Executive Blue",
    category: "classic-elegant",
    colors: ["#003049", "#1D4360", "#2F5F80", "#F77F00", "#FCBF49"]
  },
  {
    id: "builtin-classic-chocolate-truffle",
    name: "Chocolate Truffle",
    category: "classic-elegant",
    colors: ["#2C1E16", "#3E2723", "#5D4037", "#D7CCC8", "#E6C8A7"]
  },
  {
    id: "builtin-classic-yacht-club",
    name: "Yacht Club",
    category: "classic-elegant",
    colors: ["#1B263B", "#415A77", "#778DA9", "#E0E1DD", "#D8C3A5"]
  },
  {
    id: "builtin-classic-quiet-luxury",
    name: "Quiet Luxury",
    category: "classic-elegant",
    colors: ["#2C2B29", "#403D39", "#8E8D8A", "#CCC5B9", "#F4DFD0"]
  },
  {
    id: "builtin-nature-forest-retreat",
    name: "Forest Retreat",
    category: "nature-earth",
    colors: ["#2D4A22", "#4A6B3A", "#5E7A48", "#8A9A5B", "#E1D89F"]
  },
  {
    id: "builtin-nature-terracotta-warmth",
    name: "Terracotta Warmth",
    category: "nature-earth",
    colors: ["#3D405B", "#4A506D", "#5E647A", "#E07A5F", "#F2CC8F"]
  },
  {
    id: "builtin-nature-ocean-breeze",
    name: "Ocean Breeze",
    category: "nature-earth",
    colors: ["#03045E", "#023E8A", "#0077B6", "#00B4D8", "#90E0EF"]
  },
  {
    id: "builtin-nature-mossy-cavern",
    name: "Mossy Cavern",
    category: "nature-earth",
    colors: ["#1A2421", "#2C3E35", "#3E574B", "#7E998A", "#C2D5C4"]
  },
  {
    id: "builtin-nature-desert-illusion",
    name: "Desert Illusion",
    category: "nature-earth",
    colors: ["#2D2622", "#4A3F35", "#8B5F4D", "#D8A48F", "#A3B19B"]
  },
  {
    id: "builtin-nature-olive-grove",
    name: "Olive Grove",
    category: "nature-earth",
    colors: ["#283021", "#3B4731", "#5C6A4E", "#9AAB89", "#DCE3D0"]
  },
  {
    id: "builtin-modern-cyber-neon",
    name: "Cyber Neon",
    category: "modern-tech",
    colors: ["#050505", "#1B1B1B", "#252525", "#7209B7", "#4CC9F0"]
  },
  {
    id: "builtin-modern-hacker-green",
    name: "Hacker Green",
    category: "modern-tech",
    colors: ["#0D1B2A", "#1B263B", "#27374F", "#415A77", "#E0E1DD"]
  },
  {
    id: "builtin-modern-tech-purple",
    name: "Tech Purple",
    category: "modern-tech",
    colors: ["#10002B", "#240046", "#3C096C", "#5A189A", "#7B2CBF"]
  },
  {
    id: "builtin-modern-neon-noir",
    name: "Neon Noir",
    category: "modern-tech",
    colors: ["#090909", "#151515", "#222222", "#39FF14", "#BF40FF"]
  },
  {
    id: "builtin-modern-electric-fusion",
    name: "Electric Fusion",
    category: "modern-tech",
    colors: ["#0B0C10", "#141B2D", "#1F2F54", "#2471A3", "#00F0FF"]
  },
  {
    id: "builtin-modern-technicolor-dream",
    name: "Technicolor Dream",
    category: "modern-tech",
    colors: ["#100C1A", "#1C142B", "#2A1D3D", "#FF00FF", "#7FFF00"]
  },
  {
    id: "builtin-pastel-cotton-candy-node",
    name: "Cotton Candy Node",
    category: "pastel-soft",
    colors: ["#2B2735", "#3A3448", "#4A435B", "#CDB4DB", "#A2D2FF"]
  },
  {
    id: "builtin-pastel-muted-spring-node",
    name: "Muted Spring Node",
    category: "pastel-soft",
    colors: ["#2F2A33", "#413846", "#5A4B62", "#D1B3C4", "#E8C2CA"]
  },
  {
    id: "builtin-pastel-sand-stone-node",
    name: "Sand & Stone Node",
    category: "pastel-soft",
    colors: ["#2E2A26", "#3C362F", "#4E473F", "#D5BDAF", "#EDF6F9"]
  },
  {
    id: "builtin-pastel-lavender-fields",
    name: "Lavender Fields",
    category: "pastel-soft",
    colors: ["#282634", "#3D394E", "#615A7A", "#BCA0DC", "#F4E0FF"]
  },
  {
    id: "builtin-pastel-morning-dew",
    name: "Morning Dew",
    category: "pastel-soft",
    colors: ["#212E2E", "#304445", "#476161", "#89B5AF", "#B2D8D8"]
  },
  {
    id: "builtin-pastel-cotton-candy-sky",
    name: "Cotton Candy Sky",
    category: "pastel-soft",
    colors: ["#252131", "#363247", "#524B6B", "#FFB6C1", "#AEEEEE"]
  },
  {
    id: "builtin-vibrant-sunset-pop-node",
    name: "Sunset Pop Node",
    category: "vibrant-bold",
    colors: ["#1E1F29", "#2A2D3A", "#373B4C", "#FF9F1C", "#8AC926"]
  },
  {
    id: "builtin-vibrant-retro-wave-node",
    name: "Retro Wave Node",
    category: "vibrant-bold",
    colors: ["#181428", "#231A3A", "#32224F", "#F72585", "#4CC9F0"]
  },
  {
    id: "builtin-vibrant-citric-node",
    name: "Vibrant Citric Node",
    category: "vibrant-bold",
    colors: ["#1E2422", "#2B3632", "#3A4A45", "#FF9F1C", "#2EC4B6"]
  },
  {
    id: "builtin-vibrant-mango-popsicle",
    name: "Mango Popsicle",
    category: "vibrant-bold",
    colors: ["#2B1A10", "#4A2711", "#823A12", "#FF7F11", "#FFD166"]
  },
  {
    id: "builtin-vibrant-fireworks",
    name: "Fireworks",
    category: "vibrant-bold",
    colors: ["#1C0B11", "#3B111E", "#6B1426", "#D90429", "#FF9F1C"]
  },
  {
    id: "builtin-vibrant-tropical-punch",
    name: "Tropical Punch",
    category: "vibrant-bold",
    colors: ["#24101A", "#451B2D", "#6F2040", "#FF477E", "#FFCA3A"]
  },
  {
    id: "builtin-dark-lucifer-wrath",
    name: "Lucifer's Wrath",
    category: "dark-lucifer",
    colors: ["#000000", "#1D0B0B", "#171414", "#FF1A1A", "#FF5D00"]
  },
  {
    id: "builtin-dark-lucifer-hellfire",
    name: "Hellfire",
    category: "dark-lucifer",
    colors: ["#121212", "#231B16", "#252525", "#FF7700", "#FFB700"]
  },
  {
    id: "builtin-dark-lucifer-abyssal-ash",
    name: "Abyssal Ash",
    category: "dark-lucifer",
    colors: ["#1C1C1C", "#2D2D2D", "#333333", "#CC0000", "#E65C00"]
  },
  {
    id: "builtin-dark-lucifer-brimstone",
    name: "Brimstone",
    category: "dark-lucifer",
    colors: ["#151515", "#2C221A", "#2C2C2C", "#FFD000", "#FF6200"]
  },
  {
    id: "builtin-dark-lucifer-obsidian-eclipse",
    name: "Obsidian Eclipse",
    category: "dark-lucifer",
    colors: ["#080808", "#1A1A1A", "#242424", "#FF2A4B", "#FF007F"]
  },
  {
    id: "builtin-dark-lucifer-nether-portal",
    name: "Nether Portal",
    category: "dark-lucifer",
    colors: ["#1B1B1B", "#2A1D33", "#2C2C2C", "#E0115F", "#FF4500"]
  }
];
const BUILTIN_PRESETS = [
  {
    id: "builtin-balanced-dark",
    name: "Balanced Dark",
    category: "legacy",
    snapshot: {
      uiMeta: { ...DEFAULT_THEME_UI_META, activePresetId: "builtin-balanced-dark" },
      litegraphBase: { ...DEFAULT_LITEGRAPH_BASE },
      comfyBase: { ...DEFAULT_COMFY_BASE },
      nodeSlot: { ...DEFAULT_NODE_SLOT }
    }
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
        activePresetId: "builtin-high-contrast"
      },
      litegraphBase: {
        ...DEFAULT_LITEGRAPH_BASE,
        NODE_TITLE_COLOR: "#ffffff",
        NODE_TEXT_COLOR: "#f1f1f1",
        NODE_DEFAULT_BGCOLOR: "#111111",
        NODE_DEFAULT_COLOR: "#1d1d1d",
        NODE_BOX_OUTLINE_COLOR: "#2ee6a7",
        WIDGET_TEXT_COLOR: "#f4f4f4",
        WIDGET_SECONDARY_TEXT_COLOR: "#bbbbbb"
      },
      comfyBase: {
        ...DEFAULT_COMFY_BASE,
        bgColor: "#111111",
        menuBg: "#1a1a1a",
        borderColor: "#2f2f2f"
      },
      nodeSlot: {
        ...DEFAULT_NODE_SLOT,
        MODEL: "#c5b2ff",
        CLIP: "#ffe650"
      }
    }
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
        activePresetId: "builtin-legacy-preview"
      },
      litegraphBase: {
        ...DEFAULT_LITEGRAPH_BASE,
        NODE_DEFAULT_BGCOLOR: "#242424",
        NODE_DEFAULT_COLOR: "#2f2f2f",
        NODE_BOX_OUTLINE_COLOR: "#00d18f"
      },
      comfyBase: { ...DEFAULT_COMFY_BASE },
      nodeSlot: { ...DEFAULT_NODE_SLOT }
    }
  },
  ...CURATED_NODE_PRESET_PALETTES.map((definition) => buildPalettePreset(definition))
];
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
function isRecord$1(value) {
  return typeof value === "object" && value !== null;
}
function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}
function srgbToLinear(value) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}
function relativeLuminance(hex) {
  const [red, green, blue] = hexToRgb(hex);
  const r = srgbToLinear(red);
  const g = srgbToLinear(green);
  const b = srgbToLinear(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(foregroundHex, backgroundHex) {
  const fg = relativeLuminance(foregroundHex);
  const bg = relativeLuminance(backgroundHex);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}
function ensureReadableColor(color, background, fallback) {
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
function clampInt(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(numeric)));
}
function sanitizeColor(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  return HEX_COLOR_RE.test(text) ? text : fallback;
}
function sanitizeCssColorLike(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  return SIMPLE_CSS_COLOR_RE.test(text) ? text : fallback;
}
function sanitizeFamily(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || !FAMILY_RE$1.test(text)) {
    return fallback;
  }
  return text;
}
function sanitizePresetId(value, fallback) {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (PRESET_ID_RE.test(text)) {
    return text;
  }
  return fallback;
}
function sanitizePresetCategory(value, fallback) {
  const text = typeof value === "string" ? value.trim() : fallback;
  if (PRESET_CATEGORY_IDS.has(text)) {
    return text;
  }
  return fallback;
}
function sanitizePresetName(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    return "Untitled Preset";
  }
  return text.slice(0, 60);
}
function sanitizeUiMeta(value) {
  const source = isRecord$1(value) ? value : {};
  const normalized = {
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
    activePresetId: typeof source.activePresetId === "string" && source.activePresetId.trim() ? sanitizePresetId(source.activePresetId, "") : null
  };
  const contentTextColor = ensureReadableColor(
    normalized.contentTextColor,
    normalized.bgColor,
    DEFAULT_THEME_UI_META.contentTextColor
  );
  const titleTextColor = ensureReadableColor(normalized.titleTextColor, normalized.titleBgColor, contentTextColor);
  const ioTextColor = ensureReadableColor(normalized.ioTextColor, normalized.bgColor, contentTextColor);
  return {
    ...normalized,
    contentTextColor,
    titleTextColor,
    ioTextColor
  };
}
function sanitizeLitegraphBase(value) {
  const source = isRecord$1(value) ? value : {};
  return {
    NODE_TITLE_COLOR: sanitizeColor(source.NODE_TITLE_COLOR, DEFAULT_LITEGRAPH_BASE.NODE_TITLE_COLOR),
    NODE_SELECTED_TITLE_COLOR: sanitizeColor(
      source.NODE_SELECTED_TITLE_COLOR,
      DEFAULT_LITEGRAPH_BASE.NODE_SELECTED_TITLE_COLOR
    ),
    NODE_TEXT_SIZE: clampInt(source.NODE_TEXT_SIZE, 8, 56, DEFAULT_LITEGRAPH_BASE.NODE_TEXT_SIZE),
    NODE_TEXT_COLOR: sanitizeColor(source.NODE_TEXT_COLOR, DEFAULT_LITEGRAPH_BASE.NODE_TEXT_COLOR),
    NODE_SUBTEXT_SIZE: clampInt(source.NODE_SUBTEXT_SIZE, 8, 48, DEFAULT_LITEGRAPH_BASE.NODE_SUBTEXT_SIZE),
    NODE_DEFAULT_COLOR: sanitizeColor(source.NODE_DEFAULT_COLOR, DEFAULT_LITEGRAPH_BASE.NODE_DEFAULT_COLOR),
    NODE_DEFAULT_BGCOLOR: sanitizeColor(source.NODE_DEFAULT_BGCOLOR, DEFAULT_LITEGRAPH_BASE.NODE_DEFAULT_BGCOLOR),
    NODE_DEFAULT_BOXCOLOR: sanitizeColor(source.NODE_DEFAULT_BOXCOLOR, DEFAULT_LITEGRAPH_BASE.NODE_DEFAULT_BOXCOLOR),
    NODE_BOX_OUTLINE_COLOR: sanitizeColor(
      source.NODE_BOX_OUTLINE_COLOR,
      DEFAULT_LITEGRAPH_BASE.NODE_BOX_OUTLINE_COLOR
    ),
    NODE_BYPASS_BGCOLOR: sanitizeColor(source.NODE_BYPASS_BGCOLOR, DEFAULT_LITEGRAPH_BASE.NODE_BYPASS_BGCOLOR),
    DEFAULT_SHADOW_COLOR: sanitizeCssColorLike(source.DEFAULT_SHADOW_COLOR, DEFAULT_LITEGRAPH_BASE.DEFAULT_SHADOW_COLOR),
    WIDGET_BGCOLOR: sanitizeColor(source.WIDGET_BGCOLOR, DEFAULT_LITEGRAPH_BASE.WIDGET_BGCOLOR),
    WIDGET_OUTLINE_COLOR: sanitizeColor(source.WIDGET_OUTLINE_COLOR, DEFAULT_LITEGRAPH_BASE.WIDGET_OUTLINE_COLOR),
    WIDGET_TEXT_COLOR: sanitizeColor(source.WIDGET_TEXT_COLOR, DEFAULT_LITEGRAPH_BASE.WIDGET_TEXT_COLOR),
    WIDGET_SECONDARY_TEXT_COLOR: sanitizeColor(
      source.WIDGET_SECONDARY_TEXT_COLOR,
      DEFAULT_LITEGRAPH_BASE.WIDGET_SECONDARY_TEXT_COLOR
    ),
    WIDGET_DISABLED_TEXT_COLOR: sanitizeColor(
      source.WIDGET_DISABLED_TEXT_COLOR,
      DEFAULT_LITEGRAPH_BASE.WIDGET_DISABLED_TEXT_COLOR
    ),
    LINK_COLOR: sanitizeColor(source.LINK_COLOR, DEFAULT_LITEGRAPH_BASE.LINK_COLOR),
    EVENT_LINK_COLOR: sanitizeColor(source.EVENT_LINK_COLOR, DEFAULT_LITEGRAPH_BASE.EVENT_LINK_COLOR),
    CONNECTING_LINK_COLOR: sanitizeColor(source.CONNECTING_LINK_COLOR, DEFAULT_LITEGRAPH_BASE.CONNECTING_LINK_COLOR),
    BADGE_FG_COLOR: sanitizeColor(source.BADGE_FG_COLOR, DEFAULT_LITEGRAPH_BASE.BADGE_FG_COLOR),
    BADGE_BG_COLOR: sanitizeColor(source.BADGE_BG_COLOR, DEFAULT_LITEGRAPH_BASE.BADGE_BG_COLOR)
  };
}
function sanitizeComfyBase(value) {
  const source = isRecord$1(value) ? value : {};
  return {
    fgColor: sanitizeColor(source.fgColor, DEFAULT_COMFY_BASE.fgColor),
    bgColor: sanitizeColor(source.bgColor, DEFAULT_COMFY_BASE.bgColor),
    menuBg: sanitizeColor(source.menuBg, DEFAULT_COMFY_BASE.menuBg),
    inputBg: sanitizeColor(source.inputBg, DEFAULT_COMFY_BASE.inputBg),
    inputText: sanitizeColor(source.inputText, DEFAULT_COMFY_BASE.inputText),
    descriptionText: sanitizeColor(source.descriptionText, DEFAULT_COMFY_BASE.descriptionText),
    errorText: sanitizeColor(source.errorText, DEFAULT_COMFY_BASE.errorText),
    borderColor: sanitizeColor(source.borderColor, DEFAULT_COMFY_BASE.borderColor),
    barShadow: sanitizeCssColorLike(source.barShadow, DEFAULT_COMFY_BASE.barShadow)
  };
}
function sanitizeNodeSlot(value) {
  const source = isRecord$1(value) ? value : {};
  const normalized = { ...DEFAULT_NODE_SLOT };
  for (const key of SLOT_KEYS) {
    normalized[key] = sanitizeColor(source[key], DEFAULT_NODE_SLOT[key]);
  }
  return normalized;
}
function hasV2Shape(source) {
  return source.schemaVersion === 2 || isRecord$1(source.uiMeta) && isRecord$1(source.litegraphBase);
}
function migrateLegacyState(source) {
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
    activePresetId: null
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
    LINK_COLOR: outlineColor
  });
  base.comfyBase = sanitizeComfyBase({
    ...base.comfyBase,
    fgColor: contentTextColor,
    bgColor,
    menuBg: titleBgColor,
    inputText: contentTextColor
  });
  return base;
}
function sanitizeThemePreset(value, fallbackIndex = 0, fallbackCategory = "custom") {
  if (!isRecord$1(value)) {
    return null;
  }
  const id = sanitizePresetId(value.id, `preset_${fallbackIndex + 1}`);
  const name = sanitizePresetName(value.name);
  const category = sanitizePresetCategory(value.category, fallbackCategory);
  const snapshotSource = isRecord$1(value.snapshot) ? value.snapshot : value;
  const snapshot = {
    uiMeta: sanitizeUiMeta(snapshotSource.uiMeta),
    litegraphBase: sanitizeLitegraphBase(snapshotSource.litegraphBase),
    comfyBase: sanitizeComfyBase(snapshotSource.comfyBase),
    nodeSlot: sanitizeNodeSlot(snapshotSource.nodeSlot)
  };
  return { id, name, category, snapshot };
}
function sanitizeCustomPresets(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const sanitized = [];
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
function sanitizeThemeState(value) {
  const source = isRecord$1(value) ? value : {};
  const seed = hasV2Shape(source) ? source : migrateLegacyState(source);
  const seedRecord = isRecord$1(seed) ? seed : {};
  const uiMeta = sanitizeUiMeta(seedRecord.uiMeta);
  const litegraphBase = sanitizeLitegraphBase(seedRecord.litegraphBase);
  const comfyBase = sanitizeComfyBase(seedRecord.comfyBase);
  const nodeSlot = sanitizeNodeSlot(seedRecord.nodeSlot);
  const presetsRecord = isRecord$1(seedRecord.presets) ? seedRecord.presets : {};
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
        uiMeta.textareaFontSize
      ),
      NODE_TEXT_COLOR: ensureReadableColor(
        litegraphBase.NODE_TEXT_COLOR,
        litegraphBase.NODE_DEFAULT_BGCOLOR,
        uiMeta.contentTextColor
      ),
      NODE_TITLE_COLOR: ensureReadableColor(
        litegraphBase.NODE_TITLE_COLOR,
        litegraphBase.NODE_DEFAULT_COLOR,
        uiMeta.titleTextColor
      ),
      WIDGET_TEXT_COLOR: ensureReadableColor(
        litegraphBase.WIDGET_TEXT_COLOR,
        litegraphBase.WIDGET_BGCOLOR,
        uiMeta.contentTextColor
      )
    },
    comfyBase,
    nodeSlot,
    presets: {
      custom: customPresets
    }
  };
}
function serializeThemeState(state) {
  return JSON.stringify(sanitizeThemeState(state));
}
function deserializeThemeState(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return deepClone(DEFAULT_THEME_PANEL_STATE);
  }
  try {
    return sanitizeThemeState(JSON.parse(raw));
  } catch {
    return deepClone(DEFAULT_THEME_PANEL_STATE);
  }
}
function toPresetSnapshot(state) {
  const normalized = sanitizeThemeState(state);
  return {
    uiMeta: { ...normalized.uiMeta, activePresetId: null },
    litegraphBase: { ...normalized.litegraphBase },
    comfyBase: { ...normalized.comfyBase },
    nodeSlot: { ...normalized.nodeSlot }
  };
}
function applyPresetSnapshot(state, snapshot, presetId) {
  const normalized = sanitizeThemeState(state);
  const applied = {
    ...normalized,
    uiMeta: sanitizeUiMeta({ ...snapshot.uiMeta, activePresetId: presetId }),
    litegraphBase: sanitizeLitegraphBase(snapshot.litegraphBase),
    comfyBase: sanitizeComfyBase(snapshot.comfyBase),
    nodeSlot: sanitizeNodeSlot(snapshot.nodeSlot)
  };
  return sanitizeThemeState(applied);
}
function toPresetId(name) {
  const sanitized = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 44);
  if (!sanitized) {
    return "custom-preset";
  }
  return `custom-${sanitized}`;
}
function saveCustomPreset(state, name) {
  const normalized = sanitizeThemeState(state);
  const presetName = sanitizePresetName(name);
  const baseId = toPresetId(presetName);
  const existingIds = new Set(normalized.presets.custom.map((preset2) => preset2.id));
  let candidateId = baseId;
  let suffix = 2;
  while (existingIds.has(candidateId)) {
    candidateId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  const preset = {
    id: candidateId,
    name: presetName,
    category: "custom",
    snapshot: toPresetSnapshot(normalized)
  };
  return sanitizeThemeState({
    ...normalized,
    uiMeta: {
      ...normalized.uiMeta,
      activePresetId: preset.id
    },
    presets: {
      custom: [...normalized.presets.custom, preset]
    }
  });
}
function removeCustomPreset(state, presetId) {
  const normalized = sanitizeThemeState(state);
  const nextCustom = normalized.presets.custom.filter((preset) => preset.id !== presetId);
  return sanitizeThemeState({
    ...normalized,
    uiMeta: {
      ...normalized.uiMeta,
      activePresetId: normalized.uiMeta.activePresetId === presetId ? null : normalized.uiMeta.activePresetId
    },
    presets: {
      custom: nextCustom
    }
  });
}
function listPresetCategories(state) {
  const categoryById = new Set(listPresetOptions(state).map((preset) => preset.category));
  return PRESET_CATEGORY_DEFINITIONS.filter((category) => {
    if (category.id === "custom") {
      return true;
    }
    return categoryById.has(category.id);
  });
}
function listPresetOptions(state, category) {
  const normalized = sanitizeThemeState(state);
  const builtins = BUILTIN_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    source: "builtin",
    category: preset.category
  }));
  const custom = normalized.presets.custom.map((preset) => ({
    id: preset.id,
    name: preset.name,
    source: "custom",
    category: sanitizePresetCategory(preset.category, "custom")
  }));
  const allOptions = [...builtins, ...custom];
  if (!category) {
    return allOptions;
  }
  return allOptions.filter((preset) => preset.category === category);
}
function resolvePreset(state, presetId) {
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
function serializeCustomPresets(state) {
  const normalized = sanitizeThemeState(state);
  const payload = {
    schemaVersion: 2,
    presets: normalized.presets.custom
  };
  return JSON.stringify(payload, null, 2);
}
function importCustomPresets(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    const presetArray = isRecord$1(parsed) && Array.isArray(parsed.presets) ? parsed.presets : Array.isArray(parsed) ? parsed : [];
    return sanitizeCustomPresets(presetArray);
  } catch {
    return [];
  }
}
function mergeImportedPresets(state, imported) {
  const normalized = sanitizeThemeState(state);
  const merged = [...normalized.presets.custom];
  const existing = new Set(merged.map((preset) => preset.id));
  for (const preset of imported) {
    let candidate = { ...preset, category: "custom" };
    let counter = 2;
    while (existing.has(candidate.id)) {
      candidate = {
        ...candidate,
        id: `${preset.id}-${counter}`
      };
      counter += 1;
    }
    existing.add(candidate.id);
    merged.push(candidate);
  }
  return sanitizeThemeState({
    ...normalized,
    presets: {
      custom: merged
    }
  });
}
const STYLE_ELEMENT_ID = "duffy-theme-control-panel-overrides";
const NODE_ROOT_TARGETS = [
  ".comfy-node",
  ".lg-node",
  ".litegraph .lgraphnode",
  ".litegraph .graph-node"
];
const NODE_BACKGROUND_TARGETS = [
  '.comfy-node [data-slot="content"]',
  '.lg-node [data-slot="content"]',
  ".comfy-node .lg-node-content",
  ".lg-node .lg-node-content",
  ".comfy-node > .node-component-surface",
  ".lg-node > .node-component-surface"
];
const NODE_HEADER_TARGETS = [
  ".comfy-node .comfy-node-title",
  ".lg-node .comfy-node-title",
  '.comfy-node [data-slot="header"]',
  '.lg-node [data-slot="header"]',
  ".comfy-node header",
  ".lg-node header"
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
  ".litegraph .graph-node > .nodebg"
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
  ' [data-slot="content"] .text-node-component-slot-text',
  " .comfy-widget .text-node-component-slot-text"
];
const BODY_COLOR_SUFFIXES = [
  ' [data-slot="content"]',
  ' [data-slot="content"] *',
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
  " .text-node-component-slot-text"
];
const TITLE_TEXT_SUFFIXES = [
  " .text-node-component-header",
  " .text-node-component-header-text",
  " .comfy-node-title",
  ' [data-slot="header"] .text-node-component-header-text'
];
const TITLE_COLOR_SUFFIXES = [
  " .comfy-node-title",
  " .comfy-node-title *",
  ' [data-slot="header"]',
  ' [data-slot="header"] *',
  " .text-node-component-header",
  " .text-node-component-header-text",
  " .text-node-component-header-icon"
];
const SLOT_TEXT_SUFFIXES = [
  " .lg-slot .text-node-component-slot-text",
  ' [data-slot="slot"] .text-node-component-slot-text',
  " .lg-slot label",
  ' [data-slot="slot"] label'
];
const SLOT_POINT_SIZE_SUFFIXES = [
  " .node-slot-handle",
  " .node-slot-dot",
  " .slot-handle",
  " .slot-dot"
];
const SLOT_POINT_PSEUDO_SUFFIXES = [
  " .node-slot-handle::before",
  " .node-slot-dot::before",
  " .slot-handle::before",
  " .slot-dot::before"
];
const SLOT_SELECTOR_SUFFIXES = [
  ".lg-slot",
  "[data-slot]",
  "[data-slot-type]",
  "[data-type]",
  ".slot"
];
function expandRootSuffixes(suffixes) {
  const selectors = [];
  for (const root of NODE_ROOT_TARGETS) {
    for (const suffix of suffixes) {
      selectors.push(`${root}${suffix}`);
    }
  }
  return selectors.join(",\n");
}
let styleElement = null;
let lastCss = "";
let pendingState = null;
let pendingFrame = 0;
function ensureStyleElement() {
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
function slotSelectorsFor(slotKey) {
  const lowered = slotKey.toLowerCase();
  const selectors = [];
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
function compileSlotCss(state) {
  const lines = [];
  const slotMap = state.nodeSlot;
  for (const key of Object.keys(slotMap)) {
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
function compileSlotPointSizeCss(pointSize) {
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
function compileOutlineCss(state) {
  const outlineColor = state.uiMeta.outlineColor;
  return `
${NODE_OUTLINE_SELECTOR} {
  box-shadow: inset 0 0 0 1px ${outlineColor} !important;
  animation: none !important;
}
`;
}
function compileCss(state) {
  const ui = state.uiMeta;
  const litegraphBase = state.litegraphBase;
  const comfyBase = state.comfyBase;
  const safeFamily = ui.fontFamily.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Arial";
  const fontFamilyCss = `"${safeFamily}", "Segoe UI", sans-serif`;
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

${expandRootSuffixes([' [data-slot="content"] .text-node-component-slot-text'])} {
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
function applyNow(state) {
  const normalized = sanitizeThemeState(state);
  const css = compileCss(normalized);
  if (css === lastCss) {
    return;
  }
  const style = ensureStyleElement();
  style.textContent = css;
  lastCss = css;
}
function applyThemeNow(state) {
  pendingState = null;
  if (pendingFrame) {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
  }
  applyNow(state);
}
function scheduleThemeApply(state) {
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
const SYSTEM_FONT_FAMILIES = [
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Segoe UI",
  "Georgia",
  "Times New Roman"
];
const FAMILY_RE = /^[a-zA-Z0-9 _-]{1,80}$/;
const FORMAT_RE = /^(ttf|otf|woff|woff2)$/;
const remoteFonts = /* @__PURE__ */ new Map();
const loadedFamilies = /* @__PURE__ */ new Set();
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function isSafeFontRecord(value) {
  if (!isRecord(value)) {
    return false;
  }
  const candidate = value;
  return typeof candidate.filename === "string" && typeof candidate.fontFamily === "string" && typeof candidate.url === "string" && typeof candidate.format === "string" && FAMILY_RE.test(candidate.fontFamily.trim()) && FORMAT_RE.test(candidate.format.trim().toLowerCase()) && candidate.url.startsWith("/custom_theme_fonts/");
}
function normalizeFontRecord(value) {
  return {
    filename: value.filename,
    fontFamily: value.fontFamily.trim(),
    url: value.url,
    format: value.format.toLowerCase()
  };
}
function parseFontRecords(payload) {
  const records = Array.isArray(payload) ? payload : isRecord(payload) ? payload.fonts : void 0;
  if (!Array.isArray(records)) {
    return [];
  }
  const parsed = [];
  for (const record of records) {
    if (!isSafeFontRecord(record)) {
      continue;
    }
    parsed.push(normalizeFontRecord(record));
  }
  return parsed;
}
function applyRemoteFonts(records) {
  remoteFonts.clear();
  for (const record of records) {
    remoteFonts.set(record.fontFamily, record);
  }
}
function safeErrorMessage(payload, fallback) {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }
  return fallback;
}
async function readJsonPayload(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
function extensionFromFilename(filename) {
  const parts = filename.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1].toLowerCase();
}
async function refreshFontCatalog() {
  try {
    const response = await api.fetchApi("/api/duffy/theme_fonts");
    if (!response.ok) {
      return [...SYSTEM_FONT_FAMILIES];
    }
    const payload = await readJsonPayload(response);
    const records = parseFontRecords(payload);
    if (records.length < 1) {
      applyRemoteFonts([]);
      return [...SYSTEM_FONT_FAMILIES];
    }
    applyRemoteFonts(records);
  } catch {
    return [...SYSTEM_FONT_FAMILIES];
  }
  return getAvailableFontFamilies();
}
function getAvailableFontFamilies() {
  const unique = new Set(SYSTEM_FONT_FAMILIES);
  for (const family of remoteFonts.keys()) {
    unique.add(family);
  }
  return Array.from(unique.values());
}
function getCustomFonts() {
  return Array.from(remoteFonts.values()).sort((a, b) => a.fontFamily.localeCompare(b.fontFamily));
}
async function uploadThemeFont(file) {
  const extension = extensionFromFilename(file.name);
  if (!FORMAT_RE.test(extension)) {
    return {
      ok: false,
      error: "Unsupported font format. Use .ttf, .otf, .woff, or .woff2."
    };
  }
  const formData = new FormData();
  formData.append("font", file, file.name);
  try {
    const response = await api.fetchApi("/api/duffy/theme_fonts", {
      method: "POST",
      body: formData
    });
    const payload = await readJsonPayload(response);
    if (!response.ok) {
      return {
        ok: false,
        error: safeErrorMessage(payload, "Failed to upload font.")
      };
    }
    const records = parseFontRecords(payload);
    applyRemoteFonts(records);
    const uploaded = isRecord(payload) && isSafeFontRecord(payload.font) ? normalizeFontRecord(payload.font) : void 0;
    return {
      ok: true,
      fontFamily: uploaded?.fontFamily
    };
  } catch {
    return {
      ok: false,
      error: "Failed to upload font."
    };
  }
}
async function deleteThemeFont(filename) {
  const existing = Array.from(remoteFonts.values()).find((font) => font.filename === filename);
  try {
    const response = await api.fetchApi(`/api/duffy/theme_fonts/${encodeURIComponent(filename)}`, {
      method: "DELETE"
    });
    const payload = await readJsonPayload(response);
    if (!response.ok) {
      return {
        ok: false,
        error: safeErrorMessage(payload, "Failed to delete font.")
      };
    }
    const records = parseFontRecords(payload);
    applyRemoteFonts(records);
    if (existing && !remoteFonts.has(existing.fontFamily)) {
      loadedFamilies.delete(existing.fontFamily);
    }
    const removedFamily = isRecord(payload) && isRecord(payload.removed) && typeof payload.removed.fontFamily === "string" ? payload.removed.fontFamily.trim() : existing?.fontFamily;
    if (removedFamily && !remoteFonts.has(removedFamily)) {
      loadedFamilies.delete(removedFamily);
    }
    return {
      ok: true,
      fontFamily: removedFamily
    };
  } catch {
    return {
      ok: false,
      error: "Failed to delete font."
    };
  }
}
async function ensureFontLoaded(fontFamily) {
  const normalized = fontFamily.trim();
  if (!normalized) {
    return false;
  }
  if (loadedFamilies.has(normalized)) {
    return true;
  }
  const remoteRecord = remoteFonts.get(normalized);
  if (!remoteRecord) {
    loadedFamilies.add(normalized);
    return true;
  }
  try {
    const fontFace = new FontFace(remoteRecord.fontFamily, `url("${remoteRecord.url}")`);
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    loadedFamilies.add(remoteRecord.fontFamily);
    return true;
  } catch (error) {
    console.warn("[Duffy_ThemeControl] Failed to load font", normalized, error);
    return false;
  }
}
const _hoisted_1 = { class: "theme-panel-root" };
const _hoisted_2 = { class: "preview-content" };
const _hoisted_3 = {
  open: "",
  class: "panel-section"
};
const _hoisted_4 = { class: "section-body" };
const _hoisted_5 = { class: "control-row" };
const _hoisted_6 = ["value"];
const _hoisted_7 = { class: "control-row" };
const _hoisted_8 = { class: "inline-controls" };
const _hoisted_9 = ["disabled"];
const _hoisted_10 = {
  key: 0,
  class: "feedback-text feedback-error"
};
const _hoisted_11 = {
  key: 1,
  class: "feedback-text feedback-info"
};
const _hoisted_12 = { class: "control-row" };
const _hoisted_13 = {
  key: 0,
  class: "font-list"
};
const _hoisted_14 = { class: "font-meta" };
const _hoisted_15 = { class: "font-family" };
const _hoisted_16 = { class: "font-file" };
const _hoisted_17 = ["disabled", "onClick"];
const _hoisted_18 = {
  key: 1,
  class: "font-empty"
};
const _hoisted_19 = { class: "control-row slider-row" };
const _hoisted_20 = { class: "control-row slider-row" };
const _hoisted_21 = { class: "control-row slider-row" };
const _hoisted_22 = { class: "control-row slider-row" };
const _hoisted_23 = { class: "control-row slider-row" };
const _hoisted_24 = { class: "control-grid" };
const _hoisted_25 = ["onUpdate:modelValue"];
const _hoisted_26 = { class: "panel-section" };
const _hoisted_27 = { class: "section-body" };
const _hoisted_28 = { class: "control-grid" };
const _hoisted_29 = ["onUpdate:modelValue"];
const _hoisted_30 = { class: "panel-section" };
const _hoisted_31 = { class: "section-body" };
const _hoisted_32 = { class: "control-grid" };
const _hoisted_33 = ["onUpdate:modelValue"];
const _hoisted_34 = { class: "control-row" };
const _hoisted_35 = { class: "panel-section" };
const _hoisted_36 = { class: "section-body" };
const _hoisted_37 = { class: "control-grid slot-grid" };
const _hoisted_38 = ["onUpdate:modelValue"];
const _hoisted_39 = { class: "panel-section" };
const _hoisted_40 = { class: "section-body" };
const _hoisted_41 = { class: "control-row" };
const _hoisted_42 = ["value"];
const _hoisted_43 = { class: "control-row" };
const _hoisted_44 = ["value"];
const _hoisted_45 = { class: "inline-controls" };
const _hoisted_46 = ["onKeydown"];
const _hoisted_47 = { class: "inline-controls" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ThemeControlPanel",
  props: {
    onChange: { type: Function }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const state = ref(sanitizeThemeState(DEFAULT_THEME_PANEL_STATE));
    const fontFamilies = ref(getAvailableFontFamilies());
    const customFonts = ref(getCustomFonts());
    const newPresetName = ref("");
    const presetImportInput = ref(null);
    const fontUploadInput = ref(null);
    const isUploadingFont = ref(false);
    const deletingFontFilename = ref(null);
    const fontFeedbackInfo = ref("");
    const fontFeedbackError = ref("");
    const selectedPresetCategory = ref(PRESET_CATEGORY_DEFINITIONS[0].id);
    const uiColorFields = [
      { key: "contentTextColor", label: "Content Text" },
      { key: "titleTextColor", label: "Title Text" },
      { key: "ioTextColor", label: "IO Label Text" },
      { key: "bgColor", label: "Node Background" },
      { key: "titleBgColor", label: "Header Background" },
      { key: "outlineColor", label: "Outline Color" }
    ];
    const litegraphColorFields = [
      { key: "NODE_TITLE_COLOR", label: "Node Title" },
      { key: "NODE_SELECTED_TITLE_COLOR", label: "Selected Title" },
      { key: "NODE_TEXT_COLOR", label: "Node Text" },
      { key: "NODE_DEFAULT_COLOR", label: "Node Header" },
      { key: "NODE_DEFAULT_BGCOLOR", label: "Node Body" },
      { key: "NODE_DEFAULT_BOXCOLOR", label: "Node Box" },
      { key: "NODE_BOX_OUTLINE_COLOR", label: "Node Outline" },
      { key: "NODE_BYPASS_BGCOLOR", label: "Bypass Background" },
      { key: "WIDGET_BGCOLOR", label: "Widget Background" },
      { key: "WIDGET_OUTLINE_COLOR", label: "Widget Outline" },
      { key: "WIDGET_TEXT_COLOR", label: "Widget Text" },
      { key: "WIDGET_SECONDARY_TEXT_COLOR", label: "Widget Secondary Text" },
      { key: "WIDGET_DISABLED_TEXT_COLOR", label: "Widget Disabled Text" },
      { key: "LINK_COLOR", label: "Link Color" },
      { key: "EVENT_LINK_COLOR", label: "Event Link" },
      { key: "CONNECTING_LINK_COLOR", label: "Connecting Link" },
      { key: "BADGE_FG_COLOR", label: "Badge Foreground" },
      { key: "BADGE_BG_COLOR", label: "Badge Background" }
    ];
    const comfyColorFields = [
      { key: "fgColor", label: "Foreground" },
      { key: "bgColor", label: "Background" },
      { key: "menuBg", label: "Menu Background" },
      { key: "inputBg", label: "Input Background" },
      { key: "inputText", label: "Input Text" },
      { key: "descriptionText", label: "Description Text" },
      { key: "errorText", label: "Error Text" },
      { key: "borderColor", label: "Border Color" }
    ];
    const slotColorFields = [
      { key: "IMAGE", label: "IMAGE" },
      { key: "LATENT", label: "LATENT" },
      { key: "CONDITIONING", label: "CONDITIONING" },
      { key: "MASK", label: "MASK" },
      { key: "MODEL", label: "MODEL" },
      { key: "VAE", label: "VAE" },
      { key: "CLIP", label: "CLIP" },
      { key: "CONTROL_NET", label: "CONTROL_NET" },
      { key: "SAMPLER", label: "SAMPLER" },
      { key: "SIGMAS", label: "SIGMAS" },
      { key: "NOISE", label: "NOISE" },
      { key: "GUIDER", label: "GUIDER" }
    ];
    const presetCategoryOptions = computed(() => listPresetCategories(state.value));
    const allPresetOptions = computed(() => listPresetOptions(state.value));
    const presetOptions = computed(() => listPresetOptions(state.value, selectedPresetCategory.value));
    const activePresetSelection = computed({
      get: () => {
        const activePresetId = state.value.uiMeta.activePresetId;
        if (!activePresetId) {
          return "";
        }
        const belongsToCategory = presetOptions.value.some((preset) => preset.id === activePresetId);
        return belongsToCategory ? activePresetId : "";
      },
      set: (value) => {
        state.value.uiMeta.activePresetId = value || null;
      }
    });
    function ensurePresetCategoryIsAvailable() {
      const availableCategory = presetCategoryOptions.value.find((category) => category.id === selectedPresetCategory.value);
      if (availableCategory) {
        return;
      }
      selectedPresetCategory.value = presetCategoryOptions.value[0]?.id ?? "classic-elegant";
    }
    function alignPresetCategoryToActivePreset() {
      const activePresetId = state.value.uiMeta.activePresetId;
      if (activePresetId) {
        const activePreset = allPresetOptions.value.find((preset) => preset.id === activePresetId);
        if (activePreset) {
          selectedPresetCategory.value = activePreset.category;
          return;
        }
      }
      ensurePresetCategoryIsAvailable();
    }
    const previewCardStyle = computed(() => ({
      backgroundColor: state.value.uiMeta.bgColor,
      borderColor: state.value.uiMeta.outlineColor,
      color: state.value.uiMeta.contentTextColor,
      fontFamily: state.value.uiMeta.fontFamily
    }));
    const previewHeaderStyle = computed(() => ({
      backgroundColor: state.value.uiMeta.titleBgColor,
      color: state.value.uiMeta.titleTextColor,
      fontSize: `${state.value.uiMeta.titleFontSize}px`
    }));
    const previewTextStyle = computed(() => ({
      color: state.value.uiMeta.contentTextColor,
      fontSize: `${state.value.uiMeta.bodyFontSize}px`
    }));
    const previewSubtextStyle = computed(() => ({
      color: state.value.uiMeta.ioTextColor,
      fontSize: `${state.value.uiMeta.ioTextSize}px`
    }));
    function serialise() {
      return serializeThemeState(state.value);
    }
    function deserialise(json) {
      state.value = deserializeThemeState(json);
      alignPresetCategoryToActivePreset();
      scheduleThemeApply(state.value);
    }
    function emitChange() {
      state.value = sanitizeThemeState(state.value);
      ensurePresetCategoryIsAvailable();
      scheduleThemeApply(state.value);
      props.onChange?.(serialise());
    }
    function onPresetCategoryChange() {
      ensurePresetCategoryIsAvailable();
    }
    async function onFontFamilyChange() {
      await ensureFontLoaded(state.value.uiMeta.fontFamily);
      emitChange();
    }
    function openFontUploadDialog() {
      if (isUploadingFont.value) {
        return;
      }
      fontUploadInput.value?.click();
    }
    async function onFontUploadFile(event) {
      const target = event.target;
      const file = target?.files?.[0];
      if (target) {
        target.value = "";
      }
      if (!file || isUploadingFont.value) {
        return;
      }
      isUploadingFont.value = true;
      fontFeedbackInfo.value = "";
      fontFeedbackError.value = "";
      const result = await uploadThemeFont(file);
      await refreshFonts();
      if (!result.ok) {
        fontFeedbackError.value = result.error ?? "Failed to upload font.";
        isUploadingFont.value = false;
        return;
      }
      if (result.fontFamily) {
        state.value.uiMeta.fontFamily = result.fontFamily;
        await ensureFontLoaded(result.fontFamily);
        emitChange();
      }
      fontFeedbackInfo.value = result.fontFamily ? `Uploaded ${file.name} as ${result.fontFamily}.` : `Uploaded ${file.name}.`;
      isUploadingFont.value = false;
    }
    async function onDeleteFont(font) {
      if (deletingFontFilename.value) {
        return;
      }
      const confirmed = window.confirm(`Delete custom font file "${font.filename}"?`);
      if (!confirmed) {
        return;
      }
      deletingFontFilename.value = font.filename;
      fontFeedbackInfo.value = "";
      fontFeedbackError.value = "";
      const wasActiveFont = state.value.uiMeta.fontFamily === font.fontFamily;
      const result = await deleteThemeFont(font.filename);
      await refreshFonts();
      if (!result.ok) {
        fontFeedbackError.value = result.error ?? "Failed to delete font.";
        deletingFontFilename.value = null;
        return;
      }
      if (wasActiveFont) {
        state.value.uiMeta.fontFamily = DEFAULT_THEME_PANEL_STATE.uiMeta.fontFamily;
        await ensureFontLoaded(state.value.uiMeta.fontFamily);
        emitChange();
      }
      fontFeedbackInfo.value = `Deleted ${font.filename}.`;
      deletingFontFilename.value = null;
    }
    async function onPresetSelect() {
      const presetId = state.value.uiMeta.activePresetId;
      if (!presetId) {
        emitChange();
        return;
      }
      const resolved = resolvePreset(state.value, presetId);
      if (!resolved) {
        emitChange();
        return;
      }
      state.value = applyPresetSnapshot(state.value, resolved.snapshot, resolved.id);
      selectedPresetCategory.value = resolved.category;
      await ensureFontLoaded(state.value.uiMeta.fontFamily);
      emitChange();
    }
    function savePreset() {
      if (!newPresetName.value.trim()) {
        return;
      }
      state.value = saveCustomPreset(state.value, newPresetName.value);
      selectedPresetCategory.value = "custom";
      newPresetName.value = "";
      emitChange();
    }
    function removePreset() {
      const activeId = state.value.uiMeta.activePresetId;
      if (!activeId) {
        return;
      }
      const isCustomPreset = state.value.presets.custom.some((preset) => preset.id === activeId);
      if (!isCustomPreset) {
        return;
      }
      state.value = removeCustomPreset(state.value, activeId);
      emitChange();
    }
    function exportPresets() {
      const json = serializeCustomPresets(state.value);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "duffy-theme-presets.json";
      link.click();
      URL.revokeObjectURL(url);
    }
    function openImportDialog() {
      presetImportInput.value?.click();
    }
    async function onPresetImportFile(event) {
      const target = event.target;
      const file = target?.files?.[0];
      if (!file) {
        return;
      }
      const raw = await file.text();
      const imported = importCustomPresets(raw);
      if (imported.length < 1) {
        return;
      }
      state.value = mergeImportedPresets(state.value, imported);
      selectedPresetCategory.value = "custom";
      emitChange();
    }
    function resetDefaults() {
      state.value = sanitizeThemeState(DEFAULT_THEME_PANEL_STATE);
      alignPresetCategoryToActivePreset();
      void onFontFamilyChange();
    }
    async function refreshFonts() {
      fontFamilies.value = await refreshFontCatalog();
      customFonts.value = getCustomFonts();
    }
    function cleanup() {
    }
    onMounted(async () => {
      alignPresetCategoryToActivePreset();
      await refreshFonts();
      await ensureFontLoaded(state.value.uiMeta.fontFamily);
      scheduleThemeApply(state.value);
    });
    onBeforeUnmount(() => {
    });
    __expose({ serialise, deserialise, cleanup });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[27] || (_cache[27] = createBaseVNode("header", { class: "panel-header" }, [
          createBaseVNode("h3", null, "Theme Control Panel v2"),
          createBaseVNode("p", null, "Expanded Nodes 2.0 palette, typography and presets")
        ], -1)),
        createBaseVNode("section", {
          class: "preview-card",
          style: normalizeStyle(previewCardStyle.value)
        }, [
          createBaseVNode("div", {
            class: "preview-header",
            style: normalizeStyle(previewHeaderStyle.value)
          }, "Preview Node", 4),
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("span", {
              style: normalizeStyle(previewTextStyle.value)
            }, "Widget text", 4),
            createBaseVNode("span", {
              class: "preview-subtext",
              style: normalizeStyle(previewSubtextStyle.value)
            }, "Secondary text", 4)
          ])
        ], 4),
        createBaseVNode("details", _hoisted_3, [
          _cache[18] || (_cache[18] = createBaseVNode("summary", null, "Typography and Core Visuals", -1)),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("div", _hoisted_5, [
              _cache[10] || (_cache[10] = createBaseVNode("label", null, "Font Family", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => state.value.uiMeta.fontFamily = $event),
                class: "control-input",
                onChange: onFontFamilyChange
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(fontFamilies.value, (fontFamily) => {
                  return openBlock(), createElementBlock("option", {
                    key: fontFamily,
                    value: fontFamily
                  }, toDisplayString(fontFamily), 9, _hoisted_6);
                }), 128))
              ], 544), [
                [vModelSelect, state.value.uiMeta.fontFamily]
              ])
            ]),
            createBaseVNode("div", _hoisted_7, [
              _cache[11] || (_cache[11] = createBaseVNode("label", null, "Custom Font Files", -1)),
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("button", {
                  class: "action-button",
                  type: "button",
                  disabled: isUploadingFont.value,
                  onClick: openFontUploadDialog
                }, toDisplayString(isUploadingFont.value ? "Uploading..." : "Upload Font"), 9, _hoisted_9),
                createBaseVNode("input", {
                  ref_key: "fontUploadInput",
                  ref: fontUploadInput,
                  class: "hidden-input",
                  type: "file",
                  accept: ".ttf,.otf,.woff,.woff2",
                  onChange: onFontUploadFile
                }, null, 544)
              ]),
              fontFeedbackError.value ? (openBlock(), createElementBlock("p", _hoisted_10, toDisplayString(fontFeedbackError.value), 1)) : fontFeedbackInfo.value ? (openBlock(), createElementBlock("p", _hoisted_11, toDisplayString(fontFeedbackInfo.value), 1)) : createCommentVNode("", true)
            ]),
            createBaseVNode("div", _hoisted_12, [
              _cache[12] || (_cache[12] = createBaseVNode("label", null, "Installed Custom Fonts", -1)),
              customFonts.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_13, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(customFonts.value, (font) => {
                  return openBlock(), createElementBlock("div", {
                    key: font.filename,
                    class: "font-item"
                  }, [
                    createBaseVNode("div", _hoisted_14, [
                      createBaseVNode("span", _hoisted_15, toDisplayString(font.fontFamily), 1),
                      createBaseVNode("span", _hoisted_16, toDisplayString(font.filename), 1)
                    ]),
                    createBaseVNode("button", {
                      class: "action-button compact-button",
                      type: "button",
                      disabled: isUploadingFont.value || deletingFontFilename.value === font.filename,
                      onClick: ($event) => onDeleteFont(font)
                    }, toDisplayString(deletingFontFilename.value === font.filename ? "Deleting..." : "Delete"), 9, _hoisted_17)
                  ]);
                }), 128))
              ])) : (openBlock(), createElementBlock("p", _hoisted_18, "No custom fonts found in the fonts folder."))
            ]),
            createBaseVNode("div", _hoisted_19, [
              _cache[13] || (_cache[13] = createBaseVNode("label", null, "Body Text Size", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => state.value.uiMeta.bodyFontSize = $event),
                class: "control-input",
                type: "range",
                min: "8",
                max: "56",
                step: "1",
                onInput: emitChange
              }, null, 544), [
                [
                  vModelText,
                  state.value.uiMeta.bodyFontSize,
                  void 0,
                  { number: true }
                ]
              ]),
              createBaseVNode("span", null, toDisplayString(state.value.uiMeta.bodyFontSize) + "px", 1)
            ]),
            createBaseVNode("div", _hoisted_20, [
              _cache[14] || (_cache[14] = createBaseVNode("label", null, "Header Text Size", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => state.value.uiMeta.titleFontSize = $event),
                class: "control-input",
                type: "range",
                min: "8",
                max: "72",
                step: "1",
                onInput: emitChange
              }, null, 544), [
                [
                  vModelText,
                  state.value.uiMeta.titleFontSize,
                  void 0,
                  { number: true }
                ]
              ]),
              createBaseVNode("span", null, toDisplayString(state.value.uiMeta.titleFontSize) + "px", 1)
            ]),
            createBaseVNode("div", _hoisted_21, [
              _cache[15] || (_cache[15] = createBaseVNode("label", null, "Textarea Size", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => state.value.uiMeta.textareaFontSize = $event),
                class: "control-input",
                type: "range",
                min: "8",
                max: "56",
                step: "1",
                onInput: emitChange
              }, null, 544), [
                [
                  vModelText,
                  state.value.uiMeta.textareaFontSize,
                  void 0,
                  { number: true }
                ]
              ]),
              createBaseVNode("span", null, toDisplayString(state.value.uiMeta.textareaFontSize) + "px", 1)
            ]),
            createBaseVNode("div", _hoisted_22, [
              _cache[16] || (_cache[16] = createBaseVNode("label", null, "IO Label Size", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => state.value.uiMeta.ioTextSize = $event),
                class: "control-input",
                type: "range",
                min: "8",
                max: "40",
                step: "1",
                onInput: emitChange
              }, null, 544), [
                [
                  vModelText,
                  state.value.uiMeta.ioTextSize,
                  void 0,
                  { number: true }
                ]
              ]),
              createBaseVNode("span", null, toDisplayString(state.value.uiMeta.ioTextSize) + "px", 1)
            ]),
            createBaseVNode("div", _hoisted_23, [
              _cache[17] || (_cache[17] = createBaseVNode("label", null, "Connection Point Size", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => state.value.uiMeta.slotPointSize = $event),
                class: "control-input",
                type: "range",
                min: "6",
                max: "26",
                step: "1",
                onInput: emitChange
              }, null, 544), [
                [
                  vModelText,
                  state.value.uiMeta.slotPointSize,
                  void 0,
                  { number: true }
                ]
              ]),
              createBaseVNode("span", null, toDisplayString(state.value.uiMeta.slotPointSize) + "px", 1)
            ]),
            createBaseVNode("div", _hoisted_24, [
              (openBlock(), createElementBlock(Fragment, null, renderList(uiColorFields, (field) => {
                return createBaseVNode("div", {
                  key: field.key,
                  class: "control-row color-row"
                }, [
                  createBaseVNode("label", null, toDisplayString(field.label), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => state.value.uiMeta[field.key] = $event,
                    class: "control-input color-input",
                    type: "color",
                    onInput: emitChange
                  }, null, 40, _hoisted_25), [
                    [vModelText, state.value.uiMeta[field.key]]
                  ])
                ]);
              }), 64))
            ])
          ])
        ]),
        createBaseVNode("details", _hoisted_26, [
          _cache[19] || (_cache[19] = createBaseVNode("summary", null, "Litegraph Base", -1)),
          createBaseVNode("div", _hoisted_27, [
            createBaseVNode("div", _hoisted_28, [
              (openBlock(), createElementBlock(Fragment, null, renderList(litegraphColorFields, (field) => {
                return createBaseVNode("div", {
                  key: field.key,
                  class: "control-row color-row"
                }, [
                  createBaseVNode("label", null, toDisplayString(field.label), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => state.value.litegraphBase[field.key] = $event,
                    class: "control-input color-input",
                    type: "color",
                    onInput: emitChange
                  }, null, 40, _hoisted_29), [
                    [vModelText, state.value.litegraphBase[field.key]]
                  ])
                ]);
              }), 64))
            ])
          ])
        ]),
        createBaseVNode("details", _hoisted_30, [
          _cache[21] || (_cache[21] = createBaseVNode("summary", null, "Comfy Base", -1)),
          createBaseVNode("div", _hoisted_31, [
            createBaseVNode("div", _hoisted_32, [
              (openBlock(), createElementBlock(Fragment, null, renderList(comfyColorFields, (field) => {
                return createBaseVNode("div", {
                  key: field.key,
                  class: "control-row color-row"
                }, [
                  createBaseVNode("label", null, toDisplayString(field.label), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => state.value.comfyBase[field.key] = $event,
                    class: "control-input color-input",
                    type: "color",
                    onInput: emitChange
                  }, null, 40, _hoisted_33), [
                    [vModelText, state.value.comfyBase[field.key]]
                  ])
                ]);
              }), 64))
            ]),
            createBaseVNode("div", _hoisted_34, [
              _cache[20] || (_cache[20] = createBaseVNode("label", null, "Bar Shadow", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => state.value.comfyBase.barShadow = $event),
                class: "control-input",
                type: "text",
                onInput: emitChange
              }, null, 544), [
                [vModelText, state.value.comfyBase.barShadow]
              ])
            ])
          ])
        ]),
        createBaseVNode("details", _hoisted_35, [
          _cache[22] || (_cache[22] = createBaseVNode("summary", null, "Node Slot Colors", -1)),
          createBaseVNode("div", _hoisted_36, [
            createBaseVNode("div", _hoisted_37, [
              (openBlock(), createElementBlock(Fragment, null, renderList(slotColorFields, (field) => {
                return createBaseVNode("div", {
                  key: field.key,
                  class: "control-row color-row"
                }, [
                  createBaseVNode("label", null, toDisplayString(field.label), 1),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": ($event) => state.value.nodeSlot[field.key] = $event,
                    class: "control-input color-input",
                    type: "color",
                    onInput: emitChange
                  }, null, 40, _hoisted_38), [
                    [vModelText, state.value.nodeSlot[field.key]]
                  ])
                ]);
              }), 64))
            ])
          ])
        ]),
        createBaseVNode("details", _hoisted_39, [
          _cache[26] || (_cache[26] = createBaseVNode("summary", null, "Presets", -1)),
          createBaseVNode("div", _hoisted_40, [
            createBaseVNode("div", _hoisted_41, [
              _cache[23] || (_cache[23] = createBaseVNode("label", null, "Preset Category", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => selectedPresetCategory.value = $event),
                class: "control-input",
                onChange: onPresetCategoryChange
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(presetCategoryOptions.value, (category) => {
                  return openBlock(), createElementBlock("option", {
                    key: category.id,
                    value: category.id
                  }, toDisplayString(category.label), 9, _hoisted_42);
                }), 128))
              ], 544), [
                [vModelSelect, selectedPresetCategory.value]
              ])
            ]),
            createBaseVNode("div", _hoisted_43, [
              _cache[25] || (_cache[25] = createBaseVNode("label", null, "Active Preset", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => activePresetSelection.value = $event),
                class: "control-input",
                onChange: onPresetSelect
              }, [
                _cache[24] || (_cache[24] = createBaseVNode("option", { value: "" }, "No preset", -1)),
                (openBlock(true), createElementBlock(Fragment, null, renderList(presetOptions.value, (preset) => {
                  return openBlock(), createElementBlock("option", {
                    key: preset.id,
                    value: preset.id
                  }, toDisplayString(preset.name), 9, _hoisted_44);
                }), 128))
              ], 544), [
                [vModelSelect, activePresetSelection.value]
              ])
            ]),
            createBaseVNode("div", _hoisted_45, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => newPresetName.value = $event),
                class: "control-input",
                type: "text",
                placeholder: "Preset name",
                onKeydown: withKeys(withModifiers(savePreset, ["prevent"]), ["enter"])
              }, null, 40, _hoisted_46), [
                [vModelText, newPresetName.value]
              ]),
              createBaseVNode("button", {
                class: "action-button",
                type: "button",
                onClick: savePreset
              }, "Save Current")
            ]),
            createBaseVNode("div", _hoisted_47, [
              createBaseVNode("button", {
                class: "action-button",
                type: "button",
                onClick: removePreset
              }, "Delete Selected Custom"),
              createBaseVNode("button", {
                class: "action-button",
                type: "button",
                onClick: exportPresets
              }, "Export Custom Presets"),
              createBaseVNode("button", {
                class: "action-button",
                type: "button",
                onClick: openImportDialog
              }, "Import Presets"),
              createBaseVNode("input", {
                ref_key: "presetImportInput",
                ref: presetImportInput,
                class: "hidden-input",
                type: "file",
                accept: "application/json,.json",
                onChange: onPresetImportFile
              }, null, 544)
            ])
          ])
        ]),
        createBaseVNode("footer", { class: "panel-footer" }, [
          createBaseVNode("button", {
            class: "reset-button",
            type: "button",
            onClick: resetDefaults
          }, "Reset All")
        ])
      ]);
    };
  }
});
const ThemeControlPanel = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e9d7459e"]]);
const MIN_W = 430;
const MIN_H = 720;
function notifyThemeConflict(nodeId) {
  const appAny = app;
  const message = "Multiple Theme Control Panel nodes are active. The most recently changed panel will override global theme output.";
  try {
    appAny?.extensionManager?.toast?.addAlert?.({
      severity: "warn",
      summary: "Theme Node Conflict",
      detail: message,
      life: 6500
    });
  } catch {
  }
  console.warn(`[Duffy_ThemeControl] ${message} (node id: ${nodeId})`);
}
function countThemeNodes() {
  const graphAny = app.graph;
  const nodes = Array.isArray(graphAny?._nodes) ? graphAny._nodes : [];
  return nodes.filter((node) => node?.comfyClass === "Duffy_ThemeControlPanel").length;
}
function isolateContainerEvents(container) {
  const stopPropagation = (event) => {
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
function collectRuntimeSlotColorMaps() {
  const appAny = app;
  const globalAny = globalThis;
  const candidates = [
    appAny?.canvas?.default_connection_color_byType,
    appAny?.canvas?.default_connection_color_byTypeOff,
    globalAny?.app?.canvas?.default_connection_color_byType,
    globalAny?.app?.canvas?.default_connection_color_byTypeOff,
    globalAny?.comfyAPI?.app?.app?.canvas?.default_connection_color_byType,
    globalAny?.comfyAPI?.app?.app?.canvas?.default_connection_color_byTypeOff
  ];
  const unique = /* @__PURE__ */ new Set();
  const maps = [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      continue;
    }
    const map = candidate;
    if (!unique.has(map)) {
      unique.add(map);
      maps.push(map);
    }
  }
  return maps;
}
function requestCanvasRedraw() {
  const appAny = app;
  app.graph?.setDirtyCanvas?.(true, true);
  appAny?.canvas?.graph?.setDirtyCanvas?.(true, true);
  appAny?.canvas?.setDirty?.(true, true);
  appAny?.canvas?.draw?.(true, true);
}
function applyRuntimeSlotColors(state) {
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
app.registerExtension({
  name: "Duffy.ThemeControlPanel.Vue",
  async nodeCreated(node) {
    if (node.comfyClass !== "Duffy_ThemeControlPanel") {
      return;
    }
    if (countThemeNodes() > 1) {
      notifyThemeConflict(Number(node?.id ?? -1));
    }
    const stateWidget = node.widgets?.find((widget) => widget.name === "panel_state");
    if (stateWidget) {
      stateWidget.type = "hidden";
      stateWidget.computeSize = () => [0, -4];
    }
    const initialState = typeof stateWidget?.value === "string" && stateWidget.value.trim() ? deserializeThemeState(stateWidget.value) : { ...DEFAULT_THEME_PANEL_STATE };
    applyThemeNow(initialState);
    applyRuntimeSlotColors(initialState);
    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);
    const vueApp = createApp(ThemeControlPanel, {
      onChange: (json) => {
        const nextState = deserializeThemeState(json);
        applyThemeNow(nextState);
        applyRuntimeSlotColors(nextState);
        if (stateWidget) {
          stateWidget.value = json;
        }
        node.setDirtyCanvas?.(true, true);
      }
    });
    const instance = vueApp.mount(container);
    const domWidget = node.addDOMWidget("theme_panel_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];
    const hydrateFromWidget = (value) => {
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
    node.configure = function configureNode(info) {
      const result = originalConfigure?.call(this, info);
      if (stateWidget?.value) {
        hydrateFromWidget(stateWidget.value);
      }
      return result;
    };
    const originalWidgetCallback = stateWidget?.callback;
    if (stateWidget) {
      stateWidget.callback = function widgetCallback(value) {
        hydrateFromWidget(value);
        originalWidgetCallback?.apply(this, arguments);
      };
    }
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
  }
});
