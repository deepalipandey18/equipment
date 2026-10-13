const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'mock_local'],
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
      required: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    providerSignature: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required in paise'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentPurpose: {
      type: String,
      enum: ['subscription', 'rental_deposit', 'rental_fee', 'commission'],
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'verified', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    refundDetails: {
      refundId: { type: String, default: '' },
      amountRefunded: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      refundedAt: { type: Date },
    },
    notes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;

