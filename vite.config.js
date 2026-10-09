import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, normalizePath } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partialsDir = path.resolve(__dirname, "partials");

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

// A page includes partials/<name>.html with a `<!-- partial:<name> -->` marker.
// Inside a partial, a link marked `data-partial-current` gets aria-current="page"
// on the page it points to; the marker attribute is always removed.
const MARKER = /([ \t]*)<!--\s*partial\b([\s\S]*?)-->/g;
const MARKER_NAME = /^:([a-z0-9-]+)\s*$/;
const CURRENT_LINK = /<a\b[^>]*\sdata-partial-current\b[^>]*>/g;

const renderPartial = (name, page) => {
  const file = path.join(partialsDir, `${name}.html`);
  if (!existsSync(file)) {
    throw new Error(
      `[partials] ${page}: missing partial "${name}" (expected partials/${name}.html)`,
    );
  }
  const html = readFileSync(file, "utf8").trimEnd();
  if (/<!--\s*partial\b/.test(html)) {
    throw new Error(
      `[partials] partials/${name}.html: nested partials are not supported`,
    );
  }
  const rendered = html.replace(CURRENT_LINK, (tag) => {
    const href = tag.match(/\shref="([^"]*)"/)?.[1];
    if (href === undefined) return tag;
    const link = tag.replace(/\s+data-partial-current\b/, "");
    return href === page
      ? link.replace(/\s*>$/, ' aria-current="page">')
      : link;
  });
  if (rendered.includes("data-partial-current")) {
    throw new Error(
      `[partials] partials/${name}.html: data-partial-current is only supported on <a href> links`,
    );
  }
  return rendered;
};

const htmlPartials = () => {
  const partialsRoot = normalizePath(partialsDir);
  return {
    name: "eternal-rest-html-partials",
    transformIndexHtml: {
      order: "pre",
      handler(html, { filename }) {
        const page = path.basename(filename);
        return html.replace(MARKER, (marker, indent, body) => {
          const name = body.match(MARKER_NAME)?.[1];
          if (!name) {
            throw new Error(
              `[partials] ${page}: invalid marker ${marker.trim()}`,
            );
          }
          return renderPartial(name, page)
            .split("\n")
            .map((line) => (line ? indent + line : line))
            .join("\n");
        });
      },
    },
    // Partials are not in the module graph, so reload every open page when one changes.
    handleHotUpdate({ file, server }) {
      if (file.startsWith(`${partialsRoot}/`)) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
};

export default defineConfig({
  appType: "mpa",
  base: "./",
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: pageInputs,
    },
  },
});
