import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Scissors,
  Shield,
} from 'lucide-react';

export type PublicPage =
  | 'HOME'
  | 'SHOP'
  | 'TAILORING'
  | 'TRACKING'
  | 'BULK'
  | 'ABOUT'
  | 'CONTACT'
  | 'ACCOUNT'
  | 'CART';

interface PublicHeaderProps {
  activePage: PublicPage;
  onNavigate: (page: PublicPage) => void;
  cartCount: number;
  loggedInCustomerName?: string;
  onOpenAdmin: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  activePage,
  onNavigate,
  cartCount,
  loggedInCustomerName,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PublicPage; label: string }[] = [
    { id: 'HOME', label: 'Home' },
    { id: 'SHOP', label: 'Collections' },
    { id: 'TAILORING', label: 'Tailoring Services' },
    { id: 'TRACKING', label: 'Track Order' },
    { id: 'BULK', label: 'Bulk Enquiries' },
    { id: 'ABOUT', label: 'About Us' },
    { id: 'CONTACT', label: 'Contact' },
  ];

  const handleNav = (page: PublicPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E5E4]">
      {/* Top Announcement Bar */}
      <div className="bg-[#7F1D1D] text-[#FAF8F5] text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        Giriraj City Garments — Bespoke Ladies Tailoring &amp; Curated Garment Studio
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => handleNav('HOME')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#7F1D1D] text-[#FAF8F5] flex items-center justify-center shadow-sm group-hover:bg-[#991B1B] transition-colors">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1C1917] leading-none">
              GIRIRAJ
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#7F1D1D] font-semibold mt-0.5">
              City Garments
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNav(link.id)}
              className={`text-sm font-medium transition-colors cursor-pointer pb-0.5 ${
                activePage === link.id
                  ? 'text-[#7F1D1D] border-b-2 border-[#7F1D1D] font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleNav('SHOP')}
            className="p-2 rounded-full text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4]/50 transition-colors cursor-pointer"
            aria-label="Search collections"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleNav('ACCOUNT')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[#1C1917] hover:bg-[#E7E5E4]/50 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-[#7F1D1D]" />
            <span className="hidden sm:inline">
              {loggedInCustomerName ? loggedInCustomerName.split(' ')[0] : 'Account'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('CART')}
            className="relative p-2 rounded-full text-[#1C1917] hover:bg-[#E7E5E4]/50 transition-colors cursor-pointer"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#7F1D1D] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#D6D3D1] text-xs font-semibold text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] transition-colors cursor-pointer"
            title="Open Internal Staff & Admin ERP"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-[#1C1917] hover:bg-[#E7E5E4]/50 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-t border-[#E7E5E4] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNav(link.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === link.id
                  ? 'bg-[#7F1D1D]/10 text-[#7F1D1D] font-semibold'
                  : 'text-[#1C1917] hover:bg-[#E7E5E4]/50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-[#57534E] border border-[#D6D3D1] flex items-center gap-2 mt-2"
          >
            <Shield className="w-4 h-4" />
            <span>Staff / Admin Portal</span>
          </button>
        </div>
      )}
    </header>
  );
};
