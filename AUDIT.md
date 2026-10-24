# Eternal Rest — Final Technical Front-End Audit

**Audit date:** 2026-10-24
**Project type:** Static multi-page demonstration website (Vite MPA with build-time HTML partials, layered CSS with custom properties, one vanilla ES module) presenting a fictional Polish funeral-home brand, with a Netlify Forms contact form addressed to the project author
**Audit mode:** Final repository and implementation review
**Current readiness:** Ready with minor refinements

## 1. Executive assessment

Eternal Rest is a coherent, well-documented static site within its declared scope. Shared page chrome has a single source in `partials/`, injected by a small, fail-fast Vite plugin; page inputs are derived automatically; and the progressive-enhancement contract (inline head initializer, `no-js` / `js-pending` CSS states, native form fallback) is consistent across source, CSS, tests and a dedicated build-output check. The fictional status of the brand is disclosed on every page, and the legal pages describe the actual data flows (Netlify Forms, `localStorage` theme preference, no cookies).

No P0 or P1 issues were found. Runtime checks on a locally rendered copy of the pages showed no console errors, failed requests or horizontal overflow across nine pages, five viewport widths and both colour schemes. The remaining findings are small: the open-state semantics of the mobile menu and a stale project-structure listing in `README.md`.

The project's own build, lint and Playwright suite could not be executed because dependencies are not installed in this environment; this is the main verification limitation. Within the verified scope, the project is suitable for portfolio presentation and continued development.

## 2. Audit scope and verification

### Areas inspected

- All nine root HTML pages (`index`, `about`, `services`, `pricing`, `guide`, `contact`, `terms`, `privacy`, `cookies`): document structure, metadata, headings, landmarks, links, forms, images and public content.
- All five partials in `partials/`, including the inline initializer `partials/disclosure-init.html`.
- `js/main.js` in full: theme persistence, header, mobile menu, spotlight, disclosures, pricing filter, contact form, back-to-top.
- CSS architecture: `css/main.css` import order, `tokens.css`, `base.css`, `fonts.css`, `utilities.css`, the header, theme, disclosure, form and fallback sections of `components.css`, and the anchor-offset rules in `pages/legal.css` and `pages/services.css`.
- Build and tooling: `package.json`, `vite.config.js`, `postcss.config.cjs`, `.eslintrc.cjs`, `.prettierignore`, `.gitignore`, `.gitattributes`, `playwright.config.js`, `scripts/check-references.js`, `scripts/convert-images.js`, `tests/smoke.spec.js`, `.github/workflows/quality.yml`.
- Static assets: hero images (dimensions and sizes), fonts and OFL files, logo, favicons, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `og.jpg`.
- Documentation and records: `README.md`, `AGENTS.md`, `LICENSE.md`, `THIRD-PARTY-NOTICES.md`, `docs/CHANGELOG.md`, `docs/archive/audits/daily-AUDIT-2026-10-24.md` (used only as context; its completed items were re-checked against current sources).

### Verification performed

- `git status` — working tree clean on the audited branch before the audit.
- `node --check` on `js/main.js`, `scripts/*.js`, `tests/smoke.spec.js`, `vite.config.js`, `playwright.config.js` — executed and passed.
- `prettier --check .` with a globally available Prettier 3.8.1 (the project pins `^3.2.5`, not installed) — executed and passed.
- Partial rendering reproduced outside the repository: a scratch script applying the same marker and `data-partial-current` rules as `vite.config.js` wrote rendered pages to a temporary directory. This is an approximation of `npm run dev` output, not a Vite production build.
- `scripts/check-references.js` (unmodified copy) run against that rendered output — executed and passed: 9 pages, 212 ID references, no duplicate IDs, module path `/js/main.js` matches the `appModule` expression on all 9 pages.
- Chromium (pre-installed Playwright library) against the rendered copy served locally:
  - all 9 pages at 320, 390, 768, 1152 and 1440 px in light and dark schemes — no console errors, page errors, failed requests, HTTP errors or horizontal overflow;
  - mobile menu: closed panel not in the Tab order; opening moves focus to the first link; Tab cycle includes the menu button; Escape closes and restores focus; resizing to desktop and back resynchronises `aria-hidden` / `aria-expanded`;
  - theme controls: `aria-label`, `aria-pressed` and the stored `eternalRestTheme` payload update as documented;
  - skip link reaches `#main`; `aria-current="page"` is set on the current navigation link;
  - pricing filter and details toggle update visibility, `aria-expanded`, button text and the live status; hidden cards are not focusable;
  - JavaScript disabled: navigation visible in page flow, menu and theme controls hidden, all FAQ and package panels visible, pricing filter hidden, form fallback notice visible, no overflow;
  - fragment targets on `services`, `privacy`, `terms` and `cookies` land below the sticky header at 390 and 1280 px;
  - visible `:focus-visible` outline (2px solid) on the first 14 focus stops of `guide.html` at desktop width.
- Rendered text contrast computed from resolved colours on solid backgrounds for all 9 pages in both schemes (panels expanded) — no text below 4.5:1 (normal) or 3:1 (large) found.
- Hero image intrinsic dimensions read from the WebP files — they match the `width` / `height` attributes on all six pages.

### Verification limitations

- `npm run build`, `npm run lint`, `npm run check:references` on a real `dist/`, and `npm run test:smoke` were not executed: `node_modules/` is absent and installing dependencies is outside this audit. The globally available ESLint 10 cannot read the project's legacy `.eslintrc.cjs`, so no lint result is claimed.
- Hashed production asset names, CSS bundling and Autoprefixer output were not verified; module-path checks used the development path `/js/main.js`.
- Netlify Forms delivery and the public deployment named in `README.md` and `package.json` were not checked; no claim is made that the site is currently deployed.
- Contrast was not verified for text placed over photographs (hero stage) or in forced-colours mode.
- No assistive-technology, cross-browser (non-Chromium) or performance measurement was performed.

## 3. Verified strengths

- **Single source for shared chrome.** `vite.config.js:21-87` injects `partials/*.html`, fails on a missing partial, invalid marker or nested partial, and turns `data-partial-current` into `aria-current="page"`; page inputs come from root `*.html` files (`vite.config.js:9-19`).
- **Honest progressive-enhancement baseline.** `partials/disclosure-init.html` keeps disclosures collapsed only while `main.js` may still run and restores the fallback on a load or parse error of the app module; CSS hides JavaScript-only controls in that state (`css/components.css:394-402`, `:1356-1377`). Behaviour without JavaScript was confirmed in Chromium.
- **Guarded build contract.** `scripts/check-references.js` validates ID references, duplicate IDs and the `appModule` path contract against built HTML, reading the expression from the partial instead of duplicating it.
- **Accessible interaction patterns.** The menu syncs `aria-expanded` / `aria-hidden`, manages focus and closes on Escape (`js/main.js:110-196`); disclosures keep `aria-expanded` and `hidden` in sync (`:256-315`); the form links errors through `aria-describedby`, sets `aria-invalid`, focuses the first invalid field and focuses a `role="status"` or `role="alert"` result (`:317-432`).
- **Robust contact form paths.** The scripted path blocks duplicate submits, times out after 15 s and keeps values on failure; without JavaScript the form posts natively with constraint validation. Both paths are covered by the smoke suite (`tests/smoke.spec.js`, 10 tests).
- **Defensive theme persistence.** Versioned payload, `try/catch` around all storage access, and pre-paint application of an explicit theme (`partials/disclosure-init.html:18-34`, `js/main.js:12-35`).
- **Coherent theming.** Light and dark values are defined once per token with `light-dark()` in `css/tokens.css`; no rendered text contrast failure was found on solid backgrounds in either scheme.
- **Content integrity.** The fictional status is disclosed in both footers and on the contact, guide and home pages; contact details are attributed to KP_Code Digital Studio; legal pages match the implemented data flows (Netlify Forms, `localStorage` only, no cookies or analytics).
- **Asset discipline.** Self-hosted variable WOFF2 fonts with `font-display: swap` and bundled OFL texts; AVIF with WebP fallback for hero images with correct intrinsic dimensions; vector logo and favicon of about 1.6 KB each.
- **Proportionate CI.** `.github/workflows/quality.yml` runs `npm ci`, lint, build, reference checks and Chromium smoke tests with read-only permissions.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

None detected.

## 6. P2 — Minor refinements

### [P2-01] Open mobile menu keeps an "open" button name and leaves page content exposed

- **Classification:** Defect
- **Affected area:** Navigation, accessibility
- **Evidence:** `partials/site-header.html:19-26`; `js/main.js:116-138`
- **Current behavior:** The menu button has a static `aria-label="Otwórz menu"` that `main.js` never updates, so while the full-screen panel is open (`aria-expanded="true"`) the control that closes it is still announced as "Otwórz menu" (confirmed in Chromium). While open, the panel covers the viewport, but the header brand link, `main` and the footer are not made inert or hidden from assistive technology; Tab is trapped, but screen-reader virtual navigation can still reach covered content (source-visible).
- **Impact:** Screen-reader users hear a name that contradicts the button's current action and can move into content that is visually covered by the menu.
- **Recommended direction:** Give the button a name that is accurate in both states (update it on open/close, or use a state-neutral name relying on `aria-expanded`), and make content outside the header panel unavailable to assistive technology while the mobile menu is open, restoring it on close and on the switch to the desktop layout.
- **Verification criteria:** With the mobile menu open, the button's accessible name describes closing (or is state-neutral) and content outside the menu is not reachable by screen-reader navigation; after closing or resizing to 1152 px and above, the original state is restored and the existing menu smoke test still passes.

### [P2-02] README project-structure listing omits several tracked top-level entries

- **Classification:** Documentation mismatch
- **Affected area:** Documentation
- **Evidence:** `README.md:42-94` (PL, "Struktura projektu"); `README.md:220-272` (EN, "Project Structure")
- **Current behavior:** Both trees list the pages, `partials/`, `assets/`, `css/`, `js/`, `scripts/` and root configuration, but omit the tracked `public/` (favicons, manifest, `robots.txt`, `sitemap.xml`, `og.jpg`), `tests/`, `playwright.config.js`, `.github/workflows/`, `docs/` and `THIRD-PARTY-NOTICES.md`. These entries are described in other README sections.
- **Impact:** A maintainer using the structure section as a map can miss where SEO files, social-preview assets and tests live.
- **Recommended direction:** Add the missing tracked entries to both language versions of the tree, keeping the existing comment style.
- **Verification criteria:** Every tracked top-level file or directory listed by `git ls-files` (excluding agent instruction files, if intentionally omitted) appears in both trees.

## 7. Extra quality improvements

### Width-appropriate hero image candidates

- **Relevant area:** Images, performance-visible implementation
- **Current evidence:** Each hero `<picture>` offers a single AVIF and a single WebP candidate (`index.html:88-98` uses `hero.webp`, 1536 × 1024, 82 KB); `scripts/convert-images.js` produces one size per source image.
- **Potential value:** Smaller files for narrow viewports on the largest heroes (`hero`, `hero-services`, `hero-pricing`); actual benefit has not been measured.
- **Scope boundary:** Optional; current sizes are moderate and no loading problem was measured.

### Automated accessibility and theme-control checks in the smoke suite

- **Relevant area:** Testing and validation
- **Current evidence:** `tests/smoke.spec.js` covers menu, stored theme before module load, FAQ, pricing filter and contact form paths, but not the theme toggle / system-mode buttons, the pricing details toggle, the desktop resize resynchronisation of the menu, or an automated rule-based accessibility scan.
- **Potential value:** Earlier detection of regressions in interactions that are currently checked only manually.
- **Scope boundary:** Optional; an accessibility scanner would add a development dependency and should be justified separately.

### Lint toolchain on ESLint 8 legacy configuration

- **Relevant area:** Build and development workflow
- **Current evidence:** `package.json` pins `eslint` `^8.57.0` and the project uses `.eslintrc.cjs`, a format that ESLint 9 and later no longer read by default (confirmed with the globally installed ESLint 10).
- **Potential value:** Keeps linting runnable with supported ESLint releases when dependencies are next updated.
- **Scope boundary:** Optional; the pinned version and CI workflow remain internally consistent.

## 8. Current readiness conclusion

**Status:** Ready with minor refinements

No P0 or P1 issues were found. The site's core contracts — shared partials, page inputs, ID references, the module-path fallback, no-JavaScript behaviour, theme persistence and the interactive components — were confirmed by static inspection and by Chromium checks on a locally rendered copy. The two P2 items are contained refinements to the mobile menu's open-state semantics and to README accuracy. Before treating a release as final, the project's own `npm run build`, `npm run check:references` and `npm run test:smoke` should be run in an environment with dependencies installed, and Netlify Forms delivery should be confirmed on the deployment.

## 9. Senior rating

**Rating:** 9/10

The implementation is consistent within its static, demonstration scope: clear source ownership, a deliberately designed and tested progressive-enhancement baseline, careful ARIA and focus handling, accurate legal and demonstration disclosures, and verification tooling proportionate to the project. The rating is not higher because of the remaining menu accessibility refinement and because the project's own build, lint and smoke suite could not be executed during this audit.
