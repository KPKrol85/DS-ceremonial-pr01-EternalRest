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
        services: path.resolve(__dirname, "services.html"),
        pricing: path.resolve(__dirname, "pricing.html"),
        about: path.resolve(__dirname, "about.html"),
        guide: path.resolve(__dirname, "guide.html"),
        contact: path.resolve(__dirname, "contact.html"),
        terms: path.resolve(__dirname, "terms.html"),
        privacy: path.resolve(__dirname, "privacy.html"),
      },
    },
  },
});
