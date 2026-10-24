# Daily Front-End Audit — Eternal Rest

**Audit date:** 2026-10-21 (original static review)
**Follow-up review:** 2026-10-24 (completion reconciliation)
**Project type:** Static multi-page website (Vite MPA, HTML partials, CSS custom properties, vanilla ES module) presenting a fictional Polish funeral-home brand, with a Netlify Forms contact form addressed to the project author
**Audit mode:** Static repository review (2026-10-21); follow-up reconciliation of each finding against current sources, the archived plan `docs/archive/plans/PLAN-2026-10-24.md` and local checks (2026-10-24)
**Follow-up status:** All five findings and all three optional improvements are completed. Netlify Forms delivery on the deployed site remains unverified.

## Follow-up summary (2026-10-24)

| Item                                      | Priority | Plan task | Status                                      |
| ----------------------------------------- | -------- | --------- | ------------------------------------------- |
| P1-01 — Raster-wrapped shared logo        | P1       | PH1-02    | Completed                                   |
| P1-02 — Inconsistent demonstration notice | P1       | PH1-01    | Completed                                   |
| P2-01 — Inactive scroll-reveal mechanism  | P2       | PH2-02    | Completed                                   |
| P2-02 — Stored theme applied after paint  | P2       | PH2-01    | Completed                                   |
| P2-03 — Outdated README and comments      | P2       | PH3-01    | Completed                                   |
| Contact form honeypot                     | Optional | O-01      | Completed; Netlify delivery not verified    |
| Quality checks before merge               | Optional | O-02      | Completed; no pull-request run observed yet |
| Native no-JavaScript form submission      | Optional | O-03      | Completed; Netlify delivery not verified    |

The follow-up review confirmed each completion against the current implementation and tests. It was not a new full-site audit and introduces no new findings.

## Overall assessment (historical, 2026-10-21)

The implementation is in good shape for continued development. Source ownership is clear: shared page chrome comes from `partials/` through a build-time plugin, page entries are derived automatically, and the progressive-enhancement contract (inline disclosure initializer, `no-js`/`js-pending` CSS fallbacks, inert form until its handler is attached) is consistent and guarded by a build-output check. No runtime, build or accessibility blockers were found in source.

The most important risks at the time were a shared logo asset much heavier than its role requires, and inconsistent demonstration disclosure on the marketing pages, which presented fictional business facts next to the author's real contact details. The remaining findings were contained maintenance and documentation drift.

> **2026-10-24:** All risks above are resolved by the completion records below. The inert form baseline was replaced by native no-JavaScript submission under O-03.

## Verified strengths (historical, 2026-10-21)

Line references reflect the sources as of 2026-10-21.

- Single source for shared chrome: `vite.config.js:21-87` injects `partials/*.html` at `<!-- partial:name -->` markers, fails the build on a missing partial, invalid marker or nested partial, and converts `data-partial-current` into `aria-current="page"`. Page inputs are derived from root-level `*.html` files (`vite.config.js:9-19`), so all nine pages share one header and one of two footers.
- Coherent no-JavaScript and failed-module baseline: `partials/disclosure-init.html` keeps disclosures collapsed only while `main.js` may still run and restores the fallback on a load or parse error of the app module; `css/components.css:394-402` and `:1343-1364` hide controls that depend on JavaScript. `scripts/check-references.js` reads the initializer's `appModule` expression directly from the partial and checks it against the built module path.
- Accessible interaction patterns in `js/main.js`: the mobile menu syncs `aria-expanded`/`aria-hidden`, moves and restores focus, loops Tab and closes on Escape (`:114-194`); disclosures keep `aria-expanded` and `hidden` in sync (`:272-303`); the form links errors through `aria-describedby`, sets `aria-invalid`, focuses the first invalid field, uses `aria-busy`/`aria-disabled` while pending and focuses a `role="status"` or `role="alert"` message (`:333-448`).
- Defensive theme persistence: `localStorage` reads and writes are wrapped in `try/catch` with a versioned payload and an `auto` fallback (`js/main.js:12-35`).
- Consistent page metadata: on all nine pages `<title>`, `og:title` and `twitter:title` match, descriptions match across meta/Open Graph/Twitter, `og:url` is page-specific, and each page has exactly one `robots` directive, one `<h1>` and one module script (checked with a read-only script).
- Image handling: every hero `<img>` declares `width`/`height` equal to the actual WebP, AVIF and PNG source dimensions (checked with a read-only `sharp` metadata script); fonts are self-hosted variable WOFF2 with `font-display: swap` (`css/fonts.css`).
- Proportionate verification tooling: six Playwright smoke tests with mocked network for menu, FAQ, pricing filter and form states (`tests/smoke.spec.js`; ten as of 2026-10-24), and a CI workflow running lint, build, reference checks and smoke tests with read-only permissions (`.github/workflows/quality.yml`).
- External links in the marketing footer use `target="_blank"` with `rel="noopener noreferrer"` and announce the new tab in their accessible names (`partials/footer-marketing.html`).

## P0 — Critical risks

None detected.

## P1 — Important issues

### [P1-01] Shared logo SVG embeds 254 KB of raster data and metadata

- **Status:** COMPLETED — implemented and verified.
- **Result:** `assets/logos/logo.svg` is now a 1,575-byte vector with three filled paths and no embedded images or C2PA metadata, keeping the 512 × 512 size, the partial references and the `.brand__emblem` theme recoloring and inset trim; the unused `logo.png` was removed. The optional favicon follow-up was completed on 2026-10-24, reducing `public/favicons/favicon.svg` from 92,765 to 1,613 bytes.
- **Verification:** On 2026-10-22 the emblem was checked in Chromium at 320, 390 and 1440 px in light, dark and system themes, and `npm run build` and `npm run check:references` passed. On 2026-10-24 both SVGs were confirmed free of `<image>` and base64 content; the effect on load time was not measured.

### [P1-02] Marketing pages present fictional business facts without demonstration disclosure

- **Status:** COMPLETED — implemented and verified.
- **Result:** The marketing footer now carries the same demonstration notice as the legal footer, so all nine pages disclose the fictional status, while `about.html`, `services.html` and `pricing.html` keep their in-world narrative. Contact facts are labelled consistently: the telephone, e-mail and Tarnów office address are attributed to KP_Code Digital Studio (the address was confirmed as genuine by the project owner), the 24/7 availability is marked illustrative, and the header call action and `index.html`/`about.html` descriptions no longer present a real funeral home.
- **Verification:** On 2026-10-22 all nine built pages were reviewed in Chromium at 320–1440 px in light and dark themes, and `npm run build` and `npm run check:references` passed. The 2026-10-24 review confirmed the current footer partials, header label and page descriptions.

## P2 — Minor refinements

### [P2-01] Scroll-reveal mechanism has no styles and does nothing visible

- **Status:** COMPLETED — implemented and verified.
- **Result:** The 29 `data-reveal` attributes, the reveal `IntersectionObserver` in `js/main.js` and the unused `.reveal` utility rules were removed, keeping the back-to-top `.is-visible` state and reduced-motion scrolling; `docs/CHANGELOG.md` records the removal.
- **Verification:** On 2026-10-24 no reveal hook remained in the root pages, `js/` or `css/`, and `npm run lint` and `npm run test:smoke` passed. Unchanged rendering of the five pages rests on the plan's completion record and was not re-checked visually in the follow-up.

### [P2-02] Stored theme is applied only after the module script runs

- **Status:** COMPLETED — implemented and verified.
- **Result:** The inline initializer in `partials/disclosure-init.html` now applies a stored version-1 `light` or `dark` preference to `html[data-theme]` before the stylesheet loads, read-only and inside `try/catch`, with the system scheme as fallback; `js/main.js` keeps the controls and storage writes, and the README documents the CSP requirement.
- **Verification:** On 2026-10-24 the smoke test "stored dark theme applies before the application module runs" (module request blocked) and `npm run check:references` passed. The test asserts the attribute without the module; no paint trace was recorded.

### [P2-03] README and comments describe superseded asset and footer state

- **Status:** COMPLETED — implemented and verified.
- **Result:** Both README languages now describe the six PNG sources converted by `npm run images:convert` into the committed AVIF/WebP heroes used by six pages, the real social profile links and corrected structure trees; the spotlight comment in `js/main.js` names all five pages that use `data-spotlight`.
- **Verification:** On 2026-10-24 the README image, social-link and structure sections and the comment were compared with the repository, including the five `data-spotlight` pages. This is a documentation check with no automated coverage.

## Extra quality improvements

### Spam protection for the live contact form

- **Status:** COMPLETED — implemented and verified locally (plan task O-01).
- **Result:** `kontakt-kp-code` declares `data-netlify-honeypot="bot-field"` with a hidden, markup-only `bot-field` input that is sent empty in the POST body.
- **Verification:** On 2026-10-24 the mocked submission smoke test asserting the honeypot configuration and payload passed. Netlify spam filtering and delivery on the deployed site were not verified.

### Run quality checks before merge

- **Status:** COMPLETED — implemented (plan task O-02).
- **Result:** `.github/workflows/quality.yml` also runs on pull requests targeting `main`, keeping the `push` and manual triggers, read-only permissions and check sequence; it is not a required merge check.
- **Verification:** The trigger configuration was confirmed in the workflow file, and recent `push` runs on `main` succeeded. No pull-request-triggered run appears in the run history, so that trigger has not yet been observed in GitHub Actions.

### Reassess the inert no-JavaScript form baseline

- **Status:** COMPLETED — implemented and verified locally (plan task O-03).
- **Result:** The form is no longer `inert`: without JavaScript or after a failed module load it uses native constraint validation and a URL-encoded POST, and `js/main.js` sets `novalidate` only after attaching its handler. The fallback notice, README, `terms.html` and `privacy.html` describe the native path.
- **Verification:** On 2026-10-24 the smoke tests for disabled JavaScript, a failed module load and the preserved custom e-mail error passed. Native submission and delivery through Netlify Forms on the deployed site were not verified.

## Verification performed

### Original audit (2026-10-21)

- Inspected: `README.md`, `AGENTS.md`, `CLAUDE.md`, `package.json`, `vite.config.js`, `playwright.config.js`, `.eslintrc.cjs`, `.prettierignore`, `.gitignore`, `.gitattributes`, `.github/workflows/quality.yml`, all `partials/*.html`, the six marketing pages, the heads and relevant sections of the three legal pages, `js/main.js`, `css/main.css`, `css/tokens.css`, `css/base.css`, `css/fonts.css`, `css/utilities.css`, the relevant parts of `css/components.css`, `scripts/check-references.js`, `scripts/convert-images.js`, `tests/smoke.spec.js`, `public/` (robots, sitemap, manifest), `docs/CHANGELOG.md` and `docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-10-10.md`. No previous `daily-AUDIT.md` existed.
- Read-only commands: `git status`, `git log` (including `-S` history searches); ad-hoc Node scripts, kept outside the repository, comparing page metadata, image `width`/`height` attributes against actual image dimensions (via `sharp` metadata), and the composition of `assets/logos/logo.svg`.
- Validation command: `npm run lint` passed (exit code 0, no warnings).
- Not run: `npm run build`, `npm run check:references` (needs a fresh `dist/`; the audit rules forbade regenerating production output), `npm run test:smoke`, `npm run format:check`.
- Not verified: runtime behavior in any browser, including the theme first-paint timing and the logo's effect on load time; Netlify Forms delivery and the public deployment; assistive-technology announcements; formal WCAG conformance.

### Follow-up review (2026-10-24)

- Inspected: the archived plan, `docs/CHANGELOG.md`, the Git history of the plan tasks, and the current sources and tests relevant to each finding (`assets/logos/logo.svg`, `public/favicons/favicon.svg`, all `partials/*.html`, the page heads, `contact.html`, `js/main.js`, `README.md`, `.github/workflows/quality.yml`, `tests/smoke.spec.js`).
- Passed: `npm run lint`; `npm run test:smoke` (build plus all 10 Playwright tests); `npm run check:references` (9 pages); `npm run format:check`; `gh run list` showed successful recent `Quality Checks` push runs on `main`.
- Not verified: Netlify Forms delivery and spam filtering on the deployed site, a pull-request-triggered workflow run, the logo's effect on load time, assistive-technology announcements and formal WCAG conformance.

## Senior rating (historical, 2026-10-21)

**Rating:** 8/10

The architecture fits the project's scope well. Ownership of partials and page inputs is clear and fails fast, the progressive-enhancement contract is deliberate and has its own build-output guard, interaction accessibility is careful, and verification (lint, reference checks, mocked smoke tests in CI) is proportionate to a static demo. The rating is held back by an oversized shared logo asset on every page, inconsistent demonstration disclosure in shared public content, and contained drift between implementation, the dead reveal mechanism and the README.

> **2026-10-24:** The issues cited above are completed. No new rating was assigned, as the follow-up was a reconciliation rather than a full audit.
