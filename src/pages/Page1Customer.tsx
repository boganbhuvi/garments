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
  Printer,
  Trash2
} from 'lucide-react';
import { searchIndianAddress, AddressSuggestion } from '../services/addressService';
import { printCustomerBookingForm, printBlankBookingForm } from '../components/CustomerBookingFormPrint';
import { CustomDueDateCalendar } from '../components/CustomDueDateCalendar';

interface Page1CustomerProps {
  onOpenSearch: () => void;
}

export const Page1Customer: React.FC<Page1CustomerProps> = ({ onOpenSearch }) => {
  const { 
    order, 
    updateCustomer, 
    updateBillingMeta,
    updateGarmentQuantity, 
    addCustomGarmentCategory, 
    clearOrder,
    customers,
    selectRegisteredCustomerForOrder,
    setActiveModule
  } = useOrder();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [customerSelectQuery, setCustomerSelectQuery] = useState('');

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
              Order Date
            </span>
            <span className="text-[18px] font-black text-[#191C1E]">
              {order.customer.date}
            </span>
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
            title="Print customer booking form with current order details"
          >
            <Printer className="w-4 h-4 text-amber-700" />
            <span>Print Customer Form</span>
          </button>

          {/* Print Blank Customer Form button */}
          <button
            type="button"
            onClick={() => printBlankBookingForm()}
            className="min-h-[46px] px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-[15px] font-bold flex items-center gap-2 border-2 border-slate-300 transition-all shadow-sm cursor-pointer"
            title="Print blank customer tailoring worksheet for manual handwriting"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Blank Form</span>
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
        
        {/* Left Column: Select Registered Customer (Read-Only) (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#233B5D]" />
              <h2 className="text-[22px] font-black text-[#233B5D]">
                Select Registered Customer
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveModule('CUSTOMERS')}
              className="text-xs font-black px-3 py-1.5 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white cursor-pointer"
            >
              + Register / Edit in Customer Details
            </button>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerSelectQuery}
              onChange={(e) => setCustomerSelectQuery(e.target.value)}
              placeholder="Search registered customer by Name, Mobile, or Customer ID..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-slate-300 focus:border-[#147D75] focus:outline-none text-[16px] font-semibold text-[#191C1E]"
            />
            {customerSelectQuery && (
              <button
                type="button"
                onClick={() => setCustomerSelectQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 px-1.5 py-0.5 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {customerSelectQuery.trim().length > 0 && (() => {
            const q = customerSelectQuery.toLowerCase().trim();
            const qDigits = q.replace(/\D/g, '');
            const matches = customers.filter((c) => {
              const name = (c.customerName || '').toLowerCase();
              const id = (c.customerId || '').toLowerCase();
              const phones = [
                c.primaryPhone || '',
                c.secondaryPhone || '',
                ...(Array.isArray(c.additionalPhones) ? c.additionalPhones : []),
              ];
              const phoneTextMatch = phones.some((p) => p.toLowerCase().includes(q));
              const phoneDigitMatch =
                qDigits.length >= 3 &&
                phones.some((p) => p.replace(/\D/g, '').includes(qDigits));
              return name.includes(q) || id.includes(q) || phoneTextMatch || phoneDigitMatch;
            });

            return (
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50">
                {matches.length > 0 ? (
                  matches.slice(0, 12).map((c) => (
                    <button
                      key={c.customerId}
                      type="button"
                      onClick={() => {
                        selectRegisteredCustomerForOrder(c);
                        setCustomerSelectQuery('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#D3E4FE]/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 mr-2">
                          {c.customerId}
                        </span>
                        <span className="font-black text-[#191C1E]">{c.customerName}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{c.fullAddress || 'No address'}</p>
                      </div>
                      <span className="text-sm font-bold text-[#147D75] whitespace-nowrap">{c.primaryPhone}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-sm text-slate-500">
                    No registered customer found for <span className="font-bold text-slate-700">"{customerSelectQuery.trim()}"</span>.
                  </div>
                )}
              </div>
            );
          })()}

          {order.customer.customerName ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-black uppercase text-slate-400">Linked Customer ID</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                      {order.customer.customerId || 'N/A'}
                    </span>
                    <span className="text-xl font-black text-[#191C1E]">{order.customer.customerName}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Read-Only Profile
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Primary Mobile</span>
                  <p className="font-black text-[#191C1E] text-base">{order.customer.primaryPhone || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Secondary Mobile</span>
                  <p className="font-semibold text-slate-700">{order.customer.secondaryPhone || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Father / Husband Name</span>
                  <p className="font-semibold text-slate-700">{[order.customer.fatherName, order.customer.husbandName].filter(Boolean).join(' / ') || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Address</span>
                  <p className="font-semibold text-slate-700">{order.customer.fullAddress || '—'}</p>
                </div>
              </div>

              <CustomDueDateCalendar
                value={order.billing.dueDate}
                onChange={(dueDate) => updateBillingMeta({ dueDate })}
              />
            </div>
          ) : (
            <div className="bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center">
              <User className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-base font-black text-[#233B5D]">No Customer Selected</p>
              <p className="text-sm text-slate-600 mt-1">Search above to select a registered customer, or register one in Customer Details.</p>
            </div>
          )}
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
