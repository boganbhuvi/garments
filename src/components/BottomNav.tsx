import React, { useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';

const STEP_NAMES = [
  '',
  'Customer Details',
  'Body Measurements',
  'Design & Materials',
  'Billing & Payment',
  'Final Review & Order Slip'
];

export const BottomNav: React.FC = () => {
  const { currentStep, prevStep, nextStep, saveDraft, submitOrder, syncStatus, isSidebarCollapsed } = useOrder();

  // Reactive sidebar offset for footer position (desktop only)
  const [isDesktop, setIsDesktop] = React.useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const footerLeft = isDesktop ? (isSidebarCollapsed ? 76 : 260) : 0;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (or Cmd+S on Mac): Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDraft();
        return;
      }
      // Alt+P: Go to Previous Step
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        prevStep();
        return;
      }
      // NOTE: Enter key intentionally NOT handled here.
      // Enter must retain its standard browser behaviour for buttons, inputs, forms,
      // and focused links. Auto-advancing workflow steps on Enter caused accidental
      // form submissions and was removed (P0 Fix 2).
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDraft, prevStep]);

  return (
    <footer
      className="fixed bottom-0 right-0 z-40 bg-white border-t border-[#CBD5E1] shadow-[0_-4px_16px_rgba(35,59,93,0.08)] no-print transition-all duration-300"
      style={footerLeft > 0 ? { left: `${footerLeft}px` } : { left: 0 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Side: Previous Button & Clear Save Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`min-h-[48px] sm:min-h-[52px] px-4 sm:px-6 rounded-xl border-2 text-[17px] sm:text-[18px] font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
              currentStep === 1
                ? 'border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed bg-[#F8FAFC]'
                : 'border-[#64748B] text-[#233B5D] hover:bg-[#F1F5F9] active:bg-[#E2E8F0]'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Previous</span>
            <span className="hidden md:inline-block ml-1 text-[13px] bg-[#E2E8F0] text-[#475569] px-2 py-0.5 rounded font-semibold">
              Alt + P
            </span>
          </button>

          {/* Real-time Save & Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[13px] font-bold bg-slate-50 border-slate-200">
            {syncStatus === 'SAVING' && (
              <span className="text-amber-700 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Saving...</span>
              </span>
            )}
            {syncStatus === 'SAVED_LOCALLY' && (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Saved locally.</span>
              </span>
            )}
            {syncStatus === 'SYNCED_WITH_DATABASE' && (
              <span className="text-[#147D75] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#147D75]" />
                <span>Synced with database.</span>
              </span>
            )}
            {syncStatus === 'SYNC_FAILED' && (
              <span className="text-red-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Sync failed.</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Save Draft & Next Button */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Save Draft */}
          <button
            type="button"
            onClick={saveDraft}
            className="min-h-[48px] sm:min-h-[52px] px-3.5 sm:px-5 rounded-lg border-2 border-[#CBD5E1] text-[#233B5D] bg-white hover:bg-[#F8FAFC] text-[17px] sm:text-[18px] font-bold flex items-center gap-2 transition-all shadow-sm active:bg-[#F1F5F9]"
            title="Save draft to LocalStorage"
          >
            <Save className="w-5 h-5 text-[#147D75]" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="hidden md:inline-block text-[13px] bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded font-semibold">
              Ctrl + S
            </span>
          </button>

          {/* Next or Submit Button */}
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="min-h-[48px] sm:min-h-[52px] px-5 sm:px-7 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white text-[17px] sm:text-[18px] font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
            >
              <span>Next: {STEP_NAMES[currentStep + 1]}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitOrder}
              className="min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 rounded-lg bg-[#16834A] hover:bg-[#11683A] text-white text-[17px] sm:text-[18px] font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
            >
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              <span>Submit & Confirm Order</span>
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};
