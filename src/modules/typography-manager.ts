import { api as comfyApi } from "COMFY_API";

interface FontRecord {
  filename: string;
  fontFamily: string;
  url: string;
  format: string;
}

const SYSTEM_FONT_FAMILIES = [
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Segoe UI",
  "Georgia",
  "Times New Roman",
];

const FAMILY_RE = /^[a-zA-Z0-9 _-]{1,80}$/;
const FORMAT_RE = /^(ttf|otf|woff|woff2)$/;

const remoteFonts = new Map<string, FontRecord>();
const loadedFamilies = new Set<string>();

function isSafeFontRecord(value: unknown): value is FontRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.filename === "string" &&
    typeof candidate.fontFamily === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.format === "string" &&
    FAMILY_RE.test(candidate.fontFamily.trim()) &&
    FORMAT_RE.test(candidate.format.trim().toLowerCase()) &&
    candidate.url.startsWith("/custom_theme_fonts/")
  );
}

export async function refreshFontCatalog(): Promise<string[]> {
  remoteFonts.clear();

  try {
    const response = await comfyApi.fetchApi("/api/duffy/theme_fonts");
    if (!response.ok) {
      return [...SYSTEM_FONT_FAMILIES];
    }

    const payload = await response.json();
    const records = Array.isArray(payload) ? payload : payload?.fonts;
    if (!Array.isArray(records)) {
      return [...SYSTEM_FONT_FAMILIES];
    }

    for (const record of records) {
      if (!isSafeFontRecord(record)) {
        continue;
      }
      const fontFamily = record.fontFamily.trim();
      remoteFonts.set(fontFamily, {
        filename: record.filename,
        fontFamily,
        url: record.url,
        format: record.format.toLowerCase(),
      });
    }
  } catch {
    return [...SYSTEM_FONT_FAMILIES];
  }

  return getAvailableFontFamilies();
}

export function getAvailableFontFamilies(): string[] {
  const unique = new Set<string>(SYSTEM_FONT_FAMILIES);
  for (const family of remoteFonts.keys()) {
    unique.add(family);
  }

  return Array.from(unique.values());
}

export async function ensureFontLoaded(fontFamily: string): Promise<boolean> {
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
