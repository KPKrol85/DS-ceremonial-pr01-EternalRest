# Eternal Rest — Design Improvements

**Analysis date:** 2026-10-11
**Project type:** Polish-language static multi-page demonstration website (Vite MPA, vanilla HTML/CSS/JS) presenting a funeral-home service concept
**Status:** Proposed — awaiting owner review; no implementation authorized
**Analysis mode:** Evidence-based creative design review
**Focus:** Project-wide design

## 1. Methodology and evidence

**Documentation reviewed:** `README.md` (PL/EN), `AGENTS.md`, `CLAUDE.md`, `docs/CHANGELOG.md`, and the five archived reports in `docs/archive/improvements/` (UI, TECH, WORKFLOW, QUALITY, UX — all marked completed). No `PLAN.md`, audit, review or previous `IMPROVEMENTS-DESIGN.md` exists, so no approved design work or earlier design decisions had to be reconciled.

**Source reviewed:** all nine root pages (`index.html`, `about.html`, `services.html`, `pricing.html`, `contact.html`, `guide.html`, `terms.html` in full; `privacy.html` and `cookies.html` by structure), all files in `partials/`, the complete CSS chain (`css/tokens.css`, `base.css`, `layout.css`, `components.css`, `utilities.css`, `pages/home.css`, `pages/services.css`, `pages/legal.css`), the reveal logic in `js/main.js`, `vite.config.js`, `package.json`, and the `assets/` tree.

**Runtime and visual evidence:** pages were rendered in the pre-installed Chromium (Playwright) from a scratchpad copy of the canonical sources with the partials inlined by a throw-away script equivalent to the Vite partial plugin. No dependency was installed and no project file was touched. Full-page screenshots were captured for seven pages (home, about, services, pricing, contact, guide, terms) at 1440 × 900, 820 × 1180 and 390 × 844 in the light theme, and for six marketing pages at the same widths in the dark theme (via `prefers-color-scheme`), with reduced motion enabled and reveal items forced visible. Section geometry, computed font families, `document.fonts` and the actual platform fonts (Chrome DevTools Protocol `CSS.getPlatformFontsForNode`) were recorded. Direct visual inspection **did occur** for the home page (desktop light/dark, tablet light, mobile light), services, pricing, contact and about (desktop light) and terms (desktop light, top section).

**Evidence labels used:** `Source`, `Runtime`, `Visual`, `Historical`, `Design judgment`.

**Limitations:** the container has neither Manrope nor Playfair Display installed and the project does not load them, so the rendering reflects the real fallback on this platform (Liberation Serif and Inter); other operating systems will substitute other fallbacks (for example Times New Roman / Segoe UI on Windows). Contrast figures in section 4 are computed from token values, not measured in a formal accessibility audit. No interaction states, zoom levels, landscape or short viewports were inspected visually.

## 2. Executive design assessment

Eternal Rest already has a sound, calm foundation: a warm paper-and-bronze palette expressed through `light-dark()` tokens, a serif/sans pairing, generous section spacing, a monogram brand mark, a mature legal-page family with a well-judged reading measure, and two genuinely coherent theme editions. Nothing in the current design is inappropriate for the subject; restraint is its strongest asset.

The principal creative limitation is that the design never moves beyond a single, generic template. Every section on every marketing page follows the same anatomy — uppercase eyebrow, serif title, muted lead, equal grid of bordered and shadowed boxes — and the home page renders as six bands of nearly identical height (488–547 px at 1440 px). The intended typographic voice is also not being delivered: the declared display and text faces are never loaded, so headings render as a bold Times-metric fallback, which is the single most important reason the site currently reads as a well-built template rather than a distinct ceremonial identity.

The project-specific opportunity is to let the subject's natural register — stillness, typography, ritual order, paper and engraved detail — become the identity. The legal pages already show what this looks like: measured text, hairline rules, a quiet meta row. The recommended direction, **Paper & Stillness**, extends that editorial language to the marketing pages, replaces boxed repetition with ruled, typographically ordered compositions, and gives the home page a deliberate sequence of quiet and emphasis — without photography, new frameworks or changes to the working interaction contracts.

## 3. Current design identity

### Brand and first impression

- **Source:** brand vocabulary is a circular `ER` monogram (`.brand-mark`, 1 px `--color-accent-soft` ring, serif initials) plus the serif wordmark and tracked uppercase subtitle "Dom pogrzebowy" in `partials/site-header.html`.
- **Visual:** the first viewport at 1440 px presents a two-column hero: headline, lead, two pill buttons and three boxed stat tiles on the left, and an elevated card ("Dyskretna pomoc od pierwszego telefonu") on the right. The card carries its own eyebrow, a serif heading of almost the same visual weight as the H1, body copy and a badge.
- **Design judgment:** the first impression is courteous and orderly but not recognisable; with the name removed, the page would be indistinguishable from a generic service-business template in a beige palette. The monogram is the only identity device and it is used at a single small size.

### Typography and editorial hierarchy

- **Source:** `--font-serif: "Playfair Display", "Times New Roman", serif` and `--font-sans: "Manrope", "Segoe UI", system-ui, …` in `css/tokens.css`. There is no `@font-face`, font `<link>` or font file anywhere in the repository.
- **Runtime:** `document.fonts` is empty on every page; DevTools reports the H1 and wordmark rendering in Liberation Serif (Bold for the H1) and body copy in Inter.
- **Source:** headings set no `font-weight`, so H1–H3 inherit the browser's bold. Inner-page H1s use `.section__title` (`--font-size-3xl`, 36 px from 760 px) — the same size as every H2 section title on the same pages. Only the home hero has a distinct display scale (`--font-size-5xl`, 54.4 px at 1024 px+).
- **Design judgment:** the hierarchy is technically consistent but tonally heavy (bold transitional serif in every heading) and flat across page levels (page titles do not outrank section titles on inner pages). The tracked uppercase eyebrow is the main typographic accent and is repeated on every section, which dilutes it.

### Composition and rhythm

- **Runtime:** home sections measure 547, 545, 525, 488, 497 and 519 px at 1440 px; the page contains 13 bordered content boxes. Mobile home height is 6 402 px at 390 px.
- **Source:** `index.html`, `about.html`, `guide.html` use `.grid--three`/`.grid--two` of `.card`, `.steps__item` or `.testimonial` in nearly every section; alternate sections switch `--color-surface` bands.
- **Visual:** at 1440 px each section reads as the same unit repeated. At 820 px the hero's right-hand card becomes a narrow column whose heading wraps to four lines and whose body copy wraps every two or three words, while the stat tiles wrap their text inside equal boxes.
- **Design judgment:** the system is coherent but undifferentiated; trust points, services, process, testimonials and FAQ carry identical visual weight, so nothing in the sequence signals what matters most.

### Color and material language

- **Source:** ten color tokens declared once with `light-dark()` (IMP-TECH-02, Historical), three theme-aware shadow tokens, radius tokens up to `--radius-lg` (20 px) and pill buttons/badges.
- **Visual:** content boxes combine border, radius and shadow; in alternate sections their background switches to `--color-bg` (IMP-UI-05, Historical). Interactive elements (pill buttons), non-interactive labels (pill badges) and data tiles (hero stats) share the same rounded, filled vocabulary.
- **Design judgment:** the palette itself is well chosen for the subject and should be preserved. The material language is where generic quality enters: elevation is applied to informational text that has no reason to float, and pills are used for controls, labels and facts alike.

### Imagery and visual storytelling

- **Source and runtime:** zero `<img>` or `<picture>` elements on any page; `assets/icons`, `assets/illustrations` and `assets/src-images` contain only READMEs. The only illustration is the contact-page SVG — an arc and dot captioned with visible text "Mapa dojazdu (placeholder)".
- **Design judgment:** the absence of photography is defensible, even appropriate, for a funeral-home demonstration where representative imagery could easily feel staged or misleading. The issue is that nothing replaces it: no motif, no ornament, no typographic display moment carries the atmosphere instead.

### Components and interface expression

- **Source:** `.button--primary`/`--secondary` (IMP-UI-01, Historical), `.badge`, `.card`, `.steps__item`, `.testimonial`, `.pricing__card`, `.services-list__item`, `.accordion`.
- **Visual:** services render as six equal two-column boxes each with two pill badges; pricing renders as three equal elevated cards where the price is set in the sans face at 28 px bold; testimonials are three equal boxes with curly quotes in body text.
- **Design judgment:** the component set is solid as interface but under-expressive as content presentation: a price, a quotation, a process step and a value statement are all presented as the same box.

### Motion

- **Source:** `[data-reveal]` items fade and rise 18 px via `IntersectionObserver` (`js/main.js`, `.reveal` in `css/utilities.css`); buttons lift 1 px on hover; header compacts on scroll; all durations collapse to 0 ms under `prefers-reduced-motion`.
- **Design judgment:** motion is appropriately restrained and needs no new ambition. It is applied uniformly to almost every box, so it adds no hierarchy; this is noted for scope, not proposed as standalone work.

### Responsive art direction

- **Visual:** at 390 px every grid collapses to one column, producing a long uninterrupted sequence of boxed units; at 820 px the hero split is too narrow for its right-hand card.
- **Design judgment:** responsiveness is functionally sound (layout collapses correctly, no overflow observed) but is collapse rather than composition.

### Closing composition

- **Source and visual:** most marketing pages end with a single primary button directly above the footer (home: "Przejdź do poradnika"; services, pricing, guide similar); the footer is a well-structured four-column block on `--color-surface-alt`. The contact page's "Nasze biuro" card is stretched to the height of the form and its content is spread by large vertical gaps.
- **Design judgment:** the pages stop rather than close. There is no quiet final statement that returns to the core offer — immediate, 24/7 human contact — before the footer.

### Supporting-page consistency

- **Visual:** the legal pages (`legal-hero`, 70ch measure, hairline-ruled `legal-meta`, numbered `legal-nav`) are the most editorially refined part of the project.
- **Design judgment:** this family should be preserved as is and used as the reference for the marketing pages rather than redesigned.

## 4. Design prerequisites

| Prerequisite                                                          | Evidence                                                                                                                                                                                                                                                                                                     | Follow-up boundary                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declared typefaces are never loaded                                   | Source: `css/tokens.css` names "Playfair Display" and "Manrope"; no `@font-face`, font link or font file exists. Runtime: `document.fonts` empty; headings render in Liberation Serif Bold, body in Inter on this platform; other systems will fall back differently.                                        | Owner decides whether to load the named families or select others (with verified licence and Latin Extended-A coverage for Polish diacritics); a separate technical task then self-hosts or links them through canonical sources. Typographic design judgments in IMP-DESIGN-01 cannot be finalised until real faces render. |
| White text on the dark-theme accent is below 4.5:1                    | Source: `--color-on-accent: #fff` on `--color-accent` dark value `#c58a52` — computed ratio ≈ 2.94:1, used by `.button--primary`, `.site-header__cta`, `.back-to-top` and `.skip-link` at body-text sizes. Light theme computes ≈ 4.67:1.                                                                    | **Resolved:** `--color-on-accent` is now `light-dark(#fff, #141210)` with accent backgrounds unchanged; measured in the browser on all nine pages: 4.67:1 light, 6.35:1 dark, for all four consumers in light, dark and system themes.                                                                                       |
| Accent eyebrow text on the page background is marginal in light theme | Source: `.section__eyebrow` uses `--color-accent` `#9a6a3a` on `--color-bg` `#f6f0e8` at 13 px — computed ratio ≈ 4.12:1.                                                                                                                                                                                    | **Resolved:** `.section__eyebrow` uses the new `--color-accent-text` token, `light-dark(#8c5f33, #c58a52)`, with `--color-accent` unchanged; measured minimum 4.88:1 light (page background) and 5.81:1 dark (alternate section and hero card).                                                                              |
| Demonstration content presented as factual                            | Source: `index.html` testimonial lead "Autentyczne, spokojne słowa wdzięczności" above named quotations; "35+ lat doświadczenia" stat; named staff on `about.html`; footer © 2024 versus legal footer © 2026; visible "Mapa dojazdu (placeholder)" caption. README describes the project as a demonstration. | Owner content decision (keep as clearly representative demo content, relabel, or remove). Design work on the hero facts, testimonials and team presentation must not amplify unverified claims.                                                                                                                              |
| Contact-page office card stretched with distributed gaps              | Visual: `contact.html` at 1440 px; Source: `.card` is `display: grid` with `gap` inside a `.grid--two` row equal to the form height.                                                                                                                                                                         | Small layout correction belongs to UI scope; noted because IMP-DESIGN-08 recomposes this area.                                                                                                                                                                                                                               |

## 5. Creative design directions

| Dimension              | Paper & Stillness                                                                                                                                     | Garden of Remembrance                                                                                             | Stone & Light                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Philosophy             | Editorial, typographic memorial stationery: order, measure and hairlines carry dignity; the page behaves like a well-set order of service.            | Gentle, organic consolation through a botanical line-illustration system and floral still life.                   | Architectural calm: photography of interiors, light and material establishes place and seriousness.                                                                     |
| Typography             | Refined display serif at a light or regular weight with italic emphasis; sans for utility; numerals and small tracked labels as editorial devices.    | Softer, rounded humanist serif; more decorative initials.                                                         | Restrained, larger sans-led display over imagery.                                                                                                                       |
| Color / material       | Existing paper/bronze palette; hairline rules replace most shadows; elevation reserved for interactive surfaces.                                      | Palette extended with sage/greens; illustrated surfaces.                                                          | Darker, higher-contrast default; full-bleed image surfaces with overlays.                                                                                               |
| Composition            | Varied editorial layouts: statement, ruled index, numbered sequence, single quotation, quiet close.                                                   | Illustration-anchored sections, curved dividers.                                                                  | Image-led hero and section openers, alternating media/text splits.                                                                                                      |
| Imagery                | None required; one line-drawn signature motif derived from existing assets.                                                                           | Commissioned botanical illustrations and floral photography.                                                      | Professional photography of a real venue or carefully art-directed stock.                                                                                               |
| Motion                 | Existing reveal, applied more selectively.                                                                                                            | Subtle illustration reveals.                                                                                      | Slow image fades; risk of heavier motion.                                                                                                                               |
| Mobile                 | Typographic sequence with clear section identity; no image cropping problems.                                                                         | Illustrations must re-crop per width.                                                                             | Image crops and text-over-image legibility become the main mobile challenge.                                                                                            |
| Advantages             | Builds on the strongest existing assets (palette, legal-page editorial quality); no asset dependency; truthful for a demo; lowest accessibility risk. | Warm, approachable, distinctive.                                                                                  | Highest immediate atmosphere and perceived premium.                                                                                                                     |
| Trade-offs             | Depends on correct font loading and disciplined typography to avoid austerity.                                                                        | Botanical motifs are common in the sector; illustration set is a significant asset dependency; palette expansion. | Requires photography with verified provenance; representative venue imagery would misrepresent a demonstration project; image weight and theme overlays add complexity. |
| Technical implications | CSS and markup within existing components; one inline SVG motif; webfont loading prerequisite.                                                        | New SVG asset family; new tokens.                                                                                 | Image pipeline (`npm run images:convert` exists but is unused), responsive `<picture>` sources, overlay tokens for both themes.                                         |

## 6. Recommended direction

**Paper & Stillness** is recommended.

- **Rationale:** it matches the subject's register (ritual order, discretion, printed remembrance), it is the only direction that does not require assets the project does not have, and it stays honest for a demonstration site that cannot show a real venue or real families.
- **Strengths preserved:** the token palette and both theme editions, the serif/sans pairing intent, the monogram, generous spacing, the restrained motion and reduced-motion behavior, the legal-page family, and every existing interaction, ARIA, `data-*`, partial and navigation contract.
- **Primary design objective:** replace the single repeated boxed-section template with a small editorial vocabulary — statement, ruled list, numbered sequence, quotation, closing note — so that each section's role is legible from its form.
- **Intentional boundaries:** no photography, no palette expansion, no new framework or library, no new pages, no change to the shared header/footer structure or legal pages, no new content claims, no change to DOM reading order for visual effect.
- **Guiding hierarchy:** quiet statement → immediate human help → what we take care of → how it unfolds → calm close.

## 7. Prioritized design improvements

Priorities express design implementation value and dependency order, not defect severity. These proposals do not authorize implementation. Acceptance criteria describe future verification and are not claims about the current state.

### IMP-DESIGN-01 — Establish the editorial typographic voice

- **Status:** COMPLETED — implemented and verified.
- **Result:** Self-hosted Playfair Display and Manrope and established editorial typography tokens, clearer heading hierarchy, refined weights, lining numerals and restrained italic emphasis. Preserved HTML semantics, existing interactions and legal-page styling.
- **Verification:** Build, reference checks and lint passed; Chromium checks confirmed Polish diacritics, responsive layouts (320–1440 px), theme compatibility and no horizontal overflow. Prettier reported pre-existing issues; actual 200% zoom, platform-font inspection and other browsers were not verified.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Replace boxed repetition with a paper-and-hairline material language

- **Status:** COMPLETED — implemented and verified.
- **Result:** Informational content on the home, about, guide and services pages uses open blocks under hairline rules, start-edge-ruled quotations, ruled hero facts, a flat paper hero card and hairline-led text badges without shadows; elevation and filled pills are reserved for interactive and persistent elements such as buttons, header controls, back-to-top and pricing cards. DOM order, focus order, `data-reveal`, ARIA and interactions are unchanged; the contact-page office card, outside the affected area, keeps its raised panel for IMP-DESIGN-08.
- **Verification:** Build, reference checks and lint passed; Chromium checks at 320–1440 px and breakpoint boundaries in light, dark, system and manual themes found no overflow or informational shadows, normal-text contrast of at least 5.32:1 and visible decorative hairlines measuring 1.19–1.41:1. Prettier reported pre-existing issues; 200% zoom was approximated by viewport emulation, and other browsers were not verified.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Recompose the home hero around one quiet anchor

- **Status:** COMPLETED — implemented and verified.
- **Result:** The H1, lead and consultation/phone actions form the single hero statement; the elevated card became a heading-free ruled aside with the availability note, service summary, location and three facts, stacked below the statement up to 1023 px (a two-part band from 760 px) and a narrow caption column from 1024 px. Unverified claims were replaced with "Ceremonie dopasowane do potrzeb" and "Pomoc w formalnościach"; DOM order, `contact.html` and `tel:` links, focus order and `data-reveal` are preserved.
- **Verification:** Build, reference checks and lint passed; Chromium checks at 320–1440 px and the 759/760 and 1023/1024 boundaries in light, dark, system and manual themes found no overflow, both actions above the fold at 820 × 1180 and 1440 × 900, hero text contrast of at least 4.67:1, visible keyboard focus and pixel-identical following sections. Prettier warnings in the touched HTML and CSS files are pre-existing; 200% zoom was approximated by a 720 px viewport, not real browser zoom, and other browsers were not verified.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-04 — Give the home page a deliberate editorial sequence

- **Status:** COMPLETED — implemented and verified.
- **Result:** The home page now reads as a ruled trust statement list, a featured services index, a numbered process timeline (native ordered list), one centred quotation captioned "Przykładowa wypowiedź — treść demonstracyjna" in place of three fictional testimonials, and a narrower hairline-ruled FAQ close. Content outside the testimonials, links, heading levels, section order, `data-reveal`, the accordion ARIA contract and the shared components used on other pages are unchanged.
- **Verification:** The final stage passed `npm run build`, `npm run check:references` and `npm run lint`, and the complete five-section sequence was reviewed in Chromium at 320–1440 px (including the 760/1024 px boundaries) in light and dark themes and with a manual theme override, with DOM order matching visual order and no horizontal overflow; both FAQ items were operated by mouse, Enter and Space with correct `aria-expanded`/panel states, answers and the guide link stayed readable with JavaScript disabled and after a forced `main.js` load failure, and the hero, trust, services and process sections rendered pixel-identical to the baseline. 200% zoom was emulated (720 px viewport at DPR 2), not exercised as real browser zoom, and no screen reader was used.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-05 — Introduce a page-opening masthead for inner marketing pages

- **Status:** COMPLETED — implemented and verified.
- **Result:** A shared `.page-masthead` in `css/layout.css` replaces the opening `.section__header` on the about, services, pricing, contact and guide pages: an eyebrow led by a short accent hairline, the existing IMP-DESIGN-01 H1 tier at a 22ch measure and the lead at 62ch. Contact adds the optional ruled `dl` row with the phone and office address already on the page; copy, heading levels, content order and interaction contracts are unchanged.
- **Verification:** `npm run build` and `npm run check:references` passed; headless Chromium at 390, 820 and 1440 px in light and dark showed no horizontal overflow, H1 above every H2 and the first content block starting at or above 509 px in the 1440 × 900 viewport; pricing filter, accordion, form activation and focus order were exercised. 200% zoom was emulated as a 720 × 450 viewport at DPR 2, not as actual browser zoom.
- **Impact:** Medium
- **Effort:** Small

### IMP-DESIGN-06 — Present services and packages as a composed offering index

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** `services.html` `.services-list`, `pricing.html` `.pricing__card` presentation (`css/pages/services.css`, pricing rules in `css/components.css`).
- **Evidence:** Source: six equal `.services-list__item` boxes with two `.badge` pills each; three `.pricing__card` with price in the sans face at `--font-size-2xl` bold. Historical: the responsive pricing layout and filter constraint were completed in IMP-UI-02. Visual: services and pricing read as generic card grids.
- **Current state:** Offering content is boxed and labelled with pills; prices are set as plain bold figures.
- **Design judgment:** the offering is the substance of the site and deserves the most considered typographic treatment, closer to a printed order of service or price list than to a product grid.
- **Proposed improvement:** render services as a numbered, ruled editorial index with the descriptors set as quiet inline notes, and give the pricing packages an editorial expression — display numerals for price ranges, hairline structure, restrained emphasis — while keeping the existing three-column comparison layout and filter.
- **Expected value:** the offering reads as considered and trustworthy; prices gain clarity without visual aggression.
- **Implementation scope:** presentation of existing content only. Service fragment IDs and `scroll-margin-top` offsets, `data-pricing-card`, `data-category`, `data-details-toggle`, `aria-controls`, the status region and no-JS fallback unchanged; no price or service text altered. Deliverable as separate services and pricing slices.
- **Dependencies:** IMP-DESIGN-01, IMP-DESIGN-02.
- **Acceptance criteria:** services and packages use the shared editorial vocabulary in both themes at 390, 820 and 1440 px; fragment links from footers and home land on the correct, unobscured entry; filtering, detail disclosure and the polite status announcement behave as before; price figures align in tabular numerals; no content changes.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-07 — Develop one line-drawn signature motif from the existing brand vocabulary

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** brand mark usage, section transitions, the contact illustration, and selected editorial moments (hero, quotation, closing).
- **Evidence:** Source: the only brand devices are the circular `.brand-mark` monogram and the arc-and-dot SVG in `contact.html`; no other illustration exists in `assets/`. Visual: the monogram appears only at 40 px in header and footer.
- **Current state:** No graphic element carries the atmosphere in the absence of photography.
- **Design judgment:** a single, restrained line motif — derived from the monogram ring and the horizon arc already present — can give the site recognisability without introducing imagery that could misrepresent a demonstration business.
- **Proposed improvement:** define one motif family (for example a ring or horizon line drawn in the accent-soft hairline) with a small set of approved uses and sizes, implemented as inline, theme-aware SVG or CSS, and used sparingly at the moments defined by IMP-DESIGN-03, 04 and 08.
- **Expected value:** recognisable identity beyond the wordmark; atmosphere without asset or licensing risk.
- **Implementation scope:** decorative, `aria-hidden` SVG or CSS only; no raster assets, no animation beyond the existing reveal, no new dependencies. Brand-mark markup in partials changes only if the owner approves.
- **Dependencies:** IMP-DESIGN-02; owner approval of the motif.
- **Acceptance criteria:** the motif appears in no more than a small, documented number of places; it uses theme tokens and is visible but subordinate in both themes; it is hidden from assistive technology; it does not cause overflow at 390 px or 200% zoom.
- **Impact:** Medium
- **Effort:** Small

### IMP-DESIGN-08 — Compose a calm closing and a credible contact composition

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** page endings of the marketing pages before the footer; `contact.html` "Nasze biuro" aside and map illustration.
- **Evidence:** Source and visual: pages end with a lone primary button above the footer; the contact aside is stretched to form height with large internal gaps and shows the visible caption "Mapa dojazdu (placeholder)".
- **Current state:** Pages stop abruptly; the contact page's second column looks unfinished.
- **Design judgment:** for this subject the closing should restate, quietly, that a person is available now; the contact page should feel composed and honest about being illustrative.
- **Proposed improvement:** define one closing composition reused across marketing pages — a brief existing statement with the phone and contact action set in the editorial vocabulary, without adding competing CTAs — and recompose the contact aside as a structured office panel (address, contact links, availability) with an illustrative map treatment that is labelled appropriately for a demonstration.
- **Expected value:** a finished, consistent page ending; a contact page that matches the quality of the form beside it.
- **Implementation scope:** pre-footer composition and contact aside only; footer partials, form markup, `inert` contract, validation, fallback notice and `mailto:`/`tel:` links unchanged. Uses existing copy only.
- **Dependencies:** IMP-DESIGN-02; contact-card layout correction (section 4); owner decision on map labelling.
- **Acceptance criteria:** each marketing page ends with at most one primary action before the footer; the contact aside has no stretched empty gaps at 820 and 1440 px; the map is clearly illustrative and decorative; both themes, keyboard order and the no-JavaScript contact notice are verified.
- **Impact:** Medium
- **Effort:** Medium

## 8. Suggested implementation sequence and dependencies

1. **Owner approval** of the Paper & Stillness direction and the decisions in section 10.
2. **Prerequisites:** load the approved typefaces through canonical sources; correct the dark accent/on-accent contrast and the light eyebrow contrast; resolve demonstration-content labelling; fix the contact-card stretch (UI scope).
3. **Foundation:** IMP-DESIGN-01 (typographic voice), then IMP-DESIGN-02 (material language). These can be developed in parallel once fonts render, but 02 should be reviewed against 01's final type.
4. **Independent once the foundation exists:** IMP-DESIGN-05 (masthead) and IMP-DESIGN-07 (motif).
5. **Primary composition:** IMP-DESIGN-03 (hero).
6. **Dependent compositions:** IMP-DESIGN-04 (home sequence, sliced per section) and IMP-DESIGN-06 (services and pricing slices).
7. **Closing:** IMP-DESIGN-08.
8. **Integration review:** cross-page review of all nine pages in light, dark and system themes at mobile, tablet and desktop widths, confirming the legal family remains consistent with the new marketing typography.

No proposal requires new photography or other external assets. Verification for each slice should cover the affected widths (390, 820, 1440 px and the 760/1024 px breakpoints), both themes plus system mode, keyboard focus order, reduced motion, 200% zoom, actual font rendering, and — where markup changes — `npm run build` followed by `npm run check:references`, plus `npm run lint` when JavaScript is touched.

## 9. Verification performed and limitations

- **Source inspection:** all files listed in section 1.
- **Runtime checks:** pages served from a scratchpad copy with partials inlined (not via Vite); rendered in Chromium 1194 through the globally available Playwright; recorded `document.fonts`, computed font families, platform fonts via DevTools Protocol, section heights, box counts and image counts.
- **Visual inspection:** home (1440 light and dark, 820 light, 390 light), services, pricing, contact, about (1440 light), terms (1440 light, top). Screenshots for other pages and the dark theme at 820/390 were captured but not all were individually reviewed.
- **Themes:** light and dark via `prefers-color-scheme`; the manual theme toggle and stored preference were not exercised.
- **Interactions:** none exercised (menu, accordions, pricing filter, form, back-to-top were not operated).
- **Contrast:** computed from token hex values with the WCAG relative-luminance formula; not a formal audit and not measured on rendered pixels.
- **Commands executed:** read-only `git status`/`git log`, file inspection, a scratchpad partial-inlining script, a local static server, Playwright screenshot scripts and a contrast calculation. No npm script, install, build, formatter or project-writing command was run.
- **Not verified:** rendering with the intended Playfair Display/Manrope faces, other operating-system fallbacks, short or landscape viewports, zoom, and the privacy and cookies pages visually.

## 10. Owner decisions required

- **Creative direction:** approve Paper & Stillness, or select an alternative from section 5.
- **Typefaces:** confirm Playfair Display and Manrope or choose replacements; confirm licence and loading method (self-hosted or external).
- **Demonstration content:** decide how the testimonials ("Autentyczne…"), the "35+ lat doświadczenia" claim, named staff, the © 2024/2026 discrepancy and the map placeholder are presented or labelled.
- **Signature motif:** approve the use of a line-drawn motif and whether the header/footer monogram may evolve with it.
- **Photography:** confirm that the project remains photography-free for this design cycle.
