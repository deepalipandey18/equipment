const crypto = require('crypto');
const { razorpayInstance, isConfigured, keySecret, keyId } = require('../config/razorpay');

class PaymentService {
  /**
   * Create Razorpay Order
   * @param {Object} options - { amount (paise), currency, receipt, notes }
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    if (isConfigured && razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: Math.round(amount), // ensure integer minor unit
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes,
        });

        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          provider: 'razorpay',
          keyId,
          isSimulated: false,
        };
      } catch (err) {
        console.error('[Razorpay Order Creation Error]:', err);
        throw new Error(`Failed to create Razorpay payment order: ${err.error?.description || err.message}`);
      }
    }

    // Local Test Simulation Mode (when live test keys are not configured in .env)
    const mockOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      orderId: mockOrderId,
      amount: Math.round(amount),
      currency,
      provider: 'mock_local',
      keyId: 'rzp_test_mock_key_id',
      isSimulated: true,
      simulationMessage: 'Running in local test simulation mode. Live Razorpay keys not provided.',
    };
  }

  /**
   * Verify Razorpay Payment Signature using HMAC-SHA256
   * @param {Object} verificationData - { orderId, paymentId, signature }
   */
  verifySignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId) {
      return false;
    }

    // Handle local test simulation mode
    if (orderId.startsWith('order_sim_')) {
      return true;
    }

    if (!signature) {
      return false;
    }

    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      // Timing safe string comparison to prevent timing attacks
      const expectedBuffer = Buffer.from(expectedSignature);
      const signatureBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (err) {
      console.error('[Signature Verification Error]:', err);
      return false;
    }
  }
}

module.exports = new PaymentService();

