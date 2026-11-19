import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { CapacityOverrideRecord } from '../utils/capacityEngine';

interface AdminCapacityOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOverride: (override: CapacityOverrideRecord) => void;
  warningMessages: string[];
  dueDate: string;
}

export const AdminCapacityOverrideModal: React.FC<AdminCapacityOverrideModalProps> = ({
  isOpen,
  onClose,
  onConfirmOverride,
  warningMessages,
  dueDate,
}) => {
  const [reason, setReason] = useState('VIP Customer urgent booking - workshop overtime scheduled');
  const [authorizedBy, setAuthorizedBy] = useState('K. Ramanathan (Production Master)');
  const [authorizedRole, setAuthorizedRole] = useState<'Production Master' | 'Shop Manager' | 'Owner'>('Production Master');
  const [notes, setNotes] = useState('Client wedding on 24th; cutting table instructed to prioritize before standard lots.');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim() || !authorizedBy.trim()) {
      alert('Please fill in authorized supervisor name and reason.');
      return;
    }
    const record: CapacityOverrideRecord = {
      isOverridden: true,
      reason: reason.trim(),
      authorizedBy: authorizedBy.trim(),
      authorizedRole,
      timestamp: new Date().toISOString(),
      notes: notes.trim(),
    };
    onConfirmOverride(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-red-500 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-yellow-300" />
            <h3 className="text-[19px] font-black uppercase tracking-wide">
              Capacity Overload Override
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-[#191C1E]">
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-[13px] text-red-900 flex flex-col gap-1.5">
            <span className="font-bold flex items-center gap-1.5 text-red-800">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Target Delivery Date: {dueDate} Capacity Limit Exceeded
            </span>
            <ul className="list-disc pl-5 space-y-0.5 text-red-700 font-medium">
              {warningMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>

          <p className="text-[13px] text-gray-600">
            Accepting orders beyond production capacity risks delivery delays. An authorized supervisor or production master must sign off with a documented reason.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">Override Authorization Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-[14px] font-medium focus:outline-none focus:border-red-600"
            >
              <option value="VIP Customer urgent booking - workshop overtime scheduled">VIP Customer urgent booking - workshop overtime scheduled</option>
              <option value="Wedding / Muhurtham urgent commitment - master tailor priority">Wedding / Muhurtham urgent commitment - master tailor priority</option>
              <option value="Replacement / Alteration piece - immediate table insertion">Replacement / Alteration piece - immediate table insertion</option>
              <option value="Special Owner / Store Manager discretionary approval">Special Owner / Store Manager discretionary approval</option>
              <option value="Extra cutting shift allocated for this order">Extra cutting shift allocated for this order</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Authorized Supervisor Name *</label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                placeholder="e.g. K. Ramanathan"
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-[14px] font-bold text-[#191C1E] focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Role</label>
              <select
                value={authorizedRole}
                onChange={(e) => setAuthorizedRole(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-[14px] font-medium focus:outline-none focus:border-red-600"
              >
                <option value="Production Master">Production Master</option>
                <option value="Shop Manager">Shop Manager</option>
                <option value="Owner">Owner</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">Operational Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide instructions for workshop staff regarding overtime/priority queue"
              className="p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[13px] resize-none focus:outline-none focus:border-red-600"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-[14px] font-bold hover:bg-gray-50"
          >
            Cancel / Select Another Date
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-[14px] font-black flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Authorize & Record Override</span>
          </button>
        </div>

      </div>
    </div>
  );
};
