import React, { useState, useMemo } from 'react';
import { useOrder } from '../../context/OrderContext';
import {
  BookOpen,
  Search,
  Trash2,
  ArrowUpRight,
  PlusCircle,
  Calendar,
  IndianRupee,
  Scissors,
  Eye,
} from 'lucide-react';
import { OrderStatus } from '../../types/order';

export const OrdersManagementView: React.FC = () => {
  const {
    savedOrders,
    order: currentOrder,
    loadOrder,
    deleteOrder,
    createNewOrder,
    setSelectedDetailOrder,
    setActiveModule,
    setCurrentStep,
  } = useOrder();

  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return savedOrders.filter((o) => {
      if (filter !== 'ALL' && o.status !== filter) return false;
      if (!q) return true;
      return (
        (o.id || '').toLowerCase().includes(q) ||
        (o.serialNumber || '').toLowerCase().includes(q) ||
        (o.customer?.customerName || '').toLowerCase().includes(q) ||
        (o.customer?.primaryPhone || '').includes(q) ||
        (o.customer?.customerId || '').toLowerCase().includes(q)
      );
    });
  }, [savedOrders, filter, searchQuery]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'IN_CUTTING':
        return (
          <span className="bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            In Cutting
          </span>
        );
      case 'IN_STITCHING':
        return (
          <span className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            In Stitching
          </span>
        );
      case 'READY_FOR_TRIAL':
        return (
          <span className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            Ready For Trial
          </span>
        );
      case 'COMPLETED':
      case 'DELIVERED':
        return (
          <span className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            Completed
          </span>
        );
      case 'NEW':
      default:
        return (
          <span className="bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            New Order
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#233B5D] text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#191C1E] leading-tight">Orders Master Ledger</h1>
            <p className="text-xs font-semibold text-slate-500">
              Showing {filteredOrders.length} of {savedOrders.length} order{savedOrders.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            createNewOrder();
            setCurrentStep(1);
            setActiveModule('FRONT_DESK');
          }}
          className="min-h-[42px] px-4 rounded-xl bg-[#147D75] hover:bg-[#0E605A] text-white font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Order</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'NEW', 'IN_CUTTING', 'IN_STITCHING', 'READY_FOR_TRIAL', 'DELIVERED', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#233B5D] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order #, Customer, Mobile..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-[#147D75] focus:outline-none text-sm font-semibold text-[#191C1E]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Full-Page Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-200">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((ord) => {
            const totalItems = ord.garmentQuantities.reduce((sum, g) => sum + g.quantity, 0);
            const isCurrent = ord.id === currentOrder.id;

            return (
              <div
                key={ord.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isCurrent ? 'bg-[#F0FDFA]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-lg font-black text-[#233B5D]">#{ord.id}</span>
                    {ord.serialNumber && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                        {ord.serialNumber}
                      </span>
                    )}
                    {getStatusBadge(ord.status)}
                    {isCurrent && (
                      <span className="text-xs bg-[#147D75] text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
                        Currently Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-base font-bold text-[#191C1E]">
                    <span>{ord.customer.customerName || 'Unnamed Customer'}</span>
                    <span className="text-sm text-slate-500 font-normal">
                      ({ord.customer.primaryPhone || 'No mobile'})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Due: <strong className="text-[#191C1E]">{ord.billing.dueDate || '—'}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-4 h-4 text-[#147D75]" />
                      <strong>{totalItems} Items</strong> in manifest
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-[#233B5D]">
                      <IndianRupee className="w-3.5 h-3.5" />
                      Total: ₹{(ord.billing.grandTotal || 0).toLocaleString('en-IN')} (Adv: ₹
                      {(ord.billing.advanceAmount || 0).toLocaleString('en-IN')} | Bal: ₹
                      {(ord.billing.balanceAmount || 0).toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailOrder(ord)}
                    className="min-h-[40px] px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Inspect full details, timeline & measurements"
                  >
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadOrder(ord.id);
                      setActiveModule('FRONT_DESK');
                    }}
                    className="min-h-[40px] px-4 rounded-xl bg-[#233B5D] hover:bg-[#1A2C46] text-white text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Load Order</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {savedOrders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteOrder(ord.id)}
                      className="w-10 h-10 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-500 font-medium">
            No orders found matching your search or filter.
          </div>
        )}
      </div>
    </div>
  );
};
