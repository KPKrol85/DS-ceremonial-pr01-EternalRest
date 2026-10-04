# Changelog

All significant changes to Eternal Rest are documented in this file.

This is the canonical record of significant completed changes. Evaluate each implementation task for a changelog update and record verified changes when its scope permits. If the task excludes this file, report any required update without editing it. Omit routine cleanup, pending work and unsupported claims.

## [Unreleased]

### Added

- Added six Polish-language pages covering the home page, services, pricing, company information, family guidance and contact, with shared CSS tokens and JavaScript interactions.
- Added light, dark and system theme modes with versioned preferences stored in `localStorage`.
- Added mobile navigation with synchronized ARIA state, focus transfer and restoration, Tab containment, Escape dismissal and scroll locking, alongside skip links and visible keyboard focus styles.
- Added ceremony-type filtering and expandable pricing-package details with synchronized `aria-expanded` state.
- Added FAQ accordions on the home and guide pages with synchronized panel visibility and `aria-expanded` state.
- Added a demonstration contact form with contact-method selection, non-empty-field validation, associated error messages and a focused completion message; submission resets the form locally without sending or storing an enquiry on a server.
- Added scroll-triggered reveals and a back-to-top control, with reduced-motion handling for reveals, CSS transitions and scrolling.

### Build and Tooling

- Added `package-lock.json` to pin the npm dependency tree for installation with `npm ci`.
- **Breaking:** Replaced the separate `clean` and `build:*` commands with `npm run build` using Vite, and switched preview to Vite. The pipeline defines six HTML entry points, processes canonical CSS and ES-module JavaScript, and uses relative asset paths in generated `dist/`; obsolete build tools were removed.
- Added a separate Sharp-based image conversion command for PNG/JPEG sources, producing WebP and AVIF files outside the build step.
- Added ESLint checks for `js/**/*.js` and a Prettier formatting command.

### Documentation

- Replaced the initial README with Polish and English documentation of source ownership, setup, build and preview workflows, browser-local state and implementation limitations, including the demonstration-only form and unverified hosted preview.
- Added the bilingual KP_Code proprietary project license in `LICENSE.md` and aligned package author and license metadata with it.
