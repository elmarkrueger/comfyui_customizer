import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";
import { h as defineComponent, p as ref, x as watch, k as onMounted, m as openBlock, e as createElementBlock, b as createBaseVNode, j as normalizeStyle, t as toDisplayString, y as withDirectives, s as vModelSelect, u as vModelText, d as createCommentVNode, F as Fragment, q as renderList, g as createTextVNode, i as normalizeClass, c as computed, _ as _export_sfc, a as createApp } from "./_plugin-vue_export-helper-C-igAGFE.js";
const _hoisted_1 = { class: "card-header" };
const _hoisted_2 = { class: "header-main" };
const _hoisted_3 = { class: "card-body" };
const _hoisted_4 = { class: "control-group" };
const _hoisted_5 = { class: "control-group" };
const _hoisted_6 = { class: "control-header" };
const _hoisted_7 = { class: "slider-wrapper" };
const _hoisted_8 = {
  key: 0,
  class: "coercion-pill warning"
};
const _hoisted_9 = { class: "control-group" };
const _hoisted_10 = { class: "control-header" };
const _hoisted_11 = { class: "slider-wrapper" };
const _hoisted_12 = {
  key: 0,
  class: "coercion-pill info"
};
const _hoisted_13 = {
  key: 0,
  class: "alert-box error"
};
const _hoisted_14 = { class: "alert-desc" };
const _hoisted_15 = {
  key: 1,
  class: "alert-box warning-box"
};
const _hoisted_16 = { class: "preview-container" };
const _hoisted_17 = { class: "visualizer-wrapper" };
const _hoisted_18 = {
  viewBox: "0 0 120 120",
  class: "svg-canvas"
};
const _hoisted_19 = ["x", "y", "width", "height"];
const _hoisted_20 = ["x", "y", "width", "height", "fill", "stroke"];
const _hoisted_21 = { class: "aspect-ratio-label" };
const _hoisted_22 = { class: "telemetry-info" };
const _hoisted_23 = { class: "telemetry-row" };
const _hoisted_24 = { class: "tel-val highlight" };
const _hoisted_25 = { class: "telemetry-row" };
const _hoisted_26 = { class: "tel-val highlight" };
const _hoisted_27 = { class: "telemetry-row" };
const _hoisted_28 = { class: "tel-val highlight" };
const _hoisted_29 = { class: "telemetry-row" };
const _hoisted_30 = { class: "tel-val highlight" };
const _hoisted_31 = { class: "telemetry-row" };
const _hoisted_32 = { class: "latent-block-size" };
const _hoisted_33 = { class: "telemetry-row" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LatentScalingCalculator",
  props: {
    initialReducedSize: {},
    initialTargetSize: {},
    initialModelFamily: {},
    nodeId: {},
    onReducedSizeChange: { type: Function },
    onTargetSizeChange: { type: Function },
    onModelFamilyChange: { type: Function },
    onResize: { type: Function }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const reducedSize = ref(props.initialReducedSize);
    const targetSize = ref(props.initialTargetSize);
    const modelFamily = ref(props.initialModelFamily);
    const telemetry = ref({
      calcWidth: 0,
      calcHeight: 0,
      inputWidth: 0,
      inputHeight: 0,
      inputChannels: 0,
      vaeFactor: 0,
      factorSource: "",
      resizeMode: "",
      resizeIntent: "",
      resizeApplied: false,
      warnings: [],
      executedModelFamily: ""
    });
    function roundHalfUp(value) {
      return Math.floor(value + 0.5);
    }
    function alignToFactor(value, f) {
      return Math.max(f, roundHalfUp(value / f) * f);
    }
    const expectedFactor = computed(() => {
      if (modelFamily.value === "Flux 2") return 6;
      return 8;
    });
    const factor = computed(() => {
      return telemetry.value.vaeFactor > 0 ? telemetry.value.vaeFactor : expectedFactor.value;
    });
    const factorLabel = computed(() => {
      if (telemetry.value.vaeFactor > 0) return String(telemetry.value.vaeFactor);
      if (modelFamily.value === "Flux 2") return "6/16";
      return String(expectedFactor.value);
    });
    const minPixels = computed(() => 8 * factor.value);
    const backendFactorLabel = computed(() => {
      if (!telemetry.value.vaeFactor) return "Pending execution...";
      const source = telemetry.value.factorSource || "vae metadata";
      return `f=${telemetry.value.vaeFactor} (${source})`;
    });
    const resizeModeLabel = computed(() => {
      if (!telemetry.value.resizeMode) return "Pending execution...";
      if (telemetry.value.resizeMode === "identity") return "Identity (no resize)";
      if (telemetry.value.resizeMode === "pixel") return "Pixel (decode -> resize -> encode)";
      return "Latent";
    });
    const resizeIntentLabel = computed(() => {
      if (!telemetry.value.resizeIntent) return "Pending execution...";
      if (telemetry.value.resizeIntent === "identity") return "Identity (already matched)";
      if (telemetry.value.resizeIntent === "upscale") return "Upscale";
      if (telemetry.value.resizeIntent === "downscale") return "Downscale";
      return telemetry.value.resizeIntent;
    });
    const coercedReducedSize = computed(() => {
      return alignToFactor(reducedSize.value, factor.value);
    });
    const coercedTargetSize = computed(() => {
      return alignToFactor(targetSize.value, factor.value);
    });
    const hasInputTelemetry = computed(() => telemetry.value.inputWidth > 0 && telemetry.value.inputHeight > 0);
    const currentAr = computed(() => {
      if (hasInputTelemetry.value) {
        return telemetry.value.inputWidth / telemetry.value.inputHeight;
      }
      return 1;
    });
    const aspectRatioLabel = computed(() => {
      if (!hasInputTelemetry.value) {
        return "Ratio: pending execution...";
      }
      return `Ratio: ${currentAr.value.toFixed(2)} (${aspectFraction.value})`;
    });
    const aspectFraction = computed(() => {
      const ar = currentAr.value;
      if (Math.abs(ar - 1) < 1e-4) return "1:1";
      if (Math.abs(ar - 1.5) < 0.05) return "3:2";
      if (Math.abs(ar - 1.333) < 0.05) return "4:3";
      if (Math.abs(ar - 1.777) < 0.05) return "16:9";
      if (Math.abs(ar - 2) < 0.05) return "2:1";
      if (Math.abs(ar - 0.5) < 0.05) return "1:2";
      if (Math.abs(ar - 0.666) < 0.05) return "2:3";
      if (Math.abs(ar - 0.75) < 0.05) return "3:4";
      if (Math.abs(ar - 0.562) < 0.05) return "9:16";
      return ar > 1 ? `${ar.toFixed(1)}:1` : `1:${(1 / ar).toFixed(1)}`;
    });
    const coercedReducedWidth = computed(() => {
      const ar = currentAr.value;
      const aligned = coercedReducedSize.value;
      if (ar >= 1) return aligned;
      return alignToFactor(aligned * ar, factor.value);
    });
    const coercedReducedHeight = computed(() => {
      const ar = currentAr.value;
      const aligned = coercedReducedSize.value;
      if (ar >= 1) return alignToFactor(aligned / ar, factor.value);
      return aligned;
    });
    const wLatent = computed(() => coercedReducedWidth.value / factor.value);
    const hLatent = computed(() => coercedReducedHeight.value / factor.value);
    const isCollapsed = computed(() => {
      return wLatent.value < 8 || hLatent.value < 8;
    });
    const calculatedTargetWidth = computed(() => {
      const newAr = wLatent.value / hLatent.value;
      const alignedTarget = coercedTargetSize.value;
      if (newAr >= 1) return alignedTarget;
      return alignToFactor(alignedTarget * newAr, factor.value);
    });
    const calculatedTargetHeight = computed(() => {
      const newAr = wLatent.value / hLatent.value;
      const alignedTarget = coercedTargetSize.value;
      if (newAr >= 1) return alignToFactor(alignedTarget / newAr, factor.value);
      return alignedTarget;
    });
    const outerBox = computed(() => {
      const ar = currentAr.value;
      const maxDim = 90;
      let width = maxDim;
      let height = maxDim;
      if (ar >= 1) {
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
      const width = outer.width * Math.min(1, ratio);
      const height = outer.height * Math.min(1, ratio);
      return {
        width,
        height,
        x: (120 - width) / 2,
        y: (120 - height) / 2
      };
    });
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
    function onReducedChange() {
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
    function hydrateState(data) {
      if (typeof data.reducedSize === "number") reducedSize.value = data.reducedSize;
      if (typeof data.targetSize === "number") targetSize.value = data.targetSize;
      if (typeof data.modelFamily === "string") modelFamily.value = data.modelFamily;
    }
    function setTelemetry(data) {
      telemetry.value = {
        calcWidth: data?.calcWidth ?? 0,
        calcHeight: data?.calcHeight ?? 0,
        inputWidth: data?.inputWidth ?? 0,
        inputHeight: data?.inputHeight ?? 0,
        inputChannels: data?.inputChannels ?? 0,
        vaeFactor: data?.vaeFactor ?? 0,
        factorSource: data?.factorSource ?? "",
        resizeMode: data?.resizeMode ?? "",
        resizeIntent: data?.resizeIntent ?? "",
        resizeApplied: Boolean(data?.resizeApplied ?? false),
        warnings: Array.isArray(data?.warnings) ? data.warnings : [],
        executedModelFamily: data?.executedModelFamily ?? ""
      };
    }
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
    __expose({ hydrateState, setTelemetry });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["latent-calc-card", themeClass.value])
      }, [
        createBaseVNode("header", _hoisted_1, [
          createBaseVNode("div", _hoisted_2, [
            _cache[5] || (_cache[5] = createBaseVNode("h3", { class: "header-title" }, "Dynamic Latent Scaling", -1)),
            createBaseVNode("span", {
              class: "header-badge",
              style: normalizeStyle(accentStyle.value)
            }, toDisplayString(modelFamily.value) + " [f=" + toDisplayString(factorLabel.value) + "]", 5)
          ]),
          _cache[6] || (_cache[6] = createBaseVNode("p", { class: "header-subtitle" }, "Nodes 2.0 Aspect-Locked Resizer", -1))
        ]),
        createBaseVNode("main", _hoisted_3, [
          createBaseVNode("div", _hoisted_4, [
            _cache[8] || (_cache[8] = createBaseVNode("div", { class: "control-header" }, [
              createBaseVNode("label", { class: "control-label" }, "Model Architecture")
            ], -1)),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => modelFamily.value = $event),
              class: "styled-select",
              onChange: onFamilyChange
            }, [..._cache[7] || (_cache[7] = [
              createBaseVNode("option", { value: "Flux 1" }, "Flux 1 (f=8)", -1),
              createBaseVNode("option", { value: "Flux 2" }, "Flux 2 (variant f=6/f=16)", -1),
              createBaseVNode("option", { value: "SD3" }, "Stable Diffusion 3 (f=8)", -1)
            ])], 544), [
              [vModelSelect, modelFamily.value]
            ])
          ]),
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode("div", _hoisted_6, [
              _cache[9] || (_cache[9] = createBaseVNode("label", { class: "control-label" }, "Reduced Image Size (Longest Side)", -1)),
              createBaseVNode("span", {
                class: "value-badge",
                style: normalizeStyle(valueStyle.value)
              }, toDisplayString(coercedReducedSize.value) + " px", 5)
            ]),
            createBaseVNode("div", _hoisted_7, [
              withDirectives(createBaseVNode("input", {
                type: "range",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => reducedSize.value = $event),
                min: "64",
                max: "8192",
                step: "8",
                class: "styled-range",
                onInput: onReducedChange
              }, null, 544), [
                [
                  vModelText,
                  reducedSize.value,
                  void 0,
                  { number: true }
                ]
              ]),
              withDirectives(createBaseVNode("input", {
                type: "number",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => reducedSize.value = $event),
                min: "64",
                max: "8192",
                step: "8",
                class: "styled-number",
                onChange: onReducedChange
              }, null, 544), [
                [
                  vModelText,
                  reducedSize.value,
                  void 0,
                  { number: true }
                ]
              ])
            ]),
            reducedSize.value !== coercedReducedSize.value ? (openBlock(), createElementBlock("div", _hoisted_8, " ⚠️ Round Alignment: " + toDisplayString(reducedSize.value) + " -> " + toDisplayString(coercedReducedSize.value) + " px ", 1)) : createCommentVNode("", true)
          ]),
          createBaseVNode("div", _hoisted_9, [
            createBaseVNode("div", _hoisted_10, [
              _cache[10] || (_cache[10] = createBaseVNode("label", { class: "control-label" }, "Target Size (Longest Side)", -1)),
              createBaseVNode("span", {
                class: "value-badge",
                style: normalizeStyle(valueStyle.value)
              }, toDisplayString(coercedTargetSize.value) + " px", 5)
            ]),
            createBaseVNode("div", _hoisted_11, [
              withDirectives(createBaseVNode("input", {
                type: "range",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => targetSize.value = $event),
                min: "64",
                max: "16384",
                step: "8",
                class: "styled-range",
                onInput: onTargetChange
              }, null, 544), [
                [
                  vModelText,
                  targetSize.value,
                  void 0,
                  { number: true }
                ]
              ]),
              withDirectives(createBaseVNode("input", {
                type: "number",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => targetSize.value = $event),
                min: "64",
                max: "16384",
                step: "8",
                class: "styled-number",
                onChange: onTargetChange
              }, null, 544), [
                [
                  vModelText,
                  targetSize.value,
                  void 0,
                  { number: true }
                ]
              ])
            ]),
            targetSize.value !== coercedTargetSize.value ? (openBlock(), createElementBlock("div", _hoisted_12, " ⚡ Round Alignment: " + toDisplayString(targetSize.value) + " -> " + toDisplayString(coercedTargetSize.value) + " px ", 1)) : createCommentVNode("", true)
          ]),
          isCollapsed.value ? (openBlock(), createElementBlock("div", _hoisted_13, [
            _cache[11] || (_cache[11] = createBaseVNode("span", { class: "alert-title" }, "🚨 Dimensional Collapse", -1)),
            createBaseVNode("p", _hoisted_14, " Aspect ratio reduces the short side below 8 blocks (" + toDisplayString(minPixels.value) + "px). Increase Reduced Image Size! ", 1)
          ])) : createCommentVNode("", true),
          telemetry.value.warnings && telemetry.value.warnings.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_15, [
            _cache[12] || (_cache[12] = createBaseVNode("span", { class: "alert-title" }, "⚠️ Compatibility Alert", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(telemetry.value.warnings, (warn, index) => {
              return openBlock(), createElementBlock("p", {
                key: index,
                class: "alert-desc"
              }, toDisplayString(warn), 1);
            }), 128))
          ])) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_16, [
            createBaseVNode("div", _hoisted_17, [
              (openBlock(), createElementBlock("svg", _hoisted_18, [
                _cache[13] || (_cache[13] = createBaseVNode("defs", null, [
                  createBaseVNode("pattern", {
                    id: "grid",
                    width: "10",
                    height: "10",
                    patternUnits: "userSpaceOnUse"
                  }, [
                    createBaseVNode("path", {
                      d: "M 10 0 L 0 0 0 10",
                      fill: "none",
                      stroke: "rgba(255,255,255,0.03)",
                      "stroke-width": "0.5"
                    })
                  ])
                ], -1)),
                _cache[14] || (_cache[14] = createBaseVNode("rect", {
                  width: "100%",
                  height: "100%",
                  fill: "url(#grid)",
                  rx: "6"
                }, null, -1)),
                !isCollapsed.value ? (openBlock(), createElementBlock("rect", {
                  key: 0,
                  x: outerBox.value.x,
                  y: outerBox.value.y,
                  width: outerBox.value.width,
                  height: outerBox.value.height,
                  fill: "none",
                  stroke: "rgba(255, 255, 255, 0.2)",
                  "stroke-width": "1.5",
                  "stroke-dasharray": "3 3",
                  rx: "2"
                }, null, 8, _hoisted_19)) : createCommentVNode("", true),
                !isCollapsed.value ? (openBlock(), createElementBlock("rect", {
                  key: 1,
                  x: innerBox.value.x,
                  y: innerBox.value.y,
                  width: innerBox.value.width,
                  height: innerBox.value.height,
                  fill: fillColor.value,
                  stroke: accentColor.value,
                  "stroke-width": "1.5",
                  rx: "2",
                  class: "pulse-glow"
                }, null, 8, _hoisted_20)) : createCommentVNode("", true)
              ])),
              createBaseVNode("div", _hoisted_21, toDisplayString(aspectRatioLabel.value), 1)
            ]),
            createBaseVNode("div", _hoisted_22, [
              createBaseVNode("div", _hoisted_23, [
                _cache[15] || (_cache[15] = createBaseVNode("span", { class: "tel-label" }, "Input Shape:", -1)),
                createBaseVNode("span", _hoisted_24, toDisplayString(telemetry.value.inputWidth ? `${telemetry.value.inputWidth} × ${telemetry.value.inputHeight} px` : "Pending execution..."), 1)
              ]),
              createBaseVNode("div", _hoisted_25, [
                _cache[16] || (_cache[16] = createBaseVNode("span", { class: "tel-label" }, "Backend Factor:", -1)),
                createBaseVNode("span", _hoisted_26, toDisplayString(backendFactorLabel.value), 1)
              ]),
              createBaseVNode("div", _hoisted_27, [
                _cache[17] || (_cache[17] = createBaseVNode("span", { class: "tel-label" }, "Resize Intent:", -1)),
                createBaseVNode("span", _hoisted_28, toDisplayString(resizeIntentLabel.value), 1)
              ]),
              createBaseVNode("div", _hoisted_29, [
                _cache[18] || (_cache[18] = createBaseVNode("span", { class: "tel-label" }, "Resize Domain:", -1)),
                createBaseVNode("span", _hoisted_30, toDisplayString(resizeModeLabel.value), 1)
              ]),
              createBaseVNode("div", _hoisted_31, [
                _cache[19] || (_cache[19] = createBaseVNode("span", { class: "tel-label" }, "Reduced Latent:", -1)),
                createBaseVNode("span", {
                  class: "tel-val",
                  style: normalizeStyle(textStyle.value)
                }, [
                  createTextVNode(toDisplayString(coercedReducedWidth.value) + " × " + toDisplayString(coercedReducedHeight.value) + " px ", 1),
                  createBaseVNode("span", _hoisted_32, "(" + toDisplayString(wLatent.value) + " × " + toDisplayString(hLatent.value) + " blocks)", 1)
                ], 4)
              ]),
              createBaseVNode("div", _hoisted_33, [
                _cache[20] || (_cache[20] = createBaseVNode("span", { class: "tel-label" }, "Target Outputs:", -1)),
                createBaseVNode("span", {
                  class: "tel-val font-semibold",
                  style: normalizeStyle(textStyle.value)
                }, toDisplayString(calculatedTargetWidth.value) + " × " + toDisplayString(calculatedTargetHeight.value) + " px ", 5)
              ])
            ])
          ])
        ])
      ], 2);
    };
  }
});
const LatentScalingCalculator = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b6d212bd"]]);
const MIN_W = 420;
const MIN_H = 360;
function isolateContainerEvents(container) {
  const stopPropagation = (event) => {
    event.stopPropagation();
  };
  container.addEventListener("pointerdown", stopPropagation);
  container.addEventListener("pointerup", stopPropagation);
  container.addEventListener("mousedown", stopPropagation);
  container.addEventListener("mouseup", stopPropagation);
  container.addEventListener("touchstart", stopPropagation);
  container.addEventListener("touchend", stopPropagation);
  container.addEventListener("click", stopPropagation);
  container.addEventListener("wheel", stopPropagation);
  container.addEventListener("dblclick", stopPropagation);
  container.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
}
function notifyGraphChanged(node) {
  node?.setDirtyCanvas?.(true, true);
  node?.graph?.setDirtyCanvas?.(true, true);
  node?.graph?.setDirty?.(true, true);
  node?.graph?.change?.();
}
app.registerExtension({
  name: "Duffy.LatentScalingCalculator.Vue",
  async nodeCreated(node) {
    if (node.comfyClass !== "Duffy_LatentScalingCalculator") {
      return;
    }
    const sizeWidget = node.widgets?.find((w) => w.name === "reduced_image_size");
    if (sizeWidget) {
      sizeWidget.type = "hidden";
      sizeWidget.hidden = true;
      sizeWidget.disabled = true;
      sizeWidget.computeSize = () => [0, -4];
    }
    const targetWidget = node.widgets?.find((w) => w.name === "target_size");
    if (targetWidget) {
      targetWidget.type = "hidden";
      targetWidget.hidden = true;
      targetWidget.disabled = true;
      targetWidget.computeSize = () => [0, -4];
    }
    const familyWidget = node.widgets?.find((w) => w.name === "model_family");
    if (familyWidget) {
      familyWidget.type = "hidden";
      familyWidget.hidden = true;
      familyWidget.disabled = true;
      familyWidget.computeSize = () => [0, -4];
    }
    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);
    const initialReduced = typeof sizeWidget?.value === "number" ? sizeWidget.value : 1024;
    const initialTarget = typeof targetWidget?.value === "number" ? targetWidget.value : 4096;
    const initialFamily = typeof familyWidget?.value === "string" ? familyWidget.value : "Flux 1";
    const vueApp = createApp(LatentScalingCalculator, {
      initialReducedSize: initialReduced,
      initialTargetSize: initialTarget,
      initialModelFamily: initialFamily,
      nodeId: node.id,
      onReducedSizeChange: (val) => {
        if (sizeWidget) sizeWidget.value = val;
        notifyGraphChanged(node);
      },
      onTargetSizeChange: (val) => {
        if (targetWidget) targetWidget.value = val;
        notifyGraphChanged(node);
      },
      onModelFamilyChange: (val) => {
        if (familyWidget) familyWidget.value = val;
        notifyGraphChanged(node);
      },
      onResize: (height) => {
        const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
        node.setSize([currentWidth, Math.max(MIN_H, height)]);
        notifyGraphChanged(node);
      }
    });
    const instance = vueApp.mount(container);
    const domWidget = node.addDOMWidget("latent_calculator_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];
    const hydrateFromWidgets = () => {
      instance.hydrateState?.({
        reducedSize: sizeWidget?.value,
        targetSize: targetWidget?.value,
        modelFamily: familyWidget?.value
      });
    };
    const applyExecutionPayload = (rawPayload) => {
      if (!rawPayload || typeof rawPayload !== "object") {
        return;
      }
      const payload = rawPayload.output && typeof rawPayload.output === "object" ? rawPayload.output : rawPayload;
      const uiPayload = payload.ui && typeof payload.ui === "object" ? payload.ui : payload;
      instance.setTelemetry?.({
        calcWidth: uiPayload.calc_width?.[0],
        calcHeight: uiPayload.calc_height?.[0],
        inputWidth: uiPayload.input_width?.[0],
        inputHeight: uiPayload.input_height?.[0],
        inputChannels: uiPayload.input_channels?.[0],
        vaeFactor: uiPayload.vae_factor?.[0],
        factorSource: uiPayload.factor_source?.[0],
        resizeMode: uiPayload.resize_mode?.[0],
        resizeIntent: uiPayload.resize_intent?.[0],
        resizeApplied: uiPayload.resize_applied?.[0],
        warnings: uiPayload.warnings || [],
        executedModelFamily: uiPayload.model_family?.[0]
      });
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
    const originalSizeWidgetCallback = sizeWidget?.callback;
    const originalTargetWidgetCallback = targetWidget?.callback;
    const originalFamilyWidgetCallback = familyWidget?.callback;
    if (sizeWidget) {
      sizeWidget.callback = function() {
        hydrateFromWidgets();
        originalSizeWidgetCallback?.apply(this, arguments);
      };
    }
    if (targetWidget) {
      targetWidget.callback = function() {
        hydrateFromWidgets();
        originalTargetWidgetCallback?.apply(this, arguments);
      };
    }
    if (familyWidget) {
      familyWidget.callback = function() {
        hydrateFromWidgets();
        originalFamilyWidgetCallback?.apply(this, arguments);
      };
    }
    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    const initialHeight = Array.isArray(node.size) ? Number(node.size[1]) : MIN_H;
    node.setSize([Math.max(MIN_W, initialWidth), Math.max(MIN_H, initialHeight)]);
    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      api.removeEventListener("executed", onExecuted);
      node.configure = originalConfigure;
      if (sizeWidget) sizeWidget.callback = originalSizeWidgetCallback;
      if (targetWidget) targetWidget.callback = originalTargetWidgetCallback;
      if (familyWidget) familyWidget.callback = originalFamilyWidgetCallback;
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  }
});
