import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, CheckCircle2, Circle, Package, Loader2 } from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderId?: string;
}

interface TrackedOrder {
  orderId: string;
  billNumber?: string;
  status: string;
  productionStatus?: string;
  fulfillmentStatus?: string;
  orderDate?: string;
  dueDate?: string;
  itemCount?: number;
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

function getStageIndex(order: TrackedOrder): number {
  const f = (order.fulfillmentStatus || '').toUpperCase();
  const p = (order.productionStatus || '').toUpperCase();
  const s = (order.status || '').toUpperCase();

  if (f === 'DELIVERED' || f === 'DISPATCHED' || s === 'DELIVERED' || s === 'DISPATCHED' || s === 'COMPLETED') {
    return 6;
  }
  if (f === 'READY_FOR_DISPATCH' || f === 'READY_FOR_PICKUP' || s === 'READY_FOR_DISPATCH' || s === 'READY_FOR_TRIAL') {
    return 5;
  }
  if (p === 'QC_APPROVED' || p === 'AWAITING_QC' || p === 'REWORK' || s === 'IN_QC' || s === 'READY_FOR_QC') {
    return 4;
  }
  if (p === 'STITCHING' || p === 'AWAITING_STITCHING' || s === 'IN_STITCHING') {
    return 3;
  }
  if (p === 'CUTTING' || p === 'AWAITING_CUTTING' || s === 'IN_CUTTING' || s === 'READY_FOR_CUTTING') {
    return 2;
  }
  if (s === 'CONFIRMED' || s === 'ORDER_CONFIRMED' || s === 'DRAFT') {
    return 1;
  }
  return 0;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderId }) => {
  const [query, setQuery] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<TrackedOrder | null>(null);
  const [searchedQuery, setSearchedQuery] = useState('');

  const handleTrack = async (qValue: string) => {
    const trimmed = qValue.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setSearchedQuery(trimmed);
    const res = await api.trackPublicOrder(trimmed);
    setLoading(false);
    if (res.ok && res.order) {
      setMatchedOrder(res.order);
    } else {
      setMatchedOrder(null);
      setError(res.error || 'No order found.');
    }
  };

  useEffect(() => {
    if (initialOrderId && initialOrderId.trim()) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const activeStageIdx = matchedOrder ? getStageIndex(matchedOrder) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Live Workshop Status</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
          Track Your Order
        </h1>
        <p className="text-sm text-[#57534E] mt-2">
          Enter your Order ID or Bill Number to view current production progress.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleTrack(query);
        }}
        className="relative max-w-lg mx-auto mb-10 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#78716C] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. GG-2025-0851"
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-[#D6D3D1] focus:border-[#7F1D1D] focus:outline-none text-sm shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold hover:bg-[#651515] disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
        </button>
      </form>

      {!loading && searchedQuery && !matchedOrder && (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 text-center">
          <Package className="w-10 h-10 text-[#A8A29E] mx-auto mb-2" />
          <p className="font-semibold text-[#1C1917]">No order found for "{searchedQuery}"</p>
          <p className="text-xs text-[#57534E] mt-1">{error || 'Please verify your Order ID or Bill Number.'}</p>
        </div>
      )}

      {matchedOrder && (
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E4]">
            <div>
              <span className="text-xs font-bold uppercase text-[#7F1D1D]">
                Order #{matchedOrder.billNumber || matchedOrder.orderId}
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                Production Status {matchedOrder.itemCount ? `(${matchedOrder.itemCount} Garments)` : ''}
              </h2>
              <p className="text-xs text-[#57534E] mt-0.5">
                {matchedOrder.orderDate ? `Order Date: ${matchedOrder.orderDate}` : 'Active Workshop Order'}
                {matchedOrder.dueDate ? ` · Expected Delivery: ${matchedOrder.dueDate}` : ''}
              </p>
            </div>
            <span className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[#7F1D1D]/10 text-[#7F1D1D] text-xs font-bold uppercase">
              {(matchedOrder.productionStatus || matchedOrder.status).replace(/_/g, ' ')}
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
