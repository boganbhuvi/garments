import React, { useState } from 'react';
import { Order } from '../types/order';
import { api } from '../services/api';
import { useOrder } from '../context/OrderContext';
import { CheckCircle2, AlertTriangle, RotateCcw, ArrowRight, History } from 'lucide-react';

interface DepartmentTransitionBarProps {
  order: Order;
  onTransitioned?: (updated: Order) => void;
}

export const DepartmentTransitionBar: React.FC<DepartmentTransitionBarProps> = ({
  order,
  onTransitioned,
}) => {
  const { showToast, setSelectedDetailOrder } = useOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reworkNote, setReworkNote] = useState('');
  const [showReworkBox, setShowReworkBox] = useState(false);
  const [reworkTarget, setReworkTarget] = useState<'CUTTING' | 'STITCHING'>('STITCHING');

  const prodStatus = order.productionStatus || 'AWAITING_CUTTING';
  const fulfillStatus = order.fulfillmentStatus || 'NOT_READY';

  const runTransition = async (
    stage: 'ORDER' | 'PRODUCTION' | 'FULFILLMENT',
    targetStatus: string,
    note?: string,
    targetDept?: 'CUTTING' | 'STITCHING'
  ) => {
    setLoading(true);
    setError(null);
    const res = await api.transitionOrder(order.id, {
      stage,
      targetStatus,
      note,
      reworkTarget: targetDept,
    });
    setLoading(false);
    if (!res.ok || !res.order) {
      setError(res.error || 'Transition failed');
      return;
    }
    showToast(`✓ Order #${order.id} transitioned to ${targetStatus.replace(/_/g, ' ')}`, 'success');
    setShowReworkBox(false);
    setReworkNote('');
    setSelectedDetailOrder(res.order);
    onTransitioned?.(res.order);
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold uppercase text-slate-500">Production:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold">
            {prodStatus.replace(/_/g, ' ')}
          </span>
          <span className="font-bold uppercase text-slate-500 ml-2">Fulfillment:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
            {fulfillStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stage Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {prodStatus === 'AWAITING_CUTTING' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('PRODUCTION', 'CUTTING')}
            className="px-3.5 py-2 rounded-lg bg-[#7F1D1D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>Start Cutting</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {prodStatus === 'CUTTING' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('PRODUCTION', 'AWAITING_STITCHING')}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> <span>Complete Cutting → Stitching</span>
          </button>
        )}
        {prodStatus === 'AWAITING_STITCHING' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('PRODUCTION', 'STITCHING')}
            className="px-3.5 py-2 rounded-lg bg-[#7F1D1D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>Start Stitching</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {prodStatus === 'STITCHING' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('PRODUCTION', 'AWAITING_QC')}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> <span>Complete Stitching → QC</span>
          </button>
        )}
        {prodStatus === 'AWAITING_QC' && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTransition('PRODUCTION', 'QC_APPROVED')}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> <span>Approve QC</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowReworkBox((prev) => !prev)}
              className="px-3.5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> <span>Reject / Rework</span>
            </button>
          </>
        )}
        {prodStatus === 'REWORK' && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTransition('PRODUCTION', 'CUTTING')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Re-Start Cutting
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTransition('PRODUCTION', 'STITCHING')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Re-Start Stitching
            </button>
          </>
        )}

        {/* Fulfillment Actions (only when QC_APPROVED) */}
        {prodStatus === 'QC_APPROVED' && fulfillStatus === 'NOT_READY' && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTransition('FULFILLMENT', 'READY_FOR_PICKUP')}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Mark Ready for Pickup
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTransition('FULFILLMENT', 'READY_FOR_DISPATCH')}
              className="px-3.5 py-2 rounded-lg bg-[#7F1D1D] text-white text-xs font-bold cursor-pointer"
            >
              Mark Ready for Dispatch
            </button>
          </>
        )}
        {prodStatus === 'QC_APPROVED' && (fulfillStatus === 'READY_FOR_DISPATCH' || fulfillStatus === 'READY_FOR_PICKUP') && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('FULFILLMENT', 'DISPATCHED')}
            className="px-3.5 py-2 rounded-lg bg-[#7F1D1D] text-white text-xs font-bold cursor-pointer"
          >
            Record Dispatch
          </button>
        )}
        {prodStatus === 'QC_APPROVED' && (fulfillStatus === 'DISPATCHED' || fulfillStatus === 'READY_FOR_PICKUP') && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('FULFILLMENT', 'DELIVERED')}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
          >
            Confirm Delivery
          </button>
        )}
      </div>

      {/* Mandatory Defect Note Box for QC Rework */}
      {showReworkBox && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-900">
            <span>Rework Destination:</span>
            <select
              value={reworkTarget}
              onChange={(e) => setReworkTarget(e.target.value as any)}
              className="px-2 py-1 rounded border border-red-300 bg-white text-xs"
            >
              <option value="STITCHING">Stitching</option>
              <option value="CUTTING">Cutting</option>
            </select>
          </div>
          <textarea
            rows={2}
            value={reworkNote}
            onChange={(e) => setReworkNote(e.target.value)}
            placeholder="Mandatory defect remark (e.g. sleeve length mismatch)..."
            className="w-full px-3 py-2 rounded-lg border border-red-300 text-xs bg-white"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => runTransition('PRODUCTION', 'REWORK', reworkNote, reworkTarget)}
            className="px-4 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold cursor-pointer"
          >
            Confirm Send to {reworkTarget} Rework
          </button>
        </div>
      )}

      {/* Transition Audit History */}
      {order.workflowHistory && order.workflowHistory.length > 0 && (
        <div className="pt-2 border-t border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <History className="w-3 h-3" /> Transition History
          </p>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {[...order.workflowHistory].reverse().map((h, i) => (
              <div key={i} className="text-[11px] text-slate-600 flex justify-between">
                <span>
                  <strong>{h.stage}</strong>: {h.fromStatus} → <strong>{h.toStatus}</strong> ({h.changedBy} / {h.role})
                  {h.note ? ` — "${h.note}"` : ''}
                </span>
                <span className="text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
