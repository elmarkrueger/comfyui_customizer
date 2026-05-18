import { api as comfyApi } from "COMFY_API";

export interface ThemeFontRecord {
  filename: string;
  fontFamily: string;
  url: string;
  format: string;
}

export interface FontMutationResult {
  ok: boolean;
  error?: string;
  fontFamily?: string;
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

const remoteFonts = new Map<string, ThemeFontRecord>();
const loadedFamilies = new Set<string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSafeFontRecord(value: unknown): value is ThemeFontRecord {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = value;
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

function normalizeFontRecord(value: ThemeFontRecord): ThemeFontRecord {
  return {
    filename: value.filename,
    fontFamily: value.fontFamily.trim(),
    url: value.url,
    format: value.format.toLowerCase(),
  };
}

function parseFontRecords(payload: unknown): ThemeFontRecord[] {
  const records = Array.isArray(payload) ? payload : isRecord(payload) ? payload.fonts : undefined;
  if (!Array.isArray(records)) {
    return [];
  }

  const parsed: ThemeFontRecord[] = [];
  for (const record of records) {
    if (!isSafeFontRecord(record)) {
      continue;
    }
    parsed.push(normalizeFontRecord(record));
  }

  return parsed;
}

function applyRemoteFonts(records: ThemeFontRecord[]): void {
  remoteFonts.clear();

  for (const record of records) {
    remoteFonts.set(record.fontFamily, record);
  }
}

function safeErrorMessage(payload: unknown, fallback: string): string {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }
  return fallback;
}

async function readJsonPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extensionFromFilename(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1].toLowerCase();
}

export async function refreshFontCatalog(): Promise<string[]> {
  try {
    const response = await comfyApi.fetchApi("/api/duffy/theme_fonts");
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

export function getAvailableFontFamilies(): string[] {
  const unique = new Set<string>(SYSTEM_FONT_FAMILIES);
  for (const family of remoteFonts.keys()) {
    unique.add(family);
  }

  return Array.from(unique.values());
}

export function getCustomFonts(): ThemeFontRecord[] {
  return Array.from(remoteFonts.values()).sort((a, b) => a.fontFamily.localeCompare(b.fontFamily));
}

export async function uploadThemeFont(file: File): Promise<FontMutationResult> {
  const extension = extensionFromFilename(file.name);
  if (!FORMAT_RE.test(extension)) {
    return {
      ok: false,
      error: "Unsupported font format. Use .ttf, .otf, .woff, or .woff2.",
    };
  }

  const formData = new FormData();
  formData.append("font", file, file.name);

  try {
    const response = await comfyApi.fetchApi("/api/duffy/theme_fonts", {
      method: "POST",
      body: formData,
    });

    const payload = await readJsonPayload(response);
    if (!response.ok) {
      return {
        ok: false,
        error: safeErrorMessage(payload, "Failed to upload font."),
      };
    }

    const records = parseFontRecords(payload);
    applyRemoteFonts(records);

    const uploaded = isRecord(payload) && isSafeFontRecord(payload.font) ? normalizeFontRecord(payload.font) : undefined;

    return {
      ok: true,
      fontFamily: uploaded?.fontFamily,
    };
  } catch {
    return {
      ok: false,
      error: "Failed to upload font.",
    };
  }
}

export async function deleteThemeFont(filename: string): Promise<FontMutationResult> {
  const existing = Array.from(remoteFonts.values()).find((font) => font.filename === filename);

  try {
    const response = await comfyApi.fetchApi(`/api/duffy/theme_fonts/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    });

    const payload = await readJsonPayload(response);
    if (!response.ok) {
      return {
        ok: false,
        error: safeErrorMessage(payload, "Failed to delete font."),
      };
    }

    const records = parseFontRecords(payload);
    applyRemoteFonts(records);

    if (existing && !remoteFonts.has(existing.fontFamily)) {
      loadedFamilies.delete(existing.fontFamily);
    }

    const removedFamily =
      isRecord(payload) && isRecord(payload.removed) && typeof payload.removed.fontFamily === "string"
        ? payload.removed.fontFamily.trim()
        : existing?.fontFamily;

    if (removedFamily && !remoteFonts.has(removedFamily)) {
      loadedFamilies.delete(removedFamily);
    }

    return {
      ok: true,
      fontFamily: removedFamily,
    };
  } catch {
    return {
      ok: false,
      error: "Failed to delete font.",
    };
  }
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
