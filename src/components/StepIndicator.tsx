import React from 'react';
import { useOrder } from '../context/OrderContext';
import { Check, User, Ruler, Sparkles, CreditCard, Receipt } from 'lucide-react';

interface StepItem {
  step: number;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

const STEPS: StepItem[] = [
  { step: 1, label: 'Customer Info', subLabel: 'Details & Intake', icon: <User className="w-4 h-4" /> },
  { step: 2, label: 'Measurements', subLabel: 'Body Ledger', icon: <Ruler className="w-4 h-4" /> },
  { step: 3, label: 'Design & Fabrics', subLabel: 'Styles & Trims', icon: <Sparkles className="w-4 h-4" /> },
  { step: 4, label: 'Billing & Pay', subLabel: 'Rates & Advance', icon: <CreditCard className="w-4 h-4" /> },
  { step: 5, label: 'Final Review', subLabel: 'Slip & Summary', icon: <Receipt className="w-4 h-4" /> },
];

export const StepIndicator: React.FC = () => {
  const { currentStep, setCurrentStep, nextStep } = useOrder();

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    // If going forward, run basic validation
    if (targetStep > currentStep) {
      nextStep();
    } else {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white border-b border-[#CBD5E1] shadow-sm sticky top-16 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1 gap-2">
          {STEPS.map((item, index) => {
            const isCompleted = item.step < currentStep;
            const isCurrent = item.step === currentStep;

            return (
              <React.Fragment key={item.step}>
                {/* Step Pill */}
                <button
                  type="button"
                  onClick={() => handleStepClick(item.step)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-left whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#147D75] ${
                    isCurrent
                      ? 'bg-[#233B5D] text-white shadow-sm ring-1 ring-[#233B5D]'
                      : isCompleted
                      ? 'bg-[#F0FDFA] text-[#0F766E] hover:bg-[#CCFBF1]'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {/* Step Number or Check */}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[14px] ${
                      isCurrent
                        ? 'bg-white text-[#233B5D]'
                        : isCompleted
                        ? 'bg-[#147D75] text-white'
                        : 'bg-[#CBD5E1] text-[#475569]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `0${item.step}`}
                  </span>

                  {/* Step Labels */}
                  <div className="flex flex-col">
                    <span
                      className={`text-[11px] uppercase font-bold tracking-wider leading-none ${
                        isCurrent
                          ? 'text-[#B0C8F1]'
                          : isCompleted
                          ? 'text-[#147D75]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      Step 0{item.step}
                    </span>
                    <span
                      className={`text-[15px] sm:text-[16px] font-bold leading-tight ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-[#0F766E]'
                          : 'text-[#334155]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>

                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 min-w-[12px] max-w-[40px] h-0.5 mx-1 hidden sm:block ${
                      item.step < currentStep ? 'bg-[#147D75]' : 'bg-[#CBD5E1]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
