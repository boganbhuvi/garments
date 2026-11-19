import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { 
  Ruler, 
  RotateCcw, 
  PlusCircle, 
  Calendar, 
  Info, 
  Sparkles, 
  Check, 
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { MeasurementRecord } from '../types/order';

export type MeasurementTemplateId = 
  | 'BLOUSE'
  | 'KURTI'
  | 'CHURIDAR'
  | 'SALWAR'
  | 'TOP'
  | 'BOTTOM'
  | 'CUSTOM';

interface TemplateConfig {
  id: MeasurementTemplateId;
  label: string;
  category: string;
  description: string;
  relevantFields: (keyof MeasurementRecord)[];
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'BLOUSE',
    label: 'Blouse',
    category: 'Traditional Saree Blouse',
    description: 'Upper body, apex, armhole, sleeve and neck depths',
    relevantFields: [
      'shoulder', 'chest', 'bust', 'upperBust', 'underBust', 'waist',
      'armhole', 'sleeveLength', 'sleeveRound', 'bicep',
      'frontNeckDepth', 'backNeckDepth', 'frontNeckWidth', 'backNeckWidth',
      'blouseLength'
    ]
  },
  {
    id: 'KURTI',
    label: 'Kurti',
    category: 'Kurti / Tunic / Anarkali',
    description: 'Shoulder, bust, waist, hip flare, sleeve and full length',
    relevantFields: [
      'shoulder', 'chest', 'bust', 'waist', 'hip',
      'armhole', 'sleeveLength', 'sleeveRound', 'bicep',
      'topLength', 'frontNeckDepth', 'backNeckDepth',
      'frontNeckWidth', 'backNeckWidth'
    ]
  },
  {
    id: 'CHURIDAR',
    label: 'Churidar',
    category: 'Churidar & Gathered Bottoms',
    description: 'Waist, hip, thigh, knee, calf, ankle and full length',
    relevantFields: [
      'waist', 'lowerWaist', 'hip', 'lowerHip',
      'thigh', 'knee', 'calf', 'ankle',
      'bottomLength', 'inseam', 'crotch'
    ]
  },
  {
    id: 'SALWAR',
    label: 'Salwar',
    category: 'Patiala & Salwar Pants',
    description: 'Waist, hip, thigh flare, knee, ankle and length',
    relevantFields: [
      'waist', 'lowerWaist', 'hip', 'lowerHip',
      'thigh', 'knee', 'ankle', 'bottomLength', 'outseam'
    ]
  },
  {
    id: 'TOP',
    label: 'Top',
    category: 'Western Top / Shirt / Crop Top',
    description: 'Shoulder, chest, bust, waist, hip, front & back length',
    relevantFields: [
      'shoulder', 'chest', 'bust', 'waist', 'hip',
      'armhole', 'sleeveLength', 'sleeveRound',
      'frontLength', 'backLength', 'frontNeckDepth', 'backNeckDepth'
    ]
  },
  {
    id: 'BOTTOM',
    label: 'Bottom',
    category: 'Trousers / Pants / Skirt',
    description: 'Waist, hip, inseam, outseam, bottom length and ankle',
    relevantFields: [
      'waist', 'lowerWaist', 'hip', 'lowerHip',
      'thigh', 'knee', 'bottomLength', 'inseam', 'ankle'
    ]
  },
  {
    id: 'CUSTOM',
    label: 'Custom / All',
    category: 'Comprehensive Master Ledger',
    description: 'Complete 30-point tailoring measurement ledger',
    relevantFields: [
      'shoulder', 'chest', 'bust', 'upperBust', 'underBust', 'waist', 'hip',
      'armhole', 'sleeveLength', 'sleeveRound', 'bicep', 'elbow', 'wrist',
      'blouseLength', 'topLength', 'frontLength', 'backLength',
      'frontNeckDepth', 'backNeckDepth', 'frontNeckWidth', 'backNeckWidth',
      'lowerWaist', 'lowerHip', 'thigh', 'knee', 'calf', 'ankle',
      'bottomLength', 'inseam', 'outseam', 'crotch'
    ]
  }
];

// Baseline standard values in inches
const BASELINE_PRESETS: Record<MeasurementTemplateId, Partial<Record<keyof MeasurementRecord, number>>> = {
  BLOUSE: {
    shoulder: 14.5,
    chest: 36.0,
    bust: 37.5,
    upperBust: 35.0,
    underBust: 31.0,
    waist: 30.0,
    armhole: 16.5,
    sleeveLength: 10.5,
    sleeveRound: 11.5,
    bicep: 13.0,
    frontNeckDepth: 7.0,
    backNeckDepth: 9.5,
    frontNeckWidth: 6.5,
    backNeckWidth: 6.5,
    blouseLength: 14.5
  },
  KURTI: {
    shoulder: 15.0,
    chest: 38.0,
    bust: 39.0,
    waist: 33.0,
    hip: 42.0,
    armhole: 17.0,
    sleeveLength: 16.0,
    sleeveRound: 11.0,
    bicep: 13.5,
    topLength: 42.0,
    frontNeckDepth: 6.5,
    backNeckDepth: 6.0,
    frontNeckWidth: 6.5,
    backNeckWidth: 6.5
  },
  CHURIDAR: {
    waist: 32.0,
    lowerWaist: 34.0,
    hip: 42.0,
    lowerHip: 43.0,
    thigh: 23.0,
    knee: 16.5,
    calf: 14.0,
    ankle: 10.5,
    bottomLength: 42.0,
    inseam: 31.0,
    crotch: 26.0
  },
  SALWAR: {
    waist: 34.0,
    lowerWaist: 36.0,
    hip: 44.0,
    lowerHip: 45.0,
    thigh: 26.0,
    knee: 18.0,
    ankle: 14.0,
    bottomLength: 39.0,
    outseam: 39.5
  },
  TOP: {
    shoulder: 14.5,
    chest: 36.5,
    bust: 37.5,
    waist: 31.0,
    hip: 39.5,
    armhole: 16.0,
    sleeveLength: 12.0,
    sleeveRound: 11.5,
    frontLength: 24.0,
    backLength: 24.5,
    frontNeckDepth: 6.5,
    backNeckDepth: 4.5
  },
  BOTTOM: {
    waist: 32.0,
    lowerWaist: 34.0,
    hip: 41.0,
    lowerHip: 42.0,
    thigh: 24.0,
    knee: 17.0,
    bottomLength: 38.5,
    inseam: 29.0,
    ankle: 13.0
  },
  CUSTOM: {
    shoulder: 14.5,
    chest: 36.0,
    bust: 37.5,
    upperBust: 35.0,
    underBust: 31.0,
    waist: 30.0,
    hip: 39.0,
    armhole: 16.5,
    sleeveLength: 10.5,
    sleeveRound: 11.5,
    bicep: 13.0,
    elbow: 11.0,
    wrist: 6.5,
    blouseLength: 14.5,
    topLength: 42.0,
    frontLength: 15.0,
    backLength: 14.5,
    frontNeckDepth: 7.0,
    backNeckDepth: 9.5,
    frontNeckWidth: 6.5,
    backNeckWidth: 6.5,
    lowerWaist: 32.0,
    lowerHip: 40.0,
    thigh: 22.0,
    knee: 16.0,
    calf: 14.0,
    ankle: 12.0,
    bottomLength: 38.0,
    inseam: 28.5,
    outseam: 38.5,
    crotch: 25.0
  }
};

// Normal bounds in inches for outlier validation (convert x2.54 for cm)
const FIELD_VALIDATION_BOUNDS: Partial<Record<keyof MeasurementRecord, { min: number; max: number }>> = {
  shoulder: { min: 11, max: 21 },
  chest: { min: 24, max: 58 },
  bust: { min: 24, max: 60 },
  upperBust: { min: 22, max: 56 },
  underBust: { min: 20, max: 52 },
  waist: { min: 20, max: 56 },
  hip: { min: 26, max: 62 },
  armhole: { min: 11, max: 25 },
  sleeveLength: { min: 3, max: 35 },
  sleeveRound: { min: 7, max: 25 },
  blouseLength: { min: 10, max: 22 },
  topLength: { min: 22, max: 58 },
  bottomLength: { min: 26, max: 54 },
  frontNeckDepth: { min: 3.5, max: 13 },
  backNeckDepth: { min: 2, max: 15 },
  thigh: { min: 14, max: 38 },
  knee: { min: 11, max: 28 },
  calf: { min: 9, max: 25 },
  ankle: { min: 8, max: 22 },
  inseam: { min: 20, max: 40 },
  crotch: { min: 18, max: 36 }
};

export const Page2Measurements: React.FC = () => {
  const { 
    order, 
    updateMeasurementField, 
    updateCustomMeasurementField,
    addCustomMeasurementField,
    setMeasurementUnit,
    showToast,
    syncStatus,
    abbreviationCodes
  } = useOrder();

  const unit = order.measurements.unit;

  // Selected Garment Template (Default: Blouse or match first garment category)
  const [selectedTemplate, setSelectedTemplate] = useState<MeasurementTemplateId>(() => {
    const firstCat = order.garmentSpecs[0]?.category?.toUpperCase();
    if (firstCat && firstCat.includes('KURTI')) return 'KURTI';
    if (firstCat && (firstCat.includes('CHURIDAR') || firstCat.includes('SALWAR'))) return 'CHURIDAR';
    if (firstCat && firstCat.includes('BOTTOM')) return 'BOTTOM';
    return 'BLOUSE';
  });

  // Dialog & Modal states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const currentTemplateConfig = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLabel.trim()) {
      addCustomMeasurementField(customCode.trim().toUpperCase(), customLabel.trim());
      setCustomCode('');
      setCustomLabel('');
      setShowAddCustom(false);
      showToast(`Added custom measurement field "${customLabel}"`, 'success');
    }
  };

  // Perform confirmed clear
  const executeClearAll = () => {
    const allKeys: (keyof MeasurementRecord)[] = [
      'shoulder', 'chest', 'bust', 'upperBust', 'underBust', 'waist', 'hip',
      'armhole', 'sleeveLength', 'sleeveRound', 'bicep', 'elbow', 'wrist',
      'blouseLength', 'topLength', 'frontLength', 'backLength',
      'frontNeckDepth', 'backNeckDepth', 'frontNeckWidth', 'backNeckWidth',
      'lowerWaist', 'lowerHip', 'thigh', 'knee', 'calf', 'ankle',
      'bottomLength', 'inseam', 'outseam', 'crotch'
    ];
    allKeys.forEach(k => updateMeasurementField(k, ''));
    order.measurements.customFields.forEach(cf => {
      updateCustomMeasurementField(cf.id, '');
    });
    setShowClearConfirm(false);
    showToast('Cleared all measurements to empty', 'info');
  };

  // Perform confirmed apply template
  const executeApplyTemplate = () => {
    const preset = BASELINE_PRESETS[selectedTemplate];
    if (!preset) return;

    const isCm = unit === 'cm';
    const conv = (valIn: number) => isCm ? Math.round(valIn * 2.54 * 10) / 10 : valIn;

    Object.entries(preset).forEach(([fieldKey, valIn]) => {
      if (typeof valIn === 'number') {
        updateMeasurementField(fieldKey as keyof MeasurementRecord, conv(valIn));
      }
    });

    setShowApplyConfirm(false);
    showToast(`Applied standard ${currentTemplateConfig.label} baseline measurements!`, 'success');
  };

  // Validate value for unusual high/low
  const getValidationWarning = (field: keyof MeasurementRecord, val: number | ''): string | null => {
    if (val === '' || typeof val !== 'number' || isNaN(val)) return null;

    const bounds = FIELD_VALIDATION_BOUNDS[field];
    if (!bounds) return null;

    const min = unit === 'cm' ? Math.round(bounds.min * 2.54) : bounds.min;
    const max = unit === 'cm' ? Math.round(bounds.max * 2.54) : bounds.max;

    if (val < min) {
      return `Unusual value: ${val} ${unit} is below typical range (${min}–${max} ${unit}). Please verify.`;
    }
    if (val > max) {
      return `Unusual value: ${val} ${unit} exceeds typical range (${min}–${max} ${unit}). Please verify.`;
    }
    return null;
  };

  type NumericalField = Exclude<keyof MeasurementRecord, 'id' | 'name' | 'unit' | 'date' | 'customFields' | 'notes' | 'rawMeasurements'>;

  // Single-column vertical field renderer: Label strictly above, full-width row, decimal acceptance
  const renderVerticalField = (
    label: string, 
    code: string | null, 
    field: NumericalField, 
    tooltip?: string
  ) => {
    const value = order.measurements[field];
    const warning = getValidationWarning(field, value);

    // Look up abbreviation code if configured
    const configuredAbbr = code && abbreviationCodes[code] ? abbreviationCodes[code] : null;

    return (
      <div className="flex flex-col gap-1.5 w-full bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-300 hover:border-[#147D75] transition-colors shadow-xs">
        {/* Label Row strictly above input */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-[17px] font-black text-[#233B5D] flex items-center gap-2">
            <span>{label}</span>
            {code && (
              <span 
                className={`text-[12px] px-2 py-0.5 rounded font-mono font-bold ${
                  configuredAbbr?.confirmed 
                    ? 'bg-[#147D75] text-white' 
                    : 'bg-[#233B5D] text-white'
                }`}
                title={configuredAbbr?.label ? `Tailor Code: ${configuredAbbr.label}` : code}
              >
                {code}
              </span>
            )}
          </label>

          {tooltip && (
            <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{tooltip}</span>
            </span>
          )}
        </div>

        {/* Input occupying 100% available width with clean Unit Suffix (No dropdown beside every field!) */}
        <div className="relative w-full">
          <input
            type="number"
            step="0.25"
            placeholder="0.0"
            value={value === '' ? '' : value}
            onChange={(e) => {
              const parsed = e.target.value === '' ? '' : parseFloat(e.target.value);
              updateMeasurementField(field, parsed);
            }}
            className="w-full min-h-[52px] pl-4 pr-16 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[20px] font-black text-[#191C1E] focus:outline-none placeholder:text-slate-300 transition-all shadow-inner"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-black text-slate-700 uppercase tracking-wider pointer-events-none">
            {unit}
          </div>
        </div>

        {/* Non-blocking Outlier Warning Badge */}
        {warning && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 p-2.5 rounded-xl animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    );
  };

  // Group fields into Upper, Neck, and Lower for the active template
  const isFieldInTemplate = (field: keyof MeasurementRecord) => {
    return currentTemplateConfig.relevantFields.includes(field);
  };

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      
      {/* ======================================================== */}
      {/* 1. TOP CONTROL BAR: Customer Header, Unit & Template Controls */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
        
        {/* Customer & Autosave Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#147D75]/10 flex items-center justify-center text-[#147D75] shadow-xs">
              <Ruler className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[12px] text-slate-500 uppercase font-black tracking-wider block">
                Customer Measurements Ledger
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-[#233B5D] leading-tight">
                  {order.customer.customerName || 'Customer'}
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono font-bold">
                  #{order.customer.customerId || order.id}
                </span>
              </div>
            </div>
          </div>

          {/* Autosave Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[13px] font-bold bg-slate-50 border-slate-200">
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

        {/* Global Unit Selector & Template Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* SEPARATE 1: Global Measurement Unit Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <label className="text-[14px] font-black text-[#233B5D] whitespace-nowrap">
              Measurement Unit:
            </label>
            <div className="inline-flex p-1 bg-slate-100 border border-slate-300 rounded-xl">
              <button
                type="button"
                onClick={() => setMeasurementUnit('in')}
                className={`px-4 py-2 rounded-lg font-black text-sm transition-all cursor-pointer ${
                  unit === 'in'
                    ? 'bg-[#233B5D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setMeasurementUnit('cm')}
                className={`px-4 py-2 rounded-lg font-black text-sm transition-all cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-[#147D75] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              (Auto-converts actual values mathematically)
            </span>
          </div>

          {/* Action Buttons: Apply Template & Clear All */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowApplyConfirm(true)}
              className="min-h-[44px] px-4 rounded-xl bg-[#233B5D] hover:bg-[#1A2C46] text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="Apply baseline standard measurements for this garment template"
            >
              <Sparkles className="w-4 h-4 text-[#99F2E8]" />
              <span>Apply Measurement Template</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-sm font-bold flex items-center gap-1.5 border border-slate-300 hover:border-red-300 transition-all cursor-pointer"
              title="Clear all measurement inputs to blank"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>

        </div>

        {/* SEPARATE 2: Measurement Template Selector */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-black text-[#233B5D]">
              Garment Measurement Template:
            </label>
            <span className="text-xs text-slate-500 font-semibold">
              {currentTemplateConfig.description}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`min-h-[44px] px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  selectedTemplate === tmpl.id
                    ? 'bg-[#147D75] text-white shadow-md ring-2 ring-[#147D75]/30'
                    : 'bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. COLLAPSIBLE: Measurement Code Reference (Tailor Shortcuts) */}
      {/* ======================================================== */}
      <details className="group border border-slate-300 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
        <summary className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-800 text-sm cursor-pointer flex items-center justify-between transition-colors list-none">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#147D75]" />
            <span className="text-[15px] font-black text-[#233B5D]">
              Measurement Code Reference (Tailor Shortcuts)
            </span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
              — Click to view & configure workshop abbreviations
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
        </summary>

        <div className="p-5 border-t border-slate-200 bg-white flex flex-col gap-4 text-xs font-semibold text-slate-700">
          <p className="text-slate-600 text-sm">
            Standard workshop tailoring abbreviations. <strong>SH = Shoulder</strong> is confirmed. Other codes can be referenced or customized:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-emerald-900 font-mono text-sm block">SH</strong>
                <span className="text-emerald-800">Shoulder Width</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                Confirmed
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-mono text-sm block">SL</strong>
                <span className="text-slate-700">Sleeve Length</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                Tailor Code
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-mono text-sm block">AH</strong>
                <span className="text-slate-700">Armhole Depth</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                Tailor Code
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-mono text-sm block">BH / L</strong>
                <span className="text-slate-700">Blouse Height / Length</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                Configurable
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-mono text-sm block">FNN</strong>
                <span className="text-slate-700">Front Neck Depth</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                Configurable
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-mono text-sm block">BN</strong>
                <span className="text-slate-700">Back Neck Depth</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                Configurable
              </span>
            </div>
          </div>
        </div>
      </details>

      {/* ======================================================== */}
      {/* 3. STRICT SINGLE-COLUMN VERTICAL FORM SECTIONS */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-6">

        {/* SECTION 1: UPPER BODY & BLOUSE */}
        {(isFieldInTemplate('shoulder') || isFieldInTemplate('bust') || isFieldInTemplate('waist') || isFieldInTemplate('blouseLength') || isFieldInTemplate('topLength')) && (
          <div id="section-upper" className="scroll-mt-36 bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#233B5D] text-white flex items-center justify-center font-black text-[14px]">
                  1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#233B5D]">
                  Upper Body & Torso Dimensions ({currentTemplateConfig.label})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                {unit === 'in' ? 'Inches' : 'Centimeters'}
              </span>
            </div>

            {/* SINGLE COLUMN VERTICAL FORM: One field per vertical row */}
            <div className="flex flex-col gap-4 w-full">
              {isFieldInTemplate('shoulder') && renderVerticalField('Shoulder Width', 'SH', 'shoulder', 'Shoulder seam to shoulder seam')}
              {isFieldInTemplate('chest') && renderVerticalField('Full Chest Circumference', null, 'chest', 'Across the widest chest point')}
              {isFieldInTemplate('bust') && renderVerticalField('Bust Point (Apex)', null, 'bust', 'Apex point measurement')}
              {isFieldInTemplate('upperBust') && renderVerticalField('Upper Bust', null, 'upperBust', 'Directly under armpits')}
              {isFieldInTemplate('underBust') && renderVerticalField('Under Bust', null, 'underBust', 'Directly below the bust')}
              {isFieldInTemplate('waist') && renderVerticalField('Natural Waistline', null, 'waist', 'Natural narrowest waistline')}
              {isFieldInTemplate('hip') && renderVerticalField('Hip Round', null, 'hip', 'Around the widest hip line')}
              {isFieldInTemplate('armhole') && renderVerticalField('Armhole Depth', 'AH', 'armhole', 'Armhole drop circumference')}
              {isFieldInTemplate('sleeveLength') && renderVerticalField('Sleeve Length', 'SL', 'sleeveLength', 'Shoulder point to sleeve hem')}
              {isFieldInTemplate('sleeveRound') && renderVerticalField('Sleeve Round (Hem Opening)', null, 'sleeveRound', 'Hem round circumference')}
              {isFieldInTemplate('bicep') && renderVerticalField('Bicep Round', null, 'bicep', 'Upper arm fullness')}
              {isFieldInTemplate('elbow') && renderVerticalField('Elbow Round', null, 'elbow', 'Elbow level circumference')}
              {isFieldInTemplate('wrist') && renderVerticalField('Wrist Round', null, 'wrist', 'Cuff round opening')}
              {isFieldInTemplate('blouseLength') && renderVerticalField('Blouse Length / Height', 'BH / L', 'blouseLength', 'Shoulder point to blouse hem')}
              {isFieldInTemplate('topLength') && renderVerticalField('Top / Kurti Length', null, 'topLength', 'Shoulder to kurti bottom hem')}
              {isFieldInTemplate('frontLength') && renderVerticalField('Front Length', null, 'frontLength', 'Front shoulder to hem')}
              {isFieldInTemplate('backLength') && renderVerticalField('Back Length', null, 'backLength', 'Back center line length')}
            </div>
          </div>
        )}

        {/* SECTION 2: NECK & COLLAR SPECIFICATIONS */}
        {(isFieldInTemplate('frontNeckDepth') || isFieldInTemplate('backNeckDepth') || isFieldInTemplate('frontNeckWidth') || isFieldInTemplate('backNeckWidth')) && (
          <div id="section-neck" className="scroll-mt-36 bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#147D75] text-white flex items-center justify-center font-black text-[14px]">
                  2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#233B5D]">
                  Neck & Collar Dimensions
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                Depths & Widths
              </span>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {isFieldInTemplate('frontNeckDepth') && renderVerticalField('Front Neck Depth', 'FNN', 'frontNeckDepth', 'HPS to front neckline center')}
              {isFieldInTemplate('backNeckDepth') && renderVerticalField('Back Neck Depth', 'BN', 'backNeckDepth', 'HPS to back neckline drop')}
              {isFieldInTemplate('frontNeckWidth') && renderVerticalField('Front Neck Width', null, 'frontNeckWidth', 'Width across neckline front')}
              {isFieldInTemplate('backNeckWidth') && renderVerticalField('Back Neck Width', null, 'backNeckWidth', 'Width across neckline back')}
            </div>
          </div>
        )}

        {/* SECTION 3: LOWER BODY & BOTTOMS */}
        {(isFieldInTemplate('thigh') || isFieldInTemplate('knee') || isFieldInTemplate('calf') || isFieldInTemplate('ankle') || isFieldInTemplate('bottomLength') || isFieldInTemplate('inseam') || isFieldInTemplate('crotch') || isFieldInTemplate('outseam')) && (
          <div id="section-lower" className="scroll-mt-36 bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#16834A] text-white flex items-center justify-center font-black text-[14px]">
                  3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#233B5D]">
                  Lower Body & Bottom Measurements
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                Churidar, Salwar & Pants
              </span>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {isFieldInTemplate('lowerWaist') && renderVerticalField('Lower Waist / Navel', null, 'lowerWaist', 'Bottom tying waistline')}
              {isFieldInTemplate('lowerHip') && renderVerticalField('Seat / Lower Hip', null, 'lowerHip', 'Around the seat')}
              {isFieldInTemplate('thigh') && renderVerticalField('Thigh Circumference', null, 'thigh', 'Fullest thigh round')}
              {isFieldInTemplate('knee') && renderVerticalField('Knee Round', null, 'knee', 'Knee level circumference')}
              {isFieldInTemplate('calf') && renderVerticalField('Calf Round', null, 'calf', 'Calf fullness circumference')}
              {isFieldInTemplate('ankle') && renderVerticalField('Ankle Round (Mori Opening)', null, 'ankle', 'Bottom hem opening')}
              {isFieldInTemplate('bottomLength') && renderVerticalField('Total Bottom Length', null, 'bottomLength', 'Waist to ankle hem')}
              {isFieldInTemplate('inseam') && renderVerticalField('Inseam Length', null, 'inseam', 'Crotch seam to bottom hem')}
              {isFieldInTemplate('outseam') && renderVerticalField('Outseam Length', null, 'outseam', 'Waistband to outer hem')}
              {isFieldInTemplate('crotch') && renderVerticalField('Crotch Depth / Rise', null, 'crotch', 'Waist to crotch depth')}
            </div>
          </div>
        )}

        {/* SECTION 4: CUSTOM FIELDS & WORKSHOP HANDWRITTEN NOTES */}
        <div id="section-notes" className="scroll-mt-36 bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center font-black text-[14px]">
                4
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#233B5D]">
                Custom Tailor Codes & Workshop Notes
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="px-3.5 py-2 bg-[#147D75] hover:bg-[#0E605A] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Custom Code</span>
            </button>
          </div>

          {/* Add custom code form */}
          {showAddCustom && (
            <form onSubmit={handleAddCustom} className="bg-slate-50 p-4 rounded-xl border border-slate-300 flex flex-col gap-3 animate-in fade-in">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs font-bold text-slate-700">Code Abbreviation (e.g. BD, SW):</label>
                <input
                  type="text"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  placeholder="e.g. BD"
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs font-bold text-slate-700">Label Name:</label>
                <input
                  type="text"
                  required
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  placeholder="e.g. Body Drop / Back Slit Height"
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#147D75] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Custom fields - Vertical Single Column */}
          {order.measurements.customFields.length > 0 && (
            <div className="flex flex-col gap-3">
              {order.measurements.customFields.map((cf) => (
                <div key={cf.id} className="flex flex-col gap-1.5 w-full bg-slate-50 p-4 rounded-xl border border-slate-300">
                  <label className="text-[16px] font-bold text-[#233B5D]">
                    {cf.label} ({cf.code || 'CUSTOM'}):
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      step="0.25"
                      value={cf.value === '' ? '' : cf.value}
                      onChange={(e) => updateCustomMeasurementField(cf.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="0.0"
                      className="w-full min-h-[50px] pl-4 pr-16 bg-white border-2 border-slate-300 rounded-xl text-[19px] font-bold text-[#191C1E]"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-black text-slate-700 uppercase pointer-events-none">
                      {unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Workshop Handwritten Notes / Fitting Alterations */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[17px] font-black text-[#233B5D]">
              Special Instructions & Workshop Notes (Space for Tailor / Cutter):
            </label>
            <textarea
              rows={3}
              value={order.measurements.notes}
              onChange={(e) => updateMeasurementField('notes', e.target.value)}
              placeholder="e.g. Slant shoulder on right side, keep 2 inches inner margin, customer prefers extra ease at bust..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-medium text-[#191C1E] focus:outline-none resize-none"
            />
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. CONFIRMATION MODALS: Apply Template & Clear All */}
      {/* ======================================================== */}

      {/* Apply Template Confirmation Modal */}
      {showApplyConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#233B5D]">
              <div className="w-10 h-10 rounded-xl bg-[#233B5D]/10 flex items-center justify-center text-[#233B5D]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black">Apply {currentTemplateConfig.label} Baseline?</h3>
            </div>

            <p className="text-sm text-slate-600 font-medium">
              This will populate standard baseline sizing measurements for <strong>{currentTemplateConfig.label}</strong> in <strong>{unit === 'in' ? 'Inches' : 'Centimeters'}</strong>. Any previously entered values for these fields will be replaced with baseline numbers.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowApplyConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeApplyTemplate}
                className="px-5 py-2.5 rounded-xl bg-[#233B5D] hover:bg-[#1A2C46] text-white text-sm font-black shadow-md cursor-pointer"
              >
                Apply Baseline Values
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Destructive Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-300 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black">Clear All Measurements?</h3>
            </div>

            <p className="text-sm text-slate-600 font-medium">
              Are you sure you want to clear all entered measurements for this customer? All measurement fields on this order will be reset to empty.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearAll}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black shadow-md cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
