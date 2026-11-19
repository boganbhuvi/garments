import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { Order, GarmentSpecification, QCInspectionRecord } from '../../types/order';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Flame, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Printer, 
  Ruler, 
  Scissors, 
  ArrowRight,
  Eye,
  MessageSquare
} from 'lucide-react';
import { sortProductionQueue } from '../../utils/capacityEngine';
import { QCInspectionModal } from './QCInspectionModal';
import { GarmentWorksheets } from '../../components/print/GarmentWorksheets';

export const QCDashboard: React.FC = () => {
  const { savedOrders, updateQCStatus, setSelectedDetailOrder, openWhatsAppModal } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'EXPRESS' | 'URGENT' | 'REWORK' | 'PASSED'>('ALL');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedGarmentIdx, setSelectedGarmentIdx] = useState<number>(0);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isWorksheetsOpen, setIsWorksheetsOpen] = useState(false);
  const [worksheetOrder, setWorksheetOrder] = useState<Order | null>(null);

  // Flatten orders into piece-level QC items
  const allQCItems: { order: Order; spec: GarmentSpecification; index: number }[] = [];

  savedOrders.forEach(ord => {
    // Include orders that are either in stitching, in QC, or ready for dispatch
    ord.garmentSpecs.forEach((spec, idx) => {
      allQCItems.push({ order: ord, spec, index: idx });
    });
  });

  // Sort queue by priority: Express > Urgent > Normal, then due date
  const sortedItems = [...allQCItems].sort((a, b) => {
    const priorityRank = { Express: 1, Urgent: 2, Normal: 3 };
    const rankA = priorityRank[a.order.billing.priority] || 3;
    const rankB = priorityRank[b.order.billing.priority] || 3;
    if (rankA !== rankB) return rankA - rankB;

    const dateA = new Date(a.order.billing.dueDate).getTime() || 0;
    const dateB = new Date(b.order.billing.dueDate).getTime() || 0;
    return dateA - dateB;
  });

  // Filter items
  const filteredItems = sortedItems.filter(({ order, spec }) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchSearch =
        order.id.toLowerCase().includes(q) ||
        order.customer.customerName.toLowerCase().includes(q) ||
        order.customer.primaryPhone.includes(q) ||
        spec.title.toLowerCase().includes(q) ||
        (spec.stitchingDetails?.tailorName || '').toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    const qcStatus = spec.qcDetails?.status || 'PENDING';

    if (filterType === 'PENDING') return qcStatus === 'PENDING';
    if (filterType === 'EXPRESS') return order.billing.priority === 'Express';
    if (filterType === 'URGENT') return order.billing.priority === 'Urgent';
    if (filterType === 'REWORK') return qcStatus === 'REWORK_REQUIRED';
    if (filterType === 'PASSED') return qcStatus === 'PASSED';
    return true;
  });

  // Top Metrics
  const totalCount = allQCItems.length;
  const passedCount = allQCItems.filter(i => i.spec.qcDetails?.status === 'PASSED').length;
  const reworkCount = allQCItems.filter(i => i.spec.qcDetails?.status === 'REWORK_REQUIRED').length;
  const pendingCount = allQCItems.filter(i => !i.spec.qcDetails || i.spec.qcDetails.status === 'PENDING').length;
  const expressCount = allQCItems.filter(i => i.order.billing.priority === 'Express').length;

  const handleOpenInspection = (ord: Order, idx: number) => {
    setSelectedOrder(ord);
    setSelectedGarmentIdx(idx);
    setIsInspectionModalOpen(true);
  };

  const handleOpenWorksheet = (ord: Order) => {
    setWorksheetOrder(ord);
    setIsWorksheetsOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">
              Giriraj Garments Workshop Operations
            </span>
            <h2 className="text-[22px] font-black text-slate-900 leading-tight">
              Quality Control (QC), Fitting Audit & Alterations
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
            Audit Tolerance: ±0.25" (6mm)
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-slate-500">Total Pieces in Queue</span>
          <span className="text-[26px] font-black text-slate-900 mt-1">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-amber-800">Pending Inspection</span>
          <span className="text-[26px] font-black text-amber-900 mt-1">{pendingCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-emerald-800">Passed (Ready for Pickup)</span>
          <span className="text-[26px] font-black text-emerald-900 mt-1">{passedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-red-800">Rework Required</span>
          <span className="text-[26px] font-black text-red-900 mt-1">{reworkCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-xs flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase text-purple-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
            Express VIP Queue
          </span>
          <span className="text-[26px] font-black text-purple-900 mt-1">{expressCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bill #, Customer, Phone, Tailor, or Garment..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pieces ({totalCount})
          </button>
          <button
            onClick={() => setFilterType('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterType('EXPRESS')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'EXPRESS' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Express VIP ({expressCount})
          </button>
          <button
            onClick={() => setFilterType('REWORK')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'REWORK' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            Rework ({reworkCount})
          </button>
          <button
            onClick={() => setFilterType('PASSED')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'PASSED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Passed ({passedCount})
          </button>
        </div>
      </div>

      {/* QC Queue Workstation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[12px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Priority</th>
                <th className="py-3 px-4 font-bold">Bill & Token</th>
                <th className="py-3 px-4 font-bold">Customer Details</th>
                <th className="py-3 px-4 font-bold">Garment Piece & Style</th>
                <th className="py-3 px-4 font-bold">Tailor Assigned</th>
                <th className="py-3 px-4 font-bold">Due Date</th>
                <th className="py-3 px-4 font-bold text-center">QC Status</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    No garments found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ order, spec, index }) => {
                  const qc = spec.qcDetails;
                  const isExpress = order.billing.priority === 'Express';
                  const isUrgent = order.billing.priority === 'Urgent';

                  return (
                    <tr
                      key={`${order.id}-${index}`}
                      className={`hover:bg-slate-50 transition-colors ${
                        isExpress ? 'bg-purple-50/20' : ''
                      }`}
                    >
                      {/* Priority Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded ${
                          isExpress
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isExpress && <Flame className="w-3 h-3 text-purple-700 fill-purple-700" />}
                          {isUrgent && <Clock className="w-3 h-3 text-amber-700" />}
                          {order.billing.priority}
                        </span>
                      </td>

                      {/* Bill & Token */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 block">{order.id}</span>
                        <span className="text-[11px] text-slate-500 font-medium">Token: {order.serialNumber}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{order.customer.customerName}</strong>
                        <span className="text-[11px] text-slate-500">+91 {order.customer.primaryPhone}</span>
                      </td>

                      {/* Garment Piece */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{spec.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {spec.garmentType} • {spec.sleeveType} • Fit: {spec.fitting}
                        </div>
                      </td>

                      {/* Tailor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {spec.stitchingDetails?.tailorName || '— Unassigned —'}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-800 block">{order.billing.dueDate}</span>
                      </td>

                      {/* QC Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {qc?.status === 'PASSED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Passed QC
                          </span>
                        ) : qc?.status === 'REWORK_REQUIRED' ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
                            <RotateCcw className="w-3.5 h-3.5 text-red-700" />
                            Rework: {qc.reworkDepartment || 'Workshop'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Pending Audit
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenInspection(order, index)}
                            className="px-3 py-1.5 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Audit Piece</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenWorksheet(order)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Print Technical Worksheets for this garment"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openWhatsAppModal(order, 'QC_COMPLETED')}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                            title="Send WhatsApp QC Notification"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QC Inspection Modal */}
      {selectedOrder && (
        <QCInspectionModal
          order={selectedOrder}
          garmentIndex={selectedGarmentIdx}
          isOpen={isInspectionModalOpen}
          onClose={() => setIsInspectionModalOpen(false)}
          onSaveQC={updateQCStatus}
        />
      )}

      {/* Garment Worksheets Print Modal */}
      {worksheetOrder && (
        <GarmentWorksheets
          order={worksheetOrder}
          isOpen={isWorksheetsOpen}
          onClose={() => setIsWorksheetsOpen(false)}
        />
      )}

    </div>
  );
};
