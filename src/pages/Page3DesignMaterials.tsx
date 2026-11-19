import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Upload, 
  Image as ImageIcon, 
  Scissors, 
  CheckCircle, 
  Layers, 
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ChevronDown,
  Eye,
  Palette
} from 'lucide-react';
import { 
  SLEEVE_OPTIONS, 
  GARMENT_CUT_OPTIONS, 
  NECK_PATTERNS, 
  BOTTOM_STYLES 
} from '../data/defaultTemplates';
import { 
  VisualPickerModal, 
  FRONT_NECK_OPTIONS, 
  BACK_NECK_OPTIONS, 
  SLEEVE_STYLE_OPTIONS, 
  GARMENT_CUT_STYLE_OPTIONS, 
  REGIONAL_STYLE_OPTIONS, 
  FASTENING_OPTIONS,
  getVisualDiagram 
} from '../components/design/TailoringVisualGuide';
import { GarmentSpecification, MaterialItem, MaterialSource } from '../types/order';

export const Page3DesignMaterials: React.FC = () => {
  const { 
    order, 
    updateGarmentSpec, 
    addGarmentSpec, 
    removeGarmentSpec, 
    duplicateGarmentSpec,
    showToast
  } = useOrder();

  const [activeGarmentIndex, setActiveGarmentIndex] = useState(0);

  const [visualModalConfig, setVisualModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    options: any[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }>({
    isOpen: false,
    title: '',
    options: [],
    selectedValue: '',
    onSelect: () => {}
  });

  const openVisualPicker = (title: string, options: any[], selectedValue: string, onSelect: (val: string) => void) => {
    setVisualModalConfig({
      isOpen: true,
      title,
      options,
      selectedValue,
      onSelect
    });
  };

  const activeSpec: GarmentSpecification | undefined = order.garmentSpecs[activeGarmentIndex] || order.garmentSpecs[0];

  if (!activeSpec) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#233B5D]/10 text-[#233B5D] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[#233B5D]">No Garments Configured Yet</h3>
        <p className="text-[16px] text-[#64748B] max-w-md mx-auto">
          Set garment quantities in <strong>Step 01 (Customer Info)</strong> or click below to add a garment directly to this order.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <button
            type="button"
            onClick={() => addGarmentSpec('Blouses')}
            className="px-5 py-3 bg-[#233B5D] hover:bg-[#1a2d47] text-white font-bold text-[16px] rounded-xl shadow cursor-pointer transition-all"
          >
            + Add Blouse
          </button>
          <button
            type="button"
            onClick={() => addGarmentSpec('Kurtis')}
            className="px-5 py-3 bg-[#147D75] hover:bg-[#0e605a] text-white font-bold text-[16px] rounded-xl shadow cursor-pointer transition-all"
          >
            + Add Kurti / Top
          </button>
        </div>
      </div>
    );
  }

  const isBlouse = activeSpec.category.toLowerCase().includes('blouse');
  const isKurti = activeSpec.category.toLowerCase().includes('kurti') || activeSpec.category.toLowerCase().includes('top');
  const isBottom = activeSpec.category.toLowerCase().includes('bottom') || activeSpec.category.toLowerCase().includes('pant') || activeSpec.category.toLowerCase().includes('churidar') || activeSpec.category.toLowerCase().includes('salwar');
  const isSaree = activeSpec.category.toLowerCase().includes('saree') || activeSpec.category.toLowerCase().includes('fall');

  // Handle local image upload (converts file to base64 for persistent storage in LocalStorage)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const newImg = {
        id: `img-${Date.now()}`,
        url: base64Url,
        title: file.name,
        notes: 'Uploaded from device camera/gallery'
      };

      updateGarmentSpec(activeGarmentIndex, {
        referenceImages: [...activeSpec.referenceImages, newImg]
      });
      showToast(`Uploaded reference image for ${activeSpec.title}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imgId: string) => {
    updateGarmentSpec(activeGarmentIndex, {
      referenceImages: activeSpec.referenceImages.filter(img => img.id !== imgId)
    });
    showToast('Reference image removed', 'info');
  };

  // Material helpers
  const handleAddMaterial = () => {
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      category: isBlouse ? 'Blouse Material' : isKurti ? 'Top Material' : isBottom ? 'Bottom Material' : 'Additional Material',
      name: 'Customer Sourced Material',
      quantity: '1.0 Mtr',
      source: 'Self Material',
      receivedStatus: 'Received',
      notes: ''
    };
    updateGarmentSpec(activeGarmentIndex, {
      materials: [...activeSpec.materials, newMat]
    });
  };

  const updateMaterialItem = (matId: string, fields: Partial<MaterialItem>) => {
    const updated = activeSpec.materials.map(m => m.id === matId ? { ...m, ...fields } : m);
    updateGarmentSpec(activeGarmentIndex, { materials: updated });
  };

  const removeMaterialItem = (matId: string) => {
    const filtered = activeSpec.materials.filter(m => m.id !== matId);
    updateGarmentSpec(activeGarmentIndex, { materials: filtered });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Top Banner: Overview of Manifest */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#233B5D]" />
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#233B5D]">
              Garment Design & Material Specifications
            </h2>
          </div>
          <span className="text-[14px] bg-[#D3E4FE] text-[#0B1C30] px-3 py-1 rounded-full font-bold">
            {order.garmentSpecs.length} Active Items
          </span>
        </div>

        <button
          type="button"
          onClick={() => addGarmentSpec('Blouse')}
          className="min-h-[44px] px-4 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white font-bold text-[15px] flex items-center gap-1.5 shadow-sm ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Garment</span>
        </button>
      </div>

      {/* Horizontal Scope Tabs: One tab per individual garment piece */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {order.garmentSpecs.map((spec, index) => {
          const isActive = index === activeGarmentIndex;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => setActiveGarmentIndex(index)}
              className={`min-h-[48px] px-4 rounded-t-xl font-bold text-[16px] flex items-center gap-2.5 transition-all whitespace-nowrap border-t-2 ${
                isActive
                  ? 'bg-white text-[#233B5D] border-t-[#147D75] shadow-sm border-x border-[#CBD5E1]'
                  : 'bg-[#E2E8F0] text-[#475569] border-t-transparent hover:bg-[#CBD5E1]'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#147D75]' : 'bg-[#94A3B8]'}`} />
              <span>{spec.title || `${spec.category} ${(index + 1).toString().padStart(2, '0')}`}</span>
              <span className={`text-[12px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isActive ? 'bg-[#233B5D] text-white' : 'bg-[#CBD5E1] text-[#334155]'
              }`}>
                #{index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Spec Card for Active Garment */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-[#CBD5E1] shadow-sm p-5 sm:p-7 flex flex-col gap-7 -mt-2">
        
        {/* Active Garment Subhead Toolbar */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={activeSpec.title}
                onChange={(e) => updateGarmentSpec(activeGarmentIndex, { title: e.target.value })}
                className="text-[20px] sm:text-[24px] font-bold text-[#233B5D] bg-transparent border-b border-dashed border-[#64748B] focus:border-[#147D75] focus:outline-none px-1"
              />
              <span className="text-[13px] bg-[#147D75] text-white px-2.5 py-1 rounded font-bold uppercase tracking-wide">
                {activeSpec.category}
              </span>
            </div>
            <span className="text-[14px] text-[#64748B] font-medium">
              Item #{activeGarmentIndex + 1} of {order.garmentSpecs.length} in Order #{order.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Duplicate to another garment */}
            <button
              type="button"
              onClick={() => {
                if (order.garmentSpecs.length > activeGarmentIndex + 1) {
                  duplicateGarmentSpec(activeGarmentIndex, activeGarmentIndex + 1);
                } else {
                  duplicateGarmentSpec(activeGarmentIndex);
                }
              }}
              className="min-h-[44px] px-3.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#233B5D] text-[15px] font-bold flex items-center gap-1.5 shadow-sm"
              title="Duplicate this garment's design specifications"
            >
              <Copy className="w-4 h-4 text-[#147D75]" />
              <span>Duplicate Spec</span>
            </button>

            {/* Remove Garment */}
            {order.garmentSpecs.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  removeGarmentSpec(activeGarmentIndex);
                  setActiveGarmentIndex(Math.max(0, activeGarmentIndex - 1));
                }}
                className="min-h-[44px] px-3.5 rounded-lg border border-[#D64545] text-[#D64545] hover:bg-[#FFDAD6] text-[15px] font-bold flex items-center gap-1.5"
                title="Remove this garment from order"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: MATERIAL DETAILS & INVENTORY CHECKLIST */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#233B5D] text-white flex items-center justify-center font-bold text-[14px]">
                1
              </span>
              <h3 className="text-[20px] font-bold text-[#233B5D]">
                Material Details & Inventory Checklist
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="min-h-[38px] px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#233B5D] text-[14px] font-bold flex items-center gap-1 border border-[#CBD5E1]"
            >
              <Plus className="w-3.5 h-3.5 text-[#147D75]" />
              <span>+ Add Material Row</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {activeSpec.materials.map((mat, matIdx) => (
              <div key={mat.id} className="bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] uppercase font-bold text-[#64748B]">
                    {mat.category}
                  </span>
                  {activeSpec.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterialItem(mat.id)}
                      className="text-[#D64545] hover:text-[#BA1A1A]"
                      title="Remove material row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-[#233B5D]">Material / Fabric Name:</label>
                  <input
                    type="text"
                    value={mat.name}
                    onChange={(e) => updateMaterialItem(mat.id, { name: e.target.value })}
                    placeholder="e.g. Raw Silk / Cotton Rubia"
                    className="w-full min-h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-lg text-[16px] font-semibold text-[#191C1E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-bold text-[#233B5D]">Quantity / Meters:</label>
                    <input
                      type="text"
                      value={mat.quantity}
                      onChange={(e) => updateMaterialItem(mat.id, { quantity: e.target.value })}
                      placeholder="1.25 Mtrs"
                      className="w-full min-h-[44px] px-3 bg-white border border-[#CBD5E1] rounded-lg text-[16px] font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-bold text-[#233B5D]">Material Source:</label>
                    <select
                      value={mat.source}
                      onChange={(e) => updateMaterialItem(mat.id, { source: e.target.value as MaterialSource })}
                      className="w-full min-h-[44px] px-2 bg-white border border-[#CBD5E1] rounded-lg text-[15px] font-bold text-[#233B5D]"
                    >
                      <option value="Self Material">Self Material (Customer)</option>
                      <option value="Shop Material">Shop Material (Giriraj)</option>
                      <option value="To Be Purchased">To Be Purchased</option>
                      <option value="Pending">Pending Clearance</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-[#233B5D]">Received Status / Bin Note:</label>
                  <select
                    value={mat.receivedStatus}
                    onChange={(e) => updateMaterialItem(mat.id, { receivedStatus: e.target.value as any })}
                    className="w-full min-h-[42px] px-2 bg-white border border-[#CBD5E1] rounded-lg text-[15px] font-semibold"
                  >
                    <option value="Received">Physically Handed Over</option>
                    <option value="In Stock">In Store Stock</option>
                    <option value="Pending">Pending from Customer</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: STITCHING & TAILORING SPECIFICATIONS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#147D75] text-white flex items-center justify-center font-bold text-[14px]">
                2
              </span>
              <h3 className="text-[20px] font-bold text-[#233B5D]">
                Stitching & Tailoring Specifications (Ledger Notation)
              </h3>
            </div>
            <span className="text-[14px] text-[#64748B] font-semibold">
              Category: {activeSpec.category}
            </span>
          </div>

          <div className="flex flex-col gap-5 w-full">
            
            {/* 1. Garment Cut / BH Type */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                  <span>Garment Cut / Type</span>
                  <span className="text-[#D64545] font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => openVisualPicker(
                    'Select Garment Cut / Style',
                    GARMENT_CUT_STYLE_OPTIONS,
                    activeSpec.garmentType,
                    (val) => updateGarmentSpec(activeGarmentIndex, { garmentType: val })
                  )}
                  className="text-xs font-bold text-[#147D75] hover:text-[#0E605A] flex items-center gap-1 bg-[#F0FDFA] px-2 py-1 rounded border border-[#99F6E4] cursor-pointer"
                  title="View full picture gallery"
                >
                  <Eye className="w-3.5 h-3.5 text-[#147D75]" />
                  <span>Visual Guide</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {/* SVG Visual Diagram */}
                <div 
                  onClick={() => openVisualPicker(
                    'Select Garment Cut / Style',
                    GARMENT_CUT_STYLE_OPTIONS,
                    activeSpec.garmentType,
                    (val) => updateGarmentSpec(activeGarmentIndex, { garmentType: val })
                  )}
                  className="w-14 h-14 rounded-lg bg-white border border-[#CBD5E1] p-1 flex-shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-[#147D75] transition-colors"
                  title="Click to change visual pattern"
                >
                  {getVisualDiagram('garmentCut', activeSpec.garmentType).svg}
                </div>

                {/* Dropdown Select */}
                <div className="flex-1">
                  <select
                    value={activeSpec.garmentType}
                    onChange={(e) => updateGarmentSpec(activeGarmentIndex, { garmentType: e.target.value })}
                    className="w-full min-h-[50px] px-3 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                  >
                    {GARMENT_CUT_STYLE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    {!GARMENT_CUT_STYLE_OPTIONS.some(o => o.id === activeSpec.garmentType) && (
                      <option value={activeSpec.garmentType}>{activeSpec.garmentType}</option>
                    )}
                  </select>
                </div>
              </div>
              <span className="text-xs text-[#64748B] font-medium truncate">
                {getVisualDiagram('garmentCut', activeSpec.garmentType).sublabel}
              </span>
            </div>

            {/* 2. Sleeve Style (SL) */}
            {!isBottom && !isSaree && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                    <span>Sleeve Style (SL)</span>
                    <span className="text-[#D64545] font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openVisualPicker(
                      'Select Sleeve Length & Style',
                      SLEEVE_STYLE_OPTIONS,
                      activeSpec.sleeveType,
                      (val) => updateGarmentSpec(activeGarmentIndex, { sleeveType: val })
                    )}
                    className="text-xs font-bold text-[#147D75] hover:text-[#0E605A] flex items-center gap-1 bg-[#F0FDFA] px-2 py-1 rounded border border-[#99F6E4] cursor-pointer"
                    title="View full sleeve drawings"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#147D75]" />
                    <span>Visual Guide</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div 
                    onClick={() => openVisualPicker(
                      'Select Sleeve Length & Style',
                      SLEEVE_STYLE_OPTIONS,
                      activeSpec.sleeveType,
                      (val) => updateGarmentSpec(activeGarmentIndex, { sleeveType: val })
                    )}
                    className="w-14 h-14 rounded-lg bg-white border border-[#CBD5E1] p-1 flex-shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-[#147D75] transition-colors"
                    title="Click to change sleeve"
                  >
                    {getVisualDiagram('sleeve', activeSpec.sleeveType).svg}
                  </div>

                  <div className="flex-1">
                    <select
                      value={activeSpec.sleeveType}
                      onChange={(e) => updateGarmentSpec(activeGarmentIndex, { sleeveType: e.target.value })}
                      className="w-full min-h-[50px] px-3 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                    >
                      {SLEEVE_STYLE_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                      {!SLEEVE_STYLE_OPTIONS.some(o => o.id === activeSpec.sleeveType) && (
                        <option value={activeSpec.sleeveType}>{activeSpec.sleeveType}</option>
                      )}
                    </select>
                  </div>
                </div>
                <span className="text-xs text-[#64748B] font-medium truncate">
                  {getVisualDiagram('sleeve', activeSpec.sleeveType).sublabel}
                </span>
              </div>
            )}

            {/* 3. Lining Preference */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
              <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                <span>Lining Preference</span>
                <span className="text-[#D64545] font-bold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 min-h-[50px]">
                {[
                  { id: 'Yes', label: 'Yes', desc: 'With Cotton' },
                  { id: 'No', label: 'No', desc: 'Single Layer' },
                  { id: 'Double', label: 'Double', desc: '2x Lining' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateGarmentSpec(activeGarmentIndex, { lining: opt.id as any })}
                    className={`rounded-lg font-bold text-[15px] border-2 flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                      activeSpec.lining === opt.id
                        ? 'bg-[#233B5D] text-white border-[#233B5D] shadow-sm'
                        : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className={`text-[10px] line-clamp-1 ${activeSpec.lining === opt.id ? 'text-teal-200' : 'text-slate-400'}`}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-xs text-[#64748B] font-medium">
                {activeSpec.lining === 'Yes' ? '✓ Includes pre-shrunk cotton voile lining' : activeSpec.lining === 'Double' ? '✓ Heavy bridal double lining (Satin + Cotton)' : '✓ Unlined sheer / single layer'}
              </span>
            </div>

            {/* 4. Front Neck Pattern */}
            {!isBottom && !isSaree && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                    <span>Front Neck Pattern</span>
                    <span className="text-[#D64545] font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openVisualPicker(
                      'Select Front Neck Pattern',
                      FRONT_NECK_OPTIONS,
                      activeSpec.frontNeckDesign,
                      (val) => updateGarmentSpec(activeGarmentIndex, { frontNeckDesign: val })
                    )}
                    className="text-xs font-bold text-[#147D75] hover:text-[#0E605A] flex items-center gap-1 bg-[#F0FDFA] px-2 py-1 rounded border border-[#99F6E4] cursor-pointer"
                    title="View neck drawings"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#147D75]" />
                    <span>Visual Guide</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div 
                    onClick={() => openVisualPicker(
                      'Select Front Neck Pattern',
                      FRONT_NECK_OPTIONS,
                      activeSpec.frontNeckDesign,
                      (val) => updateGarmentSpec(activeGarmentIndex, { frontNeckDesign: val })
                    )}
                    className="w-14 h-14 rounded-lg bg-white border border-[#CBD5E1] p-1 flex-shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-[#147D75] transition-colors"
                    title="Click to view neck diagrams"
                  >
                    {getVisualDiagram('frontNeck', activeSpec.frontNeckDesign).svg}
                  </div>

                  <div className="flex-1">
                    <select
                      value={activeSpec.frontNeckDesign}
                      onChange={(e) => updateGarmentSpec(activeGarmentIndex, { frontNeckDesign: e.target.value })}
                      className="w-full min-h-[50px] px-3 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                    >
                      {FRONT_NECK_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                      {!FRONT_NECK_OPTIONS.some(o => o.id === activeSpec.frontNeckDesign) && (
                        <option value={activeSpec.frontNeckDesign}>{activeSpec.frontNeckDesign}</option>
                      )}
                    </select>
                  </div>
                </div>
                <span className="text-xs text-[#64748B] font-medium truncate">
                  {getVisualDiagram('frontNeck', activeSpec.frontNeckDesign).sublabel}
                </span>
              </div>
            )}

            {/* 5. Back Neck Pattern & Depth */}
            {!isBottom && !isSaree && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                    <span>Back Neck Pattern & Depth</span>
                    <span className="text-[#D64545] font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openVisualPicker(
                      'Select Back Neck Pattern & Depth',
                      BACK_NECK_OPTIONS,
                      activeSpec.backNeckDesign,
                      (val) => updateGarmentSpec(activeGarmentIndex, { backNeckDesign: val })
                    )}
                    className="text-xs font-bold text-[#147D75] hover:text-[#0E605A] flex items-center gap-1 bg-[#F0FDFA] px-2 py-1 rounded border border-[#99F6E4] cursor-pointer"
                    title="View back neck drawings"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#147D75]" />
                    <span>Visual Guide</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div 
                    onClick={() => openVisualPicker(
                      'Select Back Neck Pattern & Depth',
                      BACK_NECK_OPTIONS,
                      activeSpec.backNeckDesign,
                      (val) => updateGarmentSpec(activeGarmentIndex, { backNeckDesign: val })
                    )}
                    className="w-14 h-14 rounded-lg bg-white border border-[#CBD5E1] p-1 flex-shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-[#147D75] transition-colors"
                    title="Click to view back diagrams"
                  >
                    {getVisualDiagram('backNeck', activeSpec.backNeckDesign).svg}
                  </div>

                  <div className="flex-1">
                    <select
                      value={activeSpec.backNeckDesign}
                      onChange={(e) => updateGarmentSpec(activeGarmentIndex, { backNeckDesign: e.target.value })}
                      className="w-full min-h-[50px] px-3 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                    >
                      {BACK_NECK_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                      {!BACK_NECK_OPTIONS.some(o => o.id === activeSpec.backNeckDesign) && (
                        <option value={activeSpec.backNeckDesign}>{activeSpec.backNeckDesign}</option>
                      )}
                    </select>
                  </div>
                </div>
                <span className="text-xs text-[#64748B] font-medium truncate">
                  {getVisualDiagram('backNeck', activeSpec.backNeckDesign).sublabel}
                </span>
              </div>
            )}

            {/* 6. Fastening / Closure */}
            {!isBottom && !isSaree && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                    <span>Fastening / Closure</span>
                    <span className="text-[#D64545] font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openVisualPicker(
                      'Select Fastening / Closure Type',
                      FASTENING_OPTIONS,
                      activeSpec.frontHookOrBack,
                      (val) => updateGarmentSpec(activeGarmentIndex, { frontHookOrBack: val as any })
                    )}
                    className="text-xs font-bold text-[#147D75] hover:text-[#0E605A] flex items-center gap-1 bg-[#F0FDFA] px-2 py-1 rounded border border-[#99F6E4] cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#147D75]" />
                    <span>Visual Guide</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div 
                    onClick={() => openVisualPicker(
                      'Select Fastening / Closure Type',
                      FASTENING_OPTIONS,
                      activeSpec.frontHookOrBack,
                      (val) => updateGarmentSpec(activeGarmentIndex, { frontHookOrBack: val as any })
                    )}
                    className="w-14 h-14 rounded-lg bg-white border border-[#CBD5E1] p-1 flex-shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-[#147D75] transition-colors"
                  >
                    {getVisualDiagram('fastening', activeSpec.frontHookOrBack).svg}
                  </div>

                  <div className="flex-1">
                    <select
                      value={activeSpec.frontHookOrBack}
                      onChange={(e) => updateGarmentSpec(activeGarmentIndex, { frontHookOrBack: e.target.value as any })}
                      className="w-full min-h-[50px] px-3 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                    >
                      {FASTENING_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <span className="text-xs text-[#64748B] font-medium truncate">
                  {getVisualDiagram('fastening', activeSpec.frontHookOrBack).sublabel}
                </span>
              </div>
            )}

            {/* 7. Fitting Preference */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
              <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                <span>Fitting Preference</span>
                <span className="text-[#D64545] font-bold">*</span>
              </label>

              <select
                value={activeSpec.fitting}
                onChange={(e) => updateGarmentSpec(activeGarmentIndex, { fitting: e.target.value as any })}
                className="w-full min-h-[50px] px-3.5 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
              >
                <option value="Tight">Tight (Snug Body-fit • 0.5 in margin)</option>
                <option value="M+">M+ (Fitted Standard • 1.5 in inner margin)</option>
                <option value="Medium">Medium (Comfortable Regular • 2.0 in margin)</option>
                <option value="Loose Fit">Loose Fit (Relaxed flow • 2.5 in margin)</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-[#147D75] font-bold bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                <span>✓ Seam Margin:</span>
                <span className="text-slate-800">
                  {activeSpec.fitting === 'Tight' ? '0.5 in inner margin' : activeSpec.fitting === 'M+' ? '1.5 in inner margin' : activeSpec.fitting === 'Medium' ? '2.0 in inner margin' : '2.5 in inner margin'}
                </span>
              </div>
            </div>

            {/* 8. Regional & Traditional Style Notation */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-1">
                  <span>Regional & Traditional Style</span>
                </label>
                <button
                  type="button"
                  onClick={() => openVisualPicker(
                    'Select Regional / Traditional Style',
                    REGIONAL_STYLE_OPTIONS,
                    activeSpec.regionalStyle,
                    (val) => updateGarmentSpec(activeGarmentIndex, { regionalStyle: val })
                  )}
                  className="text-xs font-bold text-[#147D75] hover:text-[#0E605A] flex items-center gap-1 bg-[#F0FDFA] px-2 py-1 rounded border border-[#99F6E4] cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#147D75]" />
                  <span>Visual Guide</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <div 
                  onClick={() => openVisualPicker(
                    'Select Regional / Traditional Style',
                    REGIONAL_STYLE_OPTIONS,
                    activeSpec.regionalStyle,
                    (val) => updateGarmentSpec(activeGarmentIndex, { regionalStyle: val })
                  )}
                  className="w-14 h-14 rounded-lg bg-white border border-[#CBD5E1] p-1 flex-shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-[#147D75] transition-colors"
                >
                  {getVisualDiagram('regionalStyle', activeSpec.regionalStyle).svg}
                </div>

                <div className="flex-1">
                  <select
                    value={activeSpec.regionalStyle}
                    onChange={(e) => updateGarmentSpec(activeGarmentIndex, { regionalStyle: e.target.value })}
                    className="w-full min-h-[50px] px-3 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                  >
                    {REGIONAL_STYLE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    {!REGIONAL_STYLE_OPTIONS.some(o => o.id === activeSpec.regionalStyle) && (
                      <option value={activeSpec.regionalStyle}>{activeSpec.regionalStyle}</option>
                    )}
                  </select>
                </div>
              </div>
              <span className="text-xs text-[#64748B] font-medium truncate">
                {getVisualDiagram('regionalStyle', activeSpec.regionalStyle).sublabel}
              </span>
            </div>

            {/* 9. Slit / Side Open - Relevant for Kurti/Top */}
            {isKurti && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
                <label className="text-[16px] font-bold text-[#233B5D]">
                  Side Slit Opening <span className="text-[#D64545] font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 min-h-[50px]">
                  {[
                    { id: 'Yes', label: 'Side Slit (Yes)', desc: '14 in side open' },
                    { id: 'No', label: 'Closed (No)', desc: 'Full closed hem' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateGarmentSpec(activeGarmentIndex, { slit: opt.id as any })}
                      className={`rounded-lg font-bold text-[15px] border-2 flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                        activeSpec.slit === opt.id
                          ? 'bg-[#233B5D] text-white border-[#233B5D] shadow-sm'
                          : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className={`text-[10px] ${activeSpec.slit === opt.id ? 'text-teal-200' : 'text-slate-400'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#64748B] font-medium">
                  {activeSpec.slit === 'Yes' ? '✓ Standard 14 in side slit for easy movement' : '✓ A-line closed flare'}
                </span>
              </div>
            )}

            {/* 10. Bottom Style - Relevant for Bottoms, Salwar, Chudidar */}
            {(isBottom || activeSpec.category.toLowerCase().includes('suit')) && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1] flex flex-col gap-2 shadow-xs">
                <label className="text-[16px] font-bold text-[#233B5D]">
                  Bottom Cut & Style <span className="text-[#D64545] font-bold">*</span>
                </label>
                <select
                  value={activeSpec.bottomStyle}
                  onChange={(e) => updateGarmentSpec(activeGarmentIndex, { bottomStyle: e.target.value as any })}
                  className="w-full min-h-[50px] px-3.5 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[16px] font-bold text-[#191C1E] cursor-pointer"
                >
                  {BOTTOM_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
                <span className="text-xs text-[#64748B] font-medium">
                  Standard waistband with elastic + drawstring
                </span>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 3: DESIGN REFERENCE IMAGES & PHOTOS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#233B5D] text-white flex items-center justify-center font-bold text-[14px]">
                3
              </span>
              <h3 className="text-[20px] font-bold text-[#233B5D]">
                Customer Design Reference Images & Sketches
              </h3>
            </div>
            
            <label className="min-h-[40px] px-4 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white text-[14px] font-bold flex items-center gap-2 cursor-pointer shadow-sm">
              <Upload className="w-4 h-4" />
              <span>+ Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSpec.referenceImages.map((img) => (
              <div key={img.id} className="bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-xl overflow-hidden flex flex-col group">
                <div className="h-48 w-full bg-[#E2E8F0] relative overflow-hidden flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-[#D64545] transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-[#233B5D] truncate">{img.title}</span>
                  <span className="text-[13px] text-[#64748B]">{img.notes}</span>
                </div>
              </div>
            ))}

            {/* Empty upload box */}
            <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#147D75] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F8FAFC] hover:bg-white transition-colors min-h-[190px]">
              <div className="w-12 h-12 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#233B5D]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-[16px] font-bold text-[#233B5D]">
                Attach Customer Photo / Sketch
              </span>
              <span className="text-[13px] text-[#64748B] text-center">
                Click to browse device camera or saved gallery (JPEG, PNG)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* SECTION 4: CUTTING DIRECTIVES & TAILOR INSTRUCTIONS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#233B5D] text-white flex items-center justify-center font-bold text-[14px]">
              4
            </span>
            <h3 className="text-[20px] font-bold text-[#233B5D]">
              Workshop Cutting Directives & Customer Notes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Facing Note */}
            <div className="flex flex-col gap-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1]">
              <div className="flex items-center justify-between">
                <label className="text-[16px] font-bold text-[#233B5D] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#147D75]" />
                  <span>Customer Specific Instructions</span>
                </label>
                <span className="text-[12px] bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded font-bold uppercase">
                  Customer Receipt
                </span>
              </div>
              <textarea
                rows={4}
                value={activeSpec.customerInstructions}
                onChange={(e) => updateGarmentSpec(activeGarmentIndex, { customerInstructions: e.target.value })}
                placeholder="e.g. Ensure sleeve armhole has no gathers. Leave 2 inches extra inner margin for future alteration. Customer prefers snug underbust grip."
                className="w-full p-3.5 bg-white border border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[17px] font-medium text-[#191C1E] focus:outline-none resize-none"
              />
              <span className="text-[13px] text-[#64748B]">
                Printed on the customer copy voucher.
              </span>
            </div>

            {/* Master Cutter Workshop Directive */}
            <div className="flex flex-col gap-2 bg-[#FFDAD6]/30 p-4 rounded-xl border border-[#FFDAD6]">
              <div className="flex items-center justify-between">
                <label className="text-[16px] font-bold text-[#D64545] flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#D64545]" />
                  <span>Master Tailor / Cutting Master Directive</span>
                </label>
                <span className="text-[12px] bg-[#D64545] text-white px-2 py-0.5 rounded font-bold uppercase">
                  Workshop Production Only
                </span>
              </div>
              <textarea
                rows={4}
                value={activeSpec.tailorInstructions}
                onChange={(e) => updateGarmentSpec(activeGarmentIndex, { tailorInstructions: e.target.value })}
                placeholder="e.g. Cut lining on bias. Check bust point 10 inches exact before cutting pad pockets. Match green and zari borders symmetrically."
                className="w-full p-3.5 bg-white border border-[#D64545]/40 focus:border-[#D64545] rounded-lg text-[17px] font-medium text-[#191C1E] focus:outline-none resize-none"
              />
              <span className="text-[13px] text-[#64748B]">
                Internal job chit directive for the cutting table.
              </span>
            </div>
          </div>
        </div>

        {/* Garment Quick Progression Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0] bg-[#F8FAFC] p-4 rounded-xl">
          <div className="flex items-center gap-2 text-[15px] font-bold text-[#233B5D]">
            <CheckCircle className="w-5 h-5 text-[#147D75]" />
            <span>Garment {activeGarmentIndex + 1} of {order.garmentSpecs.length} configured</span>
          </div>

          <div className="flex items-center gap-2">
            {activeGarmentIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveGarmentIndex(activeGarmentIndex - 1)}
                className="min-h-[44px] px-4 rounded-lg bg-white border border-[#CBD5E1] text-[#233B5D] font-bold text-[15px]"
              >
                ← Prev Garment
              </button>
            )}

            {activeGarmentIndex < order.garmentSpecs.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveGarmentIndex(activeGarmentIndex + 1)}
                className="min-h-[44px] px-5 rounded-lg bg-[#233B5D] text-white font-bold text-[15px] flex items-center gap-1.5 shadow-sm"
              >
                <span>Next Garment (#{activeGarmentIndex + 2})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => addGarmentSpec()}
                className="min-h-[44px] px-4 rounded-lg bg-[#147D75] text-white font-bold text-[15px] flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Garment</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Visual Pattern Gallery Picker Modal */}
      <VisualPickerModal
        isOpen={visualModalConfig.isOpen}
        onClose={() => setVisualModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={visualModalConfig.title}
        options={visualModalConfig.options}
        selectedValue={visualModalConfig.selectedValue}
        onSelect={visualModalConfig.onSelect}
      />

    </div>
  );
};
