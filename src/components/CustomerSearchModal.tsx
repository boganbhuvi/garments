import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Search, X, User, Phone, MapPin, ArrowRight, UserPlus, FileText } from 'lucide-react';
import { Order } from '../types/order';

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({ isOpen, onClose }) => {
  const { searchCustomers, selectCustomerFromHistory, createNewOrder, setCurrentStep } = useOrder();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const results = searchCustomers(searchTerm);

  const handleSelect = (order: Order) => {
    selectCustomerFromHistory(order);
    onClose();
  };

  const handleCreateNew = () => {
    createNewOrder();
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#233B5D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-[#99F2E8]" />
            <h2 className="text-[20px] font-bold">Search Existing Customer Records</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Customer Name, Phone Number, or Customer ID..."
              autoFocus
              className="w-full h-13 pl-12 pr-4 bg-white border-2 border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[18px] text-[#191C1E] focus:outline-none shadow-sm placeholder:text-[#94A3B8]"
            />
          </div>
          <p className="mt-2 text-[14px] text-[#64748B]">
            Search by Customer ID (e.g. <span className="font-semibold text-[#147D75]">A001</span>), Name (e.g. <span className="font-semibold text-[#233B5D]">Asha</span>), or Phone Number (e.g. <span className="font-semibold text-[#233B5D]">9585033030</span>)
          </p>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E2E8F0]">
          {results.length > 0 ? (
            results.map((record) => (
              <div
                key={record.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-[#F8FAFC] p-3 rounded-lg transition-colors group cursor-pointer"
                onClick={() => handleSelect(record)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-bold text-[#233B5D] group-hover:text-[#147D75] transition-colors">
                      {record.customer.customerName}
                    </span>
                    {(record.customer.fatherName || record.customer.husbandName) && (
                      <span className="text-[13px] font-semibold bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded">
                        {record.customer.relationshipType} {record.customer.fatherName || record.customer.husbandName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#64748B]">
                    {record.customer.primaryPhone && (
                      <span className="flex items-center gap-1 font-semibold text-[#191C1E]">
                        <Phone className="w-3.5 h-3.5 text-[#147D75]" />
                        +91 {record.customer.primaryPhone}
                      </span>
                    )}
                    {record.customer.secondaryPhone && (
                      <>
                        <span>•</span>
                        <span className="text-[#64748B]">
                          Alt: {record.customer.secondaryPhone}
                        </span>
                      </>
                    )}
                    {record.customer.additionalPhones && record.customer.additionalPhones.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#64748B]">
                          More: {record.customer.additionalPhones.join(', ')}
                        </span>
                      </>
                    )}
                    {(record.customer.areaLocation || record.customer.fullAddress) && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {record.customer.areaLocation || record.customer.fullAddress}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-bold text-[#147D75]">
                      ID: {record.customer.customerId}
                    </span>
                  </div>

                  {record.garmentQuantities && record.garmentQuantities.length > 0 && (
                    <div className="text-[13px] text-[#64748B] mt-0.5">
                      Order: <span className="font-semibold text-[#334155]">#{record.id}</span> ({record.customer.date}) • {record.garmentQuantities.reduce((s, g) => s + g.quantity, 0)} Items
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="min-h-[42px] px-3.5 rounded-lg bg-[#233B5D] text-white font-bold text-[15px] flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:bg-[#147D75] transition-all shadow-sm"
                >
                  <span>Select</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <User className="w-12 h-12 text-[#94A3B8]" />
              <p className="text-[18px] font-semibold text-[#334155]">
                No customer record found matching "{searchTerm}"
              </p>
              <p className="text-[15px] text-[#64748B] max-w-md">
                You can create a brand new customer record and order directly.
              </p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="mt-2 min-h-[48px] px-5 rounded-lg bg-[#233B5D] hover:bg-[#1A2C46] text-white font-bold text-[16px] flex items-center gap-2 shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create New Customer Record</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F1F5F9] border-t border-[#CBD5E1] flex items-center justify-between">
          <span className="text-[14px] text-[#64748B]">
            Showing {results.length} record{results.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={handleCreateNew}
            className="min-h-[40px] px-4 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#233B5D] font-bold text-[15px] flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-[#147D75]" />
            <span>New Customer Walk-in</span>
          </button>
        </div>

      </div>
    </div>
  );
};
