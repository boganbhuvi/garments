import React, { useEffect } from 'react';
import { useOrder, AppModule } from '../context/OrderContext';
import { 
  TrendingUp, 
  Store, 
  BookOpen, 
  Scissors, 
  Users, 
  ShieldCheck, 
  Package, 
  UserCheck, 
  Briefcase, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  Sparkles,
  PlusCircle,
  X,
  Menu,
  Boxes,
  IndianRupee,
  Building2,
  Activity,
  LogOut
} from 'lucide-react';
import { isModuleAllowedForRole } from '../utils/rbac';

interface SidebarNavProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDemo?: () => void;
  onOpenOrdersModal?: () => void;
  staffRole?: string;
  onLogout?: () => void;
}

interface NavItem {
  id: AppModule;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  badge?: string;
  badgeColor?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenDemo,
  onOpenOrdersModal,
  staffRole,
  onLogout
}) => {
  const { 
    activeModule, 
    setActiveModule, 
    createNewOrder, 
    dbStatus, 
    savedOrders,
    isSidebarCollapsed: isCollapsed,
    toggleSidebarCollapse: toggleCollapse,
  } = useOrder();

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen, onCloseMobile]);

  // Compute live counts for badges
  const cuttingCount = savedOrders.filter(o => o.status === 'IN_CUTTING' || o.status === 'READY_FOR_CUTTING' || o.cuttingDetails?.status === 'IN_CUTTING').length;
  const stitchingCount = savedOrders.filter(o => o.status === 'IN_STITCHING').length;
  const qcCount = savedOrders.filter(o => o.status === 'READY_FOR_QC' || o.status === 'IN_QC').length;
  const dispatchCount = savedOrders.filter(o => o.status === 'READY_FOR_DISPATCH' || o.status === 'READY_FOR_TRIAL').length;

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'OVERVIEW',
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      icon: TrendingUp,
      section: 'OVERVIEW'
    },
    {
      id: 'CUSTOMERS',
      label: 'Customer Details',
      shortLabel: 'Customers',
      icon: UserCheck,
      section: 'CUSTOMER & SALES'
    },
    {
      id: 'ORDERS',
      label: 'Order Management',
      shortLabel: 'Orders',
      icon: BookOpen,
      badge: savedOrders.length > 0 ? String(savedOrders.length) : undefined
    },
    {
      id: 'FRONT_DESK',
      label: 'New Order Intake',
      shortLabel: 'New Order',
      icon: Store
    },
    {
      id: 'CUTTING_DEPT',
      label: 'Cutting Management',
      shortLabel: 'Cutting',
      icon: Scissors,
      section: 'PRODUCTION',
      badge: cuttingCount > 0 ? String(cuttingCount) : undefined,
      badgeColor: 'bg-[#147D75]'
    },
    {
      id: 'STITCHING_DEPT',
      label: 'Stitching Management',
      shortLabel: 'Stitching',
      icon: Users,
      badge: stitchingCount > 0 ? String(stitchingCount) : undefined,
      badgeColor: 'bg-[#16834A]'
    },
    {
      id: 'QC_DEPT',
      label: 'Quality Control',
      shortLabel: 'QC',
      icon: ShieldCheck,
      badge: qcCount > 0 ? String(qcCount) : undefined,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'DISPATCH_DEPT',
      label: 'Dispatch Management',
      shortLabel: 'Dispatch',
      icon: Package,
      badge: dispatchCount > 0 ? String(dispatchCount) : undefined,
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'INVENTORY',
      label: 'Material Inventory',
      shortLabel: 'Inventory',
      icon: Boxes,
      section: 'INVENTORY'
    },
    {
      id: 'TAILORS',
      label: 'Employee Management',
      shortLabel: 'Employees',
      icon: Briefcase,
      section: 'BUSINESS MANAGEMENT'
    },
    {
      id: 'BRANCHES',
      label: 'Branch Management',
      shortLabel: 'Branches',
      icon: Building2
    },
    {
      id: 'ACCOUNTS',
      label: 'Accounts & Payments',
      shortLabel: 'Accounts',
      icon: IndianRupee,
      section: 'FINANCE'
    },
    {
      id: 'REPORTS',
      label: 'Business Reports',
      shortLabel: 'Reports',
      icon: BarChart3,
      section: 'ANALYTICS'
    },
    {
      id: 'ACTIVITY_LOGS',
      label: 'Activity Logs',
      shortLabel: 'Logs',
      icon: Activity,
      section: 'SYSTEM'
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: Settings
    }
  ];

  const handleNavClick = (id: AppModule) => {
    setActiveModule(id);
    onCloseMobile();
  };

  const isConnected = dbStatus?.connected;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#111827] text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-300 no-print ${
          // Mobile drawer classes
          isMobileOpen 
            ? 'translate-x-0 w-72 shadow-2xl' 
            : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop collapsed vs expanded width
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#7F1D1D] text-white flex items-center justify-center font-bold shadow flex-shrink-0">
              <Scissors className="w-4 h-4 stroke-[2.5]" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-bold text-white tracking-tight leading-tight truncate">
                  GIRIRAJ GARMENTS
                </span>
                <span className="text-[10px] text-amber-400 font-semibold tracking-widest uppercase truncate">
                  Enterprise ERP
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 items-center justify-center transition-all cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: New Order Booking */}
        <div className="p-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              createNewOrder();
              setActiveModule('FRONT_DESK');
              onCloseMobile();
            }}
            className={`w-full py-2.5 rounded-lg bg-[#7F1D1D] hover:bg-[#991B1B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'px-0' : 'px-3'
            }`}
            title="Book New Customer Order"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>+ Book New Order</span>}
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {NAV_ITEMS.filter((item) => !staffRole || isModuleAllowedForRole(staffRole, item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <React.Fragment key={item.id}>
                {item.section && (!isCollapsed || isMobileOpen) && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {item.section}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold transition-all group relative cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#092546] shadow-md font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#147D75]' : 'text-slate-400 group-hover:text-white'
                  }`} 
                />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="flex-1 text-left truncate">
                    {item.label}
                  </span>
                )}

                {/* Badge indicator */}
                {item.badge && (!isCollapsed || isMobileOpen) && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-[#1E40AF]'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip Hover */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#061B33] text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/20">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Bottom Section: Database & Demo Station */}
        <div className="p-3 border-t border-white/10 bg-[#061B33] space-y-2">
          {/* Staff Sign Out Button */}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                onCloseMobile();
              }}
              className={`w-full py-2 rounded-lg bg-slate-800 hover:bg-[#7F1D1D] text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isCollapsed && !isMobileOpen ? 'px-0' : 'px-3'
              }`}
              title="Sign Out of ERP"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
            </button>
          )}

          {/* Database Health Pill */}
          <div 
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
              isConnected
                ? 'bg-[#16834A]/20 border-[#16834A] text-[#99F2E8]'
                : 'bg-[#D68B20]/20 border-[#D68B20] text-[#FDE68A]'
            } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
            title={isConnected ? `Connected to MongoDB: ${dbStatus?.name}` : 'Storage: LocalStorage fallback'}
          >
            <Database className="w-3.5 h-3.5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate flex-1">
                {isConnected ? 'MongoDB Online' : 'Local Storage'}
              </span>
            )}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>
        </div>

      </aside>
    </>
  );
};
