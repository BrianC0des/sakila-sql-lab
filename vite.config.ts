import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const currentDir = import.meta.dirname;
const localBridge = resolve(currentDir, "src/_bridge");
const sharedBridge = resolve(currentDir, "../_bridge");
const bridgePath = existsSync(localBridge) ? localBridge : sharedBridge;

function versionEmitPlugin(): Plugin {
  const buildId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const builtAt = new Date().toISOString();

  return {
    name: "version-emit-plugin",
    config() {
      return {
        define: {
          __APP_BUILD_ID__: JSON.stringify(buildId),
          __APP_BUILD_TIME__: JSON.stringify(builtAt),
        },
      };
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify(
          {
            buildId,
            builtAt,
            version: "1.0.0",
          },
          null,
          2
        ),
      });
    },
  };
}

export default defineConfig({
  plugins: [versionEmitPlugin(), react(), tailwindcss()],
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
