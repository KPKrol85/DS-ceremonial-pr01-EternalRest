# Eternal Rest — Quality Improvements

**Analysis date:** 2026-10-10
**Completed:** 2026-10-10
**Status:** COMPLETED — all five selected improvements implemented and verified.
**Scope:** Project-wide quality improvements.

## Overview

Five quality improvements were completed across Eternal Rest, covering build validation, contact-form input validation, accessibility feedback and privacy-safe behavior without JavaScript.

Two dependency-free regression checks were introduced through the existing project tooling. Three frontend improvements strengthened form validation, pricing-filter announcements and contact-form safety.

The changes preserved existing functionality, accessibility contracts, responsive behavior and light/dark/system theme support.

## Completed improvements

### IMP-QUALITY-01 — Verify ID references and fragment links in the built pages with a dependency-free check

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added the read-only `scripts/check-references.js` checker, exposed as `npm run check:references`. It validates duplicate IDs, ARIA references, `label[for]` associations and internal fragment links in built HTML pages. Errors identify the affected page, line and reference. No dependencies were added.
- **Verification:** Build, lint, Node syntax and reference checks passed (9 pages, 204 references). Negative probes for missing targets, duplicate IDs and missing `dist/` correctly failed with diagnostics. The checker uses targeted HTML pattern matching rather than a full parser.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Validate the contact form's e-mail format with the existing constraint validation

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added native e-mail format validation using `validity.typeMismatch`, with separate Polish messages for empty and malformed values. Errors update during input and clear when corrected. Existing required-field handling, ARIA relationships, focus management and successful submission remain unchanged.
- **Verification:** Lint, build and focused Chromium checks at 375 px and 1280 px passed. Verified invalid and valid e-mail input, error recovery, focus behavior and form reset. Other browser engines and screen readers were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-03 — Announce the pricing filter result to assistive technologies

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a visually hidden, polite `role="status"` region to the pricing filter. Each filter change announces the visible package count, such as "Wyświetlane pakiety: 1 z 3". The region remains empty on load and is hidden with the filter when JavaScript is unavailable.
- **Verification:** Lint, build, reference checks and focused Chromium tests at 375 px and 1280 px passed. Verified correct counts, accessibility-tree exposure, unchanged layout, package disclosures and no-JavaScript fallback. Spoken announcements were not tested with a screen reader.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Prevent the no-JavaScript contact form submission from placing entered data in the URL

- **Status:** COMPLETED — implemented and verified.
- **Result:** Protected the contact form with native `inert`, removed only after its JavaScript submission handler is registered. Without JavaScript, the form remains inactive and displays alternative e-mail and telephone links. The existing initializer prevents notice flicker, while README and legal documents describe the updated behavior.
- **Verification:** Lint, build, reference checks and Chrome tests at 375 px and 1280 px passed. Verified disabled JavaScript, blocked module loading, unchanged URL, no GET submission, working fallback links and preserved validation. A negative control without `inert` confirmed detection of the original GET leak. Other browser engines and external link handlers were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-QUALITY-05 — Guard the disclosure-fallback module-path contract against build naming drift

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extended `npm run check:references` to verify built application module paths against the `appModule` expression read directly from `partials/disclosure-init.html`. Applicable pages are discovered automatically, and mismatches produce actionable diagnostics. The checker remains read-only and dependency-free.
- **Verification:** Build, lint, Node syntax and reference checks passed (9 pages, 204 references). Module paths matched on `index.html`, `guide.html`, `pricing.html` and `contact.html`; five other pages were correctly skipped. Negative probes for an incompatible module path and an unreadable expression exited with code 1. Runtime module failures were not tested in the browser.
- **Impact:** Low
- **Effort:** Small

## Excluded defects

The original quality review identified additional issues outside the approved improvement scope:

- **Theme storage:** `storeTheme()` lacks error handling for failed `localStorage` writes.
- **System theme toggle:** The first toggle under a dark system preference may produce no visible change.
- **Contact-method controls:** The "Preferowany kontakt" label lacks a programmatic association with its button group.
- **Social links:** Some footer links remain placeholders using `href="#"`.
- **Scroll reveals:** The `[data-reveal]` mechanism adds `.is-visible` without corresponding reveal styles.
- **Theme preference validation:** Additional validation of stored theme modes was considered but not selected.

These findings were excluded from the selected quality improvements. Their current status requires separate verification before any future implementation.

## Verification limitations

The initial review relied on static source inspection. Each selected improvement was subsequently implemented and verified using the checks documented above.

The repository now includes repeatable, dependency-free build checks, but no automated unit-test or browser-test suite was added.

Browser verification was primarily performed in Chromium/Chrome. Other browser engines, physical touch devices and real screen-reader announcements were not comprehensively tested.

The module-path guard checks built output statically and does not replace runtime failure testing. No additional tests were performed solely for this document's standardization.
