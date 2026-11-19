import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { 
  Printer, 
  CheckCircle2, 
  Edit, 
  Save, 
  PlusCircle,
  MessageSquare,
  Layers,
  Scissors,
  FileCheck,
  Flame
} from 'lucide-react';
import { sendWhatsAppNotification, generateOrderConfirmationWhatsAppMessage } from '../services/whatsappService';
import { SinglePageCustomerReceipt } from '../components/print/SinglePageCustomerReceipt';
import { GarmentWorksheets } from '../components/print/GarmentWorksheets';

export const Page5SummarySlip: React.FC = () => {
  const { 
    order, 
    setCurrentStep, 
    saveDraft, 
    submitOrder, 
    createNewOrder,
    openWhatsAppModal
  } = useOrder();

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [isWorksheetsOpen, setIsWorksheetsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    openWhatsAppModal(order, 'ORDER_BOOKED');
  };

  const handleSubmit = () => {
    submitOrder();
    setOrderSubmitted(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Action Header Banner (Screen only) */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#64748B] uppercase font-bold tracking-wider">
              Step 05 • Order Confirmation & Receipts
            </span>
            {order.billing.priority === 'Express' && (
              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 uppercase">
                <Flame className="w-3 h-3 text-purple-700" /> Express VIP
              </span>
            )}
          </div>
          <h2 className="text-[22px] font-bold text-[#233B5D]">
            Order #{order.id} Verification & Print Center
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={saveDraft}
            className="min-h-[42px] px-3.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#233B5D] text-[14px] font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-[#147D75]" />
            <span>Save Draft</span>
          </button>

          {/* Print 1-Page Customer Receipt */}
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[42px] px-4 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white text-[14px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Prints strict 1-page A4 customer billing chit without page-2 overflow"
          >
            <Printer className="w-4 h-4" />
            <span>Print Customer Receipt (A4)</span>
          </button>

          {/* Workshop Pack Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsWorksheetsOpen(true)}
            className="min-h-[42px] px-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-[14px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="View and print technical Cutting, Stitching, and QC Job Sheets"
          >
            <Layers className="w-4 h-4" />
            <span>Print Workshop Job Pack ({order.garmentSpecs.length} Pieces)</span>
          </button>

          {/* WhatsApp Order Chit Button */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="min-h-[42px] px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Send formatted booking receipt to customer via WhatsApp"
          >
            <MessageSquare className="w-4 h-4 fill-white/20" />
            <span>{whatsAppSent ? 'Resend WhatsApp Chit' : 'WhatsApp Receipt'}</span>
          </button>

          {!orderSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="min-h-[42px] px-5 rounded-lg bg-[#16834A] hover:bg-[#126C3C] text-white text-[14px] font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Confirm Order</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={createNewOrder}
              className="min-h-[42px] px-5 rounded-lg bg-[#147D75] hover:bg-[#0E605A] text-white text-[14px] font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Start New Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Submission Success Banner */}
      {orderSubmitted && (
        <div className="bg-[#F0FDF4] border-2 border-[#16834A] rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-[#166534] no-print">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-[#16834A]" />
            <div className="flex flex-col">
              <span className="text-[17px] font-bold">
                Order #{order.id} Confirmed & Dispatched to Workshop Queues!
              </span>
              <span className="text-[13.5px]">
                Token: <strong>{order.serialNumber}</strong> • Due: <strong>{order.billing.dueDate}</strong> • Priority: <strong>{order.billing.priority}</strong>.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 ml-auto flex-wrap">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{whatsAppSent ? 'WhatsApp Sent' : 'Send WhatsApp Chit'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWorksheetsOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[14px] flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Print Garment Worksheets (1 A4/Garment)</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Jump / Edit Navigation Bar (Screen only) */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] p-3 flex flex-wrap items-center justify-between gap-2 no-print shadow-xs text-[13px]">
        <span className="font-bold text-[#64748B] px-2">Need to adjust anything before print?</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#233B5D] font-bold flex items-center gap-1 border border-[#CBD5E1]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#233B5D] font-bold flex items-center gap-1 border border-[#CBD5E1]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Measurements</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#233B5D] font-bold flex items-center gap-1 border border-[#CBD5E1]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Garments & Designs</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#233B5D] font-bold flex items-center gap-1 border border-[#CBD5E1]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Billing & Priority</span>
          </button>
        </div>
      </div>

      {/* Strict Single-Page Customer Billing Receipt */}
      <SinglePageCustomerReceipt order={order} onPrint={handlePrint} />

      {/* Garment-Wise Technical Workshop Pack Modal */}
      <GarmentWorksheets
        order={order}
        isOpen={isWorksheetsOpen}
        onClose={() => setIsWorksheetsOpen(false)}
      />

    </div>
  );
};
