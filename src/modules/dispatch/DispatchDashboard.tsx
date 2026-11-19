import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { Order, DispatchRecord } from '../../types/order';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Search, 
  Printer, 
  MessageSquare, 
  IndianRupee, 
  AlertTriangle,
  Send,
  Eye,
  CheckCheck
} from 'lucide-react';
import { DispatchHandoverModal } from './DispatchHandoverModal';
import { SinglePageCustomerReceipt } from '../../components/print/SinglePageCustomerReceipt';
import { sendWhatsAppNotification, generateOrderConfirmationWhatsAppMessage } from '../../services/whatsappService';

export const DispatchDashboard: React.FC = () => {
  const { savedOrders, recordDispatch, setSelectedDetailOrder, openWhatsAppModal } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'READY' | 'PENDING_BALANCE' | 'DELIVERED'>('READY');

  const [selectedOrderForHandover, setSelectedOrderForHandover] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  // Filter orders
  const filteredOrders = savedOrders.filter(ord => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        ord.id.toLowerCase().includes(q) ||
        ord.customer.customerName.toLowerCase().includes(q) ||
        ord.customer.primaryPhone.includes(q) ||
        ord.serialNumber.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterType === 'READY') return ord.status !== 'DELIVERED';
    if (filterType === 'PENDING_BALANCE') return ord.billing.balanceAmount > 0;
    if (filterType === 'DELIVERED') return ord.status === 'DELIVERED';
    return true;
  });

  // Sort: Express first, then urgent, then due date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const rank = { Express: 1, Urgent: 2, Normal: 3 };
    const rankA = rank[a.billing.priority] || 3;
    const rankB = rank[b.billing.priority] || 3;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(a.billing.dueDate).getTime() - new Date(b.billing.dueDate).getTime();
  });

  // Top Metrics
  const readyCount = savedOrders.filter(o => o.status !== 'DELIVERED').length;
  const deliveredCount = savedOrders.filter(o => o.status === 'DELIVERED').length;
  const totalBalanceDue = savedOrders
    .filter(o => o.status !== 'DELIVERED')
    .reduce((sum, o) => sum + (o.billing.balanceAmount || 0), 0);
  const expressReadyCount = savedOrders
    .filter(o => o.status !== 'DELIVERED' && o.billing.priority === 'Express').length;

  const handleOpenHandover = (ord: Order) => {
    setSelectedOrderForHandover(ord);
    setIsHandoverModalOpen(true);
  };

  const handleSendWhatsApp = (ord: Order) => {
    openWhatsAppModal(ord, 'READY_FOR_PICKUP');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
            <Package className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">
              Store Counter Operations
            </span>
            <h2 className="text-[22px] font-black text-slate-900 leading-tight">
              Dispatch, Trial Handover & Counter Settlement
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] bg-purple-50 text-purple-900 font-bold px-3 py-1.5 rounded-lg border border-purple-200">
            Total Outstanding Balance: ₹{totalBalanceDue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-slate-500">Ready for Customer Pickup</span>
          <span className="text-[26px] font-black text-slate-900 mt-1">{readyCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-red-800">Pending Balance at Handover</span>
          <span className="text-[26px] font-black text-red-900 mt-1">₹{totalBalanceDue.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-purple-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
            Express VIP Orders
          </span>
          <span className="text-[26px] font-black text-purple-900 mt-1">{expressReadyCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold uppercase text-emerald-800">Completed & Delivered</span>
          <span className="text-[26px] font-black text-emerald-900 mt-1">{deliveredCount}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bill #, Customer Name, or Phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('READY')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'READY' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ready for Pickup ({readyCount})
          </button>
          <button
            onClick={() => setFilterType('PENDING_BALANCE')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'PENDING_BALANCE' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            Balance Due
          </button>
          <button
            onClick={() => setFilterType('DELIVERED')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'DELIVERED' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Delivered Archive ({deliveredCount})
          </button>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              filterType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[12px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Priority</th>
                <th className="py-3 px-4 font-bold">Bill & Token</th>
                <th className="py-3 px-4 font-bold">Customer Details</th>
                <th className="py-3 px-4 font-bold">Garments</th>
                <th className="py-3 px-4 font-bold">Due Date</th>
                <th className="py-3 px-4 font-bold">Financial Balance</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((ord) => {
                  const isExpress = ord.billing.priority === 'Express';
                  const isUrgent = ord.billing.priority === 'Urgent';
                  const isDelivered = ord.status === 'DELIVERED';
                  const balance = ord.billing.balanceAmount || 0;

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isExpress ? 'bg-purple-50/20' : ''
                      }`}
                    >
                      {/* Priority */}
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
                          {ord.billing.priority}
                        </span>
                      </td>

                      {/* Bill & Token */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 block">{ord.id}</span>
                        <span className="text-[11px] text-slate-500 font-medium">Token: {ord.serialNumber}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{ord.customer.customerName}</strong>
                        <span className="text-[11px] text-slate-500">+91 {ord.customer.primaryPhone}</span>
                      </td>

                      {/* Garments */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ord.garmentSpecs.length} Pieces</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {ord.garmentSpecs.map(g => g.title).join(', ')}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <strong className="text-emerald-800 block">{ord.billing.dueDate}</strong>
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {balance === 0 ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[12px]">
                            <CheckCheck className="w-4 h-4" /> Paid Full
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-red-700 font-extrabold text-[14px]">
                              ₹{balance.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">Collect at Counter</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            DELIVERED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
                            <Package className="w-3.5 h-3.5 text-purple-700" />
                            Ready for Pickup
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isDelivered ? (
                            <button
                              type="button"
                              onClick={() => handleOpenHandover(ord)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[12px] flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>Handover</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Delivered</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(ord)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Send WhatsApp Ready Notification"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedDetailOrder(ord)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Handover Modal */}
      {selectedOrderForHandover && (
        <DispatchHandoverModal
          order={selectedOrderForHandover}
          isOpen={isHandoverModalOpen}
          onClose={() => setIsHandoverModalOpen(false)}
          onConfirmHandover={recordDispatch}
        />
      )}

    </div>
  );
};
