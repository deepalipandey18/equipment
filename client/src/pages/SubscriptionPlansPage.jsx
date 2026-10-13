import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { loadRazorpayScript } from '../utils/razorpay';
import {
  Crown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle,
  CreditCard,
  X,
} from 'lucide-react';

const fallbackPlans = [
  {
    _id: 'plan_basic_local',
    code: 'basic',
    name: 'Basic Plan',
    price: 49900,
    billingInterval: 'monthly',
    listingLimit: 2,
    badge: 'Starter',
    description: 'Ideal for independent contractors starting with a small machinery fleet.',
    features: [
      'Up to 2 active equipment listings',
      'Standard search placement',
      'Direct customer booking requests',
      'Online payment verification',
      'Basic listing analytics',
    ],
  },
  {
    _id: 'plan_pro_local',
    code: 'pro',
    name: 'Pro Plan',
    price: 99900,
    billingInterval: 'monthly',
    listingLimit: 10,
    badge: 'Most Popular',
    popular: true,
    description: 'Perfect for rental businesses managing multiple machines across regions.',
    features: [
      'Up to 10 active equipment listings',
      'Priority badge & top search placement',
      'Instant booking request alerts',
      'Advanced availability blackout calendar',
      'Dedicated partner support',
    ],
  },
  {
    _id: 'plan_business_local',
    code: 'business',
    name: 'Business Fleet',
    price: 249900,
    billingInterval: 'monthly',
    listingLimit: 50,
    badge: 'Enterprise Fleet',
    description: 'Enterprise tier for fleet owners and contractors with large inventories.',
    features: [
      'Up to 50 active equipment listings',
      'Featured homepage banner rotation',
      'Multi-city and multi-depot management',
      'Custom invoice branding & automated receipts',
      '24/7 Priority phone support & account manager',
    ],
  },
];

const SubscriptionPlansPage = () => {
  const { user, hasActiveSubscription, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get('reason');

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Simulation modal state for local dev without live bank account
  const [simulationModal, setSimulationModal] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/subscriptions/plans');
        if (res.data?.success && res.data.data?.length > 0) {
          setPlans(res.data.data);
        } else {
          setPlans(fallbackPlans);
        }
      } catch (err) {
        console.warn('Could not load dynamic plans, using fallback tiers:', err);
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    setErrorMessage('');
    if (!user) {
      navigate(`/login?redirect=/plans`);
      return;
    }

    setProcessingPlanId(plan._id);

    try {
      // 1. Create order on backend
      const res = await api.post('/subscriptions/create-order', {
        planId: plan._id || plan.code,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Could not initiate payment order');
      }

      const orderData = res.data.data;

      // Always open our Checkout Modal so user can choose between 1-Click Sandbox Pay (No OTP) or Razorpay SDK
      setSimulationModal({
        orderId: orderData.orderId,
        plan,
        amountPaise: orderData.amount,
        keyId: orderData.keyId,
        currency: orderData.currency || 'INR',
        isSimulated: orderData.isSimulated,
      });
      setProcessingPlanId(null);
    } catch (err) {
      setErrorMessage(err.userMessage || err.message || 'Payment initiation failed.');
      setProcessingPlanId(null);
    }
  };

  const handleOpenRazorpayPopup = async () => {
    if (!simulationModal) return;
    setProcessingPlanId(simulationModal.plan._id);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Could not load Razorpay SDK. Please use the 1-Click Instant Sandbox Pay option.');
        setProcessingPlanId(null);
        return;
      }

      const options = {
        key: simulationModal.keyId,
        amount: simulationModal.amountPaise,
        currency: simulationModal.currency,
        name: 'EquipmentHub Marketplace',
        description: `Subscription: ${simulationModal.plan.name}`,
        order_id: simulationModal.orderId,
        handler: async function (response) {
          await verifyPaymentOnBackend({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            planId: simulationModal.plan._id,
          });
        },
        prefill: {
          name: user?.name || 'Test Contractor',
          email: user?.email || 'contractor@example.com',
          contact: '9876543210',
        },
        theme: {
          color: '#ea580c',
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (err) {
      setErrorMessage(err.message || 'Could not open Razorpay checkout.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const verifyPaymentOnBackend = async (payload) => {
    try {
      const res = await api.post('/subscriptions/verify', payload);
      if (res.data?.success) {
        await refreshUser();
        setSuccessData(res.data.subscription);
        setSimulationModal(null);
      } else {
        throw new Error(res.data?.message || 'Verification rejected by backend.');
      }
    } catch (err) {
      setErrorMessage(err.userMessage || err.message || 'Payment verification failed.');
    }
  };

  const handleSimulatedPaymentConfirm = async () => {
    if (!simulationModal) return;
    setProcessingPlanId(simulationModal.plan._id);

    const mockPaymentId = `pay_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mockSignature = `mock_sig_${Date.now()}`;

    await verifyPaymentOnBackend({
      orderId: simulationModal.orderId,
      paymentId: mockPaymentId,
      signature: mockSignature,
      planId: simulationModal.plan._id,
    });
    setProcessingPlanId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Listing Gate Alert */}
        {reason === 'subscription_required' && !hasActiveSubscription && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-900 shadow-sm animate-pulse">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Subscription Required to Register Equipment</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Every equipment listing requires an active subscription tier with available listing quota.
                Select a plan below to activate your listing capability immediately.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="p-1 hover:text-red-950">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Crown className="h-3.5 w-3.5" />
            <span>Equipment Owner Membership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Transparent Subscription Plans for Machine Owners
          </h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Choose a plan to list your machinery, manage rental bookings, and earn consistent income from construction projects across India.
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-sm text-slate-500 font-medium">Loading subscription tiers...</p>
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrentPlan =
                user?.activeSubscription?.planId?._id === plan._id ||
                user?.activeSubscription?.planId?.code === plan.code;
              const isPopular = plan.code === 'pro' || plan.popular;

              return (
                <div
                  key={plan._id || plan.code}
                  className={`relative bg-white rounded-2xl border ${
                    isPopular
                      ? 'border-brand-500 shadow-xl ring-2 ring-brand-500/20'
                      : 'border-slate-200 shadow-sm'
                  } p-8 flex flex-col justify-between`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                      Most Popular Tier
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {plan.name}
                      </span>
                      {isCurrentPlan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline space-x-1">
                      <span className="text-4xl font-black text-slate-900">
                        ₹{(plan.price / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        /{plan.billingInterval || 'month'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                        Listing Allowance:
                      </div>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-bold mb-4">
                        <Zap className="h-3.5 w-3.5 text-amber-600" />
                        <span>Up to {plan.listingLimit} active machine listings</span>
                      </div>

                      <ul className="space-y-3 text-xs text-slate-600">
                        {(plan.features || []).map((feature, i) => (
                          <li key={i} className="flex items-start space-x-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={processingPlanId === plan._id}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 ${
                        isCurrentPlan
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : isPopular
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      } disabled:opacity-60`}
                    >
                      {processingPlanId === plan._id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Initiating Razorpay...</span>
                        </>
                      ) : (
                        <span>{isCurrentPlan ? 'Renew Plan' : `Subscribe to ${plan.name}`}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Local Test Mode Simulation Modal */}
        {simulationModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-brand-600">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-bold text-sm">Razorpay Test Mode Checkout</span>
                </div>
                <button
                  onClick={() => setSimulationModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Subscription Tier:</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {simulationModal.plan.name}
                  </div>
                  <div className="text-2xl font-black text-brand-600 mt-1">
                    ₹{(simulationModal.amountPaise / 100).toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Order Ref: {simulationModal.orderId}
                  </div>
                </div>

                {/* Option 1: 1-Click Instant Test Pay (Zero OTP, No Bank Needed) */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Option 1: Instant 1-Click Test Pay (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Bypasses phone number SMS OTP and bank login hurdles. Verified instantly by backend and immediately activates your listing quota.
                  </p>
                  <button
                    onClick={handleSimulatedPaymentConfirm}
                    disabled={Boolean(processingPlanId)}
                    className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs text-white uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    {processingPlanId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Pay ₹{(simulationModal.amountPaise / 100).toLocaleString('en-IN')} & Activate Instantly</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option 2: Official Razorpay Test Modal */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
                    <CreditCard className="h-4 w-4 text-brand-600 shrink-0" />
                    <span>Option 2: Open Razorpay Test Popup</span>
                  </div>
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div><strong>Test Card:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">4111 1111 1111 1111</code></div>
                    <div><strong>Expiry / CVV:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">12/32</code> • CVV: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">123</code></div>
                    <div><strong>Bank OTP:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">123456</code> (or click &quot;Success&quot; button)</div>
                  </div>
                  <button
                    onClick={handleOpenRazorpayPopup}
                    disabled={Boolean(processingPlanId)}
                    className="w-full mt-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-800 transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Launch Razorpay Test Modal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setSimulationModal(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancel and close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successData && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-slate-200">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Subscription Activated!</h3>
              <p className="text-xs text-slate-600 mt-2">
                Your payment was verified by the backend. You can now register heavy machinery up to your plan's listing allowance.
              </p>

              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1">
                <div>
                  <strong>Tier:</strong> {successData.planId?.name || 'Active Plan'}
                </div>
                <div>
                  <strong>Valid Until:</strong>{' '}
                  {new Date(successData.endDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Listing Limit:</strong>{' '}
                  {successData.planId?.listingLimit || 2} machine listings
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                <Link
                  to="/equipment/register"
                  className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-xs uppercase tracking-wider text-slate-950 transition"
                >
                  Register Equipment Now
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Security & Refund Notice */}
        <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Server-side HMAC-SHA256 signature verification enabled. Razorpay test mode.</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
