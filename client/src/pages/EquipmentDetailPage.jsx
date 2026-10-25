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

  // Booking Calculator State
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
          setEquipment(res.data.data);
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <p className="text-sm text-slate-500 font-medium">Loading machinery specifications...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Equipment Not Found'}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested machinery listing may have been paused or removed.
        </p>
        <Link
          to="/browse"
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/browse"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Link>

          <span className="text-xs text-slate-400">
            Listing ID: <code className="font-mono text-slate-600">{equipment._id}</code>
          </span>
        </div>

        {/* Hero Machinery Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photos & Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Photo Gallery Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={equipment.photos?.[activePhoto] && !equipment.photos[activePhoto].includes('unsplash.com') && !equipment.photos[activePhoto].includes('placeholder') ? equipment.photos[activePhoto] : getIllustrationForEquipment(equipment)} onError={(e) => { e.target.onerror = null; e.target.src = getIllustrationForEquipment(equipment); }}
                  alt={equipment.name}
                  className="w-full h-full object-contain p-4 bg-[#F8F9FA]"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {equipment.categoryId?.name || 'Heavy Equipment'}
                </div>
                <div className="absolute top-4 right-4 bg-[#FCC837] text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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
                      <img src={photo} alt="" className="w-full h-full object-contain p-4 bg-[#F8F9FA]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Technical Specs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {equipment.brand} • {equipment.model}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {equipment.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                      <MapPin className="h-4 w-4 text-slate-900 shrink-0" />
                      <span>
                        {equipment.address?.city}, {equipment.address?.state} (Pincode: {equipment.address?.pincode})
                      </span>
                    </div>

                    {/* Distance Badge next to address */}
                    {distanceKm !== null ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FCC837]/20 text-slate-950 font-bold text-xs border border-[#FCC837]/50">
                        <Navigation className="h-3 w-3 text-slate-950 fill-slate-950 rotate-45" />
                        <span>{distanceKm} km from your location</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={requestUserLocation}
                        disabled={locating}
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 text-xs font-semibold border border-slate-200 hover:border-brand-200 transition"
                      >
                        <Navigation className={`h-3 w-3 ${locating ? 'animate-spin' : ''}`} />
                        <span>{locating ? 'Acquiring GPS...' : 'Check distance from you'}</span>
                      </button>
                    )}
                  </div>

                  {equipment.year && <span>• Mfg Year: {equipment.year}</span>}
                  <span>• Service Area: Within {equipment.deliveryRadiusKm || 50} km</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Machinery Capabilities & Description
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {equipment.description}
                </p>
              </div>

              {/* Rates Matrix */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Rental Rates Matrix
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Daily Rate</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ₹{equipment.dailyRate?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Hourly Rate</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {equipment.hourlyRate ? `₹${equipment.hourlyRate}` : 'Contact'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly Rate</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {equipment.monthlyRate ? `₹${equipment.monthlyRate.toLocaleString('en-IN')}` : 'Inquire'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Security Deposit</span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {equipment.securityDeposit ? `₹${equipment.securityDeposit.toLocaleString('en-IN')}` : '₹0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Operator Terms */}
              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3 text-xs text-slate-700">
                <ShieldCheck className="h-5 w-5 text-slate-900 shrink-0" />
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
            </div>

            {/* Equipment Owner Profile */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200 text-lg">
                  {equipment.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-base">{equipment.ownerId?.name || 'Machine Owner'}</h4>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#FCC837] text-slate-950">
                      Verified Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    STORENT Verified Fleet Partner • Fast response on rental requests
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-900" />
                  <span>{equipment.ownerId?.phone || '+91 Verified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Request Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase">Daily Rate</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{equipment.dailyRate?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">/day</span>
                </div>
              </div>

              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Booking Request Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rental Start Date
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-[#FCC837] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rental End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-[#FCC837] outline-none"
                  />
                </div>

                {equipment.operatorOption === 'optional' && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Request Operator</span>
                    <input
                      type="checkbox"
                      checked={needOperator}
                      onChange={(e) => setNeedOperator(e.target.checked)}
                      className="h-4 w-4 text-brand-600 rounded"
                    />
                  </div>
                )}

                {/* Estimate Breakdown */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 pb-1 border-b border-slate-200">
                    Pricing Breakdown ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Base Rental ({rentalDays}d × ₹{equipment.dailyRate}):</span>
                    <span>₹{rentalBaseFee.toLocaleString('en-IN')}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Transport & Delivery:</span>
                      <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {securityDeposit > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Refundable Security Deposit:</span>
                      <span>₹{securityDeposit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                    <span>Total Payable:</span>
                    <span className="text-slate-900 font-black">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 border border-[#E6B01B] disabled:opacity-60"
                >
                  {submittingBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
          </div>
        </div>

        {/* Phase 5 Interactive Confirmation Modal */}
        {bookingSuccess && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-slate-200">
              <div className="h-14 w-14 rounded-full bg-[#FCC837] text-slate-950 flex items-center justify-center mx-auto mb-4 font-black">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Rental Request Submitted!</h3>
              <p className="text-xs text-slate-600 mt-2">
                Your request to hire <strong>{equipment.name}</strong> has been delivered to the equipment owner.
              </p>

              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1">
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
                  className="w-full py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-slate-950 font-black text-xs uppercase tracking-wider transition border border-[#E6B01B]"
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
