import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '../context/OrderContext';
import { 
  User, 
  Phone, 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  PlusCircle, 
  Hash, 
  CheckCircle, 
  ShoppingBag, 
  Info, 
  RotateCcw,
  Sparkles,
  Building,
  Check,
  Printer
} from 'lucide-react';
import { searchIndianAddress, AddressSuggestion } from '../services/addressService';
import { printCustomerBookingForm } from '../components/CustomerBookingFormPrint';

interface Page1CustomerProps {
  onOpenSearch: () => void;
}

export const Page1Customer: React.FC<Page1CustomerProps> = ({ onOpenSearch }) => {
  const { 
    order, 
    updateCustomer, 
    updateGarmentQuantity, 
    addCustomGarmentCategory, 
    clearOrder 
  } = useOrder();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Address autocomplete state
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const totalQuantity = order.garmentQuantities.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const handleResetQuantities = () => {
    order.garmentQuantities.forEach(item => {
      if (item.quantity > 0) {
        updateGarmentQuantity(item.id, 0);
      }
    });
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCustomGarmentCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Debounced search for Indian address suggestions
  useEffect(() => {
    if (!addressSearchQuery || addressSearchQuery.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const results = await searchIndianAddress(addressSearchQuery);
        setAddressSuggestions(results);
        setShowSuggestionsDropdown(results.length > 0);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [addressSearchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a location suggestion is clicked: Auto-populate address fields
  const handleSelectSuggestion = (sug: AddressSuggestion) => {
    const doorNo = order.customer.doorNo || sug.doorNo || '';
    const street = order.customer.street || sug.street || '';
    const areaLocation = sug.areaLocation;
    const city = sug.city;
    const district = sug.district;
    const state = sug.state;
    const pinCode = sug.pinCode;

    // Assemble comprehensive full address
    const parts = [
      doorNo ? `No. ${doorNo}` : '',
      street,
      areaLocation,
      city,
      district !== city ? `${district} Dt` : '',
      state,
      pinCode ? `PIN: ${pinCode}` : ''
    ].filter(Boolean);

    const assembled = parts.join(', ');

    updateCustomer({
      doorNo,
      street,
      areaLocation,
      city,
      district,
      state,
      pinCode,
      fullAddress: assembled
    });

    setAddressSearchQuery('');
    setShowSuggestionsDropdown(false);
  };

  // Synchronize full address whenever component fields update
  const syncFullAddress = (newFields: Partial<typeof order.customer>) => {
    const updated = { ...order.customer, ...newFields };
    const parts = [
      updated.doorNo ? `No. ${updated.doorNo}` : '',
      updated.street,
      updated.areaLocation,
      updated.city,
      updated.district && updated.district !== updated.city ? `${updated.district} Dt` : '',
      updated.state,
      updated.pinCode ? `PIN: ${updated.pinCode}` : ''
    ].filter(Boolean);

    updateCustomer({
      ...newFields,
      fullAddress: parts.join(', ')
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      
      {/* Top Meta Strip: Order Identification & Quick Search */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#233B5D]/10 flex items-center justify-center text-[#233B5D]">
              <Hash className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-slate-500 uppercase font-black tracking-wider">
                Bill / Job Order
              </span>
              <span className="text-[22px] font-black text-[#233B5D] leading-tight">
                #{order.customer.billNumber || order.id}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-300 hidden sm:block" />

          <div className="flex flex-col">
            <span className="text-[12px] text-slate-500 uppercase font-black tracking-wider">
              Token / Serial
            </span>
            <div className="flex items-center gap-1.5 text-[18px] font-black text-[#191C1E]">
              <span>{order.serialNumber}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[15px] font-semibold text-slate-500">
                {order.customer.date}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-300 hidden md:block" />

          <div className="flex flex-col">
            <span className="text-[12px] text-slate-500 uppercase font-black tracking-wider">
              Customer ID
            </span>
            <span className="text-[18px] font-black text-[#147D75]">
              {order.customer.customerId}
            </span>
          </div>

        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 ml-auto flex-wrap">
          <button
            type="button"
            onClick={clearOrder}
            className="min-h-[46px] px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[15px] font-bold flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
            title="Clear all fields to blank"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Clear / New</span>
          </button>

          {/* Print Customer Booking Form button */}
          <button
            type="button"
            onClick={() => printCustomerBookingForm(order)}
            className="min-h-[46px] px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[15px] font-black flex items-center gap-2 border-2 border-amber-400 transition-all shadow-sm cursor-pointer"
            title="Print the original Giriraj City Garments booking form"
          >
            <Printer className="w-4 h-4 text-amber-700" />
            <span>Print Customer Form</span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="min-h-[46px] px-4 rounded-xl bg-[#D3E4FE] hover:bg-[#B7C8E1] text-[#0B1C30] text-[16px] font-black flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#0B1C30]" />
            <span>Search Existing Customer</span>
          </button>
        </div>
      </div>

      {/* Main Container - 2 Columns on Wide Desktop, but strictly SINGLE-COLUMN VERTICAL INPUTS inside each column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Customer Details (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#233B5D]" />
              <h2 className="text-[22px] font-black text-[#233B5D]">
                Customer Registration Details
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              <span className="text-red-500 font-black">*</span> Mandatory
            </span>
          </div>

          {/* STRICT SINGLE-COLUMN VERTICAL INPUT LAYOUT: Every field occupies its own vertical row */}
          <div className="flex flex-col gap-5 w-full">
            
            {/* Field 1: Customer Name */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[17px] font-black text-[#233B5D] flex items-center">
                Customer Full Name <span className="text-red-500 font-black ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={order.customer.customerName}
                onChange={(e) => updateCustomer({ customerName: e.target.value })}
                placeholder="Customer Full Name (e.g. S. Kavitha)"
                className="w-full min-h-[52px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[18px] text-[#191C1E] font-medium focus:outline-none transition-colors"
              />
            </div>

            {/* Field 2: Relationship Type */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[17px] font-black text-[#233B5D]">
                Relationship Type:
              </label>
              <div className="flex items-center gap-3 w-full min-h-[52px]">
                <button
                  type="button"
                  onClick={() => updateCustomer({ relationshipType: 'D/O' })}
                  className={`flex-1 min-h-[50px] rounded-xl font-black text-[16px] flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    order.customer.relationshipType === 'D/O'
                      ? 'bg-[#233B5D] text-white border-[#233B5D] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {order.customer.relationshipType === 'D/O' && <Check className="w-4 h-4" />}
                  <span>Daughter Of (D/O)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateCustomer({ relationshipType: 'W/O' })}
                  className={`flex-1 min-h-[50px] rounded-xl font-black text-[16px] flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    order.customer.relationshipType === 'W/O'
                      ? 'bg-[#233B5D] text-white border-[#233B5D] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {order.customer.relationshipType === 'W/O' && <Check className="w-4 h-4" />}
                  <span>Wife Of (W/O)</span>
                </button>
              </div>
            </div>

            {/* Field 3: Father's or Husband's Name */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[17px] font-black text-[#233B5D]">
                {order.customer.relationshipType === 'D/O' ? "Father's Full Name:" : "Husband's Full Name:"}
              </label>
              <input
                type="text"
                value={order.customer.relationshipType === 'D/O' ? order.customer.fatherName : order.customer.husbandName}
                onChange={(e) => {
                  if (order.customer.relationshipType === 'D/O') {
                    updateCustomer({ fatherName: e.target.value });
                  } else {
                    updateCustomer({ husbandName: e.target.value });
                  }
                }}
                placeholder={order.customer.relationshipType === 'D/O' ? "Father's Name (e.g. K. Sundaram)" : "Husband's Name (e.g. M. Rajesh)"}
                className="w-full min-h-[52px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[18px] text-[#191C1E] font-medium focus:outline-none transition-colors"
              />
            </div>

            {/* Field 4: Primary Phone Number */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[17px] font-black text-[#233B5D] flex items-center">
                Primary Phone Number <span className="text-red-500 font-black ml-1">*</span>
              </label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px] font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={order.customer.primaryPhone}
                  onChange={(e) => updateCustomer({ primaryPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9840123456 (10 Digits)"
                  className="w-full min-h-[52px] pl-14 pr-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[18px] text-[#191C1E] font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Field 5: Secondary Phone Number */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[17px] font-black text-[#233B5D]">
                Secondary Phone Number (WhatsApp / Landline):
              </label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px] font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={order.customer.secondaryPhone || ''}
                  onChange={(e) => updateCustomer({ secondaryPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="Alternative Phone (Optional)"
                  className="w-full min-h-[52px] pl-14 pr-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[18px] text-[#191C1E] font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Section Divider: Indian Address & Location */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#147D75]" />
                <h3 className="text-[18px] font-black text-[#233B5D]">
                  Indian Address & Delivery Location
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Type area name for instant Indian suggestions (e.g. Melvisharam, Mylapore, Sathuvachari, Katpadi). Selecting a suggestion auto-fills city, district, state & PIN.
              </p>
            </div>

            {/* Field 6: Address Autocomplete Search / Quick Location Picker */}
            <div className="flex flex-col gap-1.5 w-full relative" ref={autocompleteRef}>
              <label className="text-[16px] font-black text-[#233B5D] flex items-center justify-between">
                <span>Address Autocomplete & Locality Finder:</span>
                {isSearchingAddress && <span className="text-xs text-[#147D75] font-bold animate-pulse">Searching Indian locations...</span>}
              </label>
              <div className="relative w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addressSearchQuery}
                  onChange={e => {
                    setAddressSearchQuery(e.target.value);
                    setShowSuggestionsDropdown(true);
                  }}
                  onFocus={() => addressSuggestions.length > 0 && setShowSuggestionsDropdown(true)}
                  placeholder="Type Locality, City or PIN (e.g. Melvisharam, Mylapore, 632509)..."
                  className="w-full min-h-[52px] pl-12 pr-4 bg-teal-50/40 border-2 border-teal-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-semibold focus:outline-none"
                />
              </div>

              {/* Suggestions Floating Dropdown */}
              {showSuggestionsDropdown && addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border-2 border-[#147D75] rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  <div className="p-2 bg-teal-50 text-xs font-black uppercase text-[#0F766E] tracking-wider">
                    Location Suggestions — Click to Auto-Fill
                  </div>
                  {addressSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="w-full p-3 text-left hover:bg-teal-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#147D75] flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <strong className="text-sm font-black text-[#233B5D]">
                          {sug.areaLocation}, {sug.city}
                        </strong>
                        <span className="text-xs text-slate-600 font-medium">
                          {sug.district} District, {sug.state} — PIN: {sug.pinCode}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field 7: Door / Flat Number */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                Door / Flat / Building Number:
              </label>
              <input
                type="text"
                value={order.customer.doorNo || ''}
                onChange={(e) => syncFullAddress({ doorNo: e.target.value })}
                placeholder="Door / Flat No (e.g. No. 42 / Flat 3B)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none"
              />
            </div>

            {/* Field 8: Street Name */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                Street / Road / Lane Name:
              </label>
              <input
                type="text"
                value={order.customer.street || ''}
                onChange={(e) => syncFullAddress({ street: e.target.value })}
                placeholder="Street Name (e.g. Bazaar Street, Anna Salai)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none"
              />
            </div>

            {/* Field 9: Area / Locality */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                Area / Colony / Landmark:
              </label>
              <input
                type="text"
                value={order.customer.areaLocation || ''}
                onChange={(e) => syncFullAddress({ areaLocation: e.target.value })}
                placeholder="Area / Locality (e.g. Near Pillayar Kovil, Melvisharam)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none"
              />
            </div>

            {/* Field 10: City / Town */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                City / Town:
              </label>
              <input
                type="text"
                value={order.customer.city || ''}
                onChange={(e) => syncFullAddress({ city: e.target.value })}
                placeholder="City (e.g. Vellore, Ranipet, Chennai)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none"
              />
            </div>

            {/* Field 11: District */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                District:
              </label>
              <input
                type="text"
                value={order.customer.district || ''}
                onChange={(e) => syncFullAddress({ district: e.target.value })}
                placeholder="District (e.g. Ranipet / Vellore)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none"
              />
            </div>

            {/* Field 12: State */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                State:
              </label>
              <input
                type="text"
                value={order.customer.state || 'Tamil Nadu'}
                onChange={(e) => syncFullAddress({ state: e.target.value })}
                placeholder="State (e.g. Tamil Nadu)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none"
              />
            </div>

            {/* Field 13: PIN Code */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[16px] font-bold text-[#233B5D]">
                Postal PIN Code (6 Digits):
              </label>
              <input
                type="text"
                maxLength={6}
                value={order.customer.pinCode || ''}
                onChange={(e) => syncFullAddress({ pinCode: e.target.value.replace(/\D/g, '') })}
                placeholder="PIN Code (e.g. 632509)"
                className="w-full min-h-[50px] px-4 bg-white border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-bold focus:outline-none"
              />
            </div>

            {/* Field 14: Complete Full Address (Auto-assembled & manually editable) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[17px] font-black text-[#233B5D] flex items-center">
                Full Assembled Delivery Address <span className="text-red-500 font-black ml-1">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={order.customer.fullAddress}
                onChange={(e) => updateCustomer({ fullAddress: e.target.value })}
                placeholder="Full delivery address will auto-assemble as you enter details above..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] text-[#191C1E] font-medium focus:outline-none resize-none"
              />
            </div>

          </div>

          {/* Quick Notice */}
          <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-4 flex items-start gap-3 text-[#0F766E]">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-[14px] leading-relaxed">
              <strong>Front Desk Note:</strong> Customer profile is permanently registered under ID <strong className="font-bold text-[#092546]">{order.customer.customerId}</strong> for subsequent visits, measurement history lookups, and WhatsApp notifications.
            </p>
          </div>

        </div>

        {/* Right Column: Garment Intake Manifest (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#147D75]" />
              <h2 className="text-[22px] font-black text-[#233B5D]">
                Garment Intake Manifest
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {totalQuantity > 0 && (
                <button
                  type="button"
                  onClick={handleResetQuantities}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                  title="Reset all quantities to 0"
                >
                  Reset All
                </button>
              )}
              <div className="bg-[#147D75] text-white px-3 py-1 rounded-full text-[15px] font-black flex items-center gap-1 shadow-sm">
                <span>Total:</span>
                <span className="text-[17px] underline">{totalQuantity}</span>
                <span>Items</span>
              </div>
            </div>
          </div>

          <p className="text-[15px] text-slate-600 font-medium">
            Specify the number of garment pieces received from the customer. Each piece will receive separate design configurations in Step 03.
          </p>

          {/* Quantities Table / Single-column vertical list */}
          <div className="flex flex-col divide-y divide-slate-200 border border-slate-300 rounded-2xl overflow-hidden bg-slate-50">
            {order.garmentQuantities.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 sm:px-4 flex items-center justify-between transition-colors ${
                  item.quantity > 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-[17px] font-black ${
                    item.quantity > 0 ? 'text-[#233B5D]' : 'text-slate-600'
                  }`}>
                    {item.label}
                  </span>
                  {item.quantity > 0 && (
                    <span className="text-[13px] font-bold text-[#147D75]">
                      {item.quantity} piece{item.quantity > 1 ? 's' : ''} to configure
                    </span>
                  )}
                </div>

                {/* Counter Stepper (+ / -) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateGarmentQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 0}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-[18px] transition-colors border ${
                      item.quantity <= 0
                        ? 'border-slate-300 text-slate-300 bg-slate-100 cursor-not-allowed'
                        : 'border-slate-300 text-[#233B5D] bg-white hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={item.quantity}
                    onChange={(e) => updateGarmentQuantity(item.id, parseInt(e.target.value) || 0)}
                    className="w-14 h-11 text-center font-black text-[18px] text-[#233B5D] bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-[#147D75]"
                  />

                  <button
                    type="button"
                    onClick={() => updateGarmentQuantity(item.id, item.quantity + 1)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-[18px] bg-[#233B5D] text-white hover:bg-[#1A2C46] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Garment Category */}
          {!showAddCategory ? (
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="min-h-[48px] px-4 rounded-xl border-2 border-dashed border-slate-300 text-[#233B5D] hover:bg-slate-100 hover:border-[#233B5D] text-[16px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-[#147D75]" />
              <span>+ Add Custom Garment Category</span>
            </button>
          ) : (
            <form onSubmit={handleAddCategorySubmit} className="bg-slate-100 p-4 rounded-xl border border-slate-300 flex flex-col gap-2.5">
              <label className="text-[15px] font-black text-[#233B5D]">
                Enter Custom Category Name:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Lehenga, Gown, Frock, Dhoti"
                  className="flex-1 min-h-[46px] px-3.5 bg-white border-2 border-slate-300 rounded-xl text-[17px] text-[#191C1E] focus:outline-none focus:border-[#147D75]"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="min-h-[46px] px-5 rounded-xl bg-[#147D75] hover:bg-[#0E605A] text-white text-[16px] font-bold shadow cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="min-h-[46px] px-3 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-[15px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Summary footer */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[16px]">
              <span className="text-slate-500 font-semibold">Configured Types:</span>
              <span className="font-bold text-[#233B5D]">
                {order.garmentQuantities.filter(g => g.quantity > 0).length} Categories
              </span>
            </div>
            <div className="flex items-center justify-between text-[18px] border-t border-slate-200 pt-2">
              <span className="text-[#233B5D] font-black">Total Intake Pieces:</span>
              <span className="text-[22px] font-black text-[#147D75]">
                {totalQuantity} Pieces
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
