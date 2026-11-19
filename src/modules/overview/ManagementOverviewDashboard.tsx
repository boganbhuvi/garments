import React, { useState, useMemo } from 'react';
import { Order } from '../../types/order';
import { useOrder } from '../../context/OrderContext';
import {
  TrendingUp,
  ShoppingBag,
  Scissors,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FileText,
  Play,
  RotateCcw,
  ShieldCheck,
  Package,
  Flame
} from 'lucide-react';
import { calculateOrderWorkloadPoints } from '../../utils/capacityEngine';

interface ManagementOverviewDashboardProps {
  onOpenOrder: (order: Order) => void;
}

export const ManagementOverviewDashboard: React.FC<ManagementOverviewDashboardProps> = ({
  onOpenOrder
}) => {
  const {
    savedOrders,
    setActiveModule,
    setCurrentStep,
    createNewOrder,
    checkDbHealth,
    dbStatus
  } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Compute metrics
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const metrics = useMemo(() => {
    let totalOrders = savedOrders.length;
    let newToday = 0;
    let pendingCutting = 0;
    let cuttingInProgress = 0;
    let stitchingInProgress = 0;
    let readyForQc = 0;
    let readyForDispatch = 0;
    let deliveredOrders = 0;
    let pendingDeliveries = 0;
    let overdueOrders = 0;
    let totalOutstandingBalance = 0;
    let totalWorkloadPoints = 0;

    let totalGarmentsNew = 0;
    let totalGarmentsCutting = 0;
    let totalGarmentsStitching = 0;
    let totalGarmentsQC = 0;
    let totalGarmentsDispatch = 0;

    let expressCount = 0;
    let urgentCount = 0;

    savedOrders.forEach(ord => {
      const gCount = ord.garmentSpecs.length || ord.garmentQuantities.reduce((s, g) => s + g.quantity, 0) || 1;
      const pts = calculateOrderWorkloadPoints(ord.garmentQuantities, ord.garmentSpecs);
      totalWorkloadPoints += pts;

      totalOutstandingBalance += ord.billing.balanceAmount || 0;

      if (ord.billing.priority === 'Express') expressCount++;
      if (ord.billing.priority === 'Urgent') urgentCount++;

      if (ord.createdAt.startsWith(todayStr)) {
        newToday++;
      }

      // Check if overdue
      if (ord.billing.dueDate && ord.billing.dueDate < todayStr && ord.status !== 'COMPLETED' && ord.status !== 'DELIVERED') {
        overdueOrders++;
      }

      if (ord.status === 'NEW' || ord.status === 'READY_FOR_CUTTING') {
        pendingCutting++;
        totalGarmentsNew += gCount;
      } else if (ord.status === 'IN_CUTTING') {
        cuttingInProgress++;
        totalGarmentsCutting += gCount;
      } else if (ord.status === 'CUTTING_COMPLETED' || ord.status === 'IN_STITCHING') {
        stitchingInProgress++;
        totalGarmentsStitching += gCount;
      } else if (ord.status === 'READY_FOR_QC' || ord.status === 'IN_QC') {
        readyForQc++;
        totalGarmentsQC += gCount;
      } else if (ord.status === 'READY_FOR_DISPATCH' || ord.status === 'READY_FOR_TRIAL' || ord.status === 'COMPLETED') {
        readyForDispatch++;
        totalGarmentsDispatch += gCount;
      } else if (ord.status === 'DELIVERED') {
        deliveredOrders++;
      }

      if (ord.status !== 'DELIVERED') {
        pendingDeliveries++;
      }
    });

    return {
      totalOrders,
      newToday,
      pendingCutting,
      cuttingInProgress,
      stitchingInProgress,
      readyForQc,
      readyForDispatch,
      deliveredOrders,
      pendingDeliveries,
      overdueOrders,
      totalOutstandingBalance,
      totalWorkloadPoints: Math.round(totalWorkloadPoints),
      expressCount,
      urgentCount,
      pipeline: {
        newOrders: { orders: pendingCutting, garments: totalGarmentsNew },
        cutting: { orders: cuttingInProgress, garments: totalGarmentsCutting },
        stitching: { orders: stitchingInProgress, garments: totalGarmentsStitching },
        qc: { orders: readyForQc, garments: totalGarmentsQC },
        dispatch: { orders: readyForDispatch, garments: totalGarmentsDispatch }
      }
    };
  }, [savedOrders, todayStr]);

  // Filtered orders list sorted by Priority (Express > Urgent > Normal) then Due Date
  const filteredOrders = useMemo(() => {
    const list = savedOrders.filter(ord => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        ord.id.toLowerCase().includes(q) ||
        ord.serialNumber.toLowerCase().includes(q) ||
        ord.customer.customerName.toLowerCase().includes(q) ||
        ord.customer.primaryPhone.includes(q);

      const matchesPriority =
        filterPriority === 'ALL' || ord.billing.priority === filterPriority;

      return matchesSearch && matchesPriority;
    });

    // Priority Queue Ranking
    return [...list].sort((a, b) => {
      const rank = { Express: 1, Urgent: 2, Normal: 3 };
      const rankA = rank[a.billing.priority] || 3;
      const rankB = rank[b.billing.priority] || 3;
      if (rankA !== rankB) return rankA - rankB;

      const dateA = new Date(a.billing.dueDate).getTime() || 0;
      const dateB = new Date(b.billing.dueDate).getTime() || 0;
      return dateA - dateB;
    });
  }, [savedOrders, searchQuery, filterPriority]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#191C1E] pb-24 pt-4">
      
      {/* Top Executive Header Banner */}
      <div className="bg-[#233B5D] text-white border-b border-[#1b2f4a] shadow-md py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-lg">
              <TrendingUp className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Executive Management Overview
                </h1>
                <span className="bg-[#147D75] text-[#99F2E8] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Enterprise Pulse
                </span>
              </div>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                Giriraj Garments Tailoring Studio • Real-Time Floor Operations & Financial Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                createNewOrder();
                setActiveModule('FRONT_DESK');
                setCurrentStep(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-[#233B5D] hover:bg-slate-100 font-black text-xs sm:text-sm flex items-center gap-2 shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#147D75]" />
              <span>+ New Customer Booking</span>
            </button>

            <button
              type="button"
              onClick={() => checkDbHealth()}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer border border-white/20 transition-all"
              title="Refresh live data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* DEMO EXPERIENCE SCENARIOS BAR (Linear-inspired quick walkthrough) */}
        <div className="bg-gradient-to-r from-[#233B5D] to-[#147D75] rounded-3xl p-5 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Interactive 5-Minute Executive Walkthrough</h3>
              <p className="text-xs text-slate-200">
                Experience how a bridal garment flows from customer reception to scissor table and sewing allocation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveModule('FRONT_DESK');
                setCurrentStep(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <span>1: Front Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('CUTTING_DEPT')}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <span>2: Cutting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('STITCHING_DEPT')}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <span>3: Stitching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('QC_DEPT')}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4: QC & Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('DISPATCH_DEPT')}
              className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Package className="w-3.5 h-3.5" />
              <span>5: Dispatch & Counter</span>
            </button>
          </div>
        </div>

        {/* 8 TOP KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-[#191C1E]">
          
          <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Orders</span>
            <div className="text-2xl font-black text-[#233B5D] mt-1">{metrics.totalOrders}</div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">Active ledger</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Workload Points</span>
            <div className="text-2xl font-black text-teal-700 mt-1">{metrics.totalWorkloadPoints}</div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">Factory capacity pts</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-sm">
            <span className="text-[10px] font-black uppercase text-purple-800 block tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-purple-600 fill-purple-600" />
              Express Orders
            </span>
            <div className="text-2xl font-black text-purple-900 mt-1">{metrics.expressCount}</div>
            <span className="text-[11px] font-bold text-purple-700 mt-0.5 block">Top priority</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">In Cutting</span>
            <div className="text-2xl font-black text-[#147D75] mt-1">{metrics.cuttingInProgress}</div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">On chalk table</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">In Stitching</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.stitchingInProgress}</div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">With tailors</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
            <span className="text-[10px] font-black uppercase text-emerald-800 block tracking-wider">QC & Audit</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.readyForQc}</div>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 block">Tolerance checks</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-sm">
            <span className="text-[10px] font-black uppercase text-purple-800 block tracking-wider">Ready for Pickup</span>
            <div className="text-2xl font-black text-purple-800 mt-1">{metrics.readyForDispatch}</div>
            <span className="text-[11px] font-bold text-purple-600 mt-0.5 block">At store counter</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Balance Due</span>
            <div className="text-xl font-black text-red-600 mt-1">₹{metrics.totalOutstandingBalance.toLocaleString('en-IN')}</div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">Collect at counter</span>
          </div>

        </div>

        {/* 5-STAGE VISUAL PRODUCTION PIPELINE DIAGRAM */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
                Live Factory Floor Pipeline Flow (5 Production Stages)
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Real-time workload flow from booking reception to counter handover
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              Updated Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* Step 1: New Orders */}
            <div className="p-3.5 rounded-2xl border-2 border-blue-200 bg-blue-50/50 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-blue-900">01. Booked</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-200 text-blue-900">
                    {metrics.pipeline.newOrders.orders} Orders
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {metrics.pipeline.newOrders.garments} Garments
                </div>
                <p className="text-[11px] text-slate-600">
                  Customer booked with measurements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('FRONT_DESK');
                  setCurrentStep(1);
                }}
                className="w-full mt-2 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition-all cursor-pointer"
              >
                Reception →
              </button>
            </div>

            {/* Step 2: Cutting Department */}
            <div className="p-3.5 rounded-2xl border-2 border-teal-200 bg-teal-50/50 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-teal-900">02. Cutting Dept</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-teal-200 text-teal-900">
                    {metrics.pipeline.cutting.orders} Orders
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {metrics.pipeline.cutting.garments} Garments
                </div>
                <p className="text-[11px] text-slate-600">
                  Chalk marked, cut to measure.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('CUTTING_DEPT')}
                className="w-full mt-2 py-1.5 rounded-xl bg-white hover:bg-teal-100 text-teal-900 font-bold text-xs border border-teal-200 transition-all cursor-pointer"
              >
                Cutting Table →
              </button>
            </div>

            {/* Step 3: Stitching Department */}
            <div className="p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-indigo-900">03. Stitching Dept</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-200 text-indigo-900">
                    {metrics.pipeline.stitching.orders} Orders
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {metrics.pipeline.stitching.garments} Garments
                </div>
                <p className="text-[11px] text-slate-600">
                  Allocated to master tailors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('STITCHING_DEPT')}
                className="w-full mt-2 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-200 transition-all cursor-pointer"
              >
                Tailor Allocations →
              </button>
            </div>

            {/* Step 4: Quality Control & Audit */}
            <div className="p-3.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-emerald-900">04. QC & Audit</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-200 text-emerald-900">
                    {metrics.pipeline.qc.orders} Orders
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {metrics.pipeline.qc.garments} Garments
                </div>
                <p className="text-[11px] text-slate-600">
                  Tolerance & finishing verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('QC_DEPT')}
                className="w-full mt-2 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
              >
                QC Inspection →
              </button>
            </div>

            {/* Step 5: Dispatch & Handover */}
            <div className="p-3.5 rounded-2xl border-2 border-purple-200 bg-purple-50/50 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-purple-900">05. Dispatch & Trial</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-200 text-purple-900">
                    {metrics.pipeline.dispatch.orders} Orders
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {metrics.pipeline.dispatch.garments} Garments
                </div>
                <p className="text-[11px] text-slate-600">
                  Ready for trial, balance & handover.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('DISPATCH_DEPT')}
                className="w-full mt-2 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-all cursor-pointer"
              >
                Counter Handover →
              </button>
            </div>

          </div>
        </div>

        {/* MASTER ORDER QUEUE TABLE */}
        <div className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden">
          
          {/* Header strip & search */}
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <div>
              <h3 className="text-base font-black text-[#233B5D] uppercase tracking-wide">
                Live Orders Ledger & Workflow Queue
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Click any row to open the complete Executive Order Inspector
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
                />
              </div>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#147D75]"
              >
                <option value="ALL">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Express">Express</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-5">Bill / Token</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Garments</th>
                  <th className="py-3.5 px-4">Booking Date</th>
                  <th className="py-3.5 px-4">Delivery Due</th>
                  <th className="py-3.5 px-4">Production Stage</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredOrders.map(ord => {
                  const isOverdue = ord.billing.dueDate && ord.billing.dueDate < todayStr && ord.status !== 'COMPLETED' && ord.status !== 'DELIVERED';
                  const gCount = ord.garmentSpecs.length || ord.garmentQuantities.reduce((s, g) => s + g.quantity, 0) || 1;
                  const gNames = ord.garmentSpecs.length > 0 
                    ? Array.from(new Set(ord.garmentSpecs.map(g => g.category))).join(', ')
                    : 'Custom Garments';

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => onOpenOrder(ord)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        isOverdue ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Bill / Token */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-slate-400 block">{ord.serialNumber}</span>
                        <strong className="text-base font-black text-[#233B5D] block">{ord.id}</strong>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <strong className="text-slate-900 block font-bold">{ord.customer.customerName}</strong>
                        <span className="text-xs text-slate-500 font-semibold">{ord.customer.primaryPhone}</span>
                      </td>

                      {/* Garments */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <strong className="text-[#147D75] block font-black">{gCount} Piece(s)</strong>
                        <span className="text-xs text-slate-500 font-semibold truncate max-w-xs block">{gNames}</span>
                      </td>

                      {/* Booking Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                        {ord.billing.orderDate || ord.createdAt.split('T')[0]}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <strong className={`block font-black ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                          {ord.billing.dueDate || 'Normal'}
                        </strong>
                        <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isOverdue ? 'bg-red-600 text-white animate-pulse' :
                          ord.billing.priority === 'Express' ? 'bg-red-100 text-red-700' :
                          ord.billing.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {isOverdue ? '⚠️ Overdue' : ord.billing.priority}
                        </span>
                      </td>

                      {/* Current Stage */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          ord.status === 'READY_FOR_TRIAL' || ord.status === 'COMPLETED' ? 'bg-[#16834A] text-white' :
                          ord.status === 'IN_STITCHING' || ord.status === 'CUTTING_COMPLETED' ? 'bg-indigo-600 text-white' :
                          ord.status === 'IN_CUTTING' ? 'bg-[#147D75] text-white' :
                          ord.status === 'ON_HOLD' ? 'bg-red-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Balance Due */}
                      <td className="py-4 px-4 text-right whitespace-nowrap font-black text-slate-900">
                        ₹{ord.billing.balanceAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOrder(ord);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#233B5D] hover:text-white text-[#233B5D] text-xs font-black flex items-center gap-1 ml-auto transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-semibold">
                      No customer orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
