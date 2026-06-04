import { app } from "../../../scripts/app.js";
app.registerExtension({
  name: "Duffy.IdeogramQualitySelector.Extension",
  async nodeCreated(node) {
    if (node.comfyClass !== "Duffy_IdeogramQualitySelector") {
      return;
    }
    const updateOutputLabels = () => {
      const presetWidget2 = node.widgets?.find((w) => w.name === "preset");
      const presetVal = presetWidget2 ? presetWidget2.value : "Default";
      let num_steps = 20;
      let mu = 0;
      let std = 1.8;
      if (presetVal === "Quality") {
        num_steps = 48;
        mu = 0;
        std = 1.5;
      } else if (presetVal === "Default") {
        num_steps = 20;
        mu = 0;
        std = 1.8;
      } else if (presetVal === "Turbo") {
        num_steps = 12;
        mu = 0.5;
        std = 1.8;
      }
      const stepsOutput = node.outputs?.find((o) => o.name === "num_steps");
      if (stepsOutput) {
        stepsOutput.label = `num_steps: ${num_steps}`;
      }
      const muOutput = node.outputs?.find((o) => o.name === "mu");
      if (muOutput) {
        muOutput.label = `mu: ${mu.toFixed(1)}`;
      }
      const stdOutput = node.outputs?.find((o) => o.name === "std");
      if (stdOutput) {
        stdOutput.label = `std: ${std.toFixed(1)}`;
      }
      node.setDirtyCanvas?.(true, true);
    };
    const presetWidget = node.widgets?.find((w) => w.name === "preset");
    if (presetWidget) {
      const originalCallback = presetWidget.callback;
      presetWidget.callback = function(value) {
        const res = originalCallback ? originalCallback.apply(this, arguments) : void 0;
        updateOutputLabels();
        return res;
      };
    }
    const originalConfigure = node.configure;
    node.configure = function(info) {
      const result = originalConfigure?.call(this, info);
      updateOutputLabels();
      return result;
    };
    setTimeout(() => {
      updateOutputLabels();
    }, 1);
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
}`));
      document.head.appendChild(elementStyle);
    }
  } catch (e) {
    console.error("vite-plugin-css-injected-by-js", e);
  }
})();
