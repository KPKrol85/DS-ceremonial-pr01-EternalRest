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

- **Affected area:** Theme token layer in `css/tokens.css`.
- **Evidence:**
  - `css/tokens.css:57-73` and `css/tokens.css:79-97`: the dark declarations at lines 58-72 and 81-95 are identical (`color-scheme`, ten colors and three shadows). The light values are in `css/tokens.css:1-55`.
  - Commit `a00f9d6` added the same three dark shadow overrides to both blocks.
  - `js/main.js:33-47`: explicit modes set `data-theme`, and auto mode removes it.
  - `css/components.css:5`, `:293`, `:394-395` and `:510` already use `color-mix()` without a fallback.
- **Current implementation:** Light values live on `:root`. The dark palette is written twice: once for `html[data-theme="dark"]` and once for `html:not([data-theme])` inside `@media (prefers-color-scheme: dark)`, because a media condition cannot share a rule with an attribute selector. Every dark-palette change must be made identically in both blocks.
- **Proposed improvement:** Declare each theme-dependent token once on `:root` as a `light-dark()` pair, and set `color-scheme: light dark` on the root for auto mode. Keep `color-scheme: light` and `color-scheme: dark` for the explicit `data-theme` values, and remove the palette media block.
- **Expected engineering value:** Each color and shadow has a single declaration that shows both theme values side by side. The two dark blocks can no longer diverge, and a palette change is made in one place.
- **Implementation scope:**
  - Change `css/tokens.css` only.
  - Unchanged: theme-independent tokens, the reduced-motion block, the `data-theme` contract, `js/main.js`, the `eternalRestTheme` storage format and the no-JavaScript fallback to the system scheme.
  - Precondition: `light-dark()` is a newer CSS feature (Baseline 2024) than `color-mix()` (Baseline 2023). In a browser without it, every theme token fails, not just individual effects. The owner must therefore confirm the supported browser baseline before implementation. If that baseline is not accepted, the proposal is withdrawn rather than replaced with a workaround.
- **Acceptance criteria:**
  - `css/tokens.css` declares every color and shadow token exactly once and has no palette `@media (prefers-color-scheme: dark)` block.
  - In a browser, the computed `color`, `background-color`, `border-color` and `box-shadow` of representative elements match the pre-change values in four states: explicit light, explicit dark, and auto mode with a light and a dark system scheme. The representative elements are the body, header, a card, primary and secondary buttons, the footer and the form success message.
  - Rendering without JavaScript follows the system scheme.
  - The theme toggle, the system-mode button and the stored preference behave as before.
  - `js/main.js` is unchanged.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-03 — Give borrowed BEM elements block-owned classes

- **Affected area:** Component class ownership in `css/components.css`, and class attributes in the footer, steps, pricing, about and contact markup.
- **Evidence:**
  - Rules: `css/components.css:214-222` (`.card__title`, `.card__text`), `css/components.css:421-424` (`.footer__links`) and `css/components.css:189-194` (`.hero__actions`).
  - `card__title` is used:
    - in the footer headings of all nine pages, for example `index.html:295`, `:306`, `:315` and `cookies.html:839`, `:850`, `:859`;
    - in the steps items with `card__text` (`index.html:174-185`, `about.html:137-148`);
    - on the pricing titles (`pricing.html:89`, `:110`, `:131`).
  - `footer__links` is used on the pricing feature lists (`pricing.html:102`, `:123`, `:144`) and on a list in an about-page card (`about.html:89`).
  - `hero__actions` wraps the contact-method buttons (`contact.html:118`).
  - Precedent: `css/pages/legal.css:40-47` already groups block-owned heading selectors.
- **Current implementation:** `card__title` appears 51 times, but only 15 of those uses are inside a `.card`. Footer headings, process steps and pricing cards borrow it, and the steps also borrow `card__text`. The footer's link-list element styles two lists outside the footer, and the hero's action row lays out a form control group. Each of these rules has consumers that its block name does not reveal.
- **Proposed improvement:** Give each borrowing block its own element class for the role it borrows: for example, footer, steps and pricing headings, steps text, a pricing feature list and a form choice group. Keep shared declarations written once by grouping the new selectors with the original ones, following `css/pages/legal.css:40-47`.
- **Expected engineering value:** Each rule's consumers become visible in its selector list. A block can diverge, for example with a footer heading change, without affecting cards, pricing or the contact form.
- **Implementation scope:**
  - Change `css/components.css` and class attributes only, with identical rendering.
  - Unchanged: `data-*` hooks, IDs, ARIA attributes, heading levels and `js/main.js`.
  - Layout reuse that matches its block's meaning stays: the `section__*` classes in the home hero card and `form__field` around the pricing filter.
  - After IMP-TECH-01, the footer change is made in the partials. If this proposal goes first, it spans all nine pages.
- **Acceptance criteria:**
  - No `card__title` or `card__text` remains outside a `.card`, no `footer__links` outside `.footer`, and no `hero__actions` outside `.hero`.
  - No declaration block is duplicated for the new classes.
  - The computed styles of the affected elements are unchanged in light and dark themes at 375 px and 1280 px widths.
  - `npm run lint` and `npm run build` succeed.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Implement the disclosure contract once in `js/main.js`

- **Affected area:** FAQ accordions and pricing detail toggles in `js/main.js`.
- **Evidence:**
  - Handlers: `js/main.js:202-214` (accordions) and `js/main.js:228-240` (pricing details).
  - Documented contract: `README.md:122` and `README.md:259` state that accordions and package details keep `aria-expanded` in sync with panel visibility.
  - `css/components.css:296-311` draws both indicators from `aria-expanded`.
  - Markup: `index.html:230-259`, `guide.html:77-136` and `pricing.html:92-107`.
- **Current implementation:** Two handlers implement the same contract (find the panel from `aria-controls`, invert `aria-expanded`, set `panel.hidden`) with different structure and edge-case behavior:
  - Accordions use one delegated listener per container and invert `aria-expanded` even when the panel is missing.
  - Pricing toggles use one listener per button, return early when the panel is missing, and then replace the button text with hard-coded labels.
- **Proposed improvement:** Add one module-level disclosure function that applies the shared state change and returns the new state. Both handlers use it, and the pricing handler keeps only its label update.
- **Expected engineering value:** The accessibility contract documented in README has one implementation. A future change to it, such as an added ARIA attribute or a transition, is made once, and both components handle a missing panel the same way.
- **Implementation scope:**
  - Change `js/main.js` only.
  - Unchanged: the `data-accordion`, `data-accordion-trigger` and `data-details-toggle` hooks, the use of `aria-controls` and `hidden`, the delegated accordion listener, independent opening of panels, and the labels "Pokaż szczegóły" and "Ukryj szczegóły".
  - Out of scope: the pricing filter, the menu and the other features.
- **Acceptance criteria:**
  - One function contains the `aria-controls` lookup, the `aria-expanded` inversion and the `hidden` update, and neither handler repeats them.
  - When a panel is missing, both components leave `aria-expanded` unchanged, as the pricing handler does today. No current markup lacks a panel, so visible behavior does not change.
  - In a browser, the home and guide FAQ items and the three pricing toggles open and close independently, `aria-expanded` and `hidden` stay in sync, and the pricing labels switch as before.
  - `npm run lint` succeeds.
- **Impact:** Low
- **Effort:** Small

### IMP-TECH-05 — Add a text-on-accent color token

- **Affected area:** Accent-filled controls in `css/base.css` and `css/components.css`; token layer in `css/tokens.css`.
- **Evidence:**
  - `css/base.css:60-69`: `.skip-link` has `color: #fff` at line 65.
  - `css/components.css`: `.site-header__cta` at 78-90 (line 87), `.back-to-top` at 447-462 (line 454) and `.button--primary` at 493-497 (line 496).
  - All other colors come from `css/tokens.css:1-55`. A search of `css/` and the HTML pages finds no other color literal outside `css/tokens.css`.
  - `docs/archive/improvements/IMPROVEMENTS-UI-2026-10-06.md:113` records the contrast defect of this color pairing.
- **Current implementation:** Every color in the component and page stylesheets comes from a theme token, except the text color on the accent background. That color is the literal `#fff` in four rules across two files, so it is not part of the theme layer and cannot vary by theme without editing all four rules.
- **Proposed improvement:** Add one on-accent foreground token to `css/tokens.css` with the current value `#fff`, and use it in the four rules.
- **Expected engineering value:** The token layer covers every color role, and a future per-theme adjustment of text on accent becomes a one-place token change.
- **Implementation scope:**
  - Change `css/tokens.css`, `css/base.css` and `css/components.css`.
  - The value stays `#fff` in every theme, so rendering is unchanged.
  - This proposal does not fix the known contrast defect of white text on the dark-theme accent (2.94:1 in the archived UI report). That defect needs a separately approved fix.
  - If IMP-TECH-02 is implemented first, the new token follows its single-declaration form.
- **Acceptance criteria:**
  - No color literal remains in `css/` outside `css/tokens.css`.
  - The four rules use the new token, and their computed text color is unchanged in light and dark themes.
  - `npm run build` succeeds.
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
