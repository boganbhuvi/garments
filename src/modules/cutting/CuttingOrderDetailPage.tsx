import React, { useState } from 'react';
import { Order, CuttingStatus, MaterialCheckStatus, GarmentSpecification } from '../../types/order';
import { useOrder } from '../../context/OrderContext';
import { CuttingWorksheetPrint } from './CuttingWorksheetPrint';
import { StatusChangeConfirmationModal } from '../../components/StatusChangeConfirmationModal';
import {
  ArrowLeft,
  Scissors,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  PauseCircle,
  Play,
  Layers,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react';

interface CuttingOrderDetailPageProps {
  order: Order;
  onBack: () => void;
}

export const CuttingOrderDetailPage: React.FC<CuttingOrderDetailPageProps> = ({ order, onBack }) => {
  const { 
    updateCuttingStatus, 
    updateGarmentCuttingStatus, 
    updateMaterialCheck 
  } = useOrder();

  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedPrintGarmentIndex, setSelectedPrintGarmentIndex] = useState<number | 'ALL'>('ALL');
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [holdReasonInput, setHoldReasonInput] = useState(order.cuttingDetails?.holdReason || '');
  const [masterRemarks, setMasterRemarks] = useState(order.cuttingDetails?.cuttingRemarks || '');
  const [remarksSaved, setRemarksSaved] = useState(false);

  // Status Change Confirmation & WhatsApp Notification State
  const [statusModalConfig, setStatusModalConfig] = useState<{
    isOpen: boolean;
    targetStatus: CuttingStatus;
    defaultRemarks?: string;
    garmentIndex?: number;
    targetGarmentStatus?: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  } | null>(null);

  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const cuttingDetails = order.cuttingDetails || {
    status: (order.status as CuttingStatus) || 'NEW',
    materialsCheck: {
      customerMaterial: 'Received',
      shopMaterial: 'Received',
      liningMaterial: 'Received',
      twoByTwoMaterial: 'Not Required',
      otherMaterials: 'Not Required',
    }
  };

  const matCheck = cuttingDetails.materialsCheck;
  const hasPendingMaterial = Object.values(matCheck).some(val => val === 'Pending');

  const totalGarments = order.garmentSpecs.length;
  const completedGarments = order.garmentSpecs.filter(g => g.cuttingStatus === 'Completed').length;
  const currentStatus = cuttingDetails.status || (order.status as CuttingStatus) || 'NEW';

  const handleModalConfirm = (remarks: string, sentWhatsApp: boolean) => {
    if (!statusModalConfig) return;

    if (statusModalConfig.garmentIndex !== undefined && statusModalConfig.targetGarmentStatus) {
      updateGarmentCuttingStatus(order.id, statusModalConfig.garmentIndex, statusModalConfig.targetGarmentStatus);
      setToastNotification(`Piece #${statusModalConfig.garmentIndex + 1} marked as ${statusModalConfig.targetGarmentStatus}${sentWhatsApp ? ' • WhatsApp live update dispatched!' : ''}`);
    } else {
      const target = statusModalConfig.targetStatus;
      const holdR = target === 'ON_HOLD' ? holdReasonInput : undefined;
      const actualQty = target === 'CUTTING_COMPLETED' ? totalGarments : undefined;
      updateCuttingStatus(order.id, target, remarks, holdR, actualQty);
      setToastNotification(`Order status updated to ${target.replace(/_/g, ' ')}${sentWhatsApp ? ' • WhatsApp notification dispatched to customer!' : ''}`);
    }

    setStatusModalConfig(null);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleStart = () => {
    setStatusModalConfig({
      isOpen: true,
      targetStatus: 'IN_CUTTING',
      defaultRemarks: masterRemarks || 'Cloth marked and cutting started.'
    });
  };

  const handleCompleteAll = () => {
    setStatusModalConfig({
      isOpen: true,
      targetStatus: 'CUTTING_COMPLETED',
      defaultRemarks: masterRemarks || 'All garments cut cleanly according to measurements. Handed over for stitching.'
    });
  };

  const handleConfirmHold = () => {
    if (!holdReasonInput.trim()) {
      alert('Please enter a reason for putting the order on hold.');
      return;
    }
    setShowHoldDialog(false);
    setStatusModalConfig({
      isOpen: true,
      targetStatus: 'ON_HOLD',
      defaultRemarks: `Order on hold: ${holdReasonInput.trim()}`
    });
  };

  const handleResume = () => {
    setStatusModalConfig({
      isOpen: true,
      targetStatus: 'IN_CUTTING',
      defaultRemarks: 'Cutting resumed after verification.'
    });
  };

  const handleOpenWhatsAppModal = () => {
    setStatusModalConfig({
      isOpen: true,
      targetStatus: currentStatus,
      defaultRemarks: masterRemarks || 'Work in progress on your order.'
    });
  };

  const handleMaterialToggle = (key: keyof typeof matCheck, currentVal: MaterialCheckStatus) => {
    const nextVal: MaterialCheckStatus = 
      currentVal === 'Received' ? 'Pending' : currentVal === 'Pending' ? 'Not Required' : 'Received';

    const updated = {
      ...matCheck,
      [key]: nextVal
    };
    updateMaterialCheck(order.id, updated);
  };

  const handleSaveRemarks = () => {
    updateCuttingStatus(order.id, currentStatus, masterRemarks);
    setRemarksSaved(true);
    setTimeout(() => setRemarksSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#191C1E] pb-24">
      
      {/* Top Sticky Bar: Back Navigation, Identification & Quick Actions */}
      <div className="bg-[#233B5D] text-white border-b border-[#1a2d47] shadow-md py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Back button and Order Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/15"
              title="Return to Cutting Work Queue"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Queue</span>
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-black tracking-tight">{order.id}</span>
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded uppercase">
                  {order.serialNumber}
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  currentStatus === 'CUTTING_COMPLETED' ? 'bg-[#16834A] text-white' :
                  currentStatus === 'IN_CUTTING' ? 'bg-[#147D75] text-white' :
                  currentStatus === 'ON_HOLD' ? 'bg-red-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">
                Customer: <strong>{order.customer.customerName}</strong> • {order.customer.primaryPhone}
              </div>
            </div>
          </div>

          {/* Action Buttons: Start, Complete, WhatsApp, Print */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {currentStatus !== 'IN_CUTTING' && currentStatus !== 'CUTTING_COMPLETED' && (
              <button
                type="button"
                onClick={handleStart}
                className="h-11 px-5 bg-[#147D75] hover:bg-[#0f645e] text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>Start Cutting</span>
              </button>
            )}

            {currentStatus !== 'CUTTING_COMPLETED' && (
              <button
                type="button"
                onClick={handleCompleteAll}
                className="h-11 px-5 bg-[#16834A] hover:bg-[#126b3c] text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            )}

            {/* WhatsApp Live Update Button */}
            <button
              type="button"
              onClick={handleOpenWhatsAppModal}
              className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              title="Send live WhatsApp status notification to customer"
            >
              <MessageSquare className="w-4 h-4 fill-white/20" />
              <span>WhatsApp Update</span>
            </button>

            {currentStatus !== 'ON_HOLD' ? (
              <button
                type="button"
                onClick={() => setShowHoldDialog(true)}
                className="h-11 px-3.5 bg-white/10 hover:bg-red-600/80 text-white border border-white/20 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Hold</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedPrintGarmentIndex('ALL');
                setIsPrintOpen(true);
              }}
              className="h-11 px-4 bg-white text-[#233B5D] hover:bg-slate-100 rounded-xl font-black text-sm flex items-center gap-1.5 shadow transition-all cursor-pointer"
              title="Print Cutting Worksheets (1 Page Per Dress)"
            >
              <Printer className="w-4 h-4" />
              <span>Print Worksheets (1 Page/Dress)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Live Toast Banner for confirmation and notifications */}
      {toastNotification && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center text-sm font-black shadow-md flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* On Hold Warning Banner */}
        {currentStatus === 'ON_HOLD' && (
          <div className="p-4 bg-red-50 border-2 border-red-400 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <PauseCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-base font-black text-red-900 uppercase">Order is Currently On Hold</h4>
                <p className="text-sm font-semibold text-red-800">
                  Reason: {cuttingDetails.holdReason || 'Awaiting customer fabric or workshop clarification.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResume}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl cursor-pointer"
            >
              Resume Cutting
            </button>
          </div>
        )}

        {/* Pending Material Warning */}
        {hasPendingMaterial && currentStatus !== 'ON_HOLD' && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-base font-black text-amber-900">Material Pending Alert</h4>
                <p className="text-sm font-semibold text-amber-800">
                  Essential cloth or lining is marked as Pending. Check fabric before cutting.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHoldDialog(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Hold Order
            </button>
          </div>
        )}

        {/* IMPORTANT SECTION 1: ESSENTIAL ORDER & CUSTOMER DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Customer & Target Due Date */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-300 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Production Order Info
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Priority:</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                  order.billing.priority === 'Express' ? 'bg-red-600 text-white' :
                  order.billing.priority === 'Urgent' ? 'bg-amber-500 text-white' :
                  'bg-blue-100 text-blue-900'
                }`}>
                  {order.billing.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Customer</div>
                <div className="text-xl font-black text-[#233B5D] flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{order.customer.customerName}</span>
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#147D75]" />
                  <span>{order.customer.primaryPhone}</span>
                  {order.customer.secondaryPhone && <span>/ {order.customer.secondaryPhone}</span>}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Delivery Target</div>
                <div className="text-xl font-black text-red-600 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {order.billing.dueDate}</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">
                  Order Date: {order.billing.orderDate}
                </div>
              </div>
            </div>

            {order.billing.deliveryNotes && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <strong>Delivery Directive:</strong> {order.billing.deliveryNotes}
              </div>
            )}
          </div>

          {/* Progress & Cut Count */}
          <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
                Cutting Progress
              </span>
              <div className="text-3xl font-black text-[#233B5D]">
                {completedGarments} / {totalGarments} <span className="text-base font-bold text-slate-500">Cut</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-3">
                <div 
                  className={`h-full transition-all duration-300 ${
                    completedGarments === totalGarments ? 'bg-[#16834A]' : 'bg-[#147D75]'
                  }`}
                  style={{ width: `${totalGarments > 0 ? (completedGarments / totalGarments) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-bold border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Status:</span>
              <strong className="text-slate-800 uppercase">{currentStatus.replace(/_/g, ' ')}</strong>
            </div>
          </div>

        </div>

        {/* IMPORTANT SECTION 2: MATERIAL INTAKE CHECKLIST */}
        <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#147D75]" />
              <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
                Material Checklist
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Click to toggle: Received • Pending • Not Required
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'customerMaterial', label: 'Customer Cloth' },
              { key: 'shopMaterial', label: 'Shop Provided' },
              { key: 'liningMaterial', label: 'Lining Cloth' },
              { key: 'twoByTwoMaterial', label: '2x2 Rubia' },
            ].map(item => {
              const val = (matCheck as any)[item.key] as MaterialCheckStatus;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleMaterialToggle(item.key as any, val)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    val === 'Received' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                    val === 'Pending' ? 'bg-amber-50 border-amber-400 text-amber-900' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase block text-slate-500">{item.label}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-black">{val}</span>
                    {val === 'Received' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {val === 'Pending' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* IMPORTANT SECTION 3: GARMENTS TO CUT (ONLY ESSENTIAL TAILORING DETAILS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
            <h3 className="text-xl font-black text-[#233B5D] uppercase tracking-wide flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              <span>Garments for Cutting ({order.garmentSpecs.length} Pieces)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Units: <strong className="text-slate-800 uppercase">{order.measurements.unit}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {order.garmentSpecs.map((spec: GarmentSpecification, idx: number) => {
              const itemTitle = spec.title || `${spec.category} #${spec.garmentNumber}`;
              const garmentStatus = spec.cuttingStatus || 'Pending';

              return (
                <div
                  key={spec.id || idx}
                  className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-4 transition-all ${
                    garmentStatus === 'Completed' ? 'border-emerald-400 bg-emerald-50/10' :
                    garmentStatus === 'In Progress' ? 'border-[#147D75] bg-teal-50/10' :
                    garmentStatus === 'On Hold' ? 'border-red-400 bg-red-50/10' :
                    'border-slate-300'
                  }`}
                >
                  {/* Garment Header with Status Toggles */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        garmentStatus === 'Completed' ? 'bg-[#16834A] text-white' :
                        garmentStatus === 'In Progress' ? 'bg-[#147D75] text-white' :
                        'bg-[#233B5D] text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xl font-black text-[#233B5D]">{itemTitle}</div>
                        <span className="text-xs font-bold text-slate-500">{spec.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPrintGarmentIndex(idx);
                          setIsPrintOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#233B5D]/10 hover:bg-[#233B5D] hover:text-white text-[#233B5D] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title={`Print 1-Page A4 Worksheet for ${itemTitle}`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Dress A4</span>
                      </button>

                      {/* Simple status buttons */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      {(['Pending', 'In Progress', 'Completed', 'On Hold'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            if (garmentStatus === st) return;
                            const targetCuttingStatus: CuttingStatus = 
                              st === 'Completed' ? 'CUTTING_COMPLETED' :
                              st === 'In Progress' ? 'IN_CUTTING' :
                              st === 'On Hold' ? 'ON_HOLD' : 'READY_FOR_CUTTING';

                            setStatusModalConfig({
                              isOpen: true,
                              targetStatus: targetCuttingStatus,
                              targetGarmentStatus: st,
                              garmentIndex: idx,
                              defaultRemarks: `${itemTitle} (${spec.category}) marked as ${st}.`
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            garmentStatus === st
                              ? st === 'Completed' ? 'bg-[#16834A] text-white shadow' :
                                st === 'In Progress' ? 'bg-[#147D75] text-white shadow' :
                                st === 'On Hold' ? 'bg-red-600 text-white shadow' :
                                'bg-[#233B5D] text-white shadow'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                  {/* ESSENTIAL MEASUREMENTS (HUGE NUMBERS FOR SCISSOR OPERATOR) */}
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Master Measurements ({order.measurements.unit})
                    </span>

                    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 text-center">
                      {[
                        { label: 'Length', val: order.measurements.blouseLength || order.measurements.topLength || order.measurements.frontLength },
                        { label: 'Shoulder', val: order.measurements.shoulder },
                        { label: 'Chest', val: order.measurements.chest },
                        { label: 'Bust', val: order.measurements.bust },
                        { label: 'Waist', val: order.measurements.waist },
                        { label: 'Hip', val: order.measurements.hip },
                        { label: 'Armhole', val: order.measurements.armhole },
                        { label: 'Sleeve L', val: order.measurements.sleeveLength },
                        { label: 'Sleeve R', val: order.measurements.sleeveRound },
                        { label: 'Front Neck', val: order.measurements.frontNeckDepth },
                        { label: 'Back Neck', val: order.measurements.backNeckDepth },
                        { label: 'Bottom L', val: order.measurements.bottomLength },
                      ]
                        .filter(m => m.val !== undefined && m.val !== '')
                        .map((m, mIdx) => (
                          <div key={mIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                            <div className="text-[10px] uppercase font-bold text-slate-500 truncate">{m.label}</div>
                            <div className="text-lg font-black text-[#233B5D] mt-0.5">{m.val}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* ESSENTIAL CUTTING STYLES */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Sleeve Pattern</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.sleeveType || 'Standard'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Front Neck</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.frontNeckDesign || spec.neckType || 'Round'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Back Neck</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.backNeckDesign || 'Round U'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Hook / Opening</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.frontHookOrBack || 'Front Hook'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Lining</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.lining || 'Full Lining'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Fitting Type</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.fitting || 'Comfort Fit'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Slit / Zip / Bottom</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                        {spec.slit ? `Slit: ${spec.slit}` : spec.bottomStyle ? `Style: ${spec.bottomStyle}` : spec.zip ? `Zip: ${spec.zip}` : 'Standard'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Regional Style</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.regionalStyle || 'Tamil Nadu Standard'}</span>
                    </div>
                  </div>

                  {/* MASTER TAILOR DIRECTIVE IF ANY */}
                  {spec.tailorInstructions && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <strong className="text-amber-900 uppercase font-black">Cutting Table Directive:</strong>{' '}
                      <span className="text-slate-800 font-bold">{spec.tailorInstructions}</span>
                    </div>
                  )}

                  {/* Customer Notes if any */}
                  {spec.customerInstructions && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700">
                      <strong>Customer Wish:</strong> {spec.customerInstructions}
                    </div>
                  )}

                  {/* Reference Image Thumbnails if attached */}
                  {spec.referenceImages && spec.referenceImages.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pt-1">
                      {spec.referenceImages.map((img, imgIdx) => (
                        <div key={img.id || imgIdx} className="w-20 h-20 rounded-xl border border-slate-300 overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={img.url} alt={img.title || 'Ref'} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* IMPORTANT SECTION 4: MASTER REMARKS / LOG */}
        <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
              Cutting Master Observations
            </h3>
            {remarksSaved && (
              <span className="text-xs text-emerald-600 font-bold">✓ Remarks Saved</span>
            )}
          </div>

          <textarea
            rows={2}
            value={masterRemarks}
            onChange={(e) => setMasterRemarks(e.target.value)}
            placeholder="Record any bias adjustments, cloth flaws, border alignments, or notes for tailors..."
            className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveRemarks}
              className="px-4 py-2 bg-[#233B5D] hover:bg-[#1b2f4a] text-white rounded-xl text-xs font-bold cursor-pointer shadow"
            >
              Save Remarks
            </button>
          </div>
        </div>

      </div>

      {/* Hold Reason Dialog */}
      {showHoldDialog && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-300 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Put Cutting Order On Hold</h3>
                <p className="text-xs text-slate-500 font-semibold">Enter reason for front desk and stitching staff</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={holdReasonInput}
              onChange={e => setHoldReasonInput(e.target.value)}
              placeholder="e.g. Saree border cloth is short by 0.5m. Awaiting customer confirmation."
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHoldDialog(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHold}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow cursor-pointer"
              >
                Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Worksheet View */}
      {isPrintOpen && (
        <CuttingWorksheetPrint 
          order={order} 
          initialGarmentIndex={selectedPrintGarmentIndex}
          onClose={() => setIsPrintOpen(false)} 
        />
      )}

      {/* Status Change & Live WhatsApp Confirmation Modal */}
      {statusModalConfig && statusModalConfig.isOpen && (
        <StatusChangeConfirmationModal
          isOpen={statusModalConfig.isOpen}
          order={order}
          currentStatus={currentStatus}
          targetStatus={statusModalConfig.targetStatus}
          defaultRemarks={statusModalConfig.defaultRemarks || masterRemarks}
          onConfirm={handleModalConfirm}
          onCancel={() => setStatusModalConfig(null)}
        />
      )}

    </div>
  );
};
