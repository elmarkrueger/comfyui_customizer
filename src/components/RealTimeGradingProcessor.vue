<template>
  <div class="grading-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="title-container">
        <span class="header-title">Grading & Shader Processor</span>
        <span class="node-id">Node #{{ nodeId }}</span>
      </div>
      <button
        class="reset-btn"
        @pointerdown="swallowUiEvent"
        @pointerup="swallowUiEvent"
        @mousedown="swallowUiEvent"
        @mouseup="swallowUiEvent"
        @touchstart="swallowUiEvent"
        @touchend="swallowUiEvent"
        @dblclick="swallowUiEvent"
        @click="onResetAllClick"
      >
        Reset All
      </button>
    </div>

    <!-- Main Container -->
    <div class="scrollable-content">
      <!-- Section 1: Preview and Wipe Comparison -->
      <div class="panel-section preview-panel" :class="{ 'is-collapsed': collapsedSections.preview }">
        <div class="section-header" @click="toggleSection('preview')">
          <span class="section-title">Visual Preview & Compare</span>
          <span class="collapse-icon">{{ collapsedSections.preview ? '▼' : '▲' }}</span>
        </div>
        
        <div v-show="!collapsedSections.preview" class="section-body">
          <div class="preview-fit-toggle" @mousedown.stop @touchstart.stop>
            <button
              type="button"
              class="fit-btn"
              :class="{ active: previewFitMode === 'cover' }"
              @click="setPreviewFitMode('cover')"
            >
              Fill
            </button>
            <button
              type="button"
              class="fit-btn"
              :class="{ active: previewFitMode === 'contain' }"
              @click="setPreviewFitMode('contain')"
            >
              Fit
            </button>
          </div>

          <div
            class="wipe-container"
            ref="wipeContainer"
            @mousedown="startWipeDrag"
            @touchstart="startWipeDrag"
          >
            <!-- Source Image Canvas (Before) -->
            <canvas ref="canvasBefore" class="wipe-canvas before-canvas" :style="wipeCanvasStyle"></canvas>
            
            <!-- Processed Image Canvas (After) -->
            <canvas v-show="!fallbackAfterSrc" ref="canvasAfter" class="wipe-canvas after-canvas" :style="[wipeStyle, wipeCanvasStyle]"></canvas>

            <!-- Fallback After Image (backend-processed thumbnail) -->
            <img v-show="!!fallbackAfterSrc" :src="fallbackAfterSrc || undefined" class="wipe-canvas after-canvas" :style="[wipeStyle, wipeCanvasStyle]" alt="Processed preview" />
            
            <!-- Wipe Splitter Handle -->
            <div class="wipe-handle" :style="handleStyle" @mousedown="startWipeDrag" @touchstart="startWipeDrag">
              <div class="handle-line"></div>
              <div class="handle-thumb">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
                </svg>
              </div>
            </div>

            <!-- Labels -->
            <div class="wipe-label before-label">Before</div>
            <div class="wipe-label after-label">After</div>

            <!-- Empty Placeholder -->
            <div v-if="!hasImage" class="preview-placeholder">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p>Queue workflow once to generate image proxy</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Tonal Curves Editor -->
      <div class="panel-section curves-panel" :class="{ 'is-collapsed': collapsedSections.curves }">
        <div class="section-header" @click="toggleSection('curves')">
          <span class="section-title">RGB Tonal Curves</span>
          <span class="collapse-icon">{{ collapsedSections.curves ? '▼' : '▲' }}</span>
        </div>

        <div v-show="!collapsedSections.curves" class="section-body">
          <!-- Channel Selector -->
          <div class="channel-tabs">
            <button 
              v-for="ch in ['rgb', 'r', 'g', 'b']" 
              :key="ch" 
              class="tab-btn" 
              :class="['tab-' + ch, { active: activeChannel === ch }]"
              @click="activeChannel = ch"
            >
              {{ ch.toUpperCase() }}
            </button>
            <button
              class="remove-point-btn"
              :disabled="!canRemoveSelectedKnot"
              @click="removeSelectedKnot"
            >
              Select & Remove
            </button>
            <button class="reset-sub-btn" @click="resetCurve(activeChannel)">Reset Curve</button>
          </div>

          <!-- Curve Grid SVG -->
          <div class="curve-editor-container">
            <svg 
              ref="curveSvg" 
              class="curve-svg" 
              viewBox="0 0 256 256"
              @mousedown="onCurveMouseDown"
              @mousemove="onCurveMouseMove"
              @mouseup="onCurveMouseUp"
              @mouseleave="onCurveMouseLeave"
            >
              <!-- Grid lines -->
              <line x1="64" y1="0" x2="64" y2="256" class="grid-line" />
              <line x1="128" y1="0" x2="128" y2="256" class="grid-line" />
              <line x1="192" y1="0" x2="192" y2="256" class="grid-line" />
              <line x1="0" y1="64" x2="256" y2="64" class="grid-line" />
              <line x1="0" y1="128" x2="256" y2="128" class="grid-line" />
              <line x1="0" y1="192" x2="256" y2="192" class="grid-line" />
              <line x1="0" y1="0" x2="256" y2="256" class="diagonal-line" />

              <!-- Curve paths (underlay inactive) -->
              <path 
                v-for="ch in ['rgb', 'r', 'g', 'b'].filter(c => c !== activeChannel)"
                :key="'path-' + ch"
                :d="getCurvePath(ch)" 
                class="curve-path-inactive"
                :class="'curve-' + ch"
              />

              <!-- Active channel path -->
              <path :d="getCurvePath(activeChannel)" class="curve-path-active" :class="'curve-' + activeChannel" />

              <!-- Spline knots/control points -->
              <g class="knots-group">
                <circle 
                  v-for="(point, idx) in params.curves[activeChannel]" 
                  :key="'knot-' + idx"
                  :cx="point[0] * 256" 
                  :cy="256 - (point[1] * 256)" 
                  r="6" 
                  class="curve-knot"
                  :class="{ selected: selectedKnotIndex === idx, 'endpoint': idx === 0 || idx === params.curves[activeChannel].length - 1 }"
                  @mousedown.stop="selectKnot(idx, $event)"
                  @dblclick.stop="removeKnot(idx, $event)"
                />
              </g>

              <!-- Values tooltip overlay -->
              <text v-if="hoverCoord" :x="10" :y="20" class="coord-tooltip">
                IN: {{ Math.round(hoverCoord[0] * 255) }}  OUT: {{ Math.round(hoverCoord[1] * 255) }}
              </text>
            </svg>
          </div>

          <!-- Live Histogram -->
          <div class="histogram-container">
            <div class="histogram-header">Live Output Histogram</div>
            <svg class="histogram-svg" viewBox="0 0 256 100" preserveAspectRatio="none">
              <!-- Render background histogram channels -->
              <path v-if="activeChannel === 'rgb' || activeChannel === 'r'" :d="getHistogramPath('r')" class="hist-path hist-r" />
              <path v-if="activeChannel === 'rgb' || activeChannel === 'g'" :d="getHistogramPath('g')" class="hist-path hist-g" />
              <path v-if="activeChannel === 'rgb' || activeChannel === 'b'" :d="getHistogramPath('b')" class="hist-path hist-b" />
              <path v-if="activeChannel === 'rgb'" :d="getHistogramPath('lum')" class="hist-path hist-lum" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Section 3: Color Balancing & Gradient Map -->
      <div class="panel-section color-map-panel" :class="{ 'is-collapsed': collapsedSections.colorMap }">
        <div class="section-header" @click="toggleSection('colorMap')">
          <span class="section-title">Color Balancing & Gradient Map</span>
          <span class="collapse-icon">{{ collapsedSections.colorMap ? '▼' : '▲' }}</span>
        </div>

        <div v-show="!collapsedSections.colorMap" class="section-body">
          <div class="gradient-map-controls">
            <!-- Toggle Enable -->
            <div class="control-row">
              <label class="control-label">Enable Gradient Map</label>
              <input type="checkbox" v-model="params.gradient_map.enabled" @change="onParamChange" class="gradient-checkbox" />
            </div>

            <div v-if="params.gradient_map.enabled" class="gradient-editor-box">
              <!-- Blending mode -->
              <div class="control-row">
                <label class="control-label">Blending Mode</label>
                <select v-model="params.gradient_map.blending_mode" @change="onParamChange" class="styled-select">
                  <option v-for="mode in ['Normal', 'Overlay', 'Soft Light', 'Multiply', 'Screen']" :key="mode" :value="mode">
                    {{ mode }}
                  </option>
                </select>
              </div>

              <!-- Opacity -->
              <div class="control-row-vertical">
                <div class="slider-labels">
                  <span class="control-label">Opacity</span>
                  <span class="value-display">{{ Math.round(params.gradient_map.opacity * 100) }}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  :value="params.gradient_map.opacity * 100" 
                  @input="params.gradient_map.opacity = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                  class="styled-range" 
                />
              </div>

              <!-- Gradient Visualizer and Stops Editor -->
              <div class="gradient-stops-section">
                <label class="control-label">Gradient Stops (Click to add, Drag offset, Double click to remove)</label>
                
                <div 
                  class="gradient-bar-track" 
                  ref="gradientBar"
                  :style="gradientBarStyle"
                  @mousedown="onGradientBarMouseDown"
                >
                  <!-- Stops sliders -->
                  <div 
                    v-for="(stop, idx) in params.gradient_map.stops" 
                    :key="'stop-' + idx"
                    class="gradient-stop-marker"
                    :style="{ left: (stop.offset * 100) + '%' }"
                    @mousedown.stop="startStopDrag(idx, $event)"
                    @dblclick.stop="removeStop(idx)"
                  >
                    <div class="marker-pin" :style="{ backgroundColor: stop.color }"></div>
                  </div>
                </div>

                <!-- Stop editing -->
                <div v-if="activeStopIndex !== null && params.gradient_map.stops[activeStopIndex]" class="stop-editor-bar">
                  <div class="editor-title">Stop #{{ activeStopIndex + 1 }}</div>
                  <div class="stop-inputs">
                    <div class="stop-input-group">
                      <label>Offset:</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        :value="Math.round(params.gradient_map.stops[activeStopIndex].offset * 100)"
                        @input="setStopOffset(activeStopIndex, parseInt(($event.target as HTMLInputElement).value) / 100)"
                        class="stop-num-input"
                      />%
                    </div>
                    <div class="stop-input-group">
                      <label>Color:</label>
                      <input 
                        type="color" 
                        v-model="params.gradient_map.stops[activeStopIndex].color"
                        @input="onParamChange" 
                        class="stop-color-picker"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Shaders and Effects -->
      <div class="panel-section effects-panel" :class="{ 'is-collapsed': collapsedSections.effects }">
        <div class="section-header" @click="toggleSection('effects')">
          <span class="section-title">Post-Processing Effects</span>
          <span class="collapse-icon">{{ collapsedSections.effects ? '▼' : '▲' }}</span>
        </div>

        <div v-show="!collapsedSections.effects" class="section-body">
          <div class="effects-sliders">
            <!-- Chromatic Aberration -->
            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Chromatic Aberration</span>
                <span class="value-display">{{ params.chromatic_aberration.toFixed(3) }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                :value="params.chromatic_aberration * 1000" 
                @input="params.chromatic_aberration = parseFloat(($event.target as HTMLInputElement).value) / 1000; onParamChange()"
                class="styled-range" 
              />
            </div>

            <!-- Cinematic Film Grain -->
            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Cinematic Film Grain</span>
                <span class="value-display">{{ params.film_grain.toFixed(3) }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="params.film_grain * 1000" 
                @input="params.film_grain = parseFloat(($event.target as HTMLInputElement).value) / 1000; onParamChange()"
                class="styled-range" 
              />
            </div>

            <!-- Sharpening -->
            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Sharpen Intensity</span>
                <span class="value-display">{{ params.sharpen.toFixed(2) }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                :value="params.sharpen * 100" 
                @input="params.sharpen = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range" 
              />
            </div>

            <!-- Vignette Falloff -->
            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Vignette Falloff</span>
                <span class="value-display">{{ params.vignette_intensity.toFixed(2) }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                :value="params.vignette_intensity * 100" 
                @input="params.vignette_intensity = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range" 
              />
            </div>

            <div class="effects-group-title">Exposure / Contrast / Saturation</div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Exposure (Stops)</span>
                <span class="value-display">{{ params.exposure_contrast_saturation.exposure.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                :value="params.exposure_contrast_saturation.exposure * 100"
                @input="params.exposure_contrast_saturation.exposure = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Contrast</span>
                <span class="value-display">{{ params.exposure_contrast_saturation.contrast.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                :value="params.exposure_contrast_saturation.contrast * 100"
                @input="params.exposure_contrast_saturation.contrast = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Saturation</span>
                <span class="value-display">{{ params.exposure_contrast_saturation.saturation.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                :value="params.exposure_contrast_saturation.saturation * 100"
                @input="params.exposure_contrast_saturation.saturation = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="effects-group-title">Lift / Gamma / Gain</div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Lift</span>
                <span class="value-display">{{ params.lift_gamma_gain.lift.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                :value="params.lift_gamma_gain.lift * 100"
                @input="params.lift_gamma_gain.lift = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Gamma</span>
                <span class="value-display">{{ params.lift_gamma_gain.gamma.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="10"
                max="400"
                :value="params.lift_gamma_gain.gamma * 100"
                @input="params.lift_gamma_gain.gamma = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Gain</span>
                <span class="value-display">{{ params.lift_gamma_gain.gain.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                :value="params.lift_gamma_gain.gain * 100"
                @input="params.lift_gamma_gain.gain = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="effects-group-title">Bloom</div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Intensity</span>
                <span class="value-display">{{ params.bloom.intensity.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                :value="params.bloom.intensity * 100"
                @input="params.bloom.intensity = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Threshold</span>
                <span class="value-display">{{ params.bloom.threshold.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                :value="params.bloom.threshold * 100"
                @input="params.bloom.threshold = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>

            <div class="control-row-vertical">
              <div class="slider-labels">
                <span class="control-label">Radius</span>
                <span class="value-display">{{ params.bloom.radius.toFixed(2) }}</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                :value="params.bloom.radius * 100"
                @input="params.bloom.radius = parseFloat(($event.target as HTMLInputElement).value) / 100; onParamChange()"
                class="styled-range"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted, onUnmounted, type PropType } from "vue";

// Define states interfaces
interface Stop {
  offset: number;
  color: string;
}

interface CurvesState {
  rgb: [number, number][];
  r: [number, number][];
  g: [number, number][];
  b: [number, number][];
}

interface GradingPayload {
  curves: CurvesState;
  chromatic_aberration: number;
  film_grain: number;
  sharpen: number;
  vignette_intensity: number;
  exposure_contrast_saturation: {
    exposure: number;
    contrast: number;
    saturation: number;
  };
  lift_gamma_gain: {
    lift: number;
    gamma: number;
    gain: number;
  };
  bloom: {
    intensity: number;
    threshold: number;
    radius: number;
  };
  gradient_map: {
    enabled: boolean;
    stops: Stop[];
    blending_mode: "Normal" | "Overlay" | "Soft Light" | "Multiply" | "Screen";
    opacity: number;
  };
}

const DEFAULT_PAYLOAD = (): GradingPayload => ({
  curves: {
    rgb: [[0.0, 0.0], [1.0, 1.0]],
    r: [[0.0, 0.0], [1.0, 1.0]],
    g: [[0.0, 0.0], [1.0, 1.0]],
    b: [[0.0, 0.0], [1.0, 1.0]]
  },
  chromatic_aberration: 0.0,
  film_grain: 0.0,
  sharpen: 0.0,
  vignette_intensity: 0.0,
  exposure_contrast_saturation: {
    exposure: 0.0,
    contrast: 1.0,
    saturation: 1.0
  },
  lift_gamma_gain: {
    lift: 0.0,
    gamma: 1.0,
    gain: 1.0
  },
  bloom: {
    intensity: 0.0,
    threshold: 0.8,
    radius: 2.0
  },
  gradient_map: {
    enabled: false,
    stops: [
      { offset: 0.0, color: "#000000" },
      { offset: 1.0, color: "#ffffff" }
    ],
    blending_mode: "Normal",
    opacity: 1.0
  }
});

export default defineComponent({
  name: "RealTimeGradingProcessor",
  props: {
    initialParams: {
      type: String,
      default: "{}"
    },
    nodeId: {
      type: Number,
      required: true
    },
    onChange: {
      type: Function as PropType<(json: string) => void>,
      required: true
    },
    onResize: {
      type: Function as PropType<(height: number) => void>,
      required: true
    }
  },
  setup(props) {
    // Reactive State Variables
    const params = reactive<GradingPayload>(DEFAULT_PAYLOAD());
    
    const collapsedSections = reactive({
      preview: false,
      curves: false,
      colorMap: false,
      effects: false
    });

    const activeChannel = ref<keyof CurvesState>("rgb");
    const selectedKnotIndex = ref<number | null>(null);
    const isDraggingKnot = ref(false);
    const hoverCoord = ref<[number, number] | null>(null);

    const hasImage = ref(false);
    const wipePercentage = ref(50);
    const isWiping = ref(false);
    const fallbackAfterSrc = ref<string | null>(null);
    const previewFitMode = ref<"cover" | "contain">("cover");

    const activeStopIndex = ref<number | null>(null);

    // WebGL Canvas references
    const canvasBefore = ref<HTMLCanvasElement | null>(null);
    const canvasAfter = ref<HTMLCanvasElement | null>(null);
    const wipeContainer = ref<HTMLDivElement | null>(null);
    const curveSvg = ref<SVGElement | null>(null);
    const gradientBar = ref<HTMLDivElement | null>(null);

    // Image reference and proxy texture data
    let proxyImageElement: HTMLImageElement | null = null;
    let webglContext: WebGL2RenderingContext | null = null;
    let webglProgram: WebGLProgram | null = null;
    let imageTexture: WebGLTexture | null = null;
    let lutTexture: WebGLTexture | null = null;
    let gradTexture: WebGLTexture | null = null;
    let webglReady = false;

    // Cache of calculated lookup tables
    const luts = reactive({
      rgb: new Float32Array(256),
      r: new Float32Array(256),
      g: new Float32Array(256),
      b: new Float32Array(256)
    });

    // Histogram state (computed in JS or loaded from PyTorch telemetry)
    const histogramData = reactive({
      r: new Array(256).fill(0),
      g: new Array(256).fill(0),
      b: new Array(256).fill(0),
      lum: new Array(256).fill(0)
    });

    // Dynamic styles
    const wipeStyle = computed(() => ({
      // Show processed "After" image on the RIGHT side of the splitter.
      clipPath: `polygon(${wipePercentage.value}% 0, 100% 0, 100% 100%, ${wipePercentage.value}% 100%)`
    }));

    const handleStyle = computed(() => ({
      left: `${wipePercentage.value}%`
    }));

    const wipeCanvasStyle = computed(() => ({
      objectFit: previewFitMode.value
    }));

    const gradientBarStyle = computed(() => {
      if (!params.gradient_map.stops.length) return { background: "#000" };
      const stopsStr = [...params.gradient_map.stops]
        .sort((a, b) => a.offset - b.offset)
        .map(s => `${s.color} ${s.offset * 100}%`)
        .join(", ");
      return {
        background: `linear-gradient(to right, ${stopsStr})`
      };
    });

    // Monotone Cubic Spline math
    function interpolateMonotoneCubic(points: [number, number][] | undefined): Float32Array {
      const lut = new Float32Array(256);
      if (!Array.isArray(points) || points.length < 2) {
        for (let i = 0; i < 256; i++) lut[i] = i / 255;
        return lut;
      }

      const sorted = [...points].sort((a, b) => a[0] - b[0]);
      const xs = sorted.map(p => p[0]);
      const ys = sorted.map(p => p[1]);

      for (let i = 1; i < xs.length; i++) {
        if (xs[i] <= xs[i - 1]) {
          xs[i] = xs[i - 1] + 1e-5;
        }
      }

      const n = xs.length;
      const ms = new Float32Array(n - 1);
      for (let i = 0; i < n - 1; i++) {
        ms[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
      }

      const ds = new Float32Array(n);
      ds[0] = ms[0];
      ds[n - 1] = ms[n - 2];
      for (let i = 1; i < n - 1; i++) {
        ds[i] = (ms[i - 1] + ms[i]) / 2.0;
      }

      for (let i = 0; i < n - 1; i++) {
        if (ms[i] === 0.0) {
          ds[i] = 0.0;
          ds[i + 1] = 0.0;
        } else {
          const alpha = ds[i] / ms[i];
          const beta = ds[i + 1] / ms[i];
          const val = alpha * alpha + beta * beta;
          if (val > 9.0) {
            const tau = 3.0 / Math.sqrt(val);
            ds[i] = tau * alpha * ms[i];
            ds[i + 1] = tau * beta * ms[i];
          }
        }
      }

      for (let idx = 0; idx < 256; idx++) {
        const x = idx / 255;
        if (x <= xs[0]) {
          lut[idx] = Math.max(0, Math.min(1, ys[0]));
          continue;
        }
        if (x >= xs[n - 1]) {
          lut[idx] = Math.max(0, Math.min(1, ys[n - 1]));
          continue;
        }

        let i = 0;
        while (i < n - 1 && x > xs[i + 1]) {
          i++;
        }

        const h = xs[i + 1] - xs[i];
        const t = (x - xs[i]) / h;

        const h00 = 2.0 * t * t * t - 3.0 * t * t + 1.0;
        const h10 = t * t * t - 2.0 * t * t + t;
        const h01 = -2.0 * t * t * t + 3.0 * t * t;
        const h11 = t * t * t - t * t;

        const val = h00 * ys[i] + h10 * h * ds[i] + h01 * ys[i + 1] + h11 * h * ds[i + 1];
        lut[idx] = Math.max(0, Math.min(1, val));
      }

      return lut;
    }

    // Refresh LUT values cache
    function recalculateLuts() {
      luts.rgb = interpolateMonotoneCubic(params.curves.rgb);
      luts.r = interpolateMonotoneCubic(params.curves.r);
      luts.g = interpolateMonotoneCubic(params.curves.g);
      luts.b = interpolateMonotoneCubic(params.curves.b);
    }

    // Render curves as SVG path
    function getCurvePath(channel: keyof CurvesState): string {
      const p = params.curves[channel];
      const lut = interpolateMonotoneCubic(p);
      let d = `M 0 ${256 - lut[0] * 256}`;
      for (let i = 1; i < 256; i++) {
        d += ` L ${i} ${256 - lut[i] * 256}`;
      }
      return d;
    }

    // WebGL Shader Compilation
    const VS_SOURCE = `#version 300 es
      in vec2 position;
      in vec2 texCoord;
      out vec2 v_texCoord;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        v_texCoord = texCoord;
      }
    `;

    const FS_SOURCE = `#version 300 es
      precision highp float;
      uniform sampler2D u_image;
      uniform sampler2D u_curvesLut;
      uniform sampler2D u_gradientMap;
      uniform int u_gradientEnabled;
      uniform float u_gradientOpacity;
      uniform int u_gradientBlendingMode; // 0: Normal, 1: Overlay, 2: Soft Light, 3: Multiply, 4: Screen

      uniform float u_chromatic_aberration;
      uniform float u_grain_intensity;
      uniform float u_time;
      uniform float u_sharpen_intensity;
      uniform float u_vignette_intensity;
      uniform float u_exposure;
      uniform float u_contrast;
      uniform float u_saturation;
      uniform float u_lift;
      uniform float u_gamma;
      uniform float u_gain;
      uniform float u_bloom_intensity;
      uniform float u_bloom_threshold;
      uniform float u_bloom_radius;

      in vec2 v_texCoord;
      out vec4 fragColor;

      vec3 blendOverlay(vec3 base, vec3 blend) {
        return mix(
          2.0 * base * blend,
          1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
          step(0.5, base)
        );
      }

      vec3 blendSoftLight(vec3 base, vec3 blend) {
        return (1.0 - 2.0 * blend) * base * base + 2.0 * blend * base;
      }

      vec3 applyEcsLgg(vec3 inputColor) {
        vec3 color = inputColor * pow(2.0, u_exposure);
        color = (color - 0.5) * u_contrast + 0.5;

        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = vec3(luminance) + (color - vec3(luminance)) * u_saturation;

        color = color + vec3(u_lift);
        color = pow(max(color, vec3(1e-6)), vec3(1.0 / max(u_gamma, 1e-3)));
        color = color * vec3(u_gain);
        return clamp(color, 0.0, 1.0);
      }

      vec3 applyCurves(vec3 color) {
        float rGraded = texture(u_curvesLut, vec2(color.r, 0.5)).r;
        float gGraded = texture(u_curvesLut, vec2(color.g, 0.5)).g;
        float bGraded = texture(u_curvesLut, vec2(color.b, 0.5)).b;

        rGraded = texture(u_curvesLut, vec2(rGraded, 0.5)).a;
        gGraded = texture(u_curvesLut, vec2(gGraded, 0.5)).a;
        bGraded = texture(u_curvesLut, vec2(bGraded, 0.5)).a;

        return clamp(vec3(rGraded, gGraded, bGraded), 0.0, 1.0);
      }

      vec3 applyGradientMap(vec3 color) {
        if (u_gradientEnabled != 1) {
          return color;
        }

        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        vec3 gradColor = texture(u_gradientMap, vec2(luminance, 0.5)).rgb;

        vec3 blended;
        if (u_gradientBlendingMode == 0) {
          blended = gradColor;
        } else if (u_gradientBlendingMode == 1) {
          blended = blendOverlay(color, gradColor);
        } else if (u_gradientBlendingMode == 2) {
          blended = blendSoftLight(color, gradColor);
        } else if (u_gradientBlendingMode == 3) {
          blended = color * gradColor;
        } else if (u_gradientBlendingMode == 4) {
          blended = 1.0 - (1.0 - color) * (1.0 - gradColor);
        } else {
          blended = gradColor;
        }

        return mix(color, blended, u_gradientOpacity);
      }

      vec3 processSampleColor(vec2 sampleUv) {
        vec3 sampled = texture(u_image, sampleUv).rgb;
        sampled = applyEcsLgg(sampled);
        sampled = applyCurves(sampled);
        sampled = applyGradientMap(sampled);
        return sampled;
      }

      void main() {
        vec2 uv = v_texCoord;
        
        // 1. Sharpening
        vec3 centerColor = texture(u_image, uv).rgb;
        if (u_sharpen_intensity > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(u_image, 0));
          vec3 left = texture(u_image, uv - vec2(texelSize.x, 0.0)).rgb;
          vec3 right = texture(u_image, uv + vec2(texelSize.x, 0.0)).rgb;
          vec3 top = texture(u_image, uv - vec2(0.0, texelSize.y)).rgb;
          vec3 bottom = texture(u_image, uv + vec2(0.0, texelSize.y)).rgb;
          
          vec3 laplacian = 4.0 * centerColor - left - right - top - bottom;
          centerColor = clamp(centerColor + u_sharpen_intensity * laplacian, 0.0, 1.0);
        }
        
        // 2. Chromatic Aberration
        vec2 centerToUV = uv - vec2(0.5);
        float dist = length(centerToUV);
        vec3 color = centerColor;
        if (u_chromatic_aberration > 0.0) {
          vec2 offset = normalize(centerToUV) * dist * dist * u_chromatic_aberration;
          color.r = texture(u_image, uv + offset).r;
          color.g = centerColor.g;
          color.b = texture(u_image, uv - offset).b;
        }

        color = applyEcsLgg(color);
        
        // 3. Tonal Curves
        color = applyCurves(color);
        
        // 4. Gradient Map
        color = applyGradientMap(color);

        // 5. Bloom
        if (u_bloom_intensity > 0.0 && u_bloom_radius > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(u_image, 0));
          vec2 bloomStep = texelSize * u_bloom_radius;
          float bloomMaskDenom = max(1e-6, 1.0 - u_bloom_threshold);

          vec3 bloomAccum = vec3(0.0);
          float weightAccum = 0.0;

          float centerWeight = 0.227027;
          float centerLum = dot(color, vec3(0.2126, 0.7152, 0.0722));
          float centerMask = clamp((centerLum - u_bloom_threshold) / bloomMaskDenom, 0.0, 1.0);
          bloomAccum += color * centerMask * centerWeight;
          weightAccum += centerWeight;

          float nearWeight = 0.316216;
          vec2 nearOffsets[4];
          nearOffsets[0] = vec2(1.3846, 0.0);
          nearOffsets[1] = vec2(-1.3846, 0.0);
          nearOffsets[2] = vec2(0.0, 1.3846);
          nearOffsets[3] = vec2(0.0, -1.3846);

          for (int i = 0; i < 4; i++) {
            vec3 sampleColor = processSampleColor(uv + nearOffsets[i] * bloomStep);
            float sampleLum = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
            float sampleMask = clamp((sampleLum - u_bloom_threshold) / bloomMaskDenom, 0.0, 1.0);
            bloomAccum += sampleColor * sampleMask * nearWeight;
            weightAccum += nearWeight;
          }

          float farWeight = 0.070270;
          vec2 farOffsets[4];
          farOffsets[0] = vec2(3.2308, 3.2308);
          farOffsets[1] = vec2(-3.2308, 3.2308);
          farOffsets[2] = vec2(3.2308, -3.2308);
          farOffsets[3] = vec2(-3.2308, -3.2308);

          for (int i = 0; i < 4; i++) {
            vec3 sampleColor = processSampleColor(uv + farOffsets[i] * bloomStep);
            float sampleLum = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
            float sampleMask = clamp((sampleLum - u_bloom_threshold) / bloomMaskDenom, 0.0, 1.0);
            bloomAccum += sampleColor * sampleMask * farWeight;
            weightAccum += farWeight;
          }

          vec3 bloom = bloomAccum / max(weightAccum, 1e-6);
          color = clamp(color + bloom * u_bloom_intensity, 0.0, 1.0);
        }
        
        // 6. Vignette Falloff
        if (u_vignette_intensity > 0.0) {
          float rawDist = length(uv - vec2(0.5)) * 2.0;
          float vignette = clamp(1.0 - (rawDist * rawDist * u_vignette_intensity), 0.0, 1.0);
          color *= vignette;
        }
        
        // 7. Film Grain
        if (u_grain_intensity > 0.0) {
          float noise = fract(sin(dot(uv.xy + u_time, vec2(12.9898, 78.233))) * 43758.5453);
          float grainAmount = (noise - 0.5) * u_grain_intensity;
          color = clamp(color + grainAmount, 0.0, 1.0);
        }
        
        fragColor = vec4(color, 1.0);
      }
    `;

    function initWebGL() {
      const canvas = canvasAfter.value;
      if (!canvas) return;

      webglReady = false;
      webglContext = null;
      webglProgram = null;
      imageTexture = null;
      lutTexture = null;
      gradTexture = null;

      const gl = canvas.getContext("webgl2");
      if (!gl) {
        console.warn("[Duffy_RealTimeGradingProcessor] WebGL2 not supported. Falling back to backend processed preview.");
        return;
      }

      // Compile Shaders
      const vs = gl.createShader(gl.VERTEX_SHADER);
      if (!vs) return;
      gl.shaderSource(vs, VS_SOURCE);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error("VS compilation failed:", gl.getShaderInfoLog(vs));
        return;
      }

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fs) return;
      gl.shaderSource(fs, FS_SOURCE);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error("FS compilation failed:", gl.getShaderInfoLog(fs));
        return;
      }

      // Link Program
      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking failed:", gl.getProgramInfoLog(program));
        return;
      }
      webglProgram = program;

      // Set quad coordinates
      const vertices = new Float32Array([
        -1, -1,  0, 0,
         1, -1,  1, 0,
        -1,  1,  0, 1,
        -1,  1,  0, 1,
         1, -1,  1, 0,
         1,  1,  1, 1
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const posAttr = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 16, 0);

      const texAttr = gl.getAttribLocation(program, "texCoord");
      gl.enableVertexAttribArray(texAttr);
      gl.vertexAttribPointer(texAttr, 2, gl.FLOAT, false, 16, 8);

      // Create textures
      imageTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      lutTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gradTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      webglContext = gl;
      webglReady = !!(webglProgram && imageTexture && lutTexture && gradTexture);
    }

    // Upload Tonal Curve LUT data
    function updateLutTexture() {
      const gl = webglContext;
      if (!gl || !lutTexture) return;

      recalculateLuts();

      // Create 256x1 RGBA pixel array representing Red, Green, Blue, and Master curves
      const data = new Uint8Array(256 * 4);
      for (let i = 0; i < 256; i++) {
        data[i * 4 + 0] = Math.round(luts.r[i] * 255);
        data[i * 4 + 1] = Math.round(luts.g[i] * 255);
        data[i * 4 + 2] = Math.round(luts.b[i] * 255);
        data[i * 4 + 3] = Math.round(luts.rgb[i] * 255);
      }

      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }

    // Upload Gradient Map texture data
    function updateGradientTexture() {
      const gl = webglContext;
      if (!gl || !gradTexture) return;

      // Draw CSS gradient onto a hidden 256x1 canvas
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      const stops = [...params.gradient_map.stops].sort((a, b) => a.offset - b.offset);
      
      if (stops.length > 0) {
        stops.forEach(s => grad.addColorStop(s.offset, s.color));
      } else {
        grad.addColorStop(0.0, "#000000");
        grad.addColorStop(1.0, "#ffffff");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 1);

      const imgData = ctx.getImageData(0, 0, 256, 1);

      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, imgData.data);
    }

    // Render loop
    function renderWebGL() {
      const gl = webglContext;
      const program = webglProgram;
      const canvas = canvasAfter.value;
      if (!webglReady || !gl || !program || !canvas || !proxyImageElement) return;

      gl.useProgram(program);

      // Set image dimensions
      canvas.width = proxyImageElement.naturalWidth || 512;
      canvas.height = proxyImageElement.naturalHeight || 512;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Bind input texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);

      // Bind Curves LUT texture
      updateLutTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_curvesLut"), 1);

      // Bind Gradient Map texture
      updateGradientTexture();
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_gradientMap"), 2);

      // Bind remaining parameter uniforms
      gl.uniform1i(gl.getUniformLocation(program, "u_gradientEnabled"), params.gradient_map.enabled ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(program, "u_gradientOpacity"), params.gradient_map.opacity);
      
      const modes = ["Normal", "Overlay", "Soft Light", "Multiply", "Screen"];
      const blendIndex = Math.max(0, modes.indexOf(params.gradient_map.blending_mode));
      gl.uniform1i(gl.getUniformLocation(program, "u_gradientBlendingMode"), blendIndex);

      gl.uniform1f(gl.getUniformLocation(program, "u_chromatic_aberration"), params.chromatic_aberration);
      gl.uniform1f(gl.getUniformLocation(program, "u_grain_intensity"), params.film_grain);
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), performance.now() / 1000);
      gl.uniform1f(gl.getUniformLocation(program, "u_sharpen_intensity"), params.sharpen);
      gl.uniform1f(gl.getUniformLocation(program, "u_vignette_intensity"), params.vignette_intensity);
      gl.uniform1f(gl.getUniformLocation(program, "u_exposure"), params.exposure_contrast_saturation.exposure);
      gl.uniform1f(gl.getUniformLocation(program, "u_contrast"), params.exposure_contrast_saturation.contrast);
      gl.uniform1f(gl.getUniformLocation(program, "u_saturation"), params.exposure_contrast_saturation.saturation);
      gl.uniform1f(gl.getUniformLocation(program, "u_lift"), params.lift_gamma_gain.lift);
      gl.uniform1f(gl.getUniformLocation(program, "u_gamma"), params.lift_gamma_gain.gamma);
      gl.uniform1f(gl.getUniformLocation(program, "u_gain"), params.lift_gamma_gain.gain);
      gl.uniform1f(gl.getUniformLocation(program, "u_bloom_intensity"), params.bloom.intensity);
      gl.uniform1f(gl.getUniformLocation(program, "u_bloom_threshold"), params.bloom.threshold);
      gl.uniform1f(gl.getUniformLocation(program, "u_bloom_radius"), params.bloom.radius);

      // Render
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Read back pixels to compute real-time proxy histogram
      computeClientHistogram();
    }

    // Downsamples rendering output to compute proxy histograms in Javascript
    function computeClientHistogram() {
      const gl = webglContext;
      const canvas = canvasAfter.value;
      if (!gl || !canvas) return;

      // Downscale readback block size to prevent blocking browser compositor thread
      const rw = 128;
      const rh = 128;
      const pixels = new Uint8Array(rw * rh * 4);
      
      // Read current color buffer
      gl.readPixels(0, 0, rw, rh, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      const rHist = new Array(256).fill(0);
      const gHist = new Array(256).fill(0);
      const bHist = new Array(256).fill(0);
      const lumHist = new Array(256).fill(0);

      const total = rw * rh;
      for (let i = 0; i < total; i++) {
        const r = pixels[i * 4 + 0];
        const g = pixels[i * 4 + 1];
        const b = pixels[i * 4 + 2];
        const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

        rHist[r]++;
        gHist[g]++;
        bHist[b]++;
        lumHist[lum]++;
      }

      // Smooth values slightly to render nicer SVG paths
      const smoothFactor = 1.0 / total;
      for (let i = 0; i < 256; i++) {
        histogramData.r[i] = rHist[i] * smoothFactor;
        histogramData.g[i] = gHist[i] * smoothFactor;
        histogramData.b[i] = bHist[i] * smoothFactor;
        histogramData.lum[i] = lumHist[i] * smoothFactor;
      }
    }

    // Format histogram channel as SVG line path
    function getHistogramPath(channel: "r" | "g" | "b" | "lum"): string {
      const hist = histogramData[channel];
      const maxVal = Math.max(...hist, 0.001);
      
      let d = `M 0 100`;
      for (let i = 0; i < 256; i++) {
        const x = i;
        const y = 100 - (hist[i] / maxVal) * 90;
        d += ` L ${x} ${y}`;
      }
      d += ` L 255 100 Z`;
      return d;
    }

    // Hydrate state from widget serialized JSON
    function hydrateState(jsonStr: string) {
      try {
        const data = JSON.parse(jsonStr);
        if (data.curves) {
          params.curves.rgb = data.curves.rgb || [[0.0, 0.0], [1.0, 1.0]];
          params.curves.r = data.curves.r || [[0.0, 0.0], [1.0, 1.0]];
          params.curves.g = data.curves.g || [[0.0, 0.0], [1.0, 1.0]];
          params.curves.b = data.curves.b || [[0.0, 0.0], [1.0, 1.0]];
        }
        
        params.chromatic_aberration = typeof data.chromatic_aberration === "number" ? data.chromatic_aberration : 0.0;
        params.film_grain = typeof data.film_grain === "number" ? data.film_grain : 0.0;
        params.sharpen = typeof data.sharpen === "number" ? data.sharpen : 0.0;
        params.vignette_intensity = typeof data.vignette_intensity === "number" ? data.vignette_intensity : 0.0;

        if (data.exposure_contrast_saturation) {
          params.exposure_contrast_saturation.exposure = typeof data.exposure_contrast_saturation.exposure === "number"
            ? data.exposure_contrast_saturation.exposure
            : 0.0;
          params.exposure_contrast_saturation.contrast = typeof data.exposure_contrast_saturation.contrast === "number"
            ? data.exposure_contrast_saturation.contrast
            : 1.0;
          params.exposure_contrast_saturation.saturation = typeof data.exposure_contrast_saturation.saturation === "number"
            ? data.exposure_contrast_saturation.saturation
            : 1.0;
        }

        if (data.lift_gamma_gain) {
          params.lift_gamma_gain.lift = typeof data.lift_gamma_gain.lift === "number" ? data.lift_gamma_gain.lift : 0.0;
          params.lift_gamma_gain.gamma = typeof data.lift_gamma_gain.gamma === "number" ? data.lift_gamma_gain.gamma : 1.0;
          params.lift_gamma_gain.gain = typeof data.lift_gamma_gain.gain === "number" ? data.lift_gamma_gain.gain : 1.0;
        }

        if (data.bloom) {
          params.bloom.intensity = typeof data.bloom.intensity === "number" ? data.bloom.intensity : 0.0;
          params.bloom.threshold = typeof data.bloom.threshold === "number" ? data.bloom.threshold : 0.8;
          params.bloom.radius = typeof data.bloom.radius === "number" ? data.bloom.radius : 2.0;
        }

        if (data.gradient_map) {
          params.gradient_map.enabled = !!data.gradient_map.enabled;
          params.gradient_map.stops = data.gradient_map.stops || [
            { offset: 0.0, color: "#000000" },
            { offset: 1.0, color: "#ffffff" }
          ];
          params.gradient_map.blending_mode = data.gradient_map.blending_mode || "Normal";
          params.gradient_map.opacity = typeof data.gradient_map.opacity === "number" ? data.gradient_map.opacity : 1.0;
        }

        recalculateLuts();
        requestDraw();
      } catch (e) {
        console.error("Hydration failed:", e);
      }
    }

    // Update parent Node state
    function onParamChange() {
      const serialized = JSON.stringify(params);
      props.onChange(serialized);
      requestDraw();
    }

    // Schedule canvas render pass
    let animFrameId = 0;
    let cleanupWipeDragListeners: (() => void) | null = null;
    let cleanupStopDragListeners: (() => void) | null = null;

    function clearWipeDragListeners() {
      if (cleanupWipeDragListeners) {
        cleanupWipeDragListeners();
        cleanupWipeDragListeners = null;
      }
    }

    function clearStopDragListeners() {
      if (cleanupStopDragListeners) {
        cleanupStopDragListeners();
        cleanupStopDragListeners = null;
      }
    }

    function requestDraw() {
      if (animFrameId) return;
      animFrameId = requestAnimationFrame(() => {
        animFrameId = 0;
        renderWebGL();
      });
    }

    // Image Loader
    function buildViewUrl(thumbnailInfo: any): string {
      const params = new URLSearchParams({
        filename: String(thumbnailInfo.filename),
        type: String(thumbnailInfo.type || "temp")
      });

      if (thumbnailInfo.subfolder) {
        params.set("subfolder", String(thumbnailInfo.subfolder));
      }

      params.set("t", String(Date.now()));
      return `/view?${params.toString()}`;
    }

    function setOriginalThumbnail(thumbnailInfo: any) {
      if (!thumbnailInfo || !thumbnailInfo.filename) return;

      const path = buildViewUrl(thumbnailInfo);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        proxyImageElement = img;
        hasImage.value = true;
        
        // Match base before canvas
        const canvasB = canvasBefore.value;
        if (canvasB) {
          canvasB.width = img.naturalWidth || 512;
          canvasB.height = img.naturalHeight || 512;
          const ctxB = canvasB.getContext("2d");
          ctxB?.drawImage(img, 0, 0);
        }

        // Setup WebGL texture
        const gl = webglContext;
        if (webglReady && gl && imageTexture) {
          gl.bindTexture(gl.TEXTURE_2D, imageTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        } else if (!fallbackAfterSrc.value) {
          // If WebGL is unavailable, keep compare functional with a static after image until processed thumbnail arrives.
          fallbackAfterSrc.value = path;
        }

        requestDraw();
      };
      img.src = path;
    }

    function setProcessedThumbnail(thumbnailInfo: any) {
      if (!thumbnailInfo || !thumbnailInfo.filename) return;

      // Always prefer backend processed thumbnail for compare reliability.
      fallbackAfterSrc.value = buildViewUrl(thumbnailInfo);
    }

    function setCompareImages(compareImages: any[]) {
      if (!Array.isArray(compareImages) || compareImages.length < 2) {
        return;
      }
      setOriginalThumbnail(compareImages[0]);
      setProcessedThumbnail(compareImages[1]);
    }

    // Inject high-precision PyTorch histogram details directly
    function setBackendHistogram(backendHist: any) {
      if (!backendHist) return;
      const smoothFactor = 1.0 / Math.max(...(backendHist.lum || [1]), 1);
      
      for (let i = 0; i < 256; i++) {
        histogramData.r[i] = (backendHist.r?.[i] || 0) * smoothFactor;
        histogramData.g[i] = (backendHist.g?.[i] || 0) * smoothFactor;
        histogramData.b[i] = (backendHist.b?.[i] || 0) * smoothFactor;
        histogramData.lum[i] = (backendHist.lum?.[i] || 0) * smoothFactor;
      }
    }

    // Curve Editor mouse drag spline logic
    function getMouseSvgCoord(e: MouseEvent): [number, number] | null {
      const svg = curveSvg.value;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
    }

    function onCurveMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      e.stopPropagation();
      const coord = getMouseSvgCoord(e);
      if (!coord) return;

      const p = params.curves[activeChannel.value] ?? [[0.0, 0.0], [1.0, 1.0]];
      if (!params.curves[activeChannel.value]) {
        params.curves[activeChannel.value] = p;
      }
      const threshold = 0.05; // Selection radius

      // Check if clicked close to an existing knot
      let foundIdx = -1;
      for (let i = 0; i < p.length; i++) {
        const dx = p[i][0] - coord[0];
        const dy = p[i][1] - coord[1];
        if (Math.sqrt(dx*dx + dy*dy) < threshold) {
          foundIdx = i;
          break;
        }
      }

      if (foundIdx !== -1) {
        selectedKnotIndex.value = foundIdx;
        isDraggingKnot.value = true;
      } else {
        // Add new point and sort curves
        p.push(coord);
        p.sort((a, b) => a[0] - b[0]);
        selectedKnotIndex.value = p.findIndex(pt => pt[0] === coord[0] && pt[1] === coord[1]);
        isDraggingKnot.value = true;
        onParamChange();
      }
    }

    function onCurveMouseMove(e: MouseEvent) {
      const coord = getMouseSvgCoord(e);
      if (!coord) return;
      
      const p = params.curves[activeChannel.value] ?? [[0.0, 0.0], [1.0, 1.0]];
      if (!params.curves[activeChannel.value]) {
        params.curves[activeChannel.value] = p;
      }
      
      // Calculate hover feedback values
      const lut = interpolateMonotoneCubic(p);
      const valOut = lut[Math.round(coord[0] * 255)];
      hoverCoord.value = [coord[0], valOut];

      if (selectedKnotIndex.value === null) return;
      if (!isDraggingKnot.value) return;
      e.stopPropagation();

      if ((e.buttons & 1) !== 1) {
        isDraggingKnot.value = false;
        return;
      }

      const idx = selectedKnotIndex.value;
      const pt = p[idx];

      // Endpoints cannot slide along the X axis
      if (idx === 0) {
        pt[1] = coord[1];
      } else if (idx === p.length - 1) {
        pt[1] = coord[1];
      } else {
        // Middle knots can slide, but must preserve sorting boundaries
        const minX = p[idx - 1][0] + 0.005;
        const maxX = p[idx + 1][0] - 0.005;
        pt[0] = Math.max(minX, Math.min(maxX, coord[0]));
        pt[1] = coord[1];
      }

      onParamChange();
    }

    function onCurveMouseUp(e: MouseEvent) {
      if (selectedKnotIndex.value !== null) {
        e.stopPropagation();
      }
      isDraggingKnot.value = false;
    }

    function onCurveMouseLeave() {
      isDraggingKnot.value = false;
      hoverCoord.value = null;
    }

    function selectKnot(idx: number, e: MouseEvent) {
      if (e.button !== 0) return;
      e.stopPropagation();
      selectedKnotIndex.value = idx;
      isDraggingKnot.value = true;
    }

    const canRemoveSelectedKnot = computed(() => {
      const p = params.curves[activeChannel.value] ?? [];
      const idx = selectedKnotIndex.value;
      if (idx === null) return false;
      if (p.length <= 2) return false;
      return idx > 0 && idx < p.length - 1;
    });

    function removeKnotByIndex(idx: number): boolean {
      const p = params.curves[activeChannel.value] ?? [[0.0, 0.0], [1.0, 1.0]];
      if (!params.curves[activeChannel.value]) {
        params.curves[activeChannel.value] = p;
      }

      // Keep both endpoints to preserve the 0..1 curve domain contract.
      if (p.length <= 2 || idx <= 0 || idx >= p.length - 1) {
        return false;
      }

      p.splice(idx, 1);

      if (selectedKnotIndex.value === idx) {
        selectedKnotIndex.value = null;
      } else if (selectedKnotIndex.value !== null && selectedKnotIndex.value > idx) {
        selectedKnotIndex.value -= 1;
      }

      onParamChange();
      return true;
    }

    function removeSelectedKnot(e?: Event) {
      e?.preventDefault();
      e?.stopPropagation();

      if (selectedKnotIndex.value === null) {
        return;
      }

      removeKnotByIndex(selectedKnotIndex.value);
    }

    function removeKnot(idx: number, e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      removeKnotByIndex(idx);
    }

    function resetCurve(channel: keyof CurvesState) {
      params.curves[channel] = [[0.0, 0.0], [1.0, 1.0]];
      selectedKnotIndex.value = null;
      onParamChange();
    }

    // Wipe Compare slider drag logic
    function updateWipeFromClientX(clientX: number) {
      const container = wipeContainer.value;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      wipePercentage.value = Math.max(0, Math.min(100, (x / rect.width) * 100));
    }

    function getClientX(e: MouseEvent | TouchEvent): number | null {
      if ("touches" in e) {
        if (!e.touches.length) return null;
        return e.touches[0].clientX;
      }
      return e.clientX;
    }

    function startWipeDrag(e: MouseEvent | TouchEvent) {
      if (e instanceof MouseEvent && e.button !== 0) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const startX = getClientX(e);
      if (startX !== null) {
        updateWipeFromClientX(startX);
      }

      clearWipeDragListeners();
      isWiping.value = true;

      const onGlobalUp = () => {
        isWiping.value = false;
        clearWipeDragListeners();
      };

      const onGlobalMove = (moveEvent: MouseEvent | TouchEvent) => {
        if (!isWiping.value) {
          return;
        }

        if (moveEvent instanceof MouseEvent && (moveEvent.buttons & 1) !== 1) {
          onGlobalUp();
          return;
        }

        if ("touches" in moveEvent) {
          moveEvent.preventDefault();
        }

        const clientX = getClientX(moveEvent);
        if (clientX === null) return;
        updateWipeFromClientX(clientX);
      };

      const onWindowBlur = () => {
        onGlobalUp();
      };

      window.addEventListener("mousemove", onGlobalMove);
      window.addEventListener("touchmove", onGlobalMove, { passive: false });
      window.addEventListener("mouseup", onGlobalUp);
      window.addEventListener("touchend", onGlobalUp);
      window.addEventListener("touchcancel", onGlobalUp);
      window.addEventListener("blur", onWindowBlur);

      cleanupWipeDragListeners = () => {
        window.removeEventListener("mousemove", onGlobalMove);
        window.removeEventListener("touchmove", onGlobalMove);
        window.removeEventListener("mouseup", onGlobalUp);
        window.removeEventListener("touchend", onGlobalUp);
        window.removeEventListener("touchcancel", onGlobalUp);
        window.removeEventListener("blur", onWindowBlur);
      };
    }

    // Gradient stops logic
    function onGradientBarMouseDown(e: MouseEvent) {
      const bar = gradientBar.value;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const offset = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      
      // Add a default white stop
      params.gradient_map.stops.push({ offset, color: "#ffffff" });
      params.gradient_map.stops.sort((a, b) => a.offset - b.offset);
      activeStopIndex.value = params.gradient_map.stops.findIndex(s => s.offset === offset);
      onParamChange();
    }

    function startStopDrag(idx: number, e: MouseEvent) {
      if (e.button !== 0) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      clearStopDragListeners();
      activeStopIndex.value = idx;

      const onGlobalUp = () => {
        params.gradient_map.stops.sort((a, b) => a.offset - b.offset);
        if (activeStopIndex.value !== null && params.gradient_map.stops.length > 0) {
          // Relocate active index after sort.
          const safeIndex = Math.max(0, Math.min(activeStopIndex.value, params.gradient_map.stops.length - 1));
          const currentOffset = params.gradient_map.stops[safeIndex]?.offset;
          if (typeof currentOffset === "number") {
            activeStopIndex.value = params.gradient_map.stops.findIndex(s => s.offset === currentOffset);
          }
        }
        clearStopDragListeners();
      };

      const onGlobalMove = (moveEvent: MouseEvent) => {
        if ((moveEvent.buttons & 1) !== 1) {
          onGlobalUp();
          return;
        }

        const bar = gradientBar.value;
        if (!bar || activeStopIndex.value === null) return;

        moveEvent.preventDefault();

        const rect = bar.getBoundingClientRect();
        const offset = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));

        // Lock edge stops slightly or let them float.
        params.gradient_map.stops[activeStopIndex.value].offset = offset;
        onParamChange();
      };

      const onWindowBlur = () => {
        onGlobalUp();
      };

      window.addEventListener("mousemove", onGlobalMove);
      window.addEventListener("mouseup", onGlobalUp);

      window.addEventListener("blur", onWindowBlur);

      cleanupStopDragListeners = () => {
        window.removeEventListener("mousemove", onGlobalMove);
        window.removeEventListener("mouseup", onGlobalUp);
        window.removeEventListener("blur", onWindowBlur);
      };
    }

    function removeStop(idx: number) {
      // Keep at least two stops
      if (params.gradient_map.stops.length <= 2) return;
      params.gradient_map.stops.splice(idx, 1);
      activeStopIndex.value = null;
      onParamChange();
    }

    function setStopOffset(idx: number, offset: number) {
      if (offset < 0 || offset > 1) return;
      params.gradient_map.stops[idx].offset = offset;
      params.gradient_map.stops.sort((a, b) => a.offset - b.offset);
      activeStopIndex.value = params.gradient_map.stops.findIndex(s => s.offset === offset);
      onParamChange();
    }

    // Toggle collapsible accordion drawers
    function toggleSection(sec: keyof typeof collapsedSections) {
      collapsedSections[sec] = !collapsedSections[sec];
      // Fire height update resize event to update container
      setTimeout(() => {
        const height = document.querySelector(".grading-panel")?.clientHeight || 750;
        props.onResize(height + 10);
      }, 50);
    }

    function resetAll() {
      const defaults = DEFAULT_PAYLOAD();

      // Deep-reset payload so all widgets and nested structures return to baseline.
      params.curves.rgb = defaults.curves.rgb.map(([x, y]) => [x, y]);
      params.curves.r = defaults.curves.r.map(([x, y]) => [x, y]);
      params.curves.g = defaults.curves.g.map(([x, y]) => [x, y]);
      params.curves.b = defaults.curves.b.map(([x, y]) => [x, y]);

      params.chromatic_aberration = defaults.chromatic_aberration;
      params.film_grain = defaults.film_grain;
      params.sharpen = defaults.sharpen;
      params.vignette_intensity = defaults.vignette_intensity;

      params.exposure_contrast_saturation.exposure = defaults.exposure_contrast_saturation.exposure;
      params.exposure_contrast_saturation.contrast = defaults.exposure_contrast_saturation.contrast;
      params.exposure_contrast_saturation.saturation = defaults.exposure_contrast_saturation.saturation;

      params.lift_gamma_gain.lift = defaults.lift_gamma_gain.lift;
      params.lift_gamma_gain.gamma = defaults.lift_gamma_gain.gamma;
      params.lift_gamma_gain.gain = defaults.lift_gamma_gain.gain;

      params.bloom.intensity = defaults.bloom.intensity;
      params.bloom.threshold = defaults.bloom.threshold;
      params.bloom.radius = defaults.bloom.radius;

      params.gradient_map.enabled = defaults.gradient_map.enabled;
      params.gradient_map.blending_mode = defaults.gradient_map.blending_mode;
      params.gradient_map.opacity = defaults.gradient_map.opacity;
      params.gradient_map.stops = defaults.gradient_map.stops.map((stop) => ({ ...stop }));

      activeChannel.value = "rgb";
      selectedKnotIndex.value = null;
      hoverCoord.value = null;
      activeStopIndex.value = null;
      wipePercentage.value = 50;
      previewFitMode.value = "cover";

      recalculateLuts();
      onParamChange();
    }

    function setPreviewFitMode(mode: "cover" | "contain") {
      previewFitMode.value = mode;
    }

    function swallowUiEvent(event: Event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof (event as any).stopImmediatePropagation === "function") {
        (event as any).stopImmediatePropagation();
      }
    }

    function onResetAllClick(event: Event) {
      swallowUiEvent(event);
      resetAll();
    }

    onMounted(() => {
      initWebGL();
      hydrateState(props.initialParams);

      // Trigger initial resize
      setTimeout(() => {
        const height = document.querySelector(".grading-panel")?.clientHeight || 750;
        props.onResize(height + 10);
      }, 100);
    });

    onUnmounted(() => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      isWiping.value = false;
      clearWipeDragListeners();
      clearStopDragListeners();
    });

    return {
      params,
      collapsedSections,
      activeChannel,
      selectedKnotIndex,
      hoverCoord,
      hasImage,
      fallbackAfterSrc,
      wipePercentage,
      activeStopIndex,
      canvasBefore,
      canvasAfter,
      wipeContainer,
      curveSvg,
      gradientBar,
      wipeStyle,
      wipeCanvasStyle,
      handleStyle,
      gradientBarStyle,
      previewFitMode,
      getHistogramPath,
      getCurvePath,
      canRemoveSelectedKnot,
      resetCurve,
      removeSelectedKnot,
      removeKnot,
      selectKnot,
      resetAll,
      onResetAllClick,
      swallowUiEvent,
      toggleSection,
      onParamChange,
      setPreviewFitMode,
      startWipeDrag,
      onCurveMouseDown,
      onCurveMouseMove,
      onCurveMouseUp,
      onCurveMouseLeave,
      onGradientBarMouseDown,
      startStopDrag,
      removeStop,
      setStopOffset,
      hydrateState,
      setOriginalThumbnail,
      setProcessedThumbnail,
      setCompareImages,
      setBackendHistogram
    };
  }
});
</script>

<style scoped>
.grading-panel {
  display: flex;
  flex-direction: column;
  background: rgba(22, 22, 23, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #e2e8f0;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 30, 32, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-top-left-radius: 11px;
  border-top-right-radius: 11px;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8fafc;
}

.node-id {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}

.reset-btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}

.scrollable-content {
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow: hidden;
}

.panel-section {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: rgba(45, 45, 48, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  overflow: hidden;
}

.preview-panel {
  order: 1;
}

.effects-panel {
  order: 2;
}

.color-map-panel {
  order: 3;
}

.curves-panel {
  order: 4;
}

.panel-section.is-collapsed {
  align-self: start;
  height: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(35, 35, 38, 0.8);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.section-header:hover {
  background: rgba(50, 50, 55, 0.9);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
}

.collapse-icon {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.section-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.preview-panel .section-body {
  overflow: hidden;
}

.preview-fit-toggle {
  display: inline-flex;
  align-self: flex-end;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: rgba(10, 12, 16, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.fit-btn {
  border: 1px solid transparent;
  background: transparent;
  color: #9aa7ba;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 5px 9px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.fit-btn:hover {
  color: #d7e2f2;
}

.fit-btn.active {
  color: #f8fafc;
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(96, 165, 250, 0.45);
}

.preview-panel .wipe-container {
  flex: 1;
  min-height: 0;
  height: 100%;
  aspect-ratio: auto;
}

/* Wipe Container */
.wipe-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
}

.wipe-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.before-canvas {
  z-index: 1;
}

.after-canvas {
  z-index: 2;
}

.wipe-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  z-index: 3;
  cursor: ew-resize;
  transform: translateX(-50%);
}

.handle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.handle-thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  transition: background 0.2s ease;
}

.wipe-handle:hover .handle-thumb {
  background: #3b82f6;
}

.wipe-label {
  position: absolute;
  top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  z-index: 4;
  pointer-events: none;
}

.before-label {
  left: 8px;
}

.after-label {
  right: 8px;
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.2);
  z-index: 5;
  text-align: center;
  padding: 20px;
}

.preview-placeholder p {
  font-size: 11px;
  margin: 0;
}

/* Curves Section */
.channel-tabs {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.tab-rgb.active { border-color: rgba(255, 255, 255, 0.5); }
.tab-r.active { border-color: rgba(239, 68, 68, 0.5); color: #f87171; }
.tab-g.active { border-color: rgba(34, 197, 94, 0.5); color: #4ade80; }
.tab-b.active { border-color: rgba(59, 130, 246, 0.5); color: #60a5fa; }

.reset-sub-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.reset-sub-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.remove-point-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.remove-point-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.45);
  color: #fecaca;
}

.remove-point-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.curve-editor-container {
  width: 100%;
  aspect-ratio: 1;
  background: #161618;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.curve-svg {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.grid-line {
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}

.diagonal-line {
  stroke: rgba(255, 255, 255, 0.02);
  stroke-width: 1;
}

.curve-path-inactive {
  fill: none;
  stroke-width: 1.5;
  opacity: 0.25;
}

.curve-path-active {
  fill: none;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.1));
}

.curve-rgb { stroke: #e2e8f0; }
.curve-r { stroke: #ef4444; }
.curve-g { stroke: #22c55e; }
.curve-b { stroke: #3b82f6; }

.curve-knot {
  fill: #1e293b;
  stroke-width: 2;
  cursor: grab;
}
.curve-knot:hover {
  r: 8px;
}
.curve-knot.selected {
  cursor: grabbing;
  r: 8px;
}

.curve-knot.endpoint {
  r: 5px;
  stroke: #cbd5e1;
}

.curve-knot.curve-rgb { stroke: #f8fafc; }
.curve-knot.curve-r { stroke: #ef4444; }
.curve-knot.curve-g { stroke: #22c55e; }
.curve-knot.curve-b { stroke: #3b82f6; }

.coord-tooltip {
  fill: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-family: monospace;
}

/* Histogram */
.histogram-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.histogram-header {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.histogram-svg {
  width: 100%;
  height: 50px;
  background: #111112;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  overflow: hidden;
}

.hist-path {
  fill: none;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.hist-r { stroke: rgba(239, 68, 68, 0.5); fill: rgba(239, 68, 68, 0.05); }
.hist-g { stroke: rgba(34, 197, 94, 0.5); fill: rgba(34, 197, 94, 0.05); }
.hist-b { stroke: rgba(59, 130, 246, 0.5); fill: rgba(59, 130, 246, 0.05); }
.hist-lum { stroke: rgba(255, 255, 255, 0.4); fill: rgba(255, 255, 255, 0.02); }

/* Control row structures */
.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
}

.control-row-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-label {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.value-display {
  font-size: 11px;
  font-family: monospace;
  color: #3b82f6;
}

/* Styled HTML inputs */
.gradient-checkbox {
  width: 14px;
  height: 14px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.styled-select {
  background: #1e1e20;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}

.styled-range {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.styled-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s ease;
}

.styled-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #60a5fa;
}

/* Gradient editor box */
.gradient-editor-box {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.gradient-stops-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gradient-bar-track {
  height: 24px;
  width: 100%;
  border-radius: 6px;
  position: relative;
  cursor: crosshair;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

.gradient-stop-marker {
  position: absolute;
  top: 0;
  width: 0;
  height: 100%;
  cursor: grab;
  transform: translateX(-50%);
}

.gradient-stop-marker:active {
  cursor: grabbing;
}

.marker-pin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  position: absolute;
  bottom: -4px;
  left: -6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.6);
  transition: transform 0.15s ease;
}

.gradient-stop-marker:hover .marker-pin {
  transform: scale(1.2);
}

.stop-editor-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #161618;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.editor-title {
  font-size: 10px;
  font-weight: bold;
  color: #94a3b8;
}

.stop-inputs {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stop-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #94a3b8;
}

.stop-num-input {
  width: 40px;
  background: #252528;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #fff;
  padding: 2px;
  font-size: 10px;
  text-align: center;
}

.stop-color-picker {
  width: 32px;
  height: 18px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  padding: 0;
}

/* Post-Processing Effects section */
.effects-sliders {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.effects-group-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
}
</style>
