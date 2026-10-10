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

- **Affected area:** ID-based contracts across the nine built pages: ARIA relationships, label associations, the skip link, legal-page section indexes and back links, and cross-page service anchors.
- **Evidence:** `js/main.js:202-214`, `js/main.js:247-253`, `js/main.js:270-281`; `partials/site-header.html:1`, `partials/site-header.html:11-21`; `partials/footer-marketing.html:51-66`; `partials/footer-legal.html:28-43`; `index.html:99`, `index.html:104`; `services.html:29-79`; `terms.html:67-173`, `privacy.html:64-65`, `cookies.html:60-61` and the `legal-section__back` links (e.g. `terms.html:248`); `.prettierignore:8-12`; `vite.config.js:28-55`; `package.json:12-20`.
- **Current implementation:** During this analysis, a temporary read-only script outside the repository found 204 ID references across the nine pages: 18 `aria-controls`, 5 `aria-describedby`, 43 `aria-labelledby`, 6 `label[for]`, 89 same-page fragment links and 43 cross-page fragment links. All of them currently resolve, and no page has a duplicate ID. Nothing in the repository checks these references:
  - The partial plugin validates only partial files and markers.
  - ESLint covers only JavaScript.
  - There are no tests.

  A broken reference fails silently. `getDisclosurePanel()` returns `null`, so the disclosure button does nothing. `setFieldError()` skips a missing message element, so a field gets `aria-invalid` with no text. A fragment link lands at the top of the target page. Of the 89 same-page links, 80 are in the three legal pages, which are maintained by hand and excluded from Prettier.
- **Proposed improvement:** Add a read-only Node.js script, using built-in modules only, that reads the built pages in `dist/`. It exits non-zero and lists page, attribute and missing ID when any of the following does not resolve to an ID on its target page: `aria-controls`, `aria-describedby`, `aria-labelledby`, `label[for]` or a project-internal fragment `href`. It also fails when a page contains a duplicate ID. Expose the script as an npm command.
- **Expected quality value:** The project's most widespread silent contract gets a repeatable check. It replaces part of the manual Chromium verification repeated in every completed improvement cycle. It also protects future edits to legal pages, partials and service anchors.
- **Implementation scope:** One new script in `scripts/` and one `package.json` script entry. Update the README script table and "Testing and Validation" sections in both languages, and add a `docs/CHANGELOG.md` entry under "Build and Tooling" (verification tooling). Reading `dist/` reuses Vite's own partial expansion instead of duplicating it. Bare `href="#"` placeholders are not fragment references and are out of scope. No new dependency and no change to HTML, CSS, `js/main.js` or `vite.config.js`. The check is not chained into `npm run build` unless separately approved.
- **Acceptance criteria:**
  - After `npm run build`, the command exits 0 on the current pages and reports how many references it checked.
  - Without `dist/`, it exits non-zero with a message to build first.
  - Temporary probes each make it exit non-zero and name the page, attribute and ID: a broken `aria-controls` target, a broken `aria-describedby` target, an unknown `services.html#…` fragment and a duplicated ID. The probes are reverted afterwards.
  - The script writes no files.
  - `npm run lint` and `npm run build` still pass.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Validate the contact form's e-mail format with the existing constraint validation

- **Affected area:** Contact form validation.
- **Evidence:** `contact.html:29`, `contact.html:44-56`; `js/main.js:270-281`, `js/main.js:282-291`, `js/main.js:292-313`; README lines 21 and 167; `terms.html:446-448`, `privacy.html:599-603`.
- **Current implementation:** The form uses `novalidate` and checks every `[data-required]` field with `!field.value.trim()`. The e-mail field is `type="email"` and `required`, but any non-empty value such as `jan` passes; the success message then appears and the form resets. The browser computes `validity.typeMismatch` for this field even under `novalidate`, but the script never reads it. Every error reads "To pole jest wymagane.", and the input listener clears an error as soon as the field holds any non-whitespace value. This matches the documented scope (README: "non-empty form fields"), so it is a validation boundary to strengthen, not a defect.
- **Proposed improvement:** When the e-mail field is non-empty but the browser reports a type mismatch, mark it invalid with its own Polish message, for example "Podaj poprawny adres e-mail.". During input, clear the error only once the value is both non-empty and valid.
- **Expected quality value:** The form catches the most common entry mistake in its only format-bearing field before the demo completes. It uses the browser's own e-mail rules, without a library or custom regex, and keeps the existing focus-first-invalid recovery.
- **Implementation scope:** The validation helpers in `js/main.js`, plus the README form description and feature bullet in both languages and a CHANGELOG entry. The legal pages describe validation generically and need no change. Preserve `novalidate`, the `[data-required]` hooks, `aria-invalid` and `aria-describedby` relationships, focus on the first invalid field, success-message focus and reset, and the "To pole jest wymagane." message for empty fields. Phone-number format and the other fields are out of scope.
- **Acceptance criteria:**
  - Submitting with `jan` as the e-mail and all other fields valid does the following: shows the format message under the e-mail field, sets `aria-invalid="true"`, focuses the field and keeps the success message hidden.
  - An empty e-mail still shows "To pole jest wymagane.".
  - While typing, `jan@` keeps the error and `jan@example.pl` clears it.
  - A fully valid submission still shows and focuses the success message and resets the form.
  - `npm run lint` passes.
  - Behavior is checked in a browser at 375 px and 1280 px.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-03 — Announce the pricing filter result to assistive technologies

- **Affected area:** Pricing filter on `pricing.html`.
- **Evidence:** `pricing.html:29-37`, `pricing.html:39`, `pricing.html:60`, `pricing.html:81`; `js/main.js:235-245`; `css/utilities.css:36-38`, `css/utilities.css:40-48`; `css/components.css:810-813`; `contact.html:120-129`.
- **Current implementation:** Changing the select toggles `.is-hidden` (`display: none !important`) on the package cards, which removes the non-matching cards from rendering and from the accessibility tree. Nothing reports how many packages remain. The only live region in the project is the contact form's success message. A screen-reader user who changes the filter gets no confirmation and has to move past the filter to discover what changed.
- **Proposed improvement:** Add a visually hidden polite status region next to the filter. On each filter change, update it with a short Polish summary of the visible packages, for example "Wyświetlane pakiety: 1 z 3".
- **Expected quality value:** Non-visual users get the immediate feedback that sighted users get from the layout change. The change reuses the existing `.sr-only` utility and the project's established `role="status"` pattern.
- **Implementation scope:** `pricing.html` and the pricing-filter handler in `js/main.js`, plus a CHANGELOG entry for the accessibility behavior. Place the region inside the `.pricing-filter` wrapper so that the existing no-JavaScript fallback hides it together with the filter. The region stays empty on page load so that nothing is announced on load. Preserve the filter values, `data-category` matching, `.is-hidden` behavior, package-detail disclosures and layout.
- **Acceptance criteria:**
  - On load, the region is present, empty and not visible.
  - Selecting each option sets the correct count: 3 of 3 for "Wszystkie pakiety" and 1 of 3 for each category.
  - The region is exposed as a polite status in the accessibility tree.
  - With JavaScript disabled, the filter and the region are both hidden.
  - Layout is unchanged at 375 px and 1280 px.
  - `npm run lint` and `npm run build` pass.
  - The spoken announcement is checked with a screen reader, or recorded as not tested. No conformance claim is made.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Prevent the no-JavaScript contact form submission from placing entered data in the URL

- **Affected area:** The contact form when `js/main.js` does not run, and the README and legal statements that describe this state.
- **Evidence:** `contact.html:29`; `contact.html:36`, `contact.html:49`, `contact.html:62`, `contact.html:90`, `contact.html:94`, `contact.html:108`; `js/main.js:292-293`; README lines 9 and 155; `privacy.html:344-361`, `privacy.html:761-766`; `terms.html:504-510`, `terms.html:666-670`.
- **Current implementation:** Submission is prevented only by the module's `submit` handler. The form has no `method` or `action`. Without JavaScript, or if the module fails, the browser sends a default GET request to `contact.html` with all six named fields in the query string: name, e-mail, phone, preferred contact, topic and message. README, the privacy policy and the terms document this as a known limitation and tell visitors not to use the form without JavaScript. That mitigation is text only, and visitors to the public demo URL may never read those documents.
- **Proposed improvement:** Keep the form from submitting until `js/main.js` has attached its handler. In the no-JavaScript state, show a short visible Polish notice that points to the existing phone and e-mail links. Neither the submit button nor implicit Enter-key submission may then send the fields while the script is not running.
- **Expected quality value:** This removes the only documented path by which entered personal data reaches the URL, browser history and hosting request logs, so privacy no longer depends on visitors reading the policy. The legal texts can then describe a simpler and safer behavior.
- **Implementation scope:**
  - Code: `contact.html`, the form setup in `js/main.js`, and CSS for the notice following the existing `.no-js` patterns.
  - Documentation: update the known-limitation passages in `privacy.html`, `terms.html` and README (both languages) so they describe the new behavior consistently, and add a CHANGELOG entry.
  - Preserve: all JavaScript-enabled form behavior, field names, labels, ARIA relationships, error recovery and the success message.
  - Avoid a visible flash of the notice during normal loading; `partials/disclosure-init.html` is the existing `js-pending` precedent.
  - No backend or form service.
- **Acceptance criteria:**
  - The following holds both with JavaScript disabled and with the `main.js` request blocked: clicking the submit button and pressing Enter in a text field leave the URL unchanged, with no query string, and the notice with working phone and e-mail links is visible.
  - With JavaScript enabled, validation, focus, the success message and reset behave as before at 375 px and 1280 px.
  - A normal load shows no visible flash of the notice.
  - README and the legal pages no longer describe a GET fallback that can no longer occur.
  - `npm run lint` and `npm run build` pass.
- **Impact:** Medium
- **Effort:** Medium

### IMP-QUALITY-05 — Guard the disclosure-fallback module-path contract against build naming drift

- **Affected area:** The no-JavaScript fallback for FAQ answers and package details on `index.html`, `guide.html` and `pricing.html`.
- **Evidence:** `partials/disclosure-init.html:10-16`, `partials/disclosure-init.html:18-32`; `css/components.css:802-822`; `index.html:11`, `guide.html:10`, `pricing.html:11`; `js/main.js:3`; `vite.config.js:89-98`; IMP-UX-05 in `docs/archive/improvements/IMPROVEMENTS-UX-2026-10-10.md`.
- **Current implementation:** The inline initializer adds `js-pending`, which keeps FAQ answers and package details hidden until `main.js` runs. It removes `js-pending`, restoring the readable fallback, only when a load or parse error comes from a URL matching a hard-coded pattern: `js/main.js` in development or `assets/main-[hash].js` in the build. The built file name comes from Vite and Rollup's default chunk naming, which the Vite config does not set and nothing checks. A future change could emit a different name, for example a renamed module, an additional page script, an output-naming option or a Vite upgrade. A failed module load would then no longer match, `js-pending` would stay, and the answers and package details would remain hidden behind buttons that do nothing. Normal loading is unaffected, so this regression stays invisible unless a module failure is simulated, as was done manually for IMP-UX-05.
- **Proposed improvement:** Add a post-build assertion that checks every built page containing the initializer. Its emitted module script `src` must resolve to a pathname that the initializer's pattern matches; otherwise the assertion fails and names the page and the emitted path.
- **Expected quality value:** A failure-mode contract that is hard to reproduce becomes an automatic check. This protects the content availability that IMP-UX-05 established.
- **Implementation scope:** A read-only check of `dist/`. If IMP-QUALITY-01 is implemented first, this is one more assertion in the same script and command; otherwise it is a standalone script with the same conventions. The expected pattern should come from the initializer itself, not from a second hard-coded copy, so the check cannot drift from it. Update the README "Testing and Validation" sections in both languages and add a CHANGELOG entry. No change to the initializer, CSS, `js/main.js` or `vite.config.js`, and no new dependency.
- **Acceptance criteria:**
  - After `npm run build`, the check passes for `index.html`, `guide.html` and `pricing.html` and reports the matched module path for each.
  - A temporary mismatch probe makes it fail and name the page and the unmatched path; the probe is reverted afterwards.
  - Pages without the initializer are skipped.
  - The check writes no files.
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
