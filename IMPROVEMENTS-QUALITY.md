# Eternal Rest — Quality Improvements

**Analysis date:** 2026-10-10
**Project type:** Static, Polish-language multi-page demonstration website: nine root HTML pages, vanilla CSS and one ES-module script, built as a Vite MPA with build-time HTML partials
**Analysis mode:** Evidence-based quality improvement review
**Focus:** Project-wide quality

## Improvement overview

Eternal Rest has a small, deliberately scoped runtime. `js/main.js` attaches theme, navigation, disclosure, pricing-filter and contact-form behavior to `data-*` hooks. A local plugin in `vite.config.js` expands shared partials at build time. Several safeguards are already in place:

- The partial plugin fails the build when a partial or marker is invalid.
- Disclosure handling tolerates a missing panel.
- Reading the stored theme is wrapped in `try/catch` and checks a schema version.
- FAQ answers and package details have a no-JavaScript fallback whose behavior was verified when it was implemented.

The main weakness is verification. The repository has no automated tests (README, "Testing and Validation"), and ESLint covers only `js/**/*.js`. The behavior checks recorded in the archived improvement reports were one-off Chromium sessions that left no reusable check behind. Several important contracts fail silently: a broken ID reference leaves a disabled-looking interaction or a misplaced jump, not an error. The selected set has two parts:

- Two dependency-free regression checks for silent cross-file contracts (01, 05).
- Three small source-level changes covering contact-form input validation, pricing-filter status communication and the no-JavaScript state of the contact form (02, 03, 04).

**Excluded defects.** The following problems appear in the current source and were already listed as excluded defects in archived improvement reports. They belong in an audit or a dedicated fix task and are not proposed here:

- `storeTheme()` writes to `localStorage` without error handling (`js/main.js:26-31`). A throwing write stops the click handler before `applyTheme()` runs.
- In system mode with a dark system preference, the first theme-toggle click selects `dark` and produces no visible change (`js/main.js:52-59`).
- The "Preferowany kontakt" label is not associated with its button group (`contact.html:71-89`).
- The social links are placeholders with `href="#"` (`partials/footer-marketing.html:14-28`).

**Additional observation.** No `[data-reveal]` element carries the `.reveal` class, and no stylesheet targets `[data-reveal]`. As a result, the IntersectionObserver in `js/main.js:181-200` adds `.is-visible` with no visual effect, although `docs/CHANGELOG.md` lists scroll-triggered reveals. This is a technical or defect matter, not a quality proposal.

## Proposed improvements

### IMP-QUALITY-01 — Verify ID references and fragment links in the built pages with a dependency-free check

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `scripts/check-references.js`, a read-only checker using only built-in Node.js modules, exposed as `npm run check:references` and not chained into `npm run build`. It reads the root-level HTML pages in `dist/` and fails on duplicate IDs within a page and on unresolved `aria-controls`, `aria-describedby` and `aria-labelledby` IDs, `label[for]`, same-page `href="#id"` and cross-page internal fragment links such as `services.html#id`; external URLs, `mailto:`, `tel:` and bare `href="#"` are skipped. Each failure names the page, line, attribute and ID.
- **Verification:** `npm run build`, `npm run check:references` (exit 0; 9 pages, 204 references), `node --check` and `npm run lint` passed. Probes on temporary copies of the built pages (a missing `aria-controls` target, a missing `aria-describedby` target, an unknown `services.html#…` fragment and a duplicated ID) each exited 1 and named the page, attribute and ID, and a missing `dist/` exited 1 with an instruction to build first. Limitation: attributes are read with a narrow pattern match suited to the generated markup rather than a general HTML parser, and the probes edited built output, not source files.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Validate the contact form's e-mail format with the existing constraint validation

- **Status:** COMPLETED — implemented and verified.
- **Result:** `js/main.js` now derives each required field's message from one shared check: an empty value shows "To pole jest wymagane.", and a non-empty `type="email"` value with `validity.typeMismatch` shows "Podaj poprawny adres e-mail.". The input handler re-evaluates only fields already marked invalid, so the e-mail error updates while typing and clears only for a valid address. `novalidate`, `[data-required]`, the `aria-invalid` and `aria-describedby` relationships, first-invalid-field focus, success-message focus and reset are unchanged.
- **Verification:** `npm run lint` and `npm run build` passed. In the built preview at 375 px and 1280 px, submitting `jan` showed the format error with `aria-invalid="true"`, focused the e-mail field and kept the success message hidden; `jan@` kept the error, `jan@example.pl` cleared it, a cleared invalid e-mail and an empty e-mail showed the required message, the other fields kept their focus and immediate clearing, and a valid submission focused the success message and reset the form. Limitation: Chromium only; screen readers and other engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-03 — Announce the pricing filter result to assistive technologies

- **Status:** COMPLETED — implemented and verified.
- **Result:** `pricing.html` now has an initially empty `<p class="sr-only" role="status" aria-live="polite" data-pricing-status>` inside the `.pricing-filter` wrapper, directly after the select, so the existing no-JavaScript rule hides it with the filter without new CSS. On each filter change, `js/main.js` keeps the existing `data-category` matching and `.is-hidden` toggling, then counts the cards without `.is-hidden` and sets `textContent` to "Wyświetlane pakiety: X z Y", where Y is the size of the package-card collection. Focus, option values and the package-detail disclosures are unchanged.
- **Verification:** `npm run lint`, `npm run build` and `npm run check:references` passed. In the built preview in Chromium at 1280 px and 375 px, the region was empty and clipped to 1 × 1 px on load, every option produced the expected count (3 z 3, or 1 z 3 with only the matching card shown), the accessibility tree exposed it as a status with `aria-live="polite"`, the filter, card-grid and page geometry were identical with and without the region, and a package-detail disclosure still expanded and collapsed. With all scripts stripped and with a failed `main.js` load, the filter wrapper was `display: none` and the region had no rendered box. Limitation: no screen reader was available, so the spoken announcement was not tested; JavaScript-disabled states were emulated in Chromium rather than by a browser setting, and no conformance claim is made.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Prevent the no-JavaScript contact form submission from placing entered data in the URL

- **Status:** COMPLETED — implemented and verified.
- **Result:** The form in `contact.html` carries the native `inert` attribute, and `js/main.js` sets `form.inert = false` only after the `submit` handler with `preventDefault()` is attached, then hides the fallback notice. A Polish notice with the existing `mailto:` and `tel:` links sits outside the form in the same grid column; `contact.html` now includes `partials/disclosure-init.html`, and `.js-pending` hides the notice during normal loading. Field names, labels, `data-*` hooks, ARIA relationships, validation and success behavior are unchanged, and README, `privacy.html` and `terms.html` describe the new behavior.
- **Verification:** On the built site via `vite preview`, headless Chrome over CDP with script execution disabled and, separately, with the `main.js` request blocked: the form stayed inert, clicking the submit button and pressing Enter in text fields left the URL unchanged with no query-string request, the notice was visible and its links were focusable and hit-testable; a control run with `inert` removed did produce the GET query string. With JavaScript at 375 px and 1280 px, the notice stayed hidden while `main.js` was held back, and required-field and e-mail format errors, `aria-invalid`, error recovery, focus, success focus and reset behaved as before without navigation; `npm run lint`, `npm run build` and `npm run check:references` passed. Other browser engines, screen readers and real `mailto:`/`tel:` handler launches were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-QUALITY-05 — Guard the disclosure-fallback module-path contract against build naming drift

- **Status:** COMPLETED — implemented and verified.
- **Result:** `scripts/check-references.js` gained a second assertion within the same read-only, dependency-free `npm run check:references`. It extracts the `const appModule = /…/;` literal from the inline script in `partials/disclosure-init.html` with a pattern match and compiles it with `new RegExp` without executing any code, failing with a diagnostic when exactly one declaration cannot be found or compiled. Applicable pages are discovered in `dist/` as those whose inline script matches the partial apart from whitespace; a changed copy mentioning `appModule` is an error, other pages are listed as skipped, and no applicable page at all fails. Each applicable page must have exactly one `<script type="module" src>`, whose `src` is resolved with `URL` against the page and whose same-origin pathname is tested against the extracted expression. The existing ID-reference checks, missing-build handling and diagnostics are unchanged, and failures in either category exit 1. README (both languages) and CHANGELOG describe the check.
- **Verification:** `npm run build`, `npm run check:references` (exit 0; 9 pages, 204 ID references unchanged; `contact.html`, `guide.html`, `index.html` and `pricing.html` matched `/assets/main-CamwmBZw.js`; `about.html`, `cookies.html`, `privacy.html`, `services.html` and `terms.html` skipped), `node --check scripts/check-references.js`, `npm run lint` and Prettier on the script passed. A probe on a temporary scratch copy of the script, partial and built pages, with the `pricing.html` module renamed to `./assets/app-CamwmBZw.js`, exited 1 and reported `pricing.html:45`, the `src`, the unmatched path `/assets/app-CamwmBZw.js` and the expression; a second probe replacing the literal with `new RegExp(` exited 1 with the extraction diagnostic. The copy was removed, and the normal check passed again. Limitation: pathnames are resolved against a placeholder site root, the development `js/main.js` path and a real module failure in a browser are not exercised, and markup is read with the checker's existing narrow pattern matching rather than a full HTML parser.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The project has no automated tests, and several important contracts fail silently. IMP-QUALITY-01 and IMP-QUALITY-05 therefore add lasting, dependency-free regression protection where a mistake would otherwise go unnoticed. IMP-QUALITY-02, IMP-QUALITY-03 and IMP-QUALITY-04 make small source-level changes to existing features that strengthen input validation, accessibility status communication and privacy-safe degradation.

- **Quality areas:** verification quality (01, 05), input validation (02), accessibility status communication (03), privacy and no-JavaScript resilience (04).
- **Dependencies:**
  - IMP-QUALITY-05 is simplest after IMP-QUALITY-01 because it can share that script, but it does not require it.
  - IMP-QUALITY-02 and IMP-QUALITY-04 both change the contact-form script and the README form description, so they should be implemented one after the other.
  - Once IMP-QUALITY-01 exists, it can verify the references added by IMP-QUALITY-03 and IMP-QUALITY-04.
  - All other proposals can be implemented independently.
- **Scope:** four Small proposals and one Medium. IMP-QUALITY-04 is the largest because it also requires consistent legal-text updates. Together they suit roughly one focused working day as a candidate backlog, without a completion guarantee.
- **Considered but not selected:** checking the stored theme `mode` against `auto`, `light` and `dark` (`js/main.js:17-20`). Invalid values can arise only from external edits to storage, so it has less value than the selected set. It is best handled together with the excluded `storeTheme()` defect.

## Analysis limitations

- The analysis used static source inspection only. `node_modules` is not installed and installing was out of scope, so `npm run lint`, `npm run build`, `npm run format:check` and browser checks were not run.
- The reference counts in IMP-QUALITY-01 come from a temporary script outside the repository that approximated partial expansion with a simple marker substitution. It confirms current integrity but is not a project check.
- The emitted module name `assets/main-[hash].js` comes from the initializer's comment and the archived IMP-UX-05 verification, not from a fresh build.
- Whether implicit Enter-key submission happens depends on the final markup, so IMP-QUALITY-04 requires browser verification rather than assuming the outcome.
- Screen readers, other browser engines and touch devices were not assessed. Archived excluded defects other than those listed in the overview were not re-verified.
