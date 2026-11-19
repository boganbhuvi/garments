import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  UserCheck, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  ArrowRight, 
  Scissors, 
  ExternalLink,
  BookOpen,
  Filter
} from 'lucide-react';
import { Order } from '../../types/order';

export const CustomerManagementView: React.FC = () => {
  const { 
    savedOrders, 
    selectCustomerFromHistory, 
    createNewOrder, 
    setActiveModule, 
    setSelectedDetailOrder 
  } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique customer records by customerId or primaryPhone
  const customerMap = new Map<string, { customer: Order['customer']; orders: Order[] }>();

  savedOrders.forEach(ord => {
    const key = ord.customer.customerId || ord.customer.primaryPhone || ord.customer.customerName;
    if (!customerMap.has(key)) {
      customerMap.set(key, { customer: ord.customer, orders: [ord] });
    } else {
      customerMap.get(key)!.orders.push(ord);
    }
  });

  const uniqueCustomers = Array.from(customerMap.values());

  const filteredCustomers = uniqueCustomers.filter(({ customer, orders }) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const digitsOnly = searchQuery.replace(/\D/g, '');

    const allPhones: string[] = [
      customer.primaryPhone || '',
      customer.secondaryPhone || '',
      ...(customer.additionalPhones || [])
    ].filter(Boolean);

    const phoneMatch = allPhones.some(p => {
      const clean = p.replace(/\D/g, '');
      return p.includes(q) || (digitsOnly && clean.includes(digitsOnly));
    });

    return (
      phoneMatch ||
      customer.customerName.toLowerCase().includes(q) ||
      customer.customerId.toLowerCase().includes(q) ||
      customer.areaLocation.toLowerCase().includes(q) ||
      customer.fullAddress.toLowerCase().includes(q)
    );
  });

  const handleStartOrderForCustomer = (sampleOrder: Order) => {
    selectCustomerFromHistory(sampleOrder);
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Customer Master Management
              </h1>
              <span className="bg-[#147D75] text-[#99F2E8] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {uniqueCustomers.length} Verified Profiles
              </span>
            </div>
            <p className="text-sm text-slate-300 font-semibold mt-0.5">
              Client profile ledger, order histories, measurements, and repeat booking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            createNewOrder();
            setActiveModule('FRONT_DESK');
          }}
          className="px-5 py-3 rounded-xl bg-[#147D75] hover:bg-[#0E605A] text-white font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Register New Customer</span>
        </button>
      </div>

      {/* Search Input - Single Column Vertical Layout */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm flex flex-col gap-2">
        <label className="text-[17px] font-bold text-[#233B5D]">
          Search Customer Profiles
        </label>
        <div className="relative w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Customer Name (e.g. Asha), Phone (e.g. 9585033030), Customer ID (e.g. A001)..."
            className="w-full min-h-[52px] pl-12 pr-4 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[17px] font-semibold text-[#191C1E] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Customer Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map(({ customer, orders }) => {
          const latestOrder = orders[0];
          return (
            <div 
              key={customer.customerId}
              className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-[#147D75] transition-all"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-black uppercase text-[#147D75] tracking-wider">
                      ID: {customer.customerId}
                    </span>
                    <h3 className="text-xl font-black text-[#233B5D] leading-tight">
                      {customer.customerName}
                    </h3>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-lg">
                    {orders.length} Order{orders.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#147D75]" />
                  <span>+91 {customer.primaryPhone}</span>
                  {customer.secondaryPhone && <span>/ {customer.secondaryPhone}</span>}
                </div>

                <div className="text-xs text-slate-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {customer.areaLocation || customer.fullAddress || 'In-store Walk-in'}
                  </span>
                </div>
              </div>

              {/* Order History summary */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Latest Order:</span>
                  <span className="text-[#233B5D]">#{latestOrder?.id}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Booked:</span>
                  <span>{latestOrder?.billing?.orderDate}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Status:</span>
                  <strong className="text-[#147D75]">{latestOrder?.status.replace(/_/g, ' ')}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedDetailOrder(latestOrder)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartOrderForCustomer(latestOrder)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#233B5D] hover:bg-[#1A2C46] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Booking</span>
                </button>
              </div>

            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-bold">No customer profiles found matching "{searchQuery}".</p>
          </div>
        )}
      </div>

    </div>
  );
};
