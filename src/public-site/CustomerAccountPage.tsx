import React, { useState } from 'react';
import { CustomerRecord } from '../types/order';
import { useOrder } from '../context/OrderContext';
import { api } from '../services/api';
import { User, LogOut, Save, BookOpen, AlertCircle, Lock } from 'lucide-react';

interface CustomerAccountPageProps {
  loggedInCustomer: CustomerRecord | null;
  onLogin: (cust: CustomerRecord) => void;
  onLogout: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  loggedInCustomer,
  onLogin,
  onLogout,
  onTrackOrder,
}) => {
  const { savedOrders, updateCustomerRecord } = useOrder();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editName, setEditName] = useState(loggedInCustomer?.customerName || '');
  const [editPhone, setEditPhone] = useState(loggedInCustomer?.primaryPhone || '');
  const [editAddress, setEditAddress] = useState(loggedInCustomer?.fullAddress || '');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneInput.trim() || !passwordInput) {
      setError('Mobile number and password are required.');
      return;
    }
    setLoading(true);
    const res = await api.loginCustomerAccount(phoneInput.trim(), passwordInput);
    setLoading(false);
    if (!res.ok || !res.customer) {
      setError(res.error || 'Invalid mobile number or password.');
      return;
    }
    setEditName(res.customer.customerName);
    setEditPhone(res.customer.primaryPhone);
    setEditAddress(res.customer.fullAddress || '');
    onLogin(res.customer);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nameInput.trim() || !phoneInput.trim() || passwordInput.length < 6) {
      setError('Name, mobile number, and password (min 6 characters) are required.');
      return;
    }
    setLoading(true);
    const res = await api.registerCustomerAccount({
      customerName: nameInput.trim(),
      primaryPhone: phoneInput.trim(),
      password: passwordInput,
      fullAddress: addressInput.trim(),
    });
    setLoading(false);
    if (!res.ok || !res.customer) {
      setError(res.error || 'Registration failed.');
      return;
    }
    setEditName(res.customer.customerName);
    setEditPhone(res.customer.primaryPhone);
    setEditAddress(res.customer.fullAddress || '');
    onLogin(res.customer);
  };

  const handleUpdateProfile = async () => {
    if (!loggedInCustomer) return;
    setError(null);
    setSavedMsg(null);
    const res = await updateCustomerRecord(loggedInCustomer.customerId, {
      customerName: editName.trim(),
      primaryPhone: editPhone.trim(),
      fullAddress: editAddress.trim(),
    });
    if (!res.ok || !res.customer) {
      setError(res.error || 'Could not update profile.');
      return;
    }
    onLogin(res.customer);
    setSavedMsg('Profile updated! Existing Customer ID preserved.');
  };

  const handleSignOut = async () => {
    await api.logoutStaff();
    onLogout();
  };

  if (!loggedInCustomer) {
    return (
      <div className="max-w-md mx-auto px-4 py-14">
        <form
          onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister}
          className="bg-white rounded-3xl border border-[#E7E5E4] p-7 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-[#E7E5E4] pb-3">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(null); }}
              className={`flex-1 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                mode === 'LOGIN' ? 'bg-[#7F1D1D] text-white' : 'text-[#57534E]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(null); }}
              className={`flex-1 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                mode === 'REGISTER' ? 'bg-[#7F1D1D] text-white' : 'text-[#57534E]'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Full Name *</label>
              <input
                required
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Mobile Number *</label>
            <input
              required
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="10-digit mobile"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
              Password * {mode === 'REGISTER' && '(min 6 chars)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                minLength={6}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Address</label>
              <textarea
                rows={2}
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'LOGIN' ? 'Sign In' : 'Create Customer Account'}
          </button>
        </form>
      </div>
    );
  }

  const myOrders = savedOrders.filter((o) => o.customer.customerId === loggedInCustomer.customerId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#7F1D1D]/10 text-[#7F1D1D] flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-[#7F1D1D]">
              Customer ID: {loggedInCustomer.customerId}
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#1C1917]">{loggedInCustomer.customerName}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="px-4 py-2 rounded-full border border-[#D6D3D1] text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Edit Personal Info (updates existing customerId) */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">Personal Information</h2>
        {savedMsg && <p className="text-xs font-semibold text-emerald-700">{savedMsg}</p>}
        {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Mobile Number</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">Address</label>
            <textarea
              rows={2}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleUpdateProfile}
          className="px-6 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#7F1D1D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Profile</span>
        </button>
      </div>

      {/* My Orders */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#7F1D1D]" />
          <span>My Orders ({myOrders.length})</span>
        </h2>
        {myOrders.length === 0 ? (
          <p className="text-sm text-[#57534E]">No orders found for your account yet.</p>
        ) : (
          <div className="space-y-3">
            {myOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl border border-[#E7E5E4] flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-sm text-[#1C1917]">
                    Order #{ord.customer.billNumber || ord.id}
                  </p>
                  <p className="text-xs text-[#57534E]">
                    Date: {ord.customer.date} · Status: {ord.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTrackOrder(ord.id)}
                  className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#D6D3D1] text-xs font-semibold cursor-pointer"
                >
                  Track
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
