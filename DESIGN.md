---
name: Atelier Precision
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#485f83'
  primary: '#092546'
  on-primary: '#ffffff'
  primary-container: '#233b5d'
  on-primary-container: '#8ea5cd'
  inverse-primary: '#b0c8f1'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#002a27'
  on-tertiary: '#ffffff'
  tertiary-container: '#00423d'
  on-tertiary-container: '#59b3aa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b0c8f1'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#30476a'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#99f2e8'
  tertiary-fixed-dim: '#7dd6cc'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  button-text:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.01em
  input-text:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system is engineered specifically for custom garment manufacturing and enterprise counter operations. The environment bridges high-volume tactile retail front desks with precision production lines. The aesthetic blends the surgical, data-dense utility of Linear and Stripe Dashboard with the uncompromising physical clarity required by front-desk supervisors and master cutters.

The core visual signature is structured, trustworthy, and crystalline:
- **Tone:** Authoritative, calm under high throughput, meticulously structured.
- **Approach:** Modern functional minimalism with deliberate high-contrast affordances, large touch and mouse hit targets, and unmistakable focus indicators designed to prevent data entry errors in rapid customer-facing situations.
- **Hierarchy:** High visual segregation of order states, structured field groups, explicit boundaries, and dedicated print-ready typographic outputs for workshop execution slips.

## Colors

The color palette is calibrated for long operational shifts under fluorescent workshop and showroom lighting, prioritizing optical endurance and zero visual ambiguity.

- **Primary (`#233B5D` - Deep Navy):** Anchors headers, active navigational states, primary execution buttons, and firm structural frames. Represents institutional stability and tailoring mastery.
- **Secondary (`#64748B` - Slate Gray):** Governs secondary actions, subtle borders, inactive step markers, and contextual metadata.
- **Tertiary / Accent (`#147D75` - Teal/Emerald):** Highlights key tailoring milestones, active tabs, measurement highlights, and batch identifiers.
- **Neutral & Surface:** Base canvas is set to `#F5F7FA` (Soft Neutral) to eliminate glare, with `#FFFFFF` (Pure White) dedicated to cards, table sheets, and data collection forms. Structural borders leverage `#CBD5E1` and `#E2E8F0` for razor-sharp grid clarity.
- **Semantic Feedback:**
  - **Success (`#16834A`):** Order completed, measurement verified, payment fully settled.
  - **Warning (`#D68B20`):** Approaching delivery deadlines, partial alterations pending, trial fitting delayed.
  - **Danger (`#D64545`):** Urgent rush-order alerts, overdue delivery, mandatory field omission markers (`*`).

## Typography

Typography is strictly utilitarian, using `Inter` with tuned tabular numeric figures (`tnum`) across all pricing, measurement, and tracking modules.

The hierarchy addresses the vision requirements of experienced desk staff working at standard desktop distances:
- **Display & Main Headings:** Scaled at 30–32px with robust 700 weight for clear section anchoring during phone orders.
- **Section Headings:** 22–24px Bold to establish unequivocal spatial compartments across dense forms.
- **Form Controls:** Field labels are locked at 17–18px Semi-Bold, paired directly with an 18px Medium input entry face.
- **Buttons:** 18px Bold to guarantee instantaneous recognition under rush counter conditions.
- **Mandatory Notations:** Required fields display a crisp, non-scaling `*` in Danger red (`#D64545`) positioned adjacent to the label with a distinct 4px gap.
- **Print Slips:** Measurement and cutting job chits switch to tabular monospaced numbers with clean horizontal rules, optimized for high-contrast thermal and laser printers.

## Layout & Spacing

The layout is built around a structured 12-column grid prioritizing dense, scannable data organization over decorative white space.

- **Grid Architecture:** 
  - Desktop (1280px+): 12 columns with 24px (`1.5rem`) gutters and 32px (`2rem`) outer margins.
  - Tablet (768px - 1279px): 8 columns with 16px (`1rem`) gutters.
  - Mobile / Counter POS Terminal (< 768px): 4 columns with 16px gutters and 16px margins.
- **Form Multi-Column Structure:** Standard order entry forms follow an 8:4 desktop ratio (primary measurement and garment configuration in the left 8 columns; live billing, advance payment, and customer ledger summary in the right 4 sticky columns).
- **Measurement Matrices:** Symmetrical tailoring inputs (Chest, Waist, Hip, Inseam, Collar, Shoulder) arrange into dedicated 3-column sub-grids to reflect traditional tailors' ledgers.
- **Tap & Click Targets:** Form inputs and buttons enforce a strict minimum bounding box height of 52px to facilitate rapid touch interactions on POS touchscreen counters.

## Elevation & Depth

To maintain high data focus and clean alignment, this design system minimizes heavy drop shadows, relying primarily on crisp borders, structural backgrounds, and deliberate surface stacking:

- **Base Layer:** Canvas background (`#F5F7FA`) establishes negative space.
- **Layer 1 (Cards & Workbenches):** Solid `#FFFFFF` surfaces with a 1.5px solid `#E2E8F0` border. No drop shadow.
- **Layer 2 (Floating Action Panels & Sticky Summaries):** `#FFFFFF` with a 1.5px `#CBD5E1` border and an ultra-subtle ambient shadow: `0 4px 12px -2px rgba(35, 59, 93, 0.06), 0 2px 4px -1px rgba(35, 59, 93, 0.04)`.
- **Layer 3 (Modals & Measurement Confirmations):** Solid surface bordered with `#CBD5E1`, supported by a direct scrim `rgba(15, 23, 42, 0.45)` and ambient elevation `0 16px 32px -4px rgba(35, 59, 93, 0.16)`.
- **Focus Depth:** Inputs do not use float shadows. Focused elements elevate through a 2px outer ring in `#147D75` with a 2px white offset, providing instant keyboard navigation tracking.

## Shapes

The design system employs a soft, restrained geometry (`roundedness: 1` — 4px / 0.25rem default) that communicates precision and efficiency.

- **Controls & Inputs:** 4px (`0.25rem`) border radius on all text inputs, select dropdowns, and buttons. This creates crisp, predictable corners that align cleanly in dense grid tables.
- **Panels & Cards:** 8px (`0.5rem`, `rounded-lg`) for major content panels, order detail sections, and billing summaries.
- **Status Badges & Chips:** 4px radius with high-contrast text and a 1px matching border. Pill shapes are intentionally avoided to maintain the architectural, industrial character of garment manufacturing.

## Components

### 1. Form Inputs & Selects
- **Height & Spacing:** Minimum height of 52px. Internal padding: 12px 16px.
- **Typographic Treatment:** Field label at 17–18px Semi-Bold (`#233B5D`) placed 8px above the field. Text inside field at 18px Medium (`#0F172A`).
- **Borders:** 1.5px solid border in `#CBD5E1`. On hover: `#94A3B8`. On focus: 2px solid `#147D75` with high contrast outline.
- **Mandatory Flag:** Red asterisk (`*`) rendered in `#D64545` font-weight 700 with a dedicated 4px left space from the label text.
- **Measurement Units:** Integrated right-aligned unit badges (e.g., `in`, `cm`, `mtr`) rendered in `#64748B` with `#F1F5F9` background.

### 2. Buttons
- **Primary:** Background `#233B5D`, text `#FFFFFF`, 18px Bold. Min height 52px. Padding 0 28px. Focus ring: 2px `#147D75`. Active state: `#1A2C46`.
- **Secondary:** Background `#FFFFFF`, border 1.5px solid `#64748B`, text `#233B5D`, 18px Bold.
- **Accent / Finalize Action:** Background `#147D75`, text `#FFFFFF`, min height 52px. Hover state: `#0E605A`.
- **Danger / Void Action:** Background `#FFFFFF`, border 1.5px solid `#D64545`, text `#D64545`.

### 3. Step Progress Indicator
- Horizontal pipeline at the top of the order flow (e.g., `1. Customer Info` → `2. Measurements` → `3. Garment & Fabrics` → `4. Billing & Advance`).
- **Completed Step:** Solid `#147D75` circle with white check icon; connecting line in `#147D75`.
- **Current Step:** High-contrast `#233B5D` badge with 18px Bold numbering and label text.
- **Upcoming Step:** Slate `#E2E8F0` badge with `#64748B` label text.

### 4. Enterprise Data Tables
- **Header:** Sticky top, 44px height, background `#F8FAFC`, border-bottom 2px solid `#CBD5E1`. Typographic style: 13px uppercase tracking (`letter-spacing: 0.05em`) in `#475569`.
- **Rows:** Alternating rows (`#FFFFFF` and `#F8FAFC`), height 56px, border-bottom 1px solid `#E2E8F0`. Hover highlight: `#F1F5F9`.
- **Numerical Alignment:** Tabular right-alignment for quantities, prices, and measurement figures.

### 5. Chips & Status Badges
- Compact rectangular badges (4px radius, 6px 12px padding).
- **Booked:** Background `#EFF6FF`, Border `#BFDBFE`, Text `#1E40AF`.
- **In Cutting:** Background `#F0FDFA`, Border `#99F6E4`, Text `#0F766E`.
- **Ready for Trial:** Background `#FEF3C7`, Border `#FDE68A`, Text `#92400E`.
- **Delivered / Completed:** Background `#F0FDF4`, Border `#BBF7D0`, Text `#166534`.
- **Urgent / Delayed:** Background `#FEF2F2`, Border `#FECACA`, Text `#991B1B`.

### 6. Print-Ready Order Slips & Cutting Job Cards
- Auto-switches via print stylesheet (`@media print`).
- Monochrome optimization: canvas turns `#FFFFFF`, borders drop to 1px hairline `#000000`, fonts switch to high-contrast black.
- Displays standard barcode/QR code at top right, structured 2-column measurement table, and master tailor sign-off lines.