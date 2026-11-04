/// <reference types="vitest/config" />
import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const shared = {
  react: { singleton: true, strictVersion: true, requiredVersion: "18.3.1" },
  "react-dom": { singleton: true, strictVersion: true, requiredVersion: "18.3.1" },
  "react-router-dom": { singleton: true, strictVersion: true, requiredVersion: "7.9.6" },
};

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    federation({
      name: "people_teams",
      filename: "remoteEntry.js",
      manifest: true,
      bundleAllCSS: false,
      exposes: {
        "./TeamsPage": "./src/TeamsPage.tsx",
        "./TeamsNavigationLink": "./src/TeamsNavigationLink.tsx",
      },
      shared,
      dts: false,
    }),
  ],
  define: command === "build" ? { "process.env.NODE_ENV": JSON.stringify("production") } : {},
  server: {
    host: "0.0.0.0",
    port: 3005,
    strictPort: true,
    cors: { origin: /^http:\/\/(localhost|127\.0\.0\.1):300[0-6]$/ },
  },
  build: {
    target: "esnext",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test-setup.ts"],
  },
}));
