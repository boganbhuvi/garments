import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { Order } from '../../types/order';
import {
  BookOpen,
  UserCheck,
  Scissors,
  IndianRupee,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface ManagementOverviewDashboardProps {
  onOpenOrder: (order: Order) => void;
}

export const ManagementOverviewDashboard: React.FC<ManagementOverviewDashboardProps> = ({
  onOpenOrder,
}) => {
  const {
    savedOrders,
    customers,
    setActiveModule,
    createNewOrder,
  } = useOrder();

  const totalOrders = savedOrders.length;
  const totalCustomers = customers.length;

  const bookedCount = savedOrders.filter(
    (o) => o.status === 'NEW' || o.status === 'READY_FOR_CUTTING'
  ).length;
  const cuttingCount = savedOrders.filter(
    (o) => o.status === 'IN_CUTTING' || o.cuttingDetails?.status === 'IN_CUTTING'
  ).length;
  const stitchingCount = savedOrders.filter((o) => o.status === 'IN_STITCHING').length;
  const qcCount = savedOrders.filter(
    (o) => o.status === 'READY_FOR_QC' || o.status === 'IN_QC'
  ).length;
  const dispatchCount = savedOrders.filter(
    (o) => o.status === 'READY_FOR_DISPATCH' || o.status === 'READY_FOR_TRIAL'
  ).length;

  const inProgressCount = cuttingCount + stitchingCount + qcCount + dispatchCount;
  const outstandingBalance = savedOrders.reduce(
    (sum, o) => sum + Math.max(0, o.billing?.balanceAmount || 0),
    0
  );

  const urgentOrders = savedOrders.filter(
    (o) =>
      (o.billing?.priority === 'Express' || o.billing?.priority === 'Urgent') &&
      o.status !== 'DELIVERED'
  );

  const recentOrders = [...savedOrders]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 6);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Clean Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Business &amp; Operations Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time order pipeline, customer registry, and financial summary
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveModule('CUSTOMERS')}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <UserCheck className="w-4 h-4 text-[#7F1D1D]" />
            <span>Customer Details</span>
          </button>
          <button
            type="button"
            onClick={() => {
              createNewOrder();
              setActiveModule('FRONT_DESK');
            }}
            className="px-4 py-2 rounded-lg bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* 4 Clean KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveModule('ORDERS')}
          className="text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#7F1D1D]" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalOrders}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>View Order Management</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('CUSTOMERS')}
          className="text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Customers
            </span>
            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-[#7F1D1D]" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalCustomers}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Manage Customer Profiles</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('CUTTING_DEPT')}
          className="text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orders In Production
            </span>
            <Scissors className="w-4 h-4 text-slate-400 group-hover:text-[#7F1D1D]" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{inProgressCount}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Cutting, Stitching, QC &amp; Dispatch</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('ACCOUNTS')}
          className="text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Balance
            </span>
            <IndianRupee className="w-4 h-4 text-slate-400 group-hover:text-[#7F1D1D]" />
          </div>
          <p className="text-3xl font-bold text-[#7F1D1D] mt-2">
            ₹{outstandingBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Open Accounts Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </button>
      </div>

      {/* Production Pipeline Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Production Workflow Pipeline
          </h3>
          <span className="text-xs text-slate-400 font-medium">Live Counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: '01. Booked', count: bookedCount, mod: 'ORDERS' as const, icon: BookOpen },
            { label: '02. Cutting', count: cuttingCount, mod: 'CUTTING_DEPT' as const, icon: Scissors },
            { label: '03. Stitching', count: stitchingCount, mod: 'STITCHING_DEPT' as const, icon: Users },
            { label: '04. Quality Control', count: qcCount, mod: 'QC_DEPT' as const, icon: ShieldCheck },
            { label: '05. Dispatch', count: dispatchCount, mod: 'DISPATCH_DEPT' as const, icon: Package },
          ].map((stage) => (
            <button
              key={stage.label}
              type="button"
              onClick={() => setActiveModule(stage.mod)}
              className="text-left p-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{stage.label}</span>
                <stage.icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stage.count}</p>
              <span className="text-[11px] text-slate-500">Orders</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
            <button
              type="button"
              onClick={() => setActiveModule('ORDERS')}
              className="text-xs font-semibold text-[#7F1D1D] hover:underline cursor-pointer"
            >
              View All Orders
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No orders recorded yet.</div>
            ) : (
              recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onOpenOrder(ord)}
                  className="px-5 py-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {ord.customer.customerName}{' '}
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        #{ord.customer.billNumber || ord.id}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ID: {ord.customer.customerId} · Date: {ord.customer.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{ord.billing?.grandTotal || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attention Required */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Attention Required</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">{urgentOrders.length} Urgent</span>
          </div>

          <div className="p-4 space-y-2.5">
            {urgentOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>No urgent/express orders pending.</span>
              </div>
            ) : (
              urgentOrders.slice(0, 5).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => onOpenOrder(ord)}
                  className="w-full text-left p-3 rounded-lg bg-amber-50/70 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">
                      {ord.customer.billNumber || ord.id}
                    </span>
                    <span className="text-[11px] font-bold text-[#7F1D1D] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ord.billing?.priority}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {ord.customer.customerName}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
