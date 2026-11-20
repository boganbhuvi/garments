import React, { useState } from 'react';
import { CatalogItem } from './ShopPage';
import { CheckCircle2, Trash2, ShoppingBag, Building2, Phone, Mail, MapPin } from 'lucide-react';

export const BulkEnquiryPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [org, setOrg] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [qty, setQty] = useState('');
  const [details, setDetails] = useState('');

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Enquiry Received</h1>
        <p className="text-sm text-[#57534E]">
          Thank you, {name}. Our studio team will review your bulk requirement for {org || 'your organization'} and contact you on {phone}.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">
          <Building2 className="w-4 h-4" />
          <span>Institutional &amp; Business Orders</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
          Bulk &amp; Uniform Enquiries
        </h1>
        <p className="text-sm text-[#57534E] mt-1">
          For schools, corporate teams, boutiques, and special group orders.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && phone.trim()) setSubmitted(true);
        }}
        className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 space-y-4 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Contact Name *</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Organization / Company</label>
            <input type="text" value={org} onChange={(e) => setOrg(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Mobile Number *</label>
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Estimated Quantity</label>
            <input type="text" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 50 sets" className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Requirement Details</label>
            <textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
          </div>
        </div>
        <button type="submit" className="px-7 py-3 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold cursor-pointer">
          Submit Bulk Enquiry
        </button>
      </form>
    </div>
  );
};

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
    <div>
      <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Our Story</span>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
        About Giriraj City Garments
      </h1>
    </div>
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 space-y-4 text-sm sm:text-base text-[#57534E] leading-relaxed">
      <p>
        Giriraj City Garments is a dedicated ladies tailoring studio and garment house focused on precision fit, clean finishing, and reliable delivery.
      </p>
      <p>
        Every order passes through structured workshop stages — from individual measurement recording and master cutting to stitching, quality check, and dispatch — ensuring consistent quality for both everyday wear and special occasions.
      </p>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Get In Touch</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">Contact Us</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 space-y-4 text-sm text-[#57534E]">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#7F1D1D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1C1917]">Studio Address</p>
              <p>Giriraj City Garments (Update verified store address in settings)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#7F1D1D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1C1917]">Phone</p>
              <p>Available during studio working hours</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#7F1D1D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1C1917]">Email</p>
              <p>Contact via enquiry form</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6">
          {sent ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <p className="font-bold text-[#1C1917]">Message Sent</p>
              <p className="text-xs text-[#57534E]">We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3">
              <input required type="text" placeholder="Your Name" className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
              <input required type="tel" placeholder="Mobile Number" className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
              <textarea required rows={3} placeholder="How can we help?" className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm" />
              <button type="submit" className="w-full py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export interface CartEntry {
  item: CatalogItem;
  quantity: number;
  notes?: string;
}

export const CartPage: React.FC<{
  cart: CartEntry[];
  onRemove: (idx: number) => void;
  onProceedToTailoring: () => void;
  onContinueShopping: () => void;
}> = ({ cart, onRemove, onProceedToTailoring, onContinueShopping }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="font-serif text-3xl font-bold text-[#1C1917] mb-6">Your Enquiry Bag</h1>
    {cart.length === 0 ? (
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-10 text-center space-y-4">
        <ShoppingBag className="w-10 h-10 text-[#A8A29E] mx-auto" />
        <p className="text-sm text-[#57534E]">Your bag is currently empty.</p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer"
        >
          Explore Collections
        </button>
      </div>
    ) : (
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 space-y-4">
        {cart.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 pb-4 border-b border-[#F5F5F4]">
            <div>
              <p className="font-bold text-sm text-[#1C1917]">{entry.item.name}</p>
              <p className="text-xs text-[#57534E]">
                Category: {entry.item.category} · Qty: {entry.quantity}
              </p>
              {entry.notes && <p className="text-xs text-[#7F1D1D] mt-0.5">Notes: {entry.notes}</p>}
            </div>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onContinueShopping}
            className="px-5 py-2.5 rounded-full border border-[#D6D3D1] text-sm font-semibold cursor-pointer"
          >
            Continue Shopping
          </button>
          <button
            type="button"
            onClick={onProceedToTailoring}
            className="px-6 py-2.5 rounded-full bg-[#7F1D1D] text-white text-sm font-semibold cursor-pointer"
          >
            Proceed to Tailoring Booking
          </button>
        </div>
      </div>
    )}
  </div>
);
