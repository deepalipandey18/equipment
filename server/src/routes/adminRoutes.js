const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Enforce authentication AND admin role authorization across all endpoints
router.use(protect);
router.use(authorizeRoles('admin'));

// Platform Statistics & Overview
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Equipment Fleet & Approvals
router.get('/equipment', adminController.getEquipment);
router.patch('/equipment/:id/review', adminController.reviewEquipment);

// Subscription Monitoring
router.get('/subscriptions', adminController.getSubscriptions);

// Booking & Rental Tracking
router.get('/bookings', adminController.getBookings);

// Administrative Audit Trail
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;

