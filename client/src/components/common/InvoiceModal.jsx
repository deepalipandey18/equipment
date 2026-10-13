import React from 'react';
import { Truck, ShieldCheck, Printer, X, CheckCircle, FileText } from 'lucide-react';

const InvoiceModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const pricing = booking.pricingBreakdown || {};
  const totalRupees = (pricing.totalAmountPaise || 0) / 100;
  const baseRupees = (pricing.rentalBasePaise || 0) / 100;
  const deliveryRupees = (pricing.deliveryChargesPaise || 0) / 100;
  const depositRupees = (pricing.securityDepositPaise || 0) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center space-x-2 text-slate-900">
            <FileText className="h-5 w-5 text-brand-600" />
            <span className="font-bold text-sm">Official Rental Invoice</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="pt-4 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-xl font-black text-slate-900">
                  Equipment<span className="text-brand-600">Hub</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Heavy Machinery Rental & Escrow Platform
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-700">
                {booking.invoiceNumber || `INV-${booking._id?.slice(-8).toUpperCase()}`}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Date: {new Date(booking.updatedAt || booking.createdAt).toLocaleDateString()}
              </div>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {booking.paymentStatus === 'paid' ? 'Payment Verified (PAID)' : 'Payment Pending'}
              </span>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Billed To (Customer / Renter):
              </span>
              <p className="font-bold text-slate-900 mt-1">{booking.renterId?.name || 'Renter'}</p>
              <p className="text-slate-500">{booking.renterId?.email}</p>
              <p className="text-slate-500">{booking.renterId?.phone}</p>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Machinery Provider (Owner):
              </span>
              <p className="font-bold text-slate-900 mt-1">{booking.ownerId?.name || 'Owner'}</p>
              <p className="text-slate-500">{booking.ownerId?.email}</p>
              <p className="text-slate-500">{booking.ownerId?.phone}</p>
            </div>
          </div>

          {/* Rental Particulars */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Equipment & Rental Period
            </div>
            <div className="p-3 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 text-sm">
                  {booking.equipmentId?.name || 'Machinery Item'}
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Period: {new Date(booking.startDate).toLocaleDateString()} to{' '}
                  {new Date(booking.endDate).toLocaleDateString()} ({booking.rentalDurationDays} days)
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700">
                  {booking.operatorRequested ? 'Operator Included' : 'Standard Hire'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Duration</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-medium">Base Machine Rental Charge</td>
                  <td className="py-2.5 px-4 text-center">{booking.rentalDurationDays} days</td>
                  <td className="py-2.5 px-4 text-right font-semibold">
                    ₹{baseRupees.toLocaleString('en-IN')}
                  </td>
                </tr>
                {deliveryRupees > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium">Transport & Delivery Fee</td>
                    <td className="py-2.5 px-4 text-center">—</td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      ₹{deliveryRupees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                {depositRupees > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium">
                      Refundable Security Deposit (Deposit Status: {booking.depositStatus})
                    </td>
                    <td className="py-2.5 px-4 text-center">—</td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      ₹{depositRupees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan="2" className="py-3 px-4 text-slate-900 text-sm">
                    Total Amount Paid
                  </td>
                  <td className="py-3 px-4 text-right text-brand-600 text-base">
                    ₹{totalRupees.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Details */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Razorpay Escrow Payment Reference: {booking.razorpayPaymentId || 'VERIFIED'}</span>
            </div>
            <span>Status: {booking.bookingStatus}</span>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;

