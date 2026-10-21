---
name: Campus Registry
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#9b3e3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ba5551'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#7f2928'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system projects clarity, high-trust institutional reliability, and effortless utility. Geared toward students, faculty, and campus administrators navigating stressful moments of property loss and recovery, the interface prioritizes immediate comprehension over decorative flourish.

The visual direction combines **Modern Institutional Minimalism** with crisp, architectural utility:
- **Tone:** Objective, dependable, calm, and structured.
- **Visual Aesthetic:** Flat surfaces anchored by subtle 1px structural borders, deliberate whitespace, and high-contrast typographic discipline. 
- **Emotional Resonance:** Alleviates user panic through rapid searchability, unambiguous state indicators, and predictable navigational hierarchy.

## Colors

The palette is engineered around an architectural zinc grayscale, punctuated only by functional state indicators.

### Palette Architecture
- **Neutral Canvas & Surfaces:**
  - Background Canvas: `#fafafa` (Zinc 50)
  - Surface Default / Cards: `#ffffff`
  - Subdued Surface / Inputs: `#f4f4f5` (Zinc 100)
  - Border Default: `#e4e4e7` (Zinc 200)
  - Border Subtle: `#f4f4f5` (Zinc 100)
  - Text Primary: `#09090b` (Zinc 950)
  - Text Secondary: `#71717a` (Zinc 500)
  - Text Muted: `#a1a1aa` (Zinc 400)
- **Primary Accent ("FOUND" / Primary CTA):**
  - Base: `#059669` (Emerald 600)
  - Light Accent / Soft Surface: `#ecfdf5` (Emerald 50)
  - Border Accent: `#a7f3d0` (Emerald 200)
  - Hover: `#047857` (Emerald 700)
- **Warning Accent ("LOST" / Urgent Flag):**
  - Base: `#d97706` (Amber 600)
  - Light Accent / Soft Surface: `#fffbeb` (Amber 50)
  - Border Accent: `#fde68a` (Amber 200)
  - Hover: `#b45309` (Amber 700)

### Color Usage Rules
- Avoid decorative illustrations; rely on color exclusively for informational state encoding.
- `FOUND` records, successful claims, and completion triggers must strictly adopt the Emerald family.
- `LOST` records, pending verification flags, and time-sensitive warnings must strictly adopt the Amber family.
- Primary interaction buttons default to `#18181b` (Zinc 900) for general software navigation to preserve Emerald purely for confirmation and "Found" item workflows.

## Typography

Inter serves as the unified typographic engine across all viewports. Its tall x-height, clear open counters, and neutral voice make dense inventory lists, item serial codes, and location descriptions effortlessly scannable.

### Typographic Hierarchy
- **Display & Headings:** Formatted in semi-bold (`600`) weights with tight negative tracking (`-0.02em` to `-0.025em`) to maintain structural grounding and clear content boundaries.
- **Data & Tables:** Body styles stay strictly at regular (`400`) weight with default tracking for zero reading fatigue across multi-column data views.
- **Labels & Status Codes:** Uppercase labels use medium (`500`) or semi-bold (`600`) weights with positive letter tracking (`+0.04em` to `+0.05em`) to balance small font sizes (11px-12px) on badge components.

## Layout & Spacing

The layout is built upon an 8pt base grid system that scales across devices using a 12-column responsive layout engine on desktop, an 8-column layout on tablet, and a 4-column layout on mobile.

### Grid Rhythm & Reflow
- **Desktop (≥1024px):** 12 columns, fixed maximum canvas container width of `1280px`, `gutter-lg` (32px), and `margin-lg` (48px). Split-view workflows (item list on the left, full verification details on the right) use an asymmetrical 5-column / 7-column division.
- **Tablet (768px - 1023px):** 8 columns, `gutter-md` (24px), `margin-md` (32px). Secondary preview panels collapse into slide-over sheets.
- **Mobile (<768px):** 4 columns, `gutter` (16px), `margin` (16px). Form workflows and listings render in a single vertical stack. Sticky bottom action bars are required for primary reporting triggers.

### Component Spacing Principles
- Keep inner component padding predictable: small interactive controls (chips, status pills) use `space-xs` vertically and `space-sm` horizontally; cards and data containers use `space-lg` internally.

## Elevation & Depth

This design system avoids heavy shadows, skewing instead toward crisp **Flat Modernism with Low-Contrast Outlines**. Visual hierarchy is communicated through perimeter borders and surface tonality rather than dramatic drop shadows.

### Elevation Levels
- **Level 0 (Base Canvas):** `#fafafa`. Used for the root background behind cards and registry listings.
- **Level 1 (Cards, Data Cells, Containers):** Flat `#ffffff` surface, completely flush or sitting atop the canvas, enclosed by a 1px border of `#e4e4e7` (Zinc 200). Shadow: none or `0 1px 2px 0 rgba(0, 0, 0, 0.03)`.
- **Level 2 (Dropdowns, Popovers, Filter Menus):** Flat `#ffffff` surface with a 1px `#e4e4e7` border and an ultra-subtle ambient shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Modals, Proof-of-Ownership Dialogs):** `#ffffff` with a 1px `#e4e4e7` boundary and a controlled structural shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`. Dimmer backdrop is rendered in `#09090b` with an alpha of `0.4`.

## Shapes

The geometric identity utilizes clean, modern rounding (`roundedness: 2`, matching an 8px base radius). This strikes a deliberate balance between structured institutional discipline and contemporary software warmth.

### Radius Assignments
- **Core Controls (Inputs, Buttons, Dropdowns):** `0.5rem` (8px). Matches interaction focus rings seamlessly.
- **Badges & Status Chips:** `0.375rem` (6px) or full pill (`9999px`) for category tokens to cleanly separate micro-tags from structural inputs.
- **Structural Containers & Modals:** `0.75rem` (12px) to `1rem` (16px) for larger surface grouping without feeling cartoonish.
- **Images & Verification Uploads:** `0.5rem` (8px) bounded by a 1px `#e4e4e7` inset frame.

## Components

### Buttons
- **Primary Action (Report Item / Submit):** Background `#18181b`, Text `#ffffff`, Hover `#27272a`. Border-radius 8px. Height 40px (Desktop), 44px (Mobile).
- **Primary Confirm / Found CTA:** Background `#059669`, Text `#ffffff`, Hover `#047857`. Focus ring: 2px offset with `#10b981`.
- **Secondary / Outline:** Background `#ffffff`, Border 1px solid `#e4e4e7`, Text `#18181b`, Hover `#f4f4f5`.
- **Destructive / Flag:** Background `#ffffff`, Border 1px solid `#fecaca`, Text `#dc2626`, Hover `#fef2f2`.

### Status Badges & Chips
- **FOUND Badge:** Background `#ecfdf5`, Border 1px solid `#a7f3d0`, Text `#065f46`, Font Size 12px, Weight 600, uppercase letter-spacing. Left-aligned with an emerald circular dot indicator.
- **LOST Badge:** Background `#fffbeb`, Border 1px solid `#fde68a`, Text `#92400e`, Font Size 12px, Weight 600, uppercase letter-spacing. Left-aligned with an amber circular dot indicator.
- **Category Filter Chips:** Neutral `#f4f4f5` background, 1px transparent border, text `#3f3f46`. Selected state: `#18181b` background, text `#ffffff`.

### Input Fields & Search
- Surface: `#ffffff`, Border 1px solid `#e4e4e7`, Text `#09090b`, Placeholder `#a1a1aa`.
- Height: 40px. Padding: 0 12px.
- Focus state: Border color `#18181b` or `#059669`, with a crisp 1px box-shadow ring. No soft colored glows.
- Search inputs include a leading `#71717a` minimalist search icon and keyboard shortcut cue (`⌘K` / `Ctrl+K`) positioned on the trailing edge.

### Checkboxes & Radio Controls
- Base: 16px square (or circle), Border 1px solid `#d4d4d8`, background `#ffffff`.
- Checked: Background `#18181b` (or `#059669` in claim checklists) with a crisp white tick.

### Cards & Feed Tiles
- Background `#ffffff`, Border 1px solid `#e4e4e7`, Radius 8px or 12px.
- Internal layout: Thumbnail preview (1:1 ratio, 80px on desktop or full-width header on compact views), Item Title (`title-md`), Category chip, Location tag (Building/Room), and Date timestamp (`body-sm`, `#71717a`). Hover state transitions the border color from `#e4e4e7` to `#a1a1aa`.

### Specialized Domain Component: Claim & Verification Timeline
- Vertical track line in 1px `#e4e4e7`.
- Verification nodes:
  - Completed: Solid `#059669` circle with white check icon.
  - Active Review: Solid `#d97706` pulsing dot indicator.
  - Pending: Neutral `#e4e4e7` hollow circle.