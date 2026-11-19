import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Order, GarmentSpecification } from '../types/order';
import { generateStatusWhatsAppMessage, sendWhatsAppNotification } from '../services/whatsappService';
import {
  X,
  Printer,
  MessageSquare,
  Calendar,
  Phone,
  User,
  Scissors,
  Layers,
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Tag
} from 'lucide-react';

import { GarmentWorksheets } from './print/GarmentWorksheets';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenCutting?: (order: Order) => void;
  onOpenStitching?: (order: Order) => void;
}

type DetailTab = 'OVERVIEW' | 'MEASUREMENTS' | 'GARMENTS' | 'MATERIALS' | 'BILLING' | 'TIMELINE';

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenCutting,
  onOpenStitching
}) => {
  if (!order) return null;

  const { openWhatsAppModal } = useOrder();
  const [activeTab, setActiveTab] = useState<DetailTab>('OVERVIEW');
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [isWorksheetsOpen, setIsWorksheetsOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const customer = order.customer;
  const billing = order.billing;
  const meas = order.measurements;
  const cutting = order.cuttingDetails;
  const stitching = order.stitchingDetails;

  const handleSendWhatsAppUpdate = () => {
    openWhatsAppModal(order);
  };

  // Determine stage progress
  const isCuttingCompleted = cutting?.status === 'CUTTING_COMPLETED' || order.status === 'CUTTING_COMPLETED' || order.status === 'IN_STITCHING' || order.status === 'READY_FOR_TRIAL';
  const isStitchingStarted = order.status === 'IN_STITCHING' || order.status === 'READY_FOR_TRIAL' || order.garmentSpecs.some(g => g.stitchingDetails?.status && g.stitchingDetails.status !== 'WAITING_FOR_STITCHING');
  const isReadyForQc = order.status === 'READY_FOR_TRIAL' || order.garmentSpecs.every(g => g.stitchingDetails?.status === 'READY_FOR_QC');

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Banner */}
        <div className="bg-[#233B5D] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2f4a]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-md">
              <Scissors className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-black tracking-tight">{order.id}</span>
                <span className="text-xs font-mono font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-md uppercase">
                  {order.serialNumber}
                </span>
                <span className={`text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider ${
                  order.status === 'CUTTING_COMPLETED' || order.status === 'READY_FOR_TRIAL' ? 'bg-[#16834A] text-white' :
                  order.status === 'IN_CUTTING' || order.status === 'IN_STITCHING' ? 'bg-[#147D75] text-white' :
                  order.status === 'ON_HOLD' ? 'bg-red-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Customer: <strong>{customer.customerName}</strong> • +91 {customer.primaryPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleSendWhatsAppUpdate}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              title="Send live WhatsApp update to customer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{whatsAppSent ? 'Update Sent' : 'WhatsApp Status'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWorksheetsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              title="Print 1-page A4 universal garment worksheet for each garment"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Worksheets (1 A4/Garment)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Chit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs font-black">
          {[
            { id: 'OVERVIEW', label: '1. Executive Overview' },
            { id: 'MEASUREMENTS', label: '2. Body Measurements' },
            { id: 'GARMENTS', label: `3. Garments (${order.garmentSpecs.length})` },
            { id: 'MATERIALS', label: '4. Fabric Checklist' },
            { id: 'BILLING', label: '5. Billing & Advance' },
            { id: 'TIMELINE', label: '6. Production Timeline' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DetailTab)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#233B5D] shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#191C1E]">
          
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer</span>
                  <strong className="text-base font-black text-slate-800 block mt-0.5">{customer.customerName}</strong>
                  <span className="text-xs text-slate-500 font-semibold">{customer.relationshipType} {customer.fatherName || customer.husbandName || 'N/A'}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Contact Phone</span>
                  <strong className="text-base font-black text-[#147D75] block mt-0.5">+91 {customer.primaryPhone}</strong>
                  <span className="text-xs text-slate-500 font-semibold">{customer.secondaryPhone ? `Alt: ${customer.secondaryPhone}` : 'No alternate'}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Delivery Target</span>
                  <strong className="text-base font-black text-red-600 block mt-0.5">{billing.dueDate || 'Standard Schedule'}</strong>
                  <span className="text-xs font-bold text-slate-600 uppercase">Priority: {billing.priority}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Balance Due</span>
                  <strong className="text-base font-black text-slate-900 block mt-0.5">₹{billing.balanceAmount.toLocaleString('en-IN')}</strong>
                  <span className="text-xs text-emerald-700 font-bold">Advance: ₹{billing.advanceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#233B5D] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm font-black text-slate-800 block">Delivery Address:</strong>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {customer.fullAddress} • {customer.areaLocation}
                  </p>
                </div>
              </div>

              {/* Garments Manifest Summary */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">
                  Ordered Garment Breakdown ({order.garmentSpecs.length} Pieces):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.garmentSpecs.map((spec, idx) => (
                    <div key={spec.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-sm font-black text-slate-800 block">{spec.title || `${spec.category} 0${idx + 1}`}</strong>
                        <span className="text-xs text-slate-500 font-semibold">{spec.sleeveType || 'Standard'} • {spec.neckType || 'Standard'}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        spec.cuttingStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {spec.cuttingStatus || 'Cutting'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEASUREMENTS */}
          {activeTab === 'MEASUREMENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-black uppercase text-slate-700 tracking-wider">
                  Customer Tailoring Specifications ({meas.unit.toUpperCase()})
                </h4>
                <span className="text-xs font-bold text-slate-500">Unit: {meas.unit === 'in' ? 'Inches' : 'Centimetres'}</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
                {[
                  { label: 'Shoulder', val: meas.shoulder },
                  { label: 'Chest', val: meas.chest },
                  { label: 'Full Bust', val: meas.bust },
                  { label: 'Upper Bust', val: meas.upperBust },
                  { label: 'Under Bust', val: meas.underBust },
                  { label: 'Waist', val: meas.waist },
                  { label: 'Hip', val: meas.hip },
                  { label: 'Armhole (AH)', val: meas.armhole },
                  { label: 'Sleeve Length', val: meas.sleeveLength },
                  { label: 'Sleeve Round', val: meas.sleeveRound },
                  { label: 'Blouse Height', val: meas.blouseLength },
                  { label: 'Top Length', val: meas.topLength },
                  { label: 'Front Neck', val: meas.frontNeckDepth },
                  { label: 'Back Neck', val: meas.backNeckDepth },
                  { label: 'Bottom Length', val: meas.bottomLength },
                  { label: 'Thigh Round', val: meas.thigh },
                  { label: 'Knee Round', val: meas.knee },
                  { label: 'Ankle Opening', val: meas.ankle },
                ].map((m, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">{m.label}</span>
                    <strong className="text-xl font-black text-slate-900 block mt-0.5">
                      {m.val ? `${m.val}${meas.unit}` : '—'}
                    </strong>
                  </div>
                ))}
              </div>

              {meas.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                  <strong>Measurement Fitting Notes:</strong> {meas.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GARMENTS & STYLING */}
          {activeTab === 'GARMENTS' && (
            <div className="space-y-4">
              {order.garmentSpecs.map((spec, idx) => (
                <div key={spec.id || idx} className="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#233B5D] text-white flex items-center justify-center font-black text-xs">
                        {idx + 1}
                      </span>
                      <strong className="text-base font-black text-[#233B5D]">
                        {spec.title || `${spec.category} 0${idx + 1}`}
                      </strong>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{spec.category}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Front Neck</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{spec.frontNeckDesign || 'Standard'}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Back Neck</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{spec.backNeckDesign || 'Standard'}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Sleeve Cut</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{spec.sleeveType || 'Standard'}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Fasteners</span>
                      <strong className="text-slate-800 font-bold block mt-0.5">{spec.frontHookOrBack || spec.zip || 'Front Hook'}</strong>
                    </div>
                  </div>

                  {spec.tailorInstructions && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold">
                      Directives: {spec.tailorInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: MATERIALS */}
          {activeTab === 'MATERIALS' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Workshop Material Receipt Checklist:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Customer Provided Fabric', status: cutting?.materialsCheck.customerMaterial || 'Received' },
                  { label: 'Shop Provided Fabric', status: cutting?.materialsCheck.shopMaterial || 'Received' },
                  { label: 'Lining Material (2x2 / Cotton)', status: cutting?.materialsCheck.liningMaterial || 'Received' },
                  { label: 'Two-by-Two Material', status: cutting?.materialsCheck.twoByTwoMaterial || 'Not Required' },
                  { label: 'Trims, Zips & Hooks', status: cutting?.materialsCheck.otherMaterials || 'Received' },
                ].map((mat, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{mat.label}</span>
                    <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-md ${
                      mat.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                      mat.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {mat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & PAYMENT */}
          {activeTab === 'BILLING' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 font-black text-slate-500 uppercase pb-2">
                      <th className="text-left pb-2">Item Description</th>
                      <th className="text-center pb-2">Qty</th>
                      <th className="text-right pb-2">Rate (₹)</th>
                      <th className="text-right pb-2">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {billing.items.map((item, idx) => (
                      <tr key={item.id || idx} className="py-2">
                        <td className="py-2 font-bold text-slate-800">{item.itemName || item.description}</td>
                        <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-2 text-right text-slate-600">₹{item.rate}</td>
                        <td className="py-2 text-right font-black text-slate-900">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Billing Summary Box */}
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs font-bold">
                <div>
                  <span className="text-slate-500">Payment Mode: </span>
                  <strong className="text-slate-900">{billing.paymentMethod}</strong>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-500">Status: </span>
                  <strong className="text-emerald-700 uppercase">{billing.paymentStatus}</strong>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Grand Total</span>
                    <strong className="text-base font-black text-slate-900">₹{billing.grandTotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Advance Paid</span>
                    <strong className="text-base font-black text-emerald-600">₹{billing.advanceAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Balance Due</span>
                    <strong className="text-base font-black text-red-600">₹{billing.balanceAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE & AUDIT TRAIL */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Live Production Audit Trail:
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                
                {/* 1. Order Booked */}
                <div className="relative flex items-start gap-3">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-800 block">Order Booked & Measurements Taken</strong>
                    <span className="text-xs text-slate-500 font-semibold">{new Date(order.createdAt).toLocaleString()} • Front Desk Terminal</span>
                  </div>
                </div>

                {/* 2. Cutting Started */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ring-4 ring-white flex items-center justify-center ${
                    cutting?.startedAt ? 'bg-[#147D75]' : 'bg-slate-300'
                  }`}>
                    {cutting?.startedAt && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-800 block">Fabric Inspected & Cutting Started</strong>
                    <span className="text-xs text-slate-500 font-semibold">
                      {cutting?.startedAt ? new Date(cutting.startedAt).toLocaleString() : 'Awaiting Cutting Table'} • {cutting?.assignedMaster || 'Cutting Master'}
                    </span>
                  </div>
                </div>

                {/* 3. Cutting Completed */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ring-4 ring-white flex items-center justify-center ${
                    isCuttingCompleted ? 'bg-[#16834A]' : 'bg-slate-300'
                  }`}>
                    {isCuttingCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-800 block">Cutting Completed & Bundled</strong>
                    <span className="text-xs text-slate-500 font-semibold">
                      {cutting?.completedAt ? new Date(cutting.completedAt).toLocaleString() : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* 4. Tailor Allocated */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ring-4 ring-white flex items-center justify-center ${
                    isStitchingStarted ? 'bg-[#147D75]' : 'bg-slate-300'
                  }`}>
                    {isStitchingStarted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-800 block">Garment Pieces Allocated to Specialist Tailor</strong>
                    <span className="text-xs text-slate-500 font-semibold">
                      {isStitchingStarted ? 'Tailor sewing active' : 'Awaiting Tailor Assignment'}
                    </span>
                  </div>
                </div>

                {/* 5. Ready for QC */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ring-4 ring-white flex items-center justify-center ${
                    isReadyForQc ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}>
                    {isReadyForQc && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-800 block">Sewing Completed & Forwarded for QC Trial</strong>
                    <span className="text-xs text-slate-500 font-semibold">
                      {isReadyForQc ? 'Ready for Customer Pickup / Trial' : 'Pending Sewing Completion'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-semibold">
            Token: <strong>{order.serialNumber}</strong> • Last Activity: {new Date(order.updatedAt).toLocaleTimeString()}
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenCutting && (
              <button
                type="button"
                onClick={() => {
                  onOpenCutting(order);
                  onClose();
                }}
                className="px-4 py-2 bg-[#147D75] hover:bg-[#0f635d] text-white rounded-xl font-bold cursor-pointer transition-all"
              >
                Go to Cutting Table
              </button>
            )}

            {onOpenStitching && (
              <button
                type="button"
                onClick={() => {
                  onOpenStitching(order);
                  onClose();
                }}
                className="px-4 py-2 bg-[#16834A] hover:bg-[#126b3c] text-white rounded-xl font-bold cursor-pointer transition-all"
              >
                Go to Stitching Allocation
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-all"
            >
              Close Inspector
            </button>
          </div>
        </div>

      </div>

      {/* Garment Worksheets Print Pack Modal */}
      <GarmentWorksheets
        order={order}
        isOpen={isWorksheetsOpen}
        onClose={() => setIsWorksheetsOpen(false)}
      />

    </div>
  );
};
