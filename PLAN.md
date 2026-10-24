# Eternal Rest — Development Plan

**Last reviewed:** 2026-10-24
**Project type:** Polish-language static multi-page demonstration website for a fictional funeral-home brand (Vite MPA with build-time HTML partials, layered CSS with custom properties and one vanilla ES module), with a Netlify Forms contact form that sends enquiries to the project author
**Plan status:** Active

## Planning principles

- This plan is built from the final technical audit in `AUDIT.md` dated 2026-10-24, with each open finding re-checked against current sources. The previous plan is completed and archived in `docs/archive/plans/PLAN-2026-10-24.md`; earlier improvement cycles are archived in `docs/archive/improvements/`. Their completed work is not repeated here.
- A main item is checked only when its required subtasks are done and its completion condition has been verified. Optional subtasks never block completion.
- Edit canonical sources only: the root `*.html` pages, `partials/`, `css/`, `js/`, `assets/`, `public/`, `scripts/` and `tests/`. `dist/` is generated and never edited.
- Public content stays in Polish, and the Polish and English README sections change together.
- Significant completed changes are recorded in `docs/CHANGELOG.md` under its entry policy.

## Current priorities

## Phase 1 — Mobile navigation accessibility

**Goal:** Make the open mobile menu announce an accurate control name and keep covered page content out of assistive-technology navigation.

- [x] **PH1-01 — Correct the open-state semantics of the mobile menu**
  - [x] give the menu button in `partials/site-header.html` an accessible name that is accurate in both states: either update the static `aria-label="Otwórz menu"` on open and close in `js/main.js`, or replace it with a state-neutral name that relies on `aria-expanded`
  - [x] while the mobile menu is open, make content outside the header panel (header brand link, `main`, footer, back-to-top) unavailable to assistive technology, for example with `inert`
  - [x] restore that content on close, on Escape, on an outside click and when `syncMenuState` switches to the desktop layout at `min-width: 1152px`
  - [x] preserve the existing contracts: `aria-expanded` / `aria-hidden` synchronization, focus move to the first link, the Tab cycle that includes the menu button, Escape closing with focus return, and the no-JavaScript and `js-pending` fallback states
  - [x] extend the existing mobile-navigation test in `tests/smoke.spec.js` to assert the open-state button name and that content outside the menu is inert while open and restored after close
  - **Completion condition:** with the mobile menu open, the button name describes closing (or is state-neutral) and content outside the menu is not reachable by screen-reader navigation; after closing or resizing to 1152 px and above the original state is restored, and `npm run lint`, `npm run build` and `npm run test:smoke` pass.
  - **Changelog:** yes — accessibility behavior changes.
  - **Priority:** Medium
  - **Source:** `AUDIT.md` — P2-01

## Phase 2 — Documentation accuracy

**Goal:** Make the README project-structure section a complete map of the tracked repository.

- [x] **PH2-01 — Complete the README project-structure trees**
  - [x] add the tracked top-level entries missing from both trees: `public/` (favicons, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `images/og.jpg`), `tests/`, `playwright.config.js`, `.github/workflows/`, `docs/` and `THIRD-PARTY-NOTICES.md`
  - [x] keep the existing comment style and equivalent content in the Polish (`Struktura projektu`) and English (`Project Structure`) sections
  - [x] decide whether the agent instruction files (`AGENTS.md`, `CLAUDE.md`) and `AUDIT.md` are listed or intentionally omitted, and apply the same choice to both trees
  - **Completion condition:** every tracked top-level file or directory from `git ls-files`, apart from intentionally omitted entries, appears in both trees, and `npm run format:check` passes.
  - **Changelog:** no — internal documentation correction.
  - **Priority:** Low
  - **Source:** `AUDIT.md` — P2-02

## Phase 3 — Release verification

**Goal:** Close the verification gaps recorded in the final audit before the project is treated as final.

- [x] **PH3-01 — Run the project's own quality checks with dependencies installed**
  - [x] install dependencies from the lockfile with `npm ci` on Node.js 22.x
  - [x] run `npm run lint`, `npm run format:check`, `npm run build`, `npm run check:references` against the real `dist/` and `npm run test:smoke`
  - [x] confirm that hashed asset names in the built pages still satisfy the `appModule` path contract checked by `scripts/check-references.js`
  - [x] record any failure as a separate plan item instead of fixing it within this task
  - **Completion condition:** all five commands pass on the current head, locally or in the `Quality Checks` workflow.
  - **Depends on:** `PH1-01`, `PH2-01`
  - **Priority:** Medium
  - **Source:** `AUDIT.md` — verification limitations and readiness conclusion

- [x] **PH3-02 — Confirm Netlify Forms delivery on the deployed site**
  - [x] submit `kontakt-kp-code` on the deployment named in `package.json` (`homepage`) with JavaScript enabled and confirm that the submission reaches the Netlify form dashboard or notification
  - [x] repeat with JavaScript disabled to confirm the native submission path
  - [x] confirm that the `bot-field` honeypot is recognized by the deployed form
  - **Completion condition:** both submission paths are delivered on the deployed site.
  - **Scope boundary:** requires access to the Netlify deployment and form dashboard; it cannot be verified from the repository alone.
  - **Depends on:** `PH3-01`
  - **Priority:** Medium
  - **Source:** `AUDIT.md` — verification limitations; archived plan completion summary

## Optional future improvements

- [x] **O-01 — Offer width-appropriate hero image candidates**
  - **Status:** COMPLETED — implemented and verified.
  - **Result:** Added 768/1152 px variants for `hero` and 480/960 px variants for `hero-services` and `hero-pricing`, in AVIF and WebP, with layout-aware `srcset`/`sizes` and unchanged full-size assets, fallbacks and image contracts.
  - **Verification:** Two `npm run images:convert -- --responsive-only` runs produced 12 byte-identical variants with correct dimensions and aspect ratios, 29.4–85.5% smaller than their full-size counterparts; existing assets remained unchanged. Build and reference checks and 54 focused Chromium scenarios passed across dev/preview, responsive breakpoints, DPR 1–3 and WebP fallback; visual comparisons confirmed preserved layout, cropping and appearance within each environment. LCP and loading time were not measured.
  - **Scope boundary:** non-blocking; current image sizes are moderate and no loading problem was measured.
  - **Source:** `AUDIT.md` — extra quality improvements

- [ ] **O-02 — Extend smoke coverage to untested interactions**
  - **Value:** automated protection for the theme toggle and system-mode buttons, the pricing details toggle and the desktop resize resynchronization of the menu, which are currently checked only manually.
  - **Scope boundary:** non-blocking; an automated accessibility scanner would add a development dependency and needs separate justification.
  - **Source:** `AUDIT.md` — extra quality improvements

- [ ] **O-03 — Migrate linting from the ESLint 8 legacy configuration**
  - **Value:** keeps `npm run lint` runnable with supported ESLint releases by replacing `.eslintrc.cjs` with a flat configuration when dependencies are next updated.
  - **Scope boundary:** non-blocking; the pinned `eslint` `^8.57.0` and the CI workflow remain internally consistent. A dependency update needs its own approval.
  - **Source:** `AUDIT.md` — extra quality improvements
