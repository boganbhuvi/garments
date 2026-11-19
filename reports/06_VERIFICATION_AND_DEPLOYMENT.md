# 06 — VERIFICATION, TESTING & OPERATIONAL MANUAL
## Production Build Verification, Test Checklist, & Staff Operational Guide

---

## 1. Production Build & Compilation Verification

The application codebase was built and validated using Vite and TypeScript compilers.

### Build Command:
```bash
npm run build
```

### Compiler Output:
```
> giriraj-garments-erp@1.0.0 build
> tsc && vite build

vite v6.4.6 building for production...
transforming...
✓ 2115 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.02 kB │ gzip:   0.56 kB
dist/assets/index-Cg8pEOsS.css   49.02 kB │ gzip:   8.70 kB
dist/assets/index--ead8xNM.js   758.14 kB │ gzip: 164.22 kB
✓ built in 5.80s
Process finished with exit code 0
```

- **TypeScript Compilation:** Zero errors.
- **Vite Bundling:** Production assets successfully generated in `dist/`.

---

## 2. Server Launch & Environment Setup

To start both the Express backend and the Vite frontend simultaneously:

```bash
# Install dependencies
npm install

# Start both Express server (Port 5000) and Vite frontend (Port 3001)
npm run dev:all
```

### Operational Ports:
- **Frontend Dashboard:** `http://localhost:3001`
- **Express Backend API:** `http://localhost:5000`
- **Backend Health Check:** `http://localhost:5000/api/health`

---

## 3. Comprehensive Verification Checklist

| Test Item | Verification Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **TC-01** | Header layout & padding | No content is obscured beneath the fixed top header | ✅ PASS |
| **TC-02** | Initial form state | Forms start completely blank (`value=""`); no dummy data | ✅ PASS |
| **TC-03** | Faint reference placeholders | Typical measurements appear in faint transparent grey placeholders | ✅ PASS |
| **TC-04** | "Clear / New" buttons | Page 1 & 2 "Clear" buttons reset inputs without refreshing the browser | ✅ PASS |
| **TC-05** | Dedicated Cutting page | Clicking "Open Work Order" opens a dedicated full page, not a popup | ✅ PASS |
| **TC-06** | Financial data suppression | Cutting sheet hides total bill, advance, balance, and rates | ✅ PASS |
| **TC-07** | Status change confirmation | Clicking "Start", "Complete", or "Hold" displays confirmation modal | ✅ PASS |
| **TC-08** | Live WhatsApp notification | Modal renders message preview; "Confirm & Send" opens WhatsApp chat | ✅ PASS |
| **TC-09** | Page 5 WhatsApp Chit | "WhatsApp Receipt" button formats booking chit and dispatches to phone | ✅ PASS |
| **TC-10** | Piece-level cutting status | Updating individual garment pieces prompts confirmation and updates DB | ✅ PASS |
| **TC-11** | Dual Persistence | Orders persist to MongoDB Atlas and synchronize with LocalStorage | ✅ PASS |
| **TC-12** | Print stylesheets | Order chits and cutting worksheets format cleanly on A4 printers | ✅ PASS |

---

## 4. Operational Guide for Staff

### A. Front Desk Staff (Order Booking)
1. **Customer Step:** Search for returning customer or enter new name, phone (+91), address, and choose garment counts.
2. **Measurement Step:** Enter customer body measurements in inches or cm. Refer to transparent placeholder numbers for standard measurements if needed.
3. **Design & Materials Step:** Select necklines, sleeves, linings, and record whether the customer brought their own cloth.
4. **Billing Step:** Verify item rates, add urgent surcharges if requested, record the Advance amount, and select delivery due date.
5. **Confirmation Step:** Review order, click **"Submit Order"**, click **"WhatsApp Receipt to Customer"** to deliver the booking chit, and click **"Print A4 Order Slip"** for the physical record.

### B. Cutting Master (Workshop Floor)
1. Navigate to the **Cutting Department Master** tab in the top header.
2. Review the **Work Queue** sorted by Due Date or Priority.
3. Click **"Open Work Order"** on an order to access the dedicated cutting sheet.
4. Review the **Material Checklist** (Confirm Customer Cloth, Lining, etc.).
5. Check measurements in the oversized grid and examine front desk style notes.
6. Click **"Start Cutting"** $\rightarrow$ Confirm and send live WhatsApp update to customer.
7. Once pieces are cut, click **"Mark Completed"** or update individual pieces $\rightarrow$ Confirm and send WhatsApp notification.
8. If cloth is deficient or delayed, click **"Hold"**, record reason, and dispatch alert to Front Desk and customer.

---

*Verified & Approved for Giriraj Garments Production Deployment.*
