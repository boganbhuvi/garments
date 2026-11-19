import React from 'react';
import { Order, GarmentSpecification } from '../../types/order';
import { Printer, X, Scissors, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';

interface StitchingWorksheetPrintProps {
  order: Order;
  garmentIndex?: number;
  onClose: () => void;
}

export const StitchingWorksheetPrint: React.FC<StitchingWorksheetPrintProps> = ({
  order,
  garmentIndex,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const garmentsToPrint: { spec: GarmentSpecification; idx: number }[] = 
    garmentIndex !== undefined && order.garmentSpecs[garmentIndex]
      ? [{ spec: order.garmentSpecs[garmentIndex], idx: garmentIndex }]
      : order.garmentSpecs.map((spec, idx) => ({ spec, idx }));

  const customer = order.customer;
  const meas = order.measurements;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Top Control Bar (Screen only) */}
        <div className="bg-[#233B5D] text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black">
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Stitching Production Worksheet</h2>
              <p className="text-xs text-slate-300">A4 Workshop Cut & Stitch Specification (Zero Billing)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Worksheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Content */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:m-0 text-[#191C1E] font-sans space-y-6">
          
          {garmentsToPrint.map(({ spec, idx }) => {
            const itemNumber = idx + 1;
            const itemTitle = spec.title || `${spec.category} 0${itemNumber}`;
            const stitching = spec.stitchingDetails;

            return (
              <div 
                key={spec.id || idx} 
                className="border-2 border-slate-800 rounded-2xl p-6 bg-white space-y-5 print:border-black print:rounded-none print:break-after-page"
              >
                
                {/* Header Banner */}
                <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black text-[#233B5D] tracking-tight uppercase">
                      Giriraj Garments — Stitching Worksheet
                    </div>
                    <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                      Workshop Tailoring Directive • Pattern & Measurement Card
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold uppercase block">Token Number</span>
                    <span className="text-2xl font-black text-[#233B5D] block tracking-tight">
                      {order.serialNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Bill #{order.id}
                    </span>
                  </div>
                </div>

                {/* Meta details strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer Name</span>
                    <strong className="text-sm font-extrabold text-slate-800 block">{customer.customerName}</strong>
                    <span className="text-slate-500">{customer.primaryPhone}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Garment Piece</span>
                    <strong className="text-sm font-black text-[#147D75] block">{itemTitle}</strong>
                    <span className="text-slate-600 font-bold uppercase">{spec.category}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Tailor</span>
                    <strong className="text-sm font-extrabold text-[#233B5D] block">
                      {stitching?.tailorName || 'Pending Allocation'}
                    </strong>
                    <span className="text-slate-600 font-semibold">{stitching?.specialization || 'Master Tailor'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Delivery Due Date</span>
                    <strong className="text-sm font-black text-red-600 block">
                      {order.billing.dueDate || 'Normal Schedule'}
                    </strong>
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      Priority: {order.billing.priority}
                    </span>
                  </div>
                </div>

                {/* TAILOR MEASUREMENTS GRID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      Tailor Stitching Measurements ({meas.unit})
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Fitting: <strong>{spec.fitting || 'Standard Medium'}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      { label: 'Length', val: meas.blouseLength || meas.topLength || meas.frontLength },
                      { label: 'Shoulder', val: meas.shoulder },
                      { label: 'Chest', val: meas.chest },
                      { label: 'Bust', val: meas.bust },
                      { label: 'Waist', val: meas.waist },
                      { label: 'Hip', val: meas.hip },
                      { label: 'Armhole', val: meas.armhole },
                      { label: 'Sleeve L', val: meas.sleeveLength },
                      { label: 'Sleeve R', val: meas.sleeveRound },
                      { label: 'Front Neck', val: meas.frontNeckDepth },
                      { label: 'Back Neck', val: meas.backNeckDepth },
                      { label: 'Bottom L', val: meas.bottomLength },
                    ].map((item, mIdx) => (
                      <div key={mIdx} className="bg-slate-100 p-2.5 rounded-xl border border-slate-300">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">{item.label}</span>
                        <span className="text-xl font-black text-slate-900 block mt-1">
                          {item.val ? `${item.val}${meas.unit}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STYLE & PATTERN SPECIFICATIONS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Front Neck</span>
                    <strong className="text-sm font-black text-slate-800 block mt-0.5">{spec.frontNeckDesign || 'Standard'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Back Neck</span>
                    <strong className="text-sm font-black text-slate-800 block mt-0.5">{spec.backNeckDesign || 'Standard'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sleeve Cut</span>
                    <strong className="text-sm font-black text-slate-800 block mt-0.5">{spec.sleeveType || 'Standard'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Hooks & Zip</span>
                    <strong className="text-sm font-black text-slate-800 block mt-0.5">{spec.frontHookOrBack || spec.zip || 'Front Hook'}</strong>
                  </div>
                </div>

                {/* MASTER TAILOR INSTRUCTIONS */}
                {(spec.tailorInstructions || stitching?.instructions) && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs">
                    <strong className="text-amber-900 uppercase font-black block mb-0.5">
                      Workshop Tailor Directive:
                    </strong>
                    <p className="text-slate-800 font-bold whitespace-pre-line">
                      {stitching?.instructions || spec.tailorInstructions}
                    </p>
                  </div>
                )}

                {/* SIGN OFF STRIP */}
                <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <div>
                    <span>Piece Rate Agreed: </span>
                    <strong className="text-slate-800 font-black">₹{stitching?.pieceRate || 250}</strong>
                  </div>
                  <div>
                    <span>Allocated Date: </span>
                    <strong className="text-slate-800">{stitching?.allocatedAt ? new Date(stitching.allocatedAt).toLocaleDateString() : 'Today'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block">Tailor Signature: __________________</span>
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};
