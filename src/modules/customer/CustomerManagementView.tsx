import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { CustomerRecord, Order } from '../../types/order';
import {
  UserCheck,
  Search,
  Phone,
  MapPin,
  PlusCircle,
  Edit3,
  Save,
  X,
  History,
  BookOpen,
  ExternalLink,
  AlertTriangle,
  Archive,
  Trash2,
  UserPlus,
} from 'lucide-react';

interface CustomerFormState {
  customerName: string;
  relationshipType: 'W/O' | 'D/O' | 'S/O' | 'None';
  fatherName: string;
  husbandName: string;
  primaryPhone: string;
  secondaryPhone: string;
  doorNo: string;
  street: string;
  areaLocation: string;
  city: string;
  state: string;
  pinCode: string;
  fullAddress: string;
}

const EMPTY_FORM: CustomerFormState = {
  customerName: '',
  relationshipType: 'None',
  fatherName: '',
  husbandName: '',
  primaryPhone: '',
  secondaryPhone: '',
  doorNo: '',
  street: '',
  areaLocation: '',
  city: '',
  state: '',
  pinCode: '',
  fullAddress: '',
};

export const CustomerManagementView: React.FC = () => {
  const {
    customers,
    savedOrders,
    registerCustomer,
    updateCustomerRecord,
    archiveOrDeleteCustomer,
    selectRegisteredCustomerForOrder,
    setActiveModule,
    setSelectedDetailOrder,
    createNewOrder,
  } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateCustomer, setDuplicateCustomer] = useState<CustomerRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCustomers = customers.filter((cust) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const digitsOnly = searchQuery.replace(/\D/g, '');
    const allPhones = [
      cust.primaryPhone || '',
      cust.secondaryPhone || '',
      ...(cust.additionalPhones || []),
    ].filter(Boolean);

    const phoneMatch = allPhones.some((p) => {
      const clean = p.replace(/\D/g, '');
      return p.toLowerCase().includes(q) || (digitsOnly && clean.includes(digitsOnly));
    });

    return (
      phoneMatch ||
      cust.customerName.toLowerCase().includes(q) ||
      cust.customerId.toLowerCase().includes(q) ||
      (cust.areaLocation || '').toLowerCase().includes(q) ||
      (cust.fullAddress || '').toLowerCase().includes(q)
    );
  });

  const getCustomerOrders = (customerId: string): Order[] =>
    savedOrders.filter((o) => o.customer.customerId === customerId);

  const openRegisterModal = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setDuplicateCustomer(null);
    setIsRegisterOpen(true);
  };

  const openCustomerProfile = (cust: CustomerRecord, editMode = false) => {
    setSelectedCustomer(cust);
    setIsEditing(editMode);
    setFormError(null);
    setDuplicateCustomer(null);
    setForm({
      customerName: cust.customerName || '',
      relationshipType: cust.relationshipType || 'None',
      fatherName: cust.fatherName || '',
      husbandName: cust.husbandName || '',
      primaryPhone: cust.primaryPhone || '',
      secondaryPhone: cust.secondaryPhone || '',
      doorNo: cust.doorNo || '',
      street: cust.street || '',
      areaLocation: cust.areaLocation || '',
      city: cust.city || '',
      state: cust.state || '',
      pinCode: cust.pinCode || '',
      fullAddress: cust.fullAddress || '',
    });
  };

  const handleRegisterSubmit = async (forceCreate = false) => {
    if (!form.customerName.trim() || !form.primaryPhone.trim()) {
      setFormError('Customer Name and Primary Mobile Number are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    const composedAddress =
      form.fullAddress.trim() ||
      [form.doorNo, form.street, form.areaLocation, form.city, form.state, form.pinCode ? `PIN ${form.pinCode}` : '']
        .filter(Boolean)
        .join(', ');

    const res = await registerCustomer({
      ...form,
      fullAddress: composedAddress,
      forceCreate,
    });
    setIsSaving(false);

    if (!res.ok) {
      setFormError(res.error || 'Could not register customer.');
      if (res.existingCustomer) {
        setDuplicateCustomer(res.existingCustomer);
      }
      return;
    }

    setIsRegisterOpen(false);
    setDuplicateCustomer(null);
    if (res.customer) {
      openCustomerProfile(res.customer, false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedCustomer) return;
    if (!form.customerName.trim() || !form.primaryPhone.trim()) {
      setFormError('Customer Name and Primary Mobile Number are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    const composedAddress =
      form.fullAddress.trim() ||
      [form.doorNo, form.street, form.areaLocation, form.city, form.state, form.pinCode ? `PIN ${form.pinCode}` : '']
        .filter(Boolean)
        .join(', ');

    const res = await updateCustomerRecord(selectedCustomer.customerId, {
      ...form,
      fullAddress: composedAddress,
    });
    setIsSaving(false);

    if (!res.ok) {
      setFormError(res.error || 'Failed to update customer.');
      return;
    }

    if (res.customer) {
      setSelectedCustomer(res.customer);
    }
    setIsEditing(false);
  };

  const handleArchiveOrDelete = async (cust: CustomerRecord) => {
    const linkedOrders = getCustomerOrders(cust.customerId);
    const confirmMsg =
      linkedOrders.length > 0
        ? `${cust.customerName} (${cust.customerId}) has ${linkedOrders.length} linked order(s). They will be safely archived without deleting any orders. Continue?`
        : `Delete customer ${cust.customerName} (${cust.customerId})?`;
    if (!window.confirm(confirmMsg)) return;
    const res = await archiveOrDeleteCustomer(cust.customerId);
    if (res.ok && selectedCustomer?.customerId === cust.customerId) {
      setSelectedCustomer(null);
    }
  };

  const handleStartNewOrderForCustomer = (cust: CustomerRecord) => {
    createNewOrder();
    selectRegisteredCustomerForOrder(cust);
    setActiveModule('FRONT_DESK');
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="bg-[#233B5D] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white text-[#233B5D] flex items-center justify-center font-black shadow-lg">
            <UserCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Customer Details
              </h1>
              <span className="bg-[#147D75] text-[#99F2E8] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {customers.length} Registered Profiles
              </span>
            </div>
            <p className="text-sm text-slate-300 font-semibold mt-0.5">
              Dedicated Customer Master — register, search, edit profiles, and view linked order history
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openRegisterModal}
          className="px-5 py-3 rounded-xl bg-[#D68B20] hover:bg-[#B47417] text-white font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE4EE] p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by Name, Mobile Number, Customer ID (e.g. C0101), or Address..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE4EE] focus:border-[#233B5D] focus:outline-none text-sm font-semibold text-[#191C1E]"
          />
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer List Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-10 text-center">
          <p className="text-slate-600 font-bold text-base">No matching customers found.</p>
          <p className="text-slate-400 text-sm mt-1">Try a different search term or register a new customer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const linkedOrders = getCustomerOrders(cust.customerId);
            return (
              <div
                key={cust.customerId}
                className="bg-white rounded-2xl border border-[#DCE4EE] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block text-xs font-black px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 mb-1.5">
                        {cust.customerId}
                      </span>
                      <h3 className="text-lg font-black text-[#191C1E] leading-tight">
                        {cust.customerName}
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {linkedOrders.length} {linkedOrders.length === 1 ? 'Order' : 'Orders'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold">
                      <Phone className="w-4 h-4 text-[#147D75] flex-shrink-0" />
                      <span>{cust.primaryPhone}</span>
                      {cust.secondaryPhone && (
                        <span className="text-xs text-slate-400">/ {cust.secondaryPhone}</span>
                      )}
                    </div>
                    {cust.fullAddress && (
                      <div className="flex items-start gap-2 text-xs text-slate-500">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.fullAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openCustomerProfile(cust, false)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#233B5D] text-xs font-black cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => openCustomerProfile(cust, true)}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartNewOrderForCustomer(cust)}
                    className="px-3 py-2 rounded-xl bg-[#233B5D] hover:bg-[#1A2C46] text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Order</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register New Customer Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-[#233B5D]" />
                <h2 className="text-xl font-black text-[#191C1E]">Register New Customer</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm font-semibold flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
                {duplicateCustomer && (
                  <div className="flex items-center gap-2 pl-7">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterOpen(false);
                        openCustomerProfile(duplicateCustomer, false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#233B5D] text-white text-xs font-black cursor-pointer"
                    >
                      Open Existing Profile ({duplicateCustomer.customerId})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegisterSubmit(true)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-400 text-amber-900 text-xs font-bold cursor-pointer"
                    >
                      Register Anyway
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Primary Mobile Number *
                </label>
                <input
                  type="tel"
                  value={form.primaryPhone}
                  onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
                  placeholder="10-digit Mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Secondary Mobile
                </label>
                <input
                  type="tel"
                  value={form.secondaryPhone}
                  onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Relationship
                </label>
                <select
                  value={form.relationshipType}
                  onChange={(e) => setForm({ ...form, relationshipType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white"
                >
                  <option value="None">None</option>
                  <option value="W/O">W/O (Wife of)</option>
                  <option value="D/O">D/O (Daughter of)</option>
                  <option value="S/O">S/O (Son of)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Father Name
                </label>
                <input
                  type="text"
                  value={form.fatherName}
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Husband Name
                </label>
                <input
                  type="text"
                  value={form.husbandName}
                  onChange={(e) => setForm({ ...form, husbandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                  Full Address
                </label>
                <textarea
                  rows={2}
                  value={form.fullAddress}
                  onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                  placeholder="Door No, Street, Area, City, PIN"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleRegisterSubmit(false)}
                className="px-5 py-2.5 rounded-xl bg-[#233B5D] hover:bg-[#1A2C46] text-white text-sm font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Register Customer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile & Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="inline-block text-xs font-black px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 mb-1">
                  Permanent ID: {selectedCustomer.customerId}
                </span>
                <h2 className="text-2xl font-black text-[#191C1E]">
                  {selectedCustomer.customerName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black flex items-center gap-1.5 border border-amber-300 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleArchiveOrDelete(selectedCustomer)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
                  title="Archive or Delete Customer"
                >
                  {getCustomerOrders(selectedCustomer.customerId).length > 0 ? (
                    <Archive className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
                {formError}
              </div>
            )}

            {isEditing ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                      Primary Mobile *
                    </label>
                    <input
                      type="tel"
                      value={form.primaryPhone}
                      onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                      Secondary Mobile
                    </label>
                    <input
                      type="tel"
                      value={form.secondaryPhone}
                      onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                      Father Name
                    </label>
                    <input
                      type="text"
                      value={form.fatherName}
                      onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                      Husband Name
                    </label>
                    <input
                      type="text"
                      value={form.husbandName}
                      onChange={(e) => setForm({ ...form, husbandName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                      Full Address
                    </label>
                    <textarea
                      rows={2}
                      value={form.fullAddress}
                      onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleUpdateSubmit}
                    className="px-5 py-2 rounded-xl bg-[#16834A] hover:bg-[#126C3C] text-white text-sm font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Updating...' : 'Save Changes (Update Existing)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {/* Read-only details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Primary Mobile</span>
                    <p className="font-black text-[#191C1E]">{selectedCustomer.primaryPhone}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Secondary Mobile</span>
                    <p className="font-semibold text-slate-700">{selectedCustomer.secondaryPhone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Father / Husband</span>
                    <p className="font-semibold text-slate-700">
                      {[selectedCustomer.fatherName, selectedCustomer.husbandName].filter(Boolean).join(' / ') || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Address</span>
                    <p className="font-semibold text-slate-700">{selectedCustomer.fullAddress || '—'}</p>
                  </div>
                </div>

                {/* Associated Orders */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-[#233B5D] uppercase flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Linked Orders ({getCustomerOrders(selectedCustomer.customerId).length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        handleStartNewOrderForCustomer(selectedCustomer);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#233B5D] text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Order</span>
                    </button>
                  </div>
                  {getCustomerOrders(selectedCustomer.customerId).length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No orders placed for this customer yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {getCustomerOrders(selectedCustomer.customerId).map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-black text-[#191C1E]">
                              Bill #{ord.customer.billNumber || ord.id} · S.No {ord.serialNumber}
                            </p>
                            <p className="text-xs text-slate-500">
                              Date: {ord.customer.date} · Status: {ord.status} · Total: ₹{ord.billing?.grandTotal || 0}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(null);
                              setSelectedDetailOrder(ord);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registration & Update History */}
                {selectedCustomer.history && selectedCustomer.history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black text-[#233B5D] uppercase flex items-center gap-2 mb-2">
                      <History className="w-4 h-4" />
                      <span>Registration &amp; Update History</span>
                    </h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {[...selectedCustomer.history].reverse().map((h, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                          <span className="font-bold">{h.action}{h.note ? ` — ${h.note}` : ''}</span>
                          <span className="text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
