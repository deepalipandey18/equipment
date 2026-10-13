const subscriptionService = require('../services/subscriptionService');

/**
 * Middleware to enforce subscription requirement and listing quotas on equipment creation
 */
const verifySubscriptionQuota = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to register equipment.',
      });
    }

    const quotaCheck = await subscriptionService.checkUserListingQuota(req.user._id);

    if (!quotaCheck.allowed) {
      return res.status(403).json({
        success: false,
        reason: quotaCheck.reason,
        message: quotaCheck.message,
        currentCount: quotaCheck.currentCount,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining,
      });
    }

    // Attach quota info to request for controller reference
    req.subscriptionQuota = quotaCheck;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifySubscriptionQuota,
};

