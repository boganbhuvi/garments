import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Search, CheckCircle2, Circle, Package } from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderId?: string;
}

const STAGES = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Order Confirmed' },
  { key: 'CUTTING', label: 'Cutting' },
  { key: 'STITCHING', label: 'Stitching' },
  { key: 'QC', label: 'Quality Check' },
  { key: 'DISPATCH', label: 'Ready for Dispatch / Pickup' },
  { key: 'COMPLETED', label: 'Completed' },
];

function getStageIndex(status: string): number {
  switch (status) {
    case 'ORDER_CONFIRMED':
    case 'DRAFT':
      return 1;
    case 'READY_FOR_CUTTING':
    case 'IN_CUTTING':
      return 2;
    case 'IN_STITCHING':
      return 3;
    case 'READY_FOR_QC':
    case 'IN_QC':
      return 4;
    case 'READY_FOR_TRIAL':
    case 'READY_FOR_DISPATCH':
      return 5;
    case 'DISPATCHED':
    case 'DELIVERED':
    case 'COMPLETED':
      return 6;
    default:
      return 0;
  }
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderId }) => {
  const { savedOrders } = useOrder();
  const [query, setQuery] = useState(initialOrderId || '');

  const q = query.trim().toLowerCase();
  const matchedOrder = q
    ? savedOrders.find(
        (o) =>
          o.id.toLowerCase() === q ||
          (o.customer.billNumber || '').toLowerCase() === q ||
          (o.customer.primaryPhone || '').includes(q)
      )
    : null;

  const activeStageIdx = matchedOrder ? getStageIndex(matchedOrder.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Live Workshop Status</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
          Track Your Order
        </h1>
        <p className="text-sm text-[#57534E] mt-2">
          Enter your Order / Bill Number or registered Mobile Number to view current production progress.
        </p>
      </div>

      <div className="relative max-w-lg mx-auto mb-10">
        <Search className="w-5 h-5 text-[#78716C] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. GG-2025-0851 or 9876543210"
          className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-[#D6D3D1] focus:border-[#7F1D1D] focus:outline-none text-sm shadow-sm"
        />
      </div>

      {q && !matchedOrder && (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 text-center">
          <Package className="w-10 h-10 text-[#A8A29E] mx-auto mb-2" />
          <p className="font-semibold text-[#1C1917]">No order found for "{query}"</p>
          <p className="text-xs text-[#57534E] mt-1">Please verify your Bill Number or Mobile Number.</p>
        </div>
      )}

      {matchedOrder && (
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E4]">
            <div>
              <span className="text-xs font-bold uppercase text-[#7F1D1D]">
                Order #{matchedOrder.customer.billNumber || matchedOrder.id}
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                {matchedOrder.customer.customerName}
              </h2>
              <p className="text-xs text-[#57534E] mt-0.5">
                Order Date: {matchedOrder.customer.date}
                {matchedOrder.billing?.dueDate ? ` · Expected Delivery: ${matchedOrder.billing.dueDate}` : ''}
              </p>
            </div>
            <span className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[#7F1D1D]/10 text-[#7F1D1D] text-xs font-bold uppercase">
              {matchedOrder.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* 7-Stage Visual Timeline */}
          <div className="space-y-4">
            {STAGES.map((stage, idx) => {
              const done = idx <= activeStageIdx;
              return (
                <div key={stage.key} className="flex items-center gap-4">
                  {done ? (
                    <CheckCircle2 className="w-6 h-6 text-[#7F1D1D] flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#D6D3D1] flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${done ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                      {stage.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
