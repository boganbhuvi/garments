/**
 * CustomerBookingFormPrint
 *
 * Recreates the Giriraj City Garments physical booking worksheet for A4 portrait printing.
 * Three-Fold paper format:
 *   - FOLD 1 (Top Section):
 *       * GIRIRAJ CITY GARMENTS heading in bold RED.
 *       * DUE DATE in bold black text.
 *       * ROW 1: BILL NO, S.NO, DATE (all black text).
 *       * ROW 2: NAME, R.NO, ITEMS (P.NO removed from next to R.NO; ITEMS left blank for handwriting, no filled numbers).
 *       * ROW 3: FATHER NAME, HUSBAND NAME.
 *       * ROW 4: ADDRESS.
 *       * ROW 5: Reduced SELF / SHOP, and Customer Registered Phone Numbers box.
 *       * ROW 6: NO. OF boxes with all category names in clean BLACK (not red).
 *   - FOLD 2 (Middle Section - Symmetrical Tailoring Details):
 *       * Tailoring specifications: Lining, Neck (large sketch area), Sleeve (SL), BH, Slit, Zip, Fitting, Bottom, Other Instructions.
 *       * Clean blank handwriting lines, all black text.
 *   - FOLD 3 (Bottom Section):
 *       * Auto-populated NAME, R.NO, DUE DATE, and 3-line SPECIAL WORKSHOP REMARKS / NOTES.
 *       * Clean black text styling.
 */

import { Order } from '../types/order';

function buildBookingFormHTML(order: Order): string {
  const c = order.customer;

  const billNo      = c.billNumber  || order.id || '';
  const sNo         = order.serialNumber || '';
  const date        = c.date        || '';
  const name        = c.customerName || '';
  const address     = c.fullAddress || [
    c.doorNo, c.street, c.areaLocation, c.city,
    c.state, c.pinCode ? `PIN ${c.pinCode}` : ''
  ].filter(Boolean).join(', ');

  const fatherName  = c.relationshipType === 'D/O' ? (c.fatherName  || '') : '';
  const husbandName = c.relationshipType === 'W/O' ? (c.husbandName || '') : '';

  const rNo         = c.customerId || '';
  const dueDate     = order.billing?.dueDate || '';

  // Extract up to 3 recent / registered customer mobile numbers
  const allPhones: string[] = [];
  if (c.primaryPhone && c.primaryPhone.trim()) {
    allPhones.push(c.primaryPhone.trim());
  }
  if (c.secondaryPhone && c.secondaryPhone.trim()) {
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
/* User Request: Company name in RED */
.shop-name {
  font-size: 16.5pt;
  font-weight: 900;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  line-height: 1.1;
  color: #dc2626 !important; /* Bold vivid red */
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
/* User Request: Date in BLACK */
.due-line {
  display: inline-block;
  min-width: 45mm;
  border-bottom: 1.5px solid #000;
  margin-left: 1mm;
  vertical-align: bottom;
  padding: 0 2mm;
  font-weight: 800;
  color: #000 !important; /* Black */
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
.lbl { font-weight: 800; font-size: 9pt; white-space: nowrap; color: #000; }
.val-block { font-size: 9.5pt; font-weight: 700; color: #000; }

/* ── PROMINENT ITEMS BOX (BLANK FOR HANDWRITING) ─────────── */
.items-cell {
  background: #fff;
  text-align: center;
  padding: 0 1mm !important;
}
.items-blank-line {
  display: inline-block;
  width: 90%;
  height: 5mm;
}

.addr-val {
  font-size: 9pt;
  font-weight: 600;
  display: block;
  min-height: 4.5mm;
  word-break: break-word;
  white-space: normal;
  line-height: 1.15;
  color: #000;
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
  color: #000;
}
.line-blank {
  display: inline-block;
  width: 13mm;
  border-bottom: 1.2px solid #555;
  height: 3.5mm;
}

/* Customer Registered Phone Numbers Area (Placed in dedicated space) */
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
  color: #000;
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
  color: #000;
  background: #f1f5f9;
  padding: 0.5mm 1.8mm;
  border-radius: 3px;
  border: 1px solid #cbd5e1;
}

/* ── NO. OF QUANTITIES (ALL FONT COLOR IN CLEAN BLACK) ───── */
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
  color: #000;
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
  border: 1px solid #000;
  padding: 0.6mm 1.5mm;
  background: #fff;
}
/* User Request: Change all font colour to black not red */
.garment-name-black {
  color: #000 !important;
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
  color: #000;
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
  border-bottom: 1.2px solid #000;
  min-height: 5mm;
  flex: 1;
}
.write-box-md {
  width: 100%;
  border-bottom: 1.2px solid #000;
  min-height: 7mm;
  flex: 1;
}
.write-area-fill {
  width: 100%;
  border: 1.2px solid #000;
  flex: 1;
  min-height: 28mm;
  margin-top: 0.8mm;
  background: #fff;
}

/* ── FOLD 3: PRESERVED EXACTLY WITH CLEAN BLACK TEXT ─────── */
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
  color: #000;
}
/* User Request: Change colour in 3rd fold also to clean black */
.bottom-field .populated-val {
  font-size: 11pt;
  font-weight: 700;
  color: #000 !important;
  border-bottom: 1.5px solid #000;
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
  color: #000;
}
.bottom-notes-lines {
  display: flex;
  flex-direction: column;
  gap: 2.5mm;
  padding-top: 1mm;
}
.notes-line {
  border-bottom: 1.2px solid #000;
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

    <!-- HEADER: COMPANY NAME IN RED -->
    <div class="shop-header">
      <div class="shop-name">GIRIRAJ CITY GARMENTS</div>
      <div class="shop-tagline">Ladies Tailoring &amp; Garments</div>
    </div>

    <!-- DUE DATE / FORM 1 (DUE DATE IN BLACK) -->
    <div class="header-row">
      <span>DUE DATE :&nbsp;<span class="due-line">${dueDate ? dueDate : '&nbsp;'}</span></span>
      <span style="font-size:10pt; font-weight:900; letter-spacing:0.5px;">FORM 1 (THREE-FOLD WORKSHEET)</span>
    </div>

    <!-- ROW 1: BILL NO / S.NO / DATE (ALL BLACK) -->
    <table class="info-table">
      <tr>
        <td class="lbl" style="width:20mm;">BILL NO&nbsp;:</td>
        <td style="width:46mm;"><span class="val-block">${billNo}</span></td>
        <td class="lbl" style="width:13mm;">S.NO&nbsp;:</td>
        <td style="width:34mm;"><span class="val-block">${sNo}</span></td>
        <td class="lbl" style="width:13mm;">DATE&nbsp;:</td>
        <td><span class="val-block">${date}</span></td>
      </tr>
    </table>

    <!-- ROW 2: NAME / R.NO / ITEMS (PHONE NUMBER REMOVED NEXT TO R.NO; ITEMS COLUMN LEFT BLANK FOR HANDWRITING) -->
    <table class="info-table">
      <tr>
        <td class="lbl" style="width:16mm;">NAME&nbsp;:</td>
        <td style="width:80mm;"><span class="val-block">${name}</span></td>
        <td class="lbl" style="width:16mm;">R.NO&nbsp;:</td>
        <td style="width:40mm;"><span class="val-block">${rNo}</span></td>
        <td class="lbl" style="width:18mm; text-align:center;">ITEMS&nbsp;:</td>
        <td class="items-cell"><span class="items-blank-line"></span></td>
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

    <!-- ROW 5: REDUCED SELF / SHOP & REGISTERED PHONES -->
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

      <!-- Customer Registered Phone Numbers (Dedicated space populated from records) -->
      <div class="phones-box">
        <div class="phones-hdr">Customer Registered Phone Numbers (${recent3Phones.length} Available)</div>
        <div class="phones-list">
          ${
            recent3Phones.length > 0
              ? recent3Phones.map((ph, idx) => `<span class="phone-chip">#${idx + 1}: ${ph}</span>`).join('')
              : '<span style="font-size:8.5pt; color:#666; font-style:italic;">No phone numbers on file</span>'
          }
        </div>
      </div>
    </div>

    <!-- ROW 6: NO. OF QUANTITIES (ALL FONT COLOR IN BLACK NOT RED) -->
    <div class="qty-section">
      <div class="qty-hdr">NO. OF :</div>
      <div class="qty-grid">
        <div class="qty-item"><span class="garment-name-black">TOPS</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">BOTTOM</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">BLOWS</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">SAREE</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">FALLS</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">NIGHTY</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">OTHERS</span><span class="qty-box"></span></div>
        <div class="qty-item"><span class="garment-name-black">DHUPATTA</span><span class="qty-box"></span></div>
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
        <span style="font-size:8.5pt; font-weight:700; color:#444;">FOLD 2 – WORKSHOP MASTER INSTRUCTIONS</span>
      </div>

      <div class="two-col">

        <!-- LEFT COLUMN: LINING, SLEEVE, BH, SLIT, ZIP -->
        <div class="col-stack">

          <!-- LINING -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>LINING :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Full / Half / None</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- SLEEVE (SL) -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>SLEEVE (SL) :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Length &amp; Round</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- BH -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>BH :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Blouse Height</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- SLIT -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>SLIT :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Side / Front</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- ZIP -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>ZIP :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Side / Back / Concealed</span>
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
              <span style="font-size:8pt; font-weight:normal; color:#444;">Pattern / Depth / Piping</span>
            </div>
            <span class="write-area-fill"></span>
          </div>

          <!-- FITTING -->
          <div class="section-box" style="flex:1.1;">
            <div class="section-box-title">
              <span>FITTING :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Tight / Regular / Loose</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- BOTTOM -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>BOTTOM :</span>
              <span style="font-size:8pt; font-weight:normal; color:#444;">Style &amp; Length</span>
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
       FOLD 3: BOTTOM SECTION (PRESERVED WITH CLEAN BLACK TEXT)
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
