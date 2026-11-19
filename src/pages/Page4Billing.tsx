import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { 
  CreditCard, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  FileText, 
  Percent, 
  Wallet,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Activity
} from 'lucide-react';
import { PaymentMethod, OrderPriority } from '../types/order';
import { getPriorityConfigs, getSuggestedDueDate } from '../utils/priorityConfig';
import { 
  calculateOrderWorkloadPoints, 
  checkProductionCapacity, 
  CapacityOverrideRecord 
} from '../utils/capacityEngine';
import { AdminCapacityOverrideModal } from '../components/AdminCapacityOverrideModal';

export const Page4Billing: React.FC = () => {
  const { 
    order, 
    savedOrders,
    updateBillingItem, 
    addBillingItem, 
    removeBillingItem, 
    updateAdditionalCharges, 
    updateBillingMeta,
    recordCapacityOverride 
  } = useOrder();

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const priorityConfigs = getPriorityConfigs();

  const billing = order.billing;
  const addCharges = billing.additionalCharges;

  // Workload points & Capacity evaluation
  const workloadPoints = calculateOrderWorkloadPoints(order.garmentQuantities, order.garmentSpecs);
  const capacityCheck = checkProductionCapacity(
    billing.dueDate,
    billing.priority,
    workloadPoints,
    savedOrders,
    order.id
  );

  const handleSelectPriority = (tier: OrderPriority) => {
    const suggestedDate = getSuggestedDueDate(tier);
    updateBillingMeta({
      priority: tier,
      dueDate: suggestedDate
    });
  };

  const handleConfirmOverride = (record: CapacityOverrideRecord) => {
    recordCapacityOverride(order.id, record);
    updateBillingMeta({ ...billing });
  };

  const handleRateChange = (id: string, newRate: number, qty: number) => {
    updateBillingItem(id, {
      rate: newRate,
      amount: newRate * qty
    });
  };

  const handleQtyChange = (id: string, newQty: number, rate: number) => {
    updateBillingItem(id, {
      quantity: newQty,
      amount: newQty * rate
    });
  };

  // Payment status badge color & label
  let statusBadge;
  if (billing.paymentStatus === 'PAID') {
    statusBadge = (
      <span className="bg-[#16834A] text-white px-3 py-1 rounded-full text-[14px] font-bold flex items-center gap-1 shadow-sm">
        <CheckCircle className="w-4 h-4" /> Fully Settled (Paid)
      </span>
    );
  } else if (billing.paymentStatus === 'PARTIAL') {
    statusBadge = (
      <span className="bg-[#D68B20] text-white px-3 py-1 rounded-full text-[14px] font-bold flex items-center gap-1 shadow-sm">
        <Clock className="w-4 h-4" /> Partially Paid (Advance Recorded)
      </span>
    );
  } else {
    statusBadge = (
      <span className="bg-[#D64545] text-white px-3 py-1 rounded-full text-[14px] font-bold flex items-center gap-1 shadow-sm">
        <AlertTriangle className="w-4 h-4" /> Unpaid (No Advance)
      </span>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Top Banner: Bill Header & Live Payment Pill */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#233B5D]/10 flex items-center justify-center text-[#233B5D]">
              <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[#64748B] uppercase font-bold tracking-wider">
                Billing & Counter Settlement
              </span>
              <span className="text-[22px] font-bold text-[#233B5D] leading-tight">
                Bill #{order.customer.billNumber || order.id}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#CBD5E1] hidden sm:block" />

          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] uppercase font-bold tracking-wider">
              Customer
            </span>
            <span className="text-[18px] font-bold text-[#191C1E]">
              {order.customer.customerName || 'Customer'}
            </span>
            <span className="text-[14px] text-[#64748B]">
              +91 {order.customer.primaryPhone}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {statusBadge}
        </div>
      </div>

      {/* Main Grid: Left 8 Cols (Line Items & Charges), Right 4 Cols (Payment & Delivery) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Billing Table & Extra Charges */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Billing Line Items Card */}
          <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[#233B5D]" />
                <h3 className="text-[20px] sm:text-[22px] font-bold text-[#233B5D]">
                  Stitching & Garment Line Items
                </h3>
              </div>

              <button
                type="button"
                onClick={addBillingItem}
                className="min-h-[40px] px-3.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#233B5D] text-[14px] font-bold flex items-center gap-1.5 border border-[#CBD5E1]"
              >
                <Plus className="w-4 h-4 text-[#147D75]" />
                <span>+ Add Line Item</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#CBD5E1] rounded-xl bg-[#F8FAFC]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#233B5D] text-white text-[14px] uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4 font-bold">Item & Description</th>
                    <th className="py-3 px-3 text-center w-20 font-bold">Qty</th>
                    <th className="py-3 px-3 text-right w-28 font-bold">Rate (₹)</th>
                    <th className="py-3 px-3 sm:px-4 text-right w-32 font-bold">Amount (₹)</th>
                    <th className="py-3 px-2 text-center w-12 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]">
                  {billing.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-slate-500 bg-white">
                        <p className="font-bold text-[16px] text-[#233B5D]">No line items added yet</p>
                        <p className="text-xs text-slate-400 mt-1">Configure garment items in Step 01 & 03 or click "+ Add Line Item" above to add stitching rates.</p>
                      </td>
                    </tr>
                  ) : (
                    billing.items.map((item, idx) => (
                      <tr key={item.id} className="bg-white hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3 sm:px-4">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateBillingItem(item.id, { itemName: e.target.value })}
                            placeholder="Item name (e.g. Blouse Stitching)"
                            className="w-full font-bold text-[17px] text-[#233B5D] bg-transparent focus:outline-none border-b border-transparent focus:border-[#147D75] placeholder:text-slate-300 placeholder:italic"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateBillingItem(item.id, { description: e.target.value })}
                            placeholder="Style & features description (e.g. Lining + Piping)"
                            className="w-full text-[14px] text-[#64748B] bg-transparent focus:outline-none border-b border-transparent focus:border-[#CBD5E1] placeholder:text-slate-300 placeholder:italic"
                          />
                        </td>

                        <td className="py-3 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1, item.rate)}
                            placeholder="1"
                            className="w-16 h-10 text-center font-bold text-[17px] bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#147D75] placeholder:text-slate-300"
                          />
                        </td>

                        <td className="py-3 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={item.rate || ''}
                            onChange={(e) => handleRateChange(item.id, parseFloat(e.target.value) || 0, item.quantity)}
                            placeholder="0.00"
                            className="w-24 h-10 text-right pr-2 font-bold text-[17px] text-[#233B5D] bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#147D75] placeholder:text-slate-300"
                          />
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.amount || ''}
                            onChange={(e) => updateBillingItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="w-28 h-10 text-right pr-2 font-bold text-[18px] text-[#147D75] bg-white border-2 border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#147D75] placeholder:text-slate-300"
                          />
                        </td>

                        <td className="py-3 px-2 text-center">
                          {billing.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBillingItem(item.id)}
                              className="text-[#D64545] hover:text-[#BA1A1A] p-1.5 cursor-pointer"
                              title="Delete line item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal line */}
            <div className="flex items-center justify-between bg-[#F8FAFC] p-3.5 rounded-xl border border-[#CBD5E1]">
              <span className="text-[16px] font-bold text-[#64748B]">Items Subtotal:</span>
              <span className="text-[20px] font-bold text-[#233B5D]">
                ₹{billing.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Additional Charges & Discounts Card */}
          <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-5 sm:p-6 flex flex-col gap-4">
            <h3 className="text-[18px] font-bold text-[#233B5D] border-b border-[#E2E8F0] pb-2">
              Additional Workshop Charges & Discounts
            </h3>

            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[16px] font-bold text-[#233B5D]">Stitching Add-on Charge (₹):</label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-[16px] font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={addCharges.stitchingCharges || ''}
                    onChange={(e) => updateAdditionalCharges({ stitchingCharges: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full min-h-[50px] pl-9 pr-3 font-bold text-[18px] bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[16px] font-bold text-[#233B5D]">Material / Lining Sourced Charges (₹):</label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-[16px] font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={addCharges.materialCharges || ''}
                    onChange={(e) => updateAdditionalCharges({ materialCharges: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full min-h-[50px] pl-9 pr-3 font-bold text-[18px] bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[16px] font-bold text-[#233B5D]">Design / Handwork / Aari Work Charges (₹):</label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-[16px] font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={addCharges.designCharges || ''}
                    onChange={(e) => updateAdditionalCharges({ designCharges: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full min-h-[50px] pl-9 pr-3 font-bold text-[18px] bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[16px] font-bold text-[#233B5D]">Other / Trims / Accessories (₹):</label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-[16px] font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={addCharges.otherCharges || ''}
                    onChange={(e) => updateAdditionalCharges({ otherCharges: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full min-h-[50px] pl-9 pr-3 font-bold text-[18px] bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[16px] font-bold text-red-600">Special Discount Allowed (-₹):</label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-[16px] font-bold text-red-500">-₹</span>
                  <input
                    type="number"
                    min="0"
                    value={addCharges.discount || ''}
                    onChange={(e) => updateAdditionalCharges({ discount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full min-h-[50px] pl-10 pr-3 font-bold text-[18px] text-red-600 bg-red-50/40 border-2 border-red-300 rounded-xl focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Referral & VIP Note - Single-column vertical layout */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 flex flex-col gap-4">
            <h3 className="text-[18px] font-black text-[#233B5D] border-b border-slate-200 pb-2">
              Customer Referral & Walk-in Source
            </h3>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[15px] font-bold text-[#233B5D]">Referral Code / Member ID:</label>
                <input
                  type="text"
                  placeholder="Referral ID (e.g. REF-08)"
                  value={billing.referralId}
                  onChange={(e) => updateBillingMeta({ referralId: e.target.value })}
                  className="w-full min-h-[48px] px-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-[16px] font-bold text-slate-800 focus:outline-none focus:border-[#147D75]"
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-[15px] font-bold text-[#233B5D]">Referred By (Customer Name):</label>
                <input
                  type="text"
                  placeholder="Referred By (e.g. Smt. Revathi)"
                  value={billing.referredBy}
                  onChange={(e) => updateBillingMeta({ referredBy: e.target.value })}
                  className="w-full min-h-[48px] px-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-[16px] text-slate-800 focus:outline-none focus:border-[#147D75]"
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-[15px] font-bold text-[#233B5D]">Referral Special Notes:</label>
                <input
                  type="text"
                  placeholder="Referral Notes / VIP Club member notes"
                  value={billing.referralNotes}
                  onChange={(e) => updateBillingMeta({ referralNotes: e.target.value })}
                  className="w-full min-h-[48px] px-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-[16px] text-slate-800 focus:outline-none focus:border-[#147D75]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Payment Summary, Due Dates & Priority */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Prominent Payment Card */}
          <div className="bg-white rounded-xl border-2 border-[#233B5D] shadow-md p-5 sm:p-6 flex flex-col gap-5 sticky top-36">
            
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-[#147D75]" />
                <h3 className="text-[20px] font-bold text-[#233B5D]">
                  Payment Summary
                </h3>
              </div>
              <span className="text-[12px] bg-[#233B5D] text-white px-2 py-0.5 rounded font-mono font-bold">
                INR (₹)
              </span>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[16px]">
                <span className="text-[#64748B] font-semibold">Line Items Subtotal:</span>
                <span className="font-bold text-[#191C1E]">₹{billing.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {(addCharges.stitchingCharges > 0 || addCharges.materialCharges > 0 || addCharges.designCharges > 0 || addCharges.otherCharges > 0) && (
                <div className="flex items-center justify-between text-[15px] text-[#64748B]">
                  <span>Additional Charges:</span>
                  <span className="font-semibold text-[#191C1E]">
                    +₹{(addCharges.stitchingCharges + addCharges.materialCharges + addCharges.designCharges + addCharges.otherCharges).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Priority Surcharge Itemized Snapshot */}
              {(billing.prioritySurcharge || 0) > 0 && (
                <div className="flex items-center justify-between text-[14px] bg-purple-50 p-2 rounded-lg border border-purple-200 text-purple-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-purple-600" />
                    Priority Surcharge ({billing.priority}):
                  </span>
                  <span className="font-extrabold text-purple-700">
                    +₹{(billing.prioritySurcharge || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {addCharges.discount > 0 && (
                <div className="flex items-center justify-between text-[15px] text-[#D64545]">
                  <span>Discount Deducted:</span>
                  <span className="font-bold">-₹{addCharges.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex items-center justify-between text-[20px] pt-3 border-t-2 border-[#233B5D] bg-[#F8FAFC] p-3 rounded-lg">
                <span className="text-[#233B5D] font-bold">Grand Total:</span>
                <span className="text-[26px] font-bold text-[#233B5D]">
                  ₹{billing.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Advance Amount Paid Input */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-[17px] font-bold text-[#233B5D] flex items-center justify-between">
                  <span>Advance Payment Paid:</span>
                  <button
                    type="button"
                    onClick={() => updateBillingMeta({ advanceAmount: billing.grandTotal })}
                    className="text-[13px] text-[#147D75] underline font-bold"
                  >
                    Pay Full
                  </button>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[20px] font-bold text-[#147D75]">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={billing.grandTotal}
                    step="50"
                    value={billing.advanceAmount || ''}
                    onChange={(e) => updateBillingMeta({ advanceAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full min-h-[52px] pl-10 pr-4 bg-white border-2 border-[#147D75] rounded-lg text-[22px] font-bold text-[#147D75] focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Outstanding Balance */}
              <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                billing.balanceAmount === 0 
                  ? 'bg-[#F0FDF4] border-[#16834A] text-[#166534]' 
                  : 'bg-[#FFDAD6]/30 border-[#D64545] text-[#93000A]'
              }`}>
                <div className="flex flex-col">
                  <span className="text-[14px] uppercase font-bold tracking-wider">
                    Outstanding Balance
                  </span>
                  <span className="text-[12px] font-medium">
                    {billing.balanceAmount === 0 ? 'No pending balance' : 'Payable on trial delivery'}
                  </span>
                </div>
                <span className="text-[26px] font-bold">
                  ₹{billing.balanceAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Payment Method Selector - Single Column Vertical */}
              <div className="flex flex-col gap-1.5 pt-2 w-full">
                <label className="text-[16px] font-black text-[#233B5D]">
                  Payment Method:
                </label>
                <select
                  value={billing.paymentMethod}
                  onChange={(e) => updateBillingMeta({ paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full min-h-[50px] px-3.5 bg-slate-50 border-2 border-slate-300 focus:border-[#147D75] rounded-xl text-[16px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Cash">Cash Counter Payment</option>
                  <option value="UPI">UPI / QR Code (GPay / PhonePe / Paytm)</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Direct Bank Transfer / NEFT</option>
                  <option value="Other">Other Mode</option>
                </select>
              </div>

              {/* Delivery Details & Smart Capacity Management */}
              <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-4">
                
                {/* Priority Selection Cards - Vertical Single Column */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between">
                    <label className="text-[16px] font-black text-[#233B5D] flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span>Production Priority Tier:</span>
                    </label>
                    <span className="text-[12px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      Workload: {workloadPoints} pts
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full">
                    {(['Normal', 'Urgent', 'Express'] as OrderPriority[]).map((p) => {
                      const cfg = priorityConfigs[p];
                      const isSelected = billing.priority === p;
                      const feeText = cfg.surchargeValue > 0 
                        ? (cfg.surchargeType === 'percentage' ? `+${cfg.surchargeValue}%` : `+₹${cfg.surchargeValue}`)
                        : 'Standard Rate';

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleSelectPriority(p)}
                          className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between w-full cursor-pointer ${
                            isSelected
                              ? p === 'Express'
                                ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-sm ring-2 ring-purple-400'
                                : p === 'Urgent'
                                ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-sm ring-2 ring-amber-400'
                                : 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm ring-2 ring-teal-400'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {p === 'Express' && <Flame className="w-4 h-4 text-purple-600 fill-purple-600 flex-shrink-0" />}
                            {p === 'Urgent' && <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                            {p === 'Normal' && <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                            <div>
                              <span className="font-extrabold text-[15px] block">{p} Priority</span>
                              <span className="text-xs text-slate-500 font-medium">Turnaround: {cfg.expectedTurnaroundDays} days</span>
                            </div>
                          </div>

                          <span className={`text-[12px] font-black px-2.5 py-1 rounded-lg ${
                            isSelected ? 'bg-white shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {feeText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Date Picker & Capacity Feedback */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[15px] font-bold text-[#233B5D] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#147D75]" />
                      <span>Committed Delivery Date:</span>
                    </label>
                    <span className="text-[12px] text-slate-500 font-medium">
                      Based on {billing.priority} turnaround
                    </span>
                  </div>

                  <input
                    type="date"
                    value={billing.dueDate}
                    onChange={(e) => updateBillingMeta({ dueDate: e.target.value })}
                    className={`w-full min-h-[46px] px-3 bg-white border-2 rounded-lg text-[16px] font-bold focus:outline-none transition-all ${
                      capacityCheck.isOverbooked && !order.capacityOverride?.isOverridden
                        ? 'border-red-500 text-red-900 bg-red-50'
                        : 'border-[#CBD5E1] focus:border-[#147D75] text-[#191C1E]'
                    }`}
                  />
                </div>

                {/* Live Capacity Warning Banner */}
                {capacityCheck.isOverbooked && !order.capacityOverride?.isOverridden && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3.5 text-red-900 flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <strong className="text-[14px]">Capacity Overbooked on {billing.dueDate}!</strong>
                        <span className="text-[12px] text-red-700">
                          Production queues for this date are nearing or past capacity limit.
                        </span>
                      </div>
                    </div>

                    <ul className="text-[12px] text-red-800 list-disc pl-5 space-y-0.5">
                      {capacityCheck.warningMessages.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200">
                      {capacityCheck.suggestedNextSafeDate && (
                        <button
                          type="button"
                          onClick={() => updateBillingMeta({ dueDate: capacityCheck.suggestedNextSafeDate })}
                          className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Move to Safe Date: {capacityCheck.suggestedNextSafeDate}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsOverrideModalOpen(true)}
                        className="px-2.5 py-1.5 bg-white border border-red-400 hover:bg-red-100 text-red-800 rounded-lg text-[12px] font-bold ml-auto cursor-pointer"
                      >
                        Supervisor Override
                      </button>
                    </div>
                  </div>
                )}

                {/* Capacity Override Acknowledged Banner */}
                {order.capacityOverride?.isOverridden && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-900 flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>
                        <strong>Override Active:</strong> Approved by {order.capacityOverride.authorizedBy}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOverrideModalOpen(true)}
                      className="text-[11px] text-emerald-700 font-bold underline"
                    >
                      View Details
                    </button>
                  </div>
                )}

                {/* Delivery Notes */}
                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-bold text-[#233B5D]">
                    Delivery Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={billing.deliveryNotes}
                    onChange={(e) => updateBillingMeta({ deliveryNotes: e.target.value })}
                    placeholder="e.g. Urgent trial needed by 23rd evening before wedding muhurtham."
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#147D75] rounded-lg text-[15px] focus:outline-none resize-none"
                  />
                </div>

              </div>

              {/* Admin Capacity Override Modal */}
              <AdminCapacityOverrideModal
                isOpen={isOverrideModalOpen}
                onClose={() => setIsOverrideModalOpen(false)}
                onConfirmOverride={handleConfirmOverride}
                warningMessages={capacityCheck.warningMessages}
                dueDate={billing.dueDate}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
