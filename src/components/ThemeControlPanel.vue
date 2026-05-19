<template>
  <div class="theme-panel-root">
    <header class="panel-header">
      <h3>Theme Control Panel v2</h3>
      <p>Expanded Nodes 2.0 palette, typography and presets</p>
    </header>

    <section class="preview-card" :style="previewCardStyle">
      <div class="preview-header" :style="previewHeaderStyle">Preview Node</div>
      <div class="preview-content">
        <span :style="previewTextStyle">Widget text</span>
        <span class="preview-subtext" :style="previewSubtextStyle">Secondary text</span>
      </div>
    </section>

    <details open class="panel-section">
      <summary>Typography and Core Visuals</summary>
      <div class="section-body">
        <div class="control-row">
          <label>Font Family</label>
          <select v-model="state.uiMeta.fontFamily" class="control-input" @change="onFontFamilyChange">
            <option v-for="fontFamily in fontFamilies" :key="fontFamily" :value="fontFamily">{{ fontFamily }}</option>
          </select>
        </div>

        <div class="control-row">
          <label>Custom Font Files</label>
          <div class="inline-controls">
            <button class="action-button" type="button" :disabled="isUploadingFont" @click="openFontUploadDialog">
              {{ isUploadingFont ? "Uploading..." : "Upload Font" }}
            </button>
            <input
              ref="fontUploadInput"
              class="hidden-input"
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              @change="onFontUploadFile"
            />
          </div>
          <p v-if="fontFeedbackError" class="feedback-text feedback-error">{{ fontFeedbackError }}</p>
          <p v-else-if="fontFeedbackInfo" class="feedback-text feedback-info">{{ fontFeedbackInfo }}</p>
        </div>

        <div class="control-row">
          <label>Installed Custom Fonts</label>
          <div v-if="customFonts.length > 0" class="font-list">
            <div v-for="font in customFonts" :key="font.filename" class="font-item">
              <div class="font-meta">
                <span class="font-family">{{ font.fontFamily }}</span>
                <span class="font-file">{{ font.filename }}</span>
              </div>
              <button
                class="action-button compact-button"
                type="button"
                :disabled="isUploadingFont || deletingFontFilename === font.filename"
                @click="onDeleteFont(font)"
              >
                {{ deletingFontFilename === font.filename ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </div>
          <p v-else class="font-empty">No custom fonts found in the fonts folder.</p>
        </div>

        <div class="control-row slider-row">
          <label>Body Text Size</label>
          <input
            v-model.number="state.uiMeta.bodyFontSize"
            class="control-input"
            type="range"
            min="8"
            max="56"
            step="1"
            @input="emitChange"
          />
          <span>{{ state.uiMeta.bodyFontSize }}px</span>
        </div>

        <div class="control-row slider-row">
          <label>Header Text Size</label>
          <input
            v-model.number="state.uiMeta.titleFontSize"
            class="control-input"
            type="range"
            min="8"
            max="72"
            step="1"
            @input="emitChange"
          />
          <span>{{ state.uiMeta.titleFontSize }}px</span>
        </div>

        <div class="control-row slider-row">
          <label>Textarea Size</label>
          <input
            v-model.number="state.uiMeta.textareaFontSize"
            class="control-input"
            type="range"
            min="8"
            max="56"
            step="1"
            @input="emitChange"
          />
          <span>{{ state.uiMeta.textareaFontSize }}px</span>
        </div>

        <div class="control-row slider-row">
          <label>IO Label Size</label>
          <input
            v-model.number="state.uiMeta.ioTextSize"
            class="control-input"
            type="range"
            min="8"
            max="40"
            step="1"
            @input="emitChange"
          />
          <span>{{ state.uiMeta.ioTextSize }}px</span>
        </div>

        <div class="control-row slider-row">
          <label>Connection Point Size</label>
          <input
            v-model.number="state.uiMeta.slotPointSize"
            class="control-input"
            type="range"
            min="6"
            max="26"
            step="1"
            @input="emitChange"
          />
          <span>{{ state.uiMeta.slotPointSize }}px</span>
        </div>

        <div class="control-grid">
          <div v-for="field in uiColorFields" :key="field.key" class="control-row color-row">
            <label>{{ field.label }}</label>
            <input
              v-model="state.uiMeta[field.key]"
              class="control-input color-input"
              type="color"
              @input="emitChange"
            />
          </div>
        </div>

      </div>
    </details>

    <details class="panel-section">
      <summary>Litegraph Base</summary>
      <div class="section-body">
        <div class="control-grid">
          <div v-for="field in litegraphColorFields" :key="field.key" class="control-row color-row">
            <label>{{ field.label }}</label>
            <input
              v-model="state.litegraphBase[field.key]"
              class="control-input color-input"
              type="color"
              @input="emitChange"
            />
          </div>
        </div>
      </div>
    </details>

    <details class="panel-section">
      <summary>Comfy Base</summary>
      <div class="section-body">
        <div class="control-grid">
          <div v-for="field in comfyColorFields" :key="field.key" class="control-row color-row">
            <label>{{ field.label }}</label>
            <input
              v-model="state.comfyBase[field.key]"
              class="control-input color-input"
              type="color"
              @input="emitChange"
            />
          </div>
        </div>

        <div class="control-row">
          <label>Bar Shadow</label>
          <input v-model="state.comfyBase.barShadow" class="control-input" type="text" @input="emitChange" />
        </div>
      </div>
    </details>

    <details class="panel-section">
      <summary>Node Slot Colors</summary>
      <div class="section-body">
        <div class="control-grid slot-grid">
          <div v-for="field in slotColorFields" :key="field.key" class="control-row color-row">
            <label>{{ field.label }}</label>
            <input
              v-model="state.nodeSlot[field.key]"
              class="control-input color-input"
              type="color"
              @input="emitChange"
            />
          </div>
        </div>
      </div>
    </details>

    <details class="panel-section">
      <summary>Presets</summary>
      <div class="section-body">
        <div class="control-row">
          <label>Preset Category</label>
          <select v-model="selectedPresetCategory" class="control-input" @change="onPresetCategoryChange">
            <option v-for="category in presetCategoryOptions" :key="category.id" :value="category.id">
              {{ category.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Active Preset</label>
          <select v-model="activePresetSelection" class="control-input" @change="onPresetSelect">
            <option value="">No preset</option>
            <option v-for="preset in presetOptions" :key="preset.id" :value="preset.id">
              {{ preset.name }}
            </option>
          </select>
        </div>

        <div class="inline-controls">
          <input
            v-model="newPresetName"
            class="control-input"
            type="text"
            placeholder="Preset name"
            @keydown.enter.prevent="savePreset"
          />
          <button class="action-button" type="button" @click="savePreset">Save Current</button>
        </div>

        <div class="inline-controls">
          <button class="action-button" type="button" @click="removePreset">Delete Selected Custom</button>
          <button class="action-button" type="button" @click="exportPresets">Export Custom Presets</button>
          <button class="action-button" type="button" @click="openImportDialog">Import Presets</button>
          <input
            ref="presetImportInput"
            class="hidden-input"
            type="file"
            accept="application/json,.json"
            @change="onPresetImportFile"
          />
        </div>
      </div>
    </details>

    <footer class="panel-footer">
      <button class="reset-button" type="button" @click="resetDefaults">Reset All</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { scheduleThemeApply } from "../modules/css-style-injector";
import {
  DEFAULT_THEME_PANEL_STATE,
  PRESET_CATEGORY_DEFINITIONS,
  applyPresetSnapshot,
  deserializeThemeState,
  importCustomPresets,
  listPresetCategories,
  listPresetOptions,
  mergeImportedPresets,
  removeCustomPreset,
  resolvePreset,
  sanitizeThemeState,
  saveCustomPreset,
  serializeCustomPresets,
  serializeThemeState,
  type PresetCategoryId,
  type ThemePanelState,
} from "../modules/state-sync";
import {
  deleteThemeFont,
  ensureFontLoaded,
  getAvailableFontFamilies,
  getCustomFonts,
  refreshFontCatalog,
  uploadThemeFont,
  type ThemeFontRecord,
} from "../modules/typography-manager";

const props = defineProps<{ onChange?: (json: string) => void }>();

const state = ref<ThemePanelState>(sanitizeThemeState(DEFAULT_THEME_PANEL_STATE));
const fontFamilies = ref<string[]>(getAvailableFontFamilies());
const customFonts = ref<ThemeFontRecord[]>(getCustomFonts());
const newPresetName = ref("");
const presetImportInput = ref<HTMLInputElement | null>(null);
const fontUploadInput = ref<HTMLInputElement | null>(null);
const isUploadingFont = ref(false);
const deletingFontFilename = ref<string | null>(null);
const fontFeedbackInfo = ref("");
const fontFeedbackError = ref("");
const selectedPresetCategory = ref<PresetCategoryId>(PRESET_CATEGORY_DEFINITIONS[0].id);

const uiColorFields: Array<{ key: "contentTextColor" | "titleTextColor" | "ioTextColor" | "bgColor" | "titleBgColor" | "outlineColor"; label: string }> = [
  { key: "contentTextColor", label: "Content Text" },
  { key: "titleTextColor", label: "Title Text" },
  { key: "ioTextColor", label: "IO Label Text" },
  { key: "bgColor", label: "Node Background" },
  { key: "titleBgColor", label: "Header Background" },
  { key: "outlineColor", label: "Outline Color" },
];

const litegraphColorFields: Array<{ key: keyof ThemePanelState["litegraphBase"]; label: string }> = [
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
  { key: "BADGE_BG_COLOR", label: "Badge Background" },
];

const comfyColorFields: Array<{ key: "fgColor" | "bgColor" | "menuBg" | "inputBg" | "inputText" | "descriptionText" | "errorText" | "borderColor"; label: string }> = [
  { key: "fgColor", label: "Foreground" },
  { key: "bgColor", label: "Background" },
  { key: "menuBg", label: "Menu Background" },
  { key: "inputBg", label: "Input Background" },
  { key: "inputText", label: "Input Text" },
  { key: "descriptionText", label: "Description Text" },
  { key: "errorText", label: "Error Text" },
  { key: "borderColor", label: "Border Color" },
];

const slotColorFields: Array<{ key: keyof ThemePanelState["nodeSlot"]; label: string }> = [
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
  { key: "GUIDER", label: "GUIDER" },
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
  set: (value: string) => {
    state.value.uiMeta.activePresetId = value || null;
  },
});

function ensurePresetCategoryIsAvailable(): void {
  const availableCategory = presetCategoryOptions.value.find((category) => (
    category.id === selectedPresetCategory.value
  ));
  if (availableCategory) {
    return;
  }

  selectedPresetCategory.value = presetCategoryOptions.value[0]?.id ?? "classic-elegant";
}

function alignPresetCategoryToActivePreset(): void {
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
  fontFamily: state.value.uiMeta.fontFamily,
}));

const previewHeaderStyle = computed(() => ({
  backgroundColor: state.value.uiMeta.titleBgColor,
  color: state.value.uiMeta.titleTextColor,
  fontSize: `${state.value.uiMeta.titleFontSize}px`,
}));

const previewTextStyle = computed(() => ({
  color: state.value.uiMeta.contentTextColor,
  fontSize: `${state.value.uiMeta.bodyFontSize}px`,
}));

const previewSubtextStyle = computed(() => ({
  color: state.value.uiMeta.ioTextColor,
  fontSize: `${state.value.uiMeta.ioTextSize}px`,
}));

function serialise(): string {
  return serializeThemeState(state.value);
}

function deserialise(json: string): void {
  state.value = deserializeThemeState(json);
  alignPresetCategoryToActivePreset();
  scheduleThemeApply(state.value);
}

function emitChange(): void {
  state.value = sanitizeThemeState(state.value);
  ensurePresetCategoryIsAvailable();
  scheduleThemeApply(state.value);
  props.onChange?.(serialise());
}

function onPresetCategoryChange(): void {
  ensurePresetCategoryIsAvailable();
}

async function onFontFamilyChange(): Promise<void> {
  await ensureFontLoaded(state.value.uiMeta.fontFamily);
  emitChange();
}

function openFontUploadDialog(): void {
  if (isUploadingFont.value) {
    return;
  }

  fontUploadInput.value?.click();
}

async function onFontUploadFile(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement | null;
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

  fontFeedbackInfo.value = result.fontFamily
    ? `Uploaded ${file.name} as ${result.fontFamily}.`
    : `Uploaded ${file.name}.`;
  isUploadingFont.value = false;
}

async function onDeleteFont(font: ThemeFontRecord): Promise<void> {
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

async function onPresetSelect(): Promise<void> {
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

function savePreset(): void {
  if (!newPresetName.value.trim()) {
    return;
  }

  state.value = saveCustomPreset(state.value, newPresetName.value);
  selectedPresetCategory.value = "custom";
  newPresetName.value = "";
  emitChange();
}

function removePreset(): void {
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

function exportPresets(): void {
  const json = serializeCustomPresets(state.value);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "duffy-theme-presets.json";
  link.click();
  URL.revokeObjectURL(url);
}

function openImportDialog(): void {
  presetImportInput.value?.click();
}

async function onPresetImportFile(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement | null;
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

function resetDefaults(): void {
  state.value = sanitizeThemeState(DEFAULT_THEME_PANEL_STATE);
  alignPresetCategoryToActivePreset();
  void onFontFamilyChange();
}

async function refreshFonts(): Promise<void> {
  fontFamilies.value = await refreshFontCatalog();
  customFonts.value = getCustomFonts();
}

function cleanup(): void {
  // Placeholder for future listener cleanup hooks.
}

onMounted(async () => {
  alignPresetCategoryToActivePreset();
  await refreshFonts();
  await ensureFontLoaded(state.value.uiMeta.fontFamily);
  scheduleThemeApply(state.value);
});

onBeforeUnmount(() => {
  cleanup();
});

defineExpose({ serialise, deserialise, cleanup });
</script>

<style scoped>
.theme-panel-root {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto auto auto auto auto auto auto;
  gap: 10px;
  padding: 10px;
  color: #ececec;
  background:
    radial-gradient(120% 80% at 12% 0%, rgba(31, 199, 157, 0.22), transparent 62%),
    linear-gradient(150deg, rgba(23, 29, 36, 0.96), rgba(17, 20, 25, 0.96));
  border: 1px solid rgba(0, 209, 143, 0.3);
  border-radius: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: "IBM Plex Sans", "Source Sans 3", sans-serif;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.03em;
}

.panel-header p {
  margin: 4px 0 0;
  font-size: 11px;
  color: #9db2c2;
}

.preview-card {
  border: 1px solid;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 6px 8px;
  font-weight: 600;
}

.preview-content {
  padding: 8px;
  display: grid;
  gap: 6px;
}

.preview-subtext {
  opacity: 0.82;
}

.panel-section {
  border: 1px solid rgba(129, 149, 164, 0.24);
  border-radius: 8px;
  background: rgba(18, 24, 32, 0.72);
  overflow: hidden;
}

.panel-section summary {
  cursor: pointer;
  padding: 8px;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8cf2d2;
  user-select: none;
}

.section-body {
  padding: 0 8px 8px;
  display: grid;
  gap: 8px;
}

.control-row {
  display: grid;
  gap: 4px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.slot-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.control-row label {
  font-size: 11px;
  color: #c3d6e4;
}

.control-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(182, 208, 224, 0.2);
  border-radius: 6px;
  background: rgba(8, 12, 18, 0.7);
  color: #ecf4fa;
  padding: 6px 8px;
}

.control-input[type="range"] {
  padding: 0;
}

.slider-row span {
  font-size: 11px;
  color: #9fb2c2;
}

.color-input {
  padding: 0;
  min-height: 30px;
}

.inline-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feedback-text {
  margin: 0;
  font-size: 11px;
}

.feedback-error {
  color: #ff8b8b;
}

.feedback-info {
  color: #8cf2d2;
}

.font-list {
  display: grid;
  gap: 6px;
}

.font-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid rgba(182, 208, 224, 0.2);
  border-radius: 6px;
  background: rgba(10, 14, 20, 0.72);
}

.font-meta {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.font-family {
  font-size: 12px;
  color: #e8f4f8;
}

.font-file {
  font-size: 10px;
  color: #9fb2c2;
  word-break: break-all;
}

.font-empty {
  margin: 0;
  font-size: 11px;
  color: #9fb2c2;
}

.action-button,
.reset-button {
  border: 1px solid rgba(147, 170, 184, 0.4);
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(34, 43, 54, 0.95), rgba(25, 34, 44, 0.95));
  color: #eff7fa;
  cursor: pointer;
  padding: 7px 10px;
  font-size: 11px;
  letter-spacing: 0.03em;
}

.compact-button {
  padding: 5px 8px;
  font-size: 10px;
}

.action-button:hover,
.reset-button:hover {
  border-color: rgba(135, 243, 206, 0.65);
}

.action-button:disabled,
.reset-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  border-color: rgba(147, 170, 184, 0.24);
}

.hidden-input {
  display: none;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
