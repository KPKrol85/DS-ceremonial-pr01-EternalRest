# Eternal Rest — UX Improvements

**Analysis date:** 2026-10-10
**Project type:** Static Polish-language multi-page demonstration website (Vite MPA, vanilla HTML/CSS/JavaScript, build-time HTML partials)
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Improvement overview

Eternal Rest has six marketing pages and three legal pages. They share a header, two footer variants and a back-to-top control through `partials/`. The main journeys are browsing services and packages, reading the FAQ and guide, and contacting the business by phone or through the demonstration form.

Several parts already work well: navigation orientation (`aria-current`, skip link, mobile menu focus handling), the legal-page tables of contents and return links, and synchronized disclosure states. The remaining opportunities are concentrated in a few places:

- The contact form is the only data-entry journey. It reveals its requirements late and leaves error recovery to the user.
- E-mail and phone details are displayed as plain text.
- Named service links land at the top of a six-item page.
- Content behind JavaScript disclosures disappears when the script does not run, unlike the navigation and legal pages, which already have no-JavaScript fallbacks.

## Proposed improvements

### IMP-UX-01 — Lead the user to the fields that need correction after a failed contact-form submission

- **Status:** COMPLETED — implemented and verified.
- **Result:** Improved contact-form error recovery with shared validation logic, automatic focus on the first invalid field and immediate clearing of corrected field errors. Added `scroll-margin-top` to prevent the sticky header from obscuring focused controls. Preserved existing validation rules, ARIA contracts and successful submission behavior.
- **Verification:** ESLint and focused Chromium checks at 375 px and 1280 px passed. Confirmed focus placement, error recovery, keyboard input, field visibility and successful submission. Existing Prettier differences remain unchanged. Smooth scrolling, screen readers, touch devices and other browser engines were not tested.
- **Impact:** High
- **Effort:** Small

### IMP-UX-02 — State the contact form's required fields before submission

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a Polish instruction before the first field ("Pola oznaczone gwiazdką (*) są wymagane."), a token-styled asterisk hidden from assistive technology in all five required labels, and native `required` attributes alongside the retained `novalidate`. Renamed the message label to "Treść wiadomości". Preserved the five `data-required` fields, the trimmed non-empty rule, the error message, ARIA relationships, IMP-UX-01 error recovery and successful submission behavior.
- **Verification:** ESLint and the production build passed. Focused Chromium checks confirmed the instruction, indicators, accessible names without the asterisk and the native `required` property on all five fields, field-level errors, focus on the first invalid field, immediate error clearing and successful submission with status focus and form reset. Indicators were checked at 375 px and 1280 px in light, dark and system themes without horizontal overflow. Existing Prettier differences remain unchanged. The computed accessibility-tree required flag, screen readers, touch devices and other browser engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-03 — Make the displayed e-mail address and phone number actionable

- **Status:** COMPLETED — implemented and verified.
- **Result:** Rendered the e-mail address and phone number in both footer partials and the "Nasze biuro" card as `mailto:kontakt@kp-code.pl` and `tel:+48533537091` links. The footer links reuse the existing `.footer__links a` styles; the card links use a new `.card__link` treatment with an accent underline, a stronger hover and `:focus-visible` state and an unbroken phone number. Preserved the visible values, the address and availability text, the "Kontakt — demonstracja" heading, the existing call buttons and the partial mechanism.
- **Verification:** ESLint and the production build passed, with partials resolved and both footer links present on all nine pages. Focused Chromium checks confirmed the link targets, unchanged visible text, keyboard focus order with visible focus outlines, hover states and readable link colors in light, dark and system themes, and no horizontal overflow of the footer or card at 375 px and 1280 px. Theme colors were read after completing transitions programmatically because the browser pane was hidden. `contact.html` and `css/components.css` already had Prettier differences; the new card markup follows the file's existing style. Opening mail or phone applications, screen readers, touch devices and other browser engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Link service references to the matching entry on the services page

- **Status:** COMPLETED — implemented and verified.
- **Result:** Gave the six `services-list__item` entries Polish-slug identifiers (`ceremonie-tradycyjne`, `pozegnania-swieckie`, `transport-i-logistyka`, `oprawa-florystyczna`, `wsparcie-formalne`, `opieka-po-ceremonii`) and pointed the four named service links in both footer partials and the "Ceremonie tradycyjne" and "Pożegnania świeckie" home-page cards at their entries. Added `scroll-margin-top` in `css/pages/services.css` following the legal-page offset pattern: 6rem, 8rem from 760 px and `var(--space-lg)` under `.no-js`, where the header is not sticky. Navigation uses native fragment scrolling without new JavaScript. Preserved the link texts, the main-navigation and footer "Usługi" links and page-level CTAs pointing at the page top, `aria-current`, the service content and layout, and reduced-motion scrolling.
- **Verification:** ESLint and the production build passed; all nine generated pages contain the four footer fragment links, each resolving to a unique identifier, with `aria-current="page"` unchanged. Focused Chromium checks at 375 px, 760 px and 1280 px confirmed that footer links from other pages and from `services.html` itself (same-document, without reload) and both home-page cards place the target heading 51–61 px below the sticky header, and that the main-navigation "Usługi" link opens the page top. Without JavaScript, checked on a build copy with the module script removed, targets land with the heading fully visible below the static header at 375 px and 1280 px. The two footer partials were kept Prettier-compliant; `index.html` and `services.html` already had Prettier differences. The browser pane was hidden, so final positions were measured after forcing a render; smooth-scroll animation and reduced-motion behavior were not observed (the reduced-motion rule was confirmed only in the built CSS). Screen readers, touch devices and other browser engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Keep FAQ answers and package details readable when JavaScript does not run

- **Affected journey:** Reading the FAQ on the home and guide pages, and package details and the filter on the pricing page, in the no-JavaScript fallback state.
- **Evidence:** Every page starts with `<html class="no-js">` (e.g. `index.html:2`), and `js/main.js:1-4` swaps the class. Existing no-JavaScript fallbacks keep navigation expanded in the page flow (`css/components.css:135-140, 305-311`) and adjust legal anchors (`css/pages/legal.css:227-230`); the README states that the legal tables of contents work without JavaScript. Disclosure content is hidden in markup at `index.html:191, 205`, `guide.html:38, 53, 68, 82` and `pricing.html:51, 72, 93`, and only `js/main.js:202-238` reveals it. The pricing filter (`pricing.html:28-36`) works only through `js/main.js:220-230`.
- **Current experience:** When JavaScript is disabled, blocked or fails to load, every FAQ answer and every package feature list stays hidden. Their triggers and the "Filtruj według rodzaju ceremonii" select are still displayed but do nothing. The guide page loses its primary content, while navigation and legal pages were deliberately designed to keep working.
- **Proposed improvement:** Extend the existing `no-js`/`js` progressive-enhancement convention to disclosures. Without JavaScript, answers and package details are shown, and controls that need JavaScript are not presented as operable. With JavaScript, the current collapsed initial state and behavior remain.
- **Expected user value:** The FAQ and pricing details stay available in the fallback state the project already supports for navigation and legal pages, without dead controls.
- **Implementation scope:** `.no-js` rules in `css/components.css`. Move disclosure-state initialization into `js/main.js` only if needed to keep trigger state consistent with visible content. Keep the `toggleDisclosure()` contract (`aria-controls`, `aria-expanded` and `hidden` synchronization), the `data-*` hooks, independent panels, the "Pokaż/Ukryj szczegóły" labels and the filter behavior with JavaScript. Do not replace the disclosures with native `<details>`. The form's no-JavaScript limitation is documented separately and stays outside this scope.
- **Acceptance criteria:**
  - With JavaScript disabled, all FAQ answers on `index.html` and `guide.html` and all three package feature lists on `pricing.html` are visible and present in the accessibility tree.
  - With JavaScript disabled, the pricing filter is not displayed, and no trigger presents a collapsed or expandable state for content that is already shown.
  - With JavaScript enabled, the initial collapsed state, toggling, `aria-expanded`/`hidden` synchronization, button labels and filtering behave as they do now.
  - A normal JavaScript-enabled page load does not show a visible expanded-to-collapsed jump of the disclosures.
  - `npm run lint` and `npm run build` pass.
- **Impact:** Medium
- **Effort:** Medium

## Selection summary

- **Relevance:** IMP-UX-01 and IMP-UX-02 improve the only data-entry journey. IMP-UX-03 removes friction from direct contact, IMP-UX-04 fixes link destinations in a navigation pattern repeated on every page, and IMP-UX-05 closes the largest gap in the project's existing no-JavaScript fallback.
- **Dependencies:** None of the proposals requires another.
  - IMP-UX-01 and IMP-UX-02 both edit the contact form and are easiest to implement one after the other.
  - IMP-UX-03 and IMP-UX-04 both edit the two footer partials; doing them in sequence avoids conflicting edits.
  - IMP-UX-05 is independent.
- **Scope:** Four Small proposals and one Medium proposal, each bounded to existing pages and conventions and verifiable with a focused browser check. The set suits a focused development backlog.
- **Deliberately excluded:** These observations are defects or owner decisions rather than optional improvements, so they are not proposed here.
  - **Theme toggle in system mode:** With a dark OS preference, the first click on the toggle labelled "Włącz jasny motyw" keeps the dark theme (`js/main.js:53-59`; verified in the browser).
  - **Back-to-top focus:** After use, focus stays on the back-to-top button while the button becomes `visibility: hidden` at the top of the page (`js/main.js:286-294`, `css/components.css:682-719`; the button was observed as `document.activeElement` while hidden).
  - **Demonstration form promises:** The success message "Skontaktujemy się z Państwem możliwie szybko." (`contact.html:115-124`) and the lead's 30-minute callback (`contact.html:25`) promise contact that the demonstration form cannot deliver. This limitation is stated only in `terms.html:659-663` and `privacy.html:338-342`.
  - **Still present from earlier reviews:**
    - The contact-method `aria-pressed` state has no visual differentiation, and the "Preferowany kontakt" label is not associated with its controls (`contact.html:66-87`).
    - White text on the dark-theme accent has insufficient contrast (`css/tokens.css:8-9`).
    - `storeTheme()` has no error handling (`js/main.js:26-31`).
    - Social links are placeholders with `href="#"` (`partials/footer-marketing.html:14-34`).

## Analysis limitations

- **Method:** Findings are based on source inspection plus checks in a Chromium-based browser pane. The checks ran against a production build written to a temporary directory outside the repository and served locally.
- **Hidden pane:** The pane document was hidden, so smooth-scroll animation could not be observed. Scroll-dependent states were reproduced with scripted scroll positions.
- **No-JavaScript behavior:** This was assessed from source, not by disabling JavaScript.
- **Not tested:** Screen readers, physical touch devices and other browser engines.
- **No user data:** The expected benefits are reasoned from the implemented behavior, not from usability data.
