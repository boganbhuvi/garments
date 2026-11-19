import React, { useState, useEffect } from 'react';
import { Order, WhatsAppNotificationRecord } from '../../types/order';
import { 
  WHATSAPP_TEMPLATES, 
  WhatsAppTemplateId, 
  sendWhatsAppNotification, 
  getRecommendedTemplateForStatus 
} from '../../services/whatsappService';
import { 
  MessageSquare, 
  X, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  User, 
  History,
  ExternalLink 
} from 'lucide-react';

interface WhatsAppNotificationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTemplate?: WhatsAppTemplateId;
  onRecordNotification?: (orderId: string, record: WhatsAppNotificationRecord) => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  order,
  isOpen,
  onClose,
  defaultTemplate,
  onRecordNotification
}) => {
  if (!isOpen || !order) return null;

  const recommended = defaultTemplate || getRecommendedTemplateForStatus(order.status);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateId>(recommended);
  const [customPhone, setCustomPhone] = useState(order.customer.primaryPhone || '');
  const [messageText, setMessageText] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Update text whenever template or order changes
  useEffect(() => {
    const tpl = WHATSAPP_TEMPLATES[selectedTemplate];
    if (tpl) {
      setMessageText(tpl.defaultText(order));
    }
  }, [selectedTemplate, order]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check if this template was already sent
  const history = order.notificationHistory || [];
  const alreadySent = history.some(h => h.templateType === selectedTemplate);

  const handleSend = () => {
    if (!customPhone.trim()) {
      alert('Please enter a valid customer phone number.');
      return;
    }

    const success = sendWhatsAppNotification(customPhone, messageText);
    if (success) {
      const record: WhatsAppNotificationRecord = {
        id: `wa-${Date.now()}`,
        templateType: selectedTemplate,
        sentAt: new Date().toISOString(),
        recipientPhone: customPhone,
        messageText,
        channel: 'WHATSAPP_WEB',
        status: 'OPENED'
      };

      if (onRecordNotification) {
        onRecordNotification(order.id, record);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#128C7E] text-white px-5 py-4 flex items-center justify-between border-b border-[#075E54]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">Send WhatsApp Update</h3>
              <p className="text-xs text-white/80 font-medium">
                Order #{order.customer.billNumber || order.id} • {order.customer.customerName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Single Column Vertical Layout */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-slate-800 text-sm">
          
          {/* Template Selector */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[15px] font-bold text-[#233B5D]">
              Select WhatsApp Notification Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as WhatsAppTemplateId)}
              className="w-full min-h-[48px] px-3.5 bg-slate-50 border-2 border-slate-300 focus:border-[#128C7E] rounded-xl text-[16px] font-bold text-[#191C1E] focus:outline-none cursor-pointer"
            >
              {Object.values(WHATSAPP_TEMPLATES).map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.stage})
                </option>
              ))}
            </select>
          </div>

          {/* Already Sent Warning Banner */}
          {alreadySent && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> This template ({WHATSAPP_TEMPLATES[selectedTemplate].title}) has already been sent to this customer. You can send it again if required.
              </div>
            </div>
          )}

          {/* Customer Phone Input */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[15px] font-bold text-[#233B5D] flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#128C7E]" />
              <span>Customer WhatsApp Phone Number</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-slate-500 text-[16px]">
                +91
              </span>
              <input
                type="tel"
                value={customPhone}
                onChange={e => setCustomPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                placeholder="9840123456"
                className="w-full min-h-[48px] pl-14 pr-3 bg-white border-2 border-slate-300 focus:border-[#128C7E] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
              />
            </div>
          </div>

          {/* Message Preview Textarea */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-[15px] font-bold text-[#233B5D]">
                Message Preview (Staff can edit before sending):
              </label>
              <button
                type="button"
                onClick={() => {
                  const tpl = WHATSAPP_TEMPLATES[selectedTemplate];
                  if (tpl) setMessageText(tpl.defaultText(order));
                }}
                className="text-xs font-bold text-[#128C7E] hover:underline"
              >
                Reset to Default
              </button>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 focus:border-[#128C7E] rounded-xl text-[15px] font-medium text-slate-900 focus:outline-none leading-relaxed resize-none"
            />
            <span className="text-[11px] text-slate-500 font-medium">
              Note: Clicking "Update Customer via WhatsApp" will open WhatsApp Web or Desktop with this pre-filled message.
            </span>
          </div>

          {/* Notification History Toggle */}
          {history.length > 0 && (
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Notification History ({history.length} sent)</span>
                </span>
                <span className="text-[#128C7E] underline">
                  {showHistory ? 'Hide History' : 'View Log'}
                </span>
              </button>

              {showHistory && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 max-h-36 overflow-y-auto">
                  {history.map((log) => (
                    <div key={log.id} className="text-xs border-b border-slate-200 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-slate-500">
                        <strong className="text-slate-800">{log.templateType}</strong>
                        <span>{new Date(log.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">
                        {log.messageText.replace(/\n/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer with Visible Buttons */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[15px] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="min-h-[46px] px-5 rounded-xl bg-[#25D366] hover:bg-[#20BA59] text-white font-black text-[15px] flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Update Customer via WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

      </div>
    </div>
  );
};
