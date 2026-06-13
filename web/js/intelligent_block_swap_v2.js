import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";
import { h as defineComponent, r as reactive, k as onMounted, p as ref, n as nextTick, _ as _export_sfc, m as openBlock, e as createElementBlock, b as createBaseVNode, i as normalizeClass, t as toDisplayString, y as withDirectives, v as vModelCheckbox, u as vModelText, g as createTextVNode, d as createCommentVNode, a as createApp } from "./_plugin-vue_export-helper-C-igAGFE.js";
const _sfc_main = defineComponent({
  name: "IntelligentBlockSwapV2",
  props: {
    initialState: {
      type: Object,
      required: true
    },
    nodeId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ["stateChange", "resize"],
  setup(props, { emit }) {
    const cardRef = ref(null);
    const isAdvancedOpen = ref(false);
    const state = reactive({
      auto_hardware_tuning: true,
      vram_threshold_percent: 50,
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
      ...props.initialState
    });
    const telemetry = reactive({
      calculatedBlocksToSwap: null,
      vramTotal: 0,
      vramFree: 0,
      dramTotal: 0,
      dramFree: 0,
      blockSize: 0,
      isRocm: false
    });
    const triggerResize = () => {
      nextTick(() => {
        if (cardRef.value) {
          const rect = cardRef.value.getBoundingClientRect();
          emit("resize", Math.ceil(rect.height) + 16);
        }
      });
    };
    const onValueChange = (key) => {
      emit("stateChange", key, state[key]);
    };
    const stepUp = (key, max, step) => {
      const current = Number(state[key]);
      if (current + step <= max) {
        state[key] = parseFloat((current + step).toFixed(4));
        onValueChange(key);
      }
    };
    const stepDown = (key, min, step) => {
      const current = Number(state[key]);
      if (current - step >= min) {
        state[key] = parseFloat((current - step).toFixed(4));
        onValueChange(key);
      }
    };
    const toggleAccordion = (event) => {
      isAdvancedOpen.value = event.target.open;
      triggerResize();
    };
    const hydrateState = (values) => {
      Object.keys(values).forEach((key) => {
        if (values[key] !== void 0 && key in state) {
          state[key] = values[key];
        }
      });
      triggerResize();
    };
    const setTelemetry = (values) => {
      Object.keys(values).forEach((key) => {
        if (values[key] !== void 0 && key in telemetry) {
          telemetry[key] = values[key];
        }
      });
      triggerResize();
    };
    onMounted(() => {
      triggerResize();
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
      setTelemetry
    };
  }
});
const _hoisted_1 = {
  class: "block-swap-card",
  ref: "cardRef"
};
const _hoisted_2 = { class: "card-header" };
const _hoisted_3 = { class: "header-main" };
const _hoisted_4 = { class: "card-body" };
const _hoisted_5 = { class: "control-row toggle-row" };
const _hoisted_6 = { class: "switch" };
const _hoisted_7 = { class: "control-row" };
const _hoisted_8 = { class: "control-header" };
const _hoisted_9 = { class: "value-badge" };
const _hoisted_10 = { class: "slider-wrapper" };
const _hoisted_11 = { class: "control-header" };
const _hoisted_12 = { class: "control-label" };
const _hoisted_13 = {
  key: 0,
  class: "lock-icon"
};
const _hoisted_14 = { class: "value-badge highlight" };
const _hoisted_15 = { class: "stepper-wrapper" };
const _hoisted_16 = ["disabled"];
const _hoisted_17 = { class: "display-val" };
const _hoisted_18 = ["disabled"];
const _hoisted_19 = { class: "toggles-grid" };
const _hoisted_20 = { class: "control-row toggle-row compact-toggle" };
const _hoisted_21 = { class: "switch compact" };
const _hoisted_22 = { class: "control-row toggle-row compact-toggle" };
const _hoisted_23 = { class: "switch compact" };
const _hoisted_24 = {
  key: 0,
  class: "telemetry-dashboard"
};
const _hoisted_25 = { class: "telemetry-grid" };
const _hoisted_26 = { class: "telemetry-item" };
const _hoisted_27 = { class: "tel-val" };
const _hoisted_28 = { class: "telemetry-item" };
const _hoisted_29 = { class: "tel-val" };
const _hoisted_30 = { class: "telemetry-item" };
const _hoisted_31 = { class: "tel-val font-mono" };
const _hoisted_32 = { class: "telemetry-item" };
const _hoisted_33 = { class: "tel-val font-mono" };
const _hoisted_34 = {
  key: 0,
  class: "hw-badge"
};
const _hoisted_35 = ["open"];
const _hoisted_36 = { class: "accordion-content" };
const _hoisted_37 = { class: "control-row toggle-row" };
const _hoisted_38 = { class: "switch" };
const _hoisted_39 = { class: "control-header" };
const _hoisted_40 = { class: "value-badge" };
const _hoisted_41 = { class: "stepper-wrapper" };
const _hoisted_42 = ["disabled"];
const _hoisted_43 = { class: "display-val" };
const _hoisted_44 = ["disabled"];
const _hoisted_45 = { class: "control-row toggle-row" };
const _hoisted_46 = { class: "switch" };
const _hoisted_47 = { class: "control-row" };
const _hoisted_48 = { class: "control-header" };
const _hoisted_49 = { class: "value-badge" };
const _hoisted_50 = { class: "slider-wrapper" };
const _hoisted_51 = { class: "control-row" };
const _hoisted_52 = { class: "control-header" };
const _hoisted_53 = { class: "value-badge" };
const _hoisted_54 = { class: "stepper-wrapper" };
const _hoisted_55 = { class: "display-val" };
const _hoisted_56 = { class: "control-row toggle-row compact-toggle" };
const _hoisted_57 = { class: "switch compact" };
const _hoisted_58 = { class: "control-row toggle-row compact-toggle" };
const _hoisted_59 = { class: "switch compact" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1, [
    createBaseVNode("header", _hoisted_2, [
      createBaseVNode("div", _hoisted_3, [
        _cache[29] || (_cache[29] = createBaseVNode("h3", { class: "header-title" }, "BlockSwap V2", -1)),
        createBaseVNode("span", {
          class: normalizeClass(["header-badge", { "badge-active": _ctx.state.auto_hardware_tuning }])
        }, toDisplayString(_ctx.state.auto_hardware_tuning ? "Autonomous" : "Manual"), 3)
      ]),
      _cache[30] || (_cache[30] = createBaseVNode("p", { class: "header-subtitle" }, "Intelligent VRAM-DRAM Manager", -1))
    ]),
    createBaseVNode("main", _hoisted_4, [
      createBaseVNode("div", _hoisted_5, [
        _cache[32] || (_cache[32] = createBaseVNode("div", { class: "label-group" }, [
          createBaseVNode("span", { class: "control-label" }, "Auto Hardware Tuning"),
          createBaseVNode("p", { class: "control-desc" }, "Balances memory based on GPU limits")
        ], -1)),
        createBaseVNode("label", _hoisted_6, [
          withDirectives(createBaseVNode("input", {
            type: "checkbox",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.state.auto_hardware_tuning = $event),
            onChange: _cache[1] || (_cache[1] = ($event) => _ctx.onValueChange("auto_hardware_tuning"))
          }, null, 544), [
            [vModelCheckbox, _ctx.state.auto_hardware_tuning]
          ]),
          _cache[31] || (_cache[31] = createBaseVNode("span", { class: "slider round" }, null, -1))
        ])
      ]),
      createBaseVNode("div", _hoisted_7, [
        createBaseVNode("div", _hoisted_8, [
          _cache[33] || (_cache[33] = createBaseVNode("span", { class: "control-label" }, "VRAM Threshold", -1)),
          createBaseVNode("span", _hoisted_9, toDisplayString(_ctx.state.vram_threshold_percent.toFixed(1)) + "%", 1)
        ]),
        createBaseVNode("div", _hoisted_10, [
          createBaseVNode("button", {
            class: "step-btn compact",
            onClick: _cache[2] || (_cache[2] = ($event) => _ctx.stepDown("vram_threshold_percent", 30, 1))
          }, "-"),
          withDirectives(createBaseVNode("input", {
            type: "range",
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.state.vram_threshold_percent = $event),
            min: "30",
            max: "90",
            step: "1",
            class: "styled-range",
            onInput: _cache[4] || (_cache[4] = ($event) => _ctx.onValueChange("vram_threshold_percent"))
          }, null, 544), [
            [
              vModelText,
              _ctx.state.vram_threshold_percent,
              void 0,
              { number: true }
            ]
          ]),
          createBaseVNode("button", {
            class: "step-btn compact",
            onClick: _cache[5] || (_cache[5] = ($event) => _ctx.stepUp("vram_threshold_percent", 90, 1))
          }, "+")
        ])
      ]),
      createBaseVNode("div", {
        class: normalizeClass(["control-row", { "row-disabled": _ctx.state.auto_hardware_tuning }])
      }, [
        createBaseVNode("div", _hoisted_11, [
          createBaseVNode("span", _hoisted_12, [
            _cache[34] || (_cache[34] = createTextVNode(" Blocks to Swap ", -1)),
            _ctx.state.auto_hardware_tuning ? (openBlock(), createElementBlock("span", _hoisted_13, "🔒 (Calculated)")) : createCommentVNode("", true)
          ]),
          createBaseVNode("span", _hoisted_14, toDisplayString(_ctx.telemetry.calculatedBlocksToSwap ?? _ctx.state.blocks_to_swap) + " blocks", 1)
        ]),
        createBaseVNode("div", _hoisted_15, [
          createBaseVNode("button", {
            class: "step-btn",
            disabled: _ctx.state.auto_hardware_tuning,
            onClick: _cache[6] || (_cache[6] = ($event) => _ctx.stepDown("blocks_to_swap", 0, 1))
          }, "-", 8, _hoisted_16),
          createBaseVNode("div", _hoisted_17, toDisplayString(_ctx.telemetry.calculatedBlocksToSwap ?? _ctx.state.blocks_to_swap), 1),
          createBaseVNode("button", {
            class: "step-btn",
            disabled: _ctx.state.auto_hardware_tuning,
            onClick: _cache[7] || (_cache[7] = ($event) => _ctx.stepUp("blocks_to_swap", 48, 1))
          }, "+", 8, _hoisted_18)
        ])
      ], 2),
      createBaseVNode("div", _hoisted_19, [
        createBaseVNode("div", _hoisted_20, [
          _cache[36] || (_cache[36] = createBaseVNode("span", { class: "control-label" }, "Offload T5 (Text)", -1)),
          createBaseVNode("label", _hoisted_21, [
            withDirectives(createBaseVNode("input", {
              type: "checkbox",
              "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.state.offload_txt_emb = $event),
              onChange: _cache[9] || (_cache[9] = ($event) => _ctx.onValueChange("offload_txt_emb"))
            }, null, 544), [
              [vModelCheckbox, _ctx.state.offload_txt_emb]
            ]),
            _cache[35] || (_cache[35] = createBaseVNode("span", { class: "slider round" }, null, -1))
          ])
        ]),
        createBaseVNode("div", _hoisted_22, [
          _cache[38] || (_cache[38] = createBaseVNode("span", { class: "control-label" }, "Offload CLIP (Img)", -1)),
          createBaseVNode("label", _hoisted_23, [
            withDirectives(createBaseVNode("input", {
              type: "checkbox",
              "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => _ctx.state.offload_img_emb = $event),
              onChange: _cache[11] || (_cache[11] = ($event) => _ctx.onValueChange("offload_img_emb"))
            }, null, 544), [
              [vModelCheckbox, _ctx.state.offload_img_emb]
            ]),
            _cache[37] || (_cache[37] = createBaseVNode("span", { class: "slider round" }, null, -1))
          ])
        ])
      ]),
      _ctx.telemetry.vramTotal > 0 ? (openBlock(), createElementBlock("div", _hoisted_24, [
        createBaseVNode("div", _hoisted_25, [
          createBaseVNode("div", _hoisted_26, [
            _cache[39] || (_cache[39] = createBaseVNode("span", { class: "tel-lbl" }, "Calculated Swap", -1)),
            createBaseVNode("span", _hoisted_27, toDisplayString(_ctx.telemetry.calculatedBlocksToSwap ?? "Pending"), 1)
          ]),
          createBaseVNode("div", _hoisted_28, [
            _cache[40] || (_cache[40] = createBaseVNode("span", { class: "tel-lbl" }, "Block Weight", -1)),
            createBaseVNode("span", _hoisted_29, toDisplayString(_ctx.telemetry.blockSize ? _ctx.telemetry.blockSize.toFixed(0) + " MB" : "Pending"), 1)
          ]),
          createBaseVNode("div", _hoisted_30, [
            _cache[41] || (_cache[41] = createBaseVNode("span", { class: "tel-lbl" }, "VRAM Free", -1)),
            createBaseVNode("span", _hoisted_31, toDisplayString(_ctx.telemetry.vramFree ? (_ctx.telemetry.vramFree / 1024).toFixed(1) + " GB" : "Pending"), 1)
          ]),
          createBaseVNode("div", _hoisted_32, [
            _cache[42] || (_cache[42] = createBaseVNode("span", { class: "tel-lbl" }, "DRAM Free", -1)),
            createBaseVNode("span", _hoisted_33, toDisplayString(_ctx.telemetry.dramFree ? (_ctx.telemetry.dramFree / 1024).toFixed(1) + " GB" : "Pending"), 1)
          ])
        ]),
        _ctx.telemetry.isRocm ? (openBlock(), createElementBlock("div", _hoisted_34, " ⚡ AMD ROCm Optimized Mode Active ")) : createCommentVNode("", true)
      ])) : createCommentVNode("", true),
      createBaseVNode("details", {
        class: "advanced-accordion",
        open: _ctx.isAdvancedOpen,
        onToggle: _cache[28] || (_cache[28] = (...args) => _ctx.toggleAccordion && _ctx.toggleAccordion(...args))
      }, [
        _cache[54] || (_cache[54] = createBaseVNode("summary", { class: "accordion-summary" }, [
          createBaseVNode("span", null, "Advanced Optimization Settings"),
          createBaseVNode("span", { class: "arrow" }, "▼")
        ], -1)),
        createBaseVNode("div", _hoisted_36, [
          createBaseVNode("div", _hoisted_37, [
            _cache[44] || (_cache[44] = createBaseVNode("div", { class: "label-group" }, [
              createBaseVNode("span", { class: "control-label" }, "Parallel CUDA Transfers"),
              createBaseVNode("p", { class: "control-desc" }, "Overlaps mathematical compute with transfers")
            ], -1)),
            createBaseVNode("label", _hoisted_38, [
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => _ctx.state.enable_cuda_optimization = $event),
                onChange: _cache[13] || (_cache[13] = ($event) => _ctx.onValueChange("enable_cuda_optimization"))
              }, null, 544), [
                [vModelCheckbox, _ctx.state.enable_cuda_optimization]
              ]),
              _cache[43] || (_cache[43] = createBaseVNode("span", { class: "slider round" }, null, -1))
            ])
          ]),
          createBaseVNode("div", {
            class: normalizeClass(["control-row", { "row-disabled": !_ctx.state.enable_cuda_optimization }])
          }, [
            createBaseVNode("div", _hoisted_39, [
              _cache[45] || (_cache[45] = createBaseVNode("span", { class: "control-label" }, "CUDA Stream Count", -1)),
              createBaseVNode("span", _hoisted_40, toDisplayString(_ctx.state.num_cuda_streams) + " streams", 1)
            ]),
            createBaseVNode("div", _hoisted_41, [
              createBaseVNode("button", {
                class: "step-btn",
                disabled: !_ctx.state.enable_cuda_optimization,
                onClick: _cache[14] || (_cache[14] = ($event) => _ctx.stepDown("num_cuda_streams", 1, 1))
              }, "-", 8, _hoisted_42),
              createBaseVNode("div", _hoisted_43, toDisplayString(_ctx.state.num_cuda_streams), 1),
              createBaseVNode("button", {
                class: "step-btn",
                disabled: !_ctx.state.enable_cuda_optimization,
                onClick: _cache[15] || (_cache[15] = ($event) => _ctx.stepUp("num_cuda_streams", 16, 1))
              }, "+", 8, _hoisted_44)
            ])
          ], 2),
          createBaseVNode("div", _hoisted_45, [
            _cache[47] || (_cache[47] = createBaseVNode("div", { class: "label-group" }, [
              createBaseVNode("span", { class: "control-label" }, "Memory Pinning (DRAM)"),
              createBaseVNode("p", { class: "control-desc" }, "Enables Direct Memory Access (DMA)")
            ], -1)),
            createBaseVNode("label", _hoisted_46, [
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => _ctx.state.enable_dram_optimization = $event),
                onChange: _cache[17] || (_cache[17] = ($event) => _ctx.onValueChange("enable_dram_optimization"))
              }, null, 544), [
                [vModelCheckbox, _ctx.state.enable_dram_optimization]
              ]),
              _cache[46] || (_cache[46] = createBaseVNode("span", { class: "slider round" }, null, -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_47, [
            createBaseVNode("div", _hoisted_48, [
              _cache[48] || (_cache[48] = createBaseVNode("span", { class: "control-label" }, "Bandwidth Governor", -1)),
              createBaseVNode("span", _hoisted_49, toDisplayString((_ctx.state.bandwidth_target * 100).toFixed(0)) + "%", 1)
            ]),
            createBaseVNode("div", _hoisted_50, [
              createBaseVNode("button", {
                class: "step-btn compact",
                onClick: _cache[18] || (_cache[18] = ($event) => _ctx.stepDown("bandwidth_target", 0.1, 0.05))
              }, "-"),
              withDirectives(createBaseVNode("input", {
                type: "range",
                "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => _ctx.state.bandwidth_target = $event),
                min: "0.1",
                max: "1.0",
                step: "0.05",
                class: "styled-range",
                onInput: _cache[20] || (_cache[20] = ($event) => _ctx.onValueChange("bandwidth_target"))
              }, null, 544), [
                [
                  vModelText,
                  _ctx.state.bandwidth_target,
                  void 0,
                  { number: true }
                ]
              ]),
              createBaseVNode("button", {
                class: "step-btn compact",
                onClick: _cache[21] || (_cache[21] = ($event) => _ctx.stepUp("bandwidth_target", 1, 0.05))
              }, "+")
            ])
          ]),
          createBaseVNode("div", _hoisted_51, [
            createBaseVNode("div", _hoisted_52, [
              _cache[49] || (_cache[49] = createBaseVNode("span", { class: "control-label" }, "VACE Blocks to Swap", -1)),
              createBaseVNode("span", _hoisted_53, toDisplayString(_ctx.state.vace_blocks_to_swap) + " blocks", 1)
            ]),
            createBaseVNode("div", _hoisted_54, [
              createBaseVNode("button", {
                class: "step-btn",
                onClick: _cache[22] || (_cache[22] = ($event) => _ctx.stepDown("vace_blocks_to_swap", 0, 1))
              }, "-"),
              createBaseVNode("div", _hoisted_55, toDisplayString(_ctx.state.vace_blocks_to_swap), 1),
              createBaseVNode("button", {
                class: "step-btn",
                onClick: _cache[23] || (_cache[23] = ($event) => _ctx.stepUp("vace_blocks_to_swap", 15, 1))
              }, "+")
            ])
          ]),
          createBaseVNode("div", _hoisted_56, [
            _cache[51] || (_cache[51] = createBaseVNode("span", { class: "control-label" }, "Use Non-Blocking Transfer", -1)),
            createBaseVNode("label", _hoisted_57, [
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => _ctx.state.use_non_blocking = $event),
                onChange: _cache[25] || (_cache[25] = ($event) => _ctx.onValueChange("use_non_blocking"))
              }, null, 544), [
                [vModelCheckbox, _ctx.state.use_non_blocking]
              ]),
              _cache[50] || (_cache[50] = createBaseVNode("span", { class: "slider round" }, null, -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_58, [
            _cache[53] || (_cache[53] = createBaseVNode("span", { class: "control-label" }, "Server Console Verbose Debug", -1)),
            createBaseVNode("label", _hoisted_59, [
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => _ctx.state.debug_mode = $event),
                onChange: _cache[27] || (_cache[27] = ($event) => _ctx.onValueChange("debug_mode"))
              }, null, 544), [
                [vModelCheckbox, _ctx.state.debug_mode]
              ]),
              _cache[52] || (_cache[52] = createBaseVNode("span", { class: "slider round" }, null, -1))
            ])
          ])
        ])
      ], 40, _hoisted_35)
    ])
  ], 512);
}
const IntelligentBlockSwapV2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8878db33"]]);
const MIN_W = 420;
const MIN_H = 340;
function isolateContainerEvents(container) {
  const stopPropagation = (event) => {
    event.stopPropagation();
  };
  container.addEventListener("pointerdown", stopPropagation);
  container.addEventListener("mousedown", stopPropagation);
  container.addEventListener("mouseup", stopPropagation);
  container.addEventListener("pointerup", stopPropagation);
  container.addEventListener("click", stopPropagation);
  container.addEventListener("wheel", stopPropagation);
  container.addEventListener("dblclick", stopPropagation);
  container.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
}
app.registerExtension({
  name: "Duffy.IntelligentBlockSwapV2.Vue",
  async nodeCreated(node) {
    if (node.comfyClass !== "IntelligentBlockSwapV2") {
      return;
    }
    const isNodes2 = (() => {
      const localVal = localStorage.getItem("comfy.settings.Comfy.VueNodes.Enabled");
      if (localVal !== null) {
        try {
          const parsed = JSON.parse(localVal);
          if (Array.isArray(parsed)) return !!parsed[0];
          return !!parsed;
        } catch {
          return localVal === "true";
        }
      }
      const settingsVal = app.ui?.settings?.getSettingValue?.("Comfy.VueNodes.Enabled");
      if (settingsVal !== void 0) {
        return !!settingsVal;
      }
      return true;
    })();
    if (!isNodes2) {
      if (node.widgets) {
        const autoTuningWidget = node.widgets.find((x) => x.name === "auto_hardware_tuning");
        const blocksWidget = node.widgets.find((x) => x.name === "blocks_to_swap");
        const updateWidgetStates = () => {
          if (autoTuningWidget && blocksWidget) {
            const isAuto = !!autoTuningWidget.value;
            blocksWidget.disabled = isAuto;
            node.setDirtyCanvas?.(true, true);
          }
        };
        if (autoTuningWidget) {
          const origCallback = autoTuningWidget.callback;
          autoTuningWidget.callback = function() {
            updateWidgetStates();
            return origCallback ? origCallback.apply(this, arguments) : void 0;
          };
        }
        setTimeout(updateWidgetStates, 1);
      }
      return;
    }
    const widgetsToHide = [
      "auto_hardware_tuning",
      "vram_threshold_percent",
      "blocks_to_swap",
      "enable_cuda_optimization",
      "enable_dram_optimization",
      "num_cuda_streams",
      "bandwidth_target",
      "offload_txt_emb",
      "offload_img_emb",
      "vace_blocks_to_swap",
      "use_non_blocking",
      "debug_mode"
    ];
    for (const wName of widgetsToHide) {
      const w = node.widgets?.find((x) => x.name === wName);
      if (w) {
        w.type = "hidden";
        w.hidden = true;
        w.disabled = true;
        w.computeSize = () => [0, -4];
      }
    }
    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);
    const getWidgetVal = (name, def) => {
      const w = node.widgets?.find((x) => x.name === name);
      return w ? w.value : def;
    };
    const vueApp = createApp(IntelligentBlockSwapV2, {
      initialState: {
        auto_hardware_tuning: getWidgetVal("auto_hardware_tuning", true),
        vram_threshold_percent: getWidgetVal("vram_threshold_percent", 50),
        blocks_to_swap: getWidgetVal("blocks_to_swap", 0),
        enable_cuda_optimization: getWidgetVal("enable_cuda_optimization", true),
        enable_dram_optimization: getWidgetVal("enable_dram_optimization", true),
        num_cuda_streams: getWidgetVal("num_cuda_streams", 8),
        bandwidth_target: getWidgetVal("bandwidth_target", 0.8),
        offload_txt_emb: getWidgetVal("offload_txt_emb", true),
        offload_img_emb: getWidgetVal("offload_img_emb", false),
        vace_blocks_to_swap: getWidgetVal("vace_blocks_to_swap", 0),
        use_non_blocking: getWidgetVal("use_non_blocking", true),
        debug_mode: getWidgetVal("debug_mode", false)
      },
      nodeId: node.id,
      onStateChange: (key, value) => {
        const w = node.widgets?.find((x) => x.name === key);
        if (w) {
          w.value = value;
        }
        node.setDirtyCanvas?.(true, true);
        node.graph?.change?.();
      },
      onResize: (height) => {
        const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
        node.setSize([currentWidth, Math.max(MIN_H, height)]);
        node.setDirtyCanvas?.(true, true);
      }
    });
    const instance = vueApp.mount(container);
    const domWidget = node.addDOMWidget("intelligent_block_swap_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];
    const hydrateFromWidgets = () => {
      const values = {};
      for (const wName of widgetsToHide) {
        values[wName] = getWidgetVal(wName, void 0);
      }
      instance.hydrateState?.(values);
    };
    const applyExecutionPayload = (rawPayload) => {
      const payload = rawPayload.output?.ui || rawPayload.ui || rawPayload;
      if (payload) {
        instance.setTelemetry?.({
          calculatedBlocksToSwap: payload.calculated_blocks_to_swap?.[0] ?? payload.calculated_blocks_to_swap,
          vramTotal: payload.vram_total?.[0] ?? payload.vram_total,
          vramFree: payload.vram_free?.[0] ?? payload.vram_free,
          dramTotal: payload.dram_total?.[0] ?? payload.dram_total,
          dramFree: payload.dram_free?.[0] ?? payload.dram_free,
          blockSize: payload.block_size?.[0] ?? payload.block_size,
          isRocm: payload.is_rocm?.[0] ?? payload.is_rocm
        });
      }
    };
    const onExecuted = (event) => {
      const { node: execNodeId, output } = event.detail || {};
      if (String(execNodeId) === String(node.id)) {
        applyExecutionPayload(output);
      }
    };
    api.addEventListener("executed", onExecuted);
    const originalConfigure = node.configure;
    node.configure = function configureNode(info) {
      const result = originalConfigure?.call(this, info);
      hydrateFromWidgets();
      return result;
    };
    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    node.setSize([Math.max(MIN_W, initialWidth), MIN_H]);
    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      api.removeEventListener("executed", onExecuted);
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  }
});
(function() {
  "use strict";
  try {
    if (typeof document != "undefined") {
      var elementStyle = document.createElement("style");
      elementStyle.appendChild(document.createTextNode(`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
.theme-panel-root[data-v-e9d7459e] {\r
  height: 100%;\r
  display: grid;\r
  grid-template-rows: auto auto auto auto auto auto auto auto;\r
  gap: 10px;\r
  padding: 10px;\r
  color: #ececec;\r
  background:\r
    radial-gradient(120% 80% at 12% 0%, rgba(31, 199, 157, 0.22), transparent 62%),\r
    linear-gradient(150deg, rgba(23, 29, 36, 0.96), rgba(17, 20, 25, 0.96));\r
  border: 1px solid rgba(0, 209, 143, 0.3);\r
  border-radius: 10px;\r
  box-sizing: border-box;\r
  overflow-y: auto;\r
  font-family: "IBM Plex Sans", "Source Sans 3", sans-serif;
}
.panel-header h3[data-v-e9d7459e] {\r
  margin: 0;\r
  font-size: 15px;\r
  letter-spacing: 0.03em;
}
.panel-header p[data-v-e9d7459e] {\r
  margin: 4px 0 0;\r
  font-size: 11px;\r
  color: #9db2c2;
}
.preview-card[data-v-e9d7459e] {\r
  border: 1px solid;\r
  border-radius: 8px;\r
  overflow: hidden;
}
.preview-header[data-v-e9d7459e] {\r
  padding: 6px 8px;\r
  font-weight: 600;
}
.preview-content[data-v-e9d7459e] {\r
  padding: 8px;\r
  display: grid;\r
  gap: 6px;
}
.preview-subtext[data-v-e9d7459e] {\r
  opacity: 0.82;
}
.panel-section[data-v-e9d7459e] {\r
  border: 1px solid rgba(129, 149, 164, 0.24);\r
  border-radius: 8px;\r
  background: rgba(18, 24, 32, 0.72);\r
  overflow: hidden;
}
.panel-section summary[data-v-e9d7459e] {\r
  cursor: pointer;\r
  padding: 8px;\r
  font-size: 12px;\r
  letter-spacing: 0.05em;\r
  text-transform: uppercase;\r
  color: #8cf2d2;\r
  user-select: none;
}
.section-body[data-v-e9d7459e] {\r
  padding: 0 8px 8px;\r
  display: grid;\r
  gap: 8px;
}
.control-row[data-v-e9d7459e] {\r
  display: grid;\r
  gap: 4px;
}
.control-grid[data-v-e9d7459e] {\r
  display: grid;\r
  grid-template-columns: repeat(2, minmax(0, 1fr));\r
  gap: 8px;
}
.slot-grid[data-v-e9d7459e] {\r
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.control-row label[data-v-e9d7459e] {\r
  font-size: 11px;\r
  color: #c3d6e4;
}
.control-input[data-v-e9d7459e] {\r
  width: 100%;\r
  box-sizing: border-box;\r
  border: 1px solid rgba(182, 208, 224, 0.2);\r
  border-radius: 6px;\r
  background: rgba(8, 12, 18, 0.7);\r
  color: #ecf4fa;\r
  padding: 6px 8px;
}
.control-input[type="range"][data-v-e9d7459e] {\r
  padding: 0;
}
.slider-row span[data-v-e9d7459e] {\r
  font-size: 11px;\r
  color: #9fb2c2;
}
.color-input[data-v-e9d7459e] {\r
  padding: 0;\r
  min-height: 30px;
}
.inline-controls[data-v-e9d7459e] {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 8px;
}
.feedback-text[data-v-e9d7459e] {\r
  margin: 0;\r
  font-size: 11px;
}
.feedback-error[data-v-e9d7459e] {\r
  color: #ff8b8b;
}
.feedback-info[data-v-e9d7459e] {\r
  color: #8cf2d2;
}
.font-list[data-v-e9d7459e] {\r
  display: grid;\r
  gap: 6px;
}
.font-item[data-v-e9d7459e] {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  gap: 8px;\r
  padding: 6px 8px;\r
  border: 1px solid rgba(182, 208, 224, 0.2);\r
  border-radius: 6px;\r
  background: rgba(10, 14, 20, 0.72);
}
.font-meta[data-v-e9d7459e] {\r
  min-width: 0;\r
  display: grid;\r
  gap: 2px;
}
.font-family[data-v-e9d7459e] {\r
  font-size: 12px;\r
  color: #e8f4f8;
}
.font-file[data-v-e9d7459e] {\r
  font-size: 10px;\r
  color: #9fb2c2;\r
  word-break: break-all;
}
.font-empty[data-v-e9d7459e] {\r
  margin: 0;\r
  font-size: 11px;\r
  color: #9fb2c2;
}
.action-button[data-v-e9d7459e],\r
.reset-button[data-v-e9d7459e] {\r
  border: 1px solid rgba(147, 170, 184, 0.4);\r
  border-radius: 6px;\r
  background: linear-gradient(135deg, rgba(34, 43, 54, 0.95), rgba(25, 34, 44, 0.95));\r
  color: #eff7fa;\r
  cursor: pointer;\r
  padding: 7px 10px;\r
  font-size: 11px;\r
  letter-spacing: 0.03em;
}
.compact-button[data-v-e9d7459e] {\r
  padding: 5px 8px;\r
  font-size: 10px;
}
.action-button[data-v-e9d7459e]:hover,\r
.reset-button[data-v-e9d7459e]:hover {\r
  border-color: rgba(135, 243, 206, 0.65);
}
.action-button[data-v-e9d7459e]:disabled,\r
.reset-button[data-v-e9d7459e]:disabled {\r
  opacity: 0.55;\r
  cursor: not-allowed;\r
  border-color: rgba(147, 170, 184, 0.24);
}
.hidden-input[data-v-e9d7459e] {\r
  display: none;
}
.panel-footer[data-v-e9d7459e] {\r
  display: flex;\r
  justify-content: flex-end;
}\r

.grading-panel[data-v-a3ef85c3] {
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
.panel-header[data-v-a3ef85c3] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 30, 32, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-top-left-radius: 11px;
  border-top-right-radius: 11px;
}
.title-container[data-v-a3ef85c3] {
  display: flex;
  flex-direction: column;
}
.header-title[data-v-a3ef85c3] {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8fafc;
}
.node-id[data-v-a3ef85c3] {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}
.reset-btn[data-v-a3ef85c3] {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.reset-btn[data-v-a3ef85c3]:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}
.scrollable-content[data-v-a3ef85c3] {
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow: hidden;
}
.panel-section[data-v-a3ef85c3] {
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
.preview-panel[data-v-a3ef85c3] {
  order: 1;
}
.effects-panel[data-v-a3ef85c3] {
  order: 2;
}
.color-map-panel[data-v-a3ef85c3] {
  order: 3;
}
.curves-panel[data-v-a3ef85c3] {
  order: 4;
}
.panel-section.is-collapsed[data-v-a3ef85c3] {
  align-self: start;
  height: auto;
}
.section-header[data-v-a3ef85c3] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(35, 35, 38, 0.8);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}
.section-header[data-v-a3ef85c3]:hover {
  background: rgba(50, 50, 55, 0.9);
}
.section-title[data-v-a3ef85c3] {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
}
.collapse-icon[data-v-a3ef85c3] {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}
.section-body[data-v-a3ef85c3] {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}
.preview-panel .section-body[data-v-a3ef85c3] {
  overflow: hidden;
}
.preview-fit-toggle[data-v-a3ef85c3] {
  display: inline-flex;
  align-self: flex-end;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: rgba(10, 12, 16, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.fit-btn[data-v-a3ef85c3] {
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
.fit-btn[data-v-a3ef85c3]:hover {
  color: #d7e2f2;
}
.fit-btn.active[data-v-a3ef85c3] {
  color: #f8fafc;
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(96, 165, 250, 0.45);
}
.preview-panel .wipe-container[data-v-a3ef85c3] {
  flex: 1;
  min-height: 0;
  height: 100%;
  aspect-ratio: auto;
}

/* Wipe Container */
.wipe-container[data-v-a3ef85c3] {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
}
.wipe-canvas[data-v-a3ef85c3] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.before-canvas[data-v-a3ef85c3] {
  z-index: 1;
}
.after-canvas[data-v-a3ef85c3] {
  z-index: 2;
}
.wipe-handle[data-v-a3ef85c3] {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  z-index: 3;
  cursor: ew-resize;
  transform: translateX(-50%);
}
.handle-line[data-v-a3ef85c3] {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}
.handle-thumb[data-v-a3ef85c3] {
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
.wipe-handle:hover .handle-thumb[data-v-a3ef85c3] {
  background: #3b82f6;
}
.wipe-label[data-v-a3ef85c3] {
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
.before-label[data-v-a3ef85c3] {
  left: 8px;
}
.after-label[data-v-a3ef85c3] {
  right: 8px;
}
.preview-placeholder[data-v-a3ef85c3] {
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
.preview-placeholder p[data-v-a3ef85c3] {
  font-size: 11px;
  margin: 0;
}

/* Curves Section */
.channel-tabs[data-v-a3ef85c3] {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tab-btn[data-v-a3ef85c3] {
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
.tab-btn.active[data-v-a3ef85c3] {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}
.tab-rgb.active[data-v-a3ef85c3] { border-color: rgba(255, 255, 255, 0.5);
}
.tab-r.active[data-v-a3ef85c3] { border-color: rgba(239, 68, 68, 0.5); color: #f87171;
}
.tab-g.active[data-v-a3ef85c3] { border-color: rgba(34, 197, 94, 0.5); color: #4ade80;
}
.tab-b.active[data-v-a3ef85c3] { border-color: rgba(59, 130, 246, 0.5); color: #60a5fa;
}
.reset-sub-btn[data-v-a3ef85c3] {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.reset-sub-btn[data-v-a3ef85c3]:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.remove-point-btn[data-v-a3ef85c3] {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.remove-point-btn[data-v-a3ef85c3]:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.45);
  color: #fecaca;
}
.remove-point-btn[data-v-a3ef85c3]:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.curve-editor-container[data-v-a3ef85c3] {
  width: 100%;
  aspect-ratio: 1;
  background: #161618;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.curve-svg[data-v-a3ef85c3] {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.grid-line[data-v-a3ef85c3] {
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}
.diagonal-line[data-v-a3ef85c3] {
  stroke: rgba(255, 255, 255, 0.02);
  stroke-width: 1;
}
.curve-path-inactive[data-v-a3ef85c3] {
  fill: none;
  stroke-width: 1.5;
  opacity: 0.25;
}
.curve-path-active[data-v-a3ef85c3] {
  fill: none;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.1));
}
.curve-rgb[data-v-a3ef85c3] { stroke: #e2e8f0;
}
.curve-r[data-v-a3ef85c3] { stroke: #ef4444;
}
.curve-g[data-v-a3ef85c3] { stroke: #22c55e;
}
.curve-b[data-v-a3ef85c3] { stroke: #3b82f6;
}
.curve-knot[data-v-a3ef85c3] {
  fill: #1e293b;
  stroke-width: 2;
  cursor: grab;
}
.curve-knot[data-v-a3ef85c3]:hover {
  r: 8px;
}
.curve-knot.selected[data-v-a3ef85c3] {
  cursor: grabbing;
  r: 8px;
}
.curve-knot.endpoint[data-v-a3ef85c3] {
  r: 5px;
  stroke: #cbd5e1;
}
.curve-knot.curve-rgb[data-v-a3ef85c3] { stroke: #f8fafc;
}
.curve-knot.curve-r[data-v-a3ef85c3] { stroke: #ef4444;
}
.curve-knot.curve-g[data-v-a3ef85c3] { stroke: #22c55e;
}
.curve-knot.curve-b[data-v-a3ef85c3] { stroke: #3b82f6;
}
.coord-tooltip[data-v-a3ef85c3] {
  fill: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-family: monospace;
}

/* Histogram */
.histogram-container[data-v-a3ef85c3] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.histogram-header[data-v-a3ef85c3] {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
.histogram-svg[data-v-a3ef85c3] {
  width: 100%;
  height: 50px;
  background: #111112;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  overflow: hidden;
}
.hist-path[data-v-a3ef85c3] {
  fill: none;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.hist-r[data-v-a3ef85c3] { stroke: rgba(239, 68, 68, 0.5); fill: rgba(239, 68, 68, 0.05);
}
.hist-g[data-v-a3ef85c3] { stroke: rgba(34, 197, 94, 0.5); fill: rgba(34, 197, 94, 0.05);
}
.hist-b[data-v-a3ef85c3] { stroke: rgba(59, 130, 246, 0.5); fill: rgba(59, 130, 246, 0.05);
}
.hist-lum[data-v-a3ef85c3] { stroke: rgba(255, 255, 255, 0.4); fill: rgba(255, 255, 255, 0.02);
}

/* Control row structures */
.control-row[data-v-a3ef85c3] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
}
.control-row-vertical[data-v-a3ef85c3] {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.slider-labels[data-v-a3ef85c3] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control-label[data-v-a3ef85c3] {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}
.value-display[data-v-a3ef85c3] {
  font-size: 11px;
  font-family: monospace;
  color: #3b82f6;
}

/* Styled HTML inputs */
.gradient-checkbox[data-v-a3ef85c3] {
  width: 14px;
  height: 14px;
  accent-color: #3b82f6;
  cursor: pointer;
}
.styled-select[data-v-a3ef85c3] {
  background: #1e1e20;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}
.styled-range[data-v-a3ef85c3] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}
.styled-range[data-v-a3ef85c3]::-webkit-slider-thumb {
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
.styled-range[data-v-a3ef85c3]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #60a5fa;
}

/* Gradient editor box */
.gradient-editor-box[data-v-a3ef85c3] {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}
.gradient-stops-section[data-v-a3ef85c3] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gradient-bar-track[data-v-a3ef85c3] {
  height: 24px;
  width: 100%;
  border-radius: 6px;
  position: relative;
  cursor: crosshair;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}
.gradient-stop-marker[data-v-a3ef85c3] {
  position: absolute;
  top: 0;
  width: 0;
  height: 100%;
  cursor: grab;
  transform: translateX(-50%);
}
.gradient-stop-marker[data-v-a3ef85c3]:active {
  cursor: grabbing;
}
.marker-pin[data-v-a3ef85c3] {
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
.gradient-stop-marker:hover .marker-pin[data-v-a3ef85c3] {
  transform: scale(1.2);
}
.stop-editor-bar[data-v-a3ef85c3] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #161618;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.editor-title[data-v-a3ef85c3] {
  font-size: 10px;
  font-weight: bold;
  color: #94a3b8;
}
.stop-inputs[data-v-a3ef85c3] {
  display: flex;
  gap: 12px;
  align-items: center;
}
.stop-input-group[data-v-a3ef85c3] {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #94a3b8;
}
.stop-num-input[data-v-a3ef85c3] {
  width: 40px;
  background: #252528;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #fff;
  padding: 2px;
  font-size: 10px;
  text-align: center;
}
.stop-color-picker[data-v-a3ef85c3] {
  width: 32px;
  height: 18px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  padding: 0;
}

/* Post-Processing Effects section */
.effects-sliders[data-v-a3ef85c3] {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.effects-group-title[data-v-a3ef85c3] {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
}


.latent-calc-card[data-v-b6d212bd] {
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
.theme-flux1[data-v-b6d212bd] {
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.theme-flux2[data-v-b6d212bd] {
  border-color: rgba(191, 0, 255, 0.3);
  box-shadow: 0 4px 20px rgba(191, 0, 255, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.theme-sd3[data-v-b6d212bd] {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.card-header[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}
.header-main[data-v-b6d212bd] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title[data-v-b6d212bd] {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8fafc;
}
.header-badge[data-v-b6d212bd] {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 9999px;
  border: 1px solid;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}
.header-subtitle[data-v-b6d212bd] {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
.card-body[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.control-group[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.control-header[data-v-b6d212bd] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control-label[data-v-b6d212bd] {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.01em;
}
.value-badge[data-v-b6d212bd] {
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
}
.slider-wrapper[data-v-b6d212bd] {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Styled HTML slider range */
.styled-range[data-v-b6d212bd] {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
}
.styled-range[data-v-b6d212bd]::-webkit-slider-thumb {
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
.styled-range[data-v-b6d212bd]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
.theme-flux1 .styled-range[data-v-b6d212bd]::-webkit-slider-thumb { background: #00f0ff; box-shadow: 0 0 6px rgba(0,240,255,0.8);
}
.theme-flux2 .styled-range[data-v-b6d212bd]::-webkit-slider-thumb { background: #bf00ff; box-shadow: 0 0 6px rgba(191,0,255,0.8);
}
.theme-sd3 .styled-range[data-v-b6d212bd]::-webkit-slider-thumb { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.8);
}
.styled-number[data-v-b6d212bd] {
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
.styled-select[data-v-b6d212bd] {
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
.coercion-pill[data-v-b6d212bd] {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  width: max-content;
}
.coercion-pill.warning[data-v-b6d212bd] {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.coercion-pill.info[data-v-b6d212bd] {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.alert-box[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  border-radius: 8px;
  gap: 2px;
}
.alert-box.error[data-v-b6d212bd] {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.alert-box.warning-box[data-v-b6d212bd] {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.alert-title[data-v-b6d212bd] {
  font-size: 11px;
  font-weight: 600;
}
.alert-desc[data-v-b6d212bd] {
  margin: 0;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
}

/* Visualizer Layout */
.preview-container[data-v-b6d212bd] {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  margin-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
}
.visualizer-wrapper[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.svg-canvas[data-v-b6d212bd] {
  width: 100px;
  height: 100px;
  background: #0d0d0e;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.aspect-ratio-label[data-v-b6d212bd] {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}
.telemetry-info[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.telemetry-row[data-v-b6d212bd] {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tel-label[data-v-b6d212bd] {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}
.tel-val[data-v-b6d212bd] {
  font-size: 11px;
  font-family: monospace;
}
.tel-val.highlight[data-v-b6d212bd] {
  color: #fff;
}
.latent-block-size[data-v-b6d212bd] {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 4px;
}

/* Micro-animations */
.pulse-glow[data-v-b6d212bd] {
  transition: all 0.3s ease;
}
.theme-flux1 .pulse-glow[data-v-b6d212bd] {
  filter: drop-shadow(0 0 2px rgba(0, 240, 255, 0.4));
}
.theme-flux2 .pulse-glow[data-v-b6d212bd] {
  filter: drop-shadow(0 0 2px rgba(191, 0, 255, 0.4));
}
.theme-sd3 .pulse-glow[data-v-b6d212bd] {
  filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4));
}

.block-swap-card[data-v-8878db33] {
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
.card-header[data-v-8878db33] {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 10px;
  margin-bottom: 14px;
}
.header-main[data-v-8878db33] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title[data-v-8878db33] {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #ffffff;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header-badge[data-v-8878db33] {
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
.header-badge.badge-active[data-v-8878db33] {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
}
.header-subtitle[data-v-8878db33] {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.card-body[data-v-8878db33] {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.control-row[data-v-8878db33] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: opacity 0.25s ease;
}
.control-row.toggle-row[data-v-8878db33] {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.control-row.compact-toggle[data-v-8878db33] {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.row-disabled[data-v-8878db33] {
  opacity: 0.38;
  pointer-events: none;
}
.label-group[data-v-8878db33] {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}
.control-label[data-v-8878db33] {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 4px;
}
.lock-icon[data-v-8878db33] {
  font-size: 10px;
  color: #10b981;
}
.control-desc[data-v-8878db33] {
  margin: 0;
  font-size: 10px;
  color: #64748b;
}
.control-header[data-v-8878db33] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.value-badge[data-v-8878db33] {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  color: #94a3b8;
}
.value-badge.highlight[data-v-8878db33] {
  color: #38bdf8;
}
.slider-wrapper[data-v-8878db33] {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Styled range slider */
.styled-range[data-v-8878db33] {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
}
.styled-range[data-v-8878db33]::-webkit-slider-thumb {
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
.styled-range[data-v-8878db33]::-webkit-slider-thumb:hover {
  transform: scale(1.25);
  background: #7dd3fc;
}

/* Toggle Switch Styling */
.switch[data-v-8878db33] {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  flex-shrink: 0;
}
.switch input[data-v-8878db33] {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider[data-v-8878db33] {
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
.slider[data-v-8878db33]:before {
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
input:checked + .slider[data-v-8878db33] {
  background-color: rgba(14, 165, 233, 0.25);
  border-color: rgba(14, 165, 233, 0.4);
}
input:checked + .slider[data-v-8878db33]:before {
  transform: translateX(14px);
  background-color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
}
.slider.round[data-v-8878db33] {
  border-radius: 34px;
}
.slider.round[data-v-8878db33]:before {
  border-radius: 50%;
}

/* Compact Toggle */
.switch.compact[data-v-8878db33] {
  width: 28px;
  height: 16px;
}
.switch.compact .slider[data-v-8878db33]:before {
  height: 10px;
  width: 10px;
  left: 2px;
  bottom: 2px;
}
input:checked + .switch.compact .slider[data-v-8878db33]:before {
  transform: translateX(12px);
}
.toggles-grid[data-v-8878db33] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px;
}

/* Stepper widget styling */
.stepper-wrapper[data-v-8878db33] {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
  height: 28px;
}
.display-val[data-v-8878db33] {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #38bdf8;
}
.step-btn[data-v-8878db33] {
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
.step-btn[data-v-8878db33]:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}
.step-btn[data-v-8878db33]:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}
.step-btn.compact[data-v-8878db33] {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Telemetry styling */
.telemetry-dashboard[data-v-8878db33] {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%);
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.telemetry-grid[data-v-8878db33] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.telemetry-item[data-v-8878db33] {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tel-lbl[data-v-8878db33] {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tel-val[data-v-8878db33] {
  font-size: 11px;
  font-weight: 700;
  color: #f1f5f9;
}
.font-mono[data-v-8878db33] {
  font-family: ui-monospace, monospace;
}
.hw-badge[data-v-8878db33] {
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
.advanced-accordion[data-v-8878db33] {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}
.accordion-summary[data-v-8878db33] {
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
.accordion-summary[data-v-8878db33]::-webkit-details-marker {
  display: none;
}
.accordion-summary[data-v-8878db33]:hover {
  background: rgba(255, 255, 255, 0.02);
  color: #ffffff;
}
.accordion-summary .arrow[data-v-8878db33] {
  font-size: 8px;
  transition: transform 0.25s ease;
  color: #64748b;
}
.advanced-accordion[open] .accordion-summary[data-v-8878db33] {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.advanced-accordion[open] .accordion-summary .arrow[data-v-8878db33] {
  transform: rotate(180deg);
  color: #38bdf8;
}
.accordion-content[data-v-8878db33] {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}`));
      document.head.appendChild(elementStyle);
    }
  } catch (e) {
    console.error("vite-plugin-css-injected-by-js", e);
  }
})();
