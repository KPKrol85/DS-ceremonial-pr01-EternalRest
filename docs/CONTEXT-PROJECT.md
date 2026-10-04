# Eternal Rest — Project Context

**Project type:** Polish-language static multi-page website
**Context status:** Active
**Last reviewed:** 2026-10-04

## Project identity

Eternal Rest is a KP_Code Digital Studio frontend presenting funeral-home services, pricing packages, company information, family guidance and a demonstration contact form. The nine pages are `index.html`, `services.html`, `pricing.html`, `about.html`, `guide.html`, `contact.html`, `terms.html`, `privacy.html` and `cookies.html`.

## Project intent

The repository supports local portfolio and technical review under the proprietary terms in `LICENSE.md`. Preserve its Polish content, shared visual language and inspectable frontend implementation. Service descriptions and contact promises in page copy do not establish operational services or an enquiry-processing system.

## Technology stack

- Semantic HTML, plain CSS with custom properties, Grid and Flexbox, and Vanilla JavaScript loaded as an ES module; no frontend framework or runtime package dependencies.
- Node.js and npm for tooling, with dependency resolution recorded in `package-lock.json`.
- Vite 5 for development, multi-page builds and preview; PostCSS with Autoprefixer via `postcss.config.cjs`.
- ESLint 8 with `eslint:recommended` and Prettier 3; Sharp and fast-glob for the separate image conversion script.
- Browser APIs include `matchMedia`, `localStorage`, `IntersectionObserver` and `requestAnimationFrame`.

## Architecture

`vite.config.js` sets `appType: "mpa"` and explicitly lists all nine HTML entry points. Canonical HTML filenames and routes use English technical names; public-facing content remains Polish. Navigation uses relative `.html` links and normal document loads. Each page maintains its own header, navigation and footer; there is no shared-template generator or client-side router.

All pages load `css/main.css` and `js/main.js`. The script runs a single immediately invoked function, selects elements through `data-*` hooks and conditionally attaches page-specific interactions. It owns theme controls, navigation, scroll effects, accordions, pricing filters/details and the form demonstration. There is no application server, database or remote API integration.

## Canonical source ownership

- Root HTML owns page content, prices, metadata, inline SVG and repeated site chrome.
- `css/main.css` owns stylesheet import order: tokens, base, layout, components, utilities, then home, services and legal styles. Imported CSS files are maintained source.
- `css/pages/legal.css` owns the reusable BEM legal-page components, text measure, section index, subsection headings, label/value fact lists, anchor offsets and return links. `terms.html` (17-section Terms), `privacy.html` (14-section Privacy Policy) and `cookies.html` (9-section Cookies Policy) share these styles as the canonical shared legal stylesheet; there is no page-specific legal stylesheet, and legal navigation uses native anchors without JavaScript.
- `js/main.js` owns browser behavior and the theme storage contract.
- `vite.config.js` owns production entry points and relative asset paths; `package.json` owns commands, and `postcss.config.cjs` owns CSS post-processing.
- `scripts/convert-images.js` owns raster conversion from `assets/src-images/` into generated `assets/images/` files.
- `dist/` is generated deployment output, ignored by Git and not tracked. Edit source and rebuild; do not edit production bundles or HTML directly.

## Project structure

```text
index.html, services.html, pricing.html, about.html, guide.html, contact.html, terms.html, privacy.html, cookies.html
css/
  main.css, tokens.css, base.css, layout.css, components.css, utilities.css
  pages/home.css, pages/services.css, pages/legal.css
js/main.js
assets/
  icons/, illustrations/, src-images/
scripts/convert-images.js
vite.config.js
postcss.config.cjs
.eslintrc.cjs
package.json, package-lock.json
README.md
docs/CHANGELOG.md
LICENSE.md
```

## Development conventions

- Reuse BEM-style classes such as `site-header__panel` and `site-header--compact`, `is-*` state classes and `data-*` behavior hooks. Preserve the link between hook attributes, panel IDs and ARIA controls.
- Reuse `css/tokens.css` for colors, typography, spacing, radii and transitions. Explicit themes set `data-theme` on `html` to `light` or `dark`; system mode removes the attribute and follows `prefers-color-scheme`.
- Layout starts with small-screen rules and adds `min-width` breakpoints at 480, 760 and 1024 pixels. Keep the navigation's JavaScript media query aligned with its CSS breakpoint at 760 pixels.
- Shared markup changes must be applied consistently across the nine maintained HTML files. New pages require an explicit Vite build entry as well as navigation updates.

## Quality contracts

- Preserve Polish document language, page-specific titles/descriptions, semantic landmarks, skip links and visible keyboard focus. Metadata belongs to each source HTML page.
- Preserve navigation ARIA synchronization, focus transfer/restoration, Tab containment, Escape dismissal, scroll locking and desktop-state synchronization.
- Keep accordion and pricing-detail `aria-expanded` values synchronized with panel visibility. Preserve form labels, associated errors, `aria-invalid` and the focusable live completion message.
- Retain system/light/dark theme behavior and reduced-motion handling for transitions, reveals and scrolling. Preserve the `.no-js` navigation fallback; this does not establish complete no-JavaScript support for interactive content.
- These are implementation contracts, not claims of accessibility compliance or verified browser compatibility.

## Data and state

Content, service categories and pricing are embedded in HTML. Theme preferences are stored under `localStorage` key `eternalRestTheme` as `{ "version": 1, "mode": "auto" }`, with `light` and `dark` as the other UI modes. Missing, unreadable or differently versioned stored data defaults to system mode.

The key is written only when the theme toggle or the system-mode button is used; choosing system mode overwrites it with `auto` rather than removing it, and no code path deletes it. It has no expiry and stays until overwritten or cleared with the browser's site data. `eternalRestTheme` is the only browser storage the application uses: it sets no cookies and uses no `sessionStorage`, IndexedDB, Cache Storage or Service Worker. There is no analytics, advertising or marketing storage, no third-party storage, and no cookie banner or consent manager.

Menu state, filters, expanded panels and contact-method selection are local document state. The form uses `novalidate`; its submit handler prevents default submission, checks trimmed values on `[data-required]` fields, displays a local completion message and resets the form. With the script working, it neither sends an enquiry nor persists form data remotely; non-empty validation does not establish email or phone validity. Without JavaScript, the existing form can perform a native GET request with named fields in the URL. The demonstration must not be used without JavaScript or with real personal, confidential or sensitive data.

## Build and generated output

- `npm ci` installs from the lockfile. `npm run dev` runs `vite --host`, exposing the development server to the network. Use an HTTP server for the module-based pages.
- `npm run build` runs `vite build` and produces `dist/` with all nine pages and processed assets. Vite bundles/minifies CSS and JavaScript; PostCSS applies Autoprefixer. `base: "./"` keeps emitted asset references relative.
- `npm run preview` runs `vite preview` against an existing build; it is separate from development and does not build first.
- `npm run images:convert` separately converts PNG/JPG/JPEG under `assets/src-images/` to WebP and AVIF in `assets/images/`. It is not part of the build. Output is flat, so source basenames must be unique across subdirectories. Regenerate converted files from originals rather than editing them manually.
- The asset directories currently contain guidance files; graphics used by the pages are inline SVG. Converted image output is not currently tracked and is not ignored by `.gitignore`. Reference new assets from HTML or CSS for Vite processing.

## Testing and verification

`npm run lint` runs ESLint only on `js/**/*.js`, with browser/ES2021 settings and warnings for unused variables. It does not check HTML, CSS, Vite configuration or the image conversion script. There are no configured unit tests, browser suites, type checks or dedicated accessibility/SEO/PWA validators.

For implementation changes, use lint where applicable, the production build for entry/asset changes, and focused manual checks through development or build preview for affected interactions, themes and viewport sizes. Shared shell or behavior changes affect all nine pages. Configured commands alone do not prove runtime correctness.

`npm run format` runs `prettier --write .`; it writes across the repository and is not a read-only verification command.

## Deployment

The build artifact for static hosting is `dist/`, retaining the nine HTML routes and relative assets. The repository has no hosting configuration, deployment command, CI deployment workflow, redirects or response-header rules. README supplies a Netlify preview address but does not confirm its availability or correspondence with repository source. Vite preview is local build inspection, not proof of active deployment.

## Project boundaries

- The contact form is a frontend demonstration; there is no submission endpoint, authentication, backend persistence or booking workflow.
- All nine page footers link to `terms.html`, `privacy.html` and `cookies.html`; each legal page marks its own footer link with `aria-current="page"`. No legal page is part of the primary service navigation.
- The location map is illustrative SVG, and social links use placeholder destinations rather than external integrations.
- `privacy.html` describes only implemented data behavior: direct e-mail to `kontakt@kp-code.pl` as the only channel through which users send data to the operator, browser-local theme storage that application code never transmits, the demonstration form with its no-JavaScript GET limitation, and technical connection data handled by the hosting provider, without provider-specific log, role, region or transfer details. There are no analytics, application-set cookies or third-party embeds. Changes to forms, storage, hosting or external services require a matching Privacy Policy update.
- `cookies.html` documents only implemented browser storage: no application-set cookies, `eternalRestTheme` in `localStorage` as the sole inventory entry, and no analytics, marketing, third-party storage, cookie banner or consent manager. It treats the theme entry as functional storage made only on the user's request, so it describes no consent flow. Changes to browser storage, third-party scripts or embeds, or hosting features that store data on the device require matching Cookies Policy and Privacy Policy updates.
- There is no service worker, web app manifest or offline/PWA implementation. Ignore-file comments naming such files do not establish their existence.
- Fonts named in CSS stacks are not bundled or loaded by a font provider; rendering depends on available fonts and fallbacks.

## Maintenance rules

Keep canonical source, optional converted images and Vite output distinct. Preserve `package-lock.json` alongside intentional dependency changes. Use README for setup and project overview, `docs/CHANGELOG.md` for significant completed changes within task scope, and this file for stable technical contracts. Follow `LICENSE.md` and preserve attribution; the project is not open source, and third-party materials retain their own terms.
