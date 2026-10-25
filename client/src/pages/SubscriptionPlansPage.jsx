import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { loadRazorpayScript } from '../utils/razorpay';
import StorentLogo from '../components/common/StorentLogo';
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
  FileText,
  Printer,
  Share2,
  MessageSquare,
  Scale,
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
      'Standard search directory placement',
      'Direct customer mobile OTP contact unlock',
      '18% GST inclusive tax invoice (SAC 998365)',
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
      'Instant SMS alert whenever hirers unlock contact',
      'RC / Document verification for Verified Owner badge',
      'Dedicated partner phone support',
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
      'Featured category showcase banner placement',
      'Multi-city and multi-yard listing management',
      'Custom GST business invoice with buyer GSTIN',
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
      'Live GPS telematics & yard verification included',
      'Official 18% GST Tax Invoice for business claim',
    ],
  },
];

// Helper to compute transparent 18% GST breakdown (Price is inclusive of 18% GST)
const getGstBreakdown = (totalPaise) => {
  const totalInr = totalPaise / 100;
  const baseInr = Number((totalInr / 1.18).toFixed(2));
  const totalGst = Number((totalInr - baseInr).toFixed(2));
  const cgst = Number((totalGst / 2).toFixed(2));
  const sgst = Number((totalGst / 2).toFixed(2));
  return {
    totalInr,
    baseInr,
    totalGst,
    cgst,
    sgst,
    sacCode: '998365', // Internet directory advertising services
  };
};

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

  // Simulation modal & Terms agreement state
  const [simulationModal, setSimulationModal] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState(false);

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
      setTermsAccepted(false);

      setSimulationModal({
        orderId,
        amountPaise: amount,
        keyId,
        plan,
        gst: getGstBreakdown(amount),
      });
    } catch (err) {
      setErrorMessage(err.userMessage || err.message || 'Subscription initiation failed.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleOpenRazorpayPopup = async () => {
    if (!simulationModal) return;
    if (!termsAccepted) {
      setErrorMessage('You must accept the Terms of Service & Intermediary Safe Harbor Disclaimer.');
      return;
    }
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
      name: 'STORENT.SI',
      description: `${plan.name} Machinery Listing Subscription (18% GST Incl.)`,
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
          plan,
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

  const verifyPaymentOnBackend = async ({ orderId, paymentId, signature, planId, plan }) => {
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
        const subData = res.data.subscription || res.data.data;
        setSuccessData({
          ...subData,
          paymentReference: paymentId,
          orderId,
          plan: plan || subData.planId,
          gst: getGstBreakdown((plan?.price || 49900)),
          invoiceNumber: `INV-STORENT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          invoiceDate: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });
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
    if (!termsAccepted) {
      setErrorMessage('You must accept the Terms of Service & Intermediary Safe Harbor Disclaimer to proceed.');
      return;
    }
    setProcessingPlanId(simulationModal.plan._id);

    const mockPaymentId = `pay_gst_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mockSignature = `mock_gst_sig_${Date.now()}`;

    await verifyPaymentOnBackend({
      orderId: simulationModal.orderId,
      paymentId: mockPaymentId,
      signature: mockSignature,
      planId: simulationModal.plan._id,
      plan: simulationModal.plan,
    });
    setProcessingPlanId(null);
  };

  // Share Tax Invoice via WhatsApp
  const handleShareInvoiceWhatsApp = () => {
    if (!successData) return;
    const { invoiceNumber, invoiceDate, plan, gst } = successData;
    const text = encodeURIComponent(
      `*STORENT.SI — TAX INVOICE*\n` +
      `Invoice No: ${invoiceNumber}\n` +
      `Date: ${invoiceDate}\n` +
      `GSTIN: 06AAACS8892Q1ZB (Haryana, India)\n` +
      `SAC Code: 998365 (Listing Advertising)\n` +
      `---------------------------------\n` +
      `Plan: ${plan.name} (${plan.listingLimit} machine slots)\n` +
      `Base Amount: ₹${gst.baseInr}\n` +
      `CGST (9%): ₹${gst.cgst}\n` +
      `SGST (9%): ₹${gst.sgst}\n` +
      `*Total Paid (Incl. 18% GST): ₹${gst.totalInr}*\n` +
      `---------------------------------\n` +
      `Thank you for subscribing with STORENT.SI!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Simulate SMS Invoice Dispatch
  const handleSendInvoiceSms = () => {
    setSmsSentNotice(true);
    setTimeout(() => setSmsSentNotice(false), 5000);
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
                Every equipment listing requires an active STORENT subscription tier.
                All plans include 18% GST with downloadable tax invoices (SAC 998365).
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
            Transparent Subscription Plans for Equipment Owners
          </h1>
          <p className="text-sm text-[#34373C]/80 mt-3 leading-relaxed">
            All prices are <strong>inclusive of 18% GST</strong>. Official Tax Invoices with SAC Code 998365 are generated immediately upon payment.
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
              const gst = getGstBreakdown(plan.price);

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
                        ₹{gst.totalInr.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[11px] font-semibold ${isLifetime ? 'text-white/60' : 'text-[#34373C]/60'}`}>
                        {isLifetime ? '/one-time' : `/${plan.billingInterval || 'month'}`}
                      </span>
                    </div>

                    {/* 18% GST Inclusive Breakdown Label */}
                    <div className={`mt-1 text-[11px] font-medium ${isLifetime ? 'text-[#FCC837]' : 'text-[#34373C]'}`}>
                      <span>Incl. 18% GST: Base ₹{gst.baseInr} + ₹{gst.totalGst} GST</span>
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

        {/* GST Tax Invoice Computation & Checkout Modal */}
        {simulationModal && (
          <div className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#34373C]/20">
              <div className="flex items-center justify-between pb-3 border-b border-[#34373C]/10">
                <div className="flex items-center space-x-2 text-[#222428]">
                  <CreditCard className="h-5 w-5 text-[#FCC837]" />
                  <span className="font-black text-sm">Subscription Checkout &amp; Tax Invoice</span>
                </div>
                <button
                  onClick={() => setSimulationModal(null)}
                  className="p-1 rounded text-[#34373C] hover:text-[#222428]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                {/* 18% GST Itemized Breakdown Table */}
                <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#34373C]/15 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#34373C]/70 uppercase font-bold">Service / Description</span>
                    <span className="text-[#34373C]/70 uppercase font-bold">SAC Code</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-[#222428]">
                    <span>{simulationModal.plan.name} Listing Space</span>
                    <span className="font-mono text-xs text-[#222428] bg-white px-2 py-0.5 rounded border border-[#34373C]/15">
                      {simulationModal.gst.sacCode}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#34373C]/10 space-y-1.5 text-xs text-[#34373C]">
                    <div className="flex justify-between">
                      <span>Taxable Value (Base Price):</span>
                      <strong>₹{simulationModal.gst.baseInr.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (9%):</span>
                      <strong>₹{simulationModal.gst.cgst.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9%):</span>
                      <strong>₹{simulationModal.gst.sgst.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="pt-2 border-t border-[#34373C]/10 flex justify-between text-base font-black text-[#222428]">
                      <span>Total Amount Payable (Incl. 18% GST):</span>
                      <span>₹{simulationModal.gst.totalInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Mandatory Acceptance Checkbox as required by PDF */}
                <div className="p-3.5 bg-[#FCC837]/10 rounded-xl border border-[#FCC837]/40 text-xs text-[#222428]">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 mt-0.5 accent-[#222428] rounded shrink-0 cursor-pointer"
                    />
                    <span className="leading-relaxed">
                      I agree to the{' '}
                      <Link to="/safe-harbor" target="_blank" className="font-black text-[#222428] underline">
                        Terms of Service, &quot;As-Is&quot; Disclaimer &amp; Intermediary Safe Harbor Policy
                      </Link>{' '}
                      under Section 79 of the Information Technology Act, 2000. I acknowledge that STORENT provides digital listing advertising space only.
                    </span>
                  </label>
                </div>

                {/* Instant Verification CTA */}
                <button
                  onClick={handleSimulatedPaymentConfirm}
                  disabled={Boolean(processingPlanId) || !termsAccepted}
                  className="w-full py-3.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs uppercase tracking-wider text-[#222428] border border-[#E6B01B] shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {processingPlanId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#222428]" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-[#222428]" />
                      <span>Complete Payment &amp; Generate GST Invoice</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleOpenRazorpayPopup}
                    disabled={!termsAccepted}
                    className="text-xs font-semibold text-[#34373C]/70 hover:text-[#222428] transition disabled:opacity-50"
                  >
                    Or open standard Razorpay Gateway popup →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GST TAX INVOICE MODAL (Generated upon successful payment) */}
        {successData && (
          <div className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#34373C]/20 my-8">
              {/* Invoice Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-[#222428]">
                <div>
                  <div className="inline-block mb-1">
                    <StorentLogo variant="dark" className="h-8 w-auto" />
                  </div>
                  <div className="text-[10px] text-[#34373C]/70">
                    STORENT Technologies India Pvt. Ltd. • GSTIN: <strong>06AAACS8892Q1ZB</strong>
                  </div>
                  <div className="text-[10px] text-[#34373C]/70">
                    Sector 37 Industrial Corridor, Gurugram, Haryana - 122001
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-[#FCC837] text-[#222428] text-xs font-black uppercase tracking-wider">
                    TAX INVOICE
                  </span>
                  <div className="font-mono text-xs font-bold text-[#222428] mt-1">
                    {successData.invoiceNumber}
                  </div>
                  <div className="text-[10px] text-[#34373C]/70">
                    Date: {successData.invoiceDate}
                  </div>
                </div>
              </div>

              {/* Billed To Details */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-[#34373C]/10 text-[#34373C]">
                <div>
                  <div className="font-bold text-[#222428] uppercase text-[10px] tracking-wider">Billed To (Owner):</div>
                  <div className="font-bold text-[#222428] mt-0.5">{user?.name || 'Equipment Owner'}</div>
                  <div>Email: {user?.email || 'owner@storent.si'}</div>
                  <div>Phone: {user?.phone || '+91 98765 43210'}</div>
                </div>
                <div>
                  <div className="font-bold text-[#222428] uppercase text-[10px] tracking-wider">Supply Details:</div>
                  <div>Place of Supply: <strong>Haryana (06)</strong></div>
                  <div>Service Category: <strong>Online Advertising Space</strong></div>
                  <div>Status: <span className="font-bold text-green-700">PAID &amp; ACTIVE</span></div>
                </div>
              </div>

              {/* Invoice Line Item */}
              <div className="py-4 space-y-2 border-b border-[#34373C]/10 text-xs">
                <div className="flex justify-between font-bold text-[#222428] pb-1 border-b border-[#34373C]/10">
                  <span>Description of Services</span>
                  <span>SAC Code</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="flex justify-between items-center text-[#34373C]">
                  <div>
                    <strong>{successData.plan?.name || 'Machinery'} Listing Subscription</strong>
                    <div className="text-[10px] text-[#34373C]/70">
                      Listing allowance: {successData.plan?.listingLimit} machines
                    </div>
                  </div>
                  <span className="font-mono">{successData.gst?.sacCode || '998365'}</span>
                  <span className="font-semibold">₹{successData.gst?.baseInr}</span>
                </div>
              </div>

              {/* Tax Breakup Total */}
              <div className="py-3 text-xs space-y-1.5 text-[#34373C] border-b border-[#34373C]/10">
                <div className="flex justify-between">
                  <span>Taxable Value (Base):</span>
                  <span>₹{successData.gst?.baseInr}</span>
                </div>
                <div className="flex justify-between">
                  <span>Central GST (CGST @ 9%):</span>
                  <span>₹{successData.gst?.cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span>State GST (SGST @ 9%):</span>
                  <span>₹{successData.gst?.sgst}</span>
                </div>
                <div className="pt-2 border-t border-[#34373C]/15 flex justify-between font-black text-sm text-[#222428]">
                  <span>Total Amount Paid (Incl. 18% GST):</span>
                  <span>₹{successData.gst?.totalInr}</span>
                </div>
              </div>

              {/* SMS Notice */}
              {smsSentNotice && (
                <div className="mt-3 p-2.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                  <span>Tax invoice details have been dispatched to your registered mobile via SMS!</span>
                </div>
              )}

              {/* Sharing & Download Actions as mandated by PDF ("Via what's up or sms") */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleShareInvoiceWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-[#222428] text-[#FCC837] hover:bg-[#34373C] font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-[#34373C]"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendInvoiceSms}
                  className="py-2.5 px-3 rounded-xl bg-[#222428] text-white hover:bg-[#34373C] font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-[#34373C]"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#FCC837]" />
                  <span>Send via SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl border border-[#34373C]/30 text-[#222428] hover:bg-[#F8F9FA] font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Printer className="h-3.5 w-3.5 text-[#222428]" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              {/* Final Proceed Buttons */}
              <div className="mt-4 pt-4 border-t border-[#34373C]/10 flex flex-col sm:flex-row gap-2">
                <Link
                  to="/equipment/register"
                  className="flex-1 py-3 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs uppercase tracking-wider text-[#222428] border border-[#E6B01B] text-center shadow-md transition"
                >
                  Register Equipment Now →
                </Link>
                <Link
                  to="/dashboard"
                  className="py-3 px-5 rounded-xl border border-[#34373C]/30 text-xs font-bold text-[#222428] hover:bg-[#F8F9FA] text-center transition"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Security & Safe Harbor Notice */}
        <div className="mt-12 text-center text-xs text-[#34373C]/70 flex items-center justify-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-[#222428]" />
          <span>
            STORENT.SI operates solely as an Intermediary Listing Directory under Section 79 of the IT Act, 2000.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
