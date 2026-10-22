import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "dist/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Translation tooling (Node scripts, not application code).
    "i18n/*.cjs",
    ".i18n-audit/**",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  next.configs["core-web-vitals"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Vinext serves authenticated, remote, and blob-backed media directly;
      // there is no Next.js image-optimizer route in this worker deployment.
      "@next/next/no-img-element": "off",
      // Public pages use plain <a> links on purpose (full page loads), and the root custom-link
      // route app/[vanity] matches every top-level path, so this rule would flag every link.
      "@next/next/no-html-link-for-pages": "off",
      "jsx-a11y/label-has-associated-control": ["error", { depth: 4 }],
    },
  },
]);

export default eslintConfig;
