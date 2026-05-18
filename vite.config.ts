import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [vue(), cssInjectedByJs({ topExecutionPriority: false })],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        theme_control_panel: "./src/theme_control_panel.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["COMFY_APP", "COMFY_API"],
      output: {
        dir: "web/js",
        entryFileNames: "[name].js",
        paths: {
          COMFY_APP: "../../../scripts/app.js",
          COMFY_API: "../../../scripts/api.js",
        },
      },
    },
    minify: false,
  },
});
