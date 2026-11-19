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
  Menu
} from 'lucide-react';

interface SidebarNavProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDemo?: () => void;
  onOpenOrdersModal?: () => void;
}

interface NavItem {
  id: AppModule;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenDemo,
  onOpenOrdersModal
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
      label: 'Overview',
      shortLabel: 'Overview',
      icon: TrendingUp
    },
    {
      id: 'FRONT_DESK',
      label: 'Front Desk / New Order',
      shortLabel: 'Front Desk',
      icon: Store
    },
    {
      id: 'ORDERS',
      label: 'Order Management',
      shortLabel: 'Orders',
      icon: BookOpen,
      badge: savedOrders.length > 0 ? String(savedOrders.length) : undefined
    },
    {
      id: 'CUTTING_DEPT',
      label: 'Cutting Department',
      shortLabel: 'Cutting',
      icon: Scissors,
      badge: cuttingCount > 0 ? String(cuttingCount) : undefined,
      badgeColor: 'bg-[#147D75]'
    },
    {
      id: 'STITCHING_DEPT',
      label: 'Stitching Department',
      shortLabel: 'Stitching',
      icon: Users,
      badge: stitchingCount > 0 ? String(stitchingCount) : undefined,
      badgeColor: 'bg-[#16834A]'
    },
    {
      id: 'QC_DEPT',
      label: 'QC & Trial',
      shortLabel: 'QC',
      icon: ShieldCheck,
      badge: qcCount > 0 ? String(qcCount) : undefined,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'DISPATCH_DEPT',
      label: 'Dispatch & Delivery',
      shortLabel: 'Dispatch',
      icon: Package,
      badge: dispatchCount > 0 ? String(dispatchCount) : undefined,
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'CUSTOMERS',
      label: 'Customer Management',
      shortLabel: 'Customers',
      icon: UserCheck
    },
    {
      id: 'TAILORS',
      label: 'Tailor Management',
      shortLabel: 'Tailors',
      icon: Briefcase
    },
    {
      id: 'REPORTS',
      label: 'Reports & Audit',
      shortLabel: 'Reports',
      icon: BarChart3
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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#092546] text-white border-r border-white/10 flex flex-col transition-all duration-300 no-print ${
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
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-[#061B33]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white text-[#092546] flex items-center justify-center font-black shadow flex-shrink-0">
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-[17px] font-black text-white tracking-tight leading-tight truncate">
                  GIRIRAJ GARMENTS
                </span>
                <span className="text-[11px] text-[#99F2E8] font-bold tracking-wider uppercase truncate">
                  Enterprise ERP
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: New Order Booking */}
        <div className="p-3 border-b border-white/10">
          <button
            type="button"
            onClick={() => {
              createNewOrder();
              setActiveModule('FRONT_DESK');
              onCloseMobile();
            }}
            className={`w-full py-2.5 rounded-xl bg-[#147D75] hover:bg-[#0E605A] text-white font-black text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
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
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
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
            );
          })}
        </nav>

        {/* Bottom Section: Database & Demo Station */}
        <div className="p-3 border-t border-white/10 bg-[#061B33] space-y-2">
          {/* Demo Tour Button */}
          {onOpenDemo && (
            <button
              type="button"
              onClick={() => {
                onOpenDemo();
                onCloseMobile();
              }}
              className={`w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                isCollapsed && !isMobileOpen ? 'px-0' : 'px-3'
              }`}
              title="Open Interactive Demo Station"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Demo Tour Station</span>}
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
