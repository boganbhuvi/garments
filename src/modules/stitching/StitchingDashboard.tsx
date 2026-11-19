import React, { useState, useMemo } from 'react';
import { Order, GarmentSpecification } from '../../types/order';
import { StitchingStatus, TailorProfile } from '../../types/stitching';
import { useOrder } from '../../context/OrderContext';
import { StitchingAllocationModal } from './StitchingAllocationModal';
import { StitchingStatusUpdateModal } from './StitchingStatusUpdateModal';
import { StitchingWorksheetPrint } from './StitchingWorksheetPrint';
import { TailorMasterView } from './TailorMasterView';
import { PieceRateWageLedger } from './PieceRateWageLedger';
import {
  Scissors,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  UserCheck,
  Printer,
  ChevronRight,
  Phone,
  Calendar,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Plus,
  MessageSquare
} from 'lucide-react';

type StitchingTab = 'QUEUE' | 'TAILORS' | 'WAGES';

interface FlatGarmentRow {
  order: Order;
  spec: GarmentSpecification;
  garmentIndex: number;
  itemTitle: string;
  category: string;
  stitchingStatus: StitchingStatus;
  tailorName: string;
  tailorId?: string;
  pieceRate: number;
  dueDate: string;
  priority: string;
}

export const StitchingDashboard: React.FC = () => {
  const {
    savedOrders,
    tailors,
    addTailor,
    updateTailor,
    deleteTailor,
    allocateMultipleGarmentsToTailor,
    updateGarmentStitchingStatus,
    wageEntries,
    paymentRecords,
    recordTailorPayment,
    getTailorWageSummary,
    checkDbHealth,
    openWhatsAppModal
  } = useOrder();

  const [activeTab, setActiveTab] = useState<StitchingTab>('QUEUE');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [specializationFilter, setSpecializationFilter] = useState<string>('ALL');

  // Modals state
  const [allocationModalOrder, setAllocationModalOrder] = useState<{
    order: Order;
    garmentIndices: number[];
  } | null>(null);

  const [statusModalConfig, setStatusModalConfig] = useState<{
    order: Order;
    garmentIndex: number;
  } | null>(null);

  const [printWorksheetConfig, setPrintWorksheetConfig] = useState<{
    order: Order;
    garmentIndex?: number;
  } | null>(null);

  // Flatten all garment pieces from orders that have either CUTTING_COMPLETED or cut garments ready
  const flatGarmentRows: FlatGarmentRow[] = useMemo(() => {
    const rows: FlatGarmentRow[] = [];

    // Prioritize orders that are cut or completed in cutting
    savedOrders.forEach(order => {
      // Check if order cutting is completed or pieces are marked completed
      const isCuttingDone = 
        order.cuttingDetails?.status === 'CUTTING_COMPLETED' ||
        order.status === 'CUTTING_COMPLETED' ||
        order.status === 'IN_STITCHING';

      // Always include if cutting done, or if order has garment specs with Completed cutting status
      order.garmentSpecs.forEach((spec, gIdx) => {
        const isPieceCut = isCuttingDone || spec.cuttingStatus === 'Completed';

        // In demo/practical mode, if piece is cut or marked in stitching, include in queue
        const currentStitchingStatus: StitchingStatus = 
          spec.stitchingDetails?.status || 
          (isPieceCut ? 'WAITING_FOR_STITCHING' : 'WAITING_FOR_STITCHING');

        rows.push({
          order,
          spec,
          garmentIndex: gIdx,
          itemTitle: spec.title || `${spec.category} 0${gIdx + 1}`,
          category: spec.category,
          stitchingStatus: currentStitchingStatus,
          tailorName: spec.stitchingDetails?.tailorName || 'Pending Allocation',
          tailorId: spec.stitchingDetails?.tailorId,
          pieceRate: spec.stitchingDetails?.pieceRate || 250,
          dueDate: order.billing.dueDate,
          priority: order.billing.priority
        });
      });
    });

    return rows;
  }, [savedOrders]);

  // Compute 5 Dashboard Summary Metrics
  const metrics = useMemo(() => {
    let waiting = 0;
    let allocated = 0;
    let inProgress = 0;
    let readyQc = 0;
    let completedToday = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    flatGarmentRows.forEach(row => {
      if (row.stitchingStatus === 'WAITING_FOR_STITCHING') waiting++;
      else if (row.stitchingStatus === 'CUT_PIECES_ALLOCATED') allocated++;
      else if (row.stitchingStatus === 'STITCHING_IN_PROGRESS' || row.stitchingStatus === 'OVERLOCK_HEMMING_DONE') inProgress++;
      else if (row.stitchingStatus === 'READY_FOR_QC') {
        readyQc++;
        if (row.spec.stitchingDetails?.completedAt?.startsWith(todayStr)) {
          completedToday++;
        }
      }
    });

    return { waiting, allocated, inProgress, readyQc, completedToday };
  }, [flatGarmentRows]);

  // Filtered garment rows
  const filteredRows = useMemo(() => {
    const matched = flatGarmentRows.filter(row => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        row.order.id.toLowerCase().includes(q) ||
        row.order.serialNumber.toLowerCase().includes(q) ||
        row.order.customer.customerName.toLowerCase().includes(q) ||
        row.tailorName.toLowerCase().includes(q) ||
        row.itemTitle.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'EXPRESS') {
        matchesStatus = row.priority === 'Express';
      } else if (statusFilter === 'URGENT') {
        matchesStatus = row.priority === 'Urgent';
      } else if (statusFilter === 'PENDING') {
        matchesStatus = row.stitchingStatus === 'WAITING_FOR_STITCHING';
      } else if (statusFilter === 'ALLOCATED') {
        matchesStatus = row.stitchingStatus === 'CUT_PIECES_ALLOCATED';
      } else if (statusFilter === 'IN_PROGRESS') {
        matchesStatus = row.stitchingStatus === 'STITCHING_IN_PROGRESS';
      } else if (statusFilter === 'OVERLOCK') {
        matchesStatus = row.stitchingStatus === 'OVERLOCK_HEMMING_DONE';
      } else if (statusFilter === 'READY_FOR_QC') {
        matchesStatus = row.stitchingStatus === 'READY_FOR_QC';
      } else if (statusFilter === 'ON_HOLD') {
        matchesStatus = row.stitchingStatus === 'ON_HOLD';
      }

      return matchesSearch && matchesStatus;
    });

    // Priority Queue Ranking: Express > Urgent > Normal, then Due Date
    return [...matched].sort((a, b) => {
      const rank: Record<string, number> = { Express: 1, Urgent: 2, Normal: 3 };
      const rankA = rank[a.priority] || 3;
      const rankB = rank[b.priority] || 3;
      if (rankA !== rankB) return rankA - rankB;

      const dateA = new Date(a.dueDate).getTime() || 0;
      const dateB = new Date(b.dueDate).getTime() || 0;
      return dateA - dateB;
    });
  }, [flatGarmentRows, searchQuery, statusFilter]);

  // Handlers for modal confirms
  const handleConfirmAllocation = (
    indices: number[],
    tailorId: string,
    rate: number,
    expDate: string,
    instructions: string
  ) => {
    if (!allocationModalOrder) return;
    allocateMultipleGarmentsToTailor(allocationModalOrder.order.id, indices, {
      tailorId,
      pieceRate: rate,
      expectedDate: expDate,
      instructions
    });
    setAllocationModalOrder(null);
  };

  const handleConfirmStatus = (
    newStatus: StitchingStatus,
    remarks: string,
    issues: string,
    reworkNotes: string
  ) => {
    if (!statusModalConfig) return;
    updateGarmentStitchingStatus(
      statusModalConfig.order.id,
      statusModalConfig.garmentIndex,
      newStatus,
      remarks,
      reworkNotes
    );
    setStatusModalConfig(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#191C1E] pb-24 pt-4">
      
      {/* Top Banner Header */}
      <div className="bg-[#233B5D] text-white border-b border-[#1b2f4a] shadow-md py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-lg">
              <Users className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Stitching & Tailor Allocation Master
                </h1>
                <span className="bg-[#16834A] text-emerald-100 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Phase 2 • Module A
                </span>
              </div>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                Piece Allocation to Specialist Tailors • Progress Tracking • Piece-Rate Wage Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => checkDbHealth()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/15"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Queue</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Department Sub-Tabs */}
        <div className="bg-white rounded-2xl border border-slate-300 p-1.5 shadow-sm flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'QUEUE'
                ? 'bg-[#233B5D] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stitching Work Queue ({flatGarmentRows.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TAILORS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'TAILORS'
                ? 'bg-[#147D75] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Tailors Directory ({tailors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WAGES')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'WAGES'
                ? 'bg-[#16834A] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Piece-Rate Wage Ledger</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: STITCHING WORK QUEUE */}
        {/* ======================================================== */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-6">
            
            {/* 5 Macro Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              
              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Waiting for Stitching
                </span>
                <div className="text-2xl font-black text-[#233B5D] mt-1">{metrics.waiting}</div>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">Cut cloth ready</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Allocated to Tailors
                </span>
                <div className="text-2xl font-black text-blue-600 mt-1">{metrics.allocated}</div>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">At sewing tables</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Stitching In Progress
                </span>
                <div className="text-2xl font-black text-[#147D75] mt-1">{metrics.inProgress}</div>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">Sewing & hemming</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Ready for QC
                </span>
                <div className="text-2xl font-black text-[#16834A] mt-1">{metrics.readyQc}</div>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">Awaiting inspection</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Completed Today
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{metrics.completedToday}</div>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">Finished output</span>
              </div>

            </div>

            {/* Work Queue Search and Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Bill No, Token, Customer, Tailor, or Garment..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#147D75]"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All Pieces' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'ALLOCATED', label: 'Allocated' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'OVERLOCK', label: 'Overlock' },
                  { id: 'READY_FOR_QC', label: 'Ready QC' },
                  { id: 'ON_HOLD', label: 'On Hold' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === f.id
                        ? 'bg-[#233B5D] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

            </div>

            {/* WORK QUEUE TABLE */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Token & Bill</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Garment Piece</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Assigned Tailor</th>
                      <th className="py-3 px-4">Stitching Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredRows.map(row => {
                      const isAllocated = row.stitchingStatus !== 'WAITING_FOR_STITCHING';

                      return (
                        <tr key={`${row.order.id}-${row.garmentIndex}`} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* Token & Bill */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-slate-400 block">{row.order.serialNumber}</span>
                            <strong className="text-base font-black text-[#233B5D] block">{row.order.id}</strong>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <strong className="text-slate-900 block font-bold">{row.order.customer.customerName}</strong>
                            <span className="text-xs text-slate-500 font-semibold">{row.order.customer.primaryPhone}</span>
                          </td>

                          {/* Garment Piece */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <strong className="text-[#147D75] block font-black">{row.itemTitle}</strong>
                            <span className="text-xs text-slate-500 font-bold uppercase">{row.category}</span>
                          </td>

                          {/* Due Date & Priority */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <strong className="text-red-600 block font-black">{row.dueDate || 'Standard'}</strong>
                            <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              row.priority === 'Express' ? 'bg-red-100 text-red-700' :
                              row.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {row.priority}
                            </span>
                          </td>

                          {/* Assigned Tailor */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {isAllocated ? (
                              <div>
                                <strong className="text-slate-900 font-extrabold block">{row.tailorName}</strong>
                                <span className="text-xs text-emerald-700 font-bold">₹{row.pieceRate} piece rate</span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                                Awaiting Tailor
                              </span>
                            )}
                          </td>

                          {/* Stitching Status Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              row.stitchingStatus === 'READY_FOR_QC' ? 'bg-[#16834A] text-white' :
                              row.stitchingStatus === 'STITCHING_IN_PROGRESS' ? 'bg-[#147D75] text-white' :
                              row.stitchingStatus === 'OVERLOCK_HEMMING_DONE' ? 'bg-indigo-600 text-white' :
                              row.stitchingStatus === 'CUT_PIECES_ALLOCATED' ? 'bg-blue-600 text-white' :
                              row.stitchingStatus === 'ON_HOLD' ? 'bg-red-600 text-white' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {row.stitchingStatus === 'STITCHING_IN_PROGRESS' && <Scissors className="w-3 h-3 animate-spin" />}
                              {row.stitchingStatus === 'READY_FOR_QC' && <CheckCircle2 className="w-3 h-3" />}
                              <span>{row.stitchingStatus.replace(/_/g, ' ')}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              
                              {/* Print Sheet */}
                              <button
                                type="button"
                                onClick={() => setPrintWorksheetConfig({ order: row.order, garmentIndex: row.garmentIndex })}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Print Piece Worksheet"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* WhatsApp Notification */}
                              <button
                                type="button"
                                onClick={() => openWhatsAppModal(row.order, row.stitchingStatus === 'READY_FOR_QC' ? 'STITCHING_COMPLETED' : 'STITCHING_STARTED')}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-700 cursor-pointer transition-all"
                                title="Send WhatsApp Stitching Update"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              {/* Allocate / Reallocate */}
                              <button
                                type="button"
                                onClick={() => setAllocationModalOrder({ order: row.order, garmentIndices: [row.garmentIndex] })}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#233B5D] text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-[#147D75]" />
                                <span>{isAllocated ? 'Reassign' : 'Allocate'}</span>
                              </button>

                              {/* Update Status */}
                              <button
                                type="button"
                                onClick={() => setStatusModalConfig({ order: row.order, garmentIndex: row.garmentIndex })}
                                className="px-3.5 py-1.5 rounded-xl bg-[#233B5D] hover:bg-[#1a2d47] text-white text-xs font-black flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              >
                                <span>Update Status</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}

                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                          No garment pieces found matching current filter or search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MASTER TAILORS DIRECTORY */}
        {/* ======================================================== */}
        {activeTab === 'TAILORS' && (
          <TailorMasterView
            tailors={tailors}
            onAddTailor={addTailor}
            onUpdateTailor={updateTailor}
            onDeleteTailor={deleteTailor}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: PIECE-RATE WAGE LEDGER */}
        {/* ======================================================== */}
        {activeTab === 'WAGES' && (
          <PieceRateWageLedger
            wageSummaries={getTailorWageSummary()}
            allWageEntries={wageEntries}
            paymentRecords={paymentRecords}
            onRecordPayment={recordTailorPayment}
          />
        )}

      </div>

      {/* Allocation Modal */}
      {allocationModalOrder && (
        <StitchingAllocationModal
          isOpen={true}
          order={allocationModalOrder.order}
          tailors={tailors}
          initialGarmentIndices={allocationModalOrder.garmentIndices}
          onConfirm={handleConfirmAllocation}
          onClose={() => setAllocationModalOrder(null)}
        />
      )}

      {/* Status Update Modal */}
      {statusModalConfig && (
        <StitchingStatusUpdateModal
          isOpen={true}
          order={statusModalConfig.order}
          garmentIndex={statusModalConfig.garmentIndex}
          onConfirm={handleConfirmStatus}
          onClose={() => setStatusModalConfig(null)}
        />
      )}

      {/* Print Worksheet Modal */}
      {printWorksheetConfig && (
        <StitchingWorksheetPrint
          order={printWorksheetConfig.order}
          garmentIndex={printWorksheetConfig.garmentIndex}
          onClose={() => setPrintWorksheetConfig(null)}
        />
      )}

    </div>
  );
};
