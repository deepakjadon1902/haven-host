import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.dirname(appRoot);

function windowsDevOptimizerGuard() {
  return {
    name: "haven:windows-dev-optimizer-guard",
    config(_, { command }) {
      if (command !== "serve") return null;

      return {
        environments: {
          client: {
            optimizeDeps: {
              noDiscovery: true,
              include: [],
              entries: [],
            },
          },
        },
        optimizeDeps: {
          noDiscovery: true,
          include: [],
          entries: [],
        },
      };
    },
  };
}

export default defineConfig({
  root: appRoot,
  cacheDir: path.join(appRoot, "node_modules", ".vite"),
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    nitro(),
    windowsDevOptimizerGuard(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.join(appRoot, "src"),
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    fs: {
      // Keep filesystem access scoped while allowing hoisted workspace dependencies.
      allow: [appRoot, workspaceRoot],
    },
  },
});
