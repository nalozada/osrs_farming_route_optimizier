import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // JSX uses these identifiers; don't flag capitalized/imported components or _-prefixed args.
      // Unused catch bindings (catch (e) {}) are an accepted pattern here.
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^[A-Z_]", caughtErrors: "none" }],
    },
  },
  {
    files: ["**/*.test.{js,jsx}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Node-run build scripts (not bundled into the client).
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
];
