<template>
  <div class="block-swap-card" ref="cardRef">
    <header class="card-header">
      <div class="header-main">
        <h3 class="header-title">BlockSwap V2</h3>
        <span class="header-badge" :class="{ 'badge-active': state.auto_hardware_tuning }">
          {{ state.auto_hardware_tuning ? 'Autonomous' : 'Manual' }}
        </span>
      </div>
      <p class="header-subtitle">Intelligent VRAM-DRAM Manager</p>
    </header>

    <main class="card-body">
      <!-- Auto Tuning Switch -->
      <div class="control-row toggle-row">
        <div class="label-group">
          <span class="control-label">Auto Hardware Tuning</span>
          <p class="control-desc">Balances memory based on GPU limits</p>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="state.auto_hardware_tuning" @change="onValueChange('auto_hardware_tuning')" />
          <span class="slider round"></span>
        </label>
      </div>

      <!-- VRAM Threshold Percent -->
      <div class="control-row">
        <div class="control-header">
          <span class="control-label">VRAM Threshold</span>
          <span class="value-badge">{{ state.vram_threshold_percent.toFixed(1) }}%</span>
        </div>
        <div class="slider-wrapper">
          <button class="step-btn compact" @click="stepDown('vram_threshold_percent', 30.0, 1.0)">-</button>
          <input
            type="range"
            v-model.number="state.vram_threshold_percent"
            min="30"
            max="90"
            step="1"
            class="styled-range"
            @input="onValueChange('vram_threshold_percent')"
          />
          <button class="step-btn compact" @click="stepUp('vram_threshold_percent', 90.0, 1.0)">+</button>
        </div>
      </div>

      <!-- Blocks To Swap (Manual Control) -->
      <div class="control-row" :class="{ 'row-disabled': state.auto_hardware_tuning }">
        <div class="control-header">
          <span class="control-label">
            Blocks to Swap
            <span v-if="state.auto_hardware_tuning" class="lock-icon">🔒 (Calculated)</span>
          </span>
          <span class="value-badge highlight">{{ telemetry.calculatedBlocksToSwap ?? state.blocks_to_swap }} blocks</span>
        </div>
        <div class="stepper-wrapper">
          <button class="step-btn" :disabled="state.auto_hardware_tuning" @click="stepDown('blocks_to_swap', 0, 1)">-</button>
          <div class="display-val">{{ telemetry.calculatedBlocksToSwap ?? state.blocks_to_swap }}</div>
          <button class="step-btn" :disabled="state.auto_hardware_tuning" @click="stepUp('blocks_to_swap', 48, 1)">+</button>
        </div>
      </div>

      <!-- Text and Image offload toggles -->
      <div class="toggles-grid">
        <div class="control-row toggle-row compact-toggle">
          <span class="control-label">Offload T5 (Text)</span>
          <label class="switch compact">
            <input type="checkbox" v-model="state.offload_txt_emb" @change="onValueChange('offload_txt_emb')" />
            <span class="slider round"></span>
          </label>
        </div>
        <div class="control-row toggle-row compact-toggle">
          <span class="control-label">Offload CLIP (Img)</span>
          <label class="switch compact">
            <input type="checkbox" v-model="state.offload_img_emb" @change="onValueChange('offload_img_emb')" />
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- Telemetry Dashboard -->
      <div class="telemetry-dashboard" v-if="telemetry.vramTotal > 0">
        <div class="telemetry-grid">
          <div class="telemetry-item">
            <span class="tel-lbl">Calculated Swap</span>
            <span class="tel-val">{{ telemetry.calculatedBlocksToSwap ?? 'Pending' }}</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-lbl">Block Weight</span>
            <span class="tel-val">{{ telemetry.blockSize ? telemetry.blockSize.toFixed(0) + ' MB' : 'Pending' }}</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-lbl">VRAM Free</span>
            <span class="tel-val font-mono">{{ telemetry.vramFree ? (telemetry.vramFree / 1024).toFixed(1) + ' GB' : 'Pending' }}</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-lbl">DRAM Free</span>
            <span class="tel-val font-mono">{{ telemetry.dramFree ? (telemetry.dramFree / 1024).toFixed(1) + ' GB' : 'Pending' }}</span>
          </div>
        </div>
        <div class="hw-badge" v-if="telemetry.isRocm">
          ⚡ AMD ROCm Optimized Mode Active
        </div>
      </div>

      <!-- Advanced Optimization Accordion -->
      <details class="advanced-accordion" :open="isAdvancedOpen" @toggle="toggleAccordion">
        <summary class="accordion-summary">
          <span>Advanced Optimization Settings</span>
          <span class="arrow">▼</span>
        </summary>
        <div class="accordion-content">
          <!-- Multi-stream parallel CUDA toggle -->
          <div class="control-row toggle-row">
            <div class="label-group">
              <span class="control-label">Parallel CUDA Transfers</span>
              <p class="control-desc">Overlaps mathematical compute with transfers</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="state.enable_cuda_optimization" @change="onValueChange('enable_cuda_optimization')" />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Num CUDA Streams -->
          <div class="control-row" :class="{ 'row-disabled': !state.enable_cuda_optimization }">
            <div class="control-header">
              <span class="control-label">CUDA Stream Count</span>
              <span class="value-badge">{{ state.num_cuda_streams }} streams</span>
            </div>
            <div class="stepper-wrapper">
              <button class="step-btn" :disabled="!state.enable_cuda_optimization" @click="stepDown('num_cuda_streams', 1, 1)">-</button>
              <div class="display-val">{{ state.num_cuda_streams }}</div>
              <button class="step-btn" :disabled="!state.enable_cuda_optimization" @click="stepUp('num_cuda_streams', 16, 1)">+</button>
            </div>
          </div>

          <!-- Pinned memory DRAM optimization -->
          <div class="control-row toggle-row">
            <div class="label-group">
              <span class="control-label">Memory Pinning (DRAM)</span>
              <p class="control-desc">Enables Direct Memory Access (DMA)</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="state.enable_dram_optimization" @change="onValueChange('enable_dram_optimization')" />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- PCIe Bandwidth Target Governor -->
          <div class="control-row">
            <div class="control-header">
              <span class="control-label">Bandwidth Governor</span>
              <span class="value-badge">{{ (state.bandwidth_target * 100).toFixed(0) }}%</span>
            </div>
            <div class="slider-wrapper">
              <button class="step-btn compact" @click="stepDown('bandwidth_target', 0.1, 0.05)">-</button>
              <input
                type="range"
                v-model.number="state.bandwidth_target"
                min="0.1"
                max="1.0"
                step="0.05"
                class="styled-range"
                @input="onValueChange('bandwidth_target')"
              />
              <button class="step-btn compact" @click="stepUp('bandwidth_target', 1.0, 0.05)">+</button>
            </div>
          </div>

          <!-- VACE blocks to swap -->
          <div class="control-row">
            <div class="control-header">
              <span class="control-label">VACE Blocks to Swap</span>
              <span class="value-badge">{{ state.vace_blocks_to_swap }} blocks</span>
            </div>
            <div class="stepper-wrapper">
              <button class="step-btn" @click="stepDown('vace_blocks_to_swap', 0, 1)">-</button>
              <div class="display-val">{{ state.vace_blocks_to_swap }}</div>
              <button class="step-btn" @click="stepUp('vace_blocks_to_swap', 15, 1)">+</button>
            </div>
          </div>

          <!-- Non-blocking transfer toggle -->
          <div class="control-row toggle-row compact-toggle">
            <span class="control-label">Use Non-Blocking Transfer</span>
            <label class="switch compact">
              <input type="checkbox" v-model="state.use_non_blocking" @change="onValueChange('use_non_blocking')" />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Verbose debug mode -->
          <div class="control-row toggle-row compact-toggle">
            <span class="control-label">Server Console Verbose Debug</span>
            <label class="switch compact">
              <input type="checkbox" v-model="state.debug_mode" @change="onValueChange('debug_mode')" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </details>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, nextTick, onMounted } from "vue";

export default defineComponent({
  name: "IntelligentBlockSwapV2",
  props: {
    initialState: {
      type: Object,
      required: true,
    },
    nodeId: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["stateChange", "resize"],
  setup(props, { emit }) {
    const cardRef = ref<HTMLElement | null>(null);
    const isAdvancedOpen = ref(false);

    const state = reactive({
      auto_hardware_tuning: true,
      vram_threshold_percent: 50.0,
      blocks_to_swap: 0,
      enable_cuda_optimization: true,
      enable_dram_optimization: true,
      num_cuda_streams: 8,
      bandwidth_target: 0.8,
      offload_txt_emb: true,
      offload_img_emb: false,
      vace_blocks_to_swap: 0,
      use_non_blocking: true,
      debug_mode: false,
      ...props.initialState,
    });

    const telemetry = reactive({
      calculatedBlocksToSwap: null as number | null,
      vramTotal: 0,
      vramFree: 0,
      dramTotal: 0,
      dramFree: 0,
      blockSize: 0,
      isRocm: false,
    });

    const triggerResize = () => {
      nextTick(() => {
        if (cardRef.value) {
          const rect = cardRef.value.getBoundingClientRect();
          emit("resize", Math.ceil(rect.height) + 16);
        }
      });
    };

    const onValueChange = (key: string) => {
      emit("stateChange", key, state[key as keyof typeof state]);
    };

    const stepUp = (key: string, max: number, step: number) => {
      const current = Number(state[key as keyof typeof state]);
      if (current + step <= max) {
        (state as any)[key] = parseFloat((current + step).toFixed(4));
        onValueChange(key);
      }
    };

    const stepDown = (key: string, min: number, step: number) => {
      const current = Number(state[key as keyof typeof state]);
      if (current - step >= min) {
        (state as any)[key] = parseFloat((current - step).toFixed(4));
        onValueChange(key);
      }
    };

    const toggleAccordion = (event: Event) => {
      isAdvancedOpen.value = (event.target as HTMLDetailsElement).open;
      triggerResize();
    };

    const hydrateState = (values: any) => {
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && key in state) {
          (state as any)[key] = values[key];
        }
      });
      triggerResize();
    };

    const setTelemetry = (values: any) => {
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && key in telemetry) {
          (telemetry as any)[key] = values[key];
        }
      });
      triggerResize();
    };

    onMounted(() => {
      triggerResize();
      // Backup resize triggers
      setTimeout(triggerResize, 100);
      setTimeout(triggerResize, 500);
    });

    return {
      state,
      telemetry,
      cardRef,
      isAdvancedOpen,
      onValueChange,
      stepUp,
      stepDown,
      toggleAccordion,
      hydrateState,
      setTelemetry,
    };
  },
});
</script>

<style scoped>
.block-swap-card {
  width: 100%;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #f1f5f9;
  user-select: none;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 10px;
  margin-bottom: 14px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #ffffff;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(148, 163, 184, 0.05);
  color: #94a3b8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-badge.badge-active {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
}

.header-subtitle {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: opacity 0.25s ease;
}

.control-row.toggle-row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.control-row.compact-toggle {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.row-disabled {
  opacity: 0.38;
  pointer-events: none;
}

.label-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lock-icon {
  font-size: 10px;
  color: #10b981;
}

.control-desc {
  margin: 0;
  font-size: 10px;
  color: #64748b;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.value-badge {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  color: #94a3b8;
}

.value-badge.highlight {
  color: #38bdf8;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Styled range slider */
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
  background: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.4);
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

.styled-range::-webkit-slider-thumb:hover {
  transform: scale(1.25);
  background: #7dd3fc;
}

/* Toggle Switch Styling */
.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: #94a3b8;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

input:checked + .slider {
  background-color: rgba(14, 165, 233, 0.25);
  border-color: rgba(14, 165, 233, 0.4);
}

input:checked + .slider:before {
  transform: translateX(14px);
  background-color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Compact Toggle */
.switch.compact {
  width: 28px;
  height: 16px;
}
.switch.compact .slider:before {
  height: 10px;
  width: 10px;
  left: 2px;
  bottom: 2px;
}
input:checked + .switch.compact .slider:before {
  transform: translateX(12px);
}

.toggles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px;
}

/* Stepper widget styling */
.stepper-wrapper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
  height: 28px;
}

.display-val {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #38bdf8;
}

.step-btn {
  background: rgba(255, 255, 255, 0.03);
  border: none;
  color: #cbd5e1;
  width: 30px;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s ease, color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.step-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.step-btn.compact {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Telemetry styling */
.telemetry-dashboard {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%);
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.telemetry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.telemetry-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tel-lbl {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tel-val {
  font-size: 11px;
  font-weight: 700;
  color: #f1f5f9;
}

.font-mono {
  font-family: ui-monospace, monospace;
}

.hw-badge {
  font-size: 9px;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 4px;
  padding: 3px 6px;
  text-align: center;
}

/* Advanced Accordion styling */
.advanced-accordion {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.accordion-summary {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  outline: none;
  transition: background-color 0.2s ease;
}

.accordion-summary::-webkit-details-marker {
  display: none;
}

.accordion-summary:hover {
  background: rgba(255, 255, 255, 0.02);
  color: #ffffff;
}

.accordion-summary .arrow {
  font-size: 8px;
  transition: transform 0.25s ease;
  color: #64748b;
}

.advanced-accordion[open] .accordion-summary {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.advanced-accordion[open] .accordion-summary .arrow {
  transform: rotate(180deg);
  color: #38bdf8;
}

.accordion-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
