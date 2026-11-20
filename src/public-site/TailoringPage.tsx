import React, { useState } from 'react';
import { CustomerRecord } from '../types/order';
import { useOrder } from '../context/OrderContext';
import { api } from '../services/api';
import { EMPTY_MEASUREMENTS } from '../data/defaultTemplates';
import { Scissors, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface TailoringPageProps {
  initialCategory?: string;
  loggedInCustomer: CustomerRecord | null;
  onLoginCustomer: (cust: CustomerRecord) => void;
  onTrackOrder: (orderId: string) => void;
}

const GARMENT_OPTIONS = ['Blouse', 'Tops / Kurti', 'Bottom / Salwar', 'Saree Falls & Pico', 'Nighty', 'Dhupatta'];

const RELEVANT_MEASUREMENTS: Record<string, string[]> = {
  Blouse: ['Full Length', 'Chest / Bust', 'Waist', 'Shoulder', 'Sleeve Length', 'Armhole', 'Front Neck', 'Back Neck'],
  'Tops / Kurti': ['Full Length', 'Chest / Bust', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Slit Length'],
  'Bottom / Salwar': ['Bottom Length', 'Waist', 'Hip', 'Thigh Round', 'Ankle / Bottom Round'],
  'Saree Falls & Pico': ['Saree Falls Required', 'Pico Edging'],
  Nighty: ['Full Length', 'Chest / Bust', 'Shoulder', 'Sleeve Length'],
  Dhupatta: ['Edging / Tassel Preference'],
};

export const TailoringPage: React.FC<TailoringPageProps> = ({
  initialCategory,
  loggedInCustomer,
  onLoginCustomer,
  onTrackOrder,
}) => {
  const { customers, registerCustomer } = useOrder();

  const [step, setStep] = useState(1);
  const [garment, setGarment] = useState(initialCategory || 'Blouse');
  const [phoneLookup, setPhoneLookup] = useState(loggedInCustomer?.primaryPhone || '');
  const [custName, setCustName] = useState(loggedInCustomer?.customerName || '');
  const [custAddress, setCustAddress] = useState(loggedInCustomer?.fullAddress || '');
  const [linkedCustomer, setLinkedCustomer] = useState<CustomerRecord | null>(loggedInCustomer);

  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'STORE_PICKUP' | 'HOME_DELIVERY'>('STORE_PICKUP');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const handleLookupOrRegister = async () => {
    setError(null);
    const clean = phoneLookup.replace(/\D/g, '');
    if (clean.length < 6) {
      setError('Please enter a valid mobile number.');
      return;
    }

    const existing = customers.find(
      (c) => c.primaryPhone.replace(/\D/g, '').endsWith(clean.slice(-10))
    );
    if (existing) {
      setLinkedCustomer(existing);
      setCustName(existing.customerName);
      setCustAddress(existing.fullAddress || '');
      onLoginCustomer(existing);
      setStep(3);
      return;
    }

    if (!custName.trim()) {
      setError('New customer: please enter your full name to register.');
      return;
    }

    const res = await registerCustomer({
      customerName: custName.trim(),
      primaryPhone: phoneLookup.trim(),
      fullAddress: custAddress.trim(),
    });
    if (!res.ok || !res.customer) {
      if (res.existingCustomer) {
        setLinkedCustomer(res.existingCustomer);
        onLoginCustomer(res.existingCustomer);
        setStep(3);
        return;
      }
      setError(res.error || 'Could not register customer.');
      return;
    }
    setLinkedCustomer(res.customer);
    onLoginCustomer(res.customer);
    setStep(3);
  };

  const handleSubmitOrder = async () => {
    if (!linkedCustomer) {
      setError('Please complete customer information first.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const newOrderId = `WEB-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const payload: any = {
      id: newOrderId,
      serialNumber: `W${Math.floor(100 + Math.random() * 900)}`,
      status: 'ORDER_CONFIRMED',
      currentStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        customerId: linkedCustomer.customerId,
        billNumber: newOrderId,
        date: today,
        customerName: linkedCustomer.customerName,
        relationshipType: linkedCustomer.relationshipType === 'D/O' || linkedCustomer.relationshipType === 'W/O' ? linkedCustomer.relationshipType : 'D/O',
        fatherName: linkedCustomer.fatherName || '',
        husbandName: linkedCustomer.husbandName || '',
        primaryPhone: linkedCustomer.primaryPhone,
        secondaryPhone: linkedCustomer.secondaryPhone || '',
        additionalPhones: linkedCustomer.additionalPhones || [],
        fullAddress: linkedCustomer.fullAddress || custAddress,
        areaLocation: linkedCustomer.areaLocation || '',
      },
      garments: [
        { id: garment.toLowerCase(), category: garment, label: garment, quantity: 1 },
      ],
      measurements: {
        ...EMPTY_MEASUREMENTS,
        customFields: Object.entries(measurements).map(([label, value], i) => ({
          id: `cf-${i}`,
          label,
          value,
        })),
      },
      specifications: [
        {
          id: `spec-${Date.now()}`,
          garmentType: garment,
          notes: `${instructions} (Delivery: ${deliveryMode === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'})`,
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

    const saved = await api.saveOrder(payload);
    setSubmitting(false);
    if (!saved) {
      setError('Unable to submit order to server. Please try again.');
      return;
    }
    setSubmittedOrderId(saved.id);
  };

  if (submittedOrderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">
          Tailoring Request Confirmed
        </h1>
        <p className="text-sm text-[#57534E]">
          Your order <strong>#{submittedOrderId}</strong> is linked to your Customer ID{' '}
          <strong>{linkedCustomer?.customerId}</strong>.
        </p>
        <button
          type="button"
          onClick={() => onTrackOrder(submittedOrderId)}
          className="px-7 py-3 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer"
        >
          Track Order Status
        </button>
      </div>
    );
  }

  const fields = RELEVANT_MEASUREMENTS[garment] || ['Length', 'Chest', 'Waist'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">
          Custom Tailoring Studio
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
          Book Custom Tailoring
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        {['1. Garment', '2. Customer', '3. Measurements', '4. Preferences', '5. Delivery', '6. Review'].map(
          (label, idx) => (
            <div
              key={label}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                step === idx + 1
                  ? 'bg-[#7F1D1D] text-white'
                  : step > idx + 1
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white border border-[#E7E5E4] text-[#78716C]'
              }`}
            >
              {label}
            </div>
          )
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Select Garment / Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GARMENT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGarment(opt)}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${
                    garment === opt
                      ? 'border-[#7F1D1D] bg-[#7F1D1D]/5 font-semibold text-[#7F1D1D]'
                      : 'border-[#E7E5E4] hover:border-[#1C1917]'
                  }`}
                >
                  <span>{opt}</span>
                  <Scissors className="w-4 h-4" />
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

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Customer Information</h2>
            <p className="text-xs text-[#57534E]">
              Enter your mobile number. Existing customers are linked automatically without creating duplicates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phoneLookup}
                  onChange={(e) => setPhoneLookup(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                  Full Name (for new customers)
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
                  Address
                </label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Door No, Street, Area, City"
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
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Measurements for {garment}</h2>
            <p className="text-xs text-[#57534E]">
              Enter measurements in inches (leave blank if you prefer studio measurement).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f}>
                  <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">{f}</label>
                  <input
                    type="text"
                    value={measurements[f] || ''}
                    onChange={(e) => setMeasurements({ ...measurements, [f]: e.target.value })}
                    placeholder="e.g. 14.5 in"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer">
                Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Additional Requirements</h2>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Neck design, sleeve pattern, lining preference, or special instructions..."
              className="w-full px-4 py-3 rounded-xl border border-[#D6D3D1] text-sm"
            />
            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer">
                Back
              </button>
              <button type="button" onClick={() => setStep(5)} className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Pickup / Delivery Preference</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMode('STORE_PICKUP')}
                className={`p-4 rounded-2xl border text-left cursor-pointer ${
                  deliveryMode === 'STORE_PICKUP' ? 'border-[#7F1D1D] bg-[#7F1D1D]/5 font-semibold' : 'border-[#E7E5E4]'
                }`}
              >
                <p className="text-sm font-bold">Store Pickup</p>
                <p className="text-xs text-[#57534E] mt-1">Collect directly from Giriraj City Garments studio.</p>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('HOME_DELIVERY')}
                className={`p-4 rounded-2xl border text-left cursor-pointer ${
                  deliveryMode === 'HOME_DELIVERY' ? 'border-[#7F1D1D] bg-[#7F1D1D]/5 font-semibold' : 'border-[#E7E5E4]'
                }`}
              >
                <p className="text-sm font-bold">Home Delivery</p>
                <p className="text-xs text-[#57534E] mt-1">Deliver to your registered address.</p>
              </button>
            </div>
            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setStep(4)} className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer">
                Back
              </button>
              <button type="button" onClick={() => setStep(6)} className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer">
                Review Order
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">Review &amp; Submit</h2>
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E5E4] text-sm space-y-2">
              <p><strong>Garment:</strong> {garment}</p>
              <p><strong>Customer:</strong> {linkedCustomer?.customerName} ({linkedCustomer?.customerId})</p>
              <p><strong>Mobile:</strong> {linkedCustomer?.primaryPhone}</p>
              <p><strong>Delivery:</strong> {deliveryMode === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'}</p>
              {instructions && <p><strong>Notes:</strong> {instructions}</p>}
            </div>
            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setStep(5)} className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer">
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitOrder}
                className="px-7 py-3 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Tailoring Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
