const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const paymentService = require('./paymentService');

class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  async getPlans() {
    return await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
  }

  /**
   * Get active subscription for a specific user
   */
  async getUserActiveSubscription(userId) {
    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() },
    })
      .populate('planId')
      .sort({ endDate: -1 });

    return subscription;
  }

  /**
   * Initiate a pending payment order for a subscription plan
   */
  async createSubscriptionOrder(userId, planId) {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      const error = new Error('Selected subscription plan is invalid or no longer active');
      error.statusCode = 404;
      throw error;
    }

    // 1. Create Razorpay order via payment service
    const orderData = await paymentService.createOrder({
      amount: plan.price,
      currency: 'INR',
      receipt: `sub_${Date.now()}_${userId.toString().slice(-4)}`,
      notes: {
        userId: userId.toString(),
        planId: plan._id.toString(),
        planName: plan.name,
      },
    });

    // 2. Record pending payment in database
    const payment = await Payment.create({
      userId,
      provider: orderData.provider,
      providerOrderId: orderData.orderId,
      amount: plan.price,
      currency: 'INR',
      paymentPurpose: 'subscription',
      status: 'created',
      notes: {
        planId: plan._id.toString(),
        planName: plan.name,
      },
    });

    return {
      orderId: orderData.orderId,
      amount: plan.price,
      currency: 'INR',
      keyId: orderData.keyId,
      isSimulated: orderData.isSimulated,
      plan: {
        _id: plan._id,
        name: plan.name,
        price: plan.price,
        listingLimit: plan.listingLimit,
      },
      paymentId: payment._id,
    };
  }

  /**
   * Verify Razorpay signature and activate subscription
   */
  async verifyAndActivateSubscription(userId, { orderId, paymentId, signature, planId }) {
    // 1. Find the pending payment record
    const payment = await Payment.findOne({
      providerOrderId: orderId,
      userId,
    });

    if (!payment) {
      const error = new Error('Payment record not found for this order');
      error.statusCode = 404;
      throw error;
    }

    if (payment.status === 'verified') {
      // Idempotency: Already verified and activated
      const existingSub = await Subscription.findOne({
        userId,
        status: 'active',
      }).populate('planId');
      return existingSub;
    }

    // 2. Verify Razorpay cryptographic signature
    const isValidSignature = paymentService.verifySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValidSignature) {
      payment.status = 'failed';
      await payment.save();
      const error = new Error('Invalid payment signature. Subscription activation rejected.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Mark payment verified
    payment.status = 'verified';
    payment.providerPaymentId = paymentId;
    payment.providerSignature = signature || 'mock_simulated_signature';
    await payment.save();

    // 4. Calculate subscription start and end dates (30 days for monthly)
    const plan = await SubscriptionPlan.findById(planId || payment.notes.get('planId'));
    if (!plan) {
      throw new Error('Subscription plan not found during activation');
    }

    // Check if user has an existing active subscription to extend duration
    const currentActive = await this.getUserActiveSubscription(userId);
    let startDate = new Date();
    let endDate = new Date();

    if (currentActive && new Date(currentActive.endDate) > new Date()) {
      // Extend from current expiration date
      startDate = new Date(currentActive.endDate);
      endDate = new Date(currentActive.endDate);
    }

    const durationDays = plan.billingInterval === 'yearly' ? 365 : 30;
    endDate.setDate(endDate.getDate() + durationDays);

    // 5. Create active Subscription document
    const subscription = await Subscription.create({
      userId,
      planId: plan._id,
      status: 'active',
      startDate,
      endDate,
      paymentReference: paymentId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });

    // 6. Link subscription to payment record
    payment.subscriptionId = subscription._id;
    await payment.save();

    return await Subscription.findById(subscription._id).populate('planId');
  }

  /**
   * Check whether the user has remaining quota to list new equipment
   */
  async checkUserListingQuota(userId) {
    const activeSub = await this.getUserActiveSubscription(userId);

    if (!activeSub || !activeSub.planId) {
      return {
        allowed: false,
        reason: 'no_active_subscription',
        message: 'An active subscription plan is required to register equipment.',
        currentCount: 0,
        limit: 0,
        remaining: 0,
      };
    }

    // Count currently active / listed equipment by this owner
    let currentListingsCount = 0;
    if (mongoose.models.Equipment) {
      currentListingsCount = await mongoose.model('Equipment').countDocuments({
        ownerId: userId,
        listingStatus: { $ne: 'deleted' },
      });
    }

    const limit = activeSub.planId.listingLimit || 0;
    const remaining = Math.max(0, limit - currentListingsCount);

    if (currentListingsCount >= limit) {
      return {
        allowed: false,
        reason: 'quota_exceeded',
        message: `You have reached your subscription limit of ${limit} active listings. Please upgrade your plan to register more machines.`,
        currentCount: currentListingsCount,
        limit,
        remaining: 0,
        planName: activeSub.planId.name,
      };
    }

    return {
      allowed: true,
      currentCount: currentListingsCount,
      limit,
      remaining,
      planName: activeSub.planId.name,
      activeSubscription: activeSub,
    };
  }

  /**
   * Cancel auto-renew or request cancellation
   */
  async cancelSubscription(userId, subscriptionId, reason = '') {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    await subscription.save();

    return {
      success: true,
      message: 'Subscription auto-renew cancelled. Access remains active until current billing period ends.',
      endDate: subscription.endDate,
    };
  }
}

module.exports = new SubscriptionService();

