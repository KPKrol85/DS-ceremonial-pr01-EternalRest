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
];
