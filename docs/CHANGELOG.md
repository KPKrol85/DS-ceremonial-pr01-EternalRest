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

- Added `cookies.html`, adapting the supplied nine-section Cookies Policy template to the project's actual browser-storage behavior: no application-set cookies, the `eternalRestTheme` theme preference in `localStorage` as the only storage entry, and no analytics, marketing, third-party storage or consent manager. The page reuses the shared legal-page styles, native section navigation and accessible return links. All page footers now link to the Cookies Policy, completing the Terms, Privacy and Cookies footer navigation, and the Terms and Privacy Policy now cross-reference it.
- Added `privacy.html`, adapting the supplied 14-section Privacy Policy template to the project's actual data behavior: direct e-mail correspondence, browser-local theme storage, the demonstration form including its no-JavaScript GET limitation, and technical hosting data. The page reuses the shared legal-page styles, now extended with reusable subsection headings and label/value fact lists, together with native section navigation and accessible return links. All page footers and the Terms now link to the Privacy Policy.
- Added `terms.html`, adapting the supplied 17-section Terms template to the demonstration project, with shared legal-page styling, native section navigation and accessible return links. All page footers now link to the Terms.
- Added six Polish-language pages covering the home page, services, pricing, company information, family guidance and contact, with shared CSS tokens and JavaScript interactions.
- Added light, dark and system theme modes with versioned preferences stored in `localStorage`.
- Added mobile navigation with synchronized ARIA state, focus transfer and restoration, Tab containment, Escape dismissal and scroll locking, alongside skip links and visible keyboard focus styles.
- Added ceremony-type filtering and expandable pricing-package details with synchronized `aria-expanded` state.
- Added FAQ accordions on the home and guide pages with synchronized panel visibility and `aria-expanded` state.
- Added a demonstration contact form with contact-method selection, non-empty-field validation, associated error messages and a focused completion message; submission resets the form locally without sending or storing an enquiry on a server.
- Added scroll-triggered reveals and a back-to-top control, with reduced-motion handling for reveals, CSS transitions and scrolling.
- Added shared primary and secondary button variants for page-level actions, separating interactive controls from the header-specific CTA and static badge labels while preserving existing interaction and ARIA contracts.
- Added a responsive comparison layout to the pricing page: the three packages stack on small screens and sit side by side from 760 px, a filtered package keeps its column width, expanding one package's details no longer resizes the others, detail toggles size to their labels and the ceremony filter uses a constrained width on larger screens. Filtering, disclosure and ARIA behavior are unchanged.
- Added a shared, tokenized heading scale: display and heading line-height tokens replace the inherited body line-height on hero, section, card, service, footer and brand headings, and a display size token replaces the hero's literal size. Hero titles grow from a smaller mobile size at 760 and 1024 px and section titles at 760 px, both with balanced wrapping. Legal headings use the same tokens with unchanged sizes; font families, weights, colors and heading levels are unchanged.
- Added visible disclosure and validation states: FAQ accordion triggers and pricing detail toggles show a decorative collapsed/expanded indicator driven by their existing `aria-expanded` state, accordion questions use a heavier weight with a hover and keyboard-focus surface tint, and form controls marked invalid by the existing validation show an error-colored border until they are corrected and resubmitted. Accessible names, markup, JavaScript and ARIA behavior are unchanged.
- Added theme-aware elevation and alternate-section surfaces: the shared small, medium and large shadow tokens now resolve to dark-theme values in explicit and system dark modes instead of keeping the light-theme shadow color, and cards, process steps, testimonials and service items inside alternate sections use the page background with the small shadow, so they stay distinct from the section surface in light and dark themes. Blocks on default sections, palette values, markup and JavaScript are unchanged.

### Build and Tooling

- Added a root `.gitattributes` that keeps text files LF in the repository and in working trees on every platform, overriding `core.autocrlf` in line with Prettier's default, and marks the PNG, JPEG, WebP and AVIF formats used by image conversion as binary. Files already checked out keep their line endings until Git rewrites them.
- Added a read-only `npm run format:check` command and a `.prettierignore` that keeps generated output, dependencies and the lockfile, the license, legal pages and archived records outside the Prettier formatting scope.
- Derived Vite MPA entry points automatically from root-level HTML files.
- Declared the supported Node.js and npm runtime range for reproducible project setup.
- Added `cookies.html` as the ninth explicit Vite MPA entry.
- Added `privacy.html` as the eighth explicit Vite MPA entry.
- Standardized public HTML routes to English technical filenames while preserving Polish interface content and updating internal navigation, Vite entries and current-state documentation.
- Added `terms.html` as the seventh explicit Vite MPA entry and `css/pages/legal.css` to the canonical stylesheet import chain.
- Added `package-lock.json` to pin the npm dependency tree for installation with `npm ci`.
- **Breaking:** Replaced the separate `clean` and `build:*` commands with `npm run build` using Vite, and switched preview to Vite. The pipeline defines six HTML entry points, processes canonical CSS and ES-module JavaScript, and uses relative asset paths in generated `dist/`; obsolete build tools were removed.
- Added a separate Sharp-based image conversion command for PNG/JPEG sources, producing WebP and AVIF files outside the build step.
- Added ESLint checks for `js/**/*.js` and a Prettier formatting command.

### Documentation

- Replaced the initial README with Polish and English documentation of source ownership, setup, build and preview workflows, browser-local state and implementation limitations, including the demonstration-only form and unverified hosted preview.
- Added the bilingual KP_Code proprietary project license in `LICENSE.md` and aligned package author and license metadata with it.
- Defined a working-document lifecycle in `AGENTS.md`: active plans, audits and improvement reports remain at the repository root, completed records move to category-specific archives, and improvement items use one concise verified completion status. The lifecycle governs document state without prescribing Git or agent execution workflows.
- Simplified project documentation: removed the redundant project context document, reduced agent instructions to stable guardrails, and made README.md the primary human-facing project reference with the public demo link.
