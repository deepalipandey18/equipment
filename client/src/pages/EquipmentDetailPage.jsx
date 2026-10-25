import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getIllustrationForEquipment } from '../components/common/EquipmentIllustration';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Mail,
  IndianRupee,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Share2,
  Navigation,
  Tag,
  MessageSquare,
  Sparkles,
  FileCheck,
  X,
  ExternalLink,
  Lock,
  Unlock,
  CheckSquare,
  Scale,
  ThumbsUp,
  AlertTriangle,
  PhoneOff,
} from 'lucide-react';

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Hirer Mobile OTP Contact Unlock State
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [hirerPhone, setHirerPhone] = useState(user?.phone || '');
  const [hirerOtp, setHirerOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockedOwnerData, setUnlockedOwnerData] = useState(null);
  const [ownerAlertDispatched, setOwnerAlertDispatched] = useState(false);

  // Hirer Review / Rating Prompt State
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState('');

  // Make an Offer Modal State (Buy mode)
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [offerSent, setOfferSent] = useState(false);

  // Booking Calculator State (Rent Mode)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [needOperator, setNeedOperator] = useState(true);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Check persisted unlocked status for this equipment
  useEffect(() => {
    if (id) {
      const persisted = localStorage.getItem(`storent_unlocked_${id}`);
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted);
          setContactUnlocked(true);
          setUnlockedOwnerData(parsed);
          setOwnerAlertDispatched(true);
        } catch (e) {
          // ignore corrupted localstorage
        }
      }
    }
  }, [id]);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const calculateDistance = () => {
    if (equipment?.distanceKm !== undefined && equipment?.distanceKm !== null) {
      return Number(equipment.distanceKm).toFixed(1);
    }
    if (!userLocation || !equipment?.location?.coordinates) return null;

    const [itemLng, itemLat] = equipment.location.coordinates;
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = Number(itemLat);
    const lon2 = Number(itemLng);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const distanceKm = calculateDistance();

  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/equipment/${id}`);
        if (res.data?.success) {
          const eq = res.data.data;
          setEquipment(eq);
          if (eq.salePrice) {
            setOfferAmount(Math.round(eq.salePrice * 0.95).toString());
          }
        } else {
          setError('Equipment listing not found.');
        }
      } catch (err) {
        setError(err.userMessage || 'Could not load equipment details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEquipmentDetails();
  }, [id]);

  // Handle OTP request simulation
  const handleSendOtp = () => {
    if (!hirerPhone || hirerPhone.trim().replace(/\D/g, '').length < 10) {
      setUnlockError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setUnlockError('');
    setOtpSent(true);
    setHirerOtp('123456'); // Pre-fill default demo OTP for effortless user verification
    setOtpCountdown(30);
  };

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle OTP verification and contact unlock
  const handleVerifyOtpAndUnlock = async (e) => {
    e.preventDefault();
    setUnlockError('');

    if (!termsAccepted) {
      setUnlockError('You must agree to the Terms of Service & Intermediary Safe Harbor Disclaimer.');
      return;
    }

    if (!hirerOtp || hirerOtp.length < 4) {
      setUnlockError('Please enter the verification OTP sent to your phone.');
      return;
    }

    try {
      setUnlocking(true);
      const res = await api.post(`/equipment/${id}/unlock-contact`, {
        hirerPhone,
        termsAccepted,
        otp: hirerOtp,
      });

      if (res.data?.success) {
        const ownerInfo = res.data.owner;
        setContactUnlocked(true);
        setUnlockedOwnerData(ownerInfo);
        setOwnerAlertDispatched(true);
        setUnlockModalOpen(false);

        // Persist unlock status in local storage
        localStorage.setItem(`storent_unlocked_${id}`, JSON.stringify(ownerInfo));
      } else {
        throw new Error(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      setUnlockError(err.response?.data?.message || err.message || 'OTP verification failed.');
    } finally {
      setUnlocking(false);
    }
  };

  // Handle Hirer Feedback on Owner
  const handleRateOwner = async (ratingType) => {
    try {
      await api.post(`/equipment/${id}/contact-feedback`, {
        ratingType,
        hirerPhone,
      });
      setRatingSubmitted(true);
      setFeedbackToast('Thank you! Your feedback helps keep STORENT listings verified & authentic.');
      setTimeout(() => setFeedbackToast(''), 5000);
    } catch (err) {
      console.warn('Feedback submit error:', err);
    }
  };

  // Rental estimate math
  const calculateRentalDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const rentalDays = calculateRentalDays();
  const rentalBaseFee = (equipment?.dailyRate || 0) * rentalDays;
  const deliveryFee = equipment?.deliveryCharges || 0;
  const securityDeposit = equipment?.securityDeposit || 0;
  const estimatedTotal = rentalBaseFee + deliveryFee + securityDeposit;

  // Direct Communication Handlers
  const effectivePhone =
    unlockedOwnerData?.phone ||
    equipment?.sellerContactPhone ||
    equipment?.sellerWhatsApp ||
    equipment?.ownerId?.phone ||
    '+919876543210';

  const effectiveWhatsApp =
    unlockedOwnerData?.whatsapp ||
    equipment?.sellerWhatsApp ||
    effectivePhone;

  const handleWhatsAppOwner = (customMsg = '') => {
    if (!contactUnlocked) {
      setUnlockModalOpen(true);
      return;
    }
    const cleanNum = effectiveWhatsApp.replace(/[^0-9]/g, '');
    const defaultMsg = `Hello! I unlocked your contact details on STORENT for "${equipment?.name}". I am interested in hiring/buying this equipment for our project site.`;
    const text = encodeURIComponent(customMsg || defaultMsg);
    const targetPhone = cleanNum.startsWith('91') ? cleanNum : `91${cleanNum}`;
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  const handleCallOwner = () => {
    if (!contactUnlocked) {
      setUnlockModalOpen(true);
      return;
    }
    window.location.href = `tel:${effectivePhone}`;
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    const formattedOffer = Number(offerAmount).toLocaleString('en-IN');
    const msg = `Hello! I would like to make an offer of ₹${formattedOffer} for your machinery "${equipment?.name}" on STORENT. Message: ${offerMessage || 'I am ready for immediate yard inspection.'} - Buyer: ${buyerName || 'Interested Contractor'} (${buyerPhone || 'Contact provided'})`;
    handleWhatsAppOwner(msg);
    setOfferSent(true);
    setTimeout(() => {
      setOfferModalOpen(false);
      setOfferSent(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#222428]" />
        <p className="text-sm text-[#34373C] font-medium">Loading machinery specifications...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-[#222428]">{error || 'Equipment Not Found'}</h2>
        <p className="text-xs text-[#34373C]/70 mt-1 mb-6">
          The requested machinery listing may have been paused or removed.
        </p>
        <Link
          to="/browse"
          className="px-5 py-2.5 rounded-lg bg-[#222428] text-[#FCC837] font-bold text-xs uppercase tracking-wider"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isSaleListing = equipment.listingType === 'sale';
  const isVerifiedOwner = Boolean(
    unlockedOwnerData?.isVerifiedOwner ||
    equipment.rcAvailable ||
    (equipment.verificationDocuments && equipment.verificationDocuments.length > 0)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/browse"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#34373C] hover:text-[#222428]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center space-x-2">
            {isSaleListing ? (
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#222428] text-[#FCC837] border border-[#34373C]">
                Sale Listing
              </span>
            ) : (
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FCC837] text-[#222428] border border-[#E6B01B]">
                For Rent
              </span>
            )}
            {isVerifiedOwner && (
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#222428] text-[#FCC837] border border-[#FCC837]/40 flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3 text-[#FCC837]" />
                <span>Verified Owner</span>
              </span>
            )}
            <span className="text-xs text-slate-400">
              ID: <code className="font-mono text-[#34373C]">{equipment._id}</code>
            </span>
          </div>
        </div>

        {/* Feedback Toast Notification */}
        {feedbackToast && (
          <div className="mb-4 p-3 rounded-xl bg-[#222428] text-[#FCC837] border border-[#34373C] text-xs font-bold flex items-center justify-between shadow-lg">
            <span>{feedbackToast}</span>
            <button onClick={() => setFeedbackToast('')} className="text-white hover:text-[#FCC837]">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visuals & Machinery Specs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3D Visual Gallery */}
            <div className="bg-white rounded-3xl border border-[#34373C]/15 overflow-hidden shadow-sm">
              <div className="relative h-72 sm:h-96 w-full bg-gradient-to-b from-[#181A1D] to-[#222428] flex items-center justify-center p-6">
                <div
                  className="absolute inset-x-0 bottom-0 h-32 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #FCC837 1px, transparent 1px), linear-gradient(to bottom, #FCC837 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    transform: 'perspective(300px) rotateX(60deg)',
                    transformOrigin: 'bottom center',
                  }}
                />

                <img
                  src={
                    equipment.photos && equipment.photos[activePhoto]
                      ? equipment.photos[activePhoto]
                      : getIllustrationForEquipment(equipment)
                  }
                  alt={equipment.name}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getIllustrationForEquipment(equipment);
                  }}
                />

                <div className="absolute top-4 left-4 bg-[#FCC837] text-[#222428] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md border border-[#E6B01B]">
                  {equipment.brand} • {equipment.model}
                </div>

                <div className="absolute top-4 right-4 bg-[#222428]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-[#34373C]">
                  {equipment.year ? `Year ${equipment.year}` : 'Active Fleet'}
                </div>
              </div>
            </div>

            {/* Machinery Specifications & Overview */}
            <div className="bg-white rounded-2xl p-6 border border-[#34373C]/15 shadow-sm space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FCC837] bg-[#222428] px-2.5 py-0.5 rounded-md">
                    {equipment.categoryId?.name || 'Machinery'}
                  </span>
                  <span className="text-xs text-[#34373C]/60">•</span>
                  <span className="text-xs font-semibold text-[#34373C]/80 capitalize">
                    Condition: {equipment.condition?.replace('_', ' ') || 'Good'}
                  </span>
                  {distanceKm && (
                    <>
                      <span className="text-xs text-[#34373C]/60">•</span>
                      <span className="text-xs font-bold text-[#222428] bg-[#FCC837]/20 border border-[#FCC837]/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-[#222428]" />
                        <span>{distanceKm} km from your project site</span>
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#222428] tracking-tight">
                  {equipment.name}
                </h1>

                <div className="mt-2 flex items-center text-xs text-[#34373C] space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#FCC837] shrink-0" />
                  <span>
                    Yard Location: {equipment.address?.area || equipment.address?.street}, {equipment.address?.city}, {equipment.address?.state} (Radius: {equipment.deliveryRadiusKm || 50} km)
                  </span>
                </div>
              </div>

              {/* Machinery Key Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                  <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">Make / Brand</span>
                  <div className="text-sm font-black text-[#222428] mt-0.5">{equipment.brand}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                  <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">Model</span>
                  <div className="text-sm font-black text-[#222428] mt-0.5">{equipment.model}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                  <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">Operating Hours</span>
                  <div className="text-sm font-black text-[#222428] mt-0.5">{equipment.usageHours || '0'} hrs</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                  <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">RC &amp; Verification</span>
                  <div className="text-sm font-black text-[#222428] mt-0.5">
                    {equipment.rcAvailable ? 'RC Available' : 'Under Process'}
                  </div>
                </div>
              </div>

              {/* Capabilities & Description */}
              <div className="pt-4 border-t border-[#34373C]/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#222428] mb-2">
                  Machinery Capabilities &amp; Description
                </h3>
                <p className="text-sm text-[#34373C] leading-relaxed whitespace-pre-line">
                  {equipment.description}
                </p>
              </div>

              {/* Rental Rates Matrix (If not pure sale) */}
              {!isSaleListing && (
                <div className="pt-4 border-t border-[#34373C]/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#222428] mb-3">
                    Rental Rates Matrix
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/15">
                      <span className="text-[11px] font-semibold text-[#34373C]/70 uppercase">Daily Rate</span>
                      <div className="text-lg font-black text-[#222428] mt-0.5">
                        ₹{equipment.dailyRate?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/15">
                      <span className="text-[11px] font-semibold text-[#34373C]/70 uppercase">Hourly Rate</span>
                      <div className="text-lg font-black text-[#222428] mt-0.5">
                        {equipment.hourlyRate ? `₹${equipment.hourlyRate}` : 'Contact'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/15">
                      <span className="text-[11px] font-semibold text-[#34373C]/70 uppercase">Monthly Rate</span>
                      <div className="text-lg font-black text-[#222428] mt-0.5">
                        {equipment.monthlyRate ? `₹${equipment.monthlyRate.toLocaleString('en-IN')}` : 'Inquire'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/15">
                      <span className="text-[11px] font-semibold text-[#34373C]/70 uppercase">Security Deposit</span>
                      <div className="text-lg font-black text-[#222428] mt-0.5">
                        {equipment.securityDeposit ? `₹${equipment.securityDeposit.toLocaleString('en-IN')}` : '₹0'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Equipment Owner Profile / Contact Unlock Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#34373C]/15 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center font-black border border-[#E6B01B] text-lg">
                    {unlockedOwnerData?.name?.charAt(0) || equipment.ownerId?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-[#222428] text-base">
                        {contactUnlocked
                          ? unlockedOwnerData?.name || equipment.ownerId?.name || 'STORENT Fleet Partner'
                          : `${(equipment.ownerId?.name || 'Owner').slice(0, 2)}**** (Contact Locked)`}
                      </h4>
                      {isVerifiedOwner && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center space-x-1">
                          <ShieldCheck className="h-3 w-3 text-[#FCC837]" />
                          <span>Verified Owner</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#34373C]/70 mt-0.5">
                      STORENT Equipment Partner • Yard in {equipment.address?.city}, {equipment.address?.state}
                    </p>
                  </div>
                </div>

                {/* Contact Buttons (Unlocked vs Locked) */}
                {contactUnlocked ? (
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={handleCallOwner}
                      className="px-4 py-2.5 rounded-xl bg-[#222428] text-white hover:bg-[#34373C] font-bold flex items-center space-x-1.5 transition border border-[#34373C]"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#FCC837]" />
                      <span>Call {effectivePhone}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppOwner()}
                      className="px-4 py-2.5 rounded-xl bg-[#222428] text-[#FCC837] hover:bg-[#34373C] font-bold flex items-center space-x-1.5 transition border border-[#34373C]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUnlockModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider transition border border-[#E6B01B] shadow-md flex items-center space-x-1.5"
                  >
                    <Lock className="h-4 w-4 text-[#222428]" />
                    <span>Unlock Owner Contact (Free OTP)</span>
                  </button>
                )}
              </div>

              {/* Owner Alert Dispatched Banner */}
              {contactUnlocked && ownerAlertDispatched && (
                <div className="p-3 bg-[#FCC837]/15 rounded-xl border border-[#FCC837]/40 text-xs text-[#222428] flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#222428] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong>Owner Alert Dispatched via SMS:</strong>
                    <p className="text-[#34373C] text-[11px]">
                      An automated SMS alert was dispatched to the equipment owner notifying them of your inquiry. You may call or message them on WhatsApp directly.
                    </p>
                  </div>
                </div>
              )}

              {/* Hirer Review & Rating Prompt */}
              {contactUnlocked && !ratingSubmitted && (
                <div className="pt-3 border-t border-[#34373C]/10 text-xs">
                  <span className="font-bold text-[#222428] block mb-2">
                    Rate your contact experience with this equipment owner:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRateOwner('responsive')}
                      className="px-3 py-1.5 rounded-lg border border-[#34373C]/20 hover:border-[#FCC837] hover:bg-[#FCC837]/10 text-[#222428] font-bold flex items-center space-x-1 text-[11px] transition"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 text-[#222428]" />
                      <span>Responsive &amp; Helpful</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateOwner('incorrect_details')}
                      className="px-3 py-1.5 rounded-lg border border-[#34373C]/20 hover:border-red-400 hover:bg-red-50 text-[#34373C] font-semibold flex items-center space-x-1 text-[11px] transition"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Incorrect Listing Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateOwner('no_response')}
                      className="px-3 py-1.5 rounded-lg border border-[#34373C]/20 hover:border-slate-400 hover:bg-slate-50 text-[#34373C] font-semibold flex items-center space-x-1 text-[11px] transition"
                    >
                      <PhoneOff className="h-3.5 w-3.5 text-slate-500" />
                      <span>Did Not Answer Phone</span>
                    </button>
                  </div>
                </div>
              )}

              {ratingSubmitted && (
                <div className="pt-2 text-xs text-green-700 font-bold flex items-center space-x-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                  <span>Feedback recorded! Thank you for keeping STORENT authentic.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Action Box (Rental Estimate OR Direct Purchase) (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 bg-white rounded-2xl p-6 border border-[#34373C]/15 shadow-xl space-y-5">
              {/* SALE LISTING ACTION BOX */}
              {isSaleListing ? (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-[#34373C]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#34373C]/70 uppercase">Expected Selling Price</span>
                      <span className="text-[10px] font-black bg-[#FCC837] text-[#222428] px-2 py-0.5 rounded-full border border-[#E6B01B]">
                        {equipment.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-3xl font-black text-[#222428]">
                        ₹{equipment.salePrice ? Number(equipment.salePrice).toLocaleString('en-IN') : 'Contact for Price'}
                      </span>
                    </div>
                    <p className="text-xs text-[#34373C]/70 mt-1">
                      Direct sale deal • No brokerage or middleman commission
                    </p>
                  </div>

                  {/* Highlights checklist */}
                  <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-[#34373C]/10 text-xs space-y-2">
                    <div className="font-bold text-[#222428] pb-1 border-b border-[#34373C]/10">
                      Machine Highlights
                    </div>
                    <div className="flex items-center justify-between text-[#34373C]">
                      <span>Operating Hours:</span>
                      <strong>{equipment.usageHours || '0'} hrs</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#34373C]">
                      <span>Registration (RC):</span>
                      <strong className={equipment.rcAvailable ? 'text-green-700' : 'text-slate-500'}>
                        {equipment.rcAvailable ? '✓ Original RC Available' : 'Under Process'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[#34373C]">
                      <span>Interstate NOC:</span>
                      <strong className={equipment.nocAvailable ? 'text-green-700' : 'text-slate-500'}>
                        {equipment.nocAvailable ? '✓ NOC Ready' : 'Pending'}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    {contactUnlocked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setOfferModalOpen(true)}
                          className="w-full py-3.5 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B]"
                        >
                          <Tag className="h-4 w-4" />
                          <span>Make an Offer to Seller</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppOwner()}
                          className="w-full py-3 px-4 rounded-xl bg-[#222428] hover:bg-[#34373C] text-[#FCC837] font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-2 border border-[#34373C]"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Chat on WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCallOwner}
                          className="w-full py-3 px-4 rounded-xl border border-[#34373C]/30 text-[#222428] hover:bg-[#F8F9FA] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
                        >
                          <Phone className="h-4 w-4 text-[#222428]" />
                          <span>Call {effectivePhone}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUnlockModalOpen(true)}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B]"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Unlock Seller Contact Details</span>
                      </button>
                    )}
                  </div>

                  {/* Safe Harbor Notice */}
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#34373C]/10 text-[11px] text-[#34373C] space-y-1">
                    <div className="font-bold text-[#222428] flex items-center space-x-1">
                      <Scale className="h-3.5 w-3.5 text-[#FCC837]" />
                      <span>Safe Harbor Notice</span>
                    </div>
                    <p className="leading-relaxed">
                      Independent physical inspection and document verification are mandatory prior to financial payment.
                    </p>
                  </div>
                </div>
              ) : (
                /* RENTAL LISTING ACTION BOX */
                <div className="space-y-5">
                  <div className="pb-4 border-b border-[#34373C]/10">
                    <span className="text-xs font-semibold text-[#34373C]/70 uppercase">Daily Rental Rate</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-[#222428]">
                        ₹{equipment.dailyRate?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#34373C]/70">/day</span>
                    </div>
                  </div>

                  {/* Rental Cost Calculator */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#34373C] mb-1">Start Date</label>
                        <input
                          type="date"
                          min={today}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#34373C]/20 text-xs focus:border-[#FCC837] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#34373C] mb-1">End Date</label>
                        <input
                          type="date"
                          min={startDate}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#34373C]/20 text-xs focus:border-[#FCC837] outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#34373C]/10 text-xs space-y-1.5 text-[#34373C]">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <strong>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Hire ({rentalDays}d × ₹{equipment.dailyRate}):</span>
                        <strong>₹{rentalBaseFee.toLocaleString('en-IN')}</strong>
                      </div>
                      {securityDeposit > 0 && (
                        <div className="flex justify-between">
                          <span>Refundable Deposit:</span>
                          <strong>₹{securityDeposit.toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-[#34373C]/10 flex justify-between font-black text-[#222428]">
                        <span>Estimated Total:</span>
                        <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    {contactUnlocked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppOwner()}
                          className="w-full py-3.5 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B]"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Chat on WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCallOwner}
                          className="w-full py-3 px-4 rounded-xl bg-[#222428] hover:bg-[#34373C] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-2 border border-[#34373C]"
                        >
                          <Phone className="h-4 w-4 text-[#FCC837]" />
                          <span>Call Owner Directly</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUnlockModalOpen(true)}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B]"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Unlock Owner Contact Details</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                    STORENT operates solely as an Intermediary Listing Directory under Section 79 IT Act, 2000. Renters coordinate directly with equipment owners.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HIRER MOBILE OTP CONTACT UNLOCK MODAL */}
        {unlockModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#34373C]/20 relative">
              <button
                type="button"
                onClick={() => setUnlockModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2 pb-3 border-b border-[#34373C]/10 mb-4">
                <div className="p-2 rounded-xl bg-[#FCC837] text-[#222428]">
                  <Unlock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#222428]">
                    Unlock Owner Contact Details
                  </h3>
                  <p className="text-[11px] text-[#34373C]/70">
                    Verify mobile OTP to access direct phone &amp; WhatsApp
                  </p>
                </div>
              </div>

              {unlockError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{unlockError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndUnlock} className="space-y-4">
                {/* Mobile Number Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                    Your Mobile Number *
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-[#34373C]/60">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={hirerPhone.replace('+91', '').trim()}
                        onChange={(e) => setHirerPhone(e.target.value)}
                        className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none font-semibold text-[#222428]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpCountdown > 0}
                      className="px-3.5 py-2.5 rounded-xl bg-[#222428] text-white hover:bg-[#34373C] text-xs font-bold transition shrink-0 disabled:opacity-50"
                    >
                      {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <div className="mt-1.5 text-[11px] text-green-700 font-semibold flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-700" />
                      <span>OTP sent to your phone! (Demo testing OTP: <strong>123456</strong>)</span>
                    </div>
                  )}
                </div>

                {/* OTP Verification Input */}
                {otpSent && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Enter 6-Digit OTP *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={hirerOtp}
                      onChange={(e) => setHirerOtp(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#34373C]/30 text-base font-black tracking-widest text-center focus:border-[#FCC837] outline-none"
                    />
                  </div>
                )}

                {/* Mandatory Acceptance Checkbox */}
                <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#34373C]/15 text-[11px] text-[#34373C] space-y-2">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 mt-0.5 accent-[#222428] rounded shrink-0 cursor-pointer"
                    />
                    <span className="leading-relaxed">
                      I agree to the{' '}
                      <Link to="/safe-harbor" target="_blank" className="font-bold text-[#222428] underline">
                        Terms of Service, &quot;As-Is&quot; Disclaimer &amp; Intermediary Safe Harbor Policy
                      </Link>{' '}
                      under Section 79 of the IT Act, 2000. I acknowledge that STORENT does not inspect machines or process payments, and independent verification is mandatory.
                    </span>
                  </label>
                </div>

                {/* Action CTA */}
                <button
                  type="submit"
                  disabled={unlocking || !termsAccepted || (!otpSent && !hirerOtp)}
                  className="w-full py-3.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B] disabled:opacity-50"
                >
                  {unlocking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#222428]" />
                      <span>Verifying &amp; Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 text-[#222428]" />
                      <span>Verify &amp; Unlock Contact Details</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MAKE AN OFFER MODAL (BUY MODE) */}
        {offerModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#34373C]/20 relative">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2 pb-3 border-b border-[#34373C]/10 mb-4">
                <Tag className="h-5 w-5 text-[#FCC837]" />
                <h3 className="text-lg font-black text-[#222428]">
                  Make an Offer to Seller
                </h3>
              </div>

              {offerSent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center mx-auto font-black">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-black text-[#222428]">Offer Prepared &amp; Opened on WhatsApp!</h4>
                  <p className="text-xs text-[#34373C]/70">
                    Your offer of ₹{Number(offerAmount).toLocaleString('en-IN')} has been forwarded to the seller.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendOffer} className="space-y-4">
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#34373C]/10 text-xs">
                    <div className="text-[#34373C]">Equipment: <strong>{equipment.name}</strong></div>
                    <div className="text-[#34373C] mt-0.5">
                      Seller Asking Price: <strong>₹{Number(equipment.salePrice || 0).toLocaleString('en-IN')}</strong>{' '}
                      {equipment.isNegotiable && <span className="text-green-700 font-bold">(Negotiable)</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Your Offer Amount (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                      <input
                        type="number"
                        required
                        min="1000"
                        placeholder="e.g. 2650000"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="Contractor Name"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#34373C]/30 text-xs focus:border-[#FCC837] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                        Your Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91..."
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#34373C]/30 text-xs focus:border-[#FCC837] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Message / Terms for Seller (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Can do yard inspection tomorrow. Ready for immediate deal upon verification..."
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#34373C]/30 text-xs focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B]"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Offer on WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferModalOpen(false)}
                      className="py-3 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
