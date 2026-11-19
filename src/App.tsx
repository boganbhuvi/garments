import React, { useState, useEffect } from 'react';
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
import { CuttingDashboard } from './modules/cutting/CuttingDashboard';
import { StitchingDashboard } from './modules/stitching/StitchingDashboard';
import { QCDashboard } from './modules/qc/QCDashboard';
import { DispatchDashboard } from './modules/dispatch/DispatchDashboard';
import { ManagementOverviewDashboard } from './modules/overview/ManagementOverviewDashboard';
import { TailorMasterView } from './modules/stitching/TailorMasterView';
import { CustomerManagementView } from './modules/customer/CustomerManagementView';
import { ReportsView } from './modules/reports/ReportsView';
import { SettingsView } from './modules/settings/SettingsView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { DemoModeModal } from './components/DemoModeModal';
import { WhatsAppNotificationModal } from './components/whatsapp/WhatsAppNotificationModal';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Order, WhatsAppNotificationRecord } from './types/order';

const MainLayout: React.FC = () => {
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

  // Synchronize orders modal with activeModule === 'ORDERS'
  const isOrdersModalVisible = isOrdersOpen || activeModule === 'ORDERS';

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
        onOpenOrdersModal={() => setIsOrdersOpen(true)}
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
          onOpenOrders={() => setIsOrdersOpen(true)}
          onOpenDemo={() => setIsDemoOpen(true)}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Content Container */}
        <div className="flex-1 flex flex-col">
          
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

export function App() {
  return (
    <OrderProvider>
      <MainLayout />
    </OrderProvider>
  );
}

export default App;
