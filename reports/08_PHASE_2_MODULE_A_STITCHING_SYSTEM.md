# 08 — PHASE 2 MODULE A: STITCHING & TAILOR ALLOCATION SYSTEM
## Workshop Piece-Level Tailor Allocation, Progress Tracking, & Piece-Rate Wage Management

**System:** Giriraj Garments ERP  
**Module:** Phase 2 – Module A (Stitching Department Management)  
**Status:** ✅ Fully Implemented & Production Verified (`tsc && vite build` exit code 0)  

---

## 🧭 Executive Overview

Phase 2 Module A extends the Giriraj Garments ERP from the Cutting Department into the sewing floor. Once garments reach `CUTTING_COMPLETED`, cut cloth pieces are automatically cued into the **Stitching Department Master** queue.

The module provides an intuitive, high-contrast interface for senior Stitching Masters to:
1. **Allocate individual garments** to specialized master tailors (Blouse specialists, Kurti specialists, Salwar/Churidar specialists, etc.).
2. **Monitor garment-level progress** through distinct operational milestones.
3. **Automatically calculate piece-rate wages** and track payment settlements without double-counting.
4. **Print A4 workshop tailoring worksheets** containing strictly measurements and style directives without customer billing data.

```
CUTTING COMPLETED
       │
       ▼
STITCHING ALLOCATION (Assigned to Specialist Tailor with Agreed Piece Rate)
       │
       ▼
STITCHING IN PROGRESS (Machine sewing, darts, piping, linings)
       │
       ▼
OVERLOCK / HEMMING DONE (Interlock, hooks, latkans, bottom hem)
       │
       ▼
READY FOR QC (Garment Complete • Automatically credited to Tailor Wage Ledger)
```

---

## 🛠️ Key Components & Capabilities Implemented

### 1. Stitching Dashboard (`src/modules/stitching/StitchingDashboard.tsx`)
- **5 Top Summary Metrics:**
  - `Waiting for Stitching`: Cut cloth bundles awaiting tailor assignment.
  - `Allocated to Tailors`: Pieces assigned to sewing stations.
  - `Stitching In Progress`: Active sewing, darting, and assembling.
  - `Ready for QC`: Finished pieces ready for master inspection.
  - `Completed Today`: Daily production velocity count.
- **Unified Work Queue Table:**
  - Columns: Serial Number, Bill Number, Customer Name, Garment Piece, Due Date, Assigned Tailor, Stitching Status, Actions.
  - Instant search across Bill No, Token, Customer, Tailor, or Garment type.
  - Status filters: Pending Allocation, Allocated, In Progress, Overlock, Ready for QC, On Hold.

---

### 2. Tailor Master Directory (`src/modules/stitching/TailorMasterView.tsx`)
- **Configurable Master Tailor Profiles:**
  - Tailor ID (`TLR-001`, `TLR-002`, etc.)
  - Name, Phone (+91), Specialization, Experience Years, Default Piece Rate, Availability (`Available`, `Busy`, `On Leave`), Craftsmanship Notes.
- **Specializations Supported:**
  - *Blouse Specialist*, *Kurti Specialist*, *Churidar Specialist*, *Salwar Specialist*, *Saree / Falls*, *General Tailoring*, *Other*.
- **Initial Master Tailors Pre-Loaded:**
  - `TLR-001`: Murugan M (Master) — Blouse Specialist (14 yrs exp, ₹250 default rate)
  - `TLR-002`: Ravi Kumar — Kurti Specialist (9 yrs exp, ₹350 default rate)
  - `TLR-003`: Selvi Sundaram — Churidar Specialist (11 yrs exp, ₹200 default rate)
  - `TLR-004`: Anbuchelvan K — General Tailoring & Bottoms (16 yrs exp, ₹180 default rate)
  - `TLR-005`: Meenakshi R — Saree / Falls & Finishing (7 yrs exp, ₹120 default rate)
- Full administrative capabilities to register new tailors, edit rates, and deactivate/activate profiles.

---

### 3. Garment Allocation Modal (`src/modules/stitching/StitchingAllocationModal.tsx`)
- **One Order, Multiple Specialist Tailors:**
  - A single customer order (e.g. 3 Blouses, 1 Kurti, 1 Bottom) can be distributed across different specialist tailors.
  - Multi-select checkbox grid allows allocating 1, 2, or all pieces in a batch.
- **Configurable Piece Rate:**
  - Pre-fills from the tailor's default rate or garment category benchmark.
  - Allows the Stitching Master to adjust the rate based on fabric complexity or bridal work.
- **Scheduling & Tailor Directives:**
  - Records expected completion date (benchmarked against customer due date).
  - Workshop tailor directives (e.g., *"Attach gold piping along neckline and give extra 1.5 in seam margin"*).

---

### 4. Stitching Status Milestone Modal (`src/modules/stitching/StitchingStatusUpdateModal.tsx`)
- **Clear Operational Milestones:**
  1. `CUT PIECES ALLOCATED`
  2. `STITCHING IN PROGRESS`
  3. `OVERLOCK / HEMMING DONE`
  4. `READY FOR QC`
  5. `ON_HOLD`
- **Quality Safeguards:**
  - Enter observations, missing trim issues, or alteration rework instructions.
  - When marked `READY FOR QC`, the agreed piece rate is automatically credited to the tailor in the wage ledger.

---

### 5. Piece-Rate Wage Ledger (`src/modules/stitching/PieceRateWageLedger.tsx`)
- **Strict Anti-Double-Counting:**
  - Only eligible completed pieces (`READY_FOR_QC`) contribute to piece-rate earnings.
  - Prevents duplicate wage entries using unique composite keys (`WAGE-{orderId}-{garmentIndex}`).
- **Weekly Tailor Wage Summary:**
  - Displays: Tailor Name, Specialization, Completed Pieces, Gross Wage Earned, Total Amount Settled, and Remaining Balance Due.
- **Wage Settlement Dialog:**
  - Disburse wages in Cash, UPI / GPay, or Bank Transfer.
  - Records payment dates, amounts, reference notes, and marks wage entries as `Paid`.
  - Maintains a historical wage disbursement ledger.
  - One-click print for physical wage slips.

---

### 6. Printable Stitching Worksheet (`src/modules/stitching/StitchingWorksheetPrint.tsx`)
- **Zero-Billing Workshop Sheet:**
  - Displays strictly tailoring measurements in inches/cm, sleeve cut, neck designs, fitting, lining, and customer notes.
  - Completely hides customer billing, rates, advance, and balance figures.
  - Formatted for clean A4 printing (`@media print`).

---

## 💾 Dual Persistence Architecture

- **LocalStorage Cache:** Tailors, wage entries, and payment records persist instantaneously in `giriraj_garments_tailors_v1`, `giriraj_garments_wages_v1`, and `giriraj_garments_payments_v1`.
- **MongoDB Atlas Integration:**
  - `server/models/Tailor.ts`: Mongoose schema for tailor profiles with REST endpoints (`/api/tailors`).
  - `server/models/Order.ts`: Updated with `strict: false` to dynamically store garment-level `stitchingDetails` and overall order stitching status.
  - Reuses existing order documents without creating duplicates.

---

## ✅ Compilation & Test Verification

- **Command:** `npm run build`
- **TypeScript:** 0 errors
- **Vite Bundler:** Built in 5.30s (`dist/index.html` 1.02 kB, CSS 51.95 kB, JS 882.43 kB)
- **Exit Code:** `0` (Clean production build)
