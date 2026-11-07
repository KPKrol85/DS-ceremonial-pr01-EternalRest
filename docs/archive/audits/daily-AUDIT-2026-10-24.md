# Eternal Rest — Audit Completion Record

**Project:** Eternal Rest — Polish-language Vite MPA demonstration website for a fictional funeral-home brand, with HTML partials, CSS custom properties, a vanilla ES module and Netlify Forms enquiries to the project author
**Audit date:** 2026-10-21 (original static review)
**Completion date:** 2026-10-24 (completion reconciliation)
**Status:** COMPLETED — five findings and three optional improvements closed, with verification limitations retained below.
**Scope:** Static repository review, followed by reconciliation against the archived plan, relevant sources, tests and local checks; the follow-up was not a new full-site audit.

## Historical assessment (2026-10-21)

The architecture and source ownership suited the static demonstration scope, with guarded progressive enhancement and proportionate verification. No runtime, build or accessibility blockers were found in source. The main risks were the oversized shared logo and inconsistent disclosure of fictional business facts beside the author's real contact details, followed by inactive reveal code and documentation drift.

Historical strengths included:

- Build-time shared chrome, automatically discovered root HTML entries and nine-page coverage; Vite rejected missing, invalid or nested partial markers and generated `aria-current="page"` from `data-partial-current`.
- Disclosure recovery after application-module load or parse errors, CSS fallbacks for JavaScript-dependent controls and a build-output guard reading the initializer's canonical `appModule` expression.
- Menu ARIA synchronization, focus movement/restoration, Tab cycling and Escape closing; synchronized disclosures; form errors linked through `aria-describedby`, first-invalid-field focus, pending `aria-busy`/`aria-disabled` states and focused status/alert feedback.
- Theme storage reads and writes protected by `try/catch`, with a versioned payload and `auto` fallback.
- Matching title/description metadata, page-specific Open Graph URLs and one robots directive, H1 and module script on each of nine pages; image dimensions matched source files through read-only `sharp` checks, and variable WOFF2 fonts were self-hosted with `font-display: swap`.
- Six mocked Playwright smoke tests at the original review, ten at completion, and read-only CI running lint, build, reference and smoke checks; external marketing-footer links used `noopener noreferrer` and accessible new-tab notices.

The original inactive `inert` form baseline was replaced under O-03 below.

## P0 — Critical risks

None detected.

## P1 — Important issues

- [x] **[P1-01] Shared logo SVG embeds 254 KB of raster data and metadata** — Replaced `assets/logos/logo.svg` with a 1,575-byte, 512 × 512 vector containing three filled paths and no raster/C2PA data, preserving references, theme recoloring and inset trim; removed the unused PNG. Chromium checks at 320, 390 and 1440 px in light/dark/system themes, build and reference checks passed on 2026-10-22. The optional favicon was reduced from 92,765 to 1,613 bytes on 2026-10-24; both SVGs were confirmed free of embedded images/base64, without measuring load-time impact.
- [x] **[P1-02] Marketing pages present fictional business facts without demonstration disclosure** — Added consistent footer disclosure across all nine pages while retaining the about/services/pricing narrative; attributed the genuine phone, e-mail and owner-confirmed Tarnów address to KP_Code Digital Studio, labelled 24/7 availability illustrative, and corrected the header call label and home/about descriptions. Chromium checks of all nine built pages at 320–1440 px in light/dark themes, build and reference checks passed on 2026-10-22; source reconciliation confirmed the footer, header and descriptions on 2026-10-24.

## P2 — Minor refinements

- [x] **[P2-01] Scroll-reveal mechanism has no styles and does nothing visible** — Removed 29 `data-reveal` attributes, the reveal observer and unused CSS while preserving back-to-top visibility and reduced-motion scrolling, and recorded the removal in the changelog. Source inspection, lint and smoke tests passed on 2026-10-24; unchanged rendering of the five pages rests on the plan's completion record and was not visually rechecked in the follow-up.
- [x] **[P2-02] Stored theme is applied only after the module script runs** — Applied stored version-1 light/dark preferences before CSS through the read-only, `try/catch`-protected inline initializer, retaining system fallback and module-owned controls/writes; README documented the CSP requirement. The blocked-module smoke test and reference checks passed on 2026-10-24; the test asserted the theme attribute without a paint trace.
- [x] **[P2-03] README and comments describe superseded asset and footer state** — Corrected both README languages for six PNG sources converted to committed AVIF/WebP heroes used by six pages, genuine social links and repository trees, and updated the spotlight comment to cover all five `data-spotlight` pages. Static comparison against the repository passed on 2026-10-24; this documentation check had no automated coverage.

## Extra quality improvements

- [x] **Spam protection for the live contact form** (plan O-01) — Added `data-netlify-honeypot="bot-field"` and a hidden, markup-only field to `kontakt-kp-code`; the mocked submission test confirmed its configuration and empty POST value on 2026-10-24. Verification was local; deployed filtering and delivery were not verified.
- [x] **Run quality checks before merge** (plan O-02) — Added pull requests targeting `main` to `.github/workflows/quality.yml`, retaining push/manual triggers, read-only permissions and the check sequence. Configuration inspection confirmed implementation and recent push runs succeeded; no pull-request-triggered run was observed, and the workflow was not a required merge check.
- [x] **Reassess the inert no-JavaScript form baseline** (plan O-03) — Replaced `inert` with native constraint validation and URL-encoded POST submission without JavaScript or after module failure, setting `novalidate` only after handler registration; aligned the fallback notice, README and legal copy. Disabled-JavaScript, failed-module and custom e-mail error smoke tests passed on 2026-10-24; deployed native submission and delivery remained unverified.

## Historical verification

**Original audit, 2026-10-21:** Inspected project/agent documentation, page sources and partials, CSS/JavaScript, public assets, build/lint/format configuration, CI, scripts, smoke tests and the quality-improvement record. Read-only Git status/history searches and Node scripts checked metadata, actual image dimensions and logo composition; lint passed without warnings. No previous `daily-AUDIT.md` existed.

Build, reference, smoke and formatting checks were not run in the original audit; rebuilding `dist/` for reference validation was prohibited. Runtime/browser behavior, theme paint timing, logo load-time impact, public deployment, Netlify delivery, assistive-technology announcements and formal WCAG conformance were not verified.

**Completion reconciliation, 2026-10-24:** Reviewed the archived plan, changelog, task history, relevant sources and tests. Lint, `npm run test:smoke` (build plus 10/10 Playwright tests), reference checks across nine pages and `npm run format:check` passed; GitHub run history showed successful recent `Quality Checks` push runs on `main`.

## Completion

**COMPLETED — 5/5 findings and 3/3 optional improvements closed.** P1 findings map to PH1-02 and PH1-01; P2 findings map to PH2-02, PH2-01 and PH3-01 in the archived plan. Optional items map to O-01–O-03; the plan's O-04 formatting baseline was separate from this audit's findings.

**Original senior rating: 8/10 (2026-10-21), retained.** Clear source ownership, guarded progressive enhancement, accessible interaction patterns and proportionate CI supported the assessment; the oversized logo, inconsistent demonstration disclosure and maintenance drift prevented a higher rating. The cited issues were closed by 2026-10-24, without assigning a new rating.

Netlify delivery/spam filtering and a pull-request-triggered workflow run remained unverified at completion. Logo load-time impact, assistive-technology announcements and formal WCAG conformance were also unverified; the theme test established attribute state without recording paint timing.

## References

- [Completed development plan](../plans/PLAN-2026-10-24.md)
- [Quality improvement record](../improvements/IMPROVEMENTS-QUALITY-2026-10-10.md)
- [Changelog](../../CHANGELOG.md)
- [Project README](../../../README.md)
