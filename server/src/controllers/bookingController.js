const bookingService = require('../services/bookingService');
const {
  createBookingSchema,
  respondBookingSchema,
  progressBookingSchema,
  cancelBookingSchema,
} = require('../validators/bookingValidators');

exports.createBooking = async (req, res, next) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const booking = await bookingService.createBookingRequest(req.user._id, validatedData);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully! Awaiting owner acceptance.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user._id);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOwnerRequests = async (req, res, next) => {
  try {
    const requests = await bookingService.getOwnerRequests(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.respondToRequest = async (req, res, next) => {
  try {
    const { action, rejectionReason } = respondBookingSchema.parse(req.body);
    const updated = await bookingService.respondToBookingRequest(
      req.params.id,
      req.user._id,
      action,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      message: `Booking request ${action}ed successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const orderData = await bookingService.createRentalPaymentOrder(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Payment order created',
      data: orderData,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const confirmedBooking = await bookingService.verifyRentalPayment(
      req.params.id,
      req.user._id,
      { orderId, paymentId, signature }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified! Booking is now officially Confirmed.',
      data: confirmedBooking,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const validatedData = progressBookingSchema.parse(req.body);
    const updated = await bookingService.updateProgress(
      req.params.id,
      req.user._id,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: `Rental progress updated to ${validatedData.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = cancelBookingSchema.parse(req.body);
    const cancelled = await bookingService.cancelBooking(
      req.params.id,
      req.user._id,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};

