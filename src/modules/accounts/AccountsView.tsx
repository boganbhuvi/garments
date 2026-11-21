import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext';
import { api } from '../../services/api';
import { Order } from '../../types/order';
import { Search, IndianRupee, CheckCircle2, Clock, PlusCircle, History } from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { savedOrders, setSelectedDetailOrder, showToast } = useOrder();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [payments, setPayments] = useState<any[]>([]);
  const [payModalOrder, setPayModalOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState<'ADVANCE' | 'PARTIAL' | 'FINAL'>('PARTIAL');
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'>('CASH');
  const [payRef, setPayRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadPayments = async () => {
    const list = await api.getPayments();
    if (list && Array.isArray(list)) {
      setPayments(list);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalOrder) return;
    const num = Number(payAmount);
    if (!Number.isFinite(num) || num <= 0) {
      setPayError('Enter a valid positive payment amount.');
      return;
    }
    setSubmitting(true);
    setPayError(null);
    const res = await api.recordPayment({
      orderId: payModalOrder.id,
      amount: num,
      paymentType: payType,
      paymentMethod: payMethod,
      transactionReference: payRef.trim(),
    });
    setSubmitting(false);

    if (!res.ok) {
      setPayError(res.error || 'Could not record payment.');
      return;
    }

    showToast(`✓ Recorded ₹${num.toLocaleString('en-IN')} payment for ${payModalOrder.id}`, 'success');
    setPayModalOrder(null);
    setPayAmount('');
    setPayRef('');
    await loadPayments();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Accounts &amp; Payment Ledger</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Multi-installment payment transactions, verified balances, and INR collection ledger
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs font-bold uppercase text-slate-400">Total Billed Value</span>
          <p className="text-3xl font-bold text-slate-900 mt-1 flex items-center">
            <IndianRupee className="w-6 h-6" />
            {totalSales.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-5">
          <span className="text-xs font-bold uppercase text-emerald-700">Amount Collected</span>
          <p className="text-3xl font-bold text-emerald-700 mt-1 flex items-center">
            <IndianRupee className="w-6 h-6" />
            {totalCollected.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <span className="text-xs font-bold uppercase text-amber-700">Outstanding Balance</span>
          <p className="text-3xl font-bold text-[#7F1D1D] mt-1 flex items-center">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'PAID'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {f === 'ALL' ? 'All Orders' : f === 'PENDING' ? 'Balance Due' : 'Fully Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <th className="p-3.5">Bill / Order #</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Paid</th>
              <th className="p-3.5">Balance</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((ord) => {
              const total = ord.billing?.grandTotal || 0;
              const paid = ord.billing?.amountPaid || 0;
              const bal = ord.billing?.balanceAmount || 0;
              return (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td
                    onClick={() => setSelectedDetailOrder(ord)}
                    className="p-3.5 font-bold text-[#7F1D1D] cursor-pointer hover:underline"
                  >
                    {ord.customer.billNumber || ord.id}
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900">{ord.customer.customerName}</p>
                    <p className="text-xs text-slate-400">{ord.customer.customerId}</p>
                  </td>
                  <td className="p-3.5 font-semibold">₹{total.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-semibold text-emerald-700">₹{paid.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-bold text-amber-700">₹{bal.toLocaleString('en-IN')}</td>
                  <td className="p-3.5">
                    {bal <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Due
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setPayModalOrder(ord);
                        setPayAmount(bal > 0 ? String(bal) : '');
                        setPayType(bal > 0 && paid > 0 ? 'FINAL' : 'PARTIAL');
                        setPayError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#7F1D1D] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Verified Payment Transactions History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#7F1D1D]" /> Verified Payment Transactions ({payments.length})
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {payments.slice(0, 20).map((p) => (
              <div key={p.paymentId} className="flex items-center justify-between text-xs bg-slate-50 px-3.5 py-2.5 rounded-lg">
                <span>
                  <strong className="text-slate-900">{p.paymentId}</strong> · Order #{p.orderId} ·{' '}
                  <strong className="text-emerald-700">₹{Number(p.amount).toLocaleString('en-IN')}</strong> ({p.paymentType} / {p.paymentMethod})
                </span>
                <span className="text-slate-400">{new Date(p.paymentDate).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Record Payment — #{payModalOrder.customer.billNumber || payModalOrder.id}
            </h2>
            <p className="text-xs text-slate-500">
              Customer: <strong>{payModalOrder.customer.customerName}</strong> · Current Balance: ₹
              {(payModalOrder.billing?.balanceAmount || 0).toLocaleString('en-IN')}
            </p>
            {payError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {payError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Amount (INR) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                <select value={payType} onChange={(e) => setPayType(e.target.value as any)} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
                  <option value="ADVANCE">Advance</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as any)} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Transaction Ref (Optional)</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="UPI / Receipt reference"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPayModalOrder(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-[#7F1D1D] text-white text-sm font-bold cursor-pointer disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
