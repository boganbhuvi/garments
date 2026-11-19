# 01 — SYSTEM ARCHITECTURE & DESIGN SYSTEM
## Giriraj Garments Enterprise ERP Application

---

## 1. Technical Stack Overview

| Layer | Technology | Version / Spec | Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + TypeScript | React 18.3, TS 5.5 | Type-safe enterprise state management and reusable modular components |
| **Bundler & Tooling** | Vite | Vite 6.4 | Sub-second HMR, optimized production tree-shaking and asset bundling |
| **Styling & Design** | Tailwind CSS | v3.4 | Utility-first, highly maintainable responsive layouts with custom color palette |
| **Icons & Visuals** | Lucide React | v0.460+ | Consistent, high-clarity iconography optimized for high contrast |
| **Backend API** | Node.js + Express | Express 4.19 | Lightweight, non-blocking REST API service for orders and health checks |
| **Database** | MongoDB Atlas | MongoDB 6.0+ Cloud | Cloud document database storing rich order specs, customer logs, and cutting details |
| **Persistence Cache** | HTML5 LocalStorage | Browser Native | High-speed cache enabling offline resilience and zero-delay UI responsiveness |
| **Printing & Slips** | CSS `@media print` | Standard CSS3 | Pixel-perfect A4 printing for workshop chits and customer booking slips |
| **Notifications** | WhatsApp Click-to-Chat | Universal URI | Native mobile/desktop WhatsApp dispatch without recurring API costs |

---

## 2. Design Philosophy & Accessibility

The primary users of Giriraj Garments include experienced, senior front desk personnel and master cutters. Accessibility is therefore a primary engineering priority.

### A. Strict Color Palette

```css
Primary:    #233B5D /* Royal Deep Navy - Header, branding, key badges */
Secondary:  #64748B /* Slate Grey - Subtle borders, secondary labels */
Background: #F5F7FA /* Light Cool Grey - Glare-free workspace background */
Surface:    #FFFFFF /* Pure White - Cards, tables, forms */
Accent:     #147D75 /* Deep Teal - Interactive highlights, active step */
Success:    #16834A /* Emerald Green - Completed statuses, submit, WhatsApp */
Warning:    #D68B20 /* Ochre Amber - Urgent orders, pending fabric alerts */
Danger:     #D64545 /* Crimson Red - On Hold status, critical alerts */
```

### B. Typography Standards

- **Page Titles:** `28px` – `32px` (`font-black tracking-tight`)
- **Section Headings:** `20px` – `22px` (`font-extrabold text-[#233B5D]`)
- **Field Labels:** `15px` – `17px` (`font-bold text-slate-700`)
- **Form Inputs:** `16px` – `18px` (`font-bold text-slate-900`)
- **Action Buttons:** `15px` – `18px` (`font-black`)
- **Scissor Workshop Measurements:** `20px` – `24px` oversized high-visibility display numbers.

---

## 3. Directory & Component Architecture

```
e:\Garments\
├── server\
│   └── index.ts                 # Express REST server & MongoDB Atlas connector
├── src\
│   ├── components\
│   │   ├── Header.tsx           # Global branded header with DB live status pill
│   │   ├── StepIndicator.tsx    # 5-step horizontal workflow stepper
│   │   ├── StatusChangeConfirmationModal.tsx  # Modal for status change & WhatsApp alert
│   │   └── ViewTransitions.tsx  # Smooth animated page transitions
│   ├── context\
│   │   └── OrderContext.tsx     # Centralized application state, DB sync, & offline cache
│   ├── modules\
│   │   └── cutting\
│   │       ├── CuttingDashboard.tsx        # Department queue, filters, and metrics
│   │       ├── CuttingOrderDetailPage.tsx  # Dedicated full-page workshop cutting sheet
│   │       └── CuttingWorksheetPrint.tsx   # Clean A4 printable worksheet without billing
│   ├── pages\
│   │   ├── Page1Customer.tsx         # Customer registration & order meta
│   │   ├── Page2Measurements.tsx     # Body measurements with ghost reference numbers
│   │   ├── Page3DesignMaterials.tsx  # Garment breakdown, styling, fabric checklist
│   │   ├── Page4Billing.tsx          # Line items, advance, balance, GST & payment
│   │   └── Page5SummarySlip.tsx      # Final review, A4 booking chit & WhatsApp share
│   ├── services\
│   │   ├── api.ts                    # Backend API client with offline fallback
│   │   └── whatsappService.ts        # Message generator & click-to-chat dispatcher
│   ├── types\
│   │   └── order.ts                  # Comprehensive TypeScript domain types
│   ├── App.tsx                       # Root container with navigation router
│   └── main.tsx                      # Application entrypoint
└── reports\                          # System review reports
```

---

## 4. State Management Lifecycle

```
[User Action] 
     │
     ▼
[OrderContext Action] (e.g., updateCuttingStatus, updateGarmentCuttingStatus)
     │
     ├── 1. In-Memory React State Updated (Zero UI Latency)
     │
     ├── 2. HTML5 LocalStorage Updated (Instant local persistence)
     │
     └── 3. Async REST Call -> Express Server (Port 5000)
             │
             ▼
         MongoDB Atlas (`giriraj_garments.orders`)
```

- If MongoDB is temporarily unreachable or offline, the app functions seamlessly via LocalStorage and automatically syncs when the connection is re-established.
