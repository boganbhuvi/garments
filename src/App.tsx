import React, { useState, useEffect, Suspense, lazy } from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { StepIndicator } from './components/StepIndicator';
import { BottomNav } from './components/BottomNav';
import { CustomerSearchModal } from './components/CustomerSearchModal';
import { OrderListModal } from './components/OrderListModal';
import { Page1Customer } from './pages/Page1Customer';
import { Page2Measurements } from './pages/Page2Measurements';
import { Page3DesignMaterials } from './pages/Page3DesignMaterials';
import { Page4Billing } from './pages/Page4Billing';
import { Page5SummarySlip } from './pages/Page5SummarySlip';
import { OrderDetailModal } from './components/OrderDetailModal';
import { DemoModeModal } from './components/DemoModeModal';
import { WhatsAppNotificationModal } from './components/whatsapp/WhatsAppNotificationModal';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Order, WhatsAppNotificationRecord } from './types/order';

const PublicWebsite = lazy(() => import('./public-site/PublicWebsite').then(m => ({ default: m.PublicWebsite })));
const CuttingDashboard = lazy(() => import('./modules/cutting/CuttingDashboard').then(m => ({ default: m.CuttingDashboard })));
const StitchingDashboard = lazy(() => import('./modules/stitching/StitchingDashboard').then(m => ({ default: m.StitchingDashboard })));
const QCDashboard = lazy(() => import('./modules/qc/QCDashboard').then(m => ({ default: m.QCDashboard })));
const DispatchDashboard = lazy(() => import('./modules/dispatch/DispatchDashboard').then(m => ({ default: m.DispatchDashboard })));
const ManagementOverviewDashboard = lazy(() => import('./modules/overview/ManagementOverviewDashboard').then(m => ({ default: m.ManagementOverviewDashboard })));
const TailorMasterView = lazy(() => import('./modules/stitching/TailorMasterView').then(m => ({ default: m.TailorMasterView })));
const CustomerManagementView = lazy(() => import('./modules/customer/CustomerManagementView').then(m => ({ default: m.CustomerManagementView })));
const ReportsView = lazy(() => import('./modules/reports/ReportsView').then(m => ({ default: m.ReportsView })));
const SettingsView = lazy(() => import('./modules/settings/SettingsView').then(m => ({ default: m.SettingsView })));
const InventoryView = lazy(() => import('./modules/inventory/InventoryView').then(m => ({ default: m.InventoryView })));
const AccountsView = lazy(() => import('./modules/accounts/AccountsView').then(m => ({ default: m.AccountsView })));
const BranchManagementView = lazy(() => import('./modules/branches/BranchManagementView').then(m => ({ default: m.BranchManagementView })));
const ActivityLogsView = lazy(() => import('./modules/system/ActivityLogsView').then(m => ({ default: m.ActivityLogsView })));
const OrdersManagementView = lazy(() => import('./modules/orders/OrdersManagementView').then(m => ({ default: m.OrdersManagementView })));

import { StaffLoginPage, StaffUser } from './components/StaffLoginPage';
import { api } from './services/api';
import { getDefaultModuleForRole, isModuleAllowedForRole } from './utils/rbac';

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center p-12 text-sm font-semibold text-slate-500">
    Loading module...
  </div>
);

const MainLayout: React.FC<{ staffUser: StaffUser; onLogout: () => void }> = ({
  staffUser,
  onLogout,
}) => {
  const { 
    currentStep, 
    toastMessage, 
    activeModule, 
    selectedDetailOrder, 
    setSelectedDetailOrder,
    setActiveModule,
    tailors,
    addTailor,
    updateTailor,
    recordNotificationLog,
    whatsAppModalOrder,
    whatsAppDefaultTemplate,
    closeWhatsAppModal,
    isSidebarCollapsed
  } = useOrder();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Reactive desktop detection so sidebar offset updates on window resize
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isModuleAllowedForRole(staffUser.role, activeModule)) {
      setActiveModule(getDefaultModuleForRole(staffUser.role));
    }
  }, [staffUser.role, activeModule, setActiveModule]);

  // Only show modal when explicitly triggered (sidebar/header Orders now opens dedicated page)
  const isOrdersModalVisible = isOrdersOpen;

  // Reactive sidebar offset: 260px expanded, 76px collapsed (desktop only; mobile uses drawer overlay)
  const sidebarWidth = isDesktop ? (isSidebarCollapsed ? 76 : 260) : 0;

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] text-[#191C1E]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 font-bold text-[15px] ${
            toastMessage.type === 'success'
              ? 'bg-[#16834A] text-white border-[#126C3C]'
              : toastMessage.type === 'warning'
              ? 'bg-[#D68B20] text-white border-[#B47417]'
              : 'bg-[#233B5D] text-white border-[#1A2C46]'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Sticky / Fixed Side Navigation Bar */}
      <SidebarNav
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenOrdersModal={() => setActiveModule('ORDERS')}
        staffRole={staffUser.role}
        onLogout={onLogout}
      />

      {/* Main Content Area — reactive to sidebar collapse state */}
      {/* paddingLeft matches sidebar: 260px expanded, 76px collapsed (desktop only) */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={sidebarWidth > 0 ? { paddingLeft: `${sidebarWidth}px` } : undefined}
      >
        
        {/* Top Header with Hamburger and Department Switcher */}
        <Header 
          onOpenSearch={() => setIsSearchOpen(true)} 
          onOpenOrders={() => setActiveModule('ORDERS')}
          onOpenDemo={() => setIsDemoOpen(true)}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Content Container */}
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<PageLoader />}>
          {/* Conditional Module Routing */}
          {activeModule === 'OVERVIEW' ? (
            <main className="flex-1 w-full min-w-0">
              <ManagementOverviewDashboard onOpenOrder={(ord) => setSelectedDetailOrder(ord)} />
            </main>
          ) : activeModule === 'CUTTING_DEPT' ? (
            <main className="flex-1 w-full min-w-0">
              <CuttingDashboard />
            </main>
          ) : activeModule === 'STITCHING_DEPT' ? (
            <main className="flex-1 w-full min-w-0">
              <StitchingDashboard />
            </main>
          ) : activeModule === 'QC_DEPT' ? (
            <main className="flex-1 w-full min-w-0">
              <QCDashboard />
            </main>
          ) : activeModule === 'DISPATCH_DEPT' ? (
            <main className="flex-1 w-full min-w-0">
              <DispatchDashboard />
            </main>
          ) : activeModule === 'ORDERS' ? (
            <main className="flex-1 w-full min-w-0">
              <OrdersManagementView />
            </main>
          ) : activeModule === 'CUSTOMERS' ? (
            <main className="flex-1 w-full min-w-0">
              <CustomerManagementView />
            </main>
          ) : activeModule === 'TAILORS' ? (
            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
              <TailorMasterView 
                tailors={tailors}
                onAddTailor={addTailor}
                onUpdateTailor={updateTailor}
                onDeleteTailor={() => {}}
              />
            </main>
          ) : activeModule === 'INVENTORY' ? (
            <main className="flex-1 w-full min-w-0">
              <InventoryView />
            </main>
          ) : activeModule === 'ACCOUNTS' ? (
            <main className="flex-1 w-full min-w-0">
              <AccountsView />
            </main>
          ) : activeModule === 'BRANCHES' ? (
            <main className="flex-1 w-full min-w-0">
              <BranchManagementView />
            </main>
          ) : activeModule === 'ACTIVITY_LOGS' ? (
            <main className="flex-1 w-full min-w-0">
              <ActivityLogsView />
            </main>
          ) : activeModule === 'REPORTS' ? (
            <main className="flex-1 w-full min-w-0">
              <ReportsView />
            </main>
          ) : activeModule === 'SETTINGS' ? (
            <main className="flex-1 w-full min-w-0">
              <SettingsView />
            </main>
          ) : (
            /* FRONT_DESK or default 5-step order intake */
            <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              {/* 5-Step Pipeline Indicator */}
              <StepIndicator />

              {/* Workflow Step Pages */}
              <main className="flex-1 pb-44 pt-3 w-full">
                {currentStep === 1 && <Page1Customer onOpenSearch={() => setIsSearchOpen(true)} />}
                {currentStep === 2 && <Page2Measurements />}
                {currentStep === 3 && <Page3DesignMaterials />}
                {currentStep === 4 && <Page4Billing />}
                {currentStep === 5 && <Page5SummarySlip />}
              </main>

              {/* Sticky Bottom Actions Bar */}
              <BottomNav />
            </div>
          )}
          </Suspense>

        </div>

      </div>

      {/* Customer Search Modal */}
      <CustomerSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Orders Book Modal */}
      <OrderListModal 
        isOpen={isOrdersModalVisible} 
        onClose={() => {
          setIsOrdersOpen(false);
          if (activeModule === 'ORDERS') {
            setActiveModule('OVERVIEW');
          }
        }} 
      />

      {/* Universal Order Detail Inspector */}
      <OrderDetailModal 
        order={selectedDetailOrder}
        onClose={() => setSelectedDetailOrder(null)}
        onOpenCutting={() => setActiveModule('CUTTING_DEPT')}
        onOpenStitching={() => setActiveModule('STITCHING_DEPT')}
      />

      {/* Demo Tour Station Modal */}
      <DemoModeModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
      />

      {/* Centralized WhatsApp Notification Modal */}
      <WhatsAppNotificationModal
        order={whatsAppModalOrder}
        defaultTemplate={whatsAppDefaultTemplate}
        isOpen={!!whatsAppModalOrder}
        onClose={closeWhatsAppModal}
        onRecordNotification={(orderId, record) => recordNotificationLog(orderId, record)}
      />

    </div>
  );
};

const TEMPORARY_BYPASS_STAFF_LOGIN = true;

const TEMP_BYPASS_ADMIN_USER: StaffUser = {
  userId: 'USR-TEMP-ADMIN',
  username: 'admin',
  fullName: 'Giriraj Super Admin',
  role: 'SUPER_ADMIN',
  branchIds: ['BR-001'],
};

export function App() {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('portal') === 'admin' || window.location.pathname.startsWith('/admin');
  });
  const [staffUser, setStaffUser] = useState<StaffUser | null>(
    TEMPORARY_BYPASS_STAFF_LOGIN ? TEMP_BYPASS_ADMIN_USER : null
  );
  const [authChecked, setAuthChecked] = useState(TEMPORARY_BYPASS_STAFF_LOGIN);

  useEffect(() => {
    if (TEMPORARY_BYPASS_STAFF_LOGIN) return;
    let mounted = true;
    api.getMe().then((u) => {
      if (mounted) {
        if (u && u.role !== 'CUSTOMER') setStaffUser(u);
        setAuthChecked(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    if (TEMPORARY_BYPASS_STAFF_LOGIN) {
      setIsAdminMode(false);
      return;
    }
    await api.logoutStaff();
    setStaffUser(null);
  };

  return (
    <OrderProvider>
      {isAdminMode ? (
        !authChecked ? (
          <PageLoader />
        ) : !staffUser ? (
          <StaffLoginPage
            onLoginSuccess={(user) => setStaffUser(user)}
            onBackToPublic={() => setIsAdminMode(false)}
          />
        ) : (
          <div className="relative">
            <MainLayout staffUser={staffUser} onLogout={handleLogout} />
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full bg-[#1C1917] text-white text-xs font-bold shadow-lg hover:bg-[#7F1D1D] transition-colors cursor-pointer"
            >
              View Public Website
            </button>
          </div>
        )
      ) : (
        <Suspense fallback={<PageLoader />}>
          <PublicWebsite onOpenAdmin={() => setIsAdminMode(true)} />
        </Suspense>
      )}
    </OrderProvider>
  );
}

export default App;
