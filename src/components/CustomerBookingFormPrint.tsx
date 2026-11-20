/**
 * CustomerBookingFormPrint
 *
 * Recreates the Giriraj City Garments physical booking worksheet for A4 portrait printing.
 * Redesigned for physical THREE-FOLD paper format:
 *   - FOLD 1 (Top ~92mm): Giriraj City Garments header, Due Date, Form 1,
 *     Bill No, S.No, Date, Name, R.No, P.No, Items (enlarged & prominent),
 *     Father Name, Husband Name, Address, compact SELF / SHOP with up to 3 recent
 *     customer phone numbers, and Garment Quantities with RED highlighted category names.
 *   - FOLD 2 (Middle ~95mm): Symmetrical tailoring details section containing
 *     Lining, Neck (large writing area), Sleeve (SL), BH, Slit, Zip, Fitting, Bottom,
 *     and other instructions — with clean blank handwriting areas & no checkboxes.
 *   - FOLD 3 (Bottom): PRESERVED EXACTLY AS EXISTING:
 *     Auto-populated NAME, R.NO, DUE DATE, and 3-line SPECIAL WORKSHOP REMARKS / NOTES.
 */

import { Order } from '../types/order';

function buildBookingFormHTML(order: Order): string {
  const c = order.customer;

  const billNo      = c.billNumber  || order.id || '';
  const sNo         = order.serialNumber || '';
  const date        = c.date        || '';
  const name        = c.customerName || '';
  const pNo         = c.primaryPhone ? `+91 ${c.primaryPhone}` : '';
  const address     = c.fullAddress || [
    c.doorNo, c.street, c.areaLocation, c.city,
    c.state, c.pinCode ? `PIN ${c.pinCode}` : ''
  ].filter(Boolean).join(', ');

  const fatherName  = c.relationshipType === 'D/O' ? (c.fatherName  || '') : '';
  const husbandName = c.relationshipType === 'W/O' ? (c.husbandName || '') : '';

  const totalQty    = order.garmentQuantities?.reduce(
    (s, g) => s + (Number(g.quantity) || 0), 0
  ) || 0;
  const itemsStr    = totalQty > 0 ? String(totalQty) : '';
  const rNo         = c.customerId || '';
  const dueDate     = order.billing?.dueDate || '';

  // Extract up to 3 recent / registered customer mobile numbers
  const allPhones: string[] = [];
  if (c.primaryPhone && c.primaryPhone.trim()) {
    allPhones.push(c.primaryPhone.trim());
  }
  if (c.secondaryPhone && c.secondaryPhone.trim()) {
    // In case secondaryPhone has comma-separated values from legacy registers
    const secParts = c.secondaryPhone.split(',').map(p => p.trim()).filter(Boolean);
    for (const p of secParts) {
      if (!allPhones.includes(p)) allPhones.push(p);
    }
  }
  if (Array.isArray(c.additionalPhones)) {
    for (const p of c.additionalPhones) {
      const cleanP = (p || '').trim();
      if (cleanP && !allPhones.includes(cleanP)) allPhones.push(cleanP);
    }
  }
  const recent3Phones = allPhones.slice(0, 3);

  // Map category quantities for the quantity grid
  const getQty = (catName: string) => {
    const item = order.garmentQuantities?.find(
      g => g.category.toLowerCase() === catName.toLowerCase() || g.label.toLowerCase() === catName.toLowerCase()
    );
    return item && Number(item.quantity) > 0 ? String(item.quantity) : '';
  };

  const topsQty     = getQty('Tops') || getQty('Kurtis');
  const bottomQty   = getQty('Bottom') || getQty('Bottoms');
  const blowsQty    = getQty('Blows') || getQty('Blouses');
  const sareeQty    = getQty('Saree') || getQty('Sarees');
  const fallsQty    = getQty('Falls');
  const nightyQty   = getQty('Nighties') || getQty('Nighty');
  const othersQty   = getQty('Others') || getQty('Other Items');
  const dhupattaQty = getQty('Dupatta') || getQty('Dhupatta');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Booking Form – ${name || billNo}</title>
<style>
/* ── RESET ───────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  font-family: Arial, Helvetica, sans-serif;
  background: #fff;
  color: #000;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── PAGE SETUP ──────────────────────────────────────────── */
@page {
  size: A4 portrait;
  margin: 5mm;
}
@media print {
  .no-print { display: none !important; }
  .page { overflow: hidden !important; }
}

/* ── PAGE CONTAINER (A4 Portrait ~287mm available) ──────── */
.page {
  width: 200mm;
  height: 287mm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  font-size: 9.5pt;
  line-height: 1.25;
  border: 1.5px solid #000;
  padding: 2mm;
  margin: 0 auto;
}

/* ── THREE-FOLD SECTIONS (PHYSICAL FOLD DIVISIONS) ──────── */
.fold-section {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Symmetrical Folds 1 & 2 with matching borders and proportions */
.fold-1 {
  height: 98mm;
  max-height: 98mm;
  border-bottom: 2px dashed #666;
  padding-bottom: 1.5mm;
  margin-bottom: 1.5mm;
  overflow: hidden;
  position: relative;
}

.fold-2 {
  height: 122mm;
  max-height: 122mm;
  border-bottom: 2px dashed #666;
  padding-bottom: 1.5mm;
  margin-bottom: 1.5mm;
  overflow: hidden;
  position: relative;
}

.fold-3 {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ── FOLD 1: HEADER & SHOP BRANDING ──────────────────────── */
.shop-header {
  text-align: center;
  border-bottom: 2px solid #000;
  padding-bottom: 1mm;
  margin-bottom: 1mm;
  flex-shrink: 0;
}
.shop-name {
  font-size: 16pt;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  line-height: 1.1;
  color: #000;
}
.shop-tagline {
  font-size: 8.5pt;
  margin-top: 0.3mm;
  color: #333;
}

/* ── DUE DATE / FORM 1 ROW ───────────────────────────────── */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1mm 1.5mm;
  border-bottom: 1.8px solid #000;
  font-size: 10pt;
  font-weight: bold;
  margin-bottom: 1mm;
  background: #f8fafc;
  flex-shrink: 0;
}
.due-line {
  display: inline-block;
  min-width: 45mm;
  border-bottom: 1.5px solid #222;
  margin-left: 1mm;
  vertical-align: bottom;
  padding: 0 2mm;
  font-weight: 800;
  color: #b91c1c; /* Prominent Due Date in red */
}

/* ── CUSTOMER INFO TABLES ────────────────────────────────── */
table { width: 100%; border-collapse: collapse; flex-shrink: 0; }
.info-table { border: 1.8px solid #000; }
.info-table + .info-table { border-top: none; }
.info-table td {
  border: 1px solid #000;
  padding: 1mm 2mm;
  vertical-align: middle;
}
.lbl { font-weight: 800; font-size: 9pt; white-space: nowrap; color: #111; }
.val-block { font-size: 9.5pt; font-weight: 700; color: #000; }

/* ── PROFESSIONAL ACCENT COLOR CODING ────────────────────── */
.accent-name {
  color: #1e3a8a; /* Deep Navy */
  background: #eff6ff;
  padding: 0.5mm 1.5mm;
  border-radius: 2px;
  font-weight: 800;
  display: inline-block;
}
.accent-sno {
  color: #065f46; /* Deep Emerald */
  background: #ecfdf5;
  padding: 0.5mm 1.5mm;
  border-radius: 2px;
  font-weight: 800;
  display: inline-block;
}
.accent-rno {
  color: #7c2d12; /* Deep Amber / Rust */
  background: #fffbeb;
  padding: 0.5mm 1.5mm;
  border-radius: 2px;
  font-weight: 800;
  display: inline-block;
}
.accent-phone {
  color: #1e293b; /* Slate Dark */
  background: #f1f5f9;
  padding: 0.5mm 1.5mm;
  border-radius: 2px;
  font-weight: 800;
  letter-spacing: 0.3px;
  display: inline-block;
}

/* ── PROMINENT ITEMS BOX ─────────────────────────────────── */
.items-cell {
  background: #fef2f2;
  text-align: center;
  padding: 0 1mm !important;
}
.items-badge {
  font-size: 11pt;
  font-weight: 900;
  color: #b91c1c;
  display: inline-block;
}

.addr-val {
  font-size: 9pt;
  font-weight: 600;
  display: block;
  min-height: 4.5mm;
  word-break: break-word;
  white-space: normal;
  line-height: 1.15;
}

/* ── COMPACT SELF / SHOP & RECENT PHONES SECTION ─────────── */
.middle-fold1-row {
  display: flex;
  gap: 1.5mm;
  margin-top: 1mm;
  flex-shrink: 0;
}
.compact-self-shop {
  width: 58mm;
  border: 1.8px solid #000;
  border-collapse: collapse;
  flex-shrink: 0;
}
.compact-self-shop td {
  border: 1px solid #000;
  padding: 0.8mm 1.5mm;
  font-size: 8.5pt;
  vertical-align: middle;
}
.self-shop-hdr {
  font-weight: 900;
  font-size: 9pt;
  text-align: center;
  width: 14mm;
  background: #f8fafc;
}
.line-blank {
  display: inline-block;
  width: 13mm;
  border-bottom: 1.2px solid #555;
  height: 3.5mm;
}

/* Recent Phones Area inside Fold 1 */
.phones-box {
  flex: 1;
  border: 1.8px solid #000;
  padding: 1mm 2mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fafafa;
}
.phones-hdr {
  font-size: 8pt;
  font-weight: 800;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: 0.4px;
  margin-bottom: 0.5mm;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5mm;
}
.phones-list {
  display: flex;
  gap: 2mm;
  align-items: center;
  flex-wrap: wrap;
}
.phone-chip {
  font-size: 8.5pt;
  font-weight: 700;
  color: #0f172a;
  background: #e2e8f0;
  padding: 0.5mm 1.8mm;
  border-radius: 3px;
  border: 1px solid #cbd5e1;
}

/* ── NO. OF QUANTITIES (WITH RED HIGHLIGHTED GARMENT NAMES) ─ */
.qty-section {
  margin-top: 1mm;
  border-top: 1.8px solid #000;
  padding-top: 0.8mm;
  flex-shrink: 0;
}
.qty-hdr {
  font-weight: 900;
  font-size: 9.5pt;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 0.6mm;
}
.qty-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1mm 2mm;
}
.qty-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8.5pt;
  border: 1px solid #bbb;
  padding: 0.6mm 1.5mm;
  background: #fff;
}
/* Requirement 5: Garment names MUST be highlighted in RED */
.garment-name-red {
  color: #dc2626 !important; /* Bold vivid red */
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.qty-box {
  width: 9mm;
  height: 4.8mm;
  border: 1.5px solid #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 9pt;
  background: #fff;
  flex-shrink: 0;
}

/* ── FOLD 2: TAILORING DETAILS SECTION (SYMMETRICAL LAYOUT) ─ */
.fold-2-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.fold-2-hdr {
  font-size: 10pt;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 1mm;
  border-bottom: 1.8px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2mm;
  background: #f8fafc;
  padding: 1mm 2mm;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2mm;
  flex: 1;
  min-height: 0;
}
.col-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5mm;
  height: 100%;
}
.section-box {
  border: 1.5px solid #000;
  padding: 1.2mm 2mm;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.section-box-title {
  font-weight: 900;
  font-size: 9.5pt;
  margin-bottom: 0.5mm;
  color: #000;
  display: flex;
  justify-content: space-between;
}

/* ── HANDWRITING WRITING LINES & AREAS ───────────────────── */
.write-box-sm {
  width: 100%;
  border-bottom: 1.2px solid #666;
  min-height: 5mm;
  flex: 1;
}
.write-box-md {
  width: 100%;
  border-bottom: 1.2px solid #666;
  min-height: 7mm;
  flex: 1;
}
.write-area-fill {
  width: 100%;
  border: 1.2px solid #888;
  flex: 1;
  min-height: 28mm;
  margin-top: 0.8mm;
  background: #fafafa;
}

/* ── FOLD 3: PRESERVED EXACTLY AS EXISTING ───────────────── */
/* STRICT REQUIREMENT: DO NOT MODIFY THE THIRD FOLD */
.bottom-section {
  border: 2px solid #000;
  margin-top: 1mm;
  padding: 2mm 3mm;
  flex-shrink: 0;
  background: #fff;
}
.bottom-strip {
  display: flex;
  gap: 6mm;
  padding-bottom: 2mm;
  border-bottom: 1.5px dashed #444;
}
.bottom-field {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 2mm;
}
.bottom-field .lbl {
  font-size: 10.5pt;
  font-weight: 900;
}
.bottom-field .populated-val {
  font-size: 11pt;
  font-weight: 700;
  color: #000;
  border-bottom: 1.5px solid #222;
  padding: 0.5mm 2mm;
  flex: 1;
  display: inline-block;
}
.bottom-notes-area {
  margin-top: 2mm;
  display: flex;
  flex-direction: column;
  gap: 1mm;
}
.bottom-notes-title {
  font-size: 10pt;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.bottom-notes-lines {
  display: flex;
  flex-direction: column;
  gap: 2.5mm;
  padding-top: 1mm;
}
.notes-line {
  border-bottom: 1.2px solid #888;
  height: 6mm;
  width: 100%;
}

/* ── PRINT BUTTON (screen only) ──────────────────────────── */
.no-print {
  text-align: center;
  padding: 10px 16px;
  background: #f1f5f9;
  border-bottom: 2px solid #ccc;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}
.no-print button {
  padding: 8px 26px;
  font-size: 14px;
  font-weight: bold;
  background: #233B5D;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.no-print button.close-btn { background: #64748b; }
</style>
</head>
<body>

<!-- on-screen buttons only -->
<div class="no-print">
  <button onclick="window.print()">🖨️&nbsp; Print Form</button>
  <button class="close-btn" onclick="window.close()">✕&nbsp; Close</button>
</div>

<div class="page">

  <!-- ========================================================
       FOLD 1: PRIMARY CUSTOMER & ORDER INFORMATION (TOP FOLD)
       ======================================================== -->
  <div class="fold-section fold-1">

    <!-- HEADER -->
    <div class="shop-header">
      <div class="shop-name">GIRIRAJ CITY GARMENTS</div>
      <div class="shop-tagline">Ladies Tailoring &amp; Garments</div>
    </div>

    <!-- DUE DATE / FORM 1 -->
    <div class="header-row">
      <span>DUE DATE :&nbsp;<span class="due-line">${dueDate ? dueDate : '&nbsp;'}</span></span>
      <span style="font-size:10pt; font-weight:900; letter-spacing:0.5px;">FORM 1 (THREE-FOLD WORKSHEET)</span>
    </div>

    <!-- ROW 1: BILL NO / S.NO / DATE -->
    <table class="info-table">
      <tr>
        <td class="lbl" style="width:20mm;">BILL NO&nbsp;:</td>
        <td style="width:46mm;"><span class="val-block">${billNo}</span></td>
        <td class="lbl" style="width:13mm;">S.NO&nbsp;:</td>
        <td style="width:34mm;"><span class="val-block accent-sno">${sNo}</span></td>
        <td class="lbl" style="width:13mm;">DATE&nbsp;:</td>
        <td><span class="val-block">${date}</span></td>
      </tr>
    </table>

    <!-- ROW 2: NAME / R.NO / P.NO / ITEMS (WITH PROMINENT ITEMS BOX & ACCENT COLORS) -->
    <table class="info-table">
      <tr>
        <td class="lbl" style="width:15mm;">NAME&nbsp;:</td>
        <td style="width:50mm;"><span class="val-block accent-name">${name}</span></td>
        <td class="lbl" style="width:13mm;">R.NO&nbsp;:</td>
        <td style="width:26mm;"><span class="val-block accent-rno">${rNo}</span></td>
        <td class="lbl" style="width:13mm;">P.NO&nbsp;:</td>
        <td style="width:36mm;"><span class="val-block accent-phone">${pNo}</span></td>
        <td class="lbl" style="width:15mm; text-align:center;">ITEMS&nbsp;:</td>
        <td class="items-cell" style="width:20mm;"><span class="items-badge">${itemsStr || '0'}</span></td>
      </tr>
    </table>

    <!-- ROW 3: FATHER NAME / HUSBAND NAME -->
    <table class="info-table">
      <tr>
        <td class="lbl" style="width:30mm;">FATHER NAME&nbsp;:</td>
        <td style="width:68mm;"><span class="val-block">${fatherName}</span></td>
        <td class="lbl" style="width:32mm;">HUSBAND NAME&nbsp;:</td>
        <td><span class="val-block">${husbandName}</span></td>
      </tr>
    </table>

    <!-- ROW 4: ADDRESS -->
    <table class="info-table">
      <tr>
        <td class="lbl" style="width:20mm; vertical-align:top; padding-top:1mm;">ADDRESS&nbsp;:</td>
        <td><span class="addr-val">${address}</span></td>
      </tr>
    </table>

    <!-- ROW 5: REDUCED SELF / SHOP SECTION & RECENT 3 CUSTOMER PHONES -->
    <div class="middle-fold1-row">
      <!-- Reduced Self / Shop Table -->
      <table class="compact-self-shop">
        <tr>
          <td rowspan="3" class="self-shop-hdr">SELF</td>
          <td style="width:6mm; font-weight:800;">T</td>
          <td><span class="line-blank"></span></td>
          <td rowspan="3" class="self-shop-hdr">SHOP</td>
          <td style="width:6mm; font-weight:800;">T</td>
          <td><span class="line-blank"></span></td>
        </tr>
        <tr>
          <td style="font-weight:800;">B</td>
          <td><span class="line-blank"></span></td>
          <td style="font-weight:800;">B</td>
          <td><span class="line-blank"></span></td>
        </tr>
        <tr>
          <td style="font-weight:800;">D</td>
          <td><span class="line-blank"></span></td>
          <td style="font-weight:800;">D</td>
          <td><span class="line-blank"></span></td>
        </tr>
      </table>

      <!-- Customer Recent 3 Contact Numbers -->
      <div class="phones-box">
        <div class="phones-hdr">Customer Registered Phone Numbers (${recent3Phones.length} Available)</div>
        <div class="phones-list">
          ${
            recent3Phones.length > 0
              ? recent3Phones.map((ph, idx) => `<span class="phone-chip">#${idx + 1}: ${ph}</span>`).join('')
              : '<span style="font-size:8.5pt; color:#888; font-style:italic;">No phone numbers on file</span>'
          }
        </div>
      </div>
    </div>

    <!-- ROW 6: NO. OF QUANTITIES (GARMENT NAMES IN BOLD RED) -->
    <div class="qty-section">
      <div class="qty-hdr">NO. OF :</div>
      <div class="qty-grid">
        <div class="qty-item"><span class="garment-name-red">TOPS</span><span class="qty-box">${topsQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">BOTTOM</span><span class="qty-box">${bottomQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">BLOWS</span><span class="qty-box">${blowsQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">SAREE</span><span class="qty-box">${sareeQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">FALLS</span><span class="qty-box">${fallsQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">NIGHTY</span><span class="qty-box">${nightyQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">OTHERS</span><span class="qty-box">${othersQty}</span></div>
        <div class="qty-item"><span class="garment-name-red">DHUPATTA</span><span class="qty-box">${dhupattaQty}</span></div>
      </div>
    </div>

  </div><!-- end fold-1 -->

  <!-- ========================================================
       FOLD 2: TAILORING DETAILS (MIDDLE FOLD – SYMMETRICAL)
       ======================================================== -->
  <div class="fold-section fold-2">
    <div class="fold-2-inner">
      <div class="fold-2-hdr">
        <span>TAILORING SPECIFICATIONS &amp; CUTTING INSTRUCTIONS</span>
        <span style="font-size:8.5pt; font-weight:700; color:#555;">FOLD 2 – WORKSHOP MASTER INSTRUCTIONS</span>
      </div>

      <div class="two-col">

        <!-- LEFT COLUMN: LINING, SLEEVE, BH, SLIT, ZIP -->
        <div class="col-stack">

          <!-- LINING -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>LINING :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Full / Half / None</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- SLEEVE (SL) -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>SLEEVE (SL) :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Length &amp; Round</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- BH -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>BH :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Blouse Height</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- SLIT -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>SLIT :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Side / Front</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- ZIP -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>ZIP :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Side / Back / Concealed</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

        </div><!-- end left col -->

        <!-- RIGHT COLUMN: NECK, FITTING, BOTTOM, OTHER -->
        <div class="col-stack">

          <!-- NECK (Enlarged prominent drawing / instruction area) -->
          <div class="section-box" style="flex:2.8;">
            <div class="section-box-title">
              <span>NECK (FRONT &amp; BACK PATTERN) :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Pattern / Depth / Piping</span>
            </div>
            <span class="write-area-fill"></span>
          </div>

          <!-- FITTING -->
          <div class="section-box" style="flex:1.1;">
            <div class="section-box-title">
              <span>FITTING :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Tight / Regular / Loose</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- BOTTOM -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>BOTTOM :</span>
              <span style="font-size:8pt; font-weight:normal; color:#666;">Style &amp; Length</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- OTHER TAILORING INSTRUCTIONS -->
          <div class="section-box" style="flex:1.1;">
            <div class="section-box-title">
              <span>OTHER INSTRUCTIONS :</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

        </div><!-- end right col -->

      </div><!-- end two-col -->
    </div>
  </div><!-- end fold-2 -->

  <!-- ========================================================
       FOLD 3: BOTTOM SECTION (PRESERVED EXACTLY AS EXISTING)
       STRICT REQUIREMENT: DO NOT MODIFY THE THIRD FOLD.
       ======================================================== -->
  <div class="fold-section fold-3">
    <div class="bottom-section">
      <div class="bottom-strip">
        <div class="bottom-field">
          <span class="lbl">NAME :</span>
          <span class="populated-val">${name}</span>
        </div>
        <div class="bottom-field" style="max-width:45mm;">
          <span class="lbl">R.NO :</span>
          <span class="populated-val">${rNo}</span>
        </div>
        <div class="bottom-field" style="max-width:55mm;">
          <span class="lbl">DUE DATE :</span>
          <span class="populated-val">${dueDate}</span>
        </div>
      </div>
      
      <!-- Expanded notes / instructions handwritten lines -->
      <div class="bottom-notes-area">
        <div class="bottom-notes-title">SPECIAL WORKSHOP REMARKS / NOTES :</div>
        <div class="bottom-notes-lines">
          <div class="notes-line"></div>
          <div class="notes-line"></div>
          <div class="notes-line"></div>
        </div>
      </div>
    </div>
  </div><!-- end fold-3 -->

</div><!-- end .page -->

<script>
  window.addEventListener('load', function () {
    setTimeout(function () { window.print(); }, 350);
  });
</script>
</body>
</html>`;
}

export function printCustomerBookingForm(order: Order): void {
  const html = buildBookingFormHTML(order);
  const printWindow = window.open('', '_blank', 'width=940,height=1180,scrollbars=yes');
  if (!printWindow) {
    alert('Pop-up was blocked. Please allow pop-ups for this site and try again.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
