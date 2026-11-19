/**
 * CustomerBookingFormPrint
 *
 * Recreates the original Giriraj City Garments physical booking form.
 * Opens in a fresh browser window → auto-prints → user closes.
 *
 * REVISED v3: Single A4 page guaranteed.
 *   - Tightened padding/margins so all sections fit on one page.
 *   - Readable font sizes maintained (10–11pt body, 20pt heading).
 *   - Larger handwriting spaces than v1 but trimmed vs v2.
 *   - overflow:hidden + page-break-inside:avoid on the page container.
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
  margin: 7mm;
}
@media print {
  .no-print { display: none !important; }
  /* Hard-stop any second page */
  .page { overflow: hidden !important; }
}

/* ── PAGE CONTAINER ──────────────────────────────────────── */
/* 
  A4 printable area = 297mm − 2×7mm = 283mm tall, 196mm wide.
  We use a fixed 283mm height so nothing escapes to page 2.
*/
.page {
  width: 196mm;
  height: 283mm;          /* exact printable height — nothing bleeds beyond */
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
.val-block { font-size: 10.5pt; font-weight: 500; }
.addr-val {
  font-size: 10.5pt;
  font-weight: 500;
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
  padding: 1mm 0;
}
.qty-box {
  width: 12mm;
  height: 6mm;
  border: 2px solid #000;
  display: inline-block;
  flex-shrink: 0;
}

/* ── TWO-COLUMN DESIGN SECTIONS ──────────────────────────── */
/* flex:1 so this area stretches to fill whatever space remains */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2mm;
  margin-top: 1.5mm;
  flex: 1;         /* grow to fill remaining page height */
  min-height: 0;   /* allow shrink below content size in flex context */
}
.col-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5mm;
}
.section-box {
  border: 1.5px solid #000;
  padding: 1.5mm 2.5mm;
}
.section-box-title {
  font-weight: 900;
  font-size: 11pt;
  margin-bottom: 1mm;
}

/* ── CHECKBOXES ──────────────────────────────────────────── */
.option-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5mm 5mm;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 1.5mm;
  font-size: 10pt;
  font-weight: 600;
  white-space: nowrap;
}
.chk-box {
  width: 4.5mm;
  height: 4.5mm;
  border: 2px solid #000;
  display: inline-block;
  flex-shrink: 0;
}

/* ── WRITE LINES & AREAS ─────────────────────────────────── */
.write-line {
  display: block;
  width: 100%;
  border-bottom: 1.5px solid #666;
  min-height: 7mm;
  margin-top: 1.5mm;
}
.write-area {
  display: block;
  width: 100%;
  border: 1.5px solid #666;
  /* flex: 1 makes the NECK box grow to fill right column */
  flex: 1;
  margin-top: 1.5mm;
  min-height: 10mm;
}

/* ── NECK section — right col grows to fill the col ─────── */
.neck-box {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* ── BOTTOM REFERENCE STRIP ──────────────────────────────── */
.bottom-strip {
  border-top: 2px solid #000;
  margin-top: 2mm;
  padding-top: 2mm;
  display: flex;
  gap: 5mm;
  flex-shrink: 0;
}
.bottom-field { flex: 1; }
.bottom-field .lbl { font-size: 10pt; font-weight: 800; }
.bottom-field .write-line { min-height: 16mm; }

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
    <span>DUE DATE :&nbsp;<span class="due-line">&nbsp;</span></span>
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

  <!-- TWO-COLUMN DESIGN SECTIONS (flex:1 — fills remaining height) -->
  <div class="two-col">

    <!-- LEFT COLUMN -->
    <div class="col-stack">

      <!-- LINING -->
      <div class="section-box">
        <div class="section-box-title">LINING :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> YES</div>
          <div class="option-item"><span class="chk-box"></span> NO</div>
        </div>
      </div>

      <!-- SLEEVE -->
      <div class="section-box">
        <div class="section-box-title">SLEEVE (SL) :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> MEGA</div>
          <div class="option-item"><span class="chk-box"></span> 3/4</div>
          <div class="option-item"><span class="chk-box"></span> 1/4</div>
          <div class="option-item"><span class="chk-box"></span> FULL</div>
        </div>
        <span class="write-line"></span>
      </div>

      <!-- BH -->
      <div class="section-box">
        <div class="section-box-title">BH :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> SHTOP</div>
          <div class="option-item"><span class="chk-box"></span> JTOP</div>
          <div class="option-item"><span class="chk-box"></span> LNGTOP</div>
          <div class="option-item"><span class="chk-box"></span> FH</div>
          <div class="option-item"><span class="chk-box"></span> SKTTOP</div>
        </div>
        <span class="write-line"></span>
      </div>

      <!-- SLIT -->
      <div class="section-box">
        <div class="section-box-title">SLIT :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> SLIT</div>
          <div class="option-item"><span class="chk-box"></span> NO SLIT</div>
        </div>
      </div>

      <!-- ZIP -->
      <div class="section-box">
        <div class="section-box-title">ZIP :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> YES</div>
          <div class="option-item"><span class="chk-box"></span> NO</div>
        </div>
      </div>

    </div><!-- end left col -->

    <!-- RIGHT COLUMN -->
    <div class="col-stack">

      <!-- NECK — flex:1 so it grows to fill right column -->
      <div class="section-box neck-box" style="flex:1;">
        <div class="section-box-title">NECK :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> NEW NECK</div>
          <div class="option-item"><span class="chk-box"></span> DESIGN</div>
        </div>
        <span class="write-area"></span>
      </div>

      <!-- FITTING -->
      <div class="section-box">
        <div class="section-box-title">FITTING :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> TIGHT</div>
          <div class="option-item"><span class="chk-box"></span> M+</div>
          <div class="option-item"><span class="chk-box"></span> MEDIUM</div>
          <div class="option-item"><span class="chk-box"></span> LOOSEFIT</div>
        </div>
      </div>

      <!-- BOTTOM STYLE -->
      <div class="section-box">
        <div class="section-box-title">BOTTOM :</div>
        <div class="option-grid">
          <div class="option-item"><span class="chk-box"></span> SALWAR</div>
          <div class="option-item"><span class="chk-box"></span> GATHERING</div>
          <div class="option-item"><span class="chk-box"></span> PUNJABI</div>
          <div class="option-item"><span class="chk-box"></span> PATYALA</div>
        </div>
        <div style="margin-top:1.5mm; font-size:10.5pt; font-weight:800;">OTHERS :</div>
        <span class="write-line"></span>
      </div>

    </div><!-- end right col -->

  </div><!-- end two-col -->

  <!-- BOTTOM REFERENCE STRIP -->
  <div class="bottom-strip">
    <div class="bottom-field">
      <div class="lbl">NAME :</div>
      <span class="write-line"></span>
    </div>
    <div class="bottom-field">
      <div class="lbl">R.NO :</div>
      <span class="write-line"></span>
    </div>
    <div class="bottom-field">
      <div class="lbl">DUE DATE :</div>
      <span class="write-line"></span>
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
