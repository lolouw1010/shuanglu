import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const appOrigin =
  process.env.SHUANGLU_MOBILE_ORIGIN?.replace(/\/$/, "") ||
  "https://shuanglu.uway.click";

export default defineConfig({
  base: "./",
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
      "next/dynamic": fileURLToPath(
        new URL("./src/nextDynamic.tsx", import.meta.url),
      ),
    },
  },
  define: {
    __SHUANGLU_API_ORIGIN__: JSON.stringify(appOrigin),
    __SHUANGLU_WEB_ORIGIN__: JSON.stringify(appOrigin),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
