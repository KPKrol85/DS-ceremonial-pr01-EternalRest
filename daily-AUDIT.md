# Daily Front-End Audit — Eternal Rest

**Audit date:** 2026-10-21
**Project type:** Static multi-page website (Vite MPA, HTML partials, CSS custom properties, vanilla ES module) presenting a fictional Polish funeral-home brand, with a Netlify Forms contact form addressed to the project author
**Audit mode:** Static repository review

## Overall assessment

The implementation is in good shape for continued development. Source ownership is clear: shared page chrome comes from `partials/` through a build-time plugin, page entries are derived automatically, and the progressive-enhancement contract (inline disclosure initializer, `no-js`/`js-pending` CSS fallbacks, inert form until its handler is attached) is consistent and guarded by a build-output check. No runtime, build or accessibility blockers were found in source.

The most important current risks are a shared logo asset that is much heavier than its role requires, and inconsistent demonstration disclosure on the marketing pages, which present fictional business facts next to the author's real contact details. The remaining findings are contained maintenance and documentation drift.

## Verified strengths

- Single source for shared chrome: `vite.config.js:21-87` injects `partials/*.html` at `<!-- partial:name -->` markers, fails the build on a missing partial, invalid marker or nested partial, and converts `data-partial-current` into `aria-current="page"`. Page inputs are derived from root-level `*.html` files (`vite.config.js:9-19`), so all nine pages share one header and one of two footers.
- Coherent no-JavaScript and failed-module baseline: `partials/disclosure-init.html` keeps disclosures collapsed only while `main.js` may still run and restores the fallback on a load or parse error of the app module; `css/components.css:394-402` and `:1343-1364` hide controls that depend on JavaScript. `scripts/check-references.js` reads the initializer's `appModule` expression directly from the partial and checks it against the built module path.
- Accessible interaction patterns in `js/main.js`: the mobile menu syncs `aria-expanded`/`aria-hidden`, moves and restores focus, loops Tab and closes on Escape (`:114-194`); disclosures keep `aria-expanded` and `hidden` in sync (`:272-303`); the form links errors through `aria-describedby`, sets `aria-invalid`, focuses the first invalid field, uses `aria-busy`/`aria-disabled` while pending and focuses a `role="status"` or `role="alert"` message (`:333-448`).
- Defensive theme persistence: `localStorage` reads and writes are wrapped in `try/catch` with a versioned payload and an `auto` fallback (`js/main.js:12-35`).
- Consistent page metadata: on all nine pages `<title>`, `og:title` and `twitter:title` match, descriptions match across meta/Open Graph/Twitter, `og:url` is page-specific, and each page has exactly one `robots` directive, one `<h1>` and one module script (checked with a read-only script).
- Image handling: every hero `<img>` declares `width`/`height` equal to the actual WebP, AVIF and PNG source dimensions (checked with a read-only `sharp` metadata script); fonts are self-hosted variable WOFF2 with `font-display: swap` (`css/fonts.css`).
- Proportionate verification tooling: six Playwright smoke tests with mocked network for menu, FAQ, pricing filter and form states (`tests/smoke.spec.js`), and a CI workflow running lint, build, reference checks and smoke tests with read-only permissions (`.github/workflows/quality.yml`).
- External links in the marketing footer use `target="_blank"` with `rel="noopener noreferrer"` and announce the new tab in their accessible names (`partials/footer-marketing.html`).

## P0 — Critical risks

None detected.

## P1 — Important issues worth fixing next

### [P1-01] Shared logo SVG embeds 254 KB of raster data and metadata

- **Classification:** Source-visible risk
- **Evidence:** `assets/logos/logo.svg`, `partials/site-header.html:5`, `partials/footer-marketing.html:6`, `partials/footer-legal.html:6`, `css/components.css:2-13`
- **Current behavior:** `logo.svg` is 254,420 bytes. It contains six `<image>` elements with base64-encoded PNG data (about 229 KB of base64), a 23 KB C2PA metadata block and only three path elements. It is loaded eagerly in the header and footer of all nine pages and displayed at `3.25rem` (52 px), recolored with `filter: brightness(0)`. For comparison, the largest hero image (`assets/images/hero.avif`) is 49 KB.
- **Impact:** The heaviest image on every first page view is a small header emblem above the fold, competing for bandwidth with the prioritized hero photographs. Because the "vector" is a raster wrapper, it also gains none of the scaling or size benefits of SVG. The effect on load time was not measured.
- **Recommended direction:** Replace the asset with a true vector or an appropriately sized raster export of the emblem, without the embedded metadata, while keeping the theme recoloring and the `0.1`/`0.11` inset trim in `.brand__emblem` aligned with the new artwork.

### [P1-02] Marketing pages present fictional business facts without demonstration disclosure

- **Classification:** Contract mismatch
- **Evidence:** `partials/footer-marketing.html:19`, `:56`, `:99-105`; `partials/footer-legal.html:19`, `:56`, `:98`; `about.html:10`, `:65-67`; `partials/site-header.html:102`
- **Current behavior:** The two footer partials describe the same contact block differently. The legal footer says the site is a "Demonstracyjna koncepcja…", heads the block "Kontakt — demonstracja" and says "Przykładowa dostępność 24/7". The marketing footer, used on six pages, uses brand copy, heads the block "Kontakt", lists a Tarnów office address and "Dostępność 24/7", and then says "Dane kontaktowe autora projektu KP_Code Digital Studio." for the whole block. `about.html`, `services.html` and `pricing.html` contain no demonstration notice at all, while `about.html` (body and social description) states that Eternal Rest is a funeral home in Tarnów with more than 35 years of history. Every page's header offers "Zadzwoń 24/7" to the author's real telephone number.
- **Impact:** A visitor landing on the about, services or pricing page, for example from a shared social preview, gets no on-page signal that the business is fictional. The project's own disclosure pattern (legal footer, contact page, guide note, home FAQ) is applied inconsistently, and the marketing footer suggests the office address and round-the-clock availability belong to the author's contact details. The `noindex` policy limits discoverability but does not affect direct or shared visits.
- **Recommended direction:** Choose one disclosure pattern for the shared chrome, for example by aligning the marketing footer's labelling with the legal footer, and decide which contact facts are real and which are illustrative, so that each is labelled correctly on every page.

## P2 — Minor refinements

### [P2-01] Scroll-reveal mechanism has no styles and does nothing visible

- **Classification:** Maintenance risk
- **Evidence:** `js/main.js:196-215`, `css/utilities.css:25-34`, 29 `data-reveal` attributes across `index.html`, `about.html`, `services.html`, `guide.html` and `contact.html`
- **Current behavior:** `main.js` creates an `IntersectionObserver` that adds `.is-visible` to every `[data-reveal]` element, but no stylesheet selects `[data-reveal]` and no element carries the `.reveal` class, which is the only selector with reveal styles. The utility rules are therefore unused, and the observer has no visible effect. `docs/CHANGELOG.md` still records "scroll-triggered reveals" as a feature.
- **Impact:** Two half-connected mechanisms (an attribute and observer, plus a separate utility class) mislead maintainers about what is implemented and cost an observer on five pages for no result. Connecting them later without care could hide content when scripting is unavailable.
- **Recommended direction:** Either remove the attribute, observer and unused utility, or deliberately connect them with a style that is safe without JavaScript and with reduced motion.

### [P2-02] Stored theme is applied only after the module script runs

- **Classification:** Source-visible risk
- **Evidence:** `js/main.js:56-57`, `index.html:50-52` (same head structure on all pages), `partials/disclosure-init.html`, `css/tokens.css:2`, `:72-78`
- **Current behavior:** The page renders with `color-scheme: light dark` until `main.js`, a deferred module, reads `eternalRestTheme` and sets `data-theme`. The inline head initializer handles only the disclosure state, not the theme.
- **Impact:** For a visitor whose saved theme is the opposite of the system preference, the first paint can use the system scheme and then switch on every page load, depending on network and script timing. This needs browser verification.
- **Recommended direction:** Apply the stored preference before first paint, following the existing pattern of an inline head initializer, and keep the current storage error handling and the documented CSP requirement.

### [P2-03] README and comments describe superseded asset and footer state

- **Classification:** Contract mismatch
- **Evidence:** `README.md:127` and `:298`; `README.md:9` and `:180`; `README.md:61-75` and `:232-246`; `js/main.js:217`
- **Current behavior:** The README says that the graphics are SVG embedded in HTML and that there are no photographs to convert, although `assets/src-images/` holds six PNG sources and six pages use the generated AVIF/WebP heroes. It says the social links remain placeholders, although `partials/footer-marketing.html` links to real profiles. Its structure tree lists a non-existent `assets/illustrations/` and omits `assets/images/`, `assets/fonts/`, `assets/logos/` and four page stylesheets. The spotlight comment in `main.js` names only the guide and contact pages, although five pages use `data-spotlight`.
- **Impact:** The README is the declared reference for architecture and the `images:convert` workflow. Its stale statements misdescribe a script that now regenerates committed hero files used by six pages.
- **Recommended direction:** Update the affected README sections in both languages, and the comment, to the current asset set and footer links.

## Extra quality improvements

### Spam protection for the live contact form

- **Evidence:** `contact.html:99-108` registers a real Netlify Forms form (`data-netlify="true"`) that delivers enquiries to the author, without a honeypot field.
- **Potential value:** A markup-only honeypot that Netlify Forms supports would reduce automated submissions reaching the author without adding scripts or third-party services.
- **Scope boundary:** Optional hardening. No spam problem is evidenced in the repository.

### Run quality checks before merge

- **Evidence:** `.github/workflows/quality.yml:4-8` triggers only on pushes to `main` and manual dispatch, while work happens on feature branches.
- **Potential value:** Lint, build, reference and smoke failures would be caught on a branch or pull request instead of after landing on `main`.
- **Scope boundary:** Optional workflow change. The current trigger is a valid choice for a single-maintainer project.

### Reassess the inert no-JavaScript form baseline

- **Evidence:** `contact.html:99-107` now declares `method="POST"` and `data-netlify="true"` but stays `inert` and `novalidate` until `main.js` runs. The inert protection was introduced to stop a native GET submission from putting entered data in the URL (`docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-10-10.md`, IMP-QUALITY-04).
- **Potential value:** With POST in place, the original data-in-URL risk no longer applies to native submission. A native, validated no-JavaScript submission path could replace the current e-mail and telephone fallback.
- **Scope boundary:** Optional. The current behavior is intentional, documented in `README.md:9`, and safe. A change would need its own validation and verification on Netlify.

## Verification performed

- Inspected: `README.md`, `AGENTS.md`, `CLAUDE.md`, `package.json`, `vite.config.js`, `playwright.config.js`, `.eslintrc.cjs`, `.prettierignore`, `.gitignore`, `.gitattributes`, `.github/workflows/quality.yml`, all `partials/*.html`, the six marketing pages, the heads and relevant sections of the three legal pages, `js/main.js`, `css/main.css`, `css/tokens.css`, `css/base.css`, `css/fonts.css`, `css/utilities.css`, the relevant parts of `css/components.css`, `scripts/check-references.js`, `scripts/convert-images.js`, `tests/smoke.spec.js`, `public/` (robots, sitemap, manifest), `docs/CHANGELOG.md` and `docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-10-10.md`. No previous `daily-AUDIT.md` existed.
- Read-only commands: `git status`, `git log` (including `-S` history searches); ad-hoc Node scripts, kept outside the repository, comparing page metadata, image `width`/`height` attributes against actual image dimensions (via `sharp` metadata), and the composition of `assets/logos/logo.svg`.
- Validation command: `npm run lint` passed (exit code 0, no warnings).
- Not run: `npm run build`, `npm run check:references` (needs a fresh `dist/`; the audit rules forbid regenerating production output), `npm run test:smoke`, `npm run format:check`.
- Not verified: runtime behavior in any browser, including the theme first-paint timing and the logo's effect on load time; Netlify Forms delivery and the public deployment; assistive-technology announcements; formal WCAG conformance.

## Senior rating

**Rating:** 8/10

The architecture fits the project's scope well. Ownership of partials and page inputs is clear and fails fast, the progressive-enhancement contract is deliberate and has its own build-output guard, interaction accessibility is careful, and verification (lint, reference checks, mocked smoke tests in CI) is proportionate to a static demo. The rating is held back by an oversized shared logo asset on every page, inconsistent demonstration disclosure in shared public content, and contained drift between implementation, the dead reveal mechanism and the README.
