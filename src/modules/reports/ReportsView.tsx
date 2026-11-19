import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Printer, 
  IndianRupee, 
  Scissors, 
  Users, 
  ShieldCheck, 
  Package,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { savedOrders, tailors } = useOrder();
  const [reportType, setReportType] = useState<'OVERVIEW' | 'FINANCIAL' | 'PRODUCTION' | 'TAILORS'>('OVERVIEW');

  // Compute key totals
  const totalOrders = savedOrders.length;
  const totalBilled = savedOrders.reduce((sum, o) => sum + (o.billing?.grandTotal || 0), 0);
  const totalAdvance = savedOrders.reduce((sum, o) => sum + (o.billing?.advanceAmount || 0), 0);
  const totalBalance = savedOrders.reduce((sum, o) => sum + (o.billing?.balanceAmount || 0), 0);

  const completedOrders = savedOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
  const inCuttingOrders = savedOrders.filter(o => o.status === 'IN_CUTTING' || o.status === 'READY_FOR_CUTTING').length;
  const inStitchingOrders = savedOrders.filter(o => o.status === 'IN_STITCHING').length;
  const inQcOrders = savedOrders.filter(o => o.status === 'READY_FOR_QC' || o.status === 'IN_QC').length;

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Serial No', 'Customer Name', 'Phone', 'Order Date', 'Due Date', 'Priority', 'Status', 'Grand Total', 'Advance', 'Balance'];
    const rows = savedOrders.map(o => [
      o.id,
      o.serialNumber,
      `"${o.customer.customerName}"`,
      o.customer.primaryPhone,
      o.billing.orderDate,
      o.billing.dueDate,
      o.billing.priority,
      o.status,
      o.billing.grandTotal,
      o.billing.advanceAmount,
      o.billing.balanceAmount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `giriraj_garments_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      
      {/* Top Banner */}
      <div className="bg-[#233B5D] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-lg">
            <BarChart3 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Operations & Financial Audit Reports
              </h1>
              <span className="bg-[#147D75] text-[#99F2E8] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Audit
              </span>
            </div>
            <p className="text-sm text-slate-300 font-semibold mt-0.5">
              Production pipeline velocity, cashflow ledger, tailor piece-rate metrics, and delivery performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#147D75] hover:bg-[#0E605A] text-white font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Orders</span>
          <strong className="text-3xl font-black text-[#233B5D]">{totalOrders}</strong>
          <span className="text-xs text-slate-500 font-semibold">{completedOrders} Delivered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Gross Billed</span>
          <strong className="text-3xl font-black text-[#147D75]">₹{totalBilled.toLocaleString('en-IN')}</strong>
          <span className="text-xs text-slate-500 font-semibold">Stitching & Add-ons</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Advance Collected</span>
          <strong className="text-3xl font-black text-[#16834A]">₹{totalAdvance.toLocaleString('en-IN')}</strong>
          <span className="text-xs text-slate-500 font-semibold">Cash & UPI</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Outstanding Balance</span>
          <strong className="text-3xl font-black text-amber-600">₹{totalBalance.toLocaleString('en-IN')}</strong>
          <span className="text-xs text-slate-500 font-semibold">Payable on delivery</span>
        </div>
      </div>

      {/* Pipeline Status Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-xl font-black text-[#233B5D] border-b border-slate-200 pb-3">
          Departmental Production Pipeline Status
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-blue-700">1. Cutting Queue</span>
              <div className="text-2xl font-black text-blue-900 mt-1">{inCuttingOrders}</div>
            </div>
            <Scissors className="w-8 h-8 text-blue-400" />
          </div>

          <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-teal-700">2. Stitching Active</span>
              <div className="text-2xl font-black text-teal-900 mt-1">{inStitchingOrders}</div>
            </div>
            <Users className="w-8 h-8 text-teal-400" />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-emerald-700">3. QC Inspection</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">{inQcOrders}</div>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-purple-700">4. Completed / Ready</span>
              <div className="text-2xl font-black text-purple-900 mt-1">{completedOrders}</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Orders Ledger Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#233B5D]">Comprehensive Order Register</h3>
          <span className="text-xs font-bold text-slate-500">{savedOrders.length} records</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Serial & Bill</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {savedOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#233B5D]">{o.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{o.customer.customerName}</td>
                  <td className="py-3 px-4 text-slate-600">+91 {o.customer.primaryPhone}</td>
                  <td className="py-3 px-4 text-red-600 font-bold">{o.billing.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-700">
                      {o.billing.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-black uppercase text-[#147D75]">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{o.billing.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-black text-amber-600">₹{o.billing.balanceAmount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
