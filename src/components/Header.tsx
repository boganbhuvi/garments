import React, { useState } from 'react';
import { useOrder, AppModule } from '../context/OrderContext';
import { 
  Scissors, 
  Search, 
  Sparkles, 
  Store, 
  User, 
  Bell,
  HelpCircle,
  Menu,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenOrders: () => void;
  onOpenDemo?: () => void;
  onToggleMobileMenu?: () => void;
}

const MODULE_TITLES: Record<AppModule, { title: string; subtitle: string }> = {
  OVERVIEW: { title: 'Overview', subtitle: 'Management KPI Dashboard' },
  FRONT_DESK: { title: 'Front Desk / New Order', subtitle: 'Customer Intake & Booking' },
  ORDERS: { title: 'Order Management', subtitle: 'Master Orders Ledger' },
  CUTTING_DEPT: { title: 'Cutting Department', subtitle: 'Pattern Marking & Cloth Cutting' },
  STITCHING_DEPT: { title: 'Stitching Department', subtitle: 'Tailor Allocation & Work Queue' },
  QC_DEPT: { title: 'QC & Trial', subtitle: 'Quality Audit & Tolerance Checking' },
  DISPATCH_DEPT: { title: 'Dispatch & Delivery', subtitle: 'Counter Handover & Balance Settlement' },
  CUSTOMERS: { title: 'Customer Details', subtitle: 'Client Profiles & Registration Master' },
  TAILORS: { title: 'Employee Management', subtitle: 'Master Tailor & Staff Directory' },
  INVENTORY: { title: 'Material Inventory', subtitle: 'Stock Levels & Material Movements' },
  ACCOUNTS: { title: 'Accounts & Payments', subtitle: 'Billing, Collections & Outstanding Balances' },
  BRANCHES: { title: 'Branch Management', subtitle: 'Multi-Branch Operations Directory' },
  ACTIVITY_LOGS: { title: 'Activity Logs', subtitle: 'Customer & Order Audit Timeline' },
  REPORTS: { title: 'Business Reports', subtitle: 'Production & Financial Auditing' },
  SETTINGS: { title: 'Settings', subtitle: 'Workshop Parameters & Database Status' }
};

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onOpenOrders,
  onOpenDemo,
  onToggleMobileMenu
}) => {
  const { 
    activeModule,
    savedOrders
  } = useOrder();

  const [showHelpDropdown, setShowHelpDropdown] = useState(false);

  // Compute urgent/express pending count for notification badge
  const pendingUrgentCount = savedOrders.filter(
    o => (o.billing.priority === 'Express' || o.billing.priority === 'Urgent') && o.status !== 'DELIVERED'
  ).length;

  const currentModuleInfo = MODULE_TITLES[activeModule] || MODULE_TITLES.FRONT_DESK;

  return (
    <header className="sticky top-0 z-30 w-full bg-white text-slate-900 border-b border-slate-200 no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Mobile Hamburger & Breadcrumb Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                aria-label="Toggle Navigation Drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Breadcrumb & Current Module Title */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                <span className="hidden sm:inline">Giriraj ERP</span>
                <span className="hidden sm:inline text-slate-300"><ChevronRight className="w-3 h-3 inline" /></span>
                <span className="text-[#7F1D1D] truncate">{currentModuleInfo.title}</span>
              </div>
              <h1 className="text-[16px] sm:text-[18px] font-bold text-slate-900 tracking-tight leading-tight truncate">
                {currentModuleInfo.subtitle}
              </h1>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full h-9 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-sm font-medium border border-slate-200 flex items-center gap-2.5 transition-all cursor-pointer group"
              title="Global search across all customer orders, phones, and bills (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="text-slate-500 group-hover:text-slate-700 text-xs sm:text-sm truncate">
                Search bill no, customer, phone...
              </span>
              <kbd className="ml-auto hidden lg:inline-block text-[11px] font-mono bg-white text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Help & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Mobile search button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="md:hidden w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              title="Search orders"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Help & Demo Tour Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHelpDropdown(prev => !prev)}
                className="h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
                title="Help and Walkthrough"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Help</span>
              </button>

              {showHelpDropdown && (
                <div 
                  className="absolute right-0 top-12 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowHelpDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">
                      Support & Training
                    </span>
                    <strong className="text-sm font-bold text-[#233B5D]">Giriraj Garments ERP</strong>
                  </div>

                  {onOpenDemo && (
                    <button
                      type="button"
                      onClick={onOpenDemo}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-amber-50 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <div>
                        <div className="font-black text-slate-900">Interactive Demo Tour</div>
                        <div className="text-[11px] text-slate-500 font-normal">Step-by-step feature walkthrough</div>
                      </div>
                    </button>
                  )}

                  <div className="px-3 py-2 text-[11px] text-slate-500 border-t border-slate-100 space-y-1">
                    <div className="flex justify-between">
                      <span>Quick Search:</span>
                      <strong className="font-mono">Ctrl + K</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Save Draft:</span>
                      <strong className="font-mono">Ctrl + S</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Previous Step:</span>
                      <strong className="font-mono">Alt + P</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell — opens Orders book filtered to Urgent/Express */}
            <div className="relative">
              <button
                type="button"
                onClick={onOpenOrders}
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title={pendingUrgentCount > 0 ? `${pendingUrgentCount} Urgent/Express orders — click to view` : 'No urgent orders right now'}
              >
                <Bell className="w-4 h-4" />
                {pendingUrgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7F1D1D] text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingUrgentCount}
                  </span>
                )}
              </button>
            </div>

            {/* Staff / Counter Badge & User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-[13px] font-bold text-slate-900 leading-tight">
                  Master Counter
                </span>
                <span className="text-[11px] font-medium text-slate-500 flex items-center justify-end gap-1">
                  <Store className="w-3 h-3 text-[#7F1D1D]" />
                  <span>Main Studio</span>
                </span>
              </div>

              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold cursor-pointer hover:bg-[#7F1D1D] transition-colors">
                <User className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
