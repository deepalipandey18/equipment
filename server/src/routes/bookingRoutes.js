const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(protect);

// Customer bookings (Equipment Renter) - supports both /my-rentals and /my-bookings
router.get('/my-rentals', bookingController.getCustomerBookings);
router.get('/my-bookings', bookingController.getCustomerBookings);

// Owner incoming requests (Equipment Owner) - supports both /requests-received and /owner-requests
router.get('/requests-received', bookingController.getOwnerRequests);
router.get('/owner-requests', bookingController.getOwnerRequests);

// Create new booking request
router.post('/', bookingController.createBooking);

// Get single booking / invoice details
router.get('/:id', bookingController.getBookingById);

// Owner response: Accept or Reject request (supports both POST and PATCH)
router.post('/:id/respond', bookingController.respondToRequest);
router.patch('/:id/respond', bookingController.respondToRequest);

// Renter Payment: Create order & Verify signature
router.post('/:id/create-payment', bookingController.createPaymentOrder);
router.post('/:id/verify-payment', bookingController.verifyPayment);

// Owner progress tracking: Handover & Return
router.patch('/:id/progress', bookingController.updateProgress);

// Cancel booking
router.post('/:id/cancel', bookingController.cancelBooking);

// Live Telematics & GPS Radar Tracking (Production-Grade)
router.post('/:id/telematics/ping', bookingController.pingTelematics);
router.get('/:id/telematics', bookingController.getTelematics);

module.exports = router;
