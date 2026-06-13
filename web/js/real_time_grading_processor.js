import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";
import { h as defineComponent, r as reactive, k as onMounted, l as onUnmounted, p as ref, c as computed, _ as _export_sfc, m as openBlock, e as createElementBlock, b as createBaseVNode, t as toDisplayString, i as normalizeClass, y as withDirectives, w as vShow, A as withModifiers, j as normalizeStyle, d as createCommentVNode, F as Fragment, q as renderList, f as createStaticVNode, v as vModelCheckbox, s as vModelSelect, g as createTextVNode, u as vModelText, a as createApp } from "./_plugin-vue_export-helper-C-igAGFE.js";
const DEFAULT_PAYLOAD = () => ({
  curves: {
    rgb: [[0, 0], [1, 1]],
    r: [[0, 0], [1, 1]],
    g: [[0, 0], [1, 1]],
    b: [[0, 0], [1, 1]]
  },
  chromatic_aberration: 0,
  film_grain: 0,
  sharpen: 0,
  vignette_intensity: 0,
  exposure_contrast_saturation: {
    exposure: 0,
    contrast: 1,
    saturation: 1
  },
  lift_gamma_gain: {
    lift: 0,
    gamma: 1,
    gain: 1
  },
  bloom: {
    intensity: 0,
    threshold: 0.8,
    radius: 2
  },
  gradient_map: {
    enabled: false,
    stops: [
      { offset: 0, color: "#000000" },
      { offset: 1, color: "#ffffff" }
    ],
    blending_mode: "Normal",
    opacity: 1
  }
});
const _sfc_main = defineComponent({
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
      type: Function,
      required: true
    },
    onResize: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const params = reactive(DEFAULT_PAYLOAD());
    const collapsedSections = reactive({
      preview: false,
      curves: false,
      colorMap: false,
      effects: false
    });
    const activeChannel = ref("rgb");
    const selectedKnotIndex = ref(null);
    const isDraggingKnot = ref(false);
    const hoverCoord = ref(null);
    const hasImage = ref(false);
    const wipePercentage = ref(50);
    const isWiping = ref(false);
    const fallbackAfterSrc = ref(null);
    const previewFitMode = ref("cover");
    const activeStopIndex = ref(null);
    const canvasBefore = ref(null);
    const canvasAfter = ref(null);
    const wipeContainer = ref(null);
    const curveSvg = ref(null);
    const gradientBar = ref(null);
    let proxyImageElement = null;
    let webglContext = null;
    let webglProgram = null;
    let imageTexture = null;
    let lutTexture = null;
    let gradTexture = null;
    let webglReady = false;
    const luts = reactive({
      rgb: new Float32Array(256),
      r: new Float32Array(256),
      g: new Float32Array(256),
      b: new Float32Array(256)
    });
    const histogramData = reactive({
      r: new Array(256).fill(0),
      g: new Array(256).fill(0),
      b: new Array(256).fill(0),
      lum: new Array(256).fill(0)
    });
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
      const stopsStr = [...params.gradient_map.stops].sort((a, b) => a.offset - b.offset).map((s) => `${s.color} ${s.offset * 100}%`).join(", ");
      return {
        background: `linear-gradient(to right, ${stopsStr})`
      };
    });
    function interpolateMonotoneCubic(points) {
      const lut = new Float32Array(256);
      if (!Array.isArray(points) || points.length < 2) {
        for (let i = 0; i < 256; i++) lut[i] = i / 255;
        return lut;
      }
      const sorted = [...points].sort((a, b) => a[0] - b[0]);
      const xs = sorted.map((p) => p[0]);
      const ys = sorted.map((p) => p[1]);
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
        ds[i] = (ms[i - 1] + ms[i]) / 2;
      }
      for (let i = 0; i < n - 1; i++) {
        if (ms[i] === 0) {
          ds[i] = 0;
          ds[i + 1] = 0;
        } else {
          const alpha = ds[i] / ms[i];
          const beta = ds[i + 1] / ms[i];
          const val = alpha * alpha + beta * beta;
          if (val > 9) {
            const tau = 3 / Math.sqrt(val);
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
        const h00 = 2 * t * t * t - 3 * t * t + 1;
        const h10 = t * t * t - 2 * t * t + t;
        const h01 = -2 * t * t * t + 3 * t * t;
        const h11 = t * t * t - t * t;
        const val = h00 * ys[i] + h10 * h * ds[i] + h01 * ys[i + 1] + h11 * h * ds[i + 1];
        lut[idx] = Math.max(0, Math.min(1, val));
      }
      return lut;
    }
    function recalculateLuts() {
      luts.rgb = interpolateMonotoneCubic(params.curves.rgb);
      luts.r = interpolateMonotoneCubic(params.curves.r);
      luts.g = interpolateMonotoneCubic(params.curves.g);
      luts.b = interpolateMonotoneCubic(params.curves.b);
    }
    function getCurvePath(channel) {
      const p = params.curves[channel];
      const lut = interpolateMonotoneCubic(p);
      let d = `M 0 ${256 - lut[0] * 256}`;
      for (let i = 1; i < 256; i++) {
        d += ` L ${i} ${256 - lut[i] * 256}`;
      }
      return d;
    }
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
      const vertices = new Float32Array([
        -1,
        -1,
        0,
        0,
        1,
        -1,
        1,
        0,
        -1,
        1,
        0,
        1,
        -1,
        1,
        0,
        1,
        1,
        -1,
        1,
        0,
        1,
        1,
        1,
        1
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
    function updateLutTexture() {
      const gl = webglContext;
      if (!gl || !lutTexture) return;
      recalculateLuts();
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
    function updateGradientTexture() {
      const gl = webglContext;
      if (!gl || !gradTexture) return;
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      const stops = [...params.gradient_map.stops].sort((a, b) => a.offset - b.offset);
      if (stops.length > 0) {
        stops.forEach((s) => grad.addColorStop(s.offset, s.color));
      } else {
        grad.addColorStop(0, "#000000");
        grad.addColorStop(1, "#ffffff");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 1);
      const imgData = ctx.getImageData(0, 0, 256, 1);
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, imgData.data);
    }
    function renderWebGL() {
      const gl = webglContext;
      const program = webglProgram;
      const canvas = canvasAfter.value;
      if (!webglReady || !gl || !program || !canvas || !proxyImageElement) return;
      gl.useProgram(program);
      canvas.width = proxyImageElement.naturalWidth || 512;
      canvas.height = proxyImageElement.naturalHeight || 512;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
      updateLutTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_curvesLut"), 1);
      updateGradientTexture();
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_gradientMap"), 2);
      gl.uniform1i(gl.getUniformLocation(program, "u_gradientEnabled"), params.gradient_map.enabled ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(program, "u_gradientOpacity"), params.gradient_map.opacity);
      const modes = ["Normal", "Overlay", "Soft Light", "Multiply", "Screen"];
      const blendIndex = Math.max(0, modes.indexOf(params.gradient_map.blending_mode));
      gl.uniform1i(gl.getUniformLocation(program, "u_gradientBlendingMode"), blendIndex);
      gl.uniform1f(gl.getUniformLocation(program, "u_chromatic_aberration"), params.chromatic_aberration);
      gl.uniform1f(gl.getUniformLocation(program, "u_grain_intensity"), params.film_grain);
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), performance.now() / 1e3);
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
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      computeClientHistogram();
    }
    function computeClientHistogram() {
      const gl = webglContext;
      const canvas = canvasAfter.value;
      if (!gl || !canvas) return;
      const rw = 128;
      const rh = 128;
      const pixels = new Uint8Array(rw * rh * 4);
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
      const smoothFactor = 1 / total;
      for (let i = 0; i < 256; i++) {
        histogramData.r[i] = rHist[i] * smoothFactor;
        histogramData.g[i] = gHist[i] * smoothFactor;
        histogramData.b[i] = bHist[i] * smoothFactor;
        histogramData.lum[i] = lumHist[i] * smoothFactor;
      }
    }
    function getHistogramPath(channel) {
      const hist = histogramData[channel];
      const maxVal = Math.max(...hist, 1e-3);
      let d = `M 0 100`;
      for (let i = 0; i < 256; i++) {
        const x = i;
        const y = 100 - hist[i] / maxVal * 90;
        d += ` L ${x} ${y}`;
      }
      d += ` L 255 100 Z`;
      return d;
    }
    function hydrateState(jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (data.curves) {
          params.curves.rgb = data.curves.rgb || [[0, 0], [1, 1]];
          params.curves.r = data.curves.r || [[0, 0], [1, 1]];
          params.curves.g = data.curves.g || [[0, 0], [1, 1]];
          params.curves.b = data.curves.b || [[0, 0], [1, 1]];
        }
        params.chromatic_aberration = typeof data.chromatic_aberration === "number" ? data.chromatic_aberration : 0;
        params.film_grain = typeof data.film_grain === "number" ? data.film_grain : 0;
        params.sharpen = typeof data.sharpen === "number" ? data.sharpen : 0;
        params.vignette_intensity = typeof data.vignette_intensity === "number" ? data.vignette_intensity : 0;
        if (data.exposure_contrast_saturation) {
          params.exposure_contrast_saturation.exposure = typeof data.exposure_contrast_saturation.exposure === "number" ? data.exposure_contrast_saturation.exposure : 0;
          params.exposure_contrast_saturation.contrast = typeof data.exposure_contrast_saturation.contrast === "number" ? data.exposure_contrast_saturation.contrast : 1;
          params.exposure_contrast_saturation.saturation = typeof data.exposure_contrast_saturation.saturation === "number" ? data.exposure_contrast_saturation.saturation : 1;
        }
        if (data.lift_gamma_gain) {
          params.lift_gamma_gain.lift = typeof data.lift_gamma_gain.lift === "number" ? data.lift_gamma_gain.lift : 0;
          params.lift_gamma_gain.gamma = typeof data.lift_gamma_gain.gamma === "number" ? data.lift_gamma_gain.gamma : 1;
          params.lift_gamma_gain.gain = typeof data.lift_gamma_gain.gain === "number" ? data.lift_gamma_gain.gain : 1;
        }
        if (data.bloom) {
          params.bloom.intensity = typeof data.bloom.intensity === "number" ? data.bloom.intensity : 0;
          params.bloom.threshold = typeof data.bloom.threshold === "number" ? data.bloom.threshold : 0.8;
          params.bloom.radius = typeof data.bloom.radius === "number" ? data.bloom.radius : 2;
        }
        if (data.gradient_map) {
          params.gradient_map.enabled = !!data.gradient_map.enabled;
          params.gradient_map.stops = data.gradient_map.stops || [
            { offset: 0, color: "#000000" },
            { offset: 1, color: "#ffffff" }
          ];
          params.gradient_map.blending_mode = data.gradient_map.blending_mode || "Normal";
          params.gradient_map.opacity = typeof data.gradient_map.opacity === "number" ? data.gradient_map.opacity : 1;
        }
        recalculateLuts();
        requestDraw();
      } catch (e) {
        console.error("Hydration failed:", e);
      }
    }
    function onParamChange() {
      const serialized = JSON.stringify(params);
      props.onChange(serialized);
      requestDraw();
    }
    let animFrameId = 0;
    let cleanupWipeDragListeners = null;
    let cleanupStopDragListeners = null;
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
    function buildViewUrl(thumbnailInfo) {
      const params2 = new URLSearchParams({
        filename: String(thumbnailInfo.filename),
        type: String(thumbnailInfo.type || "temp")
      });
      if (thumbnailInfo.subfolder) {
        params2.set("subfolder", String(thumbnailInfo.subfolder));
      }
      params2.set("t", String(Date.now()));
      return `/view?${params2.toString()}`;
    }
    function setOriginalThumbnail(thumbnailInfo) {
      if (!thumbnailInfo || !thumbnailInfo.filename) return;
      const path = buildViewUrl(thumbnailInfo);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        proxyImageElement = img;
        hasImage.value = true;
        const canvasB = canvasBefore.value;
        if (canvasB) {
          canvasB.width = img.naturalWidth || 512;
          canvasB.height = img.naturalHeight || 512;
          const ctxB = canvasB.getContext("2d");
          ctxB?.drawImage(img, 0, 0);
        }
        const gl = webglContext;
        if (webglReady && gl && imageTexture) {
          gl.bindTexture(gl.TEXTURE_2D, imageTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        } else if (!fallbackAfterSrc.value) {
          fallbackAfterSrc.value = path;
        }
        requestDraw();
      };
      img.src = path;
    }
    function setProcessedThumbnail(thumbnailInfo) {
      if (!thumbnailInfo || !thumbnailInfo.filename) return;
      fallbackAfterSrc.value = buildViewUrl(thumbnailInfo);
    }
    function setCompareImages(compareImages) {
      if (!Array.isArray(compareImages) || compareImages.length < 2) {
        return;
      }
      setOriginalThumbnail(compareImages[0]);
      setProcessedThumbnail(compareImages[1]);
    }
    function setBackendHistogram(backendHist) {
      if (!backendHist) return;
      const smoothFactor = 1 / Math.max(...backendHist.lum || [1], 1);
      for (let i = 0; i < 256; i++) {
        histogramData.r[i] = (backendHist.r?.[i] || 0) * smoothFactor;
        histogramData.g[i] = (backendHist.g?.[i] || 0) * smoothFactor;
        histogramData.b[i] = (backendHist.b?.[i] || 0) * smoothFactor;
        histogramData.lum[i] = (backendHist.lum?.[i] || 0) * smoothFactor;
      }
    }
    function getMouseSvgCoord(e) {
      const svg = curveSvg.value;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
    }
    function onCurveMouseDown(e) {
      if (e.button !== 0) return;
      e.stopPropagation();
      const coord = getMouseSvgCoord(e);
      if (!coord) return;
      const p = params.curves[activeChannel.value] ?? [[0, 0], [1, 1]];
      if (!params.curves[activeChannel.value]) {
        params.curves[activeChannel.value] = p;
      }
      const threshold = 0.05;
      let foundIdx = -1;
      for (let i = 0; i < p.length; i++) {
        const dx = p[i][0] - coord[0];
        const dy = p[i][1] - coord[1];
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          foundIdx = i;
          break;
        }
      }
      if (foundIdx !== -1) {
        selectedKnotIndex.value = foundIdx;
        isDraggingKnot.value = true;
      } else {
        p.push(coord);
        p.sort((a, b) => a[0] - b[0]);
        selectedKnotIndex.value = p.findIndex((pt) => pt[0] === coord[0] && pt[1] === coord[1]);
        isDraggingKnot.value = true;
        onParamChange();
      }
    }
    function onCurveMouseMove(e) {
      const coord = getMouseSvgCoord(e);
      if (!coord) return;
      const p = params.curves[activeChannel.value] ?? [[0, 0], [1, 1]];
      if (!params.curves[activeChannel.value]) {
        params.curves[activeChannel.value] = p;
      }
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
      if (idx === 0) {
        pt[1] = coord[1];
      } else if (idx === p.length - 1) {
        pt[1] = coord[1];
      } else {
        const minX = p[idx - 1][0] + 5e-3;
        const maxX = p[idx + 1][0] - 5e-3;
        pt[0] = Math.max(minX, Math.min(maxX, coord[0]));
        pt[1] = coord[1];
      }
      onParamChange();
    }
    function onCurveMouseUp(e) {
      if (selectedKnotIndex.value !== null) {
        e.stopPropagation();
      }
      isDraggingKnot.value = false;
    }
    function onCurveMouseLeave() {
      isDraggingKnot.value = false;
      hoverCoord.value = null;
    }
    function selectKnot(idx, e) {
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
    function removeKnotByIndex(idx) {
      const p = params.curves[activeChannel.value] ?? [[0, 0], [1, 1]];
      if (!params.curves[activeChannel.value]) {
        params.curves[activeChannel.value] = p;
      }
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
    function removeSelectedKnot(e) {
      e?.preventDefault();
      e?.stopPropagation();
      if (selectedKnotIndex.value === null) {
        return;
      }
      removeKnotByIndex(selectedKnotIndex.value);
    }
    function removeKnot(idx, e) {
      e.preventDefault();
      e.stopPropagation();
      removeKnotByIndex(idx);
    }
    function resetCurve(channel) {
      params.curves[channel] = [[0, 0], [1, 1]];
      selectedKnotIndex.value = null;
      onParamChange();
    }
    function updateWipeFromClientX(clientX) {
      const container = wipeContainer.value;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      wipePercentage.value = Math.max(0, Math.min(100, x / rect.width * 100));
    }
    function getClientX(e) {
      if ("touches" in e) {
        if (!e.touches.length) return null;
        return e.touches[0].clientX;
      }
      return e.clientX;
    }
    function startWipeDrag(e) {
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
      const onGlobalMove = (moveEvent) => {
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
    function onGradientBarMouseDown(e) {
      const bar = gradientBar.value;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const offset = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      params.gradient_map.stops.push({ offset, color: "#ffffff" });
      params.gradient_map.stops.sort((a, b) => a.offset - b.offset);
      activeStopIndex.value = params.gradient_map.stops.findIndex((s) => s.offset === offset);
      onParamChange();
    }
    function startStopDrag(idx, e) {
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
          const safeIndex = Math.max(0, Math.min(activeStopIndex.value, params.gradient_map.stops.length - 1));
          const currentOffset = params.gradient_map.stops[safeIndex]?.offset;
          if (typeof currentOffset === "number") {
            activeStopIndex.value = params.gradient_map.stops.findIndex((s) => s.offset === currentOffset);
          }
        }
        clearStopDragListeners();
      };
      const onGlobalMove = (moveEvent) => {
        if ((moveEvent.buttons & 1) !== 1) {
          onGlobalUp();
          return;
        }
        const bar = gradientBar.value;
        if (!bar || activeStopIndex.value === null) return;
        moveEvent.preventDefault();
        const rect = bar.getBoundingClientRect();
        const offset = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
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
    function removeStop(idx) {
      if (params.gradient_map.stops.length <= 2) return;
      params.gradient_map.stops.splice(idx, 1);
      activeStopIndex.value = null;
      onParamChange();
    }
    function setStopOffset(idx, offset) {
      if (offset < 0 || offset > 1) return;
      params.gradient_map.stops[idx].offset = offset;
      params.gradient_map.stops.sort((a, b) => a.offset - b.offset);
      activeStopIndex.value = params.gradient_map.stops.findIndex((s) => s.offset === offset);
      onParamChange();
    }
    function toggleSection(sec) {
      collapsedSections[sec] = !collapsedSections[sec];
      setTimeout(() => {
        const height = document.querySelector(".grading-panel")?.clientHeight || 750;
        props.onResize(height + 10);
      }, 50);
    }
    function resetAll() {
      const defaults = DEFAULT_PAYLOAD();
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
    function setPreviewFitMode(mode) {
      previewFitMode.value = mode;
    }
    function swallowUiEvent(event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }
    function onResetAllClick(event) {
      swallowUiEvent(event);
      resetAll();
    }
    onMounted(() => {
      initWebGL();
      hydrateState(props.initialParams);
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
const _hoisted_1 = { class: "grading-panel" };
const _hoisted_2 = { class: "panel-header" };
const _hoisted_3 = { class: "title-container" };
const _hoisted_4 = { class: "node-id" };
const _hoisted_5 = { class: "scrollable-content" };
const _hoisted_6 = { class: "collapse-icon" };
const _hoisted_7 = { class: "section-body" };
const _hoisted_8 = ["src"];
const _hoisted_9 = {
  key: 0,
  class: "preview-placeholder"
};
const _hoisted_10 = { class: "collapse-icon" };
const _hoisted_11 = { class: "section-body" };
const _hoisted_12 = { class: "channel-tabs" };
const _hoisted_13 = ["onClick"];
const _hoisted_14 = ["disabled"];
const _hoisted_15 = { class: "curve-editor-container" };
const _hoisted_16 = ["d"];
const _hoisted_17 = ["d"];
const _hoisted_18 = { class: "knots-group" };
const _hoisted_19 = ["cx", "cy", "onMousedown", "onDblclick"];
const _hoisted_20 = {
  key: 0,
  x: 10,
  y: 20,
  class: "coord-tooltip"
};
const _hoisted_21 = { class: "histogram-container" };
const _hoisted_22 = {
  class: "histogram-svg",
  viewBox: "0 0 256 100",
  preserveAspectRatio: "none"
};
const _hoisted_23 = ["d"];
const _hoisted_24 = ["d"];
const _hoisted_25 = ["d"];
const _hoisted_26 = ["d"];
const _hoisted_27 = { class: "collapse-icon" };
const _hoisted_28 = { class: "section-body" };
const _hoisted_29 = { class: "gradient-map-controls" };
const _hoisted_30 = { class: "control-row" };
const _hoisted_31 = {
  key: 0,
  class: "gradient-editor-box"
};
const _hoisted_32 = { class: "control-row" };
const _hoisted_33 = ["value"];
const _hoisted_34 = { class: "control-row-vertical" };
const _hoisted_35 = { class: "slider-labels" };
const _hoisted_36 = { class: "value-display" };
const _hoisted_37 = ["value"];
const _hoisted_38 = { class: "gradient-stops-section" };
const _hoisted_39 = ["onMousedown", "onDblclick"];
const _hoisted_40 = {
  key: 0,
  class: "stop-editor-bar"
};
const _hoisted_41 = { class: "editor-title" };
const _hoisted_42 = { class: "stop-inputs" };
const _hoisted_43 = { class: "stop-input-group" };
const _hoisted_44 = ["value"];
const _hoisted_45 = { class: "stop-input-group" };
const _hoisted_46 = { class: "collapse-icon" };
const _hoisted_47 = { class: "section-body" };
const _hoisted_48 = { class: "effects-sliders" };
const _hoisted_49 = { class: "control-row-vertical" };
const _hoisted_50 = { class: "slider-labels" };
const _hoisted_51 = { class: "value-display" };
const _hoisted_52 = ["value"];
const _hoisted_53 = { class: "control-row-vertical" };
const _hoisted_54 = { class: "slider-labels" };
const _hoisted_55 = { class: "value-display" };
const _hoisted_56 = ["value"];
const _hoisted_57 = { class: "control-row-vertical" };
const _hoisted_58 = { class: "slider-labels" };
const _hoisted_59 = { class: "value-display" };
const _hoisted_60 = ["value"];
const _hoisted_61 = { class: "control-row-vertical" };
const _hoisted_62 = { class: "slider-labels" };
const _hoisted_63 = { class: "value-display" };
const _hoisted_64 = ["value"];
const _hoisted_65 = { class: "control-row-vertical" };
const _hoisted_66 = { class: "slider-labels" };
const _hoisted_67 = { class: "value-display" };
const _hoisted_68 = ["value"];
const _hoisted_69 = { class: "control-row-vertical" };
const _hoisted_70 = { class: "slider-labels" };
const _hoisted_71 = { class: "value-display" };
const _hoisted_72 = ["value"];
const _hoisted_73 = { class: "control-row-vertical" };
const _hoisted_74 = { class: "slider-labels" };
const _hoisted_75 = { class: "value-display" };
const _hoisted_76 = ["value"];
const _hoisted_77 = { class: "control-row-vertical" };
const _hoisted_78 = { class: "slider-labels" };
const _hoisted_79 = { class: "value-display" };
const _hoisted_80 = ["value"];
const _hoisted_81 = { class: "control-row-vertical" };
const _hoisted_82 = { class: "slider-labels" };
const _hoisted_83 = { class: "value-display" };
const _hoisted_84 = ["value"];
const _hoisted_85 = { class: "control-row-vertical" };
const _hoisted_86 = { class: "slider-labels" };
const _hoisted_87 = { class: "value-display" };
const _hoisted_88 = ["value"];
const _hoisted_89 = { class: "control-row-vertical" };
const _hoisted_90 = { class: "slider-labels" };
const _hoisted_91 = { class: "value-display" };
const _hoisted_92 = ["value"];
const _hoisted_93 = { class: "control-row-vertical" };
const _hoisted_94 = { class: "slider-labels" };
const _hoisted_95 = { class: "value-display" };
const _hoisted_96 = ["value"];
const _hoisted_97 = { class: "control-row-vertical" };
const _hoisted_98 = { class: "slider-labels" };
const _hoisted_99 = { class: "value-display" };
const _hoisted_100 = ["value"];
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1, [
    createBaseVNode("div", _hoisted_2, [
      createBaseVNode("div", _hoisted_3, [
        _cache[48] || (_cache[48] = createBaseVNode("span", { class: "header-title" }, "Grading & Shader Processor", -1)),
        createBaseVNode("span", _hoisted_4, "Node #" + toDisplayString(_ctx.nodeId), 1)
      ]),
      createBaseVNode("button", {
        class: "reset-btn",
        onPointerdown: _cache[0] || (_cache[0] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onPointerup: _cache[1] || (_cache[1] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onMousedown: _cache[2] || (_cache[2] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onMouseup: _cache[3] || (_cache[3] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onTouchstart: _cache[4] || (_cache[4] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onTouchend: _cache[5] || (_cache[5] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onDblclick: _cache[6] || (_cache[6] = (...args) => _ctx.swallowUiEvent && _ctx.swallowUiEvent(...args)),
        onClick: _cache[7] || (_cache[7] = (...args) => _ctx.onResetAllClick && _ctx.onResetAllClick(...args))
      }, " Reset All ", 32)
    ]),
    createBaseVNode("div", _hoisted_5, [
      createBaseVNode("div", {
        class: normalizeClass(["panel-section preview-panel", { "is-collapsed": _ctx.collapsedSections.preview }])
      }, [
        createBaseVNode("div", {
          class: "section-header",
          onClick: _cache[8] || (_cache[8] = ($event) => _ctx.toggleSection("preview"))
        }, [
          _cache[49] || (_cache[49] = createBaseVNode("span", { class: "section-title" }, "Visual Preview & Compare", -1)),
          createBaseVNode("span", _hoisted_6, toDisplayString(_ctx.collapsedSections.preview ? "▼" : "▲"), 1)
        ]),
        withDirectives(createBaseVNode("div", _hoisted_7, [
          createBaseVNode("div", {
            class: "preview-fit-toggle",
            onMousedown: _cache[11] || (_cache[11] = withModifiers(() => {
            }, ["stop"])),
            onTouchstart: _cache[12] || (_cache[12] = withModifiers(() => {
            }, ["stop"]))
          }, [
            createBaseVNode("button", {
              type: "button",
              class: normalizeClass(["fit-btn", { active: _ctx.previewFitMode === "cover" }]),
              onClick: _cache[9] || (_cache[9] = ($event) => _ctx.setPreviewFitMode("cover"))
            }, " Fill ", 2),
            createBaseVNode("button", {
              type: "button",
              class: normalizeClass(["fit-btn", { active: _ctx.previewFitMode === "contain" }]),
              onClick: _cache[10] || (_cache[10] = ($event) => _ctx.setPreviewFitMode("contain"))
            }, " Fit ", 2)
          ], 32),
          createBaseVNode("div", {
            class: "wipe-container",
            ref: "wipeContainer",
            onMousedown: _cache[15] || (_cache[15] = (...args) => _ctx.startWipeDrag && _ctx.startWipeDrag(...args)),
            onTouchstart: _cache[16] || (_cache[16] = (...args) => _ctx.startWipeDrag && _ctx.startWipeDrag(...args))
          }, [
            createBaseVNode("canvas", {
              ref: "canvasBefore",
              class: "wipe-canvas before-canvas",
              style: normalizeStyle(_ctx.wipeCanvasStyle)
            }, null, 4),
            withDirectives(createBaseVNode("canvas", {
              ref: "canvasAfter",
              class: "wipe-canvas after-canvas",
              style: normalizeStyle([_ctx.wipeStyle, _ctx.wipeCanvasStyle])
            }, null, 4), [
              [vShow, !_ctx.fallbackAfterSrc]
            ]),
            withDirectives(createBaseVNode("img", {
              src: _ctx.fallbackAfterSrc || void 0,
              class: "wipe-canvas after-canvas",
              style: normalizeStyle([_ctx.wipeStyle, _ctx.wipeCanvasStyle]),
              alt: "Processed preview"
            }, null, 12, _hoisted_8), [
              [vShow, !!_ctx.fallbackAfterSrc]
            ]),
            createBaseVNode("div", {
              class: "wipe-handle",
              style: normalizeStyle(_ctx.handleStyle),
              onMousedown: _cache[13] || (_cache[13] = (...args) => _ctx.startWipeDrag && _ctx.startWipeDrag(...args)),
              onTouchstart: _cache[14] || (_cache[14] = (...args) => _ctx.startWipeDrag && _ctx.startWipeDrag(...args))
            }, [..._cache[50] || (_cache[50] = [
              createBaseVNode("div", { class: "handle-line" }, null, -1),
              createBaseVNode("div", { class: "handle-thumb" }, [
                createBaseVNode("svg", {
                  viewBox: "0 0 24 24",
                  width: "16",
                  height: "16",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2"
                }, [
                  createBaseVNode("path", { d: "M8 7l-5 5 5 5M16 7l5 5-5 5" })
                ])
              ], -1)
            ])], 36),
            _cache[52] || (_cache[52] = createBaseVNode("div", { class: "wipe-label before-label" }, "Before", -1)),
            _cache[53] || (_cache[53] = createBaseVNode("div", { class: "wipe-label after-label" }, "After", -1)),
            !_ctx.hasImage ? (openBlock(), createElementBlock("div", _hoisted_9, [..._cache[51] || (_cache[51] = [
              createBaseVNode("svg", {
                viewBox: "0 0 24 24",
                width: "48",
                height: "48",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "1.5"
              }, [
                createBaseVNode("rect", {
                  x: "3",
                  y: "3",
                  width: "18",
                  height: "18",
                  rx: "2",
                  ry: "2"
                }),
                createBaseVNode("circle", {
                  cx: "8.5",
                  cy: "8.5",
                  r: "1.5"
                }),
                createBaseVNode("polyline", { points: "21 15 16 10 5 21" })
              ], -1),
              createBaseVNode("p", null, "Queue workflow once to generate image proxy", -1)
            ])])) : createCommentVNode("", true)
          ], 544)
        ], 512), [
          [vShow, !_ctx.collapsedSections.preview]
        ])
      ], 2),
      createBaseVNode("div", {
        class: normalizeClass(["panel-section curves-panel", { "is-collapsed": _ctx.collapsedSections.curves }])
      }, [
        createBaseVNode("div", {
          class: "section-header",
          onClick: _cache[17] || (_cache[17] = ($event) => _ctx.toggleSection("curves"))
        }, [
          _cache[54] || (_cache[54] = createBaseVNode("span", { class: "section-title" }, "RGB Tonal Curves", -1)),
          createBaseVNode("span", _hoisted_10, toDisplayString(_ctx.collapsedSections.curves ? "▼" : "▲"), 1)
        ]),
        withDirectives(createBaseVNode("div", _hoisted_11, [
          createBaseVNode("div", _hoisted_12, [
            (openBlock(), createElementBlock(Fragment, null, renderList(["rgb", "r", "g", "b"], (ch) => {
              return createBaseVNode("button", {
                key: ch,
                class: normalizeClass(["tab-btn", ["tab-" + ch, { active: _ctx.activeChannel === ch }]]),
                onClick: ($event) => _ctx.activeChannel = ch
              }, toDisplayString(ch.toUpperCase()), 11, _hoisted_13);
            }), 64)),
            createBaseVNode("button", {
              class: "remove-point-btn",
              disabled: !_ctx.canRemoveSelectedKnot,
              onClick: _cache[18] || (_cache[18] = (...args) => _ctx.removeSelectedKnot && _ctx.removeSelectedKnot(...args))
            }, " Select & Remove ", 8, _hoisted_14),
            createBaseVNode("button", {
              class: "reset-sub-btn",
              onClick: _cache[19] || (_cache[19] = ($event) => _ctx.resetCurve(_ctx.activeChannel))
            }, "Reset Curve")
          ]),
          createBaseVNode("div", _hoisted_15, [
            (openBlock(), createElementBlock("svg", {
              ref: "curveSvg",
              class: "curve-svg",
              viewBox: "0 0 256 256",
              onMousedown: _cache[20] || (_cache[20] = (...args) => _ctx.onCurveMouseDown && _ctx.onCurveMouseDown(...args)),
              onMousemove: _cache[21] || (_cache[21] = (...args) => _ctx.onCurveMouseMove && _ctx.onCurveMouseMove(...args)),
              onMouseup: _cache[22] || (_cache[22] = (...args) => _ctx.onCurveMouseUp && _ctx.onCurveMouseUp(...args)),
              onMouseleave: _cache[23] || (_cache[23] = (...args) => _ctx.onCurveMouseLeave && _ctx.onCurveMouseLeave(...args))
            }, [
              _cache[55] || (_cache[55] = createStaticVNode('<line x1="64" y1="0" x2="64" y2="256" class="grid-line" data-v-a3ef85c3></line><line x1="128" y1="0" x2="128" y2="256" class="grid-line" data-v-a3ef85c3></line><line x1="192" y1="0" x2="192" y2="256" class="grid-line" data-v-a3ef85c3></line><line x1="0" y1="64" x2="256" y2="64" class="grid-line" data-v-a3ef85c3></line><line x1="0" y1="128" x2="256" y2="128" class="grid-line" data-v-a3ef85c3></line><line x1="0" y1="192" x2="256" y2="192" class="grid-line" data-v-a3ef85c3></line><line x1="0" y1="0" x2="256" y2="256" class="diagonal-line" data-v-a3ef85c3></line>', 7)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(["rgb", "r", "g", "b"].filter((c) => c !== _ctx.activeChannel), (ch) => {
                return openBlock(), createElementBlock("path", {
                  key: "path-" + ch,
                  d: _ctx.getCurvePath(ch),
                  class: normalizeClass(["curve-path-inactive", "curve-" + ch])
                }, null, 10, _hoisted_16);
              }), 128)),
              createBaseVNode("path", {
                d: _ctx.getCurvePath(_ctx.activeChannel),
                class: normalizeClass(["curve-path-active", "curve-" + _ctx.activeChannel])
              }, null, 10, _hoisted_17),
              createBaseVNode("g", _hoisted_18, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.params.curves[_ctx.activeChannel], (point, idx) => {
                  return openBlock(), createElementBlock("circle", {
                    key: "knot-" + idx,
                    cx: point[0] * 256,
                    cy: 256 - point[1] * 256,
                    r: "6",
                    class: normalizeClass(["curve-knot", { selected: _ctx.selectedKnotIndex === idx, "endpoint": idx === 0 || idx === _ctx.params.curves[_ctx.activeChannel].length - 1 }]),
                    onMousedown: withModifiers(($event) => _ctx.selectKnot(idx, $event), ["stop"]),
                    onDblclick: withModifiers(($event) => _ctx.removeKnot(idx, $event), ["stop"])
                  }, null, 42, _hoisted_19);
                }), 128))
              ]),
              _ctx.hoverCoord ? (openBlock(), createElementBlock("text", _hoisted_20, " IN: " + toDisplayString(Math.round(_ctx.hoverCoord[0] * 255)) + " OUT: " + toDisplayString(Math.round(_ctx.hoverCoord[1] * 255)), 1)) : createCommentVNode("", true)
            ], 544))
          ]),
          createBaseVNode("div", _hoisted_21, [
            _cache[56] || (_cache[56] = createBaseVNode("div", { class: "histogram-header" }, "Live Output Histogram", -1)),
            (openBlock(), createElementBlock("svg", _hoisted_22, [
              _ctx.activeChannel === "rgb" || _ctx.activeChannel === "r" ? (openBlock(), createElementBlock("path", {
                key: 0,
                d: _ctx.getHistogramPath("r"),
                class: "hist-path hist-r"
              }, null, 8, _hoisted_23)) : createCommentVNode("", true),
              _ctx.activeChannel === "rgb" || _ctx.activeChannel === "g" ? (openBlock(), createElementBlock("path", {
                key: 1,
                d: _ctx.getHistogramPath("g"),
                class: "hist-path hist-g"
              }, null, 8, _hoisted_24)) : createCommentVNode("", true),
              _ctx.activeChannel === "rgb" || _ctx.activeChannel === "b" ? (openBlock(), createElementBlock("path", {
                key: 2,
                d: _ctx.getHistogramPath("b"),
                class: "hist-path hist-b"
              }, null, 8, _hoisted_25)) : createCommentVNode("", true),
              _ctx.activeChannel === "rgb" ? (openBlock(), createElementBlock("path", {
                key: 3,
                d: _ctx.getHistogramPath("lum"),
                class: "hist-path hist-lum"
              }, null, 8, _hoisted_26)) : createCommentVNode("", true)
            ]))
          ])
        ], 512), [
          [vShow, !_ctx.collapsedSections.curves]
        ])
      ], 2),
      createBaseVNode("div", {
        class: normalizeClass(["panel-section color-map-panel", { "is-collapsed": _ctx.collapsedSections.colorMap }])
      }, [
        createBaseVNode("div", {
          class: "section-header",
          onClick: _cache[24] || (_cache[24] = ($event) => _ctx.toggleSection("colorMap"))
        }, [
          _cache[57] || (_cache[57] = createBaseVNode("span", { class: "section-title" }, "Color Balancing & Gradient Map", -1)),
          createBaseVNode("span", _hoisted_27, toDisplayString(_ctx.collapsedSections.colorMap ? "▼" : "▲"), 1)
        ]),
        withDirectives(createBaseVNode("div", _hoisted_28, [
          createBaseVNode("div", _hoisted_29, [
            createBaseVNode("div", _hoisted_30, [
              _cache[58] || (_cache[58] = createBaseVNode("label", { class: "control-label" }, "Enable Gradient Map", -1)),
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => _ctx.params.gradient_map.enabled = $event),
                onChange: _cache[26] || (_cache[26] = (...args) => _ctx.onParamChange && _ctx.onParamChange(...args)),
                class: "gradient-checkbox"
              }, null, 544), [
                [vModelCheckbox, _ctx.params.gradient_map.enabled]
              ])
            ]),
            _ctx.params.gradient_map.enabled ? (openBlock(), createElementBlock("div", _hoisted_31, [
              createBaseVNode("div", _hoisted_32, [
                _cache[59] || (_cache[59] = createBaseVNode("label", { class: "control-label" }, "Blending Mode", -1)),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => _ctx.params.gradient_map.blending_mode = $event),
                  onChange: _cache[28] || (_cache[28] = (...args) => _ctx.onParamChange && _ctx.onParamChange(...args)),
                  class: "styled-select"
                }, [
                  (openBlock(), createElementBlock(Fragment, null, renderList(["Normal", "Overlay", "Soft Light", "Multiply", "Screen"], (mode) => {
                    return createBaseVNode("option", {
                      key: mode,
                      value: mode
                    }, toDisplayString(mode), 9, _hoisted_33);
                  }), 64))
                ], 544), [
                  [vModelSelect, _ctx.params.gradient_map.blending_mode]
                ])
              ]),
              createBaseVNode("div", _hoisted_34, [
                createBaseVNode("div", _hoisted_35, [
                  _cache[60] || (_cache[60] = createBaseVNode("span", { class: "control-label" }, "Opacity", -1)),
                  createBaseVNode("span", _hoisted_36, toDisplayString(Math.round(_ctx.params.gradient_map.opacity * 100)) + "%", 1)
                ]),
                createBaseVNode("input", {
                  type: "range",
                  min: "0",
                  max: "100",
                  value: _ctx.params.gradient_map.opacity * 100,
                  onInput: _cache[29] || (_cache[29] = ($event) => {
                    _ctx.params.gradient_map.opacity = parseFloat($event.target.value) / 100;
                    _ctx.onParamChange();
                  }),
                  class: "styled-range"
                }, null, 40, _hoisted_37)
              ]),
              createBaseVNode("div", _hoisted_38, [
                _cache[64] || (_cache[64] = createBaseVNode("label", { class: "control-label" }, "Gradient Stops (Click to add, Drag offset, Double click to remove)", -1)),
                createBaseVNode("div", {
                  class: "gradient-bar-track",
                  ref: "gradientBar",
                  style: normalizeStyle(_ctx.gradientBarStyle),
                  onMousedown: _cache[30] || (_cache[30] = (...args) => _ctx.onGradientBarMouseDown && _ctx.onGradientBarMouseDown(...args))
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.params.gradient_map.stops, (stop, idx) => {
                    return openBlock(), createElementBlock("div", {
                      key: "stop-" + idx,
                      class: "gradient-stop-marker",
                      style: normalizeStyle({ left: stop.offset * 100 + "%" }),
                      onMousedown: withModifiers(($event) => _ctx.startStopDrag(idx, $event), ["stop"]),
                      onDblclick: withModifiers(($event) => _ctx.removeStop(idx), ["stop"])
                    }, [
                      createBaseVNode("div", {
                        class: "marker-pin",
                        style: normalizeStyle({ backgroundColor: stop.color })
                      }, null, 4)
                    ], 44, _hoisted_39);
                  }), 128))
                ], 36),
                _ctx.activeStopIndex !== null && _ctx.params.gradient_map.stops[_ctx.activeStopIndex] ? (openBlock(), createElementBlock("div", _hoisted_40, [
                  createBaseVNode("div", _hoisted_41, "Stop #" + toDisplayString(_ctx.activeStopIndex + 1), 1),
                  createBaseVNode("div", _hoisted_42, [
                    createBaseVNode("div", _hoisted_43, [
                      _cache[61] || (_cache[61] = createBaseVNode("label", null, "Offset:", -1)),
                      createBaseVNode("input", {
                        type: "number",
                        min: "0",
                        max: "100",
                        value: Math.round(_ctx.params.gradient_map.stops[_ctx.activeStopIndex].offset * 100),
                        onInput: _cache[31] || (_cache[31] = ($event) => _ctx.setStopOffset(_ctx.activeStopIndex, parseInt($event.target.value) / 100)),
                        class: "stop-num-input"
                      }, null, 40, _hoisted_44),
                      _cache[62] || (_cache[62] = createTextVNode("% ", -1))
                    ]),
                    createBaseVNode("div", _hoisted_45, [
                      _cache[63] || (_cache[63] = createBaseVNode("label", null, "Color:", -1)),
                      withDirectives(createBaseVNode("input", {
                        type: "color",
                        "onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => _ctx.params.gradient_map.stops[_ctx.activeStopIndex].color = $event),
                        onInput: _cache[33] || (_cache[33] = (...args) => _ctx.onParamChange && _ctx.onParamChange(...args)),
                        class: "stop-color-picker"
                      }, null, 544), [
                        [vModelText, _ctx.params.gradient_map.stops[_ctx.activeStopIndex].color]
                      ])
                    ])
                  ])
                ])) : createCommentVNode("", true)
              ])
            ])) : createCommentVNode("", true)
          ])
        ], 512), [
          [vShow, !_ctx.collapsedSections.colorMap]
        ])
      ], 2),
      createBaseVNode("div", {
        class: normalizeClass(["panel-section effects-panel", { "is-collapsed": _ctx.collapsedSections.effects }])
      }, [
        createBaseVNode("div", {
          class: "section-header",
          onClick: _cache[34] || (_cache[34] = ($event) => _ctx.toggleSection("effects"))
        }, [
          _cache[65] || (_cache[65] = createBaseVNode("span", { class: "section-title" }, "Post-Processing Effects", -1)),
          createBaseVNode("span", _hoisted_46, toDisplayString(_ctx.collapsedSections.effects ? "▼" : "▲"), 1)
        ]),
        withDirectives(createBaseVNode("div", _hoisted_47, [
          createBaseVNode("div", _hoisted_48, [
            createBaseVNode("div", _hoisted_49, [
              createBaseVNode("div", _hoisted_50, [
                _cache[66] || (_cache[66] = createBaseVNode("span", { class: "control-label" }, "Chromatic Aberration", -1)),
                createBaseVNode("span", _hoisted_51, toDisplayString(_ctx.params.chromatic_aberration.toFixed(3)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "50",
                value: _ctx.params.chromatic_aberration * 1e3,
                onInput: _cache[35] || (_cache[35] = ($event) => {
                  _ctx.params.chromatic_aberration = parseFloat($event.target.value) / 1e3;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_52)
            ]),
            createBaseVNode("div", _hoisted_53, [
              createBaseVNode("div", _hoisted_54, [
                _cache[67] || (_cache[67] = createBaseVNode("span", { class: "control-label" }, "Cinematic Film Grain", -1)),
                createBaseVNode("span", _hoisted_55, toDisplayString(_ctx.params.film_grain.toFixed(3)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "100",
                value: _ctx.params.film_grain * 1e3,
                onInput: _cache[36] || (_cache[36] = ($event) => {
                  _ctx.params.film_grain = parseFloat($event.target.value) / 1e3;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_56)
            ]),
            createBaseVNode("div", _hoisted_57, [
              createBaseVNode("div", _hoisted_58, [
                _cache[68] || (_cache[68] = createBaseVNode("span", { class: "control-label" }, "Sharpen Intensity", -1)),
                createBaseVNode("span", _hoisted_59, toDisplayString(_ctx.params.sharpen.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "200",
                value: _ctx.params.sharpen * 100,
                onInput: _cache[37] || (_cache[37] = ($event) => {
                  _ctx.params.sharpen = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_60)
            ]),
            createBaseVNode("div", _hoisted_61, [
              createBaseVNode("div", _hoisted_62, [
                _cache[69] || (_cache[69] = createBaseVNode("span", { class: "control-label" }, "Vignette Falloff", -1)),
                createBaseVNode("span", _hoisted_63, toDisplayString(_ctx.params.vignette_intensity.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "150",
                value: _ctx.params.vignette_intensity * 100,
                onInput: _cache[38] || (_cache[38] = ($event) => {
                  _ctx.params.vignette_intensity = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_64)
            ]),
            _cache[79] || (_cache[79] = createBaseVNode("div", { class: "effects-group-title" }, "Exposure / Contrast / Saturation", -1)),
            createBaseVNode("div", _hoisted_65, [
              createBaseVNode("div", _hoisted_66, [
                _cache[70] || (_cache[70] = createBaseVNode("span", { class: "control-label" }, "Exposure (Stops)", -1)),
                createBaseVNode("span", _hoisted_67, toDisplayString(_ctx.params.exposure_contrast_saturation.exposure.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "-200",
                max: "200",
                value: _ctx.params.exposure_contrast_saturation.exposure * 100,
                onInput: _cache[39] || (_cache[39] = ($event) => {
                  _ctx.params.exposure_contrast_saturation.exposure = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_68)
            ]),
            createBaseVNode("div", _hoisted_69, [
              createBaseVNode("div", _hoisted_70, [
                _cache[71] || (_cache[71] = createBaseVNode("span", { class: "control-label" }, "Contrast", -1)),
                createBaseVNode("span", _hoisted_71, toDisplayString(_ctx.params.exposure_contrast_saturation.contrast.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "300",
                value: _ctx.params.exposure_contrast_saturation.contrast * 100,
                onInput: _cache[40] || (_cache[40] = ($event) => {
                  _ctx.params.exposure_contrast_saturation.contrast = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_72)
            ]),
            createBaseVNode("div", _hoisted_73, [
              createBaseVNode("div", _hoisted_74, [
                _cache[72] || (_cache[72] = createBaseVNode("span", { class: "control-label" }, "Saturation", -1)),
                createBaseVNode("span", _hoisted_75, toDisplayString(_ctx.params.exposure_contrast_saturation.saturation.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "300",
                value: _ctx.params.exposure_contrast_saturation.saturation * 100,
                onInput: _cache[41] || (_cache[41] = ($event) => {
                  _ctx.params.exposure_contrast_saturation.saturation = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_76)
            ]),
            _cache[80] || (_cache[80] = createBaseVNode("div", { class: "effects-group-title" }, "Lift / Gamma / Gain", -1)),
            createBaseVNode("div", _hoisted_77, [
              createBaseVNode("div", _hoisted_78, [
                _cache[73] || (_cache[73] = createBaseVNode("span", { class: "control-label" }, "Lift", -1)),
                createBaseVNode("span", _hoisted_79, toDisplayString(_ctx.params.lift_gamma_gain.lift.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "-100",
                max: "100",
                value: _ctx.params.lift_gamma_gain.lift * 100,
                onInput: _cache[42] || (_cache[42] = ($event) => {
                  _ctx.params.lift_gamma_gain.lift = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_80)
            ]),
            createBaseVNode("div", _hoisted_81, [
              createBaseVNode("div", _hoisted_82, [
                _cache[74] || (_cache[74] = createBaseVNode("span", { class: "control-label" }, "Gamma", -1)),
                createBaseVNode("span", _hoisted_83, toDisplayString(_ctx.params.lift_gamma_gain.gamma.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "10",
                max: "400",
                value: _ctx.params.lift_gamma_gain.gamma * 100,
                onInput: _cache[43] || (_cache[43] = ($event) => {
                  _ctx.params.lift_gamma_gain.gamma = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_84)
            ]),
            createBaseVNode("div", _hoisted_85, [
              createBaseVNode("div", _hoisted_86, [
                _cache[75] || (_cache[75] = createBaseVNode("span", { class: "control-label" }, "Gain", -1)),
                createBaseVNode("span", _hoisted_87, toDisplayString(_ctx.params.lift_gamma_gain.gain.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "300",
                value: _ctx.params.lift_gamma_gain.gain * 100,
                onInput: _cache[44] || (_cache[44] = ($event) => {
                  _ctx.params.lift_gamma_gain.gain = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_88)
            ]),
            _cache[81] || (_cache[81] = createBaseVNode("div", { class: "effects-group-title" }, "Bloom", -1)),
            createBaseVNode("div", _hoisted_89, [
              createBaseVNode("div", _hoisted_90, [
                _cache[76] || (_cache[76] = createBaseVNode("span", { class: "control-label" }, "Intensity", -1)),
                createBaseVNode("span", _hoisted_91, toDisplayString(_ctx.params.bloom.intensity.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "200",
                value: _ctx.params.bloom.intensity * 100,
                onInput: _cache[45] || (_cache[45] = ($event) => {
                  _ctx.params.bloom.intensity = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_92)
            ]),
            createBaseVNode("div", _hoisted_93, [
              createBaseVNode("div", _hoisted_94, [
                _cache[77] || (_cache[77] = createBaseVNode("span", { class: "control-label" }, "Threshold", -1)),
                createBaseVNode("span", _hoisted_95, toDisplayString(_ctx.params.bloom.threshold.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "0",
                max: "100",
                value: _ctx.params.bloom.threshold * 100,
                onInput: _cache[46] || (_cache[46] = ($event) => {
                  _ctx.params.bloom.threshold = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_96)
            ]),
            createBaseVNode("div", _hoisted_97, [
              createBaseVNode("div", _hoisted_98, [
                _cache[78] || (_cache[78] = createBaseVNode("span", { class: "control-label" }, "Radius", -1)),
                createBaseVNode("span", _hoisted_99, toDisplayString(_ctx.params.bloom.radius.toFixed(2)), 1)
              ]),
              createBaseVNode("input", {
                type: "range",
                min: "50",
                max: "800",
                value: _ctx.params.bloom.radius * 100,
                onInput: _cache[47] || (_cache[47] = ($event) => {
                  _ctx.params.bloom.radius = parseFloat($event.target.value) / 100;
                  _ctx.onParamChange();
                }),
                class: "styled-range"
              }, null, 40, _hoisted_100)
            ])
          ])
        ], 512), [
          [vShow, !_ctx.collapsedSections.effects]
        ])
      ], 2)
    ])
  ]);
}
const RealTimeGradingProcessor = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a3ef85c3"]]);
const MIN_W = 840;
const MIN_H = 820;
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
function updateParamsWidget(node, paramsWidget, json) {
  if (!paramsWidget) {
    notifyGraphChanged(node);
    return;
  }
  paramsWidget.value = json;
  notifyGraphChanged(node);
}
app.registerExtension({
  name: "Duffy.RealTimeGradingProcessor.Vue",
  async nodeCreated(node) {
    if (node.comfyClass !== "Duffy_RealTimeGradingProcessor") {
      return;
    }
    const paramsWidget = node.widgets?.find((widget) => widget.name === "shader_params");
    if (paramsWidget) {
      paramsWidget.type = "hidden";
      paramsWidget.hidden = true;
      paramsWidget.disabled = true;
      paramsWidget.computeSize = () => [0, 0];
    }
    const container = document.createElement("div");
    container.style.cssText = "width:100%; height:100%; box-sizing:border-box; overflow:hidden;";
    isolateContainerEvents(container);
    const initialParamsStr = typeof paramsWidget?.value === "string" ? paramsWidget.value : "{}";
    const vueApp = createApp(RealTimeGradingProcessor, {
      initialParams: initialParamsStr,
      nodeId: node.id,
      onChange: (json) => {
        updateParamsWidget(node, paramsWidget, json);
      },
      onResize: (height) => {
        const currentWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
        node.setSize([currentWidth, Math.max(MIN_H, height)]);
        notifyGraphChanged(node);
      }
    });
    const instance = vueApp.mount(container);
    const domWidget = node.addDOMWidget("grading_processor_ui", "custom", container, { serialize: false });
    domWidget.computeSize = () => [MIN_W, MIN_H];
    const hydrateFromWidget = (value) => {
      if (typeof value !== "string" || !value.trim()) {
        return;
      }
      instance.hydrateState?.(value);
    };
    const getFirstPayloadItem = (value) => {
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    };
    const applyExecutionPayload = (rawPayload) => {
      if (!rawPayload || typeof rawPayload !== "object") {
        return;
      }
      const payload = rawPayload.output && typeof rawPayload.output === "object" ? rawPayload.output : rawPayload;
      const uiPayload = payload.ui && typeof payload.ui === "object" ? payload.ui : payload;
      const thumbPayload = getFirstPayloadItem(uiPayload.original_thumbnail);
      const processedPayload = getFirstPayloadItem(uiPayload.processed_thumbnail) ?? getFirstPayloadItem(uiPayload.images);
      const comparePayload = uiPayload.compare_images;
      const histogramPayload = getFirstPayloadItem(uiPayload.histogram);
      if (Array.isArray(comparePayload) && comparePayload.length >= 2) {
        instance.setCompareImages?.(comparePayload);
      } else {
        if (thumbPayload) {
          instance.setOriginalThumbnail?.(thumbPayload);
        }
        if (processedPayload) {
          instance.setProcessedThumbnail?.(processedPayload);
        }
      }
      if (histogramPayload) {
        instance.setBackendHistogram?.(histogramPayload);
      }
    };
    const onExecuted = (event) => {
      const { node: execNodeId, output } = event.detail || {};
      if (String(execNodeId) === String(node.id)) {
        applyExecutionPayload(output);
      }
    };
    api.addEventListener("executed", onExecuted);
    const originalOnExecuted = node.onExecuted;
    node.onExecuted = function onNodeExecuted(message) {
      originalOnExecuted?.apply(this, arguments);
      applyExecutionPayload(message);
    };
    const originalConfigure = node.configure;
    node.configure = function configureNode(info) {
      const result = originalConfigure?.call(this, info);
      if (paramsWidget?.value) {
        hydrateFromWidget(paramsWidget.value);
      }
      return result;
    };
    const originalWidgetCallback = paramsWidget?.callback;
    if (paramsWidget) {
      paramsWidget.callback = function widgetCallback(value) {
        hydrateFromWidget(value);
        originalWidgetCallback?.apply(this, arguments);
      };
    }
    const initialWidth = Array.isArray(node.size) ? Number(node.size[0]) : MIN_W;
    const initialHeight = Array.isArray(node.size) ? Number(node.size[1]) : MIN_H;
    node.setSize([Math.max(MIN_W, initialWidth), Math.max(MIN_H, initialHeight)]);
    const originalRemoved = node.onRemoved;
    node.onRemoved = function onRemoved() {
      if (paramsWidget) {
        paramsWidget.callback = originalWidgetCallback;
      }
      node.onExecuted = originalOnExecuted;
      api.removeEventListener("executed", onExecuted);
      instance.cleanup?.();
      vueApp.unmount();
      originalRemoved?.apply(this, arguments);
    };
  }
});
