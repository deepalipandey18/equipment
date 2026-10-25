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

  // For listings with both rent & sale, tab selection: 'rent' | 'buy'
  const [activeActionTab, setActiveActionTab] = useState('rent');

  // Make an Offer Modal State (OLX Buy mode)
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [offerSent, setOfferSent] = useState(false);

  // Auto-request current location on initial mount if available
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

  // Distance calculator
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

    const R = 6371; // Earth radius in km
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

  // Booking Calculator State (Rent Mode)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [needOperator, setNeedOperator] = useState(true);

  // Submission state
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/equipment/${id}`);
        if (res.data?.success) {
          const eq = res.data.data;
          setEquipment(eq);
          if (eq.listingType === 'sale') {
            setActiveActionTab('buy');
          } else {
            setActiveActionTab('rent');
          }
          if (eq.salePrice) {
            setOfferAmount(Math.round(eq.salePrice * 0.95).toString()); // 5% below asking as default offer hint
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

    fetchEquipmentDetails();
  }, [id]);

  // Pricing calculations
  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const rentalDays = calculateDays();
  const rentalBaseFee = (equipment?.dailyRate || 0) * rentalDays;
  const deliveryFee = equipment?.deliveryCharges || 0;
  const securityDeposit = equipment?.securityDeposit || 0;
  const estimatedTotal = rentalBaseFee + deliveryFee + securityDeposit;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      navigate(`/login?redirect=/equipment/${id}`);
      return;
    }

    if (equipment.ownerId?._id === user._id || equipment.ownerId === user._id) {
      setBookingError('You are the registered owner of this machine. You cannot rent your own equipment.');
      return;
    }

    setSubmittingBooking(true);

    try {
      const res = await api.post('/bookings', {
        equipmentId: equipment._id,
        startDate,
        endDate,
        operatorRequested: needOperator,
        deliveryAddress: {
          city: equipment.address?.city || '',
          state: equipment.address?.state || '',
        },
      });

      if (res.data?.success) {
        setBookingSuccess(res.data.data);
      } else {
        throw new Error(res.data?.message || 'Booking submission failed.');
      }
    } catch (err) {
      setBookingError(
        err.userMessage || err.response?.data?.message || err.message || 'Booking request failed.'
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  // WhatsApp Seller Handler
  const handleWhatsAppSeller = (customMsg = '') => {
    const phone = (equipment?.sellerWhatsApp || equipment?.sellerContactPhone || equipment?.ownerId?.phone || '').replace(/[^0-9]/g, '');
    const defaultMsg = `Hello! I saw your heavy machinery listing for "${equipment?.name}" on STORENT (${window.location.href}). I am interested in purchasing this equipment.`;
    const text = encodeURIComponent(customMsg || defaultMsg);
    const targetPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  const handleCallSeller = () => {
    const phone = equipment?.sellerContactPhone || equipment?.sellerWhatsApp || equipment?.ownerId?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Seller phone number is not available.');
    }
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    const formattedOffer = Number(offerAmount).toLocaleString('en-IN');
    const msg = `Hello! I would like to make an offer of ₹${formattedOffer} for your machinery "${equipment?.name}" on STORENT. Message: ${offerMessage || 'I am ready for immediate yard inspection.'} - Buyer: ${buyerName || 'Interested Contractor'} (${buyerPhone || 'Contact provided'})`;
    handleWhatsAppSeller(msg);
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
  const isRentListing = equipment.listingType !== 'sale';

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
                Sale Marketplace
              </span>
            ) : (
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FCC837] text-[#222428] border border-[#E6B01B]">
                Available For Rent
              </span>
            )}
            <span className="text-xs text-slate-400">
              ID: <code className="font-mono text-[#34373C]">{equipment._id}</code>
            </span>
          </div>
        </div>

        {/* Hero Machinery Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photos & Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Photo Gallery Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#34373C]/15 shadow-sm space-y-3">
              <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#F8F9FA] to-[#ECEEF0]">
                <img
                  src={
                    equipment.photos?.[activePhoto] &&
                    !equipment.photos[activePhoto].includes('unsplash.com') &&
                    !equipment.photos[activePhoto].includes('placeholder')
                      ? equipment.photos[activePhoto]
                      : getIllustrationForEquipment(equipment)
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getIllustrationForEquipment(equipment);
                  }}
                  alt={equipment.name}
                  className="w-full h-full object-contain p-4 drop-shadow-md"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
                  <span className="bg-[#222428]/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {equipment.categoryId?.name || 'Heavy Equipment'}
                  </span>
                  {isSaleListing && (
                    <span className="bg-[#FCC837] text-[#222428] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#E6B01B]">
                      Verified for Sale
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 bg-[#FCC837] text-[#222428] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-[#E6B01B]">
                  {equipment.condition} Condition
                </div>
              </div>

              {/* Thumbnails */}
              {equipment.photos?.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {equipment.photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`h-16 w-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activePhoto === i ? 'border-[#FCC837] ring-2 ring-[#FCC837]/30' : 'border-slate-200'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-contain p-2 bg-[#F8F9FA]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Technical Specs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#34373C]/15 shadow-sm space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#34373C] flex items-center justify-between">
                  <span>{equipment.brand} • {equipment.model}</span>
                  {equipment.usageHours > 0 && (
                    <span className="text-xs font-black text-[#222428] bg-slate-100 px-2 py-0.5 rounded">
                      ⏱️ {equipment.usageHours} Operating Hours
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#222428] mt-1">
                  {equipment.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#34373C]">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1 text-[#222428] font-semibold">
                      <MapPin className="h-4 w-4 text-[#222428] shrink-0" />
                      <span>
                        {equipment.address?.city}, {equipment.address?.state} (Pincode: {equipment.address?.pincode})
                      </span>
                    </div>

                    {/* Distance Badge next to address */}
                    {distanceKm !== null ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FCC837]/20 text-[#222428] font-bold text-xs border border-[#FCC837]/50">
                        <Navigation className="h-3 w-3 text-[#222428] fill-[#222428] rotate-45" />
                        <span>{distanceKm} km from your location</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={requestUserLocation}
                        disabled={locating}
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-[#FCC837]/20 text-[#34373C] text-xs font-semibold border border-slate-200 transition"
                      >
                        <Navigation className={`h-3 w-3 ${locating ? 'animate-spin' : ''}`} />
                        <span>{locating ? 'Acquiring GPS...' : 'Check distance from you'}</span>
                      </button>
                    )}
                  </div>

                  {equipment.year && <span>• Mfg Year: {equipment.year}</span>}
                  <span>• Service / Delivery Radius: Within {equipment.deliveryRadiusKm || 50} km</span>
                </div>
              </div>

              {/* Machinery Sale Specifications Grid (Shown if sale) */}
              {isSaleListing && (
                <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-[#34373C]/15 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#34373C]/10">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-[#222428]" />
                      <h3 className="text-sm font-black text-[#222428] uppercase tracking-wider">
                        Machinery Overview & Document Status
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-[#222428] text-[#FCC837] px-2 py-0.5 rounded">
                      Direct Seller Deal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                      <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">Asking Price</span>
                      <div className="text-base font-black text-[#222428] mt-0.5">
                        ₹{equipment.salePrice ? Number(equipment.salePrice).toLocaleString('en-IN') : 'Contact'}
                      </div>
                      <span className="text-[10px] font-bold text-green-700">
                        {equipment.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                      <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">Operating Hours</span>
                      <div className="text-base font-black text-[#222428] mt-0.5">
                        {equipment.usageHours ? `${equipment.usageHours} hrs` : 'N/A'}
                      </div>
                      <span className="text-[10px] text-[#34373C]/70">Meter verified</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                      <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">Ownership</span>
                      <div className="text-base font-black text-[#222428] mt-0.5">
                        {equipment.ownershipType === 'first_owner'
                          ? '1st Owner'
                          : equipment.ownershipType === 'second_owner'
                          ? '2nd Owner'
                          : '3rd+ Owner'}
                      </div>
                      <span className="text-[10px] text-[#34373C]/70">Registered</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#34373C]/10">
                      <span className="text-[10px] font-bold text-[#34373C]/70 uppercase">RC & Documents</span>
                      <div className="text-sm font-black text-[#222428] mt-0.5">
                        {equipment.rcAvailable ? 'RC Available' : 'RC Pending'}
                      </div>
                      <span className="text-[10px] font-bold text-green-700">
                        {equipment.nocAvailable ? 'NOC Ready' : 'NOC on demand'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pt-4 border-t border-[#34373C]/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#222428] mb-2">
                  Machinery Capabilities & Description
                </h3>
                <p className="text-sm text-[#34373C] leading-relaxed whitespace-pre-line">
                  {equipment.description}
                </p>
              </div>

              {/* Rates Matrix (Shown if not pure sale) */}
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

              {/* Operator Terms (For rental or both) */}
              {!isSaleListing && (
                <div className="pt-4 border-t border-[#34373C]/10 flex items-center space-x-3 text-xs text-[#34373C]">
                  <ShieldCheck className="h-5 w-5 text-[#222428] shrink-0" />
                  <div>
                    <strong>Operator Status:</strong>{' '}
                    <span className="capitalize">
                      {equipment.operatorOption === 'included'
                        ? 'Certified Operator Included in Rental Rate'
                        : equipment.operatorOption === 'optional'
                        ? 'Certified Operator Available Upon Request'
                        : 'Dry Hire Only (Renter provides certified operator)'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Equipment Owner / Seller Profile */}
            <div className="bg-white rounded-2xl p-6 border border-[#34373C]/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center font-black border border-[#E6B01B] text-lg">
                  {equipment.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-[#222428] text-base">
                      {equipment.ownerId?.name || 'Machinery Owner'}
                    </h4>
                    <span className="px-2 py-0.2 rounded text-[10px] font-black bg-[#222428] text-[#FCC837] border border-[#34373C]">
                      Verified Seller
                    </span>
                  </div>
                  <p className="text-xs text-[#34373C]/70 mt-0.5">
                    STORENT Equipment Partner • Verified yard address & fleet inventory
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={handleCallSeller}
                  className="px-3.5 py-2 rounded-lg bg-[#222428] text-white hover:bg-[#34373C] font-bold flex items-center space-x-1.5 transition border border-[#34373C]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#FCC837]" />
                  <span>Call Seller</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppSeller()}
                  className="px-3.5 py-2 rounded-lg bg-[#222428] text-[#FCC837] hover:bg-[#34373C] font-bold flex items-center space-x-1.5 transition border border-[#34373C]"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Action Box (Rental Booking OR Direct Buy) (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 bg-white rounded-2xl p-6 border border-[#34373C]/15 shadow-xl space-y-5">
              {/* BUY EQUIPMENT ACTION BOX (For Sale Listings) */}
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
                      <span>Ownership:</span>
                      <strong>{equipment.ownershipType === 'first_owner' ? '1st Owner' : '2nd+ Owner'}</strong>
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

                  {/* Direct Contact CTAs */}
                  <div className="space-y-2.5">
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
                      onClick={() => handleWhatsAppSeller()}
                      className="w-full py-3 px-4 rounded-xl bg-[#222428] hover:bg-[#34373C] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-2 border border-[#34373C]"
                    >
                      <MessageSquare className="h-4 w-4 text-[#FCC837]" />
                      <span>Chat on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCallSeller}
                      className="w-full py-3 px-4 rounded-xl border-2 border-[#34373C]/20 hover:border-[#FCC837] text-[#222428] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
                    >
                      <Phone className="h-4 w-4 text-[#222428]" />
                      <span>Call {equipment.sellerContactPhone || equipment.ownerId?.phone || 'Seller'}</span>
                    </button>
                  </div>

                  {/* Safety Advice */}
                  <div className="p-3 bg-[#FCC837]/15 rounded-xl border border-[#FCC837]/40 text-[11px] text-[#222428] space-y-1">
                    <div className="font-bold flex items-center space-x-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#222428]" />
                      <span>STORENT Buyer Protection Tips</span>
                    </div>
                    <p className="leading-relaxed">
                      Visit the machinery yard in {equipment.address?.city || 'site'} to physically inspect hydraulics, engine, and tracks/tyres before finalizing payment.
                    </p>
                  </div>
                </div>
              ) : (
                /* RENTAL BOOKING FORM */
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

                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Booking Request Form */}
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                        Rental Start Date
                      </label>
                      <input
                        type="date"
                        required
                        min={today}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                        Rental End Date
                      </label>
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                      />
                    </div>

                    {equipment.operatorOption === 'optional' && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-[#34373C]/15 text-xs">
                        <span className="font-semibold text-[#34373C]">Request Certified Operator</span>
                        <input
                          type="checkbox"
                          checked={needOperator}
                          onChange={(e) => setNeedOperator(e.target.checked)}
                          className="h-4 w-4 accent-[#222428] rounded"
                        />
                      </div>
                    )}

                    {/* Estimate Breakdown */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-[#34373C]/15 text-xs space-y-2">
                      <div className="font-bold text-[#222428] pb-1 border-b border-[#34373C]/10">
                        Pricing Breakdown ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})
                      </div>
                      <div className="flex justify-between text-[#34373C]">
                        <span>Base Rental ({rentalDays}d × ₹{equipment.dailyRate}):</span>
                        <span>₹{rentalBaseFee.toLocaleString('en-IN')}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-[#34373C]">
                          <span>Transport & Delivery:</span>
                          <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {securityDeposit > 0 && (
                        <div className="flex justify-between text-[#34373C]">
                          <span>Refundable Security Deposit:</span>
                          <span>₹{securityDeposit.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-[#34373C]/10 flex justify-between font-black text-[#222428] text-sm">
                        <span>Total Payable:</span>
                        <span className="text-[#222428] font-black">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B] disabled:opacity-60"
                    >
                      {submittingBooking ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#222428]" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          <span>Submit Rental Request</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Submitting a request does not charge your card immediately. The machine owner will review and confirm availability.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAKE AN OFFER MODAL (OLX BUY MODE) */}
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
                  <h4 className="text-base font-black text-[#222428]">Offer Prepared & Opened on WhatsApp!</h4>
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
                    {offerAmount && (
                      <p className="text-[11px] text-[#34373C]/70 mt-1">
                        Offer: <strong>₹{Number(offerAmount).toLocaleString('en-IN')}</strong>
                      </p>
                    )}
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
                      placeholder="e.g. Can do site inspection tomorrow. Ready to pay 10% advance upon verification..."
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

        {/* Phase 5 Interactive Confirmation Modal */}
        {bookingSuccess && (
          <div className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-[#34373C]/20">
              <div className="h-14 w-14 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center mx-auto mb-4 font-black">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-[#222428]">Rental Request Submitted!</h3>
              <p className="text-xs text-[#34373C]/80 mt-2">
                Your request to hire <strong>{equipment.name}</strong> has been delivered to the equipment owner.
              </p>

              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-[#34373C]/10 text-xs text-[#34373C] text-left space-y-1">
                <div>
                  <strong>Booking ID:</strong> <span className="font-mono">{bookingSuccess._id}</span>
                </div>
                <div>
                  <strong>Dates:</strong> {new Date(bookingSuccess.startDate).toLocaleDateString()} to {new Date(bookingSuccess.endDate).toLocaleDateString()} ({bookingSuccess.rentalDurationDays} days)
                </div>
                <div>
                  <strong>Total Amount:</strong> ₹{(bookingSuccess.pricingBreakdown?.totalAmountPaise / 100).toLocaleString('en-IN')}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className="font-bold text-[#222428] bg-[#FCC837]/20 border border-[#FCC837]/40 px-2 py-0.5 rounded">
                    {bookingSuccess.bookingStatus} (Awaiting Owner Review)
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider transition border border-[#E6B01B]"
                >
                  Track in My Bookings
                </button>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="w-full py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
