import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { BookOpen, X, Trash2, ArrowUpRight, PlusCircle, Calendar, IndianRupee, Scissors, Eye } from 'lucide-react';
import { OrderStatus } from '../types/order';

interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({ isOpen, onClose }) => {
  const { savedOrders, order: currentOrder, loadOrder, deleteOrder, createNewOrder, setSelectedDetailOrder } = useOrder();
  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');

  if (!isOpen) return null;

  const filteredOrders = savedOrders.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'IN_CUTTING':
        return <span className="bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] px-2 py-0.5 rounded text-[12px] font-bold uppercase">In Cutting</span>;
      case 'IN_STITCHING':
        return <span className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-2 py-0.5 rounded text-[12px] font-bold uppercase">In Stitching</span>;
      case 'READY_FOR_TRIAL':
        return <span className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] px-2 py-0.5 rounded text-[12px] font-bold uppercase">Ready For Trial</span>;
      case 'COMPLETED':
      case 'DELIVERED':
        return <span className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-2 py-0.5 rounded text-[12px] font-bold uppercase">Completed</span>;
      case 'NEW':
      default:
        return <span className="bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] px-2 py-0.5 rounded text-[12px] font-bold uppercase">New Order</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#233B5D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#99F2E8]" />
            <h2 className="text-[20px] font-bold">Orders Master Book (LocalStorage Ledger)</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'NEW', 'IN_CUTTING', 'READY_FOR_TRIAL', 'DELIVERED'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition-colors ${
                  filter === tab
                    ? 'bg-[#233B5D] text-white shadow-sm'
                    : 'bg-white text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                }`}
              >
                {tab === 'ALL' ? 'All Orders' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              createNewOrder();
              onClose();
            }}
            className="min-h-[40px] px-3.5 rounded-lg bg-[#147D75] hover:bg-[#0E605A] text-white font-bold text-[14px] flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Order</span>
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-[#E2E8F0]">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((ord) => {
              const totalItems = ord.garmentQuantities.reduce((sum, g) => sum + g.quantity, 0);
              const isCurrent = ord.id === currentOrder.id;

              return (
                <div
                  key={ord.id}
                  className={`py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xl transition-colors ${
                    isCurrent ? 'bg-[#F0FDFA] border-2 border-[#147D75]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[18px] font-bold text-[#233B5D]">
                        #{ord.id}
                      </span>
                      <span className="text-[13px] bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded font-mono font-bold">
                        {ord.serialNumber}
                      </span>
                      {getStatusBadge(ord.status)}
                      {isCurrent && (
                        <span className="text-[12px] bg-[#147D75] text-white px-2 py-0.5 rounded font-bold uppercase">
                          Currently Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[17px] font-semibold text-[#191C1E]">
                      <span>{ord.customer.customerName || 'Unnamed Customer'}</span>
                      <span className="text-[14px] text-[#64748B] font-normal">
                        ({ord.customer.primaryPhone})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[#64748B]" />
                        Due: <strong className="text-[#191C1E]">{ord.billing.dueDate}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Scissors className="w-4 h-4 text-[#147D75]" />
                        <strong>{totalItems} Items</strong> in manifest
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-[#233B5D]">
                        <IndianRupee className="w-3.5 h-3.5" />
                        Total: ₹{ord.billing.grandTotal.toLocaleString('en-IN')} (Adv: ₹{ord.billing.advanceAmount.toLocaleString('en-IN')} | Bal: ₹{ord.billing.balanceAmount.toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDetailOrder(ord);
                        onClose();
                      }}
                      className="min-h-[42px] px-3.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-[14px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Inspect full details, timeline & measurements"
                    >
                      <Eye className="w-4 h-4 text-sky-600" />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        loadOrder(ord.id);
                        onClose();
                      }}
                      className="min-h-[42px] px-4 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white text-[15px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Load Order</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    {savedOrders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteOrder(ord.id)}
                        className="w-10 h-10 rounded-lg border border-[#D64545] text-[#D64545] hover:bg-[#FFDAD6] flex items-center justify-center transition-colors"
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
            <div className="py-12 text-center text-[#64748B]">
              No orders found matching the selected filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F1F5F9] border-t border-[#CBD5E1] flex items-center justify-between">
          <span className="text-[14px] text-[#64748B]">
            Total {savedOrders.length} order{savedOrders.length === 1 ? '' : 's'} stored locally
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#233B5D] font-bold text-[15px]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
