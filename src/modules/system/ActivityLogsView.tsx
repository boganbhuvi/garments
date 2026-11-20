import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { Activity, UserCheck, BookOpen } from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const { customers, savedOrders, setSelectedDetailOrder } = useOrder();

  const events: {
    id: string;
    module: 'CUSTOMER' | 'ORDER';
    title: string;
    detail: string;
    timestamp: string;
    orderObj?: any;
  }[] = [];

  customers.forEach((c) => {
    (c.history || []).forEach((h, i) => {
      events.push({
        id: `cust-${c.customerId}-${i}`,
        module: 'CUSTOMER',
        title: `Customer ${h.action}: ${c.customerName} (${c.customerId})`,
        detail: h.note || 'Customer profile event',
        timestamp: h.timestamp,
      });
    });
  });

  savedOrders.forEach((o) => {
    events.push({
      id: `ord-${o.id}`,
      module: 'ORDER',
      title: `Order #${o.customer.billNumber || o.id} — ${o.status.replace(/_/g, ' ')}`,
      detail: `Customer: ${o.customer.customerName} (${o.customer.customerId}) · Total: ₹${o.billing?.grandTotal || 0}`,
      timestamp: o.updatedAt || o.createdAt || new Date().toISOString(),
      orderObj: o,
    });
  });

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-[#233B5D] text-white rounded-2xl p-6">
        <h1 className="text-2xl font-black flex items-center gap-2.5">
          <Activity className="w-6 h-6" />
          <span>System Activity &amp; Audit Logs</span>
        </h1>
        <p className="text-sm text-slate-300 mt-0.5">
          Traceable timeline of customer registrations, profile updates, and order lifecycle events
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE4EE] divide-y divide-slate-100">
        {events.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-semibold">No activity recorded yet.</div>
        ) : (
          events.slice(0, 60).map((ev) => (
            <div
              key={ev.id}
              onClick={() => ev.orderObj && setSelectedDetailOrder(ev.orderObj)}
              className={`p-4 flex items-start justify-between gap-4 ${
                ev.orderObj ? 'hover:bg-slate-50 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ev.module === 'CUSTOMER'
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-blue-50 text-[#233B5D]'
                  }`}
                >
                  {ev.module === 'CUSTOMER' ? <UserCheck className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-black text-[#191C1E]">{ev.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ev.detail}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {new Date(ev.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
