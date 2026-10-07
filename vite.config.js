import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Every regular *.html file in the project root is a production page (non-recursive).
const pageInputs = Object.fromEntries(
  readdirSync(__dirname, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort()
    .map((fileName) => [
      path.basename(fileName, ".html"),
      path.resolve(__dirname, fileName),
    ]),
);

export default defineConfig({
  appType: "mpa",
  base: "./",
  build: {
    rollupOptions: {
      input: pageInputs,
    },
  },
});
