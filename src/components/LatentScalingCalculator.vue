<template>
  <div class="latent-calc-card" :class="themeClass">
    <header class="card-header">
      <div class="header-main">
        <h3 class="header-title">Dynamic Latent Scaling</h3>
        <span class="header-badge" :style="accentStyle">{{ modelFamily }} [f={{ factor }}]</span>
      </div>
      <p class="header-subtitle">Nodes 2.0 Aspect-Locked Resizer</p>
    </header>

    <main class="card-body">
      <!-- Input Controls Section -->
      <div class="control-group">
        <div class="control-header">
          <label class="control-label">Model Architecture</label>
        </div>
        <select v-model="modelFamily" class="styled-select" @change="onFamilyChange">
          <option value="Flux 1">Flux 1 (f=8)</option>
          <option value="Flux 2">Flux 2 (f=6)</option>
          <option value="SD3">Stable Diffusion 3 (f=8)</option>
        </select>
      </div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label">Reduced Image Size (Longest Side)</label>
          <span class="value-badge" :style="valueStyle">{{ coercedReducedSize }} px</span>
        </div>
        <div class="slider-wrapper">
          <input
            type="range"
            v-model.number="reducedSize"
            min="64"
            max="8192"
            step="8"
            class="styled-range"
            @input="onReducedChange"
          />
          <input
            type="number"
            v-model.number="reducedSize"
            min="64"
            max="8192"
            step="8"
            class="styled-number"
            @change="onReducedChange"
          />
        </div>
        <div v-if="reducedSize !== coercedReducedSize" class="coercion-pill warning">
          ⚠️ Divisibility Coercion: {{ reducedSize }} -> {{ coercedReducedSize }} px
        </div>
      </div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label">Target Size (Longest Side)</label>
          <span class="value-badge" :style="valueStyle">{{ coercedTargetSize }} px</span>
        </div>
        <div class="slider-wrapper">
          <input
            type="range"
            v-model.number="targetSize"
            min="64"
            max="16384"
            step="8"
            class="styled-range"
            @input="onTargetChange"
          />
          <input
            type="number"
            v-model.number="targetSize"
            min="64"
            max="16384"
            step="8"
            class="styled-number"
            @change="onTargetChange"
          />
        </div>
        <div v-if="targetSize !== coercedTargetSize" class="coercion-pill info">
          ⚡ Ceiling Alignment: {{ targetSize }} -> {{ coercedTargetSize }} px
        </div>
      </div>

      <!-- Dimension Collapse Error -->
      <div v-if="isCollapsed" class="alert-box error">
        <span class="alert-title">🚨 Dimensional Collapse</span>
        <p class="alert-desc">
          Aspect ratio reduces the short side below 8 blocks (64px). Increase Reduced Image Size!
        </p>
      </div>

      <!-- Telemetry Warnings -->
      <div v-if="telemetry.warnings && telemetry.warnings.length > 0" class="alert-box warning-box">
        <span class="alert-title">⚠️ Compatibility Alert</span>
        <p v-for="(warn, index) in telemetry.warnings" :key="index" class="alert-desc">
          {{ warn }}
        </p>
      </div>

      <!-- Dynamic Visualizer & Previews Section -->
      <div class="preview-container">
        <!-- SVG Visualizer -->
        <div class="visualizer-wrapper">
          <svg viewBox="0 0 120 120" class="svg-canvas">
            <!-- Grid Background -->
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" rx="6" />

            <!-- Target Size Outline (Ceil Aligned) -->
            <rect
              v-if="!isCollapsed"
              :x="outerBox.x"
              :y="outerBox.y"
              :width="outerBox.width"
              :height="outerBox.height"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              stroke-width="1.5"
              stroke-dasharray="3 3"
              rx="2"
            />

            <!-- Reduced Size Box (Floor Aligned) -->
            <rect
              v-if="!isCollapsed"
              :x="innerBox.x"
              :y="innerBox.y"
              :width="innerBox.width"
              :height="innerBox.height"
              :fill="fillColor"
              :stroke="accentColor"
              stroke-width="1.5"
              rx="2"
              class="pulse-glow"
            />
          </svg>
          <div class="aspect-ratio-label">Ratio: {{ currentAr.toFixed(2) }} ({{ aspectFraction }})</div>
        </div>

        <!-- Dimension List Previews -->
        <div class="telemetry-info">
          <div class="telemetry-row">
            <span class="tel-label">Input Shape:</span>
            <span class="tel-val highlight">
              {{ telemetry.inputWidth ? `${telemetry.inputWidth} × ${telemetry.inputHeight} px` : 'Pending execution...' }}
            </span>
          </div>
          <div class="telemetry-row">
            <span class="tel-label">Reduced Latent:</span>
            <span class="tel-val" :style="textStyle">
              {{ coercedReducedWidth }} × {{ coercedReducedHeight }} px
              <span class="latent-block-size">({{ wLatent }} × {{ hLatent }} blocks)</span>
            </span>
          </div>
          <div class="telemetry-row">
            <span class="tel-label">Target Outputs:</span>
            <span class="tel-val font-semibold" :style="textStyle">
              {{ calculatedTargetWidth }} × {{ calculatedTargetHeight }} px
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps<{
  initialReducedSize: number;
  initialTargetSize: number;
  initialModelFamily: string;
  nodeId: number;
  onReducedSizeChange: (val: number) => void;
  onTargetSizeChange: (val: number) => void;
  onModelFamilyChange: (val: string) => void;
  onResize?: (height: number) => void;
}>();

// Inputs
const reducedSize = ref(props.initialReducedSize);
const targetSize = ref(props.initialTargetSize);
const modelFamily = ref(props.initialModelFamily);

// Telemetry from backend execution
const telemetry = ref({
  calcWidth: 0,
  calcHeight: 0,
  inputWidth: 0,
  inputHeight: 0,
  inputChannels: 0,
  warnings: [] as string[],
  executedModelFamily: ""
});

// Spatial factor (f)
const factor = computed(() => {
  if (modelFamily.value === "Flux 2") return 6;
  return 8;
});

// Math Coercions
const coercedReducedSize = computed(() => {
  return Math.floor(reducedSize.value / factor.value) * factor.value;
});

const coercedTargetSize = computed(() => {
  return Math.ceil(targetSize.value / factor.value) * factor.value;
});

// Aspect Ratio determination (prioritize telemetry if available, fallback to square)
const currentAr = computed(() => {
  if (telemetry.value.inputWidth && telemetry.value.inputHeight) {
    return telemetry.value.inputWidth / telemetry.value.inputHeight;
  }
  return 1.0;
});

const aspectFraction = computed(() => {
  const ar = currentAr.value;
  if (Math.abs(ar - 1.0) < 1e-4) return "1:1";
  if (Math.abs(ar - 1.5) < 0.05) return "3:2";
  if (Math.abs(ar - 1.333) < 0.05) return "4:3";
  if (Math.abs(ar - 1.777) < 0.05) return "16:9";
  if (Math.abs(ar - 2.0) < 0.05) return "2:1";
  if (Math.abs(ar - 0.5) < 0.05) return "1:2";
  if (Math.abs(ar - 0.666) < 0.05) return "2:3";
  if (Math.abs(ar - 0.75) < 0.05) return "3:4";
  if (Math.abs(ar - 0.562) < 0.05) return "9:16";
  return ar > 1.0 ? `${ar.toFixed(1)}:1` : `1:${(1 / ar).toFixed(1)}`;
});

// Live Preview of Scaled Dimensions (mirroring Python execution)
const coercedReducedWidth = computed(() => {
  const ar = currentAr.value;
  const aligned = coercedReducedSize.value;
  if (ar >= 1.0) return aligned;
  return Math.floor(Math.round(aligned * ar) / factor.value) * factor.value;
});

const coercedReducedHeight = computed(() => {
  const ar = currentAr.value;
  const aligned = coercedReducedSize.value;
  if (ar >= 1.0) return Math.floor(Math.round(aligned / ar) / factor.value) * factor.value;
  return aligned;
});

const wLatent = computed(() => coercedReducedWidth.value / factor.value);
const hLatent = computed(() => coercedReducedHeight.value / factor.value);

const isCollapsed = computed(() => {
  return wLatent.value < 8 || hLatent.value < 8;
});

// Live Preview of Target Outputs
const calculatedTargetWidth = computed(() => {
  const newAr = wLatent.value / hLatent.value;
  const alignedTarget = coercedTargetSize.value;
  if (newAr >= 1.0) return alignedTarget;
  return Math.floor(Math.round(alignedTarget * newAr) / factor.value) * factor.value;
});

const calculatedTargetHeight = computed(() => {
  const newAr = wLatent.value / hLatent.value;
  const alignedTarget = coercedTargetSize.value;
  if (newAr >= 1.0) return Math.floor(Math.round(alignedTarget / newAr) / factor.value) * factor.value;
  return alignedTarget;
});

// SVG visualizer layout calculation
const outerBox = computed(() => {
  const ar = currentAr.value;
  const maxDim = 90;
  let width = maxDim;
  let height = maxDim;

  if (ar >= 1.0) {
    height = maxDim / ar;
  } else {
    width = maxDim * ar;
  }

  return {
    width,
    height,
    x: (120 - width) / 2,
    y: (120 - height) / 2
  };
});

const innerBox = computed(() => {
  const outer = outerBox.value;
  const ratio = coercedReducedSize.value / coercedTargetSize.value;
  const width = outer.width * Math.min(1.0, ratio);
  const height = outer.height * Math.min(1.0, ratio);

  return {
    width,
    height,
    x: (120 - width) / 2,
    y: (120 - height) / 2
  };
});

// Theming variables
const themeClass = computed(() => {
  if (modelFamily.value === "Flux 1") return "theme-flux1";
  if (modelFamily.value === "Flux 2") return "theme-flux2";
  return "theme-sd3";
});

const accentColor = computed(() => {
  if (modelFamily.value === "Flux 1") return "#00f0ff";
  if (modelFamily.value === "Flux 2") return "#bf00ff";
  return "#10b981";
});

const fillColor = computed(() => {
  if (modelFamily.value === "Flux 1") return "rgba(0, 240, 255, 0.08)";
  if (modelFamily.value === "Flux 2") return "rgba(191, 0, 255, 0.08)";
  return "rgba(16, 185, 129, 0.08)";
});

const accentStyle = computed(() => ({
  borderColor: accentColor.value,
  color: accentColor.value,
  boxShadow: `0 0 6px ${accentColor.value}33`
}));

const valueStyle = computed(() => ({
  color: accentColor.value
}));

const textStyle = computed(() => ({
  color: accentColor.value
}));

// Emit callbacks on change
function onReducedChange() {
  // Constrain inputs
  if (reducedSize.value < 64) reducedSize.value = 64;
  if (reducedSize.value > 8192) reducedSize.value = 8192;
  props.onReducedSizeChange(reducedSize.value);
}

function onTargetChange() {
  if (targetSize.value < 64) targetSize.value = 64;
  if (targetSize.value > 16384) targetSize.value = 16384;
  props.onTargetSizeChange(targetSize.value);
}

function onFamilyChange() {
  props.onModelFamilyChange(modelFamily.value);
}

// Hydrate state from widgets
function hydrateState(data: { reducedSize?: number; targetSize?: number; modelFamily?: string }) {
  if (typeof data.reducedSize === "number") reducedSize.value = data.reducedSize;
  if (typeof data.targetSize === "number") targetSize.value = data.targetSize;
  if (typeof data.modelFamily === "string") modelFamily.value = data.modelFamily;
}

// Update telemetry from execution results
function setTelemetry(data: any) {
  telemetry.value = data;
}

// Dynamic Height Adjustment based on validation warning visibility
watch([isCollapsed, () => telemetry.value.warnings], () => {
  let height = 360;
  if (isCollapsed.value) height += 46;
  if (telemetry.value.warnings && telemetry.value.warnings.length > 0) {
    height += 36 * telemetry.value.warnings.length;
  }
  props.onResize?.(height);
});

onMounted(() => {
  props.onResize?.(360);
});

defineExpose({ hydrateState, setTelemetry });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

.latent-calc-card {
  display: flex;
  flex-direction: column;
  background: rgba(20, 20, 22, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: #e2e8f0;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 14px;
  gap: 12px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Accent Glowing Boundaries */
.theme-flux1 {
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.theme-flux2 {
  border-color: rgba(191, 0, 255, 0.3);
  box-shadow: 0 4px 20px rgba(191, 0, 255, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.theme-sd3 {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8fafc;
}

.header-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 9999px;
  border: 1px solid;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.header-subtitle {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.01em;
}

.value-badge {
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Styled HTML slider range */
.styled-range {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
}
.styled-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.1s ease;
}
.styled-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.theme-flux1 .styled-range::-webkit-slider-thumb { background: #00f0ff; box-shadow: 0 0 6px rgba(0,240,255,0.8); }
.theme-flux2 .styled-range::-webkit-slider-thumb { background: #bf00ff; box-shadow: 0 0 6px rgba(191,0,255,0.8); }
.theme-sd3 .styled-range::-webkit-slider-thumb { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.8); }

.styled-number {
  width: 60px;
  background: rgba(10, 10, 12, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  font-family: monospace;
  padding: 4px;
  text-align: center;
  outline: none;
}

.styled-select {
  background: rgba(10, 10, 12, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  padding: 6px;
  cursor: pointer;
  outline: none;
}

/* Warnings and Badges */
.coercion-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  width: max-content;
}
.coercion-pill.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.coercion-pill.info {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.alert-box {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  border-radius: 8px;
  gap: 2px;
}
.alert-box.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.alert-box.warning-box {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.alert-title {
  font-size: 11px;
  font-weight: 600;
}
.alert-desc {
  margin: 0;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
}

/* Visualizer Layout */
.preview-container {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  margin-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
}

.visualizer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.svg-canvas {
  width: 100px;
  height: 100px;
  background: #0d0d0e;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.aspect-ratio-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

.telemetry-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.telemetry-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tel-label {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}

.tel-val {
  font-size: 11px;
  font-family: monospace;
}

.tel-val.highlight {
  color: #fff;
}

.latent-block-size {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 4px;
}

/* Micro-animations */
.pulse-glow {
  transition: all 0.3s ease;
}
.theme-flux1 .pulse-glow {
  filter: drop-shadow(0 0 2px rgba(0, 240, 255, 0.4));
}
.theme-flux2 .pulse-glow {
  filter: drop-shadow(0 0 2px rgba(191, 0, 255, 0.4));
}
.theme-sd3 .pulse-glow {
  filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4));
}
</style>
