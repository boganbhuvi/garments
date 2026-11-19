# 03 — CUTTING DEPARTMENT MANAGEMENT MODULE
## Dedicated Workshop Interface for the Cutting Master

---

## 1. Module Objective & Target User

The Cutting Department Head (Cutting Master) is responsible for fabric inspection, grain alignment, chalk marking, and precision scissor cutting. This user is **not** involved with billing or payments.

### Key Architectural Guidelines
- **Dedicated Page Layout:** Implemented as a full-page workspace ([`CuttingOrderDetailPage.tsx`](file:///e:/Garments/src/modules/cutting/CuttingOrderDetailPage.tsx)), avoiding cramped popup dialogs or floating tabs.
- **Strict Financial Privacy:** Suppresses all financial details (Total Bill, Advance, Balance, Service Rates).
- **Oversized Typography:** High-contrast, large measurement numerals (`22px` - `24px`) designed to be legible from cutting table distance.
- **Fast Navigation:** Instant toggle between work queue and individual job sheets.

---

## 2. Cutting Work Queue & Dashboard

The queue view ([`CuttingDashboard.tsx`](file:///e:/Garments/src/modules/cutting/CuttingDashboard.tsx)) provides real-time oversight of all orders in production.

### Summary Metrics Strip
1. **New Orders:** Orders recently placed by Front Desk awaiting fabric review.
2. **Ready for Cutting:** Orders where fabric and lining have arrived.
3. **Cutting In Progress:** Orders currently active on the cutting tables.
4. **Completed Today:** Finished orders forwarded to tailoring/stitching masters.

### Work Queue Filters & Sorting
- **Filter Tabs:** All Orders, New Orders, In Cutting, Completed, On Hold.
- **Sorting Modes:** Due Date (Earliest first), Order Date (Newest first), Priority (Express & Urgent first).
- **Multi-Field Search:** Instant search across Bill Number, Token/Serial, Customer Name, and Phone.

---

## 3. Dedicated Cutting Order Worksheet

When the Cutting Master opens any work order, the full-page sheet presents:

### A. Customer & Target Due Date Strip
- Order ID & Workshop Token Number.
- Customer Name & Primary Contact (+91).
- Target Delivery Date & Priority Flag (Express / Urgent / Normal).
- Dedicated **"WhatsApp Update"** and **"Print A4 Sheet"** buttons.

### B. Material Inspection Checklist
An interactive checklist to ensure scissors are never put to cloth until materials are accounted for:
- Customer Provided Fabric (`Received` / `Pending` / `Not Required`).
- Shop Provided Fabric (`Received` / `Pending` / `Not Required`).
- Lining Fabric (`Received` / `Pending` / `Not Required`).
- 2x2 Contrast Fabric (`Received` / `Pending` / `Not Required`).
- *Pending Material Warning Banner:* Displays an alert if required fabrics are missing.

### C. Piece-by-Piece Garment Breakdown
Every piece (e.g. *Blouse 01, Blouse 02, Kurti 01*) is rendered in its own high-contrast card:
- **Piece Status Toggles:** `Pending`, `In Progress`, `Completed`, `On Hold`.
- **Cutting Measurement Grid:**
  - Length, Shoulder, Bust, Chest, Waist, Hip, Armhole, Sleeve Length, Sleeve Round, Front Neck Depth, Back Neck Depth.
- **Design & Style Directives:**
  - Neck styles, Sleeve cut, Openings & hooks, Lining type, Fitting allowance.
- **Master Tailor Instruction Notes:** Directives entered by front desk (e.g., *"Customer requested deep V back neck with potli buttons"*).
- **Reference Images:** High-resolution design previews attached by customer.

---

## 4. Cutting Order Sheet (Printable A4 Worksheet)

The Cutting Master can generate a physical A4 worksheet ([`CuttingWorksheetPrint.tsx`](file:///e:/Garments/src/modules/cutting/CuttingWorksheetPrint.tsx)):
- Formatted specifically for standard thermal or laser A4 printers.
- **No Billing Figures:** Clean, distraction-free worksheet.
- Large chalk-table measurements table.
- Space for Master Cutter physical signatures and completion timestamp.
