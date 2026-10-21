# Eternal Rest — Development Plan

**Last reviewed:** 2026-10-21
**Project type:** Polish-language static multi-page demonstration website for a fictional funeral-home brand (Vite MPA with build-time HTML partials, CSS custom properties and a vanilla ES module), with a Netlify Forms contact form that sends enquiries to the project author
**Plan status:** Active

## Planning principles

- The plan reflects the repository as reviewed on 2026-10-21. Open items are based on `daily-AUDIT.md` of the same date and on current documentation, each re-checked against the source. Completed improvement cycles are archived in `docs/archive/improvements/` and are not repeated here.
- A main item is checked only when its required subtasks are done and its completion condition has been verified. Optional subtasks never block completion.
- Edit canonical sources only: the root `*.html` pages, `partials/`, `css/`, `js/`, `assets/`, `public/`, `scripts/` and `tests/`. `dist/` is generated and never edited, and `assets/images/` is regenerated from `assets/src-images/` with `npm run images:convert`.
- Public content stays in Polish, and the Polish and English README sections change together.
- Significant completed changes are recorded in `docs/CHANGELOG.md` under its entry policy.

## Current priorities

1. `PH1-01` — Disclose the demonstration status consistently on every page.
2. `PH1-02` — Replace the raster-wrapped logo with a lightweight emblem.
3. `PH2-01` — Apply the stored theme before first paint.

## Phase 1 — Shared chrome and public content

**Goal:** Make every page disclose the demonstration status consistently and stop loading a 254 KB raster-wrapped logo in the shared header and footers.

- [ ] **PH1-01 — Disclose the demonstration status consistently on every page**
  - [ ] confirm with the project owner one disclosure pattern and which contact facts are the author's real details or illustrative content; today the telephone and e-mail are labelled as the author's, the office address is described as example data only in the `contact.html` description metadata, and the 24/7 availability is marked as an example only in `partials/footer-legal.html`
  - [ ] align `partials/footer-marketing.html` (brand paragraph, contact heading, office address, availability line) with that decision, following the labelling of `partials/footer-legal.html`
  - [ ] apply the same labelling to the 24/7 statements beside the author's telephone number: the header call action in `partials/site-header.html`, the shared closing on `index.html`, `about.html`, `services.html`, `pricing.html` and `guide.html`, and the office details on `contact.html`
  - [ ] show the demonstration status on `about.html`, `services.html` and `pricing.html`, which carry no notice today, including where the `about.html` lead and description metadata present the fictional company as a Tarnów funeral home with more than 35 years of history
  - [ ] keep new copy in Polish, keep each page's description identical across its meta, Open Graph and Twitter/X tags, and preserve the existing `mailto:` and `tel:` links
  - **Completion condition:** a review of the nine built pages shows the demonstration status on each page and one consistent label for every contact fact, and `npm run build` and `npm run check:references` pass.
  - **Priority:** High
  - **Source:** `daily-AUDIT.md` — P1-02

- [ ] **PH1-02 — Replace the raster-wrapped logo with a lightweight emblem**
  - [ ] produce the emblem as a true vector SVG, or as a raster export sized for its `3.25rem` display on high-density screens, without the six embedded PNG images and the C2PA metadata block of the current 254,420-byte `assets/logos/logo.svg`; the unreferenced 512 × 512 `assets/logos/logo.png` is the PNG version of the same logo
  - [ ] keep the emblem `<img>` in `partials/site-header.html`, `partials/footer-marketing.html` and `partials/footer-legal.html` pointing at the new asset, with `width` and `height` matching its intrinsic size
  - [ ] keep the light, dark and system theme recoloring of `.brand__emblem` in `css/components.css` and recalibrate its `0.1`/`0.11` inset trim to the new artwork
  - [ ] optional: regenerate `public/favicons/favicon.svg` (92,765 bytes, one embedded raster image) from the new vector, if one is produced
  - **Completion condition:** the shipped emblem contains no embedded raster data or metadata block, the header and both footers show it at the current size and alignment in light, dark and system themes at mobile and desktop widths, and `npm run build` passes.
  - **Priority:** High
  - **Source:** `daily-AUDIT.md` — P1-01

## Phase 2 — Script-driven presentation

**Goal:** Make the theme and motion behavior around `js/main.js` match its contracts: the stored theme applies from the first paint, and no inactive reveal hooks remain.

- [ ] **PH2-01 — Apply the stored theme before first paint**
  - [ ] record the current behavior in Chromium, with a stored theme opposite to the system scheme and a delayed `js/main.js`, as the verification baseline
  - [ ] apply the stored `eternalRestTheme` preference from an inline `<head>` script, in or beside `partials/disclosure-init.html`, that runs before the stylesheet
  - [ ] reuse the storage contract of `js/main.js` (key, version check, system fallback for missing, unreadable or other-version entries, `try`/`catch` around storage access), so the behavior described in `cookies.html` stays accurate
  - [ ] keep `npm run check:references` valid: it expects exactly one inline script in `partials/disclosure-init.html` and looks for that script on each built page
  - [ ] add one focused smoke test showing that a stored theme is applied without `js/main.js`, for example with the module request blocked
  - [ ] update the README architecture and data-persistence sections in both languages, including the note that a Content Security Policy must allow the inline head scripts
  - **Completion condition:** a page with a stored theme renders in that theme from the first paint, and `npm run lint`, `npm run build`, `npm run check:references` and `npm run test:smoke` pass.
  - **Priority:** Medium
  - **Source:** `daily-AUDIT.md` — P2-02

- [ ] **PH2-02 — Remove the inactive scroll-reveal mechanism**
  - [ ] remove the 29 `data-reveal` attributes from `index.html`, `about.html`, `services.html`, `guide.html` and `contact.html`
  - [ ] remove the reveal `IntersectionObserver` from `js/main.js`, keeping the `prefers-reduced-motion` query that the back-to-top scroll still uses
  - [ ] remove the unused `.reveal` rules from `css/utilities.css`
  - [ ] record the removal in `docs/CHANGELOG.md` under its entry policy, since the changelog lists scroll-triggered reveals as an added feature
  - **Completion condition:** no `data-reveal` attribute, reveal observer or `.reveal` rule remains, the five pages render unchanged, and `npm run lint`, `npm run build` and `npm run test:smoke` pass.
  - **Scope boundary:** a visible reveal animation would be a new design change requiring separate approval, with content kept visible without JavaScript and under reduced motion.
  - **Priority:** Low
  - **Source:** `daily-AUDIT.md` — P2-01

## Phase 3 — Documentation accuracy

**Goal:** Bring the README and code comments in line with the current images, footer links and project structure.

- [ ] **PH3-01 — Correct stale README and comment statements**
  - [ ] replace the statement that all graphics are inline SVG and that there are no photographs to convert with the current workflow: six PNG sources in `assets/src-images/`, converted by `npm run images:convert` into the committed AVIF and WebP hero images in `assets/images/` that six pages use
  - [ ] correct the statement that the social links remain placeholders; `partials/footer-marketing.html` links to the owner's profiles
  - [ ] correct both structure trees: drop the non-existent `assets/illustrations/` and add `assets/fonts/`, `assets/images/`, `assets/logos/`, `css/fonts.css` and the page stylesheets `css/pages/about.css`, `contact.css`, `guide.css` and `pricing.css`
  - [ ] update the spotlight comment in `js/main.js`, which names only the guide and contact pages although five pages use `data-spotlight`
  - [ ] keep the Polish and English sections equivalent
  - **Completion condition:** the README statements about images, social links and project structure, and the spotlight comment, match the repository in both languages.
  - **Priority:** Medium
  - **Source:** `daily-AUDIT.md` — P2-03

## Optional future improvements

- [ ] **O-01 — Add a Netlify Forms honeypot to the contact form**
  - **Value:** a markup-only honeypot field would reduce automated submissions reaching the author without adding scripts or third-party services.
  - **Scope boundary:** non-blocking, as no spam problem is evidenced; the exact request-body assertion in `tests/smoke.spec.js` would need the new field, and delivery can be confirmed only on a Netlify deployment.
  - **Source:** `daily-AUDIT.md` — extra quality improvements

- [ ] **O-02 — Run `Quality Checks` before changes reach `main`**
  - **Value:** lint, build, reference and smoke-test failures would surface on a feature branch or pull request instead of after landing on `main`.
  - **Scope boundary:** non-blocking; the current `push`-to-`main` and manual triggers in `.github/workflows/quality.yml` are a valid single-maintainer choice.
  - **Source:** `daily-AUDIT.md` — extra quality improvements

- [ ] **O-03 — Evaluate a native no-JavaScript submission path for the contact form**
  - **Value:** with `method="POST"` in place, the data-in-URL risk behind the `inert` baseline (`IMP-QUALITY-04`) no longer applies, so a validated native submission could replace the e-mail and telephone fallback.
  - **Scope boundary:** non-blocking; the current behavior is intentional and safe. A change needs its own validation design, updates to `README.md`, `terms.html` and `privacy.html`, which describe the inactive no-JavaScript form, and verification on a Netlify deployment.
  - **Source:** `daily-AUDIT.md` — extra quality improvements

- [ ] **O-04 — Establish a passing Prettier baseline**
  - **Value:** `npm run format:check` would pass and could then gate the `Quality Checks` workflow.
  - **Scope boundary:** non-blocking; a formatting-only change kept apart from functional work, with the `.prettierignore` exclusions unchanged and the README statement about the missing baseline updated.
  - **Source:** `README.md` formatting notes; `npm run format:check` reported 14 files on 2026-10-21
