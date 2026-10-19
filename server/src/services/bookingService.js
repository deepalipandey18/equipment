const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Payment = require('../models/Payment');
const paymentService = require('./paymentService');

class BookingService {
  /**
   * Concurrency-safe availability validation
   * Returns true if available, false or throws if conflicting booking exists
   */
  async checkAvailability(equipmentId, startDate, endDate, excludeBookingId = null) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      const error = new Error('Rental end date must be after the start date.');
      error.statusCode = 400;
      throw error;
    }

    const conflictQuery = {
      equipmentId,
      bookingStatus: {
        $in: ['Accepted', 'Awaiting Payment', 'Confirmed', 'Ongoing'],
      },
      startDate: { $lt: end },
      endDate: { $gt: start },
    };

    if (excludeBookingId) {
      conflictQuery._id = { $ne: excludeBookingId };
    }

    const conflictingBooking = await Booking.findOne(conflictQuery);
    return !conflictingBooking;
  }

  /**
   * Submit a new rental booking request
   */
  async createBookingRequest(renterId, data) {
    const equipment = await Equipment.findOne({
      _id: data.equipmentId,
      listingStatus: 'active',
      approvalStatus: 'approved',
    });

    if (!equipment) {
      const error = new Error('Equipment is not available for rental or does not exist');
      error.statusCode = 404;
      throw error;
    }

    // Dual-role safeguard: Users cannot rent their own machinery
    if (equipment.ownerId.toString() === renterId.toString()) {
      const error = new Error('You cannot rent equipment that you own.');
      error.statusCode = 400;
      throw error;
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Concurrency overlap verification
    const isAvailable = await this.checkAvailability(equipment._id, start, end);
    if (!isAvailable) {
      const error = new Error('This equipment is already booked for the selected dates. Please choose different dates.');
      error.statusCode = 409;
      throw error;
    }

    // Calculate duration in days
    const diffTime = end.getTime() - start.getTime();
    const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (rentalDays < (equipment.minRentalDurationDays || 1)) {
      const error = new Error(`Minimum rental duration for this equipment is ${equipment.minRentalDurationDays} days.`);
      error.statusCode = 400;
      throw error;
    }

    // Calculate rates in integer minor units (paise)
    const dailyRatePaise = Math.round((equipment.dailyRate || 0) * 100);
    const rentalBasePaise = dailyRatePaise * rentalDays;
    const deliveryChargesPaise = Math.round((equipment.deliveryCharges || 0) * 100);
    const securityDepositPaise = Math.round((equipment.securityDeposit || 0) * 100);
    const totalAmountPaise = rentalBasePaise + deliveryChargesPaise + securityDepositPaise;

    const booking = await Booking.create({
      equipmentId: equipment._id,
      ownerId: equipment.ownerId,
      renterId,
      startDate: start,
      endDate: end,
      rentalDurationDays: rentalDays,
      operatorRequested: Boolean(data.operatorRequested),
      pricingBreakdown: {
        dailyRatePaise,
        rentalBasePaise,
        deliveryChargesPaise,
        securityDepositPaise,
        taxPaise: 0,
        totalAmountPaise,
      },
      deliveryAddress: data.deliveryAddress || {},
      bookingStatus: 'Pending',
      paymentStatus: 'pending',
    });

    return await Booking.findById(booking._id)
      .populate('equipmentId')
      .populate('ownerId', 'name email phone')
      .populate('renterId', 'name email phone');
  }

  /**
   * Get bookings made by the customer
   */
  async getCustomerBookings(renterId) {
    return await Booking.find({ renterId })
      .populate('equipmentId')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
  }

  /**
   * Get booking requests received by the machine owner
   */
  async getOwnerRequests(ownerId) {
    return await Booking.find({ ownerId })
      .populate('equipmentId')
      .populate('renterId', 'name email phone')
      .sort({ createdAt: -1 });
  }

  /**
   * Get booking details by ID (Accessible by renter, owner, or admin)
   */
  async getBookingById(bookingId, userId) {
    const booking = await Booking.findById(bookingId)
      .populate('equipmentId')
      .populate('ownerId', 'name email phone')
      .populate('renterId', 'name email phone');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const isAuthorized =
      booking.renterId._id.toString() === userId.toString() ||
      booking.ownerId._id.toString() === userId.toString();

    if (!isAuthorized) {
      const error = new Error('Unauthorized to view this booking record');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }

  /**
   * Machine Owner accepts or rejects booking request
   */
  async respondToBookingRequest(bookingId, ownerId, action, rejectionReason = '') {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('Unauthorized: Only the equipment owner can respond to this request');
      error.statusCode = 403;
      throw error;
    }

    if (booking.bookingStatus !== 'Pending') {
      const error = new Error(`Cannot respond to booking in "${booking.bookingStatus}" state`);
      error.statusCode = 400;
      throw error;
    }

    if (action === 'accept') {
      // Re-verify availability before accepting
      const isAvailable = await this.checkAvailability(
        booking.equipmentId,
        booking.startDate,
        booking.endDate,
        booking._id
      );

      if (!isAvailable) {
        const error = new Error('Booking dates conflict with another confirmed booking.');
        error.statusCode = 409;
        throw error;
      }

      booking.bookingStatus = 'Awaiting Payment';
      await booking.save();
    } else if (action === 'reject') {
      booking.bookingStatus = 'Rejected';
      booking.rejectionReason = rejectionReason || 'Declined by machine owner';
      await booking.save();
    }

    return await Booking.findById(bookingId)
      .populate('equipmentId')
      .populate('renterId', 'name email phone');
  }

  /**
   * Initiate Razorpay payment order for accepted rental
   */
  async createRentalPaymentOrder(bookingId, renterId) {
    const booking = await Booking.findById(bookingId).populate('equipmentId');
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.renterId.toString() !== renterId.toString()) {
      const error = new Error('Unauthorized: Only the customer can pay for this booking');
      error.statusCode = 403;
      throw error;
    }

    if (!['Accepted', 'Awaiting Payment'].includes(booking.bookingStatus)) {
      const error = new Error('Booking is not ready for payment. Owner must accept first.');
      error.statusCode = 400;
      throw error;
    }

    const orderData = await paymentService.createOrder({
      amount: booking.pricingBreakdown.totalAmountPaise,
      currency: 'INR',
      receipt: `rent_${Date.now()}_${booking._id.toString().slice(-4)}`,
      notes: {
        bookingId: booking._id.toString(),
        equipmentName: booking.equipmentId?.name || 'Machinery',
        renterId: renterId.toString(),
      },
    });

    booking.razorpayOrderId = orderData.orderId;
    await booking.save();

    await Payment.create({
      userId: renterId,
      bookingId: booking._id,
      provider: orderData.provider,
      providerOrderId: orderData.orderId,
      amount: booking.pricingBreakdown.totalAmountPaise,
      currency: 'INR',
      paymentPurpose: 'rental_fee',
      status: 'created',
      notes: {
        bookingId: booking._id.toString(),
      },
    });

    return {
      orderId: orderData.orderId,
      amount: booking.pricingBreakdown.totalAmountPaise,
      currency: 'INR',
      keyId: orderData.keyId,
      isSimulated: orderData.isSimulated,
      booking,
    };
  }

  /**
   * Verify Razorpay payment and lock booking as Confirmed
   */
  async verifyRentalPayment(bookingId, renterId, { orderId, paymentId, signature }) {
    const booking = await Booking.findById(bookingId).populate('equipmentId');
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.renterId.toString() !== renterId.toString()) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    // Verify cryptographic signature
    const isValid = paymentService.verifySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      const error = new Error('Payment signature verification failed.');
      error.statusCode = 400;
      throw error;
    }

    // Double check availability immediately prior to confirming
    const isAvailable = await this.checkAvailability(
      booking.equipmentId._id,
      booking.startDate,
      booking.endDate,
      booking._id
    );

    if (!isAvailable) {
      const error = new Error('Concurrency Conflict: Dates became unavailable. Payment will be refunded.');
      error.statusCode = 409;
      throw error;
    }

    // Confirm booking and transition to Ongoing if rental start date is today/past
    const now = new Date();
    const start = new Date(booking.startDate);
    const isImmediateOrPast = start <= now || start.toDateString() === now.toDateString();

    if (isImmediateOrPast) {
      booking.bookingStatus = 'Ongoing';
      booking.handoverDetails = booking.handoverDetails || {};
      booking.handoverDetails.handedOverAt = new Date();
    } else {
      booking.bookingStatus = 'Confirmed';
    }

    booking.paymentStatus = 'paid';
    booking.depositStatus = booking.pricingBreakdown.securityDepositPaise > 0 ? 'held' : 'pending';
    booking.razorpayPaymentId = paymentId;
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { providerOrderId: orderId },
      {
        status: 'verified',
        providerPaymentId: paymentId,
        providerSignature: signature || 'mock_sig',
      }
    );

    return await Booking.findById(booking._id)
      .populate('equipmentId')
      .populate('ownerId', 'name email phone')
      .populate('renterId', 'name email phone');
  }

  /**
   * Record equipment handover (Ongoing) and return (Completed)
   */
  async updateProgress(bookingId, userId, { status, meterHours, notes }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = booking.ownerId.toString() === userId.toString();
    if (!isOwner) {
      const error = new Error('Only the machine owner can record handover and return progression');
      error.statusCode = 403;
      throw error;
    }

    if (status === 'Ongoing') {
      if (booking.bookingStatus !== 'Confirmed' && booking.bookingStatus !== 'Ongoing') {
        const error = new Error('Booking must be confirmed before recording handover');
        error.statusCode = 400;
        throw error;
      }
      booking.bookingStatus = 'Ongoing';
      booking.handoverDetails = booking.handoverDetails || {};
      booking.handoverDetails.handedOverAt = new Date();
      if (meterHours) booking.handoverDetails.initialMeterHours = meterHours;
    } else if (status === 'Completed') {
      if (!['Ongoing', 'Confirmed'].includes(booking.bookingStatus)) {
        const error = new Error('Booking must be Ongoing or Confirmed before marking Completed');
        error.statusCode = 400;
        throw error;
      }
      booking.bookingStatus = 'Completed';
      booking.handoverDetails = booking.handoverDetails || {};
      booking.handoverDetails.returnedAt = new Date();
      if (meterHours) booking.handoverDetails.finalMeterHours = meterHours;
      booking.depositStatus = 'refunded'; // Security deposit released upon clean return
    }

    if (notes) booking.handoverDetails.notes = notes;
    await booking.save();

    return booking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, reason) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const isParty =
      booking.renterId.toString() === userId.toString() ||
      booking.ownerId.toString() === userId.toString();

    if (!isParty) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    if (['Ongoing', 'Completed'].includes(booking.bookingStatus)) {
      const error = new Error('Cannot cancel a rental that is already ongoing or completed');
      error.statusCode = 400;
      throw error;
    }

    booking.bookingStatus = 'Cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledBy = userId;
    await booking.save();

    return booking;
  }

  /**
   * Update real-time GPS telematics ping (from driver device or AIS-140 IoT tracker)
   */
  async updateTelematicsPing(bookingId, userId, { lat, lng, speed, heading, trackerType, batteryLevel }) {
    const booking = await Booking.findById(bookingId).populate('equipmentId');
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const isParty =
      booking.renterId.toString() === userId.toString() ||
      booking.ownerId.toString() === userId.toString();

    if (!isParty) {
      const error = new Error('Unauthorized to send telematics for this booking');
      error.statusCode = 403;
      throw error;
    }

    const numLat = Number(lat);
    const numLng = Number(lng);
    const numSpeed = Number(speed) || 0;
    const numHeading = Number(heading) || 0;

    if (isNaN(numLat) || isNaN(numLng)) {
      const error = new Error('Invalid latitude or longitude coordinates');
      error.statusCode = 400;
      throw error;
    }

    if (!booking.telematics) {
      booking.telematics = {};
    }

    booking.telematics.isTrackingActive = true;
    booking.telematics.trackerType = trackerType || 'driver_gps';
    booking.telematics.currentCoordinates = [numLng, numLat];
    booking.telematics.speedKmh = numSpeed;
    booking.telematics.heading = numHeading;
    booking.telematics.batteryLevel = Number(batteryLevel) || 100;
    booking.telematics.lastPingAt = new Date();

    // Maintain recent ping history (last 50 breadcrumb points)
    if (!booking.telematics.history) {
      booking.telematics.history = [];
    }
    booking.telematics.history.push({
      coordinates: [numLng, numLat],
      speedKmh: numSpeed,
      recordedAt: new Date(),
    });

    if (booking.telematics.history.length > 50) {
      booking.telematics.history.shift();
    }

    await booking.save();

    return {
      bookingId: booking._id,
      telematics: booking.telematics,
      status: booking.bookingStatus,
    };
  }

  /**
   * Retrieve real-time telematics coordinates and history
   */
  async getBookingTelematics(bookingId, userId) {
    const booking = await Booking.findById(bookingId)
      .populate('equipmentId')
      .populate('ownerId', 'name phone')
      .populate('renterId', 'name phone');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    const isParty =
      booking.renterId._id.toString() === userId.toString() ||
      booking.ownerId._id.toString() === userId.toString();

    if (!isParty) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    const originCoords = booking.equipmentId?.coordinates || [77.0878, 28.4595];
    const currentCoords = booking.telematics?.currentCoordinates || originCoords;

    return {
      bookingId: booking._id,
      status: booking.bookingStatus,
      origin: {
        coordinates: originCoords,
        address: booking.equipmentId?.address,
      },
      destination: {
        address: booking.deliveryAddress,
      },
      telematics: booking.telematics || {
        isTrackingActive: false,
        trackerType: 'driver_gps',
        currentCoordinates: originCoords,
        speedKmh: 0,
        heading: 0,
        lastPingAt: new Date(),
      },
    };
  }
}

module.exports = new BookingService();

