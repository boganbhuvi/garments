import React, { useState } from 'react';
import { Order, CuttingStatus, MaterialCheckStatus, GarmentSpecification } from '../../types/order';
import { useOrder } from '../../context/OrderContext';
import { CuttingWorksheetPrint } from './CuttingWorksheetPrint';
import {
  Scissors,
  X,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PauseCircle,
  Play,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface CuttingOrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export const CuttingOrderDetailModal: React.FC<CuttingOrderDetailModalProps> = ({ order, onClose }) => {
  const { 
    updateCuttingStatus, 
    updateGarmentCuttingStatus, 
    updateMaterialCheck 
  } = useOrder();

  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedPrintGarmentIndex, setSelectedPrintGarmentIndex] = useState<number | 'ALL'>('ALL');
  const [expandedGarmentIndex, setExpandedGarmentIndex] = useState<number | null>(0);
  const [holdReasonInput, setHoldReasonInput] = useState(order.cuttingDetails?.holdReason || '');
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [masterRemarks, setMasterRemarks] = useState(order.cuttingDetails?.cuttingRemarks || '');
  const [hasUnsavedRemarks, setHasUnsavedRemarks] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  // Check if any material is pending
  const hasPendingMaterial = Object.values(matCheck).some(val => val === 'Pending');

  // Overall garment cut progress
  const totalGarments = order.garmentSpecs.length;
  const completedGarments = order.garmentSpecs.filter(g => g.cuttingStatus === 'Completed').length;
  const inProgressGarments = order.garmentSpecs.filter(g => g.cuttingStatus === 'In Progress').length;
  const progressPct = totalGarments > 0 ? Math.round((completedGarments / totalGarments) * 100) : 0;

  const currentCuttingStatus = cuttingDetails.status || (order.status as CuttingStatus) || 'NEW';

  // Handlers for Master actions
  const handleStartCutting = () => {
    updateCuttingStatus(order.id, 'IN_CUTTING', masterRemarks);
  };

  const handleMarkCompleted = () => {
    updateCuttingStatus(order.id, 'CUTTING_COMPLETED', masterRemarks, undefined, totalGarments);
  };

  const handleConfirmHold = () => {
    if (!holdReasonInput.trim()) {
      alert('Please specify a reason for putting this cutting order on hold.');
      return;
    }
    updateCuttingStatus(order.id, 'ON_HOLD', masterRemarks, holdReasonInput.trim());
    setShowHoldDialog(false);
  };

  const handleResumeCutting = () => {
    updateCuttingStatus(order.id, 'IN_CUTTING', masterRemarks);
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
    updateCuttingStatus(order.id, currentCuttingStatus, masterRemarks);
    setHasUnsavedRemarks(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <div className="bg-[#F8FAFC] w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* Modal Header */}
          <div className="bg-[#233B5D] text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#1b2f4a] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow">
                <Scissors className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{order.id}</h2>
                  <span className="text-xs bg-white/20 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Serial: {order.serialNumber}
                  </span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    currentCuttingStatus === 'CUTTING_COMPLETED' ? 'bg-[#16834A] text-white' :
                    currentCuttingStatus === 'IN_CUTTING' ? 'bg-[#147D75] text-white' :
                    currentCuttingStatus === 'ON_HOLD' ? 'bg-[#D64545] text-white' :
                    currentCuttingStatus === 'READY_FOR_CUTTING' ? 'bg-[#2563EB] text-white' :
                    'bg-[#64748B] text-white'
                  }`}>
                    {currentCuttingStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">
                  Cutting Department Master Station • {order.customer.customerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPrintGarmentIndex('ALL');
                  setIsPrintOpen(true);
                }}
                className="h-10 px-3.5 sm:px-4 bg-[#147D75] hover:bg-[#0e605a] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow cursor-pointer"
                title="Print Cutting Worksheets (1 Page Per Dress)"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print Worksheets (1 Page/Dress)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-[#191C1E]">
            
            {/* Warning Alert if Material Pending */}
            {hasPendingMaterial && (
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-base font-black text-amber-900">
                    MATERIAL WARNING: Essential cloth / lining is marked PENDING!
                  </h4>
                  <p className="text-sm font-semibold text-amber-800 mt-0.5">
                    Please verify if cloth is received in the workshop before cutting. If material is missing, click <strong>"Put On Hold"</strong> below.
                  </p>
                </div>
                {currentCuttingStatus !== 'ON_HOLD' && (
                  <button
                    onClick={() => setShowHoldDialog(true)}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider"
                  >
                    Hold Order
                  </button>
                )}
              </div>
            )}

            {/* Hold Reason Alert if On Hold */}
            {currentCuttingStatus === 'ON_HOLD' && (
              <div className="p-4 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-3 shadow-sm">
                <PauseCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-base font-black text-red-900 uppercase">
                    ORDER IS ON HOLD
                  </h4>
                  <p className="text-sm font-bold text-red-800 mt-0.5">
                    Reason: {cuttingDetails.holdReason || 'Awaiting customer fabric or instruction clarification.'}
                  </p>
                </div>
                <button
                  onClick={handleResumeCutting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume Cutting</span>
                </button>
              </div>
            )}

            {/* Top Overview Grid: Customer Info & Workflow Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Customer Info Card */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-300 p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Customer Information
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target Due: {order.billing.dueDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 font-bold text-xs">Customer Name</div>
                    <div className="text-lg font-black text-[#233B5D] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{order.customer.customerName}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      ID: {order.customer.customerId} • Bill: {order.customer.billNumber}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold text-xs">Phone Number</div>
                    <div className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#147D75]" />
                      <span>{order.customer.primaryPhone}</span>
                      {order.customer.secondaryPhone && (
                        <span className="text-slate-500 text-xs">/ {order.customer.secondaryPhone}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{order.customer.fullAddress} {order.customer.areaLocation ? `(${order.customer.areaLocation})` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Priority & Delivery Notes */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Order Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-black uppercase ${
                      order.billing.priority === 'Express' ? 'bg-red-600 text-white' :
                      order.billing.priority === 'Urgent' ? 'bg-amber-500 text-white' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      {order.billing.priority}
                    </span>
                  </div>

                  {order.billing.deliveryNotes && (
                    <div className="text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-semibold max-w-md truncate">
                      <strong>Note:</strong> {order.billing.deliveryNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Master Workflow Actions Panel */}
              <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    Master Cutting Controls
                  </div>

                  {/* Overall progress indicator */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Garments Completed:</span>
                      <span className="text-[#233B5D] font-extrabold">{completedGarments} of {totalGarments} ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          progressPct === 100 ? 'bg-[#16834A]' : 'bg-[#147D75]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Large Action Buttons */}
                <div className="space-y-2">
                  {currentCuttingStatus !== 'IN_CUTTING' && currentCuttingStatus !== 'CUTTING_COMPLETED' && (
                    <button
                      type="button"
                      onClick={handleStartCutting}
                      className="w-full min-h-[48px] bg-[#147D75] hover:bg-[#0e605a] text-white rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Scissors className="w-5 h-5" />
                      <span>Start Cutting Order</span>
                    </button>
                  )}

                  {currentCuttingStatus !== 'CUTTING_COMPLETED' && (
                    <button
                      type="button"
                      onClick={handleMarkCompleted}
                      className="w-full min-h-[48px] bg-[#16834A] hover:bg-[#126b3c] text-white rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Mark All as Completed</span>
                    </button>
                  )}

                  {currentCuttingStatus !== 'ON_HOLD' ? (
                    <button
                      type="button"
                      onClick={() => setShowHoldDialog(true)}
                      className="w-full min-h-[44px] bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span>Put On Hold (Missing Info/Cloth)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResumeCutting}
                      className="w-full min-h-[44px] bg-[#233B5D] hover:bg-[#1b2f4a] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Cutting Work</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Material Verification Checklist */}
            <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#147D75]" />
                  <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
                    Material Intake Checklist
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Tap to toggle: <strong>Received</strong> • <strong>Pending</strong> • <strong>Not Required</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'customerMaterial', label: 'Customer Cloth' },
                  { key: 'shopMaterial', label: 'Shop Provided Cloth' },
                  { key: 'liningMaterial', label: 'Lining Fabric' },
                  { key: 'twoByTwoMaterial', label: '2x2 Rubia Material' },
                  { key: 'otherMaterials', label: 'Other Trims / Borders' },
                ].map(item => {
                  const val = (matCheck as any)[item.key] as MaterialCheckStatus;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleMaterialToggle(item.key as any, val)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[75px] transition-all cursor-pointer shadow-sm ${
                        val === 'Received'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                          : val === 'Pending'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase truncate">{item.label}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black">{val}</span>
                        {val === 'Received' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {val === 'Pending' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {matCheck.remarks && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  <strong>Intake Notes:</strong> {matCheck.remarks}
                </div>
              )}
            </div>

            {/* Individual Garment Specifications Accordions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#233B5D]" />
                  <h3 className="text-lg font-black text-[#233B5D] uppercase tracking-wide">
                    Individual Garment Specifications ({order.garmentSpecs.length} Pieces)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Original Front Desk measurements and directives preserved
                </span>
              </div>

              <div className="space-y-3">
                {order.garmentSpecs.map((spec: GarmentSpecification, idx: number) => {
                  const isExpanded = expandedGarmentIndex === idx;
                  const itemTitle = spec.title || `${spec.category} #${spec.garmentNumber}`;
                  const garmentStatus = spec.cuttingStatus || 'Pending';

                  return (
                    <div
                      key={spec.id || idx}
                      className={`bg-white rounded-xl border transition-all shadow-sm ${
                        garmentStatus === 'Completed'
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : garmentStatus === 'In Progress'
                          ? 'border-[#147D75] bg-teal-50/20 ring-1 ring-[#147D75]/20'
                          : garmentStatus === 'On Hold'
                          ? 'border-red-300 bg-red-50/20'
                          : 'border-slate-300'
                      }`}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => setExpandedGarmentIndex(isExpanded ? null : idx)}
                        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                            garmentStatus === 'Completed' ? 'bg-[#16834A] text-white' :
                            garmentStatus === 'In Progress' ? 'bg-[#147D75] text-white' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-lg font-black text-[#233B5D]">{itemTitle}</h4>
                              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                                {spec.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-3">
                              <span>Sleeve: <strong>{spec.sleeveType || 'Standard'}</strong></span>
                              <span>Front Neck: <strong>{spec.frontNeckDesign || 'Round'}</strong></span>
                              <span>Back Neck: <strong>{spec.backNeckDesign || 'Round U'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle, Print Dress & Accordion Chevron */}
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPrintGarmentIndex(idx);
                              setIsPrintOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-[#233B5D]/10 hover:bg-[#233B5D] hover:text-white text-[#233B5D] rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                            title={`Print 1-Page A4 Worksheet for ${itemTitle}`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Print Dress A4</span>
                          </button>

                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {(['Pending', 'In Progress', 'Completed', 'On Hold'] as const).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => updateGarmentCuttingStatus(order.id, idx, st)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                  garmentStatus === st
                                    ? st === 'Completed'
                                      ? 'bg-[#16834A] text-white shadow'
                                      : st === 'In Progress'
                                      ? 'bg-[#147D75] text-white shadow'
                                      : st === 'On Hold'
                                      ? 'bg-red-600 text-white shadow'
                                      : 'bg-slate-700 text-white shadow'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedGarmentIndex(isExpanded ? null : idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 p-4 sm:p-5 bg-slate-50/60 space-y-4">
                          
                          {/* Original Measurements Matrix for this Garment */}
                          <div>
                            <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span>Customer Measurements ({order.measurements.unit})</span>
                              <span className="text-[11px] font-normal text-slate-400">Master record unaltered</span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2 text-center">
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
                                { label: 'Front Depth', val: order.measurements.frontNeckDepth },
                                { label: 'Back Depth', val: order.measurements.backNeckDepth },
                                { label: 'Bottom L', val: order.measurements.bottomLength },
                                { label: 'Thigh', val: order.measurements.thigh },
                                { label: 'Knee', val: order.measurements.knee },
                                { label: 'Ankle', val: order.measurements.ankle },
                              ]
                                .filter(m => m.val !== undefined && m.val !== '')
                                .map((m, mIdx) => (
                                  <div key={mIdx} className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate">{m.label}</div>
                                    <div className="text-sm font-black text-[#233B5D]">{m.val} {order.measurements.unit}</div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Cut & Design Specifics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Sleeve Pattern</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.sleeveType || 'Standard'}</span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Front Neck Style</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.frontNeckDesign || spec.neckType || 'Round'}</span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Back Neck Style</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.backNeckDesign || 'Round U'}</span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Opening / Hook</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.frontHookOrBack || 'Front Hook'}</span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Lining</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.lining || 'Full Lining'}</span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Fitting</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.fitting || 'Comfort Fit'}</span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Slit / Zip / Bottom</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                                {spec.slit ? `Slit: ${spec.slit}` : spec.bottomStyle ? `Style: ${spec.bottomStyle}` : spec.zip ? `Zip: ${spec.zip}` : 'Standard'}
                              </span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-bold uppercase text-[10px] block">Regional Cut</span>
                              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{spec.regionalStyle || 'Standard Tamil Nadu'}</span>
                            </div>
                          </div>

                          {/* Directives & Customer Wishes */}
                          {(spec.tailorInstructions || spec.customerInstructions || spec.specialDesignNotes) && (
                            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs space-y-1.5">
                              {spec.tailorInstructions && (
                                <div>
                                  <strong className="text-amber-900 uppercase font-black">Workshop Cutting Directives:</strong>{' '}
                                  <span className="text-slate-800 font-bold">{spec.tailorInstructions}</span>
                                </div>
                              )}
                              {spec.customerInstructions && (
                                <div>
                                  <strong className="text-blue-900 uppercase font-bold">Customer Notes:</strong>{' '}
                                  <span className="text-slate-700">{spec.customerInstructions}</span>
                                </div>
                              )}
                              {spec.specialDesignNotes && (
                                <div>
                                  <strong className="text-purple-900 uppercase font-bold">Special Design Details:</strong>{' '}
                                  <span className="text-slate-700">{spec.specialDesignNotes}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reference Images if uploaded */}
                          {spec.referenceImages && spec.referenceImages.length > 0 && (
                            <div>
                              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-[#147D75]" />
                                <span>Reference Images ({spec.referenceImages.length})</span>
                              </div>
                              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                {spec.referenceImages.map((img, imgIdx) => (
                                  <div key={img.id || imgIdx} className="w-24 h-24 rounded-xl border border-slate-300 overflow-hidden bg-slate-100 flex-shrink-0 relative group">
                                    <img src={img.url} alt={img.title || 'Reference'} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                                      {img.title || 'Design Ref'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cutting Master Notes & Observations */}
            <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#233B5D]" />
                  <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
                    Cutting Master Log & Remarks
                  </h3>
                </div>
                {hasUnsavedRemarks && (
                  <span className="text-xs text-amber-600 font-bold animate-pulse">
                    Unsaved Remarks
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold block">Assigned Cutting Master</span>
                  <span className="text-sm font-extrabold text-[#233B5D] block mt-0.5">
                    {cuttingDetails.assignedMaster || 'Senior Master (Table 1)'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold block">Cutting Started At</span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
                    {cuttingDetails.startedAt ? new Date(cuttingDetails.startedAt).toLocaleString() : 'Not started yet'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold block">Cutting Completed At</span>
                  <span className="text-sm font-extrabold text-emerald-800 block mt-0.5">
                    {cuttingDetails.completedAt ? new Date(cuttingDetails.completedAt).toLocaleString() : 'In progress / Pending'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Master Cutting Remarks, Fabric Flaws, or Workshop Notes:
                </label>
                <textarea
                  rows={2}
                  value={masterRemarks}
                  onChange={e => {
                    setMasterRemarks(e.target.value);
                    setHasUnsavedRemarks(true);
                  }}
                  placeholder="Enter any cutting notes, bias cut adjustments, grain observations, or questions for front desk..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#147D75] bg-slate-50"
                />
                {hasUnsavedRemarks && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSaveRemarks}
                      className="px-4 py-1.5 bg-[#233B5D] hover:bg-[#1b2f4a] text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                    >
                      Save Remarks
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Modal Bottom Actions Footer */}
          <div className="bg-white border-t border-slate-200 px-5 sm:px-7 py-3 flex items-center justify-between flex-shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              Confidential Workshop Card • Zero Financial / Billing Data Displayed
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPrintOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Job Card</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#233B5D] hover:bg-[#1b2f4a] text-white font-bold text-sm rounded-xl shadow transition-all cursor-pointer"
              >
                Done / Close
              </button>
            </div>
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
                <p className="text-xs text-slate-500 font-semibold">Specify the reason for the Front Desk & Tailors</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Reason for Hold:</label>
              <textarea
                rows={3}
                value={holdReasonInput}
                onChange={e => setHoldReasonInput(e.target.value)}
                placeholder="e.g. Customer provided saree cloth is short by 0.5m. Awaiting confirmation."
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHoldDialog(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHold}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow cursor-pointer"
              >
                Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Worksheet Modal View */}
      {isPrintOpen && (
        <CuttingWorksheetPrint 
          order={order} 
          initialGarmentIndex={selectedPrintGarmentIndex}
          onClose={() => setIsPrintOpen(false)} 
        />
      )}
    </>
  );
};
