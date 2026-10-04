# Eternal Rest — Project Context

**Project type:** Polish-language static multi-page website
**Context status:** Active
**Last reviewed:** 2026-10-04

## Project identity

Eternal Rest is a KP_Code Digital Studio frontend presenting funeral-home services, pricing packages, company information, family guidance and a demonstration contact form. The six pages are `index.html`, `uslugi.html`, `cennik.html`, `o-nas.html`, `poradnik.html` and `formularz.html`.

## Project intent

The repository supports local portfolio and technical review under the proprietary terms in `LICENSE.md`. Preserve its Polish content, shared visual language and inspectable frontend implementation. Service descriptions and contact promises in page copy do not establish operational services or an enquiry-processing system.

## Technology stack

- Semantic HTML, plain CSS with custom properties, Grid and Flexbox, and Vanilla JavaScript loaded as an ES module; no frontend framework or runtime package dependencies.
- Node.js and npm for tooling, with dependency resolution recorded in `package-lock.json`.
- Vite 5 for development, multi-page builds and preview; PostCSS with Autoprefixer via `postcss.config.cjs`.
- ESLint 8 with `eslint:recommended` and Prettier 3; Sharp and fast-glob for the separate image conversion script.
- Browser APIs include `matchMedia`, `localStorage`, `IntersectionObserver` and `requestAnimationFrame`.

## Architecture

`vite.config.js` sets `appType: "mpa"` and explicitly lists all six HTML entry points. Navigation uses relative `.html` links and normal document loads. Each page maintains its own header, navigation and footer; there is no shared-template generator or client-side router.

All pages load `css/main.css` and `js/main.js`. The script runs a single immediately invoked function, selects elements through `data-*` hooks and conditionally attaches page-specific interactions. It owns theme controls, navigation, scroll effects, accordions, pricing filters/details and the form demonstration. There is no application server, database or remote API integration.

## Canonical source ownership

- Root HTML owns page content, prices, metadata, inline SVG and repeated site chrome.
- `css/main.css` owns stylesheet import order: tokens, base, layout, components, utilities, then home and services styles. Imported CSS files are maintained source.
- `js/main.js` owns browser behavior and the theme storage contract.
- `vite.config.js` owns production entry points and relative asset paths; `package.json` owns commands, and `postcss.config.cjs` owns CSS post-processing.
- `scripts/convert-images.js` owns raster conversion from `assets/src-images/` into generated `assets/images/` files.
- `dist/` is generated deployment output, ignored by Git and not tracked. Edit source and rebuild; do not edit production bundles or HTML directly.

## Project structure

```text
index.html, uslugi.html, cennik.html, o-nas.html, poradnik.html, formularz.html
css/
  main.css, tokens.css, base.css, layout.css, components.css, utilities.css
  pages/home.css, pages/services.css
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
- Shared markup changes must be applied consistently across the six maintained HTML files. New pages require an explicit Vite build entry as well as navigation updates.

## Quality contracts

- Preserve Polish document language, page-specific titles/descriptions, semantic landmarks, skip links and visible keyboard focus. Metadata belongs to each source HTML page.
- Preserve navigation ARIA synchronization, focus transfer/restoration, Tab containment, Escape dismissal, scroll locking and desktop-state synchronization.
- Keep accordion and pricing-detail `aria-expanded` values synchronized with panel visibility. Preserve form labels, associated errors, `aria-invalid` and the focusable live completion message.
- Retain system/light/dark theme behavior and reduced-motion handling for transitions, reveals and scrolling. Preserve the `.no-js` navigation fallback; this does not establish complete no-JavaScript support for interactive content.
- These are implementation contracts, not claims of accessibility compliance or verified browser compatibility.

## Data and state

Content, service categories and pricing are embedded in HTML. Theme preferences are stored under `localStorage` key `eternalRestTheme` as `{ "version": 1, "mode": "auto" }`, with `light` and `dark` as the other UI modes. Missing, unreadable or differently versioned stored data defaults to system mode.

Menu state, filters, expanded panels and contact-method selection are local document state. The form uses `novalidate`; its submit handler prevents default submission, checks trimmed values on `[data-required]` fields, displays a local completion message and resets the form. It neither sends an enquiry nor persists form data remotely; non-empty validation does not establish email or phone validity.

## Build and generated output

- `npm ci` installs from the lockfile. `npm run dev` runs `vite --host`, exposing the development server to the network. Use an HTTP server for the module-based pages.
- `npm run build` runs `vite build` and produces `dist/` with all six pages and processed assets. Vite bundles/minifies CSS and JavaScript; PostCSS applies Autoprefixer. `base: "./"` keeps emitted asset references relative.
- `npm run preview` runs `vite preview` against an existing build; it is separate from development and does not build first.
- `npm run images:convert` separately converts PNG/JPG/JPEG under `assets/src-images/` to WebP and AVIF in `assets/images/`. It is not part of the build. Output is flat, so source basenames must be unique across subdirectories. Regenerate converted files from originals rather than editing them manually.
- The asset directories currently contain guidance files; graphics used by the pages are inline SVG. Converted image output is not currently tracked and is not ignored by `.gitignore`. Reference new assets from HTML or CSS for Vite processing.

## Testing and verification

`npm run lint` runs ESLint only on `js/**/*.js`, with browser/ES2021 settings and warnings for unused variables. It does not check HTML, CSS, Vite configuration or the image conversion script. There are no configured unit tests, browser suites, type checks or dedicated accessibility/SEO/PWA validators.

For implementation changes, use lint where applicable, the production build for entry/asset changes, and focused manual checks through development or build preview for affected interactions, themes and viewport sizes. Shared shell or behavior changes affect all six pages. Configured commands alone do not prove runtime correctness.

`npm run format` runs `prettier --write .`; it writes across the repository and is not a read-only verification command.

## Deployment

The build artifact for static hosting is `dist/`, retaining the six HTML routes and relative assets. The repository has no hosting configuration, deployment command, CI deployment workflow, redirects or response-header rules. README supplies a Netlify preview address but does not confirm its availability or correspondence with repository source. Vite preview is local build inspection, not proof of active deployment.

## Project boundaries

- The contact form is a frontend demonstration; there is no submission endpoint, authentication, backend persistence or booking workflow.
- The location map is illustrative SVG, and footer social/privacy/cookie links use placeholder destinations rather than implemented pages or integrations.
- There is no service worker, web app manifest or offline/PWA implementation. Ignore-file comments naming such files do not establish their existence.
- Fonts named in CSS stacks are not bundled or loaded by a font provider; rendering depends on available fonts and fallbacks.

## Maintenance rules

Keep canonical source, optional converted images and Vite output distinct. Preserve `package-lock.json` alongside intentional dependency changes. Use README for setup and project overview, `docs/CHANGELOG.md` for significant completed changes within task scope, and this file for stable technical contracts. Follow `LICENSE.md` and preserve attribution; the project is not open source, and third-party materials retain their own terms.
