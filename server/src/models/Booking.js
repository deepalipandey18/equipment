const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Rental start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'Rental end date is required'],
      index: true,
    },
    rentalDurationDays: {
      type: Number,
      required: true,
      min: [1, 'Rental duration must be at least 1 day'],
    },
    operatorRequested: {
      type: Boolean,
      default: false,
    },

    // Minor currency unit (paise) to prevent floating-point calculation errors
    pricingBreakdown: {
      dailyRatePaise: { type: Number, required: true },
      rentalBasePaise: { type: Number, required: true },
      deliveryChargesPaise: { type: Number, default: 0 },
      securityDepositPaise: { type: Number, default: 0 },
      taxPaise: { type: Number, default: 0 },
      totalAmountPaise: { type: Number, required: true },
    },

    bookingStatus: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Rejected',
        'Awaiting Payment',
        'Confirmed',
        'Ongoing',
        'Completed',
        'Cancelled',
        'Disputed',
      ],
      default: 'Pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    depositStatus: {
      type: String,
      enum: ['pending', 'held', 'refunded', 'forfeited'],
      default: 'pending',
    },

    deliveryAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      notes: { type: String, default: '' },
    },

    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    handoverDetails: {
      handedOverAt: { type: Date },
      returnedAt: { type: Date },
      initialMeterHours: { type: Number, default: 0 },
      finalMeterHours: { type: Number, default: 0 },
      notes: { type: String, default: '' },
    },

    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high performance overlap checks
bookingSchema.index({
  equipmentId: 1,
  bookingStatus: 1,
  startDate: 1,
  endDate: 1,
});

// Auto-generate invoice number before save if confirmed
bookingSchema.pre('save', function (next) {
  if (this.bookingStatus === 'Confirmed' && !this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${timestamp}${random}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

