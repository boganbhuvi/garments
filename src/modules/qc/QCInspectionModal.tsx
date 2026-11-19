import React, { useState } from 'react';
import { Order, GarmentSpecification, QCInspectionRecord } from '../../types/order';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RotateCcw, 
  Ruler, 
  Scissors, 
  Sparkles,
  Flame,
  Clock
} from 'lucide-react';

interface QCInspectionModalProps {
  order: Order;
  garmentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveQC: (orderId: string, garmentIndex: number, record: QCInspectionRecord, remarks?: string) => Promise<void>;
}

export const QCInspectionModal: React.FC<QCInspectionModalProps> = ({
  order,
  garmentIndex,
  isOpen,
  onClose,
  onSaveQC,
}) => {
  const spec = order.garmentSpecs[garmentIndex];
  const meas = order.measurements;

  const [inspectorName, setInspectorName] = useState(spec?.qcDetails?.inspectorName || 'Master QC Auditor');
  const [toleranceMm, setToleranceMm] = useState(spec?.qcDetails?.measurementToleranceMm || 6); // ~ 0.25 inch
  const [measurementsVerified, setMeasurementsVerified] = useState(spec?.qcDetails?.measurementsVerified ?? true);
  const [stitchingQualityPassed, setStitchingQualityPassed] = useState(spec?.qcDetails?.stitchingQualityPassed ?? true);
  const [designMatchesSpec, setDesignMatchesSpec] = useState(spec?.qcDetails?.designMatchesSpec ?? true);
  const [fittingPassed, setFittingPassed] = useState(spec?.qcDetails?.fittingPassed ?? true);
  const [finishingPassed, setFinishingPassed] = useState(spec?.qcDetails?.finishingPassed ?? true);

  const [decision, setDecision] = useState<'PASSED' | 'REWORK_REQUIRED'>('PASSED');
  const [reworkDept, setReworkDept] = useState<'Cutting' | 'Stitching'>('Stitching');
  const [reworkNotes, setReworkNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !spec) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    const record: QCInspectionRecord = {
      inspectorName: inspectorName.trim() || 'Master QC Auditor',
      inspectedAt: new Date().toISOString(),
      status: 'PASSED',
      measurementsVerified,
      measurementToleranceMm: toleranceMm,
      stitchingQualityPassed,
      designMatchesSpec,
      fittingPassed,
      finishingPassed,
      notes: generalNotes.trim() || 'Passed all quality benchmarks',
    };
    await onSaveQC(order.id, garmentIndex, record, generalNotes);
    setIsSubmitting(false);
    onClose();
  };

  const handleRejectRework = async () => {
    if (!reworkNotes.trim()) {
      alert('Please specify the defect or rework reason so the workshop master can rectify it.');
      return;
    }
    setIsSubmitting(true);
    const record: QCInspectionRecord = {
      inspectorName: inspectorName.trim() || 'Master QC Auditor',
      inspectedAt: new Date().toISOString(),
      status: 'REWORK_REQUIRED',
      measurementsVerified,
      measurementToleranceMm: toleranceMm,
      stitchingQualityPassed,
      designMatchesSpec,
      fittingPassed,
      finishingPassed,
      notes: generalNotes.trim(),
      reworkDepartment: reworkDept,
      reworkInstructions: reworkNotes.trim(),
    };
    await onSaveQC(order.id, garmentIndex, record, `Rework: ${reworkNotes.trim()}`);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#233B5D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Quality Control Audit • {order.id}
              </span>
              <h3 className="text-[19px] font-black leading-tight">
                {spec.title} (Piece #{garmentIndex + 1})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${
              order.billing.priority === 'Express' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {order.billing.priority}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Inspection Form */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-slate-900 text-[13px]">
          
          {/* Order & Customer Summary Pill */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[12px]">
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Customer</span>
              <strong className="text-slate-900">{order.customer.customerName}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Tailor Assigned</span>
              <strong className="text-slate-900">{spec.stitchingDetails?.tailorName || 'Unassigned'}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Due Commitment</span>
              <strong className="text-emerald-700">{order.billing.dueDate}</strong>
            </div>
          </div>

          {/* 1. Measurement Tolerance Verification */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-[14px] text-slate-900 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-indigo-600" />
                1. Measurement & Tolerance Audit
              </span>
              <div className="flex items-center gap-1 text-[12px] text-slate-600">
                <span>Tolerance:</span>
                <select
                  value={toleranceMm}
                  onChange={(e) => setToleranceMm(Number(e.target.value))}
                  className="bg-slate-100 font-bold px-2 py-1 rounded border border-slate-300"
                >
                  <option value={4}>± 4mm (Tight / High Fashion)</option>
                  <option value={6}>± 6mm (0.25 in / Standard)</option>
                  <option value={10}>± 10mm (0.375 in / Loose)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[12px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
              <div>Bust: <strong>{meas.bust || meas.chest || '—'}</strong></div>
              <div>Waist: <strong>{meas.waist || '—'}</strong></div>
              <div>Armhole: <strong>{meas.armhole || '—'}</strong></div>
              <div>Length: <strong>{meas.blouseLength || meas.topLength || '—'}</strong></div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={measurementsVerified}
                onChange={(e) => setMeasurementsVerified(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>All garment dimensions match original customer measurement record within tolerance</span>
            </label>
          </div>

          {/* 2. Technical Quality Checkpoints */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-3">
            <span className="font-black text-[14px] text-slate-900 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-emerald-600" />
              2. Workshop Workmanship Checkpoints
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={stitchingQualityPassed}
                  onChange={(e) => setStitchingQualityPassed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-medium">Stitching tension & straight seams</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={designMatchesSpec}
                  onChange={(e) => setDesignMatchesSpec(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-medium">Sleeve & neck match design selection</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={fittingPassed}
                  onChange={(e) => setFittingPassed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-medium">Fitting ease ({spec.fitting}) & 1.5" margins</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={finishingPassed}
                  onChange={(e) => setFinishingPassed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-medium">Hooks secured, threads clipped & pressed</span>
              </label>
            </div>
          </div>

          {/* 3. Decision Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-black text-[14px] text-slate-900">
              3. Quality Audit Decision:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('PASSED')}
                className={`p-3 rounded-xl border-2 font-black text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  decision === 'PASSED'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>APPROVE (Pass QC)</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REWORK_REQUIRED')}
                className={`p-3 rounded-xl border-2 font-black text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  decision === 'REWORK_REQUIRED'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>REWORK REQUIRED (Reject)</span>
              </button>
            </div>
          </div>

          {/* Rework Routing Section (Visible only when Rework selected) */}
          {decision === 'REWORK_REQUIRED' && (
            <div className="bg-amber-50/70 border-2 border-amber-400 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Rework Routing & Defect Instructions</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Route back to:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reworkDept"
                    value="Stitching"
                    checked={reworkDept === 'Stitching'}
                    onChange={() => setReworkDept('Stitching')}
                  />
                  <span>Stitching Department (Tailor)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reworkDept"
                    value="Cutting"
                    checked={reworkDept === 'Cutting'}
                    onChange={() => setReworkDept('Cutting')}
                  />
                  <span>Cutting Table (Re-cut/Trim)</span>
                </label>
              </div>

              <textarea
                rows={2}
                value={reworkNotes}
                onChange={(e) => setReworkNotes(e.target.value)}
                placeholder="e.g. Left armhole too tight by 0.5 inch; release side seam allowance and re-press."
                className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-[13px] font-medium resize-none focus:outline-none"
              />
            </div>
          )}

          {/* General Remarks */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 text-[12px]">Auditor Remarks & Notes</label>
            <input
              type="text"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="e.g. Fabric pressed, packed in boutique bag ready for trial handover."
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13px]"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-[13px]"
          >
            Cancel
          </button>

          {decision === 'PASSED' ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[14px] rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Pass QC & Move to Dispatch</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleRejectRework}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-black text-[14px] rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Flag Defect & Route for Rework</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
