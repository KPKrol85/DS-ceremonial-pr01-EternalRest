import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

// Attributes holding a whitespace-separated list of IDs on any element.
const ID_LIST_ATTRIBUTES = [
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
];
const LABEL_FOR = "label[for]";
const SAME_PAGE_HREF = 'href="#…"';
const CROSS_PAGE_HREF = 'href="strona.html#…"';
const KINDS = [
  ...ID_LIST_ATTRIBUTES,
  LABEL_FOR,
  SAME_PAGE_HREF,
  CROSS_PAGE_HREF,
];

// Placeholder origin that separates internal links from external URLs, mailto: and tel:.
const SITE_ORIGIN = "https://eternal-rest.invalid";

// Comments and the content of raw-text elements are not markup. They are blanked
// character by character, so offsets and line numbers still match the file.
const NON_MARKUP =
  /<!--[\s\S]*?-->|(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2\s*>)/gi;
// A start tag and its attributes; quoted values may contain ">".
const START_TAG = /<([a-z][a-z0-9-]*)((?:"[^"]*"|'[^']*'|[^"'>])*)>/gi;
const ATTRIBUTE =
  /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const blank = (text) => text.replace(/[^\n]/g, " ");

const toMarkup = (html) =>
  html.replace(NON_MARKUP, (match, open, name, body, close) =>
    open ? open + blank(body) + close : blank(match),
  );

const lineAt = (html, index) => html.slice(0, index).split("\n").length;

// Maps each attribute name to its value and its offset in the page.
const readAttributes = (tag) => {
  const attributes = new Map();
  const start = tag.index + 1 + tag[1].length;
  for (const match of tag[2].matchAll(ATTRIBUTE)) {
    const name = match[1].toLowerCase();
    // Like the HTML parser, keep the first occurrence of a repeated attribute.
    if (!attributes.has(name)) {
      const value = match[2] ?? match[3] ?? match[4] ?? "";
      attributes.set(name, { value, index: start + match.index });
    }
  }
  return attributes;
};

const decode = (text) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

// Returns the page and ID a project-internal fragment link points to, or null when
// the href has no fragment (including the bare "#" placeholder) or is external.
const resolveFragment = (href, page) => {
  if (!href.includes("#")) return null;
  const base = `${SITE_ORIGIN}/${page}`;
  if (!URL.canParse(href, base)) return null;
  const url = new URL(href, base);
  if (url.origin !== SITE_ORIGIN || url.hash.length < 2) return null;
  const pathname = decode(url.pathname);
  return {
    page: pathname === "/" ? "index.html" : pathname.slice(1),
    id: decode(url.hash.slice(1)),
  };
};

const readPage = (page) => {
  const html = toMarkup(readFileSync(path.join(distDir, page), "utf8"));
  const ids = new Map();
  const references = [];

  for (const tag of html.matchAll(START_TAG)) {
    const element = tag[1].toLowerCase();
    const attributes = readAttributes(tag);
    const reference = (kind, attribute, id, targetPage = page) => {
      const { value, index } = attributes.get(attribute);
      references.push({ kind, attribute, value, index, id, targetPage });
    };

    const { value: ownId, index: ownIdIndex } = attributes.get("id") ?? {};
    if (ownId) ids.set(ownId, [...(ids.get(ownId) ?? []), ownIdIndex]);

    for (const attribute of ID_LIST_ATTRIBUTES) {
      const list = attributes.get(attribute)?.value ?? "";
      for (const target of list.split(/\s+/).filter(Boolean)) {
        reference(attribute, attribute, target);
      }
    }

    const labelFor = element === "label" && attributes.get("for");
    if (labelFor) reference(LABEL_FOR, "for", labelFor.value);

    const href = attributes.get("href")?.value;
    const fragment = href === undefined ? null : resolveFragment(href, page);
    if (fragment) {
      const kind = href.startsWith("#") ? SAME_PAGE_HREF : CROSS_PAGE_HREF;
      reference(kind, "href", fragment.id, fragment.page);
    }
  }

  return { html, ids, references };
};

const run = () => {
  const pages = existsSync(distDir)
    ? readdirSync(distDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
        .map((entry) => entry.name)
        .sort()
    : [];

  if (!pages.length) {
    console.error(
      "Brak zbudowanych stron HTML w dist/. Najpierw uruchom npm run build.",
    );
    process.exitCode = 1;
    return;
  }

  const parsed = new Map(pages.map((page) => [page, readPage(page)]));
  const counts = new Map(KINDS.map((kind) => [kind, 0]));
  const errors = [];

  for (const [page, { html, ids, references }] of parsed) {
    const pageErrors = [];

    for (const [id, positions] of ids) {
      if (positions.length < 2) continue;
      const lines = positions.map((index) => lineAt(html, index)).join(", ");
      pageErrors.push({
        index: positions[0],
        message: `id "${id}" występuje wielokrotnie (wiersze: ${lines})`,
      });
    }

    for (const ref of references) {
      counts.set(ref.kind, counts.get(ref.kind) + 1);
      const target = parsed.get(ref.targetPage);
      const source = `${ref.kind === LABEL_FOR ? "label " : ""}${ref.attribute}="${ref.value}"`;
      const where =
        ref.targetPage === page ? "" : ` na stronie ${ref.targetPage}`;
      if (!target) {
        pageErrors.push({
          index: ref.index,
          message: `${source}: brak strony ${ref.targetPage} w dist/`,
        });
      } else if (!target.ids.has(ref.id)) {
        pageErrors.push({
          index: ref.index,
          message: `${source}: brak elementu z id "${ref.id}"${where}`,
        });
      }
    }

    pageErrors
      .sort((a, b) => a.index - b.index)
      .forEach(({ index, message }) =>
        errors.push(`${page}:${lineAt(html, index)} ${message}`),
      );
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  console.log(`Sprawdzone strony HTML w dist/: ${pages.length}`);
  console.log(`Sprawdzone odwołania do identyfikatorów: ${total}`);
  counts.forEach((count, kind) => console.log(`  ${kind}: ${count}`));

  if (errors.length) {
    console.error(`\nBłędy odwołań do identyfikatorów: ${errors.length}`);
    errors.forEach((error) => console.error(`  ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    "Wszystkie odwołania wskazują istniejące id; brak zduplikowanych id.",
  );
};

run();
