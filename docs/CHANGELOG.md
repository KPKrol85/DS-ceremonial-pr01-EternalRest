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

### Added

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
