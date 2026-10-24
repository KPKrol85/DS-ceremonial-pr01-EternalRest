import fg from "fast-glob";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../assets/src-images");
const outDir = path.resolve(__dirname, "../assets/images");

// Widths cover the existing hero layouts at common device pixel densities.
const responsiveWidths = {
  hero: [768, 1152],
  "hero-services": [480, 960],
  "hero-pricing": [480, 960],
};
const responsiveOnly = process.argv.includes("--responsive-only");

const run = async () => {
  await fs.mkdir(outDir, { recursive: true });
  const files = (await fg(["**/*.{png,jpg,jpeg}"], { cwd: srcDir })).filter(
    (file) =>
      !responsiveOnly || Object.hasOwn(responsiveWidths, path.parse(file).name),
  );

  if (!files.length) {
    console.log("Brak obrazów w assets/src-images.");
    return;
  }

  await Promise.all(
    files.map(async (file) => {
      const inputPath = path.join(srcDir, file);
      const baseName = path.parse(file).name;
      const outputBase = path.join(outDir, baseName);
      if (!responsiveOnly) {
        await sharp(inputPath).toFormat("webp").toFile(`${outputBase}.webp`);
        await sharp(inputPath).toFormat("avif").toFile(`${outputBase}.avif`);
      }

      const widths = responsiveWidths[baseName] ?? [];
      if (widths.length) {
        const { width: sourceWidth } = await sharp(inputPath).metadata();
        for (const width of widths.filter((width) => width < sourceWidth)) {
          for (const format of ["webp", "avif"]) {
            await sharp(inputPath)
              .resize({ width, withoutEnlargement: true })
              .toFormat(format)
              .toFile(`${outputBase}-${width}.${format}`);
          }
        }
      }
      console.log(`Przetworzono: ${file}`);
    }),
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
