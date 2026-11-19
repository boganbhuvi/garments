import React, { useState, useMemo } from 'react';
import { useOrder } from '../../context/OrderContext';
import { Order, CuttingStatus } from '../../types/order';
import { CuttingOrderDetailPage } from './CuttingOrderDetailPage';
import { CuttingWorksheetPrint } from './CuttingWorksheetPrint';
import {
  Scissors,
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PauseCircle,
  Eye,
  Printer,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Phone,
  Layers,
  Sparkles,
  RefreshCw,
  FolderOpen,
  MessageSquare
} from 'lucide-react';

type FilterTab = 'ALL' | 'NEW' | 'READY_FOR_CUTTING' | 'IN_CUTTING' | 'CUTTING_COMPLETED' | 'ON_HOLD';
type SortField = 'dueDate' | 'priority' | 'orderDate';
type SortDirection = 'asc' | 'desc';

export const CuttingDashboard: React.FC = () => {
  const { savedOrders, checkDbHealth, openWhatsAppModal } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Selected order for modal detail & print
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Derive accurate cutting status for each order
  const getOrderCuttingStatus = (order: Order): CuttingStatus => {
    if (order.cuttingDetails?.status) {
      return order.cuttingDetails.status;
    }
    const orderStatus = order.status;
    if (orderStatus === 'IN_CUTTING') return 'IN_CUTTING';
    if (orderStatus === 'CUTTING_COMPLETED') return 'CUTTING_COMPLETED';
    if (orderStatus === 'ON_HOLD') return 'ON_HOLD';
    if (orderStatus === 'READY_FOR_CUTTING') return 'READY_FOR_CUTTING';
    return 'NEW';
  };

  // 4 Summary Metrics
  const summaryMetrics = useMemo(() => {
    let newCount = 0;
    let readyCount = 0;
    let inProgressCount = 0;
    let completedTodayCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    savedOrders.forEach(order => {
      const status = getOrderCuttingStatus(order);
      if (status === 'NEW') newCount++;
      else if (status === 'READY_FOR_CUTTING') readyCount++;
      else if (status === 'IN_CUTTING') inProgressCount++;
      else if (status === 'CUTTING_COMPLETED') {
        const completedDate = order.cuttingDetails?.completedAt?.split('T')[0];
        if (completedDate === todayStr || !completedDate) {
          completedTodayCount++;
        }
      }
    });

    return {
      newCount,
      readyCount,
      inProgressCount,
      completedTodayCount
    };
  }, [savedOrders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return savedOrders
      .filter(order => {
        // Search Filter
        if (q) {
          const matchBill = order.customer.billNumber?.toLowerCase().includes(q) || order.id.toLowerCase().includes(q);
          const matchSerial = order.serialNumber?.toLowerCase().includes(q);
          const matchName = order.customer.customerName?.toLowerCase().includes(q);
          const matchCustId = order.customer.customerId?.toLowerCase().includes(q);
          const matchPhone = order.customer.primaryPhone?.includes(q) || order.customer.secondaryPhone?.includes(q);
          if (!matchBill && !matchSerial && !matchName && !matchCustId && !matchPhone) {
            return false;
          }
        }

        // Status Filter
        const status = getOrderCuttingStatus(order);
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'NEW') return status === 'NEW';
        if (activeFilter === 'READY_FOR_CUTTING') return status === 'READY_FOR_CUTTING';
        if (activeFilter === 'IN_CUTTING') return status === 'IN_CUTTING';
        if (activeFilter === 'CUTTING_COMPLETED') return status === 'CUTTING_COMPLETED';
        if (activeFilter === 'ON_HOLD') return status === 'ON_HOLD';
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'dueDate') {
          const dateA = a.billing.dueDate || '9999-99-99';
          const dateB = b.billing.dueDate || '9999-99-99';
          diff = dateA.localeCompare(dateB);
        } else if (sortField === 'orderDate') {
          const dateA = a.billing.orderDate || '0000-00-00';
          const dateB = b.billing.orderDate || '0000-00-00';
          diff = dateB.localeCompare(dateA); // newest first by default
        } else if (sortField === 'priority') {
          const priorityWeight: Record<string, number> = { Express: 3, Urgent: 2, Normal: 1 };
          const pA = priorityWeight[a.billing.priority] || 1;
          const pB = priorityWeight[b.billing.priority] || 1;
          diff = pB - pA; // highest priority first
        }

        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [savedOrders, searchQuery, activeFilter, sortField, sortDirection]);

  // Priority toggle helper
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper for material status display
  const getMaterialStatusBadge = (order: Order) => {
    const check = order.cuttingDetails?.materialsCheck;
    if (!check) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Received</span>
        </span>
      );
    }
    const hasPending = Object.values(check).some(v => v === 'Pending');
    if (hasPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>Pending Material</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>All Received</span>
      </span>
    );
  };

  // Format garment breakdown string e.g. "Blouses (4), Kurtis (2)"
  const getGarmentSummaryText = (order: Order): string => {
    if (order.garmentSpecs && order.garmentSpecs.length > 0) {
      const counts: Record<string, number> = {};
      order.garmentSpecs.forEach(g => {
        counts[g.category] = (counts[g.category] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([cat, cnt]) => `${cat} (${cnt})`)
        .join(', ');
    }
    const nonZero = order.garmentQuantities.filter(g => g.quantity > 0);
    if (nonZero.length > 0) {
      return nonZero.map(g => `${g.label} (${g.quantity})`).join(', ');
    }
    return '1 Item';
  };

  const getTotalPieces = (order: Order): number => {
    if (order.garmentSpecs && order.garmentSpecs.length > 0) {
      return order.garmentSpecs.length;
    }
    return order.garmentQuantities.reduce((sum, g) => sum + g.quantity, 0) || 1;
  };

  // Keep order in sync when savedOrders changes
  const activeSelectedOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return savedOrders.find(o => o.id === selectedOrder.id) || selectedOrder;
  }, [selectedOrder, savedOrders]);

  // Dedicated Full Page view for active cutting order
  if (activeSelectedOrder) {
    return (
      <CuttingOrderDetailPage
        order={activeSelectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#191C1E] pb-24 pt-4">
      
      {/* Top Banner & Title Area */}
      <div className="bg-[#233B5D] text-white border-b border-[#1b2f4a] shadow-md py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-lg">
              <Scissors className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Cutting Department Master
                </h1>
                <span className="bg-[#147D75] text-[#99F2E8] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Workshop
                </span>
              </div>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                Giriraj Garments Cutting Table Work Queue & Pattern Specification Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => checkDbHealth()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/15"
              title="Refresh queue from database"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* SECTION 1: FOUR SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: New Orders */}
          <button
            type="button"
            onClick={() => setActiveFilter('NEW')}
            className={`p-5 rounded-2xl border text-left transition-all shadow-sm cursor-pointer ${
              activeFilter === 'NEW'
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                1. New Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#233B5D]">
              {summaryMetrics.newCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Awaiting master inspection
            </div>
          </button>

          {/* Card 2: Ready for Cutting */}
          <button
            type="button"
            onClick={() => setActiveFilter('READY_FOR_CUTTING')}
            className={`p-5 rounded-2xl border text-left transition-all shadow-sm cursor-pointer ${
              activeFilter === 'READY_FOR_CUTTING'
                ? 'bg-teal-50 border-[#147D75] ring-2 ring-[#147D75]/20'
                : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                2. Ready for Cutting
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#147D75] flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#147D75]">
              {summaryMetrics.readyCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Cloth verified & ready to mark
            </div>
          </button>

          {/* Card 3: Cutting In Progress */}
          <button
            type="button"
            onClick={() => setActiveFilter('IN_CUTTING')}
            className={`p-5 rounded-2xl border text-left transition-all shadow-sm cursor-pointer ${
              activeFilter === 'IN_CUTTING'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                3. Cutting In Progress
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Scissors className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600">
              {summaryMetrics.inProgressCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              On cutting table now
            </div>
          </button>

          {/* Card 4: Completed Today */}
          <button
            type="button"
            onClick={() => setActiveFilter('CUTTING_COMPLETED')}
            className={`p-5 rounded-2xl border text-left transition-all shadow-sm cursor-pointer ${
              activeFilter === 'CUTTING_COMPLETED'
                ? 'bg-emerald-50 border-[#16834A] ring-2 ring-[#16834A]/20'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                4. Completed Today
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16834A] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#16834A]">
              {summaryMetrics.completedTodayCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Handed over to Stitching Dept
            </div>
          </button>

        </div>

        {/* SECTION 2: SEARCH, FILTERS & SORT CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input (Large 18px text for accessibility) */}
            <div className="relative flex-1">
              <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Bill No (e.g. GG-2025-0842), Customer Name, ID, or Phone..."
                className="w-full pl-13 pr-4 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-semibold text-[#191C1E] focus:outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-bold text-slate-500 hidden sm:inline">Sort:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => handleSortChange('dueDate')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'dueDate' ? 'bg-[#233B5D] text-white shadow' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Due Date</span>
                  {sortField === 'dueDate' && <ArrowUpDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSortChange('priority')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'priority' ? 'bg-[#233B5D] text-white shadow' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Priority</span>
                  {sortField === 'priority' && <ArrowUpDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSortChange('orderDate')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    sortField === 'orderDate' ? 'bg-[#233B5D] text-white shadow' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Order Date</span>
                  {sortField === 'orderDate' && <ArrowUpDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Filter Pills Bar (Accessible large buttons) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'NEW', label: 'New Orders' },
              { id: 'READY_FOR_CUTTING', label: 'Ready for Cutting' },
              { id: 'IN_CUTTING', label: 'In Progress' },
              { id: 'CUTTING_COMPLETED', label: 'Completed' },
              { id: 'ON_HOLD', label: 'On Hold' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as FilterTab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#233B5D] text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* SECTION 3: CUTTING WORK QUEUE TABLE (DESKTOP & TABLET) */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-visible">
          
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#233B5D] tracking-tight">
                Cutting Work Queue ({filteredOrders.length} Orders)
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Front desk orders appear here instantly. Click "Open Work Order" to start cutting.
              </p>
            </div>

            <div className="text-xs text-slate-400 font-bold hidden sm:block">
              Sorted by: <span className="uppercase text-slate-700">{sortField} ({sortDirection})</span>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No Orders in this View</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No cutting orders found matching your search query or selected filter tab.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('ALL');
                }}
                className="mt-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop & Landscape Tablet Table */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="min-w-[900px] w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-300 text-xs font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2 pl-4 whitespace-nowrap">Serial & Bill</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Garments</th>
                      <th className="py-3 px-2 whitespace-nowrap">Order / Due</th>
                      <th className="py-3 px-2">Priority</th>
                      <th className="py-3 px-2 whitespace-nowrap">Material</th>
                      <th className="py-3 px-2 whitespace-nowrap">Status</th>
                      <th className="py-3 px-2 pr-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map(order => {
                      const cuttingStatus = getOrderCuttingStatus(order);
                      const totalItems = getTotalPieces(order);
                      const garmentSummary = getGarmentSummaryText(order);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3 px-2 pl-4 font-mono whitespace-nowrap">
                            <span className="block text-xs font-black text-slate-400">{order.serialNumber}</span>
                            <span className="text-sm font-extrabold text-[#233B5D]">{order.id}</span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-extrabold text-sm text-[#191C1E] group-hover:text-[#233B5D] max-w-[130px] truncate">{order.customer.customerName}</div>
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" /><span>{order.customer.primaryPhone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-bold text-slate-800 text-xs max-w-[140px] truncate" title={garmentSummary}>{garmentSummary}</div>
                            <div className="text-xs text-slate-500 mt-0.5"><strong>{totalItems} pcs</strong></div>
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <div className="text-xs text-slate-500 font-semibold">{order.billing.orderDate}</div>
                            <div className="text-xs font-extrabold text-red-600 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-red-500 flex-shrink-0" /><span>{order.billing.dueDate}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black uppercase ${order.billing.priority === 'Express' ? 'bg-red-600 text-white' : order.billing.priority === 'Urgent' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>{order.billing.priority}</span>
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">{getMaterialStatusBadge(order)}</td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black uppercase ${cuttingStatus === 'CUTTING_COMPLETED' ? 'bg-[#16834A] text-white' : cuttingStatus === 'IN_CUTTING' ? 'bg-[#147D75] text-white' : cuttingStatus === 'ON_HOLD' ? 'bg-[#D64545] text-white' : cuttingStatus === 'READY_FOR_CUTTING' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                              {cuttingStatus === 'IN_CUTTING' && <Scissors className="w-3 h-3 animate-bounce" />}
                              {cuttingStatus === 'CUTTING_COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                              {cuttingStatus === 'ON_HOLD' && <PauseCircle className="w-3 h-3" />}
                              <span>{cuttingStatus.replace(/_/g, ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-2 pr-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button type="button" onClick={() => setPrintOrder(order)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer" title="Print Worksheet"><Printer className="w-4 h-4" /></button>
                              <button 
                                type="button" 
                                onClick={() => openWhatsAppModal(order, cuttingStatus === 'CUTTING_COMPLETED' ? 'CUTTING_COMPLETED' : 'CUTTING_STARTED')} 
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-emerald-700 cursor-pointer transition-colors" 
                                title="Send WhatsApp Cutting Update"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => setSelectedOrder(order)} className="h-9 px-3 rounded-lg bg-[#233B5D] hover:bg-[#1a2d47] text-white text-xs font-bold inline-flex items-center gap-1 shadow transition-all cursor-pointer whitespace-nowrap">
                                <span>Open Work Order</span><ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards */}
              <div className="md:hidden divide-y divide-slate-200">
                {filteredOrders.map(order => {
                  const cuttingStatus = getOrderCuttingStatus(order);
                  const totalItems = getTotalPieces(order);
                  const garmentSummary = getGarmentSummaryText(order);

                  return (
                    <div key={order.id} className="p-4 space-y-3 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {order.serialNumber}
                          </span>
                          <h3 className="text-lg font-black text-[#233B5D]">
                            {order.id}
                          </h3>
                          <div className="text-base font-extrabold text-slate-900 mt-0.5">
                            {order.customer.customerName}
                          </div>
                          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.customer.primaryPhone}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
                            order.billing.priority === 'Express' ? 'bg-red-600 text-white' :
                            order.billing.priority === 'Urgent' ? 'bg-amber-500 text-white' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {order.billing.priority}
                          </span>
                          <div className="text-xs font-extrabold text-red-600">
                            Due: {order.billing.dueDate}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-800 truncate">
                          Garments: {garmentSummary} ({totalItems} pcs)
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <div>{getMaterialStatusBadge(order)}</div>
                          <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                            cuttingStatus === 'CUTTING_COMPLETED' ? 'bg-[#16834A] text-white' :
                            cuttingStatus === 'IN_CUTTING' ? 'bg-[#147D75] text-white' :
                            cuttingStatus === 'ON_HOLD' ? 'bg-[#D64545] text-white' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {cuttingStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPrintOrder(order)}
                          className="flex-1 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openWhatsAppModal(order, cuttingStatus === 'CUTTING_COMPLETED' ? 'CUTTING_COMPLETED' : 'CUTTING_STARTED')}
                          className="px-3 min-h-[44px] rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-sm flex items-center justify-center gap-1.5"
                          title="WhatsApp Status"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-700" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="flex-2 min-h-[44px] rounded-xl bg-[#233B5D] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow"
                        >
                          <Scissors className="w-4 h-4" />
                          <span>Open Work Order</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Standalone Print Worksheet Modal */}
      {printOrder && (
        <CuttingWorksheetPrint
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}

    </div>
  );
};
