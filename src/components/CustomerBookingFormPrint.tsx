/**
 * CustomerBookingFormPrint
 *
 * Recreates the original Giriraj City Garments physical booking form.
 * Opens in a fresh browser window → auto-prints → user closes.
 *
 * UPDATED PER INSTRUCTIONS:
 * 1. REMOVE ALL CHECKBOXES & HARDCODED OPTION LISTS:
 *    The sections LINING, SLEEVE (SL), BH, SLIT, ZIP, NECK, FITTING, BOTTOM
 *    now provide clear, open rectangular handwriting space / ruled writing lines
 *    with no pre-printed checkbox boxes or static option texts, giving masters
 *    and staff completely unconstrained room for custom handwritten instructions.
 * 2. AUTOMATICALLY POPULATE FINAL DETAILS:
 *    The bottom section automatically fills:
 *      - NAME: customer name
 *      - R.NO: customer registration ID (e.g. A001)
 *      - DUE DATE: order target due date
 *    from the active order & customer database.
 * 3. INCREASE BOTTOM WRITING SPACE:
 *    Enlarged bottom workshop section with dedicated ruled writing area.
 * 4. SINGLE-PAGE A4 GUARANTEE:
 *    Exact vertical sizing ensuring 100% single A4 page fit.
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Booking Form – ${name || billNo}</title>
<style>
/* ── RESET ───────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
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
  margin: 6mm;
}
@media print {
  .no-print { display: none !important; }
  .page { overflow: hidden !important; }
}

/* ── PAGE CONTAINER ──────────────────────────────────────── */
.page {
  width: 198mm;
  height: 285mm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  font-size: 10pt;
  line-height: 1.35;
}

/* ── SHOP HEADER ─────────────────────────────────────────── */
.shop-header {
  text-align: center;
  border-bottom: 2.5px solid #000;
  padding-bottom: 1.5mm;
  margin-bottom: 1.5mm;
  flex-shrink: 0;
}
.shop-name {
  font-size: 19pt;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  line-height: 1.1;
}
.shop-tagline {
  font-size: 9pt;
  margin-top: 0.5mm;
}

/* ── DUE DATE / FORM 1 ROW ───────────────────────────────── */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5mm 1mm;
  border-bottom: 2px solid #000;
  font-size: 10.5pt;
  font-weight: bold;
  margin-bottom: 1mm;
  flex-shrink: 0;
}
.due-line {
  display: inline-block;
  min-width: 42mm;
  border-bottom: 1.5px solid #444;
  margin-left: 1mm;
  vertical-align: bottom;
  padding-left: 2mm;
  font-weight: 700;
}

/* ── CUSTOMER INFO TABLES ────────────────────────────────── */
table { width: 100%; border-collapse: collapse; flex-shrink: 0; }
.info-table { border: 2px solid #000; }
.info-table + .info-table { border-top: none; }
.info-table td {
  border: 1px solid #000;
  padding: 1.2mm 2.5mm;
  vertical-align: middle;
}
.lbl { font-weight: 800; font-size: 10pt; white-space: nowrap; }
.val-block { font-size: 10.5pt; font-weight: 600; }
.addr-val {
  font-size: 10.5pt;
  font-weight: 600;
  display: block;
  min-height: 7mm;
  word-break: break-word;
  white-space: normal;
}

/* ── SELF / SHOP SECTION ─────────────────────────────────── */
.self-shop-table {
  border-collapse: collapse;
  border: 2px solid #000;
  margin-top: 1.5mm;
  flex-shrink: 0;
}
.self-shop-table td {
  border: 1px solid #000;
  padding: 1.2mm 2.5mm;
  vertical-align: middle;
}
.self-shop-label { font-weight: 900; font-size: 10.5pt; text-align: center; }
.tbd-label        { font-weight: 800; font-size: 10pt;   white-space: nowrap; }
.tbd-line {
  display: inline-block;
  width: 50mm;
  border-bottom: 1.5px solid #666;
  margin-left: 1.5mm;
  vertical-align: bottom;
}

/* ── NO. OF SECTION ──────────────────────────────────────── */
.section-heading {
  font-weight: 900;
  font-size: 11pt;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-top: 2px solid #000;
  padding: 1mm 0;
  margin-top: 1.5mm;
  flex-shrink: 0;
}
.qty-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8mm 6mm;
  margin-top: 1mm;
  flex-shrink: 0;
}
.qty-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10pt;
  font-weight: 600;
  border-bottom: 1px solid #bbb;
  padding: 0.8mm 0;
}
.qty-box {
  width: 12mm;
  height: 5.5mm;
  border: 2px solid #000;
  display: inline-block;
  flex-shrink: 0;
}

/* ── TWO-COLUMN DESIGN SECTIONS (HANDWRITING READY) ──────── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2mm;
  margin-top: 1.5mm;
  flex: 1;         /* grow to fill middle section */
  min-height: 0;
}
.col-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5mm;
}
.section-box {
  border: 1.5px solid #000;
  padding: 1.5mm 2.5mm;
  display: flex;
  flex-direction: column;
}
.section-box-title {
  font-weight: 900;
  font-size: 10.5pt;
  margin-bottom: 0.5mm;
}

/* ── WRITE LINES & AREAS ─────────────────────────────────── */
.write-box-sm {
  width: 100%;
  border-bottom: 1.5px solid #666;
  min-height: 6mm;
}
.write-box-md {
  width: 100%;
  border-bottom: 1.5px solid #666;
  min-height: 8.5mm;
}
.write-area-fill {
  width: 100%;
  border: 1.5px solid #666;
  flex: 1;
  min-height: 18mm;
  margin-top: 1mm;
}

/* ── EXPANDED BOTTOM REFERENCE & NOTES SECTION ──────────── */
.bottom-section {
  border: 2px solid #000;
  margin-top: 2mm;
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

  <!-- HEADER -->
  <div class="shop-header">
    <div class="shop-name">GIRIRAJ CITY GARMENTS</div>
    <div class="shop-tagline">Ladies Tailoring &amp; Garments</div>
  </div>

  <!-- DUE DATE / FORM 1 -->
  <div class="header-row">
    <span>DUE DATE :&nbsp;<span class="due-line">${dueDate ? dueDate : '&nbsp;'}</span></span>
    <span style="font-size:10.5pt; font-weight:900; letter-spacing:0.5px;">FORM 1</span>
  </div>

  <!-- ROW 1: BILL NO / S.NO / DATE -->
  <table class="info-table">
    <tr>
      <td class="lbl" style="width:21mm;">BILL NO&nbsp;:</td>
      <td style="width:48mm;"><span class="val-block">${billNo}</span></td>
      <td class="lbl" style="width:13mm;">S.NO&nbsp;:</td>
      <td style="width:34mm;"><span class="val-block">${sNo}</span></td>
      <td class="lbl" style="width:13mm;">DATE&nbsp;:</td>
      <td><span class="val-block">${date}</span></td>
    </tr>
  </table>

  <!-- ROW 2: NAME / R.NO / P.NO / ITEMS -->
  <table class="info-table">
    <tr>
      <td class="lbl" style="width:15mm;">NAME&nbsp;:</td>
      <td style="width:50mm;"><span class="val-block">${name}</span></td>
      <td class="lbl" style="width:13mm;">R.NO&nbsp;:</td>
      <td style="width:28mm;"><span class="val-block">${rNo}</span></td>
      <td class="lbl" style="width:13mm;">P.NO&nbsp;:</td>
      <td style="width:35mm;"><span class="val-block">${pNo}</span></td>
      <td class="lbl" style="width:14mm;">ITEMS&nbsp;:</td>
      <td style="width:16mm;"><span class="val-block">${itemsStr}</span></td>
    </tr>
  </table>

  <!-- ROW 3: FATHER NAME / HUSBAND NAME -->
  <table class="info-table">
    <tr>
      <td class="lbl" style="width:32mm;">FATHER NAME&nbsp;:</td>
      <td style="width:66mm;"><span class="val-block">${fatherName}</span></td>
      <td class="lbl" style="width:34mm;">HUSBAND NAME&nbsp;:</td>
      <td><span class="val-block">${husbandName}</span></td>
    </tr>
  </table>

  <!-- ROW 4: ADDRESS -->
  <table class="info-table">
    <tr>
      <td class="lbl" style="width:22mm; vertical-align:top; padding-top:2mm;">ADDRESS&nbsp;:</td>
      <td><span class="addr-val">${address}</span></td>
    </tr>
  </table>

  <!-- SELF / SHOP -->
  <table class="self-shop-table" style="width:100%;">
    <tr>
      <td rowspan="3" class="self-shop-label" style="width:16mm;">SELF</td>
      <td class="tbd-label" style="width:7mm;">T</td>
      <td><span class="tbd-line"></span></td>
      <td rowspan="3" class="self-shop-label" style="width:16mm;">SHOP</td>
      <td class="tbd-label" style="width:7mm;">T</td>
      <td><span class="tbd-line"></span></td>
    </tr>
    <tr>
      <td class="tbd-label">B</td>
      <td><span class="tbd-line"></span></td>
      <td class="tbd-label">B</td>
      <td><span class="tbd-line"></span></td>
    </tr>
    <tr>
      <td class="tbd-label">D</td>
      <td><span class="tbd-line"></span></td>
      <td class="tbd-label">D</td>
      <td><span class="tbd-line"></span></td>
    </tr>
  </table>

  <!-- NO. OF QUANTITIES -->
  <div class="section-heading">NO. OF :</div>
  <div class="qty-grid">
    <div class="qty-item"><span>TOPS</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>BOTTOM</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>BLOWS</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>SAREE</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>FALLS</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>NIGHTY</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>OTHERS</span><span class="qty-box"></span></div>
    <div class="qty-item"><span>DHUPATTA</span><span class="qty-box"></span></div>
  </div>

  <!-- TWO-COLUMN DESIGN SECTIONS (CLEAN HANDWRITING SECTIONS — NO BOXES OR HARDCODED OPTIONS) -->
  <div class="two-col">

    <!-- LEFT COLUMN -->
    <div class="col-stack">

      <!-- LINING -->
      <div class="section-box">
        <div class="section-box-title">LINING :</div>
        <span class="write-box-sm"></span>
      </div>

      <!-- SLEEVE -->
      <div class="section-box">
        <div class="section-box-title">SLEEVE (SL) :</div>
        <span class="write-box-md"></span>
      </div>

      <!-- BH -->
      <div class="section-box">
        <div class="section-box-title">BH :</div>
        <span class="write-box-md"></span>
      </div>

      <!-- SLIT -->
      <div class="section-box">
        <div class="section-box-title">SLIT :</div>
        <span class="write-box-sm"></span>
      </div>

      <!-- ZIP -->
      <div class="section-box">
        <div class="section-box-title">ZIP :</div>
        <span class="write-box-sm"></span>
      </div>

    </div><!-- end left col -->

    <!-- RIGHT COLUMN -->
    <div class="col-stack">

      <!-- NECK — flex:1 to maximize drawing / pattern notes area -->
      <div class="section-box" style="flex:1;">
        <div class="section-box-title">NECK :</div>
        <span class="write-area-fill"></span>
      </div>

      <!-- FITTING -->
      <div class="section-box">
        <div class="section-box-title">FITTING :</div>
        <span class="write-box-sm"></span>
      </div>

      <!-- BOTTOM STYLE -->
      <div class="section-box">
        <div class="section-box-title">BOTTOM :</div>
        <span class="write-box-md"></span>
      </div>

    </div><!-- end right col -->

  </div><!-- end two-col -->

  <!-- EXPANDED BOTTOM SECTION: AUTO-POPULATED NAME / R.NO / DUE DATE + EXTRA WRITING SPACE -->
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
