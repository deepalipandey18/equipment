const Razorpay = require('razorpay');

let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

const isConfigured = Boolean(
  keyId &&
  keySecret &&
  keyId !== 'rzp_test_mock_key_id' &&
  keySecret !== 'mock_razorpay_secret'
);

if (isConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[Razorpay] Initialized successfully with test/live credentials.');
  } catch (error) {
    console.error('[Razorpay Error] Initialization failed:', error.message);
  }
} else {
  console.log('[Razorpay] Running in simulated/mock test mode. Real keys not configured.');
}

module.exports = {
  razorpayInstance,
  isConfigured,
  keyId: keyId || 'rzp_test_mock_key_id',
  keySecret: keySecret || 'mock_razorpay_secret',
};

