# Eternal Rest — UI Improvements

**Analysis date:** 2026-10-05
**Project type:** Polish-language static multi-page website (nine root HTML pages, plain CSS with custom properties, Vanilla JavaScript ES module, Vite 5 MPA build)
**Analysis mode:** Evidence-based UI improvement review
**Focus:** Project-wide UI

## Improvement overview

The interface has a consistent token base in `css/tokens.css`, a restrained warm palette with light, dark and system themes, and a shared BEM vocabulary across all nine pages. The legal family (`css/pages/legal.css`) shows the most mature UI layer: measured text width, tokenized heading rhythm and explicit link states.

The six marketing pages have not caught up with that layer. Action styles are borrowed across blocks: the header CTA class is used as the page-wide primary button, and the `badge` label is reused for links and toggle buttons. The pricing page has no multi-column layout. Display headings inherit body line-height. The ARIA states that `js/main.js` maintains have no visual presentation. Surface and elevation tokens do not separate cards from alternate sections, and dark mode does not override the shadow tokens. The proposals below stay within the existing tokens, breakpoints (480, 760, 1024 px) and `data-*` behavior contracts.

## Proposed improvements

### IMP-UI-01 — Separate a shared button component from the header CTA and the badge label

- **Affected area:** Primary and secondary actions on the marketing pages; action styles in `css/components.css`.
- **Evidence:** `css/components.css:77-95` (`.site-header__cta`), `css/components.css:220-229` (`.badge`); header CTA class used outside the header at `index.html:78`, `index.html:261`, `services.html:141`, `pricing.html:159`, `guide.html:162` and as the form submit at `contact.html:162`; `.badge` used as links at `index.html:79`, `index.html:148-158`, `contact.html:196`, as buttons at `pricing.html:92-142` and `contact.html:119-135`, and as static labels at `services.html:85-136` and `index.html:95`.
- **Current state:** `site-header__cta`, an element of the header block, is the only primary-button style and is reused on five pages, including the form submit. `.badge` renders static service tags, navigational links, pricing detail toggles and contact-method toggles with identical presentation. Only `.site-header__cta` defines a hover and focus treatment; badge links and badge buttons have no hover or active styling. As a result, "Zobacz szczegóły" on the home cards looks the same as the non-interactive "Oprawa muzyczna" tag on the services page.
- **Proposed improvement:** Introduce a page-level button block in `css/components.css` with primary and secondary variants built only from existing tokens (accent, surface-alt, pill radius, current padding), with hover, focus-visible and active states. Migrate the non-header primary actions and every interactive badge use to it, and keep `.badge` for non-interactive labels only. The header CTA may adopt the primary variant or keep its class, with identical appearance.
- **Expected value:** Actions are visually distinguishable from labels. Page CTAs no longer depend on a header element, so header changes do not ripple into page content. Action states have a single owner.
- **Implementation scope:** `css/components.css` and class attributes in `index.html`, `services.html`, `pricing.html`, `guide.html` and `contact.html`; the header CTA if adopted, consistently across all nine pages. `js/main.js` selects these controls only through `data-*` hooks, so the hooks, `aria-expanded`/`aria-pressed` handling, `tel:` links, labels and the global `:focus-visible` outline must remain unchanged.
- **Acceptance criteria:** No element outside `.site-header` uses `site-header__cta`. No `a.badge` or `button.badge` remains. Interactive secondary actions share one variant with visible hover and active states in light and dark themes. Primary actions keep their current colors, pill shape and padding. Pricing toggles and contact-method buttons keep their current ARIA behavior. `npm run lint` and `npm run build` succeed.
- **Impact:** High
- **Effort:** Medium

### IMP-UI-02 — Add a responsive comparison layout to the pricing packages

- **Affected area:** `pricing.html` package list and filter.
- **Evidence:** `css/components.css:287-314` (`.pricing`, `.pricing__card`, `.pricing__details`), `pricing.html:78-151`, `js/main.js:216-240`, `css/layout.css:47-49` and `css/layout.css:61-68` (existing `grid--three` breakpoint pattern). Runtime at a 1280 px viewport: `.pricing` computes to a single `1120px` track, each card measures 1120 × 237 px, the details toggle stretches to 1070 px and the filter select to 1120 px.
- **Current state:** `.pricing` defines a gap but no columns at any breakpoint, so the three packages stack vertically at every width. Because `.pricing__card` is a grid, the badge-styled details toggle stretches to the full card width. The filter field also spans the whole container.
- **Proposed improvement:** Give `.pricing` a mobile-first column layout using the existing breakpoints, so the three packages sit side by side on wide viewports. Align cards so that expanding one card's details does not resize its neighbors. Size the details toggle to its content and constrain the filter control to a readable width. When the filter leaves a single card visible, the card should keep its column width instead of spanning the container.
- **Expected value:** Price ranges and package descriptions can be compared at a glance. The page aligns with the three-column card grids used elsewhere, and line length inside cards becomes shorter.
- **Implementation scope:** `.pricing` rules in `css/components.css`, plus a wrapper class on the filter field in `pricing.html` only if needed. Preserve `data-pricing-card`, `data-category`, the `is-hidden` filtering, `aria-controls` IDs, `hidden` toggling and all copy.
- **Acceptance criteria:** All three cards share one row at the chosen desktop breakpoint, and the layout is single-column below 480 px. Expanding one card's details changes only that card's height. Details toggles are no wider than their label plus padding. The filter select does not span the full container at 760 px and above. Filtering to one category shows one card at column width. No horizontal overflow appears at 375 px.
- **Impact:** High
- **Effort:** Small

### IMP-UI-03 — Establish a tokenized, responsive heading scale for the marketing pages

- **Affected area:** Hero, section, card, service and footer headings on the six marketing pages; typography tokens.
- **Evidence:** `css/tokens.css:18-26` (size tokens only, no line-height tokens), `css/base.css:17` (body `line-height: 1.6`), `css/layout.css:27-31` (`.section__title`), `css/components.css:175-179` and `css/components.css:471-475` (`.hero__title`, with a `3.4rem` literal at 1024 px), `css/components.css:211-214` (`.card__title`), `css/pages/services.css:13-17`, `css/pages/legal.css:40-52` and `css/pages/legal.css:144-155` (legal headings set their own line-height and `text-wrap: balance`). Runtime: the home `h1` renders at 54.4 px with an 87.04 px line-height at 1280 px and at 45.6 px at 375 px; `.section__title` renders at 36 px at both widths.
- **Current state:** Serif display headings on the marketing pages inherit the body line-height of 1.6. `.section__title` has one size for page `h1` elements and for the home hero card `h2`, with no responsive step. The hero's largest size is a literal value outside the token scale. The legal pages already solve heading rhythm locally, which leaves two independent heading systems.
- **Proposed improvement:** Add heading line-height tokens and a display-size token in `css/tokens.css`. Define small-screen and 760 px+ sizes for `.hero__title` and `.section__title` using the existing breakpoints. Apply the heading line-height and balanced wrapping to the shared serif heading classes, and let `css/pages/legal.css` consume the same tokens without visual change.
- **Expected value:** Multi-line titles become tighter and more cohesive, use less vertical space on small screens, and follow one heading system across marketing and legal pages.
- **Implementation scope:** `css/tokens.css`, `css/layout.css`, `css/components.css`, `css/pages/services.css` and token adoption in `css/pages/legal.css`; no HTML changes. Preserve font families, weights, colors and heading levels.
- **Acceptance criteria:** Heading rules (`.hero__title`, `.section__title`, `.card__title`, `.services-list__title`, `.footer__title`, `.site-header__brand-title`, legal headings) take sizes and line-heights from tokens rather than literals or the inherited body value. `.hero__title` and `.section__title` are smaller below 760 px than at 760 px and above. Legal heading sizes are visually unchanged. No horizontal overflow occurs at 320 px or 375 px.
- **Impact:** Medium
- **Effort:** Medium

### IMP-UI-04 — Present the disclosure and validation states that `js/main.js` already maintains

- **Affected area:** FAQ accordions (`index.html`, `guide.html`), pricing detail toggles, contact form fields.
- **Evidence:** `js/main.js:202-214` (accordion `aria-expanded`), `js/main.js:228-240` (details `aria-expanded`), `js/main.js:264-279` (`aria-invalid`); `css/components.css:257-285` (accordion), `css/components.css:326-343` (form controls and errors); no rule in `css/` targets `aria-expanded` or `aria-invalid`; markup at `index.html:230-259`, `guide.html:77-136`, `contact.html:79-175`. Runtime: accordion triggers render at font-weight 400 on the same surface as their panels; after an empty submission, `#name` carries `aria-invalid="true"` while its border stays at the default `--color-border` value.
- **Current state:** Open and closed accordion items look identical apart from the revealed panel. Triggers have no indicator, no hover state and no emphasis over body text. Invalid form controls keep their default border, and the only cue is 13 px error text below the field.
- **Proposed improvement:** Add CSS-only presentation keyed to the attributes the script already writes. Accordion triggers get a decorative expand/collapse indicator that changes with `[aria-expanded="true"]`, a heavier question weight and a hover/focus-visible surface tint; pricing detail toggles may reuse the same indicator. Controls marked `[aria-invalid="true"]` get an error-colored border using `--color-error`.
- **Expected value:** Users can see the open, closed and invalid states without relying on panel content or small text. The presentation stays synchronized because it derives from the existing ARIA state.
- **Implementation scope:** `css/components.css` only. Indicators must be decorative (pseudo-elements or `aria-hidden`) so accessible names stay unchanged, and transitions must use the existing tokens so reduced-motion handling still applies. `js/main.js`, the `hidden` attribute usage and the error message wiring stay unchanged. The contact-method `aria-pressed` presentation is a separate defect (see Selection summary) and is outside this proposal.
- **Acceptance criteria:** Each accordion trigger shows an indicator that differs between collapsed and expanded states in light and dark themes, and has a visible hover state. After an empty submission, every invalid control shows an error-colored border, which disappears once the field is filled and the form is resubmitted. Trigger accessible names are unchanged, and `js/main.js` is not modified.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-05 — Make surface and elevation tokens separate content blocks from alternate sections in both themes

- **Affected area:** Cards, process steps, testimonials and service items, particularly inside `.section--alt`; theme tokens.
- **Evidence:** `css/tokens.css:4` and `css/tokens.css:13` (`--color-surface`, `--color-shadow`), `css/tokens.css:43-45` (shadow tokens defined only in `:root`), `css/tokens.css:54-67` and `css/tokens.css:73-88` (dark overrides, including `--color-shadow`, which no rule consumes); `css/layout.css:10-12` (`.section--alt` uses `--color-surface`); `css/components.css:193-209`, `css/components.css:236-255`, `css/pages/services.css:6-11`; affected markup at `index.html:101-135`, `index.html:164-189`, `about.html:99-123`, `guide.html:140-160`. Runtime in system dark mode: `.section--alt` and `.card` both compute to `rgb(31, 27, 24)`, the card shadow resolves to the light-theme `rgba(42, 36, 32, 0.12)` value, and `.steps__item` has no shadow.
- **Current state:** Content blocks use the same surface color as `.section--alt` in both themes, so on alternate sections only a 1 px border separates them from the background. Dark mode does not override the shadow tokens, so they keep light-theme values. The dark-specific `--color-shadow` is defined three times but unused. Elevation varies by block type: `.card` and `.testimonial` use `--shadow-sm`, `.hero__card` uses `--shadow-md`, and `.steps__item` and `.services-list__item` have none.
- **Proposed improvement:** Make the elevation tokens theme-aware by redefining the shadow tokens in both dark-theme blocks, replacing or consuming the unused `--color-shadow`. Define the surface relationship for content blocks placed inside `.section--alt` through a token or a section-scoped rule, and align elevation across the four block types according to one documented choice.
- **Expected value:** Grouping and hierarchy on alternating sections stay legible in light, dark and system-dark modes, and an unused token is removed from the theme layer.
- **Implementation scope:** `css/tokens.css` (both dark blocks, which currently duplicate each other), `css/layout.css` and/or `css/components.css`; no HTML or JavaScript changes. The existing palette values and the explicit/system theme mechanism stay unchanged.
- **Acceptance criteria:** On every `.section--alt`, card, step and testimonial backgrounds differ from the section background in light, explicit dark and system-dark modes. Shadow tokens resolve to theme-specific values in dark mode. `--color-shadow` is either used or removed with no remaining references. Light-theme blocks on default sections look unchanged.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

These five were selected because they apply across several pages, reuse existing tokens and breakpoints, and could each become a focused task without changing behavior contracts. IMP-UI-01 and IMP-UI-02 have the most visible effect on the marketing pages. IMP-UI-03 and IMP-UI-05 strengthen the shared token layer. IMP-UI-04 is a small, CSS-only change.

Dependencies: IMP-UI-01, IMP-UI-02 and IMP-UI-04 all touch the pricing detail toggles, so implementing IMP-UI-01 first avoids restyling them twice. IMP-UI-03 and IMP-UI-05 are independent of each other and of the rest.

Defects observed during the analysis were excluded from the proposals and belong in an audit:

- **Shared header on the six marketing pages:** at 375 px the closed menu panel widens the layout to 750 px. When opened, the panel measures 375 × 112 px, the size of the header box, instead of covering the viewport, so the menu items overlay page content. At 1280 px the menu toggle remains visible and navigation labels and the CTA wrap to two lines. The legal pages avoid this through scoped rules in `css/pages/legal.css:6-20` and `css/pages/legal.css:268-303`.
- **Contact-method toggles:** `aria-pressed="true"` and `aria-pressed="false"` render with identical computed styles.
- **White text on the dark-theme accent:** white on `#c58a52` computes to a 2.94:1 contrast ratio (4.67:1 on the light-theme `#9a6a3a`). This affects `.site-header__cta`, `.back-to-top` and `.skip-link`.

A current-page indicator for the primary navigation was not proposed because the shared header should be corrected first.

## Analysis limitations

- I checked rendering by serving the source tree from a temporary local static server and inspecting it in a Chromium-based browser at 375 × 812 and 1280 × 900, in emulated light and dark schemes. This was not the Vite dev server or production build (no Autoprefixer), and I did not inspect other browsers or intermediate widths.
- Manrope and Playfair Display are named in the font stacks but not loaded, so the wrapping and heading measurements reflect the fallback fonts in the inspection environment.
- The contrast ratios were calculated from the declared token values, not measured on rendered pixels.
- No `PLAN.md`, audit or review file exists. I checked overlap with planned or completed work only against `docs/CONTEXT-PROJECT.md`, `docs/CHANGELOG.md` and `README.md`.
