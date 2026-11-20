import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { Search, IndianRupee, CheckCircle2, Clock } from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { savedOrders, setSelectedDetailOrder } = useOrder();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  const totalSales = savedOrders.reduce((acc, o) => acc + (o.billing?.grandTotal || 0), 0);
  const totalCollected = savedOrders.reduce((acc, o) => acc + (o.billing?.amountPaid || 0), 0);
  const totalOutstanding = savedOrders.reduce((acc, o) => acc + Math.max(0, o.billing?.balanceAmount || 0), 0);

  const filtered = savedOrders.filter((ord) => {
    const q = search.toLowerCase().trim();
    const matchQ =
      !q ||
      ord.id.toLowerCase().includes(q) ||
      (ord.customer.billNumber || '').toLowerCase().includes(q) ||
      ord.customer.customerName.toLowerCase().includes(q) ||
      ord.customer.primaryPhone.includes(q);

    const bal = ord.billing?.balanceAmount || 0;
    const matchF =
      filter === 'ALL' || (filter === 'PENDING' && bal > 0) || (filter === 'PAID' && bal <= 0);
    return matchQ && matchF;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-[#233B5D] text-white rounded-2xl p-6">
        <h1 className="text-2xl font-black">Accounts &amp; Payment Ledger</h1>
        <p className="text-sm text-slate-300 mt-0.5">
          Real-time billing totals, advance collections, and outstanding balances derived from orders
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-5">
          <span className="text-xs font-bold uppercase text-slate-400">Total Billed Value</span>
          <p className="text-3xl font-black text-[#191C1E] mt-1 flex items-center">
            <IndianRupee className="w-6 h-6" />
            {totalSales.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <span className="text-xs font-bold uppercase text-emerald-700">Amount Collected</span>
          <p className="text-3xl font-black text-emerald-700 mt-1 flex items-center">
            <IndianRupee className="w-6 h-6" />
            {totalCollected.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-5">
          <span className="text-xs font-bold uppercase text-amber-700">Outstanding Balance</span>
          <p className="text-3xl font-black text-amber-700 mt-1 flex items-center">
            <IndianRupee className="w-6 h-6" />
            {totalOutstanding.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill #, Order ID, Customer Name, or Mobile..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE4EE] text-sm font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'PAID'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer ${
                filter === f ? 'bg-[#233B5D] text-white' : 'bg-white border border-[#DCE4EE] text-slate-600'
              }`}
            >
              {f === 'ALL' ? 'All Orders' : f === 'PENDING' ? 'Balance Due' : 'Fully Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#DCE4EE] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#DCE4EE] text-xs font-black uppercase text-slate-500">
              <th className="p-3.5">Bill / Order #</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Mode</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Paid</th>
              <th className="p-3.5">Balance</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((ord) => {
              const total = ord.billing?.grandTotal || 0;
              const paid = ord.billing?.amountPaid || 0;
              const bal = ord.billing?.balanceAmount || 0;
              return (
                <tr
                  key={ord.id}
                  onClick={() => setSelectedDetailOrder(ord)}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="p-3.5 font-black text-[#233B5D]">
                    {ord.customer.billNumber || ord.id}
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-[#191C1E]">{ord.customer.customerName}</p>
                    <p className="text-xs text-slate-400">{ord.customer.customerId}</p>
                  </td>
                  <td className="p-3.5 text-xs font-bold text-slate-600">{ord.billing?.paymentMethod || 'CASH'}</td>
                  <td className="p-3.5 font-bold">₹{total}</td>
                  <td className="p-3.5 font-bold text-emerald-700">₹{paid}</td>
                  <td className="p-3.5 font-black text-amber-700">₹{bal}</td>
                  <td className="p-3.5">
                    {bal <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Due
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
