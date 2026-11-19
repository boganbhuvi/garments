import React, { useState } from 'react';
import { Order, GarmentSpecification } from '../../types/order';
import { TailorProfile } from '../../types/stitching';
import {
  UserCheck,
  X,
  Scissors,
  Calendar,
  IndianRupee,
  AlertTriangle,
  Layers,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface StitchingAllocationModalProps {
  isOpen: boolean;
  order: Order;
  tailors: TailorProfile[];
  initialGarmentIndices?: number[];
  onConfirm: (
    garmentIndices: number[],
    tailorId: string,
    pieceRate: number,
    expectedDate: string,
    instructions: string
  ) => void;
  onClose: () => void;
}

export const StitchingAllocationModal: React.FC<StitchingAllocationModalProps> = ({
  isOpen,
  order,
  tailors,
  initialGarmentIndices = [],
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  // Filter only active tailors
  const activeTailors = tailors.filter(t => t.active);

  // Default selection: if initial passed, use it; otherwise select all cut garments not yet completed
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    initialGarmentIndices.length > 0
      ? initialGarmentIndices
      : order.garmentSpecs.map((_, i) => i)
  );

  const [selectedTailorId, setSelectedTailorId] = useState<string>(
    activeTailors[0]?.id || ''
  );

  const selectedTailor = activeTailors.find(t => t.id === selectedTailorId);

  // Piece rate defaults to selected tailor's default rate or 250
  const [pieceRate, setPieceRate] = useState<number>(
    selectedTailor?.defaultPieceRate || 250
  );

  // Default expected completion date: 2 days before order due date or +3 days from now
  const defaultDueDate = order.billing.dueDate || '';
  const [expectedDate, setExpectedDate] = useState<string>(() => {
    if (defaultDueDate) return defaultDueDate;
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [instructions, setInstructions] = useState<string>('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTailorChange = (tId: string) => {
    setSelectedTailorId(tId);
    const t = activeTailors.find(item => item.id === tId);
    if (t) {
      setPieceRate(t.defaultPieceRate);
    }
  };

  const handleToggleGarment = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter(i => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndices.length === 0) {
      alert('Please select at least one garment piece to allocate.');
      return;
    }
    if (!selectedTailorId) {
      alert('Please select a master tailor from the list.');
      return;
    }
    if (pieceRate <= 0) {
      alert('Please enter a valid piece rate (e.g. ₹250).');
      return;
    }

    onConfirm(selectedIndices, selectedTailorId, pieceRate, expectedDate, instructions);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#233B5D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black">
              <UserCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Allocate Garments to Tailor</h3>
              <p className="text-xs text-slate-300">
                Order #{order.id} ({order.serialNumber}) • Customer: {order.customer.customerName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-[#191C1E]">
          
          {/* STEP 1: SELECT GARMENT PIECES */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#147D75]" />
                <span>Select Garment Pieces to Allocate ({selectedIndices.length} Selected):</span>
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedIndices(order.garmentSpecs.map((_, i) => i))}
                  className="text-[#147D75] font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedIndices([])}
                  className="text-slate-500 font-bold hover:underline cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {order.garmentSpecs.map((spec, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const currentTailor = spec.stitchingDetails?.tailorName;
                const currentStatus = spec.stitchingDetails?.status || 'WAITING_FOR_STITCHING';

                return (
                  <div
                    key={spec.id || idx}
                    onClick={() => handleToggleGarment(idx)}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#147D75] bg-teal-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Controlled via parent div click
                      className="w-4 h-4 rounded text-[#147D75] focus:ring-[#147D75] mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-black text-slate-800 truncate">
                          {spec.title || `${spec.category} 0${idx + 1}`}
                        </strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                          {spec.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Style: {spec.neckType || 'Custom'} • {spec.sleeveType || 'Standard'}
                      </div>
                      {currentTailor && (
                        <div className="text-[10px] text-emerald-700 font-bold mt-1">
                          ✓ Currently: {currentTailor} ({currentStatus.replace(/_/g, ' ')})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT TAILOR */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-black uppercase text-slate-800 tracking-wider">
              Assign to Master Tailor:
            </label>
            <select
              value={selectedTailorId}
              onChange={e => handleTailorChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            >
              {activeTailors.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.specialization} ({t.availability})
                </option>
              ))}
            </select>
            {selectedTailor && (
              <div className="text-xs text-slate-500 font-semibold mt-0.5">
                📞 +91 {selectedTailor.phone} • {selectedTailor.experienceYears} yrs experience
              </div>
            )}
          </div>

          {/* AGREED PIECE RATE */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-black uppercase text-slate-800 tracking-wider">
              Agreed Piece Rate Per Garment (₹):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="10"
                value={pieceRate}
                onChange={e => setPieceRate(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 text-sm font-black text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              Total for {selectedIndices.length} pieces: <strong>₹{pieceRate * selectedIndices.length}</strong>
            </span>
          </div>

          {/* STEP 3: SCHEDULE & TARGET */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-black uppercase text-slate-800 tracking-wider">
              Expected Completion Date:
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={e => setExpectedDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            />
            {order.billing.dueDate && (
              <span className="text-[11px] text-red-600 font-bold block mt-0.5">
                Customer Due Date: {order.billing.dueDate}
              </span>
            )}
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-black uppercase text-slate-800 tracking-wider">
              Tailor Special Directives / Notes:
            </label>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Ensure gold piping on neck. Give extra 1.5 in margin."
              className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            />
          </div>

          {/* Modal Footer */}
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
              className="px-6 py-2.5 rounded-xl bg-[#147D75] hover:bg-[#0f635d] text-white text-sm font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirm & Allocate ({selectedIndices.length} Pieces)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
