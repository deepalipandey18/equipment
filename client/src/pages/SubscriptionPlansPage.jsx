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
  {
    _id: 'plan_lifetime_local',
    code: 'lifetime',
    name: 'Lifetime VIP Access',
    price: 999900,
    billingInterval: 'lifetime',
    listingLimit: 999,
    badge: 'Lifetime VIP Deal',
    lifetime: true,
    description: 'One-time investment for permanent platform access. Unlimited machine listings & VIP privileges forever.',
    features: [
      'Unlimited active equipment listings forever',
      'No monthly or yearly renewal fees (Pay once)',
      'Top priority VIP badge & search radar placement',
      'Zero commission on direct contractor rental inquiries',
      'Live GPS Telematics & fleet tracking included',
      'Dedicated VIP Account Manager & 24/7 phone line',
      'Free access to all future marketplace feature updates',
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

    try {
      setProcessingPlanId(plan._id);
      const res = await api.post('/subscriptions/create-order', {
        planId: plan._id,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Could not initiate checkout');
      }

      const { orderId, amount, keyId } = res.data.data;

      // Automatically open simulation modal for instant verification
      setSimulationModal({
        orderId,
        amountPaise: amount,
        keyId,
        plan,
      });
    } catch (err) {
      setErrorMessage(err.userMessage || err.message || 'Subscription initiation failed.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleOpenRazorpayPopup = async () => {
    if (!simulationModal) return;
    const { orderId, amountPaise, keyId, plan } = simulationModal;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Please use the instant test payment option.');
      return;
    }

    const options = {
      key: keyId || 'rzp_test_placeholder',
      amount: amountPaise,
      currency: 'INR',
      name: 'STORENT',
      description: `${plan.name} Machinery Subscription`,
      order_id: orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#FCC837',
      },
      handler: async (response) => {
        setSimulationModal(null);
        await verifyPaymentOnBackend({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          planId: plan._id,
        });
      },
      modal: {
        ondismiss: () => {
          setProcessingPlanId(null);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setErrorMessage(resp.error?.description || 'Payment was declined by Razorpay.');
      });
      rzp.open();
    } catch (err) {
      console.warn('Razorpay popup open error:', err);
    }
  };

  const verifyPaymentOnBackend = async ({ orderId, paymentId, signature, planId }) => {
    try {
      setErrorMessage('');
      const res = await api.post('/subscriptions/verify-payment', {
        orderId,
        paymentId,
        signature,
        planId,
      });

      if (res.data?.success) {
        setSimulationModal(null);
        setSuccessData(res.data.data);
        await refreshUser();
      } else {
        throw new Error(res.data?.message || 'Signature verification failed.');
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
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Listing Gate Alert */}
        {reason === 'subscription_required' && !hasActiveSubscription && (
          <div className="mb-8 p-4 rounded-xl bg-[#FCC837]/15 border border-[#FCC837]/50 flex items-start space-x-3 text-[#222428] shadow-sm">
            <AlertCircle className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm">Subscription Required to Register Equipment</h4>
              <p className="text-xs text-[#34373C] mt-0.5">
                Every equipment listing requires an active STORENT subscription tier with available listing quota.
                Select a plan below to activate your listing capability immediately.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#222428] border border-[#34373C] text-white text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="p-1 hover:text-[#FCC837]">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FCC837] text-[#222428] text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <Crown className="h-3.5 w-3.5" />
            <span>STORENT Fleet Owner Membership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#222428] tracking-tight">
            Transparent Subscription Plans for Machine Owners
          </h1>
          <p className="text-sm text-[#34373C]/80 mt-3 leading-relaxed">
            Choose a plan to list your machinery, manage rental bookings, and earn consistent income from construction projects across India.
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#222428]" />
            <p className="text-sm text-[#34373C]/70 font-medium">Loading subscription tiers...</p>
          </div>
        ) : (
          /* Plans Grid - 4 Column Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan =
                user?.activeSubscription?.planId?._id === plan._id ||
                user?.activeSubscription?.planId?.code === plan.code;
              const isPopular = plan.code === 'pro' || plan.popular;
              const isLifetime = plan.code === 'lifetime' || plan.billingInterval === 'lifetime';

              return (
                <div
                  key={plan._id || plan.code}
                  className={`relative rounded-2xl border transition-all duration-300 ${
                    isLifetime
                      ? 'bg-[#222428] text-white border-2 border-[#FCC837] shadow-2xl ring-2 ring-[#FCC837]/30 hover:scale-[1.01]'
                      : isPopular
                      ? 'bg-white border-2 border-[#FCC837] shadow-xl ring-2 ring-[#FCC837]/20 hover:shadow-2xl'
                      : 'bg-white border-[#34373C]/15 shadow-sm hover:border-[#34373C]/40 hover:shadow-md'
                  } p-6 flex flex-col justify-between`}
                >
                  {isLifetime && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FCC837] text-[#222428] text-[11px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md flex items-center space-x-1">
                      <Crown className="h-3 w-3 fill-current" />
                      <span>Lifetime VIP Deal</span>
                    </div>
                  )}

                  {!isLifetime && isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#222428] text-[#FCC837] border border-[#FCC837] text-[11px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                      Most Popular Tier
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-wider ${isLifetime ? 'text-[#FCC837]' : 'text-[#34373C]/70'}`}>
                        {plan.name}
                      </span>
                      {isCurrentPlan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FCC837] text-[#222428]">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline space-x-1">
                      <span className={`text-3xl font-black ${isLifetime ? 'text-white' : 'text-[#222428]'}`}>
                        ₹{(plan.price / 100).toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[11px] font-semibold ${isLifetime ? 'text-white/60' : 'text-[#34373C]/60'}`}>
                        {isLifetime ? '/one-time' : `/${plan.billingInterval || 'month'}`}
                      </span>
                    </div>

                    <p className={`text-xs mt-2.5 leading-relaxed min-h-[36px] ${isLifetime ? 'text-white/70' : 'text-[#34373C]/80'}`}>
                      {plan.description}
                    </p>

                    <div className={`mt-5 pt-5 border-t ${isLifetime ? 'border-[#34373C]' : 'border-[#34373C]/10'}`}>
                      <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isLifetime ? 'text-white/80' : 'text-[#222428]'}`}>
                        Listing Allowance:
                      </div>
                      <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 ${
                        isLifetime ? 'bg-[#34373C] text-[#FCC837] border border-[#FCC837]/30' : 'bg-[#F8F9FA] text-[#222428] border border-[#34373C]/10'
                      }`}>
                        <Zap className={`h-3.5 w-3.5 ${isLifetime ? 'text-[#FCC837]' : 'text-[#222428]'}`} />
                        <span>
                          {isLifetime ? 'Unlimited (999) machines' : `Up to ${plan.listingLimit} machine listings`}
                        </span>
                      </div>

                      <ul className={`space-y-2.5 text-xs ${isLifetime ? 'text-white/70' : 'text-[#34373C]/80'}`}>
                        {(plan.features || []).map((feature, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 text-[#FCC837]`} />
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className={`mt-7 pt-4 border-t ${isLifetime ? 'border-[#34373C]' : 'border-[#34373C]/10'}`}>
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={processingPlanId === plan._id}
                      className={`w-full py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 ${
                        isCurrentPlan
                          ? 'bg-[#222428] text-[#FCC837] border border-[#FCC837]'
                          : isLifetime
                          ? 'bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] border border-[#E6B01B] shadow-md shadow-[#FCC837]/20'
                          : isPopular
                          ? 'bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] border border-[#E6B01B] shadow-md'
                          : 'bg-[#222428] hover:bg-[#34373C] text-white border border-[#34373C]'
                      } disabled:opacity-60`}
                    >
                      {processingPlanId === plan._id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Initiating...</span>
                        </>
                      ) : (
                        <span>
                          {isCurrentPlan ? 'Active Plan' : isLifetime ? 'Get Lifetime VIP Access' : `Subscribe to ${plan.name}`}
                        </span>
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
          <div className="fixed inset-0 z-50 bg-[#222428]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#34373C]/20">
              <div className="flex items-center justify-between pb-3 border-b border-[#34373C]/10">
                <div className="flex items-center space-x-2 text-[#222428]">
                  <CreditCard className="h-5 w-5 text-[#FCC837]" />
                  <span className="font-black text-sm">STORENT Checkout Simulation</span>
                </div>
                <button
                  onClick={() => setSimulationModal(null)}
                  className="p-1 rounded text-[#34373C] hover:text-[#222428]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#34373C]/15">
                  <div className="text-xs text-[#34373C]/70 font-semibold uppercase tracking-wider">Subscription Tier:</div>
                  <div className="text-lg font-black text-[#222428] mt-0.5">
                    {simulationModal.plan.name}
                  </div>
                  <div className="text-2xl font-black text-[#222428] mt-1">
                    ₹{(simulationModal.amountPaise / 100).toLocaleString('en-IN')}
                    <span className="text-xs text-[#34373C]/60 font-normal">
                      {simulationModal.plan.billingInterval === 'lifetime' ? ' / One-Time (Lifetime)' : ' / month'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#34373C]/60 font-mono mt-1">
                    Order Ref: {simulationModal.orderId}
                  </div>
                </div>

                {/* Option 1: 1-Click Instant Test Pay */}
                <div className="p-4 rounded-xl bg-[#FCC837]/15 border border-[#FCC837]/40">
                  <div className="flex items-center space-x-2 text-[#222428] font-black text-xs">
                    <Zap className="h-4 w-4 text-[#222428] shrink-0" />
                    <span>Option 1: Instant 1-Click Test Pay (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-[#34373C] mt-1">
                    Verified instantly by backend and immediately activates your machinery listing quota.
                  </p>
                  <button
                    onClick={handleSimulatedPaymentConfirm}
                    disabled={Boolean(processingPlanId)}
                    className="w-full mt-3 py-3 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs text-[#222428] uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-1.5 border border-[#E6B01B]"
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
                <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#34373C]/15">
                  <div className="flex items-center space-x-2 text-[#222428] font-bold text-xs">
                    <CreditCard className="h-4 w-4 text-[#222428] shrink-0" />
                    <span>Option 2: Open Razorpay Test Popup</span>
                  </div>
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-[#34373C]/15 text-[11px] text-[#34373C] space-y-1">
                    <div><strong>Test Card:</strong> <code className="bg-[#F8F9FA] px-1 py-0.5 rounded text-[#222428]">4111 1111 1111 1111</code></div>
                    <div><strong>Expiry / CVV:</strong> <code className="bg-[#F8F9FA] px-1 py-0.5 rounded text-[#222428]">12/32</code> • CVV: <code className="bg-[#F8F9FA] px-1 py-0.5 rounded text-[#222428]">123</code></div>
                    <div><strong>Bank OTP:</strong> <code className="bg-[#F8F9FA] px-1 py-0.5 rounded text-[#222428]">123456</code> (or click &quot;Success&quot; button)</div>
                  </div>
                  <button
                    onClick={handleOpenRazorpayPopup}
                    disabled={Boolean(processingPlanId)}
                    className="w-full mt-3 py-2.5 rounded-xl border border-[#34373C]/30 hover:bg-[#F8F9FA] font-bold text-xs text-[#222428] transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Launch Razorpay Test Modal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setSimulationModal(null)}
                  className="text-xs font-semibold text-[#34373C]/70 hover:text-[#222428] transition"
                >
                  Cancel and close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successData && (
          <div className="fixed inset-0 z-50 bg-[#222428]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-[#34373C]/20">
              <div className="h-14 w-14 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center mx-auto mb-4 font-black">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-[#222428]">STORENT Subscription Activated!</h3>
              <p className="text-xs text-[#34373C]/80 mt-2">
                Your payment was verified by the backend. You can now register heavy machinery up to your plan's listing allowance.
              </p>

              <div className="mt-5 p-3 rounded-xl bg-[#F8F9FA] border border-[#34373C]/15 text-xs text-[#222428] text-left space-y-1">
                <div>
                  <strong>Tier:</strong> {successData.planId?.name || 'Active Plan'}
                </div>
                <div>
                  <strong>Valid Until:</strong>{' '}
                  {successData.planId?.billingInterval === 'lifetime'
                    ? 'Lifetime Access (Never Expires ♾️)'
                    : new Date(successData.endDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Listing Limit:</strong>{' '}
                  {successData.planId?.billingInterval === 'lifetime'
                    ? 'Unlimited (999 machine slots)'
                    : `${successData.planId?.listingLimit || 2} machine listings`}
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                <Link
                  to="/equipment/register"
                  className="w-full py-3 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs uppercase tracking-wider text-[#222428] border border-[#E6B01B] transition shadow-sm"
                >
                  Register Equipment Now
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full py-2.5 rounded-lg border border-[#34373C]/30 text-xs font-semibold text-[#222428] hover:bg-[#F8F9FA] transition"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Security & Refund Notice */}
        <div className="mt-12 text-center text-xs text-[#34373C]/70 flex items-center justify-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-[#222428]" />
          <span>Server-side HMAC-SHA256 signature verification enabled. Razorpay test mode.</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
