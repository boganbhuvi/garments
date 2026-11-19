import React, { useState } from 'react';
import { Order, CuttingStatus } from '../types/order';
import { generateStatusWhatsAppMessage, sendWhatsAppNotification } from '../services/whatsappService';
import {
  MessageSquare,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Send,
  Phone,
  User,
  ShieldCheck,
  Scissors
} from 'lucide-react';

interface StatusChangeConfirmationModalProps {
  isOpen: boolean;
  order: Order;
  currentStatus: string;
  targetStatus: string;
  defaultRemarks?: string;
  onConfirm: (remarks: string, sentWhatsApp: boolean) => void;
  onCancel: () => void;
}

export const StatusChangeConfirmationModal: React.FC<StatusChangeConfirmationModalProps> = ({
  isOpen,
  order,
  currentStatus,
  targetStatus,
  defaultRemarks = '',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const [remarks, setRemarks] = useState(defaultRemarks);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const customerPhone = order.customer.primaryPhone;
  const hasPhone = Boolean(customerPhone && customerPhone.replace(/\D/g, '').length >= 10);

  const previewMessage = generateStatusWhatsAppMessage(order, targetStatus, remarks);

  const handleSaveAndSend = () => {
    let sent = false;
    if (sendWhatsApp && hasPhone) {
      sent = sendWhatsAppNotification(customerPhone, previewMessage);
    }
    onConfirm(remarks, sent);
  };

  const handleSaveOnly = () => {
    onConfirm(remarks, false);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#233B5D] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black">
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Confirm Status Change</h3>
              <p className="text-xs text-slate-300">Live order update & customer notification</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-[#191C1E]">
          
          {/* Order & Customer Summary Strip */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Order & Token</span>
              <strong className="text-sm font-black text-[#233B5D] block">{order.id}</strong>
              <span className="text-slate-500 font-semibold">{order.serialNumber}</span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer</span>
              <strong className="text-sm font-extrabold text-slate-800 block">{order.customer.customerName}</strong>
              <span className="text-slate-500 font-semibold flex items-center justify-end gap-1">
                <Phone className="w-3 h-3 text-[#147D75]" />
                <span>+91 {order.customer.primaryPhone || 'N/A'}</span>
              </span>
            </div>
          </div>

          {/* Status Change Arrow Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-center gap-3">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Previous</span>
              <span className="px-2.5 py-1 rounded-md text-xs font-black bg-slate-200 text-slate-700 uppercase">
                {currentStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-[#233B5D]" />

            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">New Status</span>
              <span className={`px-3 py-1 rounded-md text-xs font-black uppercase text-white shadow-xs ${
                targetStatus === 'CUTTING_COMPLETED' ? 'bg-[#16834A]' :
                targetStatus === 'IN_CUTTING' ? 'bg-[#147D75]' :
                targetStatus === 'ON_HOLD' ? 'bg-red-600' :
                'bg-blue-600'
              }`}>
                {targetStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Remarks / Master Notes input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Workshop Remarks / Observations (Optional):</span>
              <span className="text-[11px] text-slate-400 font-normal">Included in customer alert</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cloth marked and cut on bias. Handed over to stitching master."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-slate-50"
            />
          </div>

          {/* WhatsApp Notification Toggle Option */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            sendWhatsApp ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-black text-sm text-slate-900">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Send Live WhatsApp Notification to Customer</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Automatically delivers live status update directly to <strong>+91 {customerPhone}</strong>.
                </p>
                {!hasPhone && (
                  <span className="text-[11px] text-amber-700 font-bold block mt-1">
                    ⚠️ Notice: Customer phone number is incomplete.
                  </span>
                )}
              </div>
            </label>

            {/* Toggle Preview Button */}
            {sendWhatsApp && (
              <div className="mt-2.5 pt-2 border-t border-emerald-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  {showPreview ? 'Hide Message Preview' : '👁️ View WhatsApp Message Preview'}
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp Message Bubble Preview */}
          {sendWhatsApp && showPreview && (
            <div className="bg-[#E5DDD5] p-3 rounded-xl border border-slate-300 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-700" />
                <span>WhatsApp Message Preview</span>
              </div>
              <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs font-sans text-slate-800 whitespace-pre-line border border-slate-200 max-h-48 overflow-y-auto">
                {previewMessage}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Buttons */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold border border-slate-300 transition-all cursor-pointer"
          >
            Cancel
          </button>

          {sendWhatsApp && hasPhone ? (
            <button
              type="button"
              onClick={handleSaveAndSend}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Send WhatsApp Update</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-5 py-2.5 rounded-xl bg-[#233B5D] hover:bg-[#1a2d47] text-white text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Save Update</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
