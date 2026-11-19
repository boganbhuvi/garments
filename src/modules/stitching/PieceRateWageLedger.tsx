import React, { useState } from 'react';
import { TailorWageEntry, TailorPaymentRecord, TailorProfile, TailorWageSummary } from '../../types/stitching';
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  CreditCard,
  User,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowUpRight,
  X
} from 'lucide-react';

interface PieceRateWageLedgerProps {
  wageSummaries: TailorWageSummary[];
  allWageEntries: TailorWageEntry[];
  paymentRecords: TailorPaymentRecord[];
  onRecordPayment: (payment: Omit<TailorPaymentRecord, 'id'>) => void;
}

export const PieceRateWageLedger: React.FC<PieceRateWageLedgerProps> = ({
  wageSummaries,
  allWageEntries,
  paymentRecords,
  onRecordPayment
}) => {
  const [selectedTailorId, setSelectedTailorId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModalTailor, setPaymentModalTailor] = useState<TailorWageSummary | null>(null);

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');

  const handleOpenPayment = (summary: TailorWageSummary) => {
    setPaymentModalTailor(summary);
    setPayAmount(summary.balanceDue);
    setPayMethod('Cash');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayNotes(`Weekly wage settlement for ${summary.tailorName}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalTailor) return;
    if (payAmount <= 0) {
      alert('Please enter an amount greater than ₹0');
      return;
    }

    const pendingIds = paymentModalTailor.pendingEntries.map(e => e.id);

    onRecordPayment({
      tailorId: paymentModalTailor.tailorId,
      tailorName: paymentModalTailor.tailorName,
      amountPaid: payAmount,
      paymentDate: payDate,
      paymentMethod: payMethod,
      notes: payNotes,
      wageEntryIds: pendingIds
    });

    setPaymentModalTailor(null);
  };

  // Aggregated totals
  const totalCompletedPieces = wageSummaries.reduce((sum, s) => sum + s.completedCount, 0);
  const totalGrossEarnings = wageSummaries.reduce((sum, s) => sum + s.totalEarnings, 0);
  const totalDisbursed = wageSummaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalOutstandingBalance = wageSummaries.reduce((sum, s) => sum + s.balanceDue, 0);

  const filteredSummaries = wageSummaries.filter(s => {
    const matchesSearch = 
      s.tailorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    const matchesTailor = selectedTailorId === 'ALL' || s.tailorId === selectedTailorId;

    return matchesSearch && matchesTailor;
  });

  return (
    <div className="space-y-6">
      
      {/* 4 Macro Wage Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400 block">Total Pieces Stitched</span>
          <div className="text-2xl font-black text-[#233B5D] mt-1">{totalCompletedPieces} Pieces</div>
          <span className="text-xs font-semibold text-slate-500 mt-0.5 block">Eligible completed work</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400 block">Gross Wage Earned</span>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{totalGrossEarnings.toLocaleString('en-IN')}</div>
          <span className="text-xs font-semibold text-slate-500 mt-0.5 block">Calculated at piece rates</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400 block">Total Wages Settled</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalDisbursed.toLocaleString('en-IN')}</div>
          <span className="text-xs font-semibold text-slate-500 mt-0.5 block">Paid via Cash / UPI</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400 block">Remaining Balance Due</span>
          <div className="text-2xl font-black text-red-600 mt-1">₹{totalOutstandingBalance.toLocaleString('en-IN')}</div>
          <span className="text-xs font-semibold text-slate-500 mt-0.5 block">Pending payment to tailors</span>
        </div>
      </div>

      {/* Tailor Wage Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        
        {/* Table Header Strip */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
              Weekly Master Tailor Wage Summary
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Strictly tracks completed garments • No double counting
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Wage Sheet</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Master Tailor</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4 text-center">Completed Pieces</th>
                <th className="py-3 px-4 text-right">Gross Earned</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-right">Wage Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredSummaries.map(summary => (
                <tr key={summary.tailorId} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Tailor Info */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <strong className="text-slate-900 block font-black">{summary.tailorName}</strong>
                    <span className="text-xs text-slate-500 font-semibold">{summary.phone}</span>
                  </td>

                  {/* Specialization */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#147D75]/10 text-[#147D75]">
                      {summary.specialization}
                    </span>
                  </td>

                  {/* Completed pieces count */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-800">
                      {summary.completedCount} Pcs
                    </span>
                  </td>

                  {/* Gross Earned */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                    ₹{summary.totalEarnings.toLocaleString('en-IN')}
                  </td>

                  {/* Total Paid */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-bold text-emerald-600">
                    ₹{summary.totalPaid.toLocaleString('en-IN')}
                  </td>

                  {/* Balance Due */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-black text-red-600">
                    ₹{summary.balanceDue.toLocaleString('en-IN')}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {summary.balanceDue > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(summary)}
                        className="px-4 py-2 bg-[#16834A] hover:bg-[#126b3c] text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Settle Wage (₹{summary.balanceDue})
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All Settled</span>
                      </span>
                    )}
                  </td>

                </tr>
              ))}

              {filteredSummaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                    No completed stitching work recorded for wages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Payment Settlement History */}
      {paymentRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">
            Recent Wage Disbursement History
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {paymentRecords.slice().reverse().map(rec => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <strong className="text-slate-800 text-sm font-black">{rec.tailorName}</strong>
                  <span className="text-slate-500 block">
                    Paid via {rec.paymentMethod} on {rec.paymentDate} • {rec.notes || 'Weekly settlement'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">
                    ₹{rec.amountPaid.toLocaleString('en-IN')}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Settled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Wage Modal */}
      {paymentModalTailor && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#233B5D]">Settle Tailor Wage</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Disburse piece-rate earnings to {paymentModalTailor.tailorName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalTailor(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs font-bold text-slate-700">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span>Total Outstanding Balance:</span>
                <strong className="text-base font-black text-red-600">
                  ₹{paymentModalTailor.balanceDue.toLocaleString('en-IN')}
                </strong>
              </div>

              <div>
                <label className="block mb-1">Amount to Pay Now (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalTailor.balanceDue}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16834A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16834A]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16834A]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Remarks / Reference</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid weekly wage in cash at workshop counter"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#16834A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalTailor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow"
                >
                  Confirm & Disburse ₹{payAmount}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
