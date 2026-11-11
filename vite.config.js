import { createHash } from "crypto";
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

// The service worker source; its build copy is dist/sw.js, served from the site root.
const SW_SOURCE = path.resolve(__dirname, "js/sw.js");
const SW_FILE = "sw.js";
const SW_MANIFEST = "__PRECACHE_MANIFEST__";
const OFFLINE_PAGE = "offline.html";
// Placeholder origin for resolving built URLs; only same-origin paths are precached.
const BUILD_ORIGIN = "https://eternal-rest.invalid";

// Resources the offline page loads by itself (not the pages it links to), and the files
// its stylesheets load.
const RESOURCE_TAG =
  /<(link|script|img|source)\b((?:"[^"]*"|'[^']*'|[^"'>])*)>/gi;
const RESOURCE_ATTRIBUTE = /\s(href|src|srcset)\s*=\s*"([^"]*)"/gi;
const RESOURCE_LINK =
  /\srel\s*=\s*"[^"]*\b(?:stylesheet|icon|apple-touch-icon|manifest|modulepreload|preload)\b/i;
const CSS_URL = /url\(\s*(["']?)([^"')]+)\1\s*\)/g;

const contentHash = (content) =>
  createHash("sha256").update(content).digest("hex").slice(0, 16);

// Emits dist/sw.js from js/sw.js with its precache manifest: the offline page and every
// file it needs, each with a content hash. The version changes with any precached file or
// the worker code, so each deployment that changes them installs a new service worker.
const serviceWorker = () => {
  let publicDir = "";
  return {
    name: "eternal-rest-service-worker",
    apply: "build",
    // Runs after Vite's HTML processing, so the bundle holds the built offline page.
    enforce: "post",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    generateBundle(_, bundle) {
      const source = readFileSync(SW_SOURCE, "utf8");
      if (source.split(SW_MANIFEST).length !== 2) {
        this.error(`[sw] js/sw.js must contain ${SW_MANIFEST} exactly once`);
      }
      const page = bundle[OFFLINE_PAGE];
      if (page?.type !== "asset") {
        this.error(`[sw] ${OFFLINE_PAGE} is missing from the build`);
      }

      const files = new Map();
      const readBuilt = (pathname) => {
        const fileName = decodeURIComponent(pathname.slice(1));
        const output = bundle[fileName];
        if (output)
          return output.type === "chunk" ? output.code : output.source;
        const publicFile = path.join(publicDir, fileName);
        if (publicDir && existsSync(publicFile))
          return readFileSync(publicFile);
        this.error(
          `[sw] ${OFFLINE_PAGE} needs ${pathname}, missing from the build`,
        );
      };
      const add = (url, base) => {
        if (url.startsWith("data:")) return;
        const { origin, pathname } = new URL(url, base);
        if (origin !== BUILD_ORIGIN || files.has(pathname)) return;
        const content = readBuilt(pathname);
        files.set(pathname, content);
        if (pathname.endsWith(".css")) {
          for (const [, , ref] of String(content).matchAll(CSS_URL)) {
            add(ref, BUILD_ORIGIN + pathname);
          }
        }
      };

      const pageUrl = `${BUILD_ORIGIN}/${OFFLINE_PAGE}`;
      add(pageUrl, pageUrl);
      for (const [, tag, attributes] of String(page.source).matchAll(
        RESOURCE_TAG,
      )) {
        if (tag.toLowerCase() === "link" && !RESOURCE_LINK.test(attributes)) {
          continue;
        }
        for (const [, name, value] of attributes.matchAll(RESOURCE_ATTRIBUTE)) {
          const urls =
            name.toLowerCase() === "srcset"
              ? value
                  .split(",")
                  .map((candidate) => candidate.trim().split(/\s+/)[0])
              : [value];
          urls.filter(Boolean).forEach((url) => add(url, pageUrl));
        }
      }

      const entries = [...files]
        .map(([pathname, content]) => [pathname, contentHash(content)])
        .sort(([a], [b]) => (a < b ? -1 : 1));
      const manifest = {
        version: contentHash(JSON.stringify(entries) + source),
        urls: entries.map(([pathname]) => pathname),
      };
      this.emitFile({
        type: "asset",
        fileName: SW_FILE,
        source: source.replace(SW_MANIFEST, () => JSON.stringify(manifest)),
      });
    },
  };
};

export default defineConfig({
  appType: "mpa",
  base: "./",
  plugins: [htmlPartials(), serviceWorker()],
  build: {
    rollupOptions: {
      input: pageInputs,
    },
  },
});
