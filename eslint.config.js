import js from "@eslint/js";
import globals from "globals";

export default [
  // Preserve the legacy default of ignoring dotfiles and dot-directories.
  { ignores: ["**/.*"] },
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
    },
  },
  {
    // Service worker source; vite.config.js replaces the precache manifest placeholder.
    files: ["js/sw.js"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        __PRECACHE_MANIFEST__: "readonly",
      },
    },
  },
];
