import React, { useState } from 'react';
import { CustomerRecord } from '../types/order';
import { PublicHeader, PublicPage } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { HomePage } from './HomePage';
import { ShopPage, CatalogItem } from './ShopPage';
import { TailoringPage } from './TailoringPage';
import { OrderTrackingPage } from './OrderTrackingPage';
import { CustomerAccountPage } from './CustomerAccountPage';
import { BulkEnquiryPage, AboutPage, ContactPage, CartPage, CartEntry } from './InfoPages';

interface PublicWebsiteProps {
  onOpenAdmin: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onOpenAdmin }) => {
  const [activePage, setActivePage] = useState<PublicPage>('HOME');
  const [tailoringCategory, setTailoringCategory] = useState<string>('Blouse');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [loggedInCustomer, setLoggedInCustomer] = useState<CustomerRecord | null>(null);
  const [cart, setCart] = useState<CartEntry[]>([]);

  const handleAddToCart = (item: CatalogItem, notes?: string) => {
    setCart((prev) => [...prev, { item, quantity: 1, notes }]);
  };

  const handleBookTailoring = (category: string) => {
    setTailoringCategory(category);
    setActivePage('TAILORING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActivePage('TRACKING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      <PublicHeader
        activePage={activePage}
        onNavigate={setActivePage}
        cartCount={cart.length}
        loggedInCustomerName={loggedInCustomer?.customerName}
        onOpenAdmin={onOpenAdmin}
      />

      <main className="flex-1">
        {activePage === 'HOME' && <HomePage onNavigate={setActivePage} />}
        {activePage === 'SHOP' && (
          <ShopPage onAddToCart={handleAddToCart} onBookTailoring={handleBookTailoring} />
        )}
        {activePage === 'TAILORING' && (
          <TailoringPage
            initialCategory={tailoringCategory}
            loggedInCustomer={loggedInCustomer}
            onLoginCustomer={setLoggedInCustomer}
            onTrackOrder={handleTrackOrder}
          />
        )}
        {activePage === 'TRACKING' && <OrderTrackingPage initialOrderId={trackingOrderId} />}
        {activePage === 'ACCOUNT' && (
          <CustomerAccountPage
            loggedInCustomer={loggedInCustomer}
            onLogin={setLoggedInCustomer}
            onLogout={() => setLoggedInCustomer(null)}
            onTrackOrder={handleTrackOrder}
          />
        )}
        {activePage === 'BULK' && <BulkEnquiryPage />}
        {activePage === 'ABOUT' && <AboutPage />}
        {activePage === 'CONTACT' && <ContactPage />}
        {activePage === 'CART' && (
          <CartPage
            cart={cart}
            onRemove={(idx) => setCart((prev) => prev.filter((_, i) => i !== idx))}
            onProceedToTailoring={() => setActivePage('TAILORING')}
            onContinueShopping={() => setActivePage('SHOP')}
          />
        )}
      </main>

      <PublicFooter onNavigate={setActivePage} onOpenAdmin={onOpenAdmin} />
    </div>
  );
};
