const subscriptionService = require('../services/subscriptionService');
const { z } = require('zod');

const createOrderSchema = z.object({
  planId: z.string({ required_error: 'Plan ID is required' }).min(1),
});

const verifyPaymentSchema = z.object({
  orderId: z.string({ required_error: 'Order ID is required' }).min(1),
  paymentId: z.string({ required_error: 'Payment ID is required' }).min(1),
  signature: z.string().optional(),
  planId: z.string().optional(),
});

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string({ required_error: 'Subscription ID is required' }).min(1),
  reason: z.string().optional(),
});

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans();
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMySubscription = async (req, res, next) => {
  try {
    const activeSub = await subscriptionService.getUserActiveSubscription(req.user._id);
    const quota = await subscriptionService.checkUserListingQuota(req.user._id);

    res.status(200).json({
      success: true,
      hasActiveSubscription: Boolean(activeSub),
      subscription: activeSub,
      quota,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkQuota = async (req, res, next) => {
  try {
    const quota = await subscriptionService.checkUserListingQuota(req.user._id);
    res.status(200).json({
      success: true,
      quota,
    });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { planId } = createOrderSchema.parse(req.body);
    const orderData = await subscriptionService.createSubscriptionOrder(req.user._id, planId);

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: orderData,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const validatedData = verifyPaymentSchema.parse(req.body);
    const activeSub = await subscriptionService.verifyAndActivateSubscription(
      req.user._id,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Subscription is now active.',
      subscription: activeSub,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const { subscriptionId, reason } = cancelSubscriptionSchema.parse(req.body);
    const result = await subscriptionService.cancelSubscription(
      req.user._id,
      subscriptionId,
      reason
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

