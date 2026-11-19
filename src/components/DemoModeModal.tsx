import React from 'react';
import { useOrder } from '../context/OrderContext';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  X,
  Play,
  Scissors,
  Users,
  Store,
  Layers,
  FileCheck2,
  Trash2
} from 'lucide-react';

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({ isOpen, onClose }) => {
  const {
    setActiveModule,
    setCurrentStep,
    createNewOrder,
    clearOrder,
    loadDemoData,
    showToast
  } = useOrder();

  if (!isOpen) return null;

  const handleLaunchScenario1 = () => {
    clearOrder();
    setActiveModule('FRONT_DESK');
    setCurrentStep(1);
    showToast('Scenario 1 Active: Fresh Customer Registration', 'info');
    onClose();
  };

  const handleLaunchScenario2 = () => {
    setActiveModule('CUTTING_DEPT');
    showToast('Scenario 2 Active: Cutting Department Workshop', 'info');
    onClose();
  };

  const handleLaunchScenario3 = () => {
    setActiveModule('STITCHING_DEPT');
    showToast('Scenario 3 Active: Stitching & Tailor Allocation', 'info');
    onClose();
  };

  const handleResetDemoData = () => {
    loadDemoData();
    showToast('✓ Realistic Demo Data Successfully Restored', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-[#191C1E]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#233B5D]">Executive Demonstration Station</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Present Giriraj Garments ERP seamlessly to business owners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guided Scenarios List */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Select Demonstration Journey:
          </h4>

          {/* Scenario 1 */}
          <div
            onClick={handleLaunchScenario1}
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-[#147D75] bg-slate-50 hover:bg-teal-50/40 flex items-start gap-3.5 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#147D75] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#147D75] group-hover:text-white transition-all">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-slate-900">Scenario 1: Front Desk Walk-In Customer</strong>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-100 text-[#147D75]">
                  Step 1 → 5
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Demonstrates clean blank registration, faint reference measurements, garment styling, advance payment, and instant A4 & WhatsApp booking chit generation.
              </p>
            </div>
          </div>

          {/* Scenario 2 */}
          <div
            onClick={handleLaunchScenario2}
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233B5D] bg-slate-50 hover:bg-blue-50/40 flex items-start gap-3.5 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#233B5D] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#233B5D] group-hover:text-white transition-all">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-slate-900">Scenario 2: Cutting Department Workshop Table</strong>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-[#233B5D]">
                  Scissor Room
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Demonstrates how the cutting master checks customer cloth, views oversized measurements from cutting table distance, updates progress, and prints clean workshop sheets.
              </p>
            </div>
          </div>

          {/* Scenario 3 */}
          <div
            onClick={handleLaunchScenario3}
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/40 flex items-start gap-3.5 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-slate-900">Scenario 3: Stitching Allocation & Piece Wages</strong>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Sewing Floor
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Demonstrates distributing multi-garment orders among specialist master tailors, monitoring sewing progress, and calculating automated piece-rate weekly wages.
              </p>
            </div>
          </div>

        </div>

        {/* Reset & Quick Utility Options */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>Restore Rich Demo Orders</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchScenario1}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Clear to Pristine Blank Form</span>
          </button>
        </div>

      </div>
    </div>
  );
};
