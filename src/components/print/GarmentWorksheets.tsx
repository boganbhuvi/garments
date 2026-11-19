import React, { useState } from 'react';
import { Order, GarmentSpecification, MeasurementRecord } from '../../types/order';
import { Printer, Scissors, User, Calendar, Phone, X, Check } from 'lucide-react';

export interface GarmentWorksheetsProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  initialGarmentIndex?: number | 'ALL';
}

// Category normalization helper
function normalizeCategory(cat: string = ''): 'BLOUSE' | 'KURTI' | 'BOTTOM' | 'OTHER' {
  const c = cat.toLowerCase().trim();
  if (c.includes('blouse') || c.includes('choli') || c.includes('saree')) return 'BLOUSE';
  if (c.includes('kurti') || c.includes('top') || c.includes('kameez') || c.includes('tunic') || c.includes('shirt') || c.includes('gown')) return 'KURTI';
  if (c.includes('bottom') || c.includes('salwar') || c.includes('churidar') || c.includes('pant') || c.includes('palazzo') || c.includes('skirt') || c.includes('pajama')) return 'BOTTOM';
  return 'OTHER';
}

// Calculate product number in its category and overall (e.g. "Blouse 01 of 04", "Piece 1 of 8")
export function getProductNumberStrings(
  garment: GarmentSpecification, 
  allGarments: GarmentSpecification[]
): { categoryNumberStr: string; overallNumberStr: string } {
  const normCat = normalizeCategory(garment.category);
  const sameCategoryGarments = allGarments.filter(g => normalizeCategory(g.category) === normCat);
  const indexInCat = sameCategoryGarments.findIndex(g => g.id === garment.id || g === garment);
  const totalInCat = sameCategoryGarments.length;

  const catNum = String((indexInCat >= 0 ? indexInCat : 0) + 1).padStart(2, '0');
  const catTotal = String(totalInCat || 1).padStart(2, '0');

  const overallIndex = allGarments.findIndex(g => g.id === garment.id || g === garment);
  const overallTotal = allGarments.length;

  const displayCategory = garment.category || (normCat === 'BLOUSE' ? 'Blouse' : normCat === 'KURTI' ? 'Kurti' : normCat === 'BOTTOM' ? 'Bottom' : 'Garment');

  return {
    categoryNumberStr: `${displayCategory} ${catNum} of ${catTotal}`,
    overallNumberStr: `Garment ${(overallIndex >= 0 ? overallIndex : 0) + 1} of ${overallTotal}`
  };
}

interface RelevantMeasurement {
  label: string;
  value: number | string;
  unit: string;
}

// Extract only measurements relevant to the selected garment type
export function getRelevantMeasurements(category: string, meas: MeasurementRecord): RelevantMeasurement[] {
  const normCat = normalizeCategory(category);
  const unit = meas.unit || 'in';

  if (normCat === 'BLOUSE') {
    return [
      { label: 'Blouse Length', value: meas.blouseLength || meas.frontLength, unit },
      { label: 'Shoulder', value: meas.shoulder, unit },
      { label: 'Chest', value: meas.chest, unit },
      { label: 'Bust', value: meas.bust || meas.upperBust, unit },
      { label: 'Waist', value: meas.waist, unit },
      { label: 'Hip', value: meas.hip, unit },
      { label: 'Armhole', value: meas.armhole, unit },
      { label: 'Sleeve Length', value: meas.sleeveLength, unit },
      { label: 'Sleeve Round', value: meas.sleeveRound || meas.bicep, unit },
      { label: 'Front Neck', value: meas.frontNeckDepth, unit },
      { label: 'Back Neck', value: meas.backNeckDepth, unit },
    ].filter(m => m.value !== undefined && m.value !== '');
  }

  if (normCat === 'KURTI') {
    return [
      { label: 'Front Length', value: meas.topLength || meas.frontLength || meas.blouseLength, unit },
      { label: 'Back Length', value: meas.backLength, unit },
      { label: 'Shoulder', value: meas.shoulder, unit },
      { label: 'Chest', value: meas.chest, unit },
      { label: 'Bust', value: meas.bust, unit },
      { label: 'Waist', value: meas.waist, unit },
      { label: 'Hip', value: meas.hip, unit },
      { label: 'Armhole', value: meas.armhole, unit },
      { label: 'Sleeve Length', value: meas.sleeveLength, unit },
      { label: 'Sleeve Round', value: meas.sleeveRound, unit },
      { label: 'Front Neck', value: meas.frontNeckDepth, unit },
      { label: 'Back Neck', value: meas.backNeckDepth, unit },
    ].filter(m => m.value !== undefined && m.value !== '');
  }

  if (normCat === 'BOTTOM') {
    return [
      { label: 'Waist', value: meas.waist || meas.lowerWaist, unit },
      { label: 'Hip', value: meas.hip || meas.lowerHip, unit },
      { label: 'Thigh', value: meas.thigh, unit },
      { label: 'Knee', value: meas.knee, unit },
      { label: 'Bottom Length', value: meas.bottomLength || meas.outseam, unit },
      { label: 'Inseam', value: meas.inseam, unit },
      { label: 'Ankle', value: meas.ankle, unit },
    ].filter(m => m.value !== undefined && m.value !== '');
  }

  // OTHER / Universal fallback
  return [
    { label: 'Length', value: meas.blouseLength || meas.topLength || meas.frontLength || meas.bottomLength, unit },
    { label: 'Shoulder', value: meas.shoulder, unit },
    { label: 'Chest', value: meas.chest, unit },
    { label: 'Bust', value: meas.bust, unit },
    { label: 'Waist', value: meas.waist, unit },
    { label: 'Hip', value: meas.hip, unit },
    { label: 'Armhole', value: meas.armhole, unit },
    { label: 'Sleeve Length', value: meas.sleeveLength, unit },
    { label: 'Front Neck', value: meas.frontNeckDepth, unit },
    { label: 'Back Neck', value: meas.backNeckDepth, unit },
  ].filter(m => m.value !== undefined && m.value !== '');
}

function getMaterialSource(spec: GarmentSpecification, order: Order): string {
  if (spec.materials && spec.materials.length > 0 && spec.materials[0].source) {
    return spec.materials[0].source;
  }
  const matCheck = order.cuttingDetails?.materialsCheck;
  if (matCheck?.customerMaterial === 'Received') return 'Self Material (Customer Cloth)';
  if (matCheck?.shopMaterial === 'Received') return 'Shop Material (In Stock)';
  return 'Self Material';
}

export const GarmentWorksheets: React.FC<GarmentWorksheetsProps> = ({ 
  order, 
  isOpen, 
  onClose,
  initialGarmentIndex = 'ALL'
}) => {
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState<number | 'ALL'>(initialGarmentIndex);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const garments = order.garmentSpecs;
  const customer = order.customer;
  const billing = order.billing;
  const meas = order.measurements;

  // Garments to print
  const garmentsToRender: { spec: GarmentSpecification; index: number }[] = 
    selectedGarmentIndex === 'ALL'
      ? garments.map((spec, i) => ({ spec, index: i }))
      : [{ spec: garments[selectedGarmentIndex], index: selectedGarmentIndex }].filter(g => g.spec);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      
      {/* Strict CSS for 1 Page Per Garment Black-and-White Printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 7mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 10px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          /* KEY FIX: use display:block NOT flex — flex containers ignore height constraints in print */
          .garment-universal-a4-page {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            height: 267mm !important;
            max-height: 267mm !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 3mm 4mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            border: 1.5px solid #000000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: block !important;
          }
          .garment-universal-a4-page:last-child {
            page-break-after: avoid !important;
            break-after: auto !important;
          }
          /* Compress all interior spacing */
          .garment-universal-a4-page h1 { font-size: 14px !important; margin: 0 !important; }
          .garment-universal-a4-page h2 { font-size: 9px !important; margin: 0 !important; }
          .garment-universal-a4-page .print-section-gap { margin-top: 2mm !important; }
        }
      `}</style>

      {/* Screen Control Bar (Hidden on Print) */}
      <div className="w-full max-w-[850px] bg-white border-2 border-black rounded-xl shadow-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3 no-print sticky top-2 z-50">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-black">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Universal Garment Production Sheet
            </div>
            <h3 className="text-base font-black text-black leading-tight">
              Order #{order.id} • {customer.customerName} ({garments.length} Garments = {garments.length} A4 Pages)
            </h3>
          </div>
        </div>

        {/* Garment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-black text-black">Select Garment:</label>
          <select
            value={selectedGarmentIndex}
            onChange={(e) => setSelectedGarmentIndex(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-100 border border-black rounded-lg text-xs font-bold text-black focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Garments ({garments.length} Pages - 1 Page Per Garment)</option>
            {garments.map((g, idx) => {
              const numStr = getProductNumberStrings(g, garments);
              return (
                <option key={g.id || idx} value={idx}>
                  {numStr.categoryNumberStr}: {g.title}
                </option>
              );
            })}
          </select>
        </div>

        {/* Buttons: One big "PRINT ALL GARMENT WORKSHEETS" button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedGarmentIndex !== 'ALL') {
                setSelectedGarmentIndex('ALL');
                setTimeout(() => window.print(), 100);
              } else {
                handlePrint();
              }
            }}
            className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-lg text-sm font-black shadow-md flex items-center gap-2 transition-all cursor-pointer tracking-wide uppercase"
            title="Print all garments (1 Page per Garment)"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>PRINT ALL GARMENT WORKSHEETS</span>
          </button>

          {selectedGarmentIndex !== 'ALL' && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-black rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Print Selected Only
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Pages Container: Exactly 1 A4 Page Per Garment */}
      <div className="w-full max-w-[850px] space-y-6 print:space-y-0 print:w-full print:max-w-none">
        {garmentsToRender.map(({ spec, index }) => {
          const numStrings = getProductNumberStrings(spec, garments);
          const relevantMeas = getRelevantMeasurements(spec.category, meas);
          const materialSource = getMaterialSource(spec, order);

          return (
            <div
              key={spec.id || index}
              className="garment-universal-a4-page bg-white border-2 border-black p-5 text-black print:border-2 print:border-black print:p-3 print:m-0"
            >
              {/* UPPER SECTION */}
              <div>
                
                {/* 1. HEADER */}
                <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-black leading-none">
                      GIRIRAJ GARMENTS
                    </h1>
                    <div className="text-[10px] font-black uppercase tracking-widest text-black mt-0.5">
                      Universal Garment Production Worksheet • 1 Page Per Product
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                      JOB CARD
                    </div>
                    <div className="text-base font-black text-black leading-tight mt-0.5">
                      Bill No: {order.customer.billNumber || order.id}
                    </div>
                    <div className="text-[10px] font-bold text-black">
                      Token / Serial: {order.serialNumber}
                    </div>
                  </div>
                </div>

                {/* 2. CUSTOMER & ORDER METADATA (CLEAR 2-COLUMN TABLE) */}
                <div className="mt-1 border border-black p-1.5 bg-white text-xs">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                    <div>
                      <span className="font-bold text-black uppercase text-[10px] block">Customer Name:</span>
                      <strong className="text-sm font-black text-black">{customer.customerName}</strong>
                    </div>

                    <div>
                      <span className="font-bold text-black uppercase text-[10px] block">Phone Number:</span>
                      <strong className="text-sm font-black text-black">
                        {customer.primaryPhone} {customer.secondaryPhone ? `/ ${customer.secondaryPhone}` : ''}
                      </strong>
                    </div>

                    <div>
                      <span className="font-bold text-black uppercase text-[10px] block">Order Date:</span>
                      <span className="font-bold text-black">{billing.orderDate}</span>
                    </div>

                    <div>
                      <span className="font-bold text-black uppercase text-[10px] block">Due Date / Delivery:</span>
                      <strong className="text-sm font-black text-black border-b border-black">
                        {billing.dueDate}
                      </strong>
                    </div>

                    <div>
                      <span className="font-bold text-black uppercase text-[10px] block">Priority:</span>
                      <strong className="text-xs font-black uppercase px-2 py-0.5 border border-black inline-block mt-0.5">
                        {billing.priority.toUpperCase()}
                      </strong>
                    </div>

                    <div>
                      <span className="font-bold text-black uppercase text-[10px] block">Delivery Location:</span>
                      <span className="text-[11px] font-medium text-black truncate block">
                        {customer.areaLocation || customer.fullAddress || 'In-store Delivery'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. GARMENT DETAILS */}
                <div className="mt-1 border-2 border-black p-1.5 bg-slate-50 print:bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-black pb-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-black text-white text-xs font-black uppercase">
                        {spec.category.toUpperCase()}
                      </span>
                      <span className="text-sm font-black uppercase tracking-wide text-black">
                        {spec.title || `${spec.category} #${spec.garmentNumber}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <strong className="text-sm font-black uppercase border-b-2 border-black pb-0.5">
                        {numStrings.categoryNumberStr}
                      </strong>
                      <span className="text-[10px] text-slate-600 block">
                        ({numStrings.overallNumberStr})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-600 block">Garment Type:</span>
                      <strong className="text-xs font-black text-black">{spec.category}</strong>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-600 block">Quantity:</span>
                      <strong className="text-xs font-black text-black">1 Piece</strong>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-600 block">Material Source:</span>
                      <strong className="text-xs font-black text-black">{materialSource}</strong>
                    </div>
                  </div>
                </div>

                {/* 4. RELEVANT MEASUREMENTS TABLE */}
                <div className="mt-1">
                  <div className="border-b-2 border-black pb-0.5 mb-1 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-wider text-black">
                      Measurements for {spec.category.toUpperCase()} ({meas.unit || 'in'})
                    </h2>
                    <span className="text-[10px] font-bold text-black uppercase">
                      Profile: {meas.name || 'Master Record'}
                    </span>
                  </div>

                  {relevantMeas.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-center">
                      {relevantMeas.map((m, mIdx) => (
                        <div 
                          key={mIdx} 
                          className="border border-black p-1 bg-white"
                        >
                          <div className="text-[9px] font-bold uppercase text-slate-700 truncate leading-tight">
                            {m.label}
                          </div>
                          <div className="text-sm font-black text-black mt-0.5 leading-none">
                            {m.value} <span className="text-[10px] font-normal">{m.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-black p-2 text-center text-xs font-bold text-black">
                      Standard Master Profile Fit (Refer to Master Body Card)
                    </div>
                  )}

                  {meas.notes && (
                    <div className="mt-1 border border-black p-1 text-[10px] text-black">
                      <strong>Customer Measurement Note:</strong> {meas.notes}
                    </div>
                  )}
                </div>

                {/* 5. DESIGN SPECIFICATIONS */}
                <div className="mt-1.5">
                  <div className="border-b-2 border-black pb-0.5 mb-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-black">
                      Design & Pattern Specifications
                    </h2>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Sleeve Type</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.sleeveType || 'Standard'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Neck Design</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.frontNeckDesign || spec.neckType || 'Standard Round'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Front / Back Neck</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        F: {spec.frontNeckDesign || 'Round'} / B: {spec.backNeckDesign || 'Round U'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Zip / Hook</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.frontHookOrBack || spec.zip || 'Front Hook'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Slit</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.slit || 'N/A'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Lining</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.lining || 'Full Lining'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Fitting</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.fitting || 'Comfort Fit'}
                      </strong>
                    </div>

                    <div className="border border-black p-1.5">
                      <span className="text-[9px] font-bold uppercase text-slate-600 block">Bottom Style</span>
                      <strong className="text-xs font-black text-black block truncate mt-0.5">
                        {spec.bottomStyle || 'Standard'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 6. SPECIAL INSTRUCTIONS (TYPED DIRECTIVES) */}
                {(spec.tailorInstructions || spec.customerInstructions || spec.specialDesignNotes) && (
                  <div className="mt-1 border border-black p-1 text-xs bg-slate-50 print:bg-white space-y-0.5">
                    {spec.tailorInstructions && (
                      <div className="text-[11px]">
                        <strong className="font-black uppercase">Master Directives:</strong>{' '}
                        <span>{spec.tailorInstructions}</span>
                      </div>
                    )}
                    {spec.customerInstructions && (
                      <div className="text-[11px]">
                        <strong className="font-black uppercase">Customer Wishes:</strong>{' '}
                        <span>{spec.customerInstructions}</span>
                      </div>
                    )}
                    {spec.specialDesignNotes && (
                      <div className="text-[11px]">
                        <strong className="font-black uppercase">Design Notes:</strong>{' '}
                        <span>{spec.specialDesignNotes}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* LOWER SECTION: HANDWRITTEN NOTES AREA & SIGN-OFF (ANCHORED TO BOTTOM OF A4) */}
              <div className="mt-1">
                
                {/* 7. DEDICATED HANDWRITTEN NOTES BOX */}
                <div className="border-2 border-black p-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-black">
                      Special Instructions & Workshop Notes (Handwritten):
                    </span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">
                      Space for Tailor / Cutter Pen Notes
                    </span>
                  </div>

                  {/* Lined physical writing area – 3 lines */}
                  <div className="space-y-1.5 pt-0.5 pb-0.5">
                    <div className="border-b border-black border-dashed h-2 w-full" />
                    <div className="border-b border-black border-dashed h-2 w-full" />
                    <div className="border-b border-black border-dashed h-2 w-full" />
                  </div>
                </div>

                {/* 8. SIGNATURE / WORKSHOP SIGN-OFF STRIP */}
                <div className="mt-1 grid grid-cols-3 gap-2 text-center border-t-2 border-black pt-1 text-[9px] font-bold text-black">
                  <div>
                    <div className="h-4 border-b border-black mb-0.5" />
                    <span className="uppercase">Cutting Master Sign & Date</span>
                  </div>

                  <div>
                    <div className="h-4 border-b border-black mb-0.5" />
                    <span className="uppercase">Tailor Sign & Allocation</span>
                  </div>

                  <div>
                    <div className="h-4 border-b border-black mb-0.5" />
                    <span className="uppercase">Quality Inspection Sign</span>
                  </div>
                </div>

                {/* 9. FOOTER */}
                <div className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-black border-t border-black pt-0.5">
                  Giriraj Garments • Exact 1 A4 Page Per Garment • Confidential Workshop Production Chit
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
