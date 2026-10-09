---
name: Vanden Broele Webshop
description: An order desk for public-sector buyers, a committed navy shell with mint reserved for actions and state, and a white order sheet whose aligned rows are the product.
colors:
  navy: "#163E65"
  navy-deep: "#0E2D4B"
  navy-line: "#2A5580"
  ink: "#0F3252"
  ink-muted: "#4A6580"
  ground: "#F1F5F9"
  paper: "#FFFFFF"
  line: "#DCE3EA"
  line-strong: "#B9C6D3"
  mint: "#2BEBCE"
  mint-hover: "#5BF1DA"
  mint-ink: "#0A6A5E"
  mint-soft: "#DDF9F4"
  amber-ink: "#7A4B00"
  amber-soft: "#FFF1D6"
  error: "#B3261E"
  error-soft: "#FCE9E7"
typography:
  headline:
    fontFamily: "Jost, ITC Avant Garde Gothic Std, Century Gothic, Avenir Next, sans-serif"
    fontSize: "clamp(26px, 4vw, 40px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Jost, ITC Avant Garde Gothic Std, Century Gothic, Avenir Next, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  field: "8px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "20px"
  page: "clamp(16px, 4vw, 40px)"
components:
  button-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 22px"
  button-mint-hover:
    backgroundColor: "{colors.mint-hover}"
  button-navy:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 22px"
  button-navy-hover:
    backgroundColor: "{colors.navy-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    height: "44px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "54px"
    padding: "0 16px 0 46px"
  order-sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.field}"
  buybox:
    backgroundColor: "#F7F9FB"
    rounded: "{rounded.field}"
    padding: "18px"
  chip:
    backgroundColor: "{colors.mint-soft}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.pill}"
---

# Design System: Vanden Broele Webshop

## Overview

**Creative North Star: "The Order Desk"**

A shop built as a desk where work gets done, not a window where books are displayed. A committed navy shell (top bar, search band, quick-order panel, footer) frames a single white order sheet on a cool, navy-tinted ground. The sheet's dense, aligned rows (small cover, title, format, price excl., price incl., stock, quantity and add) are the product. Mint appears only where the buyer acts or where state changes.

Density is deliberate: 14px body, 12px to 14px row padding, tabular numerals so price columns align and can be compared in one scan. Warmth comes from pill-shaped controls and the Jost headings, not from decoration. The system is recognisable with content removed: navy band, mint pills, aligned price columns.

**Key Characteristics:**
- Navy shell, white sheet, cool ground (#F1F5F9) with navy-tinted shadows.
- Mint reserved for actions and state; never a surface or cover colour.
- Jost headings over Inter body, tabular numerals everywhere.
- 8px radius on fields and panels, full pills on buttons, chips, quantity steppers and toasts.
- Procedural per-subject covers in navy, teal, slate and paper tones.

## Colors

A navy-and-white institutional palette with one bright accent kept scarce on purpose.

### Primary
- **Vanden Broele Navy** (navy): the shell. Top bar, search band, navy buttons, links, icon-button glyphs and the focus ring on light surfaces.
- **Deep Navy** (navy-deep): quick-order panel, footer, toast, pressed/hover navy, text on mint, and the scrim tint (50% alpha).
- **Navy Line** (navy-line): hairlines and outlines on navy (cart button, filter buttons, panel top border).

### Secondary
- **Action Mint** (mint): primary action pills (Zoeken, add, checkout), count badges, current-page nav underline, selection highlight, focus ring on navy. Hover is mint-hover.
- **Mint Ink** (mint-ink): the only mint-family colour used for text or marks on white (in-stock dot, resolved-row check, added-state label).
- **Mint Soft** (mint-soft): tinted fill for applied filter chips, the Connect cross-sell, order-placed notice, and the added button state, with a pale mint border (#9FEDE0).

### Tertiary
- **Amber Ink / Amber Soft** (amber-ink, amber-soft): backorder state (hollow dot plus text). Amber-soft is defined for state use.
- **Error / Error Soft** (error, error-soft): not-found quick-order rows, field validation and the remove-line hover.

### Neutral
- **Ink** (ink): body and heading text on light surfaces.
- **Muted Ink** (ink-muted): meta lines, labels, counts, help text.
- **Ground** (ground): page background, hover wash, neutral tags and notices.
- **Paper** (paper): order sheet, panels, drawers, fields.
- **Line / Line Strong** (line, line-strong): row dividers and panel borders; control outlines and the grand-total rule.
- Supporting tints used on table chrome: #F7F9FB (table header, buybox, sheet footer), #F7FAFC (row hover), #EEF3F7 (header hover), #E4ECF4 (format tag).

### Named Rules
**The Mint Means Act Rule.** Mint marks something the buyer can do or something that just changed (action, count, selection, current page, added). It never fills a cover plate, a card background or a decorative band. Text on white uses mint-ink, never mint.

**The Navy Shell Rule.** Brand colour is carried by the shell, not by content. Content sits on paper.

## Typography

**Display Font:** Jost (with ITC Avant Garde Gothic Std, Century Gothic, Avenir Next, sans-serif)
**Body Font:** Inter (with system-ui, Segoe UI, sans-serif)
**Label/Mono Font:** Inter for labels; the quick-order textarea alone uses the system monospace stack.

**Character:** Jost is a disclosed stand-in for the commercial ITC Avant Garde Gothic, which is first in the fallback chain so licensed use swaps in without change. Inter is the brand-pinned body face. Geometric headings over a neutral workhorse body.

### Hierarchy
- **Headline** (Jost 600, clamp(26px, 4vw, 40px), 1.15): search band h1; PDP and basket page titles use clamp(26px, 3.4vw, 36px).
- **Title** (Jost 600, 20px to 22px, 1.15): section heads, sheet heads, summary, quick-order and empty-state heads.
- **Row title** (Jost 600, 17px, 1.2, navy): title buttons in the order sheet; 15px to 16px in related lists and basket lines.
- **Price display** (Jost 600, 32px): PDP price; 22px for the basket grand total.
- **Body** (Inter 400, 14px, 1.5, tabular numerals): everything else. Inputs are 15px to 16px. Prose capped at 66ch.
- **Label** (Inter 600, 12px, 0.02em, sentence case): table column heads, tags at 12px/500, meta at 13px.

### Named Rules
**The Aligned Numbers Rule.** Tabular numerals are set on body; money and quantity columns are right-aligned. Never let prices sit in proportional figures.

## Layout

A single 1240px-max container with fluid side padding (clamp 16px to 40px). Page order: navy top bar, navy search band with filter menus, optional quick-order panel, results head (count, sort), the order sheet. Spacing rhythm is 8px base with 10, 12, 14, 18, 20, 28 steps; sections breathe at 22px to 28px. PDP page is three columns (280px cover, fluid content, 340px buybox); basket page is fluid plus a 380px sticky summary. At 1100px the PDP buybox drops full-width, the basket stacks and the quick-order panel goes single column. At 760px the table becomes stacked cards (cover, title, price, stock, full-width add row), the nav hides, the cart button collapses to icon and count, filter menus become bottom sheets, and sheets go full width.

## Elevation & Depth

Mostly flat and tonal: depth comes from navy against paper and 1px hairlines. Shadows are navy-tinted (rgba(14, 45, 75)) and appear only on things that float or that stand for a physical object.

### Shadow Vocabulary
- **Cover** (`0 1px 2px rgba(14,45,75,.3), 0 3px 8px rgba(14,45,75,.12)`): small cover; large cover uses `0 2px 4px rgba(14,45,75,.25), 0 12px 28px rgba(14,45,75,.22)`.
- **Popover** (`0 12px 32px rgba(14,45,75,.28), 0 2px 6px rgba(14,45,75,.12)`): filter menus.
- **Sheet** (`-12px 0 40px rgba(14,45,75,.25)`): slide-over and drawer.
- **Toast** (`0 8px 24px rgba(14,45,75,.35)`).

### Named Rules
**The Soft Navy Shadow Rule.** Shadows are blurred, navy-tinted and used only for floating layers and covers. No hard offset shadows.

## Shapes

Two radii and a pill. Fields, panels, sheets and the order sheet use 8px; small covers 3px, large 4px; focus ring 4px; filter-menu rows 6px. Every actionable control (buttons, cart button, filter buttons, chips, tags, quantity stepper, toast) is a full pill. Icon buttons are circles. Mobile bottom sheets round the top corners at 16px. Borders are 1px hairlines; no side-stripe accents.

## Components

### Buttons
- **Shape:** pill (999px), 44px high (54px large, 38px in table rows), 600 weight.
- **Mint (primary):** mint fill, deep navy text; hover lightens to mint-hover; active nudges 1px down.
- **Navy:** navy fill, white text; hover deepens.
- **Ghost:** transparent, navy text, line-strong outline; hover gains navy outline and white fill.
- **Added state:** mint-soft fill, mint-ink text, mint border. Disabled drops to 45% opacity.
- **Focus:** 2px navy ring, 2px offset (mint on navy surfaces); transitions 200ms with an ease-out-expo curve (cubic-bezier(0.22, 1, 0.36, 1)).

### Search field
- 54px high, white, 8px radius, 46px left padding for an inline icon, 16px text. Focus shows a 3px mint ring. Paired with a mint Zoeken pill.

### Filter menus
- Pill buttons outlined in navy-line on navy; open state deepens and outlines in mint; a mint count badge shows active choices. The popover is a white 8px panel with checkbox rows and a Done action; applied filters repeat as mint-soft chips with a remove control.

### Order sheet (signature)
- White 8px-radius container with hairline row dividers, a #F7F9FB sortable header, row hover wash, 44px cover thumbnails, right-aligned price columns (excl. above, incl. beneath on mobile), a dot-and-text stock indicator (filled mint-ink dot in stock; hollow amber ring backorder) and a pill quantity stepper beside a mint add button.

### Quick-order panel
- Deep navy band: monospace textarea left, resolved list right. Each resolved row has a check mark circle (mint-soft) or, when not found, an error-soft row with an error-coloured explanation.

### Sheets and basket
- Right slide-over (580px) and basket drawer (460px) on a 50% navy scrim, 320ms ease-out. Basket lines pair a 48px cover, Jost title, right-aligned price and quantity controls; totals end in a Jost grand total over a line-strong rule. The cart page adds a sticky summary with a PO-reference field (46px, 8px radius; error state turns border error and fill error-soft).

### Covers
- Procedurally generated SVG per subject, aspect 5:7, in navy, deep ink, mid blue, teal, pale blue and sand plates with a contrasting mark colour. Plates are never mint.

### Toast
- Deep navy pill, bottom centre, with an inline mint pill action.

## Do's and Don'ts

### Do:
- **Do** keep mint for actions and state, and use mint-ink for any mint-family text on white.
- **Do** right-align money and quantities with tabular numerals, and show excl. and incl. 6% VAT together.
- **Do** keep the shell navy and content on white paper over the #F1F5F9 ground.
- **Do** use 8px for fields and panels, full pills for buttons, chips and steppers.
- **Do** tint all shadows navy and keep them for floating layers and covers.
- **Do** swap in ITC Avant Garde Gothic through the existing font chain when licensed; Jost is the disclosed stand-in.

### Don't:
- **Don't** use mint as a cover plate, card background or decorative fill.
- **Don't** build a cover-grid storefront with a hero banner; the list is an order sheet.
- **Don't** set prices in proportional figures or left-align them.
- **Don't** use hard offset shadows or coloured side-stripe borders.
- **Don't** put brand navy on content surfaces; it belongs to the shell.
