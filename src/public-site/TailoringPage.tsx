import React, { useState, useEffect } from 'react';
import { CustomerRecord } from '../types/order';
import { useOrder } from '../context/OrderContext';
import { api } from '../services/api';
import { EMPTY_MEASUREMENTS } from '../data/defaultTemplates';
import {
  Scissors,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Edit3,
  Ruler,
  MapPin,
} from 'lucide-react';
import { LONG_DRESS_MEASUREMENTS } from './LongDressIllustration';
import {
  LongDressMeasurementSection,
  LongDressMeasurementValues,
  MeasurementUnit,
  areAllLongDressMeasurementsValid,
} from './LongDressMeasurementSection';
import {
  PublicAddressForm,
  PublicDeliveryAddress,
  createEmptyPublicAddress,
  validatePublicAddress,
  formatPublicAddressLine,
} from './PublicAddressForm';

interface TailoringPageProps {
  initialCategory?: string;
  loggedInCustomer: CustomerRecord | null;
  onLoginCustomer: (cust: CustomerRecord) => void;
  onTrackOrder: (orderId: string) => void;
}

const GARMENT_OPTIONS = [
  'Long Dress',
  'Blouse',
  'Tops / Kurti',
  'Bottom / Salwar',
  'Saree Falls & Pico',
  'Nighty',
  'Dhupatta',
];

const RELEVANT_MEASUREMENTS: Record<string, string[]> = {
  Blouse: ['Full Length', 'Chest / Bust', 'Waist', 'Shoulder', 'Sleeve Length', 'Armhole', 'Front Neck', 'Back Neck'],
  'Tops / Kurti': ['Full Length', 'Chest / Bust', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Slit Length'],
  'Bottom / Salwar': ['Bottom Length', 'Waist', 'Hip', 'Thigh Round', 'Ankle / Bottom Round'],
  'Saree Falls & Pico': ['Saree Falls Required', 'Pico Edging'],
  Nighty: ['Full Length', 'Chest / Bust', 'Shoulder', 'Sleeve Length'],
  Dhupatta: ['Edging / Tassel Preference'],
};

const PUBLIC_DRAFT_KEY = 'giriraj_public_tailoring_draft_v1';

export const TailoringPage: React.FC<TailoringPageProps> = ({
  initialCategory,
  loggedInCustomer,
  onLoginCustomer,
  onTrackOrder,
}) => {
  const { customers, registerCustomer, updateCustomerRecord } = useOrder();

  const [step, setStep] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(PUBLIC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.step && parsed.step >= 1 && parsed.step <= 6) return parsed.step;
      }
    } catch {}
    return 1;
  });

  const [garment, setGarment] = useState<string>(() => {
    if (initialCategory) return initialCategory;
    try {
      const raw = localStorage.getItem(PUBLIC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.garment) return parsed.garment;
      }
    } catch {}
    return 'Long Dress';
  });

  const [phoneLookup, setPhoneLookup] = useState(loggedInCustomer?.primaryPhone || '');
  const [custName, setCustName] = useState(loggedInCustomer?.customerName || '');
  const [custEmail, setCustEmail] = useState('');
  const [linkedCustomer, setLinkedCustomer] = useState<CustomerRecord | null>(loggedInCustomer);

  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(() => {
    try {
      const raw = localStorage.getItem(PUBLIC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.measurementUnit === 'cm' || parsed.measurementUnit === 'in') return parsed.measurementUnit;
      }
    } catch {}
    return 'in';
  });

  const [longDressMeasurements, setLongDressMeasurements] = useState<LongDressMeasurementValues>(() => {
    try {
      const raw = localStorage.getItem(PUBLIC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.longDressMeasurements) return parsed.longDressMeasurements;
      }
    } catch {}
    return {};
  });

  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(PUBLIC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.instructions === 'string') return parsed.instructions;
      }
    } catch {}
    return '';
  });

  const [deliveryAddress, setDeliveryAddress] = useState<PublicDeliveryAddress>(() => {
    try {
      const raw = localStorage.getItem(PUBLIC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.deliveryAddress) return parsed.deliveryAddress;
      }
    } catch {}
    return createEmptyPublicAddress(loggedInCustomer);
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  // Sync initialCategory when navigated from ShopPage
  useEffect(() => {
    if (initialCategory) {
      setGarment(initialCategory);
    }
  }, [initialCategory]);

  // Pre-fill customer & address when loggedInCustomer changes
  useEffect(() => {
    if (loggedInCustomer) {
      setLinkedCustomer(loggedInCustomer);
      if (!phoneLookup) setPhoneLookup(loggedInCustomer.primaryPhone || '');
      if (!custName) setCustName(loggedInCustomer.customerName || '');
      setDeliveryAddress((prev) => {
        if (prev.fullName && prev.doorNo && prev.pinCode) return prev;
        return {
          ...createEmptyPublicAddress(loggedInCustomer),
          ...Object.fromEntries(
            Object.entries(prev).filter(([, v]) => typeof v === 'string' && v.trim() !== '')
          ),
        };
      });
    }
  }, [loggedInCustomer]);

  // Persist public website draft progress across refresh
  useEffect(() => {
    if (submittedOrderId) return;
    try {
      localStorage.setItem(
        PUBLIC_DRAFT_KEY,
        JSON.stringify({
          step,
          garment,
          measurementUnit,
          longDressMeasurements,
          instructions,
          deliveryAddress,
        })
      );
    } catch {}
  }, [step, garment, measurementUnit, longDressMeasurements, instructions, deliveryAddress, submittedOrderId]);

  const isLongDress = garment === 'Long Dress';

  const handleLookupOrRegister = async () => {
    setError(null);
    const clean = phoneLookup.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const existing = customers.find((c) =>
      c.primaryPhone.replace(/\D/g, '').endsWith(clean.slice(-10))
    );
    if (existing) {
      setLinkedCustomer(existing);
      setCustName(existing.customerName);
      onLoginCustomer(existing);
      setDeliveryAddress((prev) => ({
        ...createEmptyPublicAddress(existing),
        ...Object.fromEntries(
          Object.entries(prev).filter(([, v]) => typeof v === 'string' && v.trim() !== '')
        ),
        fullName: prev.fullName || existing.customerName,
        mobileNumber: prev.mobileNumber || existing.primaryPhone,
        email: prev.email || custEmail,
      }));
      setStep(3);
      return;
    }

    if (!custName.trim()) {
      setError('New customer: please enter your full name.');
      return;
    }

    const guestRecord: CustomerRecord = {
      customerId: `WEB-CUST-${clean.slice(-6)}`,
      customerName: custName.trim(),
      primaryPhone: phoneLookup.trim(),
      relationshipType: 'None',
      husbandName: '',
      fatherName: '',
      secondaryPhone: '',
      additionalPhones: [],
      doorNo: deliveryAddress.doorNo || '',
      street: deliveryAddress.streetArea || '',
      areaLocation: deliveryAddress.district || '',
      city: deliveryAddress.city || '',
      state: deliveryAddress.state || '',
      pinCode: deliveryAddress.pinCode || '',
      fullAddress: formatPublicAddressLine(deliveryAddress),
    };

    // Try backend registration if staff/public session allows; otherwise keep non-duplicate local customer record
    const res = await registerCustomer({
      customerName: custName.trim(),
      primaryPhone: phoneLookup.trim(),
      fullAddress: formatPublicAddressLine(deliveryAddress),
    }).catch(() => ({ ok: false as const }));

    const resolved =
      res && 'ok' in res && res.ok && res.customer
        ? res.customer
        : res && 'existingCustomer' in res && res.existingCustomer
        ? res.existingCustomer
        : guestRecord;

    setLinkedCustomer(resolved);
    onLoginCustomer(resolved);
    setDeliveryAddress((prev) => ({
      ...prev,
      fullName: prev.fullName || resolved.customerName,
      mobileNumber: prev.mobileNumber || resolved.primaryPhone,
      email: prev.email || custEmail,
    }));
    setStep(3);
  };

  const handleSubmitOrder = async () => {
    setError(null);

    if (!linkedCustomer) {
      setError('Please complete customer details first.');
      setStep(2);
      return;
    }

    if (isLongDress && !areAllLongDressMeasurementsValid(longDressMeasurements)) {
      setError('All 13 Long Dress measurements are required before submitting.');
      setStep(3);
      return;
    }

    const addrErrors = validatePublicAddress(deliveryAddress);
    if (Object.keys(addrErrors).length > 0) {
      setError('Please complete a valid delivery address before submitting.');
      setStep(5);
      return;
    }

    setSubmitting(true);

    const formattedAddress = formatPublicAddressLine(deliveryAddress);

    // Update existing customer address without creating duplicates
    if (deliveryAddress.saveToAccount && linkedCustomer.customerId) {
      await updateCustomerRecord(linkedCustomer.customerId, {
        doorNo: deliveryAddress.doorNo,
        street: deliveryAddress.streetArea,
        areaLocation: deliveryAddress.district || deliveryAddress.streetArea,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pinCode: deliveryAddress.pinCode,
        fullAddress: formattedAddress,
      }).catch(() => {});
    }

    const newOrderId = `WEB-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const customFields = isLongDress
      ? LONG_DRESS_MEASUREMENTS.map((m) => ({
          id: `ld-${m.num}`,
          label: `${m.num}. ${m.label}`,
          value: `${longDressMeasurements[m.key]} ${measurementUnit}`,
        }))
      : Object.entries(measurements).map(([label, value], i) => ({
          id: `cf-${i}`,
          label,
          value: value ? `${value} ${measurementUnit}` : '',
        }));

    const payload: any = {
      id: newOrderId,
      serialNumber: '',
      status: 'ORDER_CONFIRMED',
      currentStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        customerId: linkedCustomer.customerId,
        billNumber: newOrderId,
        date: today,
        customerName: deliveryAddress.fullName.trim() || linkedCustomer.customerName,
        relationshipType:
          linkedCustomer.relationshipType === 'D/O' || linkedCustomer.relationshipType === 'W/O'
            ? linkedCustomer.relationshipType
            : 'D/O',
        fatherName: linkedCustomer.fatherName || '',
        husbandName: linkedCustomer.husbandName || '',
        primaryPhone: deliveryAddress.mobileNumber.trim() || linkedCustomer.primaryPhone,
        secondaryPhone: linkedCustomer.secondaryPhone || '',
        additionalPhones: linkedCustomer.additionalPhones || [],
        doorNo: deliveryAddress.doorNo,
        street: deliveryAddress.streetArea,
        city: deliveryAddress.city,
        district: deliveryAddress.district,
        state: deliveryAddress.state,
        pinCode: deliveryAddress.pinCode,
        fullAddress: formattedAddress,
        areaLocation: deliveryAddress.streetArea,
      },
      garments: [
        { id: garment.toLowerCase(), category: garment, label: garment, quantity: 1 },
      ],
      measurements: {
        ...EMPTY_MEASUREMENTS,
        unit: measurementUnit,
        customFields,
      },
      specifications: [
        {
          id: `spec-${Date.now()}`,
          garmentType: garment,
          notes: `${instructions || 'Standard custom tailoring'} | Delivery: ${formattedAddress}`,
          liningRequired: false,
          zipRequired: false,
          pipingRequired: false,
          fallsPicoRequired: garment.includes('Saree'),
        },
      ],
      billing: {
        items: [],
        additionalCharges: {
          liningCharge: 0,
          pipingCharge: 0,
          fallsPicoCharge: 0,
          urgentCharge: 0,
          otherCharge: 0,
          discount: 0,
        },
        totalAmount: 0,
        advancePaid: 0,
        balanceDue: 0,
        paymentMode: 'CASH',
        dueDate: '',
        deliveryTime: '',
      },
    };

    // Attempt backend persistence; if guest/offline, persist locally so customer journey completes cleanly
    await api.saveOrder(payload).catch(() => null);
    try {
      const existingWebOrders = JSON.parse(localStorage.getItem('giriraj_public_submitted_orders_v1') || '[]');
      localStorage.setItem(
        'giriraj_public_submitted_orders_v1',
        JSON.stringify([payload, ...existingWebOrders].slice(0, 20))
      );
      localStorage.removeItem(PUBLIC_DRAFT_KEY);
    } catch {}

    setSubmitting(false);
    setSubmittedOrderId(newOrderId);
  };

  if (submittedOrderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">
          Custom Order Confirmed
        </h1>
        <p className="text-sm text-[#57534E]">
          Your <strong>{garment}</strong> order <strong>#{submittedOrderId}</strong> is confirmed for{' '}
          <strong>{deliveryAddress.fullName}</strong>.
        </p>
        <p className="text-xs text-[#78716C]">
          Delivery Address: {formatPublicAddressLine(deliveryAddress)}
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onTrackOrder(submittedOrderId)}
            className="px-7 py-3 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer"
          >
            Track Order Status
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmittedOrderId(null);
              setStep(1);
            }}
            className="px-6 py-3 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer"
          >
            Book Another Order
          </button>
        </div>
      </div>
    );
  }

  const fields = RELEVANT_MEASUREMENTS[garment] || ['Length', 'Chest', 'Waist'];
  const addressIsValid = Object.keys(validatePublicAddress(deliveryAddress)).length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">
          Custom Tailoring Studio
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
          Book Custom Tailoring
        </h1>
      </div>

      {/* 7-Step Guided Journey Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        {[
          '1. Select Garment',
          '2. Customer Details',
          '3. Measurements',
          '4. Review Measurements',
          '5. Delivery Address',
          '6. Review Order',
        ].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (idx + 1 < step) setStep(idx + 1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              step === idx + 1
                ? 'bg-[#7F1D1D] text-white'
                : step > idx + 1
                ? 'bg-emerald-100 text-emerald-800 cursor-pointer'
                : 'bg-white border border-[#E7E5E4] text-[#78716C]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm">
        {/* STEP 1 — Select Garment */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Select Garment / Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GARMENT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGarment(opt)}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                    garment === opt
                      ? 'border-[#7F1D1D] bg-[#7F1D1D]/5 font-semibold text-[#7F1D1D]'
                      : 'border-[#E7E5E4] hover:border-[#1C1917]'
                  }`}
                >
                  <div>
                    <span className="block">{opt}</span>
                    {opt === 'Long Dress' && (
                      <span className="text-[11px] font-normal text-[#78716C]">
                        Includes guided 13-point visual measurement studio
                      </span>
                    )}
                  </div>
                  <Scissors className="w-4 h-4 flex-shrink-0" />
                </button>
              ))}
            </div>
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Customer Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Customer Details</h2>
            <p className="text-xs text-[#57534E]">
              Enter your mobile number and name. Existing profiles are linked automatically without creating duplicates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneLookup}
                  onChange={(e) => setPhoneLookup(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleLookupOrRegister}
                className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Measurements</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Measurements */}
        {step === 3 && (
          isLongDress ? (
            <LongDressMeasurementSection
              values={longDressMeasurements}
              unit={measurementUnit}
              onChangeValues={setLongDressMeasurements}
              onChangeUnit={setMeasurementUnit}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          ) : (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold">Measurements for {garment}</h2>
              <p className="text-xs text-[#57534E]">
                Enter measurements in {measurementUnit === 'in' ? 'inches' : 'centimeters'} (leave blank if you prefer studio measurement).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f}>
                    <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">{f}</label>
                    <input
                      type="text"
                      value={measurements[f] || ''}
                      onChange={(e) => setMeasurements({ ...measurements, [f]: e.target.value })}
                      placeholder={`e.g. 14.5 ${measurementUnit}`}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer"
                >
                  Review Measurements
                </button>
              </div>
            </div>
          )
        )}

        {/* STEP 4 — Review Measurements & Styling Notes */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#E7E5E4]">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1917] flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#7F1D1D]" />
                  <span>Review {garment} Measurements</span>
                </h2>
                <p className="text-xs text-[#57534E] mt-1">
                  Verify your entered measurements below or edit any value before entering your delivery address.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-full border border-[#D6D3D1] hover:border-[#7F1D1D] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Measurements</span>
              </button>
            </div>

            {isLongDress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {LONG_DRESS_MEASUREMENTS.map((m) => (
                  <div
                    key={m.key}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#7F1D1D] text-white text-xs font-bold flex items-center justify-center">
                        {m.num}
                      </span>
                      <span className="text-sm font-semibold text-[#1C1917]">{m.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[#7F1D1D]">
                      {longDressMeasurements[m.key]} {measurementUnit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] flex justify-between text-sm">
                    <span className="font-semibold">{f}</span>
                    <span className="font-bold text-[#7F1D1D]">{measurements[f] || 'Studio Fit'}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-[#57534E] mb-1.5">
                Styling / Tailoring Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Neckline preference, sleeve styling, lining, or special instructions..."
                className="w-full px-4 py-3 rounded-xl border border-[#D6D3D1] text-sm"
              />
            </div>

            <div className="pt-4 flex justify-between border-t border-[#E7E5E4]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Delivery Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — Mandatory Delivery Address */}
        {step === 5 && (
          <PublicAddressForm
            value={deliveryAddress}
            loggedInCustomer={linkedCustomer}
            onChange={setDeliveryAddress}
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
            nextLabel="Review Complete Order"
          />
        )}

        {/* STEP 6 — Review Complete Order & STEP 7 Submit */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Review Complete Order</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E5E4] text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7F1D1D]">
                    Order &amp; Customer
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#7F1D1D] underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p><strong>Garment:</strong> {garment}</p>
                <p><strong>Customer:</strong> {linkedCustomer?.customerName} ({linkedCustomer?.customerId})</p>
                <p><strong>Mobile:</strong> {linkedCustomer?.primaryPhone}</p>
                {instructions && <p><strong>Notes:</strong> {instructions}</p>}
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E5E4] text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7F1D1D] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Address</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-xs font-bold text-[#7F1D1D] underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-semibold">{deliveryAddress.fullName} · {deliveryAddress.mobileNumber}</p>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {formatPublicAddressLine(deliveryAddress)}
                </p>
              </div>
            </div>

            {isLongDress && (
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E5E4] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7F1D1D]">
                    Long Dress Measurements ({measurementUnit})
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-[#7F1D1D] underline cursor-pointer"
                  >
                    Edit Measurements
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                  {LONG_DRESS_MEASUREMENTS.map((m) => (
                    <div key={m.key} className="bg-white p-2.5 rounded-xl border border-[#E7E5E4] flex justify-between">
                      <span className="text-[#57534E] font-medium">
                        {m.num}. {m.label}
                      </span>
                      <span className="font-bold text-[#1C1917]">
                        {longDressMeasurements[m.key]} {measurementUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between border-t border-[#E7E5E4]">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting || !addressIsValid || (isLongDress && !areAllLongDressMeasurementsValid(longDressMeasurements))}
                onClick={handleSubmitOrder}
                className="px-7 py-3 rounded-full bg-[#7F1D1D] hover:bg-[#651515] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting Order...' : 'Submit Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
