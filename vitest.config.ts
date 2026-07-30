import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**", "**/archive/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.{ts,tsx}", "components/sections/**/*.{ts,tsx}"],
      exclude: [
        "lib/cms/types.ts",
        "lib/cms/fallbacks/**",
        // Satori/next-og asset renderer: no branch logic, requires a real
        // font-fetch/WASM runtime that isn't available under jsdom.
        "lib/seo/og-image.tsx",
        "**/*.test.{ts,tsx}",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
