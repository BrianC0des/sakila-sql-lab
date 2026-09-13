import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const currentDir = import.meta.dirname;
const localBridge = resolve(currentDir, "src/_bridge");
const sharedBridge = resolve(currentDir, "../_bridge");
const bridgePath = existsSync(localBridge) ? localBridge : sharedBridge;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@bridge": bridgePath
    }
  },
  server: {
    host: true,
    port: 5173
  }
});
