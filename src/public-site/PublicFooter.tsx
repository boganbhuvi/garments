import React from 'react';
import { PublicPage } from './PublicHeader';
import { Scissors, Shield } from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (page: PublicPage) => void;
  onOpenAdmin: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const nav = (p: PublicPage) => {
    onNavigate(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C1917] text-[#E7E5E4] pt-14 pb-8 px-4 sm:px-6 lg:px-8 border-t border-[#292524]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#292524]">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#7F1D1D] text-white flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-white tracking-tight block leading-none">
                GIRIRAJ CITY GARMENTS
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D97706] font-semibold">
                Ladies Tailoring &amp; Garments
              </span>
            </div>
          </div>
          <p className="text-sm text-[#A8A29E] max-w-sm leading-relaxed">
            Precision ladies tailoring, custom blouse &amp; salwar craftsmanship, and curated garment collections designed for fit, comfort, and timeless elegance.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-[#A8A29E]">
            <li><button onClick={() => nav('HOME')} className="hover:text-white cursor-pointer">Home</button></li>
            <li><button onClick={() => nav('SHOP')} className="hover:text-white cursor-pointer">Collections</button></li>
            <li><button onClick={() => nav('TAILORING')} className="hover:text-white cursor-pointer">Tailoring Services</button></li>
            <li><button onClick={() => nav('BULK')} className="hover:text-white cursor-pointer">Bulk Enquiries</button></li>
            <li><button onClick={() => nav('ABOUT')} className="hover:text-white cursor-pointer">About Us</button></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm text-[#A8A29E]">
            <li><button onClick={() => nav('TRACKING')} className="hover:text-white cursor-pointer">Track Order</button></li>
            <li><button onClick={() => nav('CONTACT')} className="hover:text-white cursor-pointer">Contact Us</button></li>
            <li><button onClick={() => nav('TAILORING')} className="hover:text-white cursor-pointer">Measurement Guide</button></li>
            <li><button onClick={() => nav('ABOUT')} className="hover:text-white cursor-pointer">Pickup &amp; Delivery Policy</button></li>
          </ul>
        </div>

        {/* Account & Portal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Account</h4>
          <ul className="space-y-2.5 text-sm text-[#A8A29E]">
            <li><button onClick={() => nav('ACCOUNT')} className="hover:text-white cursor-pointer">Customer Login / Register</button></li>
            <li><button onClick={() => nav('ACCOUNT')} className="hover:text-white cursor-pointer">My Orders</button></li>
            <li><button onClick={() => nav('CART')} className="hover:text-white cursor-pointer">Shopping Bag</button></li>
            <li className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#44403C] text-[#D6D3D1] hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Staff / Admin ERP</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
        <p>&copy; {new Date().getFullYear()} Giriraj City Garments. All rights reserved.</p>
        <p>Privacy Policy &middot; Terms &amp; Conditions</p>
      </div>
    </footer>
  );
};
