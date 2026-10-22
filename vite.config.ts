/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev serves the standalone page (index.html). `vite build` emits an ES module
// exposing mount()/unmount() so the Microfrontend Shell can load it at runtime.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: command === "build" ? { "process.env.NODE_ENV": JSON.stringify("production") } : {},
  build: {
    lib: {
      entry: "src/mount.tsx",
      formats: ["es"],
      fileName: () => "people-teams.js",
      cssFileName: "people-teams",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test-setup.ts"],
  },
}));
