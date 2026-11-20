import React, { useState } from 'react';
import { PublicPage } from './PublicHeader';
import {
  ArrowRight,
  Scissors,
  Sparkles,
  CheckCircle2,
  Ruler,
  Package,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PublicPage) => void;
}

const FAQS = [
  {
    q: 'How do I book custom tailoring with Giriraj City Garments?',
    a: 'You can book directly through our Tailoring Services page. Select your garment type, link or register your customer profile, enter your measurements, and submit your request.',
  },
  {
    q: 'Do I need to re-enter my measurements for every order?',
    a: 'No. Once your customer profile is registered, your permanent Customer ID links all your orders and saved measurements so repeat orders are effortless.',
  },
  {
    q: 'How can I track my tailoring or garment order?',
    a: 'Visit our Track Order page and enter your Order / Bill Number or registered mobile number to view real-time workshop progress from Cutting to Dispatch.',
  },
  {
    q: 'Do you accept bulk or institutional uniform orders?',
    a: 'Yes. Visit our Bulk Enquiries page to submit your organization requirements and estimated quantities.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-[#FAF8F5] text-[#1C1917]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#7F1D1D] bg-[#7F1D1D]/10 px-3.5 py-1.5 rounded-full">
              Bespoke Ladies Tailoring &amp; Garments
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] leading-[1.1]">
              Crafted for Fit. <br />
              <span className="text-[#7F1D1D]">Tailored for You.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#57534E] max-w-xl leading-relaxed">
              Giriraj City Garments brings together precision custom tailoring, curated ladies collections, and seamless order tracking — built on decades of workshop craftsmanship.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('SHOP')}
                className="px-7 py-3.5 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold tracking-wide flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('TAILORING')}
                className="px-7 py-3.5 rounded-full bg-white hover:bg-[#F5F5F4] text-[#1C1917] border border-[#D6D3D1] text-sm font-semibold tracking-wide flex items-center gap-2 transition-all cursor-pointer"
              >
                <Scissors className="w-4 h-4 text-[#7F1D1D]" />
                <span>Book Tailoring Services</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#EFECE6] to-[#E7E5E4] border border-[#D6D3D1] p-8 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
                  Studio Craftsmanship
                </span>
                <Sparkles className="w-5 h-5 text-[#B45309]" />
              </div>
              <div className="space-y-3">
                <p className="font-serif text-2xl font-bold text-[#1C1917]">
                  Custom Blouses, Salwar Suits, Kurtis &amp; Saree Finishing
                </p>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Every garment is individually measured, cut, stitched, and quality-checked in our dedicated workshop.
                </p>
              </div>
              <div className="pt-4 border-t border-[#D6D3D1] flex items-center justify-between text-xs font-semibold text-[#57534E]">
                <span>01. Precision Cutting</span>
                <span>02. Master Stitching</span>
                <span>03. QC Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN SHOPPING & SERVICE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Categories</span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1917] mt-1">
              Garments &amp; Tailoring Specialties
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('SHOP')}
            className="text-sm font-semibold text-[#7F1D1D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { title: 'Designer Blouses', desc: 'Custom necklines, lining & fitting' },
            { title: 'Salwar & Tops', desc: 'Daily wear & festive stitching' },
            { title: 'Saree Falls & Finishing', desc: 'Pico, falls & edging care' },
            { title: 'Nightwear & Kurtis', desc: 'Comfort-first tailored silhouettes' },
          ].map((cat) => (
            <button
              key={cat.title}
              type="button"
              onClick={() => onNavigate('SHOP')}
              className="text-left bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#7F1D1D]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center mb-4 group-hover:bg-[#7F1D1D] group-hover:text-white transition-colors">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">{cat.title}</h3>
              <p className="text-xs text-[#57534E] mt-1">{cat.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. HOW THE ORDERING PROCESS WORKS */}
      <section className="bg-white border-y border-[#E7E5E4] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7F1D1D]">Simple Journey</span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1917] mt-1">
              How Our Tailoring &amp; Ordering Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Scissors, title: 'Select Garment', desc: 'Choose from collections or custom tailoring services.' },
              { step: '02', icon: Ruler, title: 'Share Measurements', desc: 'Enter garment-specific measurements or reuse saved ones.' },
              { step: '03', icon: CheckCircle2, title: 'Workshop Crafting', desc: 'Cutting, master stitching, and quality inspection.' },
              { step: '04', icon: Package, title: 'Track & Receive', desc: 'Track live progress online until ready for pickup or delivery.' },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E4]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-2xl font-bold text-[#7F1D1D]/40">{item.step}</span>
                  <item.icon className="w-5 h-5 text-[#7F1D1D]" />
                </div>
                <h3 className="font-bold text-base text-[#1C1917]">{item.title}</h3>
                <p className="text-sm text-[#57534E] mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BULK / BUSINESS ENQUIRY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[#D97706] text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-4 h-4" />
              <span>Business &amp; Institutional Orders</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Need Bulk Garments or Uniform Tailoring?
            </h2>
            <p className="text-sm text-[#A8A29E]">
              Submit a bulk enquiry for schools, corporate teams, boutiques, or special events.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('BULK')}
            className="px-6 py-3.5 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
          >
            Submit Bulk Enquiry
          </button>
        </div>
      </section>

      {/* 5. FAQS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="font-serif text-3xl font-bold text-center text-[#1C1917] mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#1C1917] cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#7F1D1D] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#78716C] flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-sm text-[#57534E] leading-relaxed border-t border-[#F5F5F4] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
