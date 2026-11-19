import React, { useState } from 'react';
import { Order, DispatchRecord } from '../../types/order';
import { 
  Package, 
  CheckCircle2, 
  IndianRupee, 
  Phone, 
  User, 
  X, 
  AlertTriangle, 
  CreditCard, 
  FileCheck 
} from 'lucide-react';

interface DispatchHandoverModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirmHandover: (orderId: string, record: DispatchRecord) => Promise<void>;
}

export const DispatchHandoverModal: React.FC<DispatchHandoverModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmHandover,
}) => {
  const customer = order.customer;
  const billing = order.billing;

  const [handedOverTo, setHandedOverTo] = useState(customer.customerName);
  const [recipientPhone, setRecipientPhone] = useState(customer.primaryPhone);
  const [balanceCollected, setBalanceCollected] = useState(billing.balanceAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [signatureAcknowledged, setSignatureAcknowledged] = useState(true);
  const [dispatchNotes, setDispatchNotes] = useState('All garments checked, tried, and handed over in boutique packaging.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!handedOverTo.trim()) {
      alert('Please enter recipient name.');
      return;
    }
    setIsSubmitting(true);
    const record: DispatchRecord = {
      dispatchedAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      handedOverTo: handedOverTo.trim(),
      recipientPhone: recipientPhone.trim(),
      collectedBalance: Number(balanceCollected) || 0,
      paymentMethod,
      customerSignature: signatureAcknowledged ? 'Customer Verified & Handover Confirmed' : 'Staff Handover',
      dispatchNotes: dispatchNotes.trim(),
      isDelivered: true,
    };
    await onConfirmHandover(order.id, record);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#233B5D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Counter Handover Settlement
              </span>
              <h3 className="text-[18px] font-black">
                Deliver Order #{order.id}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-4 text-slate-900 text-[13px]">
          
          {/* Balance Alert Box */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            billing.balanceAmount === 0
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider block">
                {billing.balanceAmount === 0 ? '✓ No Pending Balance' : '⚠ Outstanding Balance to Collect'}
              </span>
              <span className="text-[12px]">
                Total: ₹{billing.grandTotal.toLocaleString('en-IN')} • Advance: ₹{(billing.advanceAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[22px] font-black">
              ₹{billing.balanceAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Balance Collection Input */}
          {billing.balanceAmount > 0 && (
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-bold text-slate-800 text-[13px] flex items-center justify-between">
                  <span>Collecting Balance Amount (₹) *</span>
                  <span className="text-emerald-700 font-extrabold text-[15px]">₹{balanceCollected}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={billing.balanceAmount}
                  value={balanceCollected}
                  onChange={(e) => setBalanceCollected(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-[16px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#147D75]"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-bold text-slate-800 text-[13px]">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#147D75]"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>
            </div>
          )}

          {/* Recipient Details - Single Column Vertical */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-bold text-slate-800 text-[13px]">Handed Over To *</label>
            <input
              type="text"
              value={handedOverTo}
              onChange={(e) => setHandedOverTo(e.target.value)}
              placeholder="Customer or representative name"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-bold text-slate-800 text-[13px]">Recipient Phone Number</label>
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g. 98401 54321"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#147D75]"
            />
          </div>

          {/* Acknowledgement Checkbox */}
          <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={signatureAcknowledged}
              onChange={(e) => setSignatureAcknowledged(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span className="text-[13px] font-medium text-slate-800">
              Customer verified all <strong>{order.garmentSpecs.length} garments</strong> and approved trial fitting.
            </span>
          </label>

          {/* Notes */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-bold text-slate-800 text-[13px]">Handover Remarks & Notes</label>
            <input
              type="text"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#147D75]"
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

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[14px] rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Handover (Mark DELIVERED)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
