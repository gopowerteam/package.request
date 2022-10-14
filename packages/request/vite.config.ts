import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const fileName = {
  es: `index.mjs`,
  cjs: `index.cjs`,
  iife: `index.iife.js`,
};

export default defineConfig({
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "bundle",
      formats: ["es", "cjs", "iife"],
      fileName: (format) => fileName[format],
    },
  },
  // plugins: [dts({ outputDir: path.resolve(__dirname, "dist/types") })],
});
