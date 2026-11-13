import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import siteConfig from "../../../sites/common_site_config.json" with {
  type: "json",
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const webserverPort = siteConfig.webserver_port || 8000;
const outputDir = path.resolve(
  currentDir,
  "../quantumberg_accounting_dashboard/public/dashboard"
);
const buildVersion = `${Date.now().toString(36)}`;

function buildVersionPlugin() {
  return {
    name: "write-build-version",
    closeBundle() {
      fs.writeFileSync(
        path.join(outputDir, "version.json"),
        JSON.stringify({ version: buildVersion })
      );
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), buildVersionPlugin()],

  base:
    process.env.NODE_ENV === "production"
      ? "/assets/quantumberg_accounting_dashboard/dashboard/"
      : "/",

  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,

    proxy: {
      "/api": {
        target: `http://127.0.0.1:${webserverPort}`,
        changeOrigin: true,
      },
      "/assets": {
        target: `http://127.0.0.1:${webserverPort}`,
        changeOrigin: true,
      },
      "/files": {
        target: `http://127.0.0.1:${webserverPort}`,
        changeOrigin: true,
      },
      "/private": {
        target: `http://127.0.0.1:${webserverPort}`,
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(currentDir, "src"),
    },
  },

  build: {
    outDir: outputDir,

    emptyOutDir: true,
    target: "es2020",
    cssCodeSplit: false,
    sourcemap: false,
    assetsInlineLimit: 4096,

    rolldownOptions: {
      output: {
        format: "iife",
        name: "QuantumbergAccountingDashboard",
        codeSplitting: false,
        entryFileNames: "index.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "index.css";
          }

          return "assets/[name][extname]";
        },
      },
    },

    chunkSizeWarningLimit: 2500,
  },
});
