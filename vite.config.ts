/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import analyze from "rollup-plugin-analyzer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

/**
 * @see https://vitejs.dev/config/
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  base: "/bgg-what-to-play/",
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        analyze({
          summaryOnly: true,
          filterSummary: true,
          filter: (m) => m.percent > 2,
        }),
      ],
    },
  },
  test: {
    environment: "jsdom",
    include: ["./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
