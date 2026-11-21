import React, { useState, useEffect } from 'react';
import { CustomerRecord } from '../types/order';
import { MapPin, CheckCircle2, AlertCircle, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

export interface PublicDeliveryAddress {
  fullName: string;
  mobileNumber: string;
  email: string;
  doorNo: string;
  streetArea: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  saveToAccount?: boolean;
}

export function createEmptyPublicAddress(customer?: CustomerRecord | null): PublicDeliveryAddress {
  return {
    fullName: customer?.customerName || '',
    mobileNumber: customer?.primaryPhone || '',
    email: '',
    doorNo: customer?.doorNo || '',
    streetArea: [customer?.street, customer?.areaLocation].filter(Boolean).join(', '),
    landmark: '',
    city: customer?.city || '',
    district: '',
    state: customer?.state || 'Tamil Nadu',
    pinCode: customer?.pinCode || '',
    country: 'India',
    saveToAccount: Boolean(customer),
  };
}

export function validatePublicAddress(addr: PublicDeliveryAddress): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!addr.fullName.trim()) errors.fullName = 'Full Name is required.';
  const cleanPhone = addr.mobileNumber.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
  }
  if (addr.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!addr.doorNo.trim()) errors.doorNo = 'Door / Flat / Building Number is required.';
  if (!addr.streetArea.trim()) errors.streetArea = 'Street / Area is required.';
  if (!addr.city.trim()) errors.city = 'City / Town is required.';
  if (!addr.district.trim()) errors.district = 'District is required.';
  if (!addr.state.trim()) errors.state = 'State is required.';
  const cleanPin = addr.pinCode.replace(/\D/g, '');
  if (!/^\d{6}$/.test(cleanPin)) {
    errors.pinCode = 'Enter a valid 6-digit PIN Code.';
  }
  if (!addr.country.trim()) errors.country = 'Country is required.';
  return errors;
}

export function formatPublicAddressLine(addr: PublicDeliveryAddress): string {
  return [
    addr.doorNo,
    addr.streetArea,
    addr.landmark ? `Near ${addr.landmark}` : '',
    addr.city,
    addr.district && addr.district !== addr.city ? `${addr.district} Dt` : '',
    addr.state,
    addr.pinCode ? `PIN: ${addr.pinCode}` : '',
    addr.country,
  ]
    .filter(Boolean)
    .join(', ');
}

interface SavedAddrOption {
  label: string;
  address: PublicDeliveryAddress;
}

const SAVED_ADDR_STORAGE_KEY = 'giriraj_public_saved_addresses_v1';

interface PublicAddressFormProps {
  value: PublicDeliveryAddress;
  loggedInCustomer: CustomerRecord | null;
  onChange: (next: PublicDeliveryAddress) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}

export const PublicAddressForm: React.FC<PublicAddressFormProps> = ({
  value,
  loggedInCustomer,
  onChange,
  onBack,
  onNext,
  nextLabel = 'Review Complete Order',
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [savedOptions, setSavedOptions] = useState<SavedAddrOption[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_ADDR_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedOptions(parsed);
      }
    } catch {}
  }, []);

  const errors = validatePublicAddress(value);
  const isValid = Object.keys(errors).length === 0;

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));
  const showErr = (field: string) => (touched[field] || attempted) && Boolean(errors[field]);

  const handleContinue = () => {
    setAttempted(true);
    if (!isValid) return;

    if (value.saveToAccount) {
      try {
        const label = `${value.fullName} — ${value.doorNo}, ${value.city}`;
        const updated = [
          { label, address: value },
          ...savedOptions.filter((o) => o.label !== label),
        ].slice(0, 5);
        setSavedOptions(updated);
        localStorage.setItem(SAVED_ADDR_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
    onNext();
  };

  const handleAddNew = () => {
    onChange({
      ...createEmptyPublicAddress(loggedInCustomer),
      doorNo: '',
      streetArea: '',
      landmark: '',
      pinCode: '',
    });
    setTouched({});
    setAttempted(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#7F1D1D]" />
            <span>Delivery Address</span>
          </h2>
          <p className="text-xs text-[#57534E] mt-1">
            A complete delivery address is required for all e-commerce orders. Fields marked * are mandatory.
          </p>
        </div>
        {savedOptions.length > 0 && (
          <button
            type="button"
            onClick={handleAddNew}
            className="text-xs font-bold px-3.5 py-2 rounded-full border border-[#D6D3D1] hover:border-[#7F1D1D] text-[#1C1917] flex items-center gap-1 self-start cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Use New Address</span>
          </button>
        )}
      </div>

      {/* Saved Addresses Quick-Pick */}
      {savedOptions.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
            Saved Addresses
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange({ ...opt.address, saveToAccount: true })}
                className="text-left p-3 rounded-xl border border-[#E7E5E4] hover:border-[#7F1D1D] bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <p className="text-xs font-bold text-[#1C1917] truncate">{opt.label}</p>
                <p className="text-[11px] text-[#57534E] truncate mt-0.5">
                  {formatPublicAddressLine(opt.address)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Address Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Full Name <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.fullName}
            onBlur={() => markTouched('fullName')}
            onChange={(e) => onChange({ ...value, fullName: e.target.value })}
            placeholder="Recipient full name"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('fullName') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('fullName') && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Mobile Number <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={value.mobileNumber}
            onBlur={() => markTouched('mobileNumber')}
            onChange={(e) => onChange({ ...value, mobileNumber: e.target.value })}
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('mobileNumber') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('mobileNumber') && <p className="text-xs text-red-600 mt-1">{errors.mobileNumber}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={value.email}
            onBlur={() => markTouched('email')}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('email') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('email') && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Door / Flat / Building Number <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.doorNo}
            onBlur={() => markTouched('doorNo')}
            onChange={(e) => onChange({ ...value, doorNo: e.target.value })}
            placeholder="e.g. No. 14, Flat 2B"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('doorNo') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('doorNo') && <p className="text-xs text-red-600 mt-1">{errors.doorNo}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Street / Area <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.streetArea}
            onBlur={() => markTouched('streetArea')}
            onChange={(e) => onChange({ ...value, streetArea: e.target.value })}
            placeholder="Street name & locality"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('streetArea') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('streetArea') && <p className="text-xs text-red-600 mt-1">{errors.streetArea}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={value.landmark}
            onChange={(e) => onChange({ ...value, landmark: e.target.value })}
            placeholder="Near temple, school, or main junction"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            City / Town <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.city}
            onBlur={() => markTouched('city')}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="City or town"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('city') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('city') && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            District <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.district}
            onBlur={() => markTouched('district')}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            placeholder="District"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('district') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('district') && <p className="text-xs text-red-600 mt-1">{errors.district}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            State <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.state}
            onBlur={() => markTouched('state')}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            placeholder="State"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('state') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('state') && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            PIN Code <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={value.pinCode}
            onBlur={() => markTouched('pinCode')}
            onChange={(e) => onChange({ ...value, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            placeholder="6-digit PIN Code"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('pinCode') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('pinCode') && <p className="text-xs text-red-600 mt-1">{errors.pinCode}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
            Country <span className="text-[#7F1D1D]">*</span>
          </label>
          <input
            type="text"
            value={value.country}
            onBlur={() => markTouched('country')}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
            placeholder="Country"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
              showErr('country') ? 'border-red-400 bg-red-50/30' : 'border-[#D6D3D1]'
            }`}
          />
          {showErr('country') && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-xs font-semibold text-[#1C1917] cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value.saveToAccount)}
          onChange={(e) => onChange({ ...value, saveToAccount: e.target.checked })}
          className="w-4 h-4 accent-[#7F1D1D]"
        />
        <span>Save this delivery address for future orders</span>
      </label>

      {isValid ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Delivery address verified: {formatPublicAddressLine(value)}</span>
        </div>
      ) : attempted ? (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Please complete all mandatory delivery address fields before proceeding.</span>
        </div>
      ) : null}

      <div className="pt-4 flex justify-between border-t border-[#E7E5E4]">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={handleContinue}
          className="px-6 py-2.5 rounded-full bg-[#7F1D1D] hover:bg-[#651515] disabled:opacity-45 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span>{nextLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
