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

- **Affected journey:** Contact page — filling in the form.
- **Evidence:** `data-required` on all five fields at `contact.html:37, 49, 61, 90, 106`. Labels at `contact.html:31, 43, 55, 89, 100` carry no required indication, and the message field is labelled "Dodatkowe informacje" (`contact.html:100`). The only form hint is "Nie pobieramy żadnych danych wrażliwych." (`contact.html:113`). Validation targets `[data-required]` (`js/main.js:261-277`). Browser check: no field exposes `required` or `aria-required`, and the form contains no required-field instruction.
- **Current experience:** All five fields are mandatory, but neither the visible labels nor the accessibility tree says so. Users find out only from the errors shown after submitting. The label "Dodatkowe informacje" ("additional information") reads as optional, yet an empty message blocks submission.
- **Proposed improvement:** Make each field's required status visible and programmatic before any interaction. Add a short form-level instruction and a required indicator in each label, expose a required state to assistive technology, and word the message label so it does not suggest the field is optional.
- **Expected user value:** Users know what the form expects before they start, which avoids a round trip through validation errors. Screen-reader users hear the required state as they reach each field.
- **Implementation scope:** Form markup in `contact.html` (labels, one instruction element and a required state such as `aria-required="true"` while keeping `novalidate`). Add a small indicator style in `css/components.css` if needed. Keep the set of required fields, the validation rule and messages, the `data-required` hooks and the `aria-describedby` identifiers. Making the message optional instead would be a separate owner decision.
- **Acceptance criteria:**
  - Before any interaction, a Polish instruction placed before the first field states how required fields are marked.
  - Every `data-required` field shows a visible required indicator in its label and exposes a required state in the accessibility tree.
  - The message field's label no longer implies that the field is optional.
  - Validation behavior is unchanged: the same fields, the same non-empty rule and the same messages.
  - The indicator is legible in light, dark and system themes at 375 px and 1280 px.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-03 — Make the displayed e-mail address and phone number actionable

- **Affected journey:** Contacting directly from the footer on all nine pages and from the "Nasze biuro" card on the contact page.
- **Evidence:** Plain-text e-mail and phone in `partials/footer-marketing.html:57-65` (lines `60-61`), `partials/footer-legal.html:34-41` (lines `37-38`) and `contact.html:129`. The same values are already links elsewhere: `tel:+48533537091` in `partials/site-header.html:75`, `index.html:29` and `contact.html:146`, and `mailto:kontakt@kp-code.pl` in the legal pages. The terms describe e-mail as the real way to reach the operator (`terms.html:682-687`). Browser check: `contact.html` contains no `mailto:` link. At 375×812 the header call button is inside the collapsed menu panel, and the only in-page call button starts about 1,727 px down the page.
- **Current experience:** The address and number are visible but can only be copied by hand. E-mail cannot be started from any marketing page. The number in the office card is not tappable; a separate call button sits below the map placeholder.
- **Proposed improvement:** Render the footer and office-card e-mail and phone values as `mailto:` and `tel:` links, using exactly the values already linked elsewhere in the project.
- **Expected user value:** On touch devices, a call or e-mail starts with a single tap. The e-mail channel, which the terms identify as the actual contact path, becomes reachable from every page.
- **Implementation scope:** Both footer partials and `contact.html:129`. Reuse the existing `.footer__links a` styles (`css/components.css:612-627`) and an existing link treatment for the card. Keep the values themselves, the "Kontakt — demonstracja" heading in the legal footer, the address and availability lines as plain text, the existing call buttons and the partial mechanism. Introduce no new contact data.
- **Acceptance criteria:**
  - On all nine built pages, the footer e-mail is a `mailto:kontakt@kp-code.pl` link and the footer phone is a `tel:+48533537091` link, with unchanged visible text.
  - On `contact.html`, the office-card e-mail and phone are links with the same targets.
  - The new links have visible hover and `:focus-visible` states consistent with existing footer links in light and dark themes.
  - The footer and card layouts do not overflow at 375 px or 1280 px.
  - `npm run build` succeeds with all partials resolved.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Link service references to the matching entry on the services page

- **Affected journey:** Moving from a named service to its description, from the footer "Usługi" column on every page and from the home-page service cards.
- **Evidence:** In `partials/footer-marketing.html:48-56` and `partials/footer-legal.html:25-33`, four named services all use `href="services.html"`. The "Ceremonie tradycyjne" and "Pożegnania świeckie" cards link to `services.html` (`index.html:98, 103`). The six `services-list__item` entries in `services.html:28-89` have no `id`. The sticky header is defined in `css/components.css:17-28`, and an existing anchor-offset pattern is in `css/pages/legal.css:1-4, 118-122, 227-230, 238-241`. Browser check at 375×812: "Transport i logistyka" and "Oprawa florystyczna" start at about 934 px and 1,157 px, below the first viewport.
- **Current experience:** Choosing "Oprawa florystyczna" in the footer opens the services page at the top, or reloads it at the top when the user is already there. The user then has to find the entry among six items.
- **Proposed improvement:** Give each service entry a stable fragment identifier and point the named service links at their entries. Apply an anchor offset so the entry heading is not covered by the sticky header.
- **Expected user value:** A named service link lands on the content its label promises, which removes a search step on mobile, where the list is a single long column.
- **Implementation scope:** `id` attributes in `services.html` (Polish slugs, consistent with the legal pages), the two footer partials, `index.html:98, 103`, and a `scroll-margin-top` rule in `css/pages/services.css` that follows the legal-page offset pattern, including the no-JavaScript case. Keep the link text, the main navigation "Usługi" link and page-level CTAs pointing at the page itself, the `data-partial-current`/`aria-current` behavior, and reduced-motion scrolling.
- **Acceptance criteria:**
  - On all nine pages, each of the four footer service links opens `services.html` with the matching entry's heading visible directly below the header at 375 px and 1280 px, with and without JavaScript. The two home-page service cards behave the same way.
  - Selecting a footer service link while already on `services.html` scrolls to the matching entry.
  - Fragment identifiers are unique. The main navigation "Usługi" link still opens the page top, and `services.html` still marks it with `aria-current="page"`.
  - `npm run build` succeeds.
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
