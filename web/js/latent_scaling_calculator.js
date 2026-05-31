import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";
import { h as defineComponent, m as ref, w as watch, j as onMounted, l as openBlock, e as createElementBlock, b as createBaseVNode, i as normalizeStyle, t as toDisplayString, x as withDirectives, q as vModelSelect, s as vModelText, d as createCommentVNode, F as Fragment, p as renderList, g as createTextVNode, n as normalizeClass, c as computed, _ as _export_sfc, a as createApp } from "./_plugin-vue_export-helper-Cjv3LdKZ.js";
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
const _hoisted_30 = { class: "latent-block-size" };
const _hoisted_31 = { class: "telemetry-row" };
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
      if (telemetry.value.resizeMode === "pixel") return "Pixel (decode -> resize -> encode)";
      return "Latent";
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
                _cache[17] || (_cache[17] = createBaseVNode("span", { class: "tel-label" }, "Resize Domain:", -1)),
                createBaseVNode("span", _hoisted_28, toDisplayString(resizeModeLabel.value), 1)
              ]),
              createBaseVNode("div", _hoisted_29, [
                _cache[18] || (_cache[18] = createBaseVNode("span", { class: "tel-label" }, "Reduced Latent:", -1)),
                createBaseVNode("span", {
                  class: "tel-val",
                  style: normalizeStyle(textStyle.value)
                }, [
                  createTextVNode(toDisplayString(coercedReducedWidth.value) + " × " + toDisplayString(coercedReducedHeight.value) + " px ", 1),
                  createBaseVNode("span", _hoisted_30, "(" + toDisplayString(wLatent.value) + " × " + toDisplayString(hLatent.value) + " blocks)", 1)
                ], 4)
              ]),
              createBaseVNode("div", _hoisted_31, [
                _cache[19] || (_cache[19] = createBaseVNode("span", { class: "tel-label" }, "Target Outputs:", -1)),
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
const LatentScalingCalculator = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-33681d53"]]);
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

.grading-panel[data-v-1356d4e0] {
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
.panel-header[data-v-1356d4e0] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 30, 32, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-top-left-radius: 11px;
  border-top-right-radius: 11px;
}
.title-container[data-v-1356d4e0] {
  display: flex;
  flex-direction: column;
}
.header-title[data-v-1356d4e0] {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8fafc;
}
.node-id[data-v-1356d4e0] {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}
.reset-btn[data-v-1356d4e0] {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.reset-btn[data-v-1356d4e0]:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}
.scrollable-content[data-v-1356d4e0] {
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow: hidden;
}
.panel-section[data-v-1356d4e0] {
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
.effects-panel[data-v-1356d4e0] {
  order: 2;
}
.curves-panel[data-v-1356d4e0] {
  order: 4;
}
.panel-section.is-collapsed[data-v-1356d4e0] {
  align-self: start;
  height: auto;
}
.section-header[data-v-1356d4e0] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(35, 35, 38, 0.8);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}
.section-header[data-v-1356d4e0]:hover {
  background: rgba(50, 50, 55, 0.9);
}
.section-title[data-v-1356d4e0] {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
}
.collapse-icon[data-v-1356d4e0] {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}
.section-body[data-v-1356d4e0] {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}
.preview-panel .section-body[data-v-1356d4e0] {
  overflow: hidden;
}
.preview-fit-toggle[data-v-1356d4e0] {
  display: inline-flex;
  align-self: flex-end;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: rgba(10, 12, 16, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.fit-btn[data-v-1356d4e0] {
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
.fit-btn[data-v-1356d4e0]:hover {
  color: #d7e2f2;
}
.fit-btn.active[data-v-1356d4e0] {
  color: #f8fafc;
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(96, 165, 250, 0.45);
}
.preview-panel .wipe-container[data-v-1356d4e0] {
  flex: 1;
  min-height: 0;
  height: 100%;
  aspect-ratio: auto;
}

/* Wipe Container */
.wipe-container[data-v-1356d4e0] {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
}
.wipe-canvas[data-v-1356d4e0] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.before-canvas[data-v-1356d4e0] {
  z-index: 1;
}
.after-canvas[data-v-1356d4e0] {
  z-index: 2;
}
.wipe-handle[data-v-1356d4e0] {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  z-index: 3;
  cursor: ew-resize;
  transform: translateX(-50%);
}
.handle-line[data-v-1356d4e0] {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}
.handle-thumb[data-v-1356d4e0] {
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
.wipe-handle:hover .handle-thumb[data-v-1356d4e0] {
  background: #3b82f6;
}
.wipe-label[data-v-1356d4e0] {
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
.before-label[data-v-1356d4e0] {
  left: 8px;
}
.after-label[data-v-1356d4e0] {
  right: 8px;
}
.preview-placeholder[data-v-1356d4e0] {
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
.preview-placeholder p[data-v-1356d4e0] {
  font-size: 11px;
  margin: 0;
}

/* Curves Section */
.channel-tabs[data-v-1356d4e0] {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tab-btn[data-v-1356d4e0] {
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
.tab-btn.active[data-v-1356d4e0] {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}
.tab-rgb.active[data-v-1356d4e0] { border-color: rgba(255, 255, 255, 0.5);
}
.tab-r.active[data-v-1356d4e0] { border-color: rgba(239, 68, 68, 0.5); color: #f87171;
}
.tab-g.active[data-v-1356d4e0] { border-color: rgba(34, 197, 94, 0.5); color: #4ade80;
}
.tab-b.active[data-v-1356d4e0] { border-color: rgba(59, 130, 246, 0.5); color: #60a5fa;
}
.reset-sub-btn[data-v-1356d4e0] {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.reset-sub-btn[data-v-1356d4e0]:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.curve-editor-container[data-v-1356d4e0] {
  width: 100%;
  aspect-ratio: 1;
  background: #161618;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.curve-svg[data-v-1356d4e0] {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.grid-line[data-v-1356d4e0] {
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}
.diagonal-line[data-v-1356d4e0] {
  stroke: rgba(255, 255, 255, 0.02);
  stroke-width: 1;
}
.curve-path-inactive[data-v-1356d4e0] {
  fill: none;
  stroke-width: 1.5;
  opacity: 0.25;
}
.curve-path-active[data-v-1356d4e0] {
  fill: none;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.1));
}
.curve-rgb[data-v-1356d4e0] { stroke: #e2e8f0;
}
.curve-r[data-v-1356d4e0] { stroke: #ef4444;
}
.curve-g[data-v-1356d4e0] { stroke: #22c55e;
}
.curve-b[data-v-1356d4e0] { stroke: #3b82f6;
}
.curve-knot[data-v-1356d4e0] {
  fill: #1e293b;
  stroke-width: 2;
  cursor: grab;
}
.curve-knot[data-v-1356d4e0]:hover {
  r: 8px;
}
.curve-knot.selected[data-v-1356d4e0] {
  cursor: grabbing;
  r: 8px;
}
.curve-knot.endpoint[data-v-1356d4e0] {
  r: 5px;
  stroke: #cbd5e1;
}
.curve-knot.curve-rgb[data-v-1356d4e0] { stroke: #f8fafc;
}
.curve-knot.curve-r[data-v-1356d4e0] { stroke: #ef4444;
}
.curve-knot.curve-g[data-v-1356d4e0] { stroke: #22c55e;
}
.curve-knot.curve-b[data-v-1356d4e0] { stroke: #3b82f6;
}
.coord-tooltip[data-v-1356d4e0] {
  fill: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-family: monospace;
}

/* Histogram */
.histogram-container[data-v-1356d4e0] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.histogram-header[data-v-1356d4e0] {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
.histogram-svg[data-v-1356d4e0] {
  width: 100%;
  height: 50px;
  background: #111112;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  overflow: hidden;
}
.hist-path[data-v-1356d4e0] {
  fill: none;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.hist-r[data-v-1356d4e0] { stroke: rgba(239, 68, 68, 0.5); fill: rgba(239, 68, 68, 0.05);
}
.hist-g[data-v-1356d4e0] { stroke: rgba(34, 197, 94, 0.5); fill: rgba(34, 197, 94, 0.05);
}
.hist-b[data-v-1356d4e0] { stroke: rgba(59, 130, 246, 0.5); fill: rgba(59, 130, 246, 0.05);
}
.hist-lum[data-v-1356d4e0] { stroke: rgba(255, 255, 255, 0.4); fill: rgba(255, 255, 255, 0.02);
}

/* Control row structures */
.control-row[data-v-1356d4e0] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
}
.control-row-vertical[data-v-1356d4e0] {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.slider-labels[data-v-1356d4e0] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control-label[data-v-1356d4e0] {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}
.value-display[data-v-1356d4e0] {
  font-size: 11px;
  font-family: monospace;
  color: #3b82f6;
}

/* Styled HTML inputs */
.gradient-checkbox[data-v-1356d4e0] {
  width: 14px;
  height: 14px;
  accent-color: #3b82f6;
  cursor: pointer;
}
.styled-select[data-v-1356d4e0] {
  background: #1e1e20;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}
.styled-range[data-v-1356d4e0] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}
.styled-range[data-v-1356d4e0]::-webkit-slider-thumb {
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
.styled-range[data-v-1356d4e0]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #60a5fa;
}

/* Gradient editor box */
.gradient-editor-box[data-v-1356d4e0] {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}
.gradient-stops-section[data-v-1356d4e0] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gradient-bar-track[data-v-1356d4e0] {
  height: 24px;
  width: 100%;
  border-radius: 6px;
  position: relative;
  cursor: crosshair;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}
.gradient-stop-marker[data-v-1356d4e0] {
  position: absolute;
  top: 0;
  width: 0;
  height: 100%;
  cursor: grab;
  transform: translateX(-50%);
}
.gradient-stop-marker[data-v-1356d4e0]:active {
  cursor: grabbing;
}
.marker-pin[data-v-1356d4e0] {
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
.gradient-stop-marker:hover .marker-pin[data-v-1356d4e0] {
  transform: scale(1.2);
}
.stop-editor-bar[data-v-1356d4e0] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #161618;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.editor-title[data-v-1356d4e0] {
  font-size: 10px;
  font-weight: bold;
  color: #94a3b8;
}
.stop-inputs[data-v-1356d4e0] {
  display: flex;
  gap: 12px;
  align-items: center;
}
.stop-input-group[data-v-1356d4e0] {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #94a3b8;
}
.stop-num-input[data-v-1356d4e0] {
  width: 40px;
  background: #252528;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #fff;
  padding: 2px;
  font-size: 10px;
  text-align: center;
}
.stop-color-picker[data-v-1356d4e0] {
  width: 32px;
  height: 18px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  padding: 0;
}

/* Post-Processing Effects section */
.effects-sliders[data-v-1356d4e0] {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.effects-group-title[data-v-1356d4e0] {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
}


.latent-calc-card[data-v-33681d53] {
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
.theme-flux1[data-v-33681d53] {
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.theme-flux2[data-v-33681d53] {
  border-color: rgba(191, 0, 255, 0.3);
  box-shadow: 0 4px 20px rgba(191, 0, 255, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.theme-sd3[data-v-33681d53] {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.06), inset 0 1px 1px rgba(255,255,255,0.05);
}
.card-header[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}
.header-main[data-v-33681d53] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title[data-v-33681d53] {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8fafc;
}
.header-badge[data-v-33681d53] {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 9999px;
  border: 1px solid;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}
.header-subtitle[data-v-33681d53] {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
.card-body[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.control-group[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.control-header[data-v-33681d53] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control-label[data-v-33681d53] {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.01em;
}
.value-badge[data-v-33681d53] {
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
}
.slider-wrapper[data-v-33681d53] {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Styled HTML slider range */
.styled-range[data-v-33681d53] {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
}
.styled-range[data-v-33681d53]::-webkit-slider-thumb {
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
.styled-range[data-v-33681d53]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
.theme-flux1 .styled-range[data-v-33681d53]::-webkit-slider-thumb { background: #00f0ff; box-shadow: 0 0 6px rgba(0,240,255,0.8);
}
.theme-flux2 .styled-range[data-v-33681d53]::-webkit-slider-thumb { background: #bf00ff; box-shadow: 0 0 6px rgba(191,0,255,0.8);
}
.theme-sd3 .styled-range[data-v-33681d53]::-webkit-slider-thumb { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.8);
}
.styled-number[data-v-33681d53] {
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
.styled-select[data-v-33681d53] {
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
.coercion-pill[data-v-33681d53] {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  width: max-content;
}
.coercion-pill.warning[data-v-33681d53] {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.coercion-pill.info[data-v-33681d53] {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.alert-box[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  border-radius: 8px;
  gap: 2px;
}
.alert-box.error[data-v-33681d53] {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.alert-box.warning-box[data-v-33681d53] {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.alert-title[data-v-33681d53] {
  font-size: 11px;
  font-weight: 600;
}
.alert-desc[data-v-33681d53] {
  margin: 0;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
}

/* Visualizer Layout */
.preview-container[data-v-33681d53] {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  margin-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
}
.visualizer-wrapper[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.svg-canvas[data-v-33681d53] {
  width: 100px;
  height: 100px;
  background: #0d0d0e;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.aspect-ratio-label[data-v-33681d53] {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}
.telemetry-info[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.telemetry-row[data-v-33681d53] {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tel-label[data-v-33681d53] {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}
.tel-val[data-v-33681d53] {
  font-size: 11px;
  font-family: monospace;
}
.tel-val.highlight[data-v-33681d53] {
  color: #fff;
}
.latent-block-size[data-v-33681d53] {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 4px;
}

/* Micro-animations */
.pulse-glow[data-v-33681d53] {
  transition: all 0.3s ease;
}
.theme-flux1 .pulse-glow[data-v-33681d53] {
  filter: drop-shadow(0 0 2px rgba(0, 240, 255, 0.4));
}
.theme-flux2 .pulse-glow[data-v-33681d53] {
  filter: drop-shadow(0 0 2px rgba(191, 0, 255, 0.4));
}
.theme-sd3 .pulse-glow[data-v-33681d53] {
  filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4));
}`));
      document.head.appendChild(elementStyle);
    }
  } catch (e) {
    console.error("vite-plugin-css-injected-by-js", e);
  }
})();
