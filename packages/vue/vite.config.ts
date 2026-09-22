import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Two entries (tour + hints) in one build. Shared code (popover component,
// positioning, utils) is emitted as a common chunk; both entries import one
// stylesheet, `style.css`, so a hints-only consumer gets the popover styles too.
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "es2020",
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: {
        index: "src/index.ts",
        hints: "src/hints.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, name) => (format === "es" ? `${name}.mjs` : `${name}.cjs`),
      cssFileName: "style",
    },
    rollupOptions: {
      external: ["vue", "@floating-ui/vue", "@floating-ui/dom"],
      output: {
        exports: "named",
        chunkFileNames: "chunks/[name]-[hash].[format].js",
      },
    },
  },
});
