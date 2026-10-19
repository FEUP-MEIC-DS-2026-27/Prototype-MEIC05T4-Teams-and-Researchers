import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({
      // Use the custom SSR error wrapper in src/server.ts.
      server: { entry: "server" },
    }),
    react(),
  ],
  resolve: { tsconfigPaths: true },
});
