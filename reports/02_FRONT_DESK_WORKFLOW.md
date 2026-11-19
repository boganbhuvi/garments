# 02 — FRONT DESK 5-STEP WORKFLOW
## Order Registration, Measurements, Styling, Billing, & Order Slips

---

## 1. Workflow Architecture Overview

The Front Desk interface manages the complete lifecycle of receiving a customer, recording precise tailoring parameters, detailing fabrics, processing payment, and issuing booking chits.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     PAGE 01     │ ──▶ │     PAGE 02     │ ──▶ │     PAGE 03     │ ──▶ │     PAGE 04     │ ──▶ │     PAGE 05     │
│ Customer Details│     │  Measurements   │     │ Design & Fabric │     │Billing & Payment│     │Final Review Slip│
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

A horizontal step indicator at the top persists across all screens, showing current progress, previous steps, and quick jump buttons.

---

## 2. Page-by-Page Specifications

### 📋 Page 01: Customer Information
- **Customer Search / Auto-Fill:** Fast search by Phone Number, Customer ID, or Name.
- **Auto-Generated Order Metadata:**
  - Auto-generated **Order ID / Bill Number** (e.g., `#GG-2026-1042`).
  - Auto-generated **Serial / Token Number** (e.g., `TK-042`).
  - Automatic order date timestamp.
- **Customer Identity Fields:**
  - Mandatory Customer Name.
  - Relationship Type: **D/O** (Daughter of) or **W/O** (Wife of) with dynamic relational field.
  - Mandatory 10-digit Primary Phone Number with auto-validation for WhatsApp delivery.
  - Secondary Phone Number.
  - Mandatory Full Delivery Address with Area / Location autocomplete.
- **Garment Manifest Selector:**
  - Quick multi-quantity selectors for Blouse, Kurti, Salwar / Bottom, Lehenga, Frock, and Western Wear.
  - "Clear / New Order" button on the meta strip to reset forms cleanly.

---

### 📏 Page 02: Body Measurements
- **Zero Pre-Filled Numbers:** Starts completely blank (`value=""`) preventing confusion with previous customer data.
- **Faint Transparent Reference Placeholders:**
  - Every input contains light italicized placeholder numbers representing typical tailoring benchmarks (`14.5`, `36.0`, `37.5`, etc.) in `text-slate-300` / `opacity-40`.
- **Unit Selector:** Instant toggle between **Inches (in)** and **Centimetres (cm)**.
- **Categorized Sections:**
  1. *Upper Body:* Blouse / Top Length, Shoulder Width, Full Chest, Upper Bust, Under Bust / Empire, Armhole, Apex / Point Length.
  2. *Neck & Collar:* Front Neck Depth, Back Neck Depth, Cross Front, Cross Back.
  3. *Sleeve Dimensions:* Sleeve Length, Sleeve Round / Bicep, Armhole Depth, Sleeve Opening.
  4. *Waist, Hips & Lower Body:* Natural Waist, Hip Circumference, Lower Waist, Seat.
  5. *Bottom & Trouser:* Salwar / Trouser Length, Thigh Round, Knee Round, Ankle Opening / Bottom Flair, Inseam, Outseam.
- **Customer Fitting Preference:** Regular, Snug / Body Fit, or Loose / Comfort Fit.

---

### 👗 Page 03: Garment Design & Materials
- **Dynamic Garment Cards:** Automatically enumerates each garment according to quantities selected in Page 1 (e.g., *Blouse 01, Blouse 02, Kurti 01, Bottom 01*).
- **Design Options per Piece:**
  - **Front Neck Styles:** Round, V-Neck, Square, Sweetheart, Boat Neck, Collar / Chinese, Potli Button Neck.
  - **Back Neck Styles:** Deep U, Low Square, Keyhole, Sheer Mesh, Backless with Dori, High Neck.
  - **Sleeve Styling:** Sleeveless, Cap Sleeve, Short (4-6"), Elbow Length (10-11"), 3/4th Sleeve, Full Sleeve, Balloon / Puff.
  - **Fastener & Openings:** Front Open Hooks, Back Open Hooks, Side Concealed Zip, Shoulder Zip.
  - **Pads & Lining:** Padded (Bust Cups), Non-Padded; Full Cotton Lining, Butter Crepe Lining, Satin Lining, No Lining.
  - **Bottom Style:** Chudidar, Palazzo, Cigarette Pant, Patiala, Dhoti, Straight Cut.
- **Material Tracking Checklist:**
  - Identifies whether fabric is **Customer Provided** or **Shop Provided**.
  - Tracks lining fabric meters, 2x2 contrast cloth, saree border attachment, piping, and dori/latkans.
- **Reference Image Attachment:** Allows attaching customer inspirational images and neck sketches.

---

### 💳 Page 04: Billing & Payment
- **Itemized Service List:**
  - Dynamic line items for each garment type with customizable stitching rates.
  - Add-on services: Hand Embroidery (Aari / Zardozi), Machine Embroidery, Lining Fabric Charges, Piping / Lace, Urgent Surcharge.
- **Financial Calculations:**
  - Subtotal computation.
  - Priority surcharge (Normal: 0%, Urgent: +₹300, Express 24-48hr: +₹600).
  - Optional GST (0%, 5%, 12%).
  - Real-time **Grand Total**.
- **Payment Processing:**
  - **Advance Paid** input (Cash, UPI / GPay, Card, Net Banking).
  - Automatically calculates **Balance Due** in bold high-contrast banner.
  - **Delivery Due Date & Time Slot** picker.

---

### 📄 Page 05: Final Review & Order Slip
- **Comprehensive Verification Sheet:** High-contrast review of customer info, measurements, styling directives, and billing balance.
- **A4 Printable Job Chit:**
  - Optimized for standard A4 printers using CSS print rules (`@media print`).
  - Formats an official Giriraj Garments header with shop address, contact, barcode/token, terms & conditions, and customer signature line.
- **Instant WhatsApp Booking Receipt:**
  - Dedicated green button: **"WhatsApp Receipt to Customer"**.
  - Dispatches an emoji-rich booking confirmation directly to the customer's phone number containing bill number, token, garment count, advance paid, and delivery due date.
- **Action Controls:**
  - **Save Draft:** Persists incomplete orders for later resumption.
  - **Submit Order:** Commits the order to MongoDB Atlas, changes cutting status to `NEW`, and cues it in the Cutting Department queue.
  - **+ Start New Order:** Resets state cleanly for the next customer.
