import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cursor/Claude editor tooling — not website source
    ".cursor/**",
    ".claude/**",
    // Generated test output — not website source
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    // OpenNext build output — not website source
    ".open-next/**",
  ]),
]);

export default eslintConfig;
