import React from 'react';
import { Order } from '../../types/order';
import { 
  Building, 
  Phone, 
  MapPin, 
  Calendar, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode 
} from 'lucide-react';

interface SinglePageCustomerReceiptProps {
  order: Order;
  onPrint?: () => void;
}

export const SinglePageCustomerReceipt: React.FC<SinglePageCustomerReceiptProps> = ({ order, onPrint }) => {
  const customer = order.customer;
  const billing = order.billing;
  const addCharges = billing.additionalCharges;

  // Additional charges total
  const extraCharges = (addCharges.stitchingCharges || 0) + (addCharges.materialCharges || 0) + (addCharges.designCharges || 0) + (addCharges.otherCharges || 0);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Print Control Bar (Screen only) */}
      <div className="w-full max-w-[210mm] mb-4 flex items-center justify-between no-print bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[13px] font-bold text-slate-700">
            Strict 1-Page A4 Customer Billing Chit (Guaranteed Zero Page-2 Overflow)
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onPrint) onPrint();
            else window.print();
          }}
          className="px-4 py-1.5 bg-[#233B5D] hover:bg-[#1A2C46] text-white text-[13px] font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          Print Receipt
        </button>
      </div>

      {/* A4 Document Container */}
      <div 
        id="single-page-receipt"
        className="w-full max-w-[210mm] bg-white text-slate-900 font-sans border border-slate-300 p-6 sm:p-8 rounded-lg shadow-md print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none flex flex-col justify-between"
        style={{ minHeight: '275mm', maxHeight: '290mm' }}
      >
        <div className="flex flex-col gap-4">
          
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#233B5D] text-white flex items-center justify-center font-black text-[16px]">
                  GG
                </div>
                <h1 className="text-[24px] font-black tracking-tight text-[#0F172A] uppercase leading-none">
                  GIRIRAJ GARMENTS
                </h1>
              </div>
              <span className="text-[11px] font-extrabold text-[#475569] tracking-wider uppercase mt-1">
                Bespoke Ladies Tailoring • Designer Studio • Bridal Specialists
              </span>
              <span className="text-[10.5px] text-slate-600 mt-0.5">
                42/B, North Mada Street, Mylapore, Chennai - 600004 • Ph: +91 98401 23456 / 044-24987654
              </span>
            </div>

            <div className="flex flex-col items-end">
              <div className="border border-slate-900 bg-slate-50 px-3 py-1 rounded text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Receipt</span>
                <span className="text-[18px] font-black font-mono tracking-wide text-slate-900">{order.id}</span>
              </div>
              <div className="mt-1 text-right text-[11px] text-slate-600 font-medium">
                <span>Date: <strong>{customer.date}</strong></span>
                <span className="mx-1.5">•</span>
                <span>Token: <strong>{order.serialNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Customer Meta & Commitment Grid */}
          <div className="grid grid-cols-12 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12px]">
            
            {/* Customer Details */}
            <div className="col-span-7 flex flex-col gap-0.5 border-r border-slate-200 pr-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Customer Details</span>
              <span className="text-[15px] font-black text-slate-900 leading-tight">
                {customer.customerName}
              </span>
              <span className="text-slate-600 font-medium">
                {customer.relationshipType} {customer.fatherName || customer.husbandName || '—'}
              </span>
              <span className="font-bold text-slate-800">
                Phone: +91 {customer.primaryPhone} {customer.secondaryPhone ? `/ ${customer.secondaryPhone}` : ''}
              </span>
              <span className="text-slate-500 text-[11px] truncate">
                Address: {customer.fullAddress || customer.areaLocation || 'Mylapore, Chennai'}
              </span>
            </div>

            {/* Delivery Commitment & Priority */}
            <div className="col-span-5 flex flex-col justify-between pl-1">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Delivery Commitment</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Promised Date:</span>
                  <span className="text-[14px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {billing.dueDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Priority Tier:</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                    billing.priority === 'Express' 
                      ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                      : billing.priority === 'Urgent'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-200 text-slate-800'
                  }`}>
                    {billing.priority === 'Express' && <Flame className="w-3 h-3 text-purple-700 fill-purple-700" />}
                    {billing.priority} Turnaround
                  </span>
                </div>
              </div>

              {billing.deliveryNotes && (
                <div className="mt-1 pt-1 border-t border-slate-200 text-[10.5px] text-slate-600 italic truncate">
                  Note: {billing.deliveryNotes}
                </div>
              )}
            </div>

          </div>

          {/* Garments & Billing Line Items Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <th className="py-1.5 px-3 font-bold w-12 text-center">#</th>
                  <th className="py-1.5 px-3 font-bold">Garment Item & Style Description</th>
                  <th className="py-1.5 px-3 font-bold w-16 text-center">Qty</th>
                  <th className="py-1.5 px-3 font-bold w-24 text-right">Rate (₹)</th>
                  <th className="py-1.5 px-3 font-bold w-28 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {billing.items.map((item, idx) => {
                  const spec = order.garmentSpecs[idx];
                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="py-2 px-3 text-center font-bold text-slate-500">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{item.itemName}</div>
                        <div className="text-[11px] text-slate-500">
                          {spec 
                            ? `${spec.garmentType || 'Custom'} • ${spec.sleeveType || 'Standard'} • ${spec.neckType || 'Standard Neck'} • Fit: ${spec.fitting || 'Standard'}`
                            : item.description}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700">
                        {item.rate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation & Settlement Summary */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Left 6 cols: Garment Summary & Terms */}
            <div className="col-span-6 flex flex-col justify-between border border-slate-200 rounded-lg p-3 bg-slate-50 text-[11px]">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  Order Specifications Summary
                </span>
                <div className="text-slate-700 flex flex-wrap gap-1.5">
                  {order.garmentQuantities.filter(g => g.quantity > 0).map(g => (
                    <span key={g.id} className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">
                      {g.label}: {g.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-slate-600 text-[10.5px] space-y-0.5">
                <span className="font-bold block text-slate-700">Terms & Conditions:</span>
                <div>1. Original booking receipt must be produced during trial and delivery.</div>
                <div>2. Pending balance amount must be settled before garment handover.</div>
                <div>3. Free trial adjustments and minor alterations provided within 7 days.</div>
              </div>
            </div>

            {/* Right 6 cols: Itemized Financial Totals */}
            <div className="col-span-6 border border-slate-300 rounded-lg p-3 bg-white flex flex-col gap-1.5 text-[12px]">
              
              <div className="flex items-center justify-between text-slate-600">
                <span>Stitching & Items Subtotal:</span>
                <span className="font-bold text-slate-900">₹{billing.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Priority Surcharge */}
              {(billing.prioritySurcharge || 0) > 0 && (
                <div className="flex items-center justify-between text-purple-900 bg-purple-50 px-2 py-0.5 rounded font-medium text-[11.5px]">
                  <span className="flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5 text-purple-600" />
                    Priority Surcharge ({billing.priority}):
                  </span>
                  <span className="font-extrabold">+₹{(billing.prioritySurcharge || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              {extraCharges > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Material & Design Add-ons:</span>
                  <span className="font-semibold text-slate-800">+₹{extraCharges.toLocaleString('en-IN')}</span>
                </div>
              )}

              {addCharges.discount > 0 && (
                <div className="flex items-center justify-between text-red-600">
                  <span>Special Discount:</span>
                  <span className="font-bold">-₹{addCharges.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-1.5 mt-0.5 flex items-center justify-between text-[15px] font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-[17px]">₹{billing.grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700 font-bold text-[13px] bg-emerald-50 px-2 py-0.5 rounded">
                <span>Advance Paid ({billing.paymentMethod}):</span>
                <span>₹{(billing.advanceAmount || billing.amountPaid || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className={`flex items-center justify-between p-2 rounded-lg font-black text-[15px] border ${
                billing.balanceAmount === 0
                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}>
                <span>Balance Due on Delivery:</span>
                <span className="text-[18px]">₹{billing.balanceAmount.toLocaleString('en-IN')}</span>
              </div>

            </div>

          </div>

        </div>

        {/* Footer & Signatures */}
        <div className="border-t-2 border-slate-900 pt-3 mt-4 flex items-end justify-between text-[11px] text-slate-600">
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-slate-900 text-[12px]">Thank you for your patronage!</span>
            <span>Giriraj Garments • Mylapore, Chennai • GSTIN: 33AAACG1234F1Z8</span>
            <span className="text-[10px] text-slate-400">Computer Generated Invoice Chit • System Timestamp: {new Date().toLocaleDateString('en-IN')}</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-28 border-b border-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Customer Signature</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-28 border-b border-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-900 uppercase">Authorized Signatory</span>
            </div>
          </div>
        </div>

      </div>

      {/* Strict 1-Page Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          #single-page-receipt {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 275mm !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};
