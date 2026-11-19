import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  Settings, 
  Flame, 
  Ruler, 
  MessageSquare, 
  Layers, 
  CheckCircle2, 
  Save, 
  RotateCcw,
  ExternalLink,
  Database,
  Server,
  RefreshCw
} from 'lucide-react';
import { WHATSAPP_TEMPLATES } from '../../services/whatsappService';

export const SettingsView: React.FC = () => {
  const { 
    order,
    showToast, 
    dbStatus, 
    checkDbHealth, 
    syncToMongoDB, 
    isSyncing, 
    savedOrders,
    defaultWorkshopUnit,
    setDefaultWorkshopUnit,
  } = useOrder();

  // Settings states — initialize from defaultWorkshopUnit (global default for NEW orders)
  const [defaultUnit, setDefaultUnit] = useState<'in' | 'cm'>(() => defaultWorkshopUnit);
  const [blousePoints, setBlousePoints] = useState(1);
  const [kurtiPoints, setKurtiPoints] = useState(1.5);
  const [bottomPoints, setBottomPoints] = useState(1);
  const [sareePoints, setSareePoints] = useState(0.5);

  const [urgentSurcharge, setUrgentSurcharge] = useState(150);
  const [expressSurcharge, setExpressSurcharge] = useState(300);

  const [urgentDays, setUrgentDays] = useState(2);
  const [expressDays, setExpressDays] = useState(1);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX 4: Only update the global default unit for NEW orders.
    // NEVER call setMeasurementUnit() here — that would destructively convert
    // the active order's existing measurements without user consent.
    setDefaultWorkshopUnit(defaultUnit);
    showToast('Workshop ERP Settings saved successfully!', 'success');
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      
      {/* Top Banner */}
      <div className="bg-[#233B5D] text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-lg">
            <Settings className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Workshop & System Settings
            </h1>
            <p className="text-sm text-slate-300 font-semibold mt-0.5">
              Priority surcharges, capacity points, measurement defaults, and WhatsApp communication rules
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
        
        {/* Section 1: Measurement Unit Configuration (Single-Column Vertical Layout) */}
        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Ruler className="w-6 h-6 text-[#147D75]" />
            <h2 className="text-xl font-black text-[#233B5D]">
              1. Measurement System Configuration
            </h2>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              Default Measurement Unit for New Orders:
            </label>
            <select
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value as 'in' | 'cm')}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none cursor-pointer"
            >
              <option value="in">Inches (in) — Traditional Tailoring Standard</option>
              <option value="cm">Centimeters (cm) — Metric Standard</option>
            </select>
            <span className="text-xs text-slate-500">
              Sets the default measurement unit applied to all <strong>NEW orders</strong> created from this point forward.
              Existing order measurements are never changed. To switch units on an active order, use the unit toggle on the Measurements page.
            </span>
          </div>
        </div>

        {/* Section 2: Priority Fee & Turnaround Days (Single-Column Vertical Layout) */}
        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Flame className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-black text-[#233B5D]">
              2. Priority Delivery Surcharges & Commitments
            </h2>
          </div>

          {/* Urgent Surcharge */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              URGENT Priority Fixed Surcharge (₹):
            </label>
            <input
              type="number"
              min="0"
              value={urgentSurcharge}
              onChange={(e) => setUrgentSurcharge(Number(e.target.value) || 0)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>

          {/* Urgent Days */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              URGENT Priority Expected Turnaround (Days):
            </label>
            <input
              type="number"
              min="1"
              value={urgentDays}
              onChange={(e) => setUrgentDays(Number(e.target.value) || 1)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>

          {/* Express Surcharge */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              EXPRESS Priority Fixed Surcharge (₹):
            </label>
            <input
              type="number"
              min="0"
              value={expressSurcharge}
              onChange={(e) => setExpressSurcharge(Number(e.target.value) || 0)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>

          {/* Express Days */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              EXPRESS Priority Expected Turnaround (Days):
            </label>
            <input
              type="number"
              min="1"
              value={expressDays}
              onChange={(e) => setExpressDays(Number(e.target.value) || 1)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Capacity Engine Workload Points (Single-Column Vertical Layout) */}
        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Layers className="w-6 h-6 text-[#233B5D]" />
            <h2 className="text-xl font-black text-[#233B5D]">
              3. Garment Workload Points (Daily Capacity Engine)
            </h2>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              Blouse Workload Points (Simple to Designer):
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={blousePoints}
              onChange={(e) => setBlousePoints(Number(e.target.value) || 1)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              Kurti / Top Workload Points:
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={kurtiPoints}
              onChange={(e) => setKurtiPoints(Number(e.target.value) || 1)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              Salwar / Churidar / Bottom Workload Points:
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={bottomPoints}
              onChange={(e) => setBottomPoints(Number(e.target.value) || 1)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-bold text-[#233B5D]">
              Saree / Falls / Finishing Workload Points:
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={sareePoints}
              onChange={(e) => setSareePoints(Number(e.target.value) || 0.5)}
              className="w-full min-h-[50px] px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-bold text-[#191C1E] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: WhatsApp Notification Templates Directory */}
        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <MessageSquare className="w-6 h-6 text-[#128C7E]" />
            <h2 className="text-xl font-black text-[#233B5D]">
              4. Active WhatsApp Notification Templates (9 Standard Tiers)
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-slate-200">
            {Object.values(WHATSAPP_TEMPLATES).map((tpl, idx) => (
              <div key={tpl.id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#233B5D] text-[15px]">{tpl.title}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-line">
                  {tpl.defaultText(order)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Database & System Status (Admin Only) */}
        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-[#233B5D]" />
              <h2 className="text-xl font-black text-[#233B5D]">
                5. Database & System Status (Admin Area)
              </h2>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase ${
              dbStatus?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {dbStatus?.connected ? 'Connected to MongoDB' : 'Offline / Local Storage'}
            </span>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block">Host & Port</span>
                <strong className="text-slate-900">{dbStatus?.host || '127.0.0.1'} : 5000 / 27017</strong>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block">Database Name</span>
                <strong className="text-slate-900">{dbStatus?.name || 'giriraj_garments'}</strong>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block">Total Orders Cached</span>
                <strong className="text-slate-900">{savedOrders.length} Orders Recorded</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => checkDbHealth()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
                <span>Test Database Ping</span>
              </button>

              <button
                type="button"
                disabled={!dbStatus?.connected || isSyncing}
                onClick={() => syncToMongoDB()}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-sm transition-all ${
                  dbStatus?.connected 
                    ? 'bg-[#147D75] hover:bg-[#0E605A] cursor-pointer' 
                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>{isSyncing ? 'Syncing to MongoDB...' : 'Sync All Orders to MongoDB'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="min-h-[52px] px-8 rounded-xl bg-[#147D75] hover:bg-[#0E605A] text-white font-black text-[17px] flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>Save All Configuration Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
};
