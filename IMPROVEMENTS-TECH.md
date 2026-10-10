# Eternal Rest — Technical Improvements

**Analysis date:** 2026-10-08
**Project type:** Polish-language static multi-page website (nine root HTML pages, plain CSS with custom properties, one Vanilla JavaScript ES module, Vite 5 MPA build)
**Analysis mode:** Evidence-based technical improvement review
**Focus:** Project-wide technical implementation

## Improvement overview

The implementation is small and conventional. Nine root HTML pages own the content, and Vite derives them as MPA entries automatically (`vite.config.js:8-18`). `css/main.css` imports one token layer followed by base, layout, component, utility and page stylesheets in a fixed order. `js/main.js` attaches every interaction through `data-*` hooks in a single module. The only persistent client state is the versioned `eternalRestTheme` preference, and there is no runtime dependency.

The main opportunities concern source-of-truth ownership rather than missing capability:

- The shared page chrome (skip link, header, footer and back-to-top control) is written out in every page, and the footer has already diverged into two variants.
- The dark palette is declared twice in `css/tokens.css`.
- Several BEM elements are used outside their blocks, so component rules have consumers that their names do not reveal.
- In `js/main.js`, the documented disclosure contract is implemented twice.
- Text on accent backgrounds is the only color role outside the token layer.

The five proposals below address these areas without new dependencies, framework changes or directory restructuring.

## Proposed improvements

### IMP-TECH-01 — Generate shared page chrome from build-time partials

- **Status:** Completed — shared page chrome consolidation and owner-approved visual refinement.
- **Original issue:** The header, footer and back-to-top markup was duplicated across nine HTML pages, with two distinct footer variants and inconsistent responsive styling.
- **Implemented result:** Created four reusable HTML partials in `partials/`, integrated through a local Vite `transformIndexHtml` plugin. Preserved both footer variants and improved header navigation, responsive layouts, theme controls, footer presentation, keyboard focus and back-to-top styling.
- **Verification:** Nine-page production build, ESLint, HTML structure comparison, partial reload and focused browser tests passed. Existing Prettier formatting differences remain unchanged.
- **Known limitations:** The existing dark-theme accent contrast issue remains unresolved. Other browser engines, touch devices and screen readers were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-TECH-02 — Declare each theme color and shadow token once with `light-dark()`

- **Status:** Completed — single-declaration theme tokens on the owner-approved `light-dark()` browser baseline.
- **Original issue:** The dark values of the ten theme colors and three shadows were declared twice in `css/tokens.css`, for explicit and for system dark mode, so every dark-palette change had to be repeated in both blocks.
- **Implemented result:** Each theme color and shadow token is declared once on `:root` as a `light-dark()` pair; shadows switch only their color. `color-scheme: light dark` selects the system theme, the `data-theme` rules force `light` or `dark`, and the dark-palette media block is removed. Token values, `js/main.js`, the `data-theme` contract and the stored preference are unchanged.
- **Verification:** Production build and the Prettier check of `css/tokens.css` passed. In Chromium, the computed color, background, border and shadow values of all elements on the nine pages matched the pre-change values in explicit light and dark mode, system light and dark mode, and without JavaScript, in development and production builds. The theme toggle, system mode and stored preference worked as expected.
- **Known limitations:** Browsers without `light-dark()` support (Baseline 2024) lose the theme colors and shadows, as accepted in the approved baseline. Other browser engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-03 — Give borrowed BEM elements block-owned classes

- **Status:** Completed — block-owned element classes with unchanged rendering.
- **Original issue:** Process steps, pricing cards, an about-page card and the contact form borrowed `card__title`, `card__text`, `footer__links` and `hero__actions`, so these rules had consumers that their block names did not reveal.
- **Implemented result:** Process steps use `steps__title` and `steps__text`, pricing cards `pricing__title` and `pricing__features`, the about-page values list `card__list`, and the contact-method buttons `form__choices`. In `css/components.css`, each new selector is grouped with the rule it previously borrowed, so no declarations are duplicated. IDs, ARIA attributes, `data-*` hooks, heading levels, the shared partials and `js/main.js` are unchanged.
- **Verification:** ESLint and the nine-page production build passed. In Chromium, all computed styles and layout boxes of 1,410 affected and related elements on the home, about, pricing and contact pages matched the pre-change values at 375 px and 1280 px in explicit light, explicit dark and system dark mode. No borrowed class remains outside its block on the nine pages, and the pricing details, pricing filter and contact-method buttons work as before. Existing Prettier formatting differences remain unchanged.
- **Known limitations:** Other browser engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Implement the disclosure contract once in `js/main.js`

- **Status:** Completed — one disclosure function with consistent missing-panel handling.
- **Original issue:** The FAQ accordion and pricing details handlers each implemented the `aria-controls` lookup, `aria-expanded` inversion and `hidden` update, and the accordion inverted `aria-expanded` even when its panel was missing.
- **Implemented result:** The module-level `toggleDisclosure` function resolves the panel from `aria-controls`, inverts `aria-expanded`, sets `hidden` and returns the new expanded state, or returns `null` without changes when the panel cannot be resolved. The delegated accordion listener and the per-button pricing listeners call it, and the pricing handler keeps only its label update. Markup, `data-*` hooks, labels and independent opening of panels are unchanged.
- **Verification:** ESLint and the nine-page production build passed, and the new code adds no Prettier differences. In Chromium, the two home and four guide FAQ items and the three pricing toggles opened and closed independently, with `aria-expanded`, `hidden` and the pricing labels in sync, in development and production builds. Keyboard activation worked with Enter on all three pages and with Space on the home and pricing pages. With an unresolved or removed `aria-controls` reference or a removed panel, simulated in the live DOM only, neither component changed `aria-expanded` or the pricing label.
- **Known limitations:** Other browser engines and screen readers were not tested.
- **Impact:** Low
- **Effort:** Small

### IMP-TECH-05 — Add a text-on-accent color token

- **Status:** Completed — one theme-independent on-accent token with unchanged rendering.
- **Original issue:** The text color on accent backgrounds was the literal `#fff` in four rules across `css/base.css` and `css/components.css`, the only color role outside the token layer.
- **Implemented result:** `css/tokens.css` declares `--color-on-accent: #fff` once on `:root`, next to `--color-accent`, as a single value rather than a `light-dark()` pair because it is the same in both themes. `.skip-link`, `.site-header__cta`, `.back-to-top` and `.button--primary` use it instead of the literal. Selectors, other declarations, the accent colors, markup and `js/main.js` are unchanged, and no color literal remains in `css/` outside `css/tokens.css`.
- **Verification:** ESLint and the nine-page production build passed, and the changed lines add no Prettier differences. In Chromium, the computed styles and layout boxes of the four controls and their descendants on the nine pages matched the pre-change values at 375 px and 1280 px in explicit light, explicit dark, system light and system dark mode, with the back-to-top control both hidden and shown. The keyboard-focused skip link matched its pre-change values in explicit light and dark mode, and the hovered header CTA and the four controls on three pages of the production build keep `#fff` text.
- **Known limitations:** The contrast defect of white text on the dark-theme accent (2.94:1 in the archived UI report) remains and needs a separately approved fix. Other browser engines were not tested.
- **Impact:** Low
- **Effort:** Small

## Selection summary

**Why these proposals:** Each one addresses a source-of-truth or ownership gap in a structure that already exists: the page chrome (01), the dark palette (02), component class ownership (03), disclosure behavior (04) and the on-accent color (05). None adds a dependency, changes the build system or alters public behavior. Four are Small and one is Medium, and each can be checked with a build plus a few targeted browser checks. That makes the set a reasonable backlog for a focused development day, without a guarantee that all five fit into one.

**Dependencies:**

- IMP-TECH-03 should follow IMP-TECH-01, so that the footer classes are changed once in the partials.
- IMP-TECH-02 and IMP-TECH-05 both edit `css/tokens.css`. IMP-TECH-05 can be applied in either token form.
- IMP-TECH-02 requires the owner's browser-baseline decision before implementation.
- IMP-TECH-04 is independent of all the others.

**Considered but not selected:**

- Moving the legal-page header rules (`css/pages/legal.css:6-20`, `:244-259`, `:272-302`) into the shared header component. This would change header behavior on the six marketing pages and is the fix for the open header defect below, so it belongs in a defect task. Later done within the approved visual refinement of IMP-TECH-01.
- Making `.site-header__cta` (`css/components.css:78-96`) reuse `.button--primary`. IMP-UI-01 deliberately kept the header CTA's own rules.
- Merging the two scroll listeners (`js/main.js:76-93`, `:288-292`) and routing both theme controls through one setter (`js/main.js:52-68`). This duplication is real but minor, with lower value than the selected items.
- Sharing the 760 px breakpoint between `js/main.js:98` and `css/components.css:513`. CSS media queries cannot read custom properties, so a single source would need an indirect mechanism out of proportion to the risk.
- Splitting `js/main.js` into modules. At 297 lines with clear `data-*` boundaries, its size alone does not justify a split.
- ESLint scope, the ESLint 8 version and image-conversion output. These are workflow or dependency matters.

**Defects observed and excluded:** These belong in an audit rather than among optional improvements.

- `storeTheme` (`js/main.js:26-31`) calls `localStorage.setItem` without the error handling that `getStoredTheme` has (`js/main.js:12-24`). Both theme click handlers call it before `applyTheme` (`js/main.js:57-58`, `:65-66`), so wherever storage writes fail, the theme controls stop working.
- The header defect on the six marketing pages recorded in `docs/archive/improvements/IMPROVEMENTS-UI-2026-10-06.md:111` is still present by static inspection. The marketing pages get none of the header rules that `css/pages/legal.css` scopes to `.legal-page`, and `css/components.css` does not hide `.site-header__toggle` from 760 px. Resolved by the shared header styles of IMP-TECH-01.
- The "Preferowany kontakt" label (`contact.html:117`) is not associated with a control, so the contact-method button group has no accessible group name. The missing visual `aria-pressed` state recorded in the archived UI report (line 112) also remains.

## Analysis limitations

- `node_modules/` is not installed in this worktree, and installation was out of scope. No npm command was run (lint, build, preview or `format:check`), so the current build output and lint status were not verified.
- No browser inspection was performed, and runtime behavior is inferred from the source. The browser-support statement in IMP-TECH-02 reflects general platform knowledge, because the repository defines no browser-support policy (no `browserslist` configuration).
- No `PLAN.md`, audit, review or other active improvement report exists. Overlap was checked against `README.md`, `docs/CHANGELOG.md`, the two archived improvement reports and Git history up to commit `76e948c`.
