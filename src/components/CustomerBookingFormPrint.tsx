/**
 * CustomerBookingFormPrint
 *
 * Recreates the Giriraj City Garments physical booking worksheet for A4 portrait printing.
 * Three-Fold paper format:
 *   - FOLD 1 (Top Section - Enriched height ~110mm / +0.5 inch larger):
 *       * GIRIRAJ CITY GARMENTS heading in bold RED.
 *       * DUE DATE in bold black text.
 *       * ROW 1: BILL NO, S.NO (red), DATE.
 *       * ROW 2: NAME (red), R.NO (red), ADDRESS (takes place in the former phone number column).
 *       * ROW 3: FATHER NAME.
 *       * ROW 4: HUSBAND NAME (takes place directly below father name).
 *       * ROW 5: Large square ITEMS box on left, and P.NO (3 REG): box on right (in place of self/shop)
 *                with larger font size for phone numbers (up to 3 numbers).
 *       * ROW 6: NO. OF boxes:
 *                Row 1: TOPS, BOTTOM, DHUPATTA, NIGHTY
 *                Row 2: BLOWS, SAREE, FALLS, OTHERS
 *                All category names in clean BLACK.
 *   - FOLD 2 (Middle Section - Tailoring Details ~110mm):
 *       * Left half: LINING, SLEEVE (SL), BH, SLIT, FITTING (moved below slit).
 *       * Right half: OTHER INSTRUCTIONS (expanded full right half).
 *       * ZIP, NECK, BOTTOM removed as requested.
 *       * Clean blank handwriting lines.
 *   - FOLD 3 (Bottom Section ~67mm):
 *       * Auto-populated NAME (red), R.NO (red), DUE DATE (black), and 3-line SPECIAL WORKSHOP REMARKS / NOTES.
 */

import { Order } from '../types/order';

function buildBookingFormHTML(order?: Order | null): string {
  const c = order?.customer;

  const billNo      = c?.billNumber  || order?.id || '';
  const sNo         = order?.serialNumber || '';
  const date        = c?.date        || '';
  const name        = c?.customerName || '';
  const address     = c?.fullAddress || [
    c?.doorNo, c?.street, c?.areaLocation, c?.city,
    c?.state, c?.pinCode ? `PIN ${c.pinCode}` : ''
  ].filter(Boolean).join(', ');

  const fatherName  = c ? (c.relationshipType === 'D/O' ? (c.fatherName  || '') : (c.fatherName || '')) : '';
  const husbandName = c ? (c.relationshipType === 'W/O' ? (c.husbandName || '') : (c.husbandName || '')) : '';

  const rNo         = c?.customerId || '';
  const dueDate     = order?.billing?.dueDate || '';

  // Extract up to 3 recent / registered customer mobile numbers
  const allPhones: string[] = [];
  if (c?.primaryPhone && c.primaryPhone.trim()) {
    allPhones.push(c.primaryPhone.trim());
  }
  if (c?.secondaryPhone && c.secondaryPhone.trim()) {
    const secParts = c.secondaryPhone.split(',').map(p => p.trim()).filter(Boolean);
    for (const p of secParts) {
      if (!allPhones.includes(p)) allPhones.push(p);
    }
  }
  if (Array.isArray(c?.additionalPhones)) {
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

/* ── PAGE CONTAINER (A4 Portrait ~287mm total printable height) ── */
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

/* Fold 1: 101mm (reduced by 10mm / 1cm to make folds balanced after printout) */
.fold-1 {
  height: 101mm;
  max-height: 101mm;
  border-bottom: 2px dashed #666;
  padding-bottom: 1.5mm;
  margin-bottom: 1.5mm;
  overflow: hidden;
  position: relative;
}

/* Fold 2: 109mm (balanced middle section) */
.fold-2 {
  height: 109mm;
  max-height: 109mm;
  border-bottom: 2px dashed #666;
  padding-bottom: 1.5mm;
  margin-bottom: 1.5mm;
  overflow: hidden;
  position: relative;
}

/* Fold 3: fills remaining height to bottom border */
.fold-3 {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
.due-line {
  display: inline-block;
  min-width: 45mm;
  border-bottom: 1.5px solid #000;
  margin-left: 1mm;
  vertical-align: bottom;
  padding: 0 2mm;
  font-weight: 800;
  color: #000 !important;
}

/* ── CUSTOMER INFO TABLES ────────────────────────────────── */
table { width: 100%; border-collapse: collapse; flex-shrink: 0; }
.info-table { border: 1.8px solid #000; }
.info-table + .info-table { border-top: none; }
.info-table td {
  border: 1px solid #000;
  padding: 1.1mm 2mm;
  vertical-align: middle;
}
.lbl { font-weight: 800; font-size: 9pt; white-space: nowrap; color: #000; }
.val-block { font-size: 9.5pt; font-weight: 700; color: #000; }
.highlight-red {
  color: #dc2626 !important; /* Bold vivid red */
  font-weight: 800;
}

.addr-val {
  font-size: 9.5pt;
  font-weight: 600;
  display: block;
  min-height: 14mm; /* Large spacious box for writing full address */
  word-break: break-word;
  white-space: normal;
  line-height: 1.35;
  color: #000;
}

/* ── ITEMS LARGE SQUARE & P.NO (3 REG) ROW ───────────────── */
.items-phone-row {
  display: flex;
  gap: 2mm;
  margin-top: 1.2mm;
  flex-shrink: 0;
}

/* Large square ITEMS box */
.large-items-box {
  width: 48mm;
  border: 1.8px solid #000;
  padding: 1.5mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  flex-shrink: 0;
  min-height: 18mm;
}
.large-items-header {
  font-size: 9.5pt;
  font-weight: 900;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #000;
  padding-bottom: 0.5mm;
}
.large-items-write {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.items-square-blank {
  width: 100%;
  height: 11mm;
}

/* P.NO (3 REG) box taking the place of SELF/SHOP with increased font size */
.phones-box {
  flex: 1;
  border: 1.8px solid #000;
  padding: 1.5mm 2mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fafafa;
  min-height: 18mm;
}
.phones-hdr {
  font-size: 9pt;
  font-weight: 900;
  text-transform: uppercase;
  color: #000;
  letter-spacing: 0.4px;
  margin-bottom: 1mm;
  border-bottom: 1.2px solid #000;
  padding-bottom: 0.5mm;
}
.phones-list {
  display: flex;
  gap: 2mm;
  align-items: center;
  flex-wrap: wrap;
}
/* Phone chip: font-size +2 (13pt), bold off (font-weight: normal / 400) */
.phone-chip {
  font-size: 13pt; /* +2 size from 11pt */
  font-weight: 500; /* Bold off (regular clean font) */
  color: #000;
  background: #f8fafc;
  padding: 0.8mm 2.2mm;
  border-radius: 4px;
  border: 1.2px solid #cbd5e1;
  letter-spacing: 0.5px;
}

/* ── NO. OF QUANTITIES (2 ROWS AS REQUESTED) ─────────────── */
.qty-section {
  margin-top: 1.2mm;
  border-top: 1.8px solid #000;
  padding-top: 0.8mm;
  flex-shrink: 0;
}
.qty-hdr {
  font-weight: 900;
  font-size: 9pt;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 0.6mm;
  color: #000;
}
.qty-grid-2rows {
  display: flex;
  flex-direction: column;
  gap: 1mm;
}
.qty-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5mm;
}
.qty-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8.5pt;
  border: 1px solid #000;
  padding: 0.8mm 1.5mm;
  background: #fff;
}
.garment-name-black {
  color: #000 !important;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.qty-box {
  width: 9mm;
  height: 5mm;
  border: 1.5px solid #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 9pt;
  background: #fff;
  flex-shrink: 0;
}

/* ── FOLD 2: TAILORING DETAILS SECTION ───────────────────── */
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
  padding: 1mm 2mm;
  border-bottom: 1.8px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2mm;
  background: #f8fafc;
  color: #000;
}
.two-col-tailoring {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2mm;
  flex: 1;
  min-height: 0;
}
.col-stack-left {
  display: flex;
  flex-direction: column;
  gap: 1.5mm;
  height: 100%;
}
.col-stack-right {
  display: flex;
  flex-direction: column;
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

/* Handwriting blank writing lines */
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

/* Expanded Other Instructions for 2nd half of Fold 2: Clean open handwriting canvas (lines removed) */
.other-instructions-full {
  border: 1.5px solid #000;
  padding: 1.5mm 2.5mm;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}
.other-instructions-title {
  font-weight: 900;
  font-size: 10pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #000;
  border-bottom: 1.2px solid #000;
  padding-bottom: 1mm;
  margin-bottom: 1.5mm;
}
.other-instructions-blank {
  flex: 1;
  width: 100%;
}

/* ── FOLD 3: BOTTOM SECTION (EXPANDED TO FILL FULL FOLD) ── */
.bottom-section {
  border: 2px solid #000;
  margin-top: 1.5mm;
  padding: 2.5mm 3.5mm;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.bottom-strip {
  display: flex;
  gap: 6mm;
  padding-bottom: 2.5mm;
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
.bottom-field .populated-val {
  font-size: 11pt;
  font-weight: 700;
  color: #000;
  border-bottom: 1.5px solid #000;
  padding: 0.5mm 2mm;
  flex: 1;
  display: inline-block;
}
.bottom-notes-area {
  margin-top: 2mm;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.bottom-notes-lines {
  flex: 1;
  width: 100%;
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
       (Height enlarged by ~0.5 inch / ~13mm to 111mm)
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

    <!-- UNIFIED CUSTOMER INFO TABLE (PERFECT GRID ALIGNMENT) -->
    <table class="info-table">
      <!-- ROW 1: BILL NO / S.NO / DATE -->
      <tr>
        <td class="lbl" style="width:20mm;">BILL NO&nbsp;:</td>
        <td style="width:46mm;"><span class="val-block">${billNo}</span></td>
        <td class="lbl" style="width:13mm;">S.NO&nbsp;:</td>
        <td style="width:34mm;"><span class="val-block highlight-red">${sNo}</span></td>
        <td class="lbl" style="width:13mm;">DATE&nbsp;:</td>
        <td><span class="val-block">${date}</span></td>
      </tr>

      <!-- ROW 2: NAME / R.NO -->
      <tr>
        <td class="lbl" style="width:16mm;">NAME&nbsp;:</td>
        <td colspan="3"><span class="val-block highlight-red">${name}</span></td>
        <td class="lbl" style="width:16mm;">R.NO&nbsp;:</td>
        <td><span class="val-block highlight-red">${rNo}</span></td>
      </tr>

      <!-- ROW 3: FATHER NAME -->
      <tr>
        <td class="lbl" style="width:30mm;">FATHER NAME&nbsp;:</td>
        <td colspan="5"><span class="val-block">${fatherName}</span></td>
      </tr>

      <!-- ROW 4: HUSBAND NAME -->
      <tr>
        <td class="lbl" style="width:30mm;">HUSBAND NAME&nbsp;:</td>
        <td colspan="5"><span class="val-block">${husbandName}</span></td>
      </tr>

      <!-- ROW 5: P.NO (3 REG) ON LEFT, ITEMS ON RIGHT -->
      <tr>
        <td colspan="4" style="padding:1.5mm 2mm; vertical-align:top; background:#fafafa;">
          <div class="phones-hdr">P.NO (3 REG) :</div>
          <div class="phones-list">
            ${
              recent3Phones.length > 0
                ? recent3Phones.map((ph, idx) => `<span class="phone-chip">#${idx + 1}: ${ph}</span>`).join('')
                : '<div style="height:11mm;"></div>'
            }
          </div>
        </td>
        <td colspan="2" style="padding:1.5mm 2mm; vertical-align:top; background:#fff;">
          <div class="large-items-header">ITEMS :</div>
          <div class="large-items-write">
            <span class="items-square-blank"></span>
          </div>
        </td>
      </tr>

      <!-- ROW 6: ADDRESS -->
      <tr>
        <td class="lbl" style="width:20mm; vertical-align:top; padding-top:1.2mm;">ADDRESS&nbsp;:</td>
        <td colspan="5"><span class="addr-val">${address}</span></td>
      </tr>

      <!-- ROW 7 & 8: NO. OF QUANTITIES (PERFECTLY INTEGRATED IN TABLE GRID) -->
      <tr>
        <td class="lbl" rowspan="2" style="width:20mm; vertical-align:middle; text-align:center;">NO. OF&nbsp;:</td>
        <td colspan="5" style="padding: 1mm 1.5mm;">
          <div class="qty-row">
            <div class="qty-item"><span class="garment-name-black">TOPS</span><span class="qty-box"></span></div>
            <div class="qty-item"><span class="garment-name-black">BOTTOM</span><span class="qty-box"></span></div>
            <div class="qty-item"><span class="garment-name-black">DHUPATTA</span><span class="qty-box"></span></div>
            <div class="qty-item"><span class="garment-name-black">NIGHTY</span><span class="qty-box"></span></div>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="5" style="padding: 1mm 1.5mm;">
          <div class="qty-row">
            <div class="qty-item"><span class="garment-name-black">BLOWS</span><span class="qty-box"></span></div>
            <div class="qty-item"><span class="garment-name-black">SAREE</span><span class="qty-box"></span></div>
            <div class="qty-item"><span class="garment-name-black">FALLS</span><span class="qty-box"></span></div>
            <div class="qty-item"><span class="garment-name-black">OTHERS</span><span class="qty-box"></span></div>
          </div>
        </td>
      </tr>
    </table>

  </div><!-- end fold-1 -->

  <!-- ========================================================
       FOLD 2: TAILORING DETAILS (MIDDLE FOLD)
       - Left Half: LINING, SLEEVE (SL), BH, SLIT, FITTING (below slit)
       - Right Half: OTHER INSTRUCTIONS (full 2nd half)
       - ZIP, NECK, BOTTOM removed
       ======================================================== -->
  <div class="fold-section fold-2">
    <div class="fold-2-inner">
      <div class="fold-2-hdr">
        <span>TAILORING SPECIFICATIONS &amp; CUTTING INSTRUCTIONS</span>
        <span style="font-size:8.5pt; font-weight:700; color:#444;">FOLD 2 – WORKSHOP MASTER INSTRUCTIONS</span>
      </div>

      <div class="two-col-tailoring">

        <!-- LEFT HALF: LINING, SLEEVE, BH, SLIT, FITTING -->
        <div class="col-stack-left">

          <!-- LINING -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>LINING :</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- SLEEVE (SL) -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>SLEEVE (SL) :</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- BH -->
          <div class="section-box" style="flex:1.2;">
            <div class="section-box-title">
              <span>BH :</span>
            </div>
            <span class="write-box-md"></span>
          </div>

          <!-- SLIT -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>SLIT :</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

          <!-- FITTING (MOVED BELOW SLIT) -->
          <div class="section-box" style="flex:1;">
            <div class="section-box-title">
              <span>FITTING :</span>
            </div>
            <span class="write-box-sm"></span>
          </div>

        </div><!-- end left half -->

        <!-- RIGHT HALF: OTHER INSTRUCTIONS (EXPANDED TO OCCUPY 2ND HALF - CLEAN BLANK CANVAS) -->
        <div class="col-stack-right">
          <div class="other-instructions-full">
            <div class="other-instructions-title">OTHER INSTRUCTIONS :</div>
            <div class="other-instructions-blank"></div>
          </div>
        </div><!-- end right half -->

      </div><!-- end two-col-tailoring -->
    </div>
  </div><!-- end fold-2 -->

  <!-- ========================================================
       FOLD 3: BOTTOM SECTION (PRESERVED)
       ======================================================== -->
  <div class="fold-section fold-3">
    <div class="bottom-section">
      <div class="bottom-strip">
        <div class="bottom-field">
          <span class="lbl">NAME :</span>
          <span class="populated-val highlight-red">${name}</span>
        </div>
        <div class="bottom-field" style="max-width:45mm;">
          <span class="lbl">R.NO :</span>
          <span class="populated-val highlight-red">${rNo}</span>
        </div>
        <div class="bottom-field" style="max-width:55mm;">
          <span class="lbl">DUE DATE :</span>
          <span class="populated-val">${dueDate}</span>
        </div>
      </div>
      
      <!-- Expanded notes / instructions handwritten area (clean blank area) -->
      <div class="bottom-notes-area">
        <div class="bottom-notes-lines"></div>
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

export function printCustomerBookingForm(order?: Order | null): void {
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

export function printBlankBookingForm(): void {
  printCustomerBookingForm(null);
}
