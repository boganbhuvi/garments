import React, { useState } from 'react';
import { Order, GarmentSpecification } from '../../types/order';
import { StitchingStatus } from '../../types/stitching';
import {
  Scissors,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Send,
  Phone,
  Layers,
  PauseCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface StitchingStatusUpdateModalProps {
  isOpen: boolean;
  order: Order;
  garmentIndex: number;
  onConfirm: (
    newStatus: StitchingStatus,
    remarks: string,
    issues: string,
    reworkNotes: string
  ) => void;
  onClose: () => void;
}

export const StitchingStatusUpdateModal: React.FC<StitchingStatusUpdateModalProps> = ({
  isOpen,
  order,
  garmentIndex,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const spec = order.garmentSpecs[garmentIndex];
  if (!spec) return null;

  const currentStatus: StitchingStatus = 
    spec.stitchingDetails?.status || 'WAITING_FOR_STITCHING';

  const [selectedStatus, setSelectedStatus] = useState<StitchingStatus>(currentStatus);
  const [remarks, setRemarks] = useState(spec.stitchingDetails?.remarks || '');
  const [issues, setIssues] = useState(spec.stitchingDetails?.issues || '');
  const [reworkNotes, setReworkNotes] = useState(spec.stitchingDetails?.reworkNotes || '');

  const statusOptions: {
    status: StitchingStatus;
    label: string;
    desc: string;
    badgeColor: string;
  }[] = [
    {
      status: 'CUT_PIECES_ALLOCATED',
      label: 'Cut Pieces Allocated',
      desc: 'Fabric bundles handed over to tailor table',
      badgeColor: 'border-blue-300 bg-blue-50 text-blue-900'
    },
    {
      status: 'STITCHING_IN_PROGRESS',
      label: 'Stitching In Progress',
      desc: 'Machine sewing, darting, and assembling active',
      badgeColor: 'border-teal-300 bg-teal-50 text-teal-900'
    },
    {
      status: 'OVERLOCK_HEMMING_DONE',
      label: 'Overlock / Hemming Done',
      desc: 'Interlock, bottom hemming, hooks & finishing done',
      badgeColor: 'border-indigo-300 bg-indigo-50 text-indigo-900'
    },
    {
      status: 'READY_FOR_QC',
      label: 'Ready for QC (Completed)',
      desc: 'Garment fully stitched; ready for master inspection',
      badgeColor: 'border-emerald-300 bg-emerald-50 text-emerald-900'
    },
    {
      status: 'ON_HOLD',
      label: 'On Hold (Needs Fix)',
      desc: 'Awaiting lining, piping or customer clarification',
      badgeColor: 'border-red-300 bg-red-50 text-red-900'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedStatus, remarks, issues, reworkNotes);
  };

  const garmentTitle = spec.title || `${spec.category} 0${garmentIndex + 1}`;

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#233B5D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black">
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Update Stitching Progress</h3>
              <p className="text-xs text-slate-300">
                {garmentTitle} • Order #{order.id} ({order.serialNumber})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-[#191C1E]">
          
          {/* Garment Summary Strip */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Garment Piece</span>
              <strong className="text-sm font-black text-[#233B5D] block">{garmentTitle}</strong>
              <span className="text-slate-500 font-semibold">{spec.category}</span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Tailor</span>
              <strong className="text-sm font-black text-slate-800 block">
                {spec.stitchingDetails?.tailorName || 'Not Allocated'}
              </strong>
              <span className="text-slate-500 font-semibold">
                Rate: ₹{spec.stitchingDetails?.pieceRate || 250} / piece
              </span>
            </div>
          </div>

          {/* STATUS SELECTOR CARDS */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">
              Select Current Stitching Milestone:
            </label>
            <div className="space-y-2">
              {statusOptions.map(opt => {
                const isSelected = selectedStatus === opt.status;

                return (
                  <label
                    key={opt.status}
                    onClick={() => setSelectedStatus(opt.status)}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? `${opt.badgeColor} shadow-xs scale-[1.01]`
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="stitching_status"
                        checked={isSelected}
                        onChange={() => setSelectedStatus(opt.status)}
                        className="w-4 h-4 text-[#147D75] focus:ring-[#147D75] cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-black tracking-tight">{opt.label}</div>
                        <div className="text-xs opacity-75">{opt.desc}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/10">
                        Selected
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* OBSERVATIONS & REMARKS */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Stitching Master Observations / Notes:
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Front hooks attached cleanly. Neck piping completed."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            />
          </div>

          {/* ISSUES / REWORK INPUTS IF HOLD OR REWORK */}
          {(selectedStatus === 'ON_HOLD' || reworkNotes) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-3">
              <div>
                <label className="text-xs font-bold text-red-900 block mb-1">
                  Hold Reason / Missing Materials:
                </label>
                <input
                  type="text"
                  value={issues}
                  onChange={e => setIssues(e.target.value)}
                  placeholder="e.g. Can-can mesh missing or lining cloth short."
                  className="w-full p-2 rounded-lg border border-red-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-red-900 block mb-1">
                  Rework Requirements (If altered):
                </label>
                <input
                  type="text"
                  value={reworkNotes}
                  onChange={e => setReworkNotes(e.target.value)}
                  placeholder="e.g. Re-tighten armhole curve by 0.5 in."
                  className="w-full p-2 rounded-lg border border-red-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* WAGE NOTICE IF MARKING READY FOR QC */}
          {selectedStatus === 'READY_FOR_QC' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Piece-Rate Credited:</strong> Marking as Ready for QC will automatically credit{' '}
                <strong>₹{spec.stitchingDetails?.pieceRate || 250}</strong> to{' '}
                <strong>{spec.stitchingDetails?.tailorName || 'Assigned Tailor'}</strong> in the weekly wage ledger.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#233B5D] hover:bg-[#1a2d47] text-white text-sm font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Save Progress</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
