import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  appType: "mpa",
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        uslugi: path.resolve(__dirname, "uslugi.html"),
        cennik: path.resolve(__dirname, "cennik.html"),
        "o-nas": path.resolve(__dirname, "o-nas.html"),
        poradnik: path.resolve(__dirname, "poradnik.html"),
        formularz: path.resolve(__dirname, "formularz.html"),
        terms: path.resolve(__dirname, "terms.html"),
      },
    },
  },
});
