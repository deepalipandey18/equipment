const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view plans
router.get('/plans', subscriptionController.getPlans);

// Protected routes for authenticated users
router.get('/my', protect, subscriptionController.getMySubscription);
router.get('/my-subscription', protect, subscriptionController.getMySubscription);
router.get('/check-quota', protect, subscriptionController.checkQuota);
router.post('/create-order', protect, subscriptionController.createOrder);
router.post('/verify', protect, subscriptionController.verifyPayment);
router.post('/verify-payment', protect, subscriptionController.verifyPayment);
router.post('/cancel', protect, subscriptionController.cancelSubscription);

module.exports = router;
