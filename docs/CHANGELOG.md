# Changelog

All significant changes to Eternal Rest are documented in this file.

This is the canonical record of significant completed changes. Evaluate each implementation task for a changelog update and record verified changes when its scope permits. If the task excludes this file, report any required update without editing it. Omit routine cleanup, pending work and unsupported claims.

## Entry policy

A change is significant when a future maintainer or the project owner would reasonably need to know that one of the following changed:

- user-visible behavior, including meaningful UI, UX, or public content changes;
- accessibility behavior or accessibility contracts;
- build behavior, build guards, or npm scripts;
- test infrastructure or verification tooling;
- the dependency set;
- deployment or hosting workflow;
- PWA, service-worker, cache, or offline behavior;
- architecture, sources of truth, or important project maintenance contracts.

Judge by impact, not by file count: a visually small change is recorded when it changes user-visible or accessibility behavior, and editing a file is not by itself a reason for an entry.

Not recorded: improvement-report status updates and archiving, commit-only or tracking-document bookkeeping, temporary verification probes, minor wording corrections in internal documentation, and isolated cosmetic or implementation details, such as a single spacing or border correction, that do not change behavior, accessibility, or a shared component contract.

When an implementation task is defined, apply this policy and state `Changelog: yes` or `Changelog: no`. Add an entry only within an approved task marked `Changelog: yes`; this policy does not authorize changelog edits outside that scope.

## [Unreleased]

### Changed

- Clarified the site's demonstration status and contact attribution: the marketing footer's brand text now identifies Eternal Rest as a KP_Code Digital Studio portfolio concept with illustrative services, prices and history, and both footers head the contact block “Kontakt z autorem”, mark the office address and 24/7 availability as illustrative and attribute only the telephone and e-mail to the author. The header call action (“Telefon autora”), the home hero actions (“Zapytaj o projekt”, “Tel. autora: +48 533 537 091”), the shared closing on five pages (“Zapytaj o ten projekt lub podobną stronę”, with “Napisz wiadomość” replacing the funeral-service buttons), the contact page's masthead title and office panel, the guide lead, which drops its 24/7 contact invitation, and the home and about descriptions no longer present the author's channels or the fictional business as a real round-the-clock funeral home. Links, layouts, the form, the legal documents and the in-world service narrative are unchanged.
- Unified the pricing page's control chevrons: the package filter's native dropdown arrow is replaced by the disclosure buttons' accent chevron, drawn in CSS over the still-native `<select>` (browsers without `appearance` support keep the native arrow), and the three “Pokaż szczegóły” chevrons are slightly smaller with 4px more space before them. Select semantics, keyboard use, the filter's height, `aria-expanded` rotation, forced-colors visibility and the FAQ chevrons are unchanged; the selected option now starts at the shared field padding without Chromium's extra inner inset.
- Restyled the guide page FAQ as an editorial list matching the homepage: the homepage-only FAQ rules became the reusable `.accordion--editorial` modifier (applied to both accordions), giving hairline separators, transparent questions without the rounded box, a 44rem column with 36rem answers, a hover underline and an unclipped focus outline. Questions, answers, homepage appearance, accordion behavior, ARIA state and the no-JavaScript fallback are unchanged.
- Connected the contact form to Netlify Forms as `kontakt-kp-code`: valid entries are now sent as a URL-encoded POST to `/`, the success message and reset appear only after an HTTP 2xx response, failures show a focused `role="alert"` message and keep the entered values, and repeated submits are ignored while pending (`aria-disabled`, `aria-busy`). The page, homepage FAQ, Terms, Privacy Policy, Cookies Policy and README now state that real enquiries go to KP_Code Digital Studio rather than the fictional funeral home; the 30-minute callback promise and funeral-specific topics were removed. Two mocked Playwright tests cover success, duplicate prevention, network failure and HTTP 500. The light-theme success color was darkened to meet 4.5:1 text contrast, and focused submission messages now scroll clear of the floating back-to-top control on narrow screens. Validation, `inert` and the no-JavaScript fallback are unchanged; the Privacy Policy now states an Article 6(1)(f) GDPR basis and correspondence-based retention for form entries, modelled on the e-mail provisions and approved by the project owner.
- Removed the redundant “Preferowany kontakt” field from the contact form, including its “Telefon”/“E-mail” toggle group, the hidden `preferred` input, the button-group synchronization script and the now-unused `.form__choices` and selected-state rules. The remaining fields, required-field rules, validation messages, error focus handling and the no-JavaScript fallback are unchanged.
- Removed the duplicated telephone and office-address facts row from the contact page masthead and added a small, muted two-line “Dane kontaktowe autora projektu / KP_Code Digital Studio.” attribution below the office panel's call button, matching the footer notice; the now-unused `.page-masthead__facts` rules were removed from the shared layout styles. The form, office details, contact links and call action are unchanged.
- Replaced the homepage FAQ content with four informational questions about commissioning a similar site, the project's demonstrational nature, adapting it to another industry and the contact form not sending messages; the section is now headed “Warto wiedzieć” (eyebrow “Informacje”), the answer about the form links to `kontakt@kp-code.pl`, and the closing guide button became a discreet “Kontakt z autorem projektu” mailto link. The accordion markup, `data-accordion` behavior, unique panel IDs, ARIA state synchronization and no-JavaScript readability are unchanged.

- Added one `noindex, follow` robots meta directive to each of the nine pages and removed the sitemap declaration from `robots.txt`, preserving crawler access, the demonstration sitemap, public access and social metadata; documented the policy in Polish and English.

### Added

- Added a decorative still-life photograph of a leather folder with a card and pen beside a lily to the services page masthead, served as a prioritized 1448 × 1086 AVIF with a WebP fallback generated by `npm run images:convert`: stacked below the text on mobile, then a text-led two-column layout from 760 px, always uncropped at its own 4:3 proportions so the window light, bronze pot, lily and vase stay in view. It uses the shared `.spotlight` component at the about, contact and pricing photographs' softer strength, with new styles in `css/pages/services.css`; touch input, reduced motion and the no-JavaScript view keep the still photograph. The masthead text, service catalogue, anchors and closing section are unchanged.
- Added a decorative still-life photograph of a closed book beneath a hanging tag to the pricing page masthead, served as a prioritized 1536 × 1024 AVIF with a WebP fallback generated by `npm run images:convert`: shown whole below the text on mobile, then a text-led two-column layout from 760 px (4:3 crop trimmed mostly from the empty wall on the right, whole 3:2 photograph again from 1024 px). It uses the shared `.spotlight` component at the about and contact photographs' softer strength, with new styles in `css/pages/pricing.css`; touch input, reduced motion and the no-JavaScript view keep the still photograph. The masthead text, filter, packages and disclosure controls are unchanged.
- Added a decorative photograph of the team reviewing documents at a table to the about page masthead, served as a prioritized 688 × 960 AVIF with a WebP fallback generated by `npm run images:convert`: stacked below the text in a 4:3 crop on mobile, then a text-led two-column layout from 760 px (1:1 crop, 4:3 from 1024 px), framed so all three faces, the folder and the hands stay in view. It uses the shared `.spotlight` component at the contact photograph's softer strength, with new styles in `css/pages/about.css`; touch input, reduced motion and the no-JavaScript view keep the still photograph. The masthead text, the other about sections and the guide and contact heroes are unchanged.
- Added a decorative photograph of a conversation at a table to the contact page masthead, served as a prioritized 848 × 896 AVIF with a WebP fallback generated by `npm run images:convert`: stacked below the text in a 4:3 crop on mobile, then beside it from 760 px on the same tracks as the form and office panel (1:1 crop, 4:3 from 1024 px). It reuses the guide hero's spotlight, now the shared `.spotlight` component with per-photograph pointer and frame state, cancellation of a pending frame on leave, and a softer `--spotlight-strength` on the contact photograph; touch input, reduced motion and the no-JavaScript view keep the still photograph. The guide hero looks and behaves as before; the masthead text, form and office panel are unchanged.
- Added a decorative still-life photograph of a writing desk to the guide page masthead, served as a prioritized 768 × 912 AVIF with a WebP fallback generated by `npm run images:convert`: stacked below the text in a 4:3 crop on mobile, then a text-led two-column layout from 760 px (1:1 crop, 5:4 from 1024 px). On fine hovering pointers with motion allowed, a soft warm radial light follows the mouse over the photograph and fades out on leave, throttled to one update per frame; touch input, reduced motion and the no-JavaScript view keep the still photograph. Heading, lead, FAQ content and behavior are unchanged.
- Linked the marketing footer's GitHub, Facebook, Instagram and X icons to the project owner's profiles, replacing the `#` placeholders; they open in a new tab with `rel="noopener noreferrer"`, and each accessible name now announces the new tab. Icons, order and styling are unchanged.
- Added the muted secondary notice "Dane kontaktowe autora projektu KP_Code Digital Studio." below the contact details in both footer variants, identifying them as the project author's contact information; it wraps within the contact column without changing the footer layout.
- Added the envelope from `assets/icons/email.svg` as a decorative inline `currentColor` icon to the e-mail link in both footers, the contact page's office details and the standalone e-mail details on the three legal pages (header metadata and contact paragraphs). E-mail links there follow the telephone link pattern with a faint 1px underline and icon hover feedback; e-mail addresses inside sentences and the form fallback keep their existing styling, and the shared focus outline is preserved.
- Added the header's inline telephone icon (decorative, `currentColor`) to the home hero call button, the shared closing on five pages as a ringed lockup beside the label and number, the contact page's masthead, office details and call button, and the phone link in both footers. Telephone numbers now keep a faint 1px underline that stays 1px on hover while the icon carries the hover feedback; email, navigation and legal links are unchanged, and the shared focus outline is preserved.
- Integrated the existing favicons and corrected manifest icon paths across all nine pages; added page-specific Open Graph and Twitter/X cards using the shared 1200 × 630 JPEG, crawl-permissive robots.txt and a nine-page production sitemap including legal pages. Verified the build, reference checks, generated metadata, asset copies, manifest and sitemap XML; updated Polish and English SEO documentation.
- Added four local Chromium smoke tests with `@playwright/test` for mobile navigation, FAQ, pricing filters and contact-form preferences/validation; `npm run test:smoke` builds production output and manages Vite Preview on a dedicated strict port, with setup documented in Polish and English. GitHub Actions integration remains reserved for P3-B.
- Named the preferred contact button group and distinguished its selected option with an underline and theme-aware border, including forced colors, preserving keyboard behavior and hidden-field synchronization.
- Redesigned the shared header as a single desktop row from 1152 px with one call link and a segmented light/dark/system theme control, a labelled two-column menu on tablet and a full-screen menu on mobile; the menu now renders closed from the first paint on all nine pages, removing the mobile layout shift on load (CLS about 0.59 at 390 px in throttled Chromium tests), and in system mode the theme toggle now switches away from the displayed theme.
- Recomposed both footer variants with a single-column mobile order, content-width columns at equal gutters on tablet and desktop, tighter spacing, the "Nawigacja" heading and the copyright "© 2026 KP_Code Digital Studio | Wszelkie prawa zastrzeżone."; the back-to-top control is now an icon-only 44 px disc that rests beside the final footer row without covering it.
- Redesigned the home hero as a cinematic photograph of a misty tree-lined road, with the statement and both actions over its dark side in every theme, served as a prioritized AVIF with a WebP fallback; the supporting note and facts moved to a quiet band beneath it.
- Moved the marketing footer's social links into a centred row beneath the columns, with brand-colored GitHub, Facebook, Instagram and X icons replacing the Facebook, Instagram and LinkedIn glyphs; destinations remain placeholders.
- Replaced the Eternal Horizon logo with the new monochrome symbol in the header and both footer variants, shown dark in the light theme and light in the dark theme, including system mode.
- Redesigned the contact page's office panel as a content-height column with ruled contact rows, 24/7 availability and an illustrative schematic labelled "Schemat poglądowy" in place of the map placeholder.
- Added a shared editorial closing with the 24/7 availability statement and phone to the home, about, services, pricing and guide pages, absorbing each page's final contact action.
- Added Eternal Horizon line motifs to the home hero and quotation, replacing the quotation hairline.
- Replaced the ER monogram with the Eternal Horizon SVG logo in the header and both footer variants.
- Redesigned pricing packages as an editorial list with tabular Manrope price figures and responsive columns.
- Converted the services page into a numbered editorial index with responsive columns and hairline dividers.
- Introduced shared editorial mastheads on the about, services, pricing, contact and guide pages.
- Replaced home testimonials with a labelled demonstration quotation and simplified the FAQ into an editorial list.
- Redesigned the home process section as a numbered editorial timeline with connected steps.
- Redesigned home trust statements as ruled rows and services as a featured entry with supporting links.
- Reworked the home hero around the main statement, primary actions and a restrained supporting aside.
- Replaced filled badges and hero fact tiles with muted labels and hairline rules.
- Introduced open `.card--editorial` blocks across the home, about, guide and services pages.
- Improved accent text contrast for primary actions and section eyebrows to meet WCAG AA.
- Established an editorial typography hierarchy with Playfair Display, shared font-weight tokens and responsive heading scales.
- Self-hosted variable Playfair Display and Manrope WOFF2 fonts with their licenses.
- Consolidated theme colors and shadows using CSS `light-dark()`, eliminating duplicated dark palettes and adopting the Baseline 2024 browser requirement.
- Refined shared headers, navigation, footer layouts and back-to-top controls across all nine pages, improving responsiveness and keyboard accessibility.
- Added `cookies.html` with project-specific cookie and browser-storage information, shared legal styling and footer navigation.
- Added `privacy.html` with project-specific privacy information, shared legal styling and footer navigation.
- Added `terms.html` with project-specific terms, shared legal styling and footer navigation.
- Added six Polish-language marketing pages covering services, pricing, company information, guidance and contact.
- Added light, dark and system themes with versioned preferences stored in `localStorage`.
- Added accessible mobile navigation, keyboard focus management, skip links and Escape handling.
- Added ceremony-type filtering and expandable pricing details with synchronized ARIA states.
- Added a polite live status announcement for pricing-filter result counts.
- Added FAQ accordions on the home and guide pages.
- Added a demonstration contact form with contact preferences, validation and local success feedback; no server submission or enquiry storage.
- Added contact-form error recovery: a failed submission focuses the first empty required field below the sticky header, and each field's error clears as soon as it holds a value.
- Added native email-format validation and contextual error feedback to the contact form.
- Prevented contact-form data from entering the URL without JavaScript, with a safe fallback notice.
- Added visible and programmatic required-field indicators to the contact form, with a leading instruction and the message field relabelled "Treść wiadomości".
- Made the e-mail address and phone number in both footer variants and the contact-page "Nasze biuro" card actionable `mailto:` and `tel:` links with visible hover and focus states.
- Linked footer and home-page service entries to anchored sections on the services page.
- Kept FAQ answers and pricing details accessible without JavaScript through shared disclosure fallbacks.
- Added scroll-triggered reveals and a back-to-top control with reduced-motion support.
- Added reusable primary and secondary button variants, separating interactive actions from static badges and the header CTA.
- Added a responsive three-column pricing comparison layout from 760 px, with independently expanding cards and a constrained filter.
- Added shared typography tokens and responsive heading scales across marketing and legal pages.
- Added visual expand/collapse indicators and validation error states based on existing ARIA attributes.
- Added theme-aware shadows and contrasting content surfaces within alternate sections.

### Build and Tooling

- Integrated the four existing Chromium smoke tests into the read-only `Quality Checks` job after lint, build and reference validation: install with `npx playwright install --with-deps chromium`, then run `npx playwright test` against the existing production build; manual Netlify deployment is unchanged.
- Added `npm run check:references` to validate HTML IDs, ARIA references, labels and internal links.
- Extended `check:references` to detect disclosure initializer and application module mismatches.
- Added build-time HTML partials for shared page chrome, with Vite integration, page-aware navigation states and development reload support.
- Added `.gitattributes` rules for consistent LF line endings and binary image handling.
- Added read-only `npm run format:check` and `.prettierignore` to control formatting scope.
- Automated Vite MPA entry discovery from root-level HTML files.
- Declared supported Node.js and npm versions for project setup.
- Registered `cookies.html`, `privacy.html` and `terms.html` as Vite MPA entries before automatic page discovery was introduced.
- Standardized public HTML filenames in English while preserving Polish interface content.
- Added shared legal-page styles through the canonical CSS import chain.
- Added `package-lock.json` for reproducible dependency installation with `npm ci`.
- **Breaking:** Replaced the legacy build commands with a Vite-based `npm run build` pipeline and Vite preview, including relative production asset paths.
- Added a separate Sharp-based WebP/AVIF image conversion command.
- Added ESLint checks and Prettier formatting support.

### Documentation

- Added bilingual README documentation covering project architecture, setup, workflows and implementation limitations.
- Added the bilingual KP_Code proprietary license and aligned package metadata.
- Introduced improvement-report lifecycle rules, subsequently superseded by the simplified documentation model.
- Simplified project documentation by removing the redundant context document, retaining stable agent guardrails and making README the primary project reference.
