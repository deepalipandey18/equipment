import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import InvoiceModal from '../components/common/InvoiceModal';
import LiveEquipmentTrackerModal from '../components/common/LiveEquipmentTrackerModal';
import {
  PlusCircle,
  Search,
  Truck,
  CalendarCheck,
  Inbox,
  Crown,
  CreditCard,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  Trash2,
  MapPin,
  Check,
  X,
  FileText,
  Navigation,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, hasActiveSubscription, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Subscriptions & Quota
  const [subDetails, setSubDetails] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  // Owner Equipment List
  const [myEquipment, setMyEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  // Customer Rentals (As Renter)
  const [myRentals, setMyRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(false);

  // Incoming Booking Requests (As Machine Owner)
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [trackingBooking, setTrackingBooking] = useState(null);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoadingSub(true);
      const res = await api.get('/subscriptions/my');
      if (res.data?.success) {
        setSubDetails(res.data);
      }
    } catch (err) {
      console.warn('Could not load subscription details:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  const fetchMyEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const res = await api.get('/equipment/my');
      if (res.data?.success) {
        setMyEquipment(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load owner equipment:', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const fetchMyRentals = async () => {
    try {
      setLoadingRentals(true);
      const res = await api.get('/bookings/my-rentals');
      if (res.data?.success) {
        setMyRentals(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load rentals:', err);
    } finally {
      setLoadingRentals(false);
    }
  };

  const fetchOwnerRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/bookings/requests-received');
      if (res.data?.success) {
        setOwnerRequests(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load owner requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const refreshAllData = () => {
    if (user) {
      fetchSubscriptionDetails();
      fetchMyEquipment();
      fetchMyRentals();
      fetchOwnerRequests();
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [user]);

  const handleRegisterEquipment = () => {
    if (!hasActiveSubscription) {
      navigate('/plans?reason=subscription_required');
    } else {
      navigate('/equipment/register');
    }
  };

  // Owner toggles machine active/paused
  const handleToggleStatus = async (item) => {
    const nextStatus = item.listingStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await api.patch(`/equipment/${item._id}/status`, {
        status: nextStatus,
      });
      if (res.data?.success) {
        setMyEquipment((prev) =>
          prev.map((eq) => (eq._id === item._id ? { ...eq, listingStatus: nextStatus } : eq))
        );
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update equipment status');
    }
  };

  // Owner deletes equipment
  const handleDeleteEquipment = async (item) => {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" from your listings?`)) {
      return;
    }
    try {
      const res = await api.delete(`/equipment/${item._id}`);
      if (res.data?.success) {
        setMyEquipment((prev) => prev.filter((eq) => eq._id !== item._id));
        fetchSubscriptionDetails();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to delete listing');
    }
  };

  // Owner responds to booking request
  const handleOwnerResponse = async (bookingId, action) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/respond`, {
        action,
        rejectionReason: action === 'reject' ? 'Owner declined request' : '',
      });
      if (res.data?.success) {
        fetchOwnerRequests();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to respond to booking request');
    }
  };

  // Owner updates progress: Handover or Return
  const handleUpdateProgress = async (bookingId, status) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/progress`, {
        status,
        meterHours: 0,
        notes: `Recorded ${status} by machine owner`,
      });
      if (res.data?.success) {
        fetchOwnerRequests();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update progress');
    }
  };

  // Customer executes payment
  const handleInitiatePayment = async (booking) => {
    try {
      const res = await api.post(`/bookings/${booking._id}/create-payment`);
      if (res.data?.success) {
        setPaymentModal({
          booking,
          orderData: res.data.data,
        });
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to initiate payment');
    }
  };

  const handleConfirmRentalPayment = async () => {
    if (!paymentModal) return;
    setProcessingPayment(true);

    try {
      const res = await api.post(`/bookings/${paymentModal.booking._id}/verify-payment`, {
        orderId: paymentModal.orderData.orderId,
        paymentId: `pay_rent_sim_${Date.now()}`,
        signature: `sig_rent_sim_${Date.now()}`,
      });

      if (res.data?.success) {
        setPaymentModal(null);
        fetchMyRentals();
        setSelectedInvoice(res.data.data);
      }
    } catch (err) {
      alert(err.userMessage || 'Payment verification failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const activePlan = subDetails?.subscription?.planId || user?.activeSubscription?.planId;
  const activeRentalsCount = myRentals.filter(
    (r) => r.bookingStatus === 'Ongoing' || r.bookingStatus === 'Confirmed'
  ).length;
  const pendingRequestsCount = ownerRequests.filter((r) => r.bookingStatus === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Welcome & Status Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-2xl border-2 border-brand-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Welcome back, {user?.name || 'User'}
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Dual Account: Rent & List
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center space-x-2">
                  <span>{user?.email}</span>
                  {user?.phone && <span>• {user.phone}</span>}
                </p>
              </div>
            </div>

            {/* Subscription status pill */}
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Subscription Status
                </div>
                <div className="text-sm font-semibold flex items-center space-x-1.5">
                  {hasActiveSubscription && activePlan ? (
                    <>
                      <span className="text-emerald-700 font-bold">{activePlan.name}</span>
                      <span className="text-xs text-slate-500 font-normal">
                        ({myEquipment.length} of {activePlan.listingLimit} slots used)
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-600 font-medium">No active plan</span>
                  )}
                </div>
              </div>
              <Link
                to="/plans"
                className="ml-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition"
              >
                {hasActiveSubscription ? 'Upgrade' : 'Get Plan'}
              </Link>
            </div>
          </div>

          {/* Primary Two Options */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Option A: Register Equipment */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between hover:border-amber-300 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Primary Action A
                  </span>
                  <PlusCircle className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Register Equipment</h3>
                <p className="text-xs text-slate-600 mt-1">
                  List your JCB, crane, generator, or construction machinery for rent and receive bookings.
                </p>
                {!hasActiveSubscription && (
                  <p className="mt-2 text-xs text-amber-800 font-medium flex items-center space-x-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Requires an active subscription plan to list</span>
                  </p>
                )}
                {hasActiveSubscription && (
                  <p className="mt-2 text-xs text-emerald-800 font-medium flex items-center space-x-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      Quota: {myEquipment.length} listed / {activePlan?.listingLimit || 2} allowed
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={handleRegisterEquipment}
                className="mt-4 w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-xs text-slate-950 uppercase tracking-wider transition shadow-sm"
              >
                {hasActiveSubscription ? '+ Open Registration Form' : 'View Plans to Register'}
              </button>
            </div>

            {/* Action Option B: Rent Equipment */}
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Primary Action B
                  </span>
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Rent Equipment</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Browse available heavy machinery near your construction site with real-time GPS radar.
                </p>
              </div>
              <Link
                to="/browse"
                className="mt-4 w-full py-2.5 px-4 text-center rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white uppercase tracking-wider transition shadow-sm"
              >
                Search Machinery Nearby
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: ShieldCheck },
            { id: 'my-equipment', label: `My Equipment (${myEquipment.length})`, icon: Truck },
            { id: 'my-rentals', label: `My Rental Bookings (${myRentals.length})`, icon: CalendarCheck },
            {
              id: 'booking-requests',
              label: `Requests Received (${ownerRequests.length})`,
              badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
              icon: Inbox,
            },
            { id: 'subscriptions', label: 'My Subscriptions', icon: Crown },
            { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[350px]">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Account Activity Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">My Listed Machines</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{myEquipment.length}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {hasActiveSubscription ? `Allowed: ${activePlan?.listingLimit || 2}` : 'Subscription required'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Active Rentals As Customer</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{activeRentalsCount}</div>
                  <div className="text-xs text-slate-400 mt-1">Confirmed or ongoing site rentals</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Pending Requests To Review</div>
                  <div className="text-2xl font-black text-brand-600 mt-1">{pendingRequestsCount}</div>
                  <div className="text-xs text-slate-400 mt-1">Awaiting owner response</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Dual Account Notice:</span> You do not need to switch logins.
                When you list equipment, you act as the machine owner; when you book someone else's machine, you act as the customer.
                All your invoices, earnings, and bookings are tracked right here.
              </div>
            </div>
          )}

          {/* 2. MY EQUIPMENT TAB */}
          {activeTab === 'my-equipment' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Registered Machinery Fleet</h3>
                  <p className="text-xs text-slate-500">
                    Manage active listings, pause machines for maintenance, or register new units.
                  </p>
                </div>
                <button
                  onClick={handleRegisterEquipment}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-xs uppercase tracking-wider text-slate-950 transition flex items-center space-x-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register Equipment</span>
                </button>
              </div>

              {loadingEquipment ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                </div>
              ) : myEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Equipment Listed Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    Register your machines to start receiving booking requests from contractors in your city.
                  </p>
                  <button
                    onClick={handleRegisterEquipment}
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-xs text-slate-950 uppercase tracking-wider transition"
                  >
                    + Register First Machine
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myEquipment.map((item) => (
                    <div
                      key={item._id}
                      className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-slate-300 transition"
                    >
                      <img
                        src={item.photos?.[0] || 'https://via.placeholder.com/300x200'}
                        alt={item.name}
                        className="w-full sm:w-36 h-28 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {item.name}
                            </h4>
                            {(() => {
                              const activeRental = ownerRequests.find(
                                (r) =>
                                  (r.equipmentId?._id === item._id || r.equipmentId === item._id) &&
                                  ['Ongoing', 'Confirmed'].includes(r.bookingStatus)
                              );
                              if (activeRental) {
                                return (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    <span>
                                      {activeRental.bookingStatus === 'Ongoing' ? 'Ongoing on Rent' : 'Booked (Confirmed)'}
                                    </span>
                                  </span>
                                );
                              }
                              return (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    item.listingStatus === 'active'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {item.listingStatus}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                            <span>{item.brand} {item.model}</span>
                            <span>•</span>
                            <span>{item.categoryId?.name || 'Heavy Equipment'}</span>
                          </div>

                          <div className="mt-2 text-xs flex items-center space-x-3 text-slate-700">
                            <div className="font-bold text-brand-600">
                              ₹{item.dailyRate?.toLocaleString('en-IN')}/day
                            </div>
                            <div className="flex items-center space-x-1 text-slate-500">
                              <MapPin className="h-3 w-3" />
                              <span>{item.address?.city}, {item.address?.state}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="inline-flex items-center space-x-1 font-semibold text-slate-600 hover:text-slate-900"
                          >
                            {item.listingStatus === 'active' ? (
                              <>
                                <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                                <span>Pause Listing</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Resume Listing</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteEquipment(item)}
                            className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. MY RENTAL BOOKINGS (Customer View) */}
          {activeTab === 'my-rentals' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Rental Bookings (As Customer)</h3>
                  <p className="text-xs text-slate-500">
                    Track equipment you have requested or hired from other owners.
                  </p>
                </div>
                <Link
                  to="/browse"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-xs uppercase tracking-wider text-white transition flex items-center space-x-1.5"
                >
                  <Search className="h-4 w-4" />
                  <span>Rent More Machines</span>
                </Link>
              </div>

              {loadingRentals ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                </div>
              ) : myRentals.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Rental Bookings Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    Looking for heavy machinery for your project? Search nearby JCBs, cranes, and generators.
                  </p>
                  <Link
                    to="/browse"
                    className="inline-block px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white uppercase tracking-wider transition"
                  >
                    Browse Equipment Marketplace
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRentals.map((booking) => {
                    const totalRupees = (booking.pricingBreakdown?.totalAmountPaise || 0) / 100;
                    return (
                      <div
                        key={booking._id}
                        className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={booking.equipmentId?.photos?.[0] || 'https://via.placeholder.com/300x200'}
                            alt=""
                            className="w-full sm:w-36 h-28 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-base text-slate-900">
                                {booking.equipmentId?.name || 'Machinery'}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  booking.bookingStatus === 'Ongoing'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1'
                                    : booking.bookingStatus === 'Confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : booking.bookingStatus === 'Awaiting Payment'
                                    ? 'bg-amber-100 text-amber-900'
                                    : booking.bookingStatus === 'Completed'
                                    ? 'bg-slate-100 text-slate-800'
                                    : 'bg-yellow-50 text-yellow-800'
                                }`}
                              >
                                {booking.bookingStatus === 'Ongoing' ? (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    <span>Ongoing on Site</span>
                                  </>
                                ) : (
                                  booking.bookingStatus
                                )}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-1">
                              Duration: {new Date(booking.startDate).toLocaleDateString()} to{' '}
                              {new Date(booking.endDate).toLocaleDateString()} ({booking.rentalDurationDays} days)
                            </p>

                            <p className="text-xs text-slate-600 mt-1">
                              Owner: <strong>{booking.ownerId?.name || 'Fleet Owner'}</strong> • {booking.ownerId?.phone}
                            </p>

                            <div className="mt-2 text-xs font-bold text-brand-600">
                              Total Payable: ₹{totalRupees.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Customer Actions */}
                        <div className="flex flex-col justify-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                          {booking.bookingStatus === 'Awaiting Payment' && (
                            <button
                              onClick={() => handleInitiatePayment(booking)}
                              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1.5"
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Pay ₹{totalRupees.toLocaleString('en-IN')} via Razorpay</span>
                            </button>
                          )}

                          {['Confirmed', 'Ongoing', 'Completed'].includes(booking.bookingStatus) && (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setTrackingBooking(booking)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition"
                                title="Live GPS Fleet Telematics Tracker"
                              >
                                <Navigation className="h-3.5 w-3.5 animate-pulse" />
                                <span>Live GPS Tracker</span>
                              </button>
                              <button
                                onClick={() => setSelectedInvoice(booking)}
                                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center space-x-1.5"
                              >
                                <FileText className="h-3.5 w-3.5 text-brand-600" />
                                <span>View Invoice</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. BOOKING REQUESTS RECEIVED (Owner View) */}
          {activeTab === 'booking-requests' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Booking Requests Received (As Machine Owner)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Contractors who have requested your machinery. Accept to enable renter payment.
                  </p>
                </div>
                <button
                  onClick={fetchOwnerRequests}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Refresh incoming requests"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingRequests ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingRequests ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                </div>
              ) : ownerRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Booking Requests Received</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    When contractors in your area request your listed equipment, their requests will appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownerRequests.map((req) => {
                    const totalRupees = (req.pricingBreakdown?.totalAmountPaise || 0) / 100;
                    return (
                      <div
                        key={req._id}
                        className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-base text-slate-900">
                              {req.equipmentId?.name || 'Machinery'}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                req.bookingStatus === 'Ongoing'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1'
                                  : req.bookingStatus === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.bookingStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {req.bookingStatus === 'Ongoing' ? (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                  <span>Ongoing on Site</span>
                                </>
                              ) : (
                                req.bookingStatus
                              )}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 mt-1.5 space-y-0.5">
                            <p>
                              <strong>Renter:</strong> {req.renterId?.name} ({req.renterId?.email} • {req.renterId?.phone})
                            </p>
                            <p>
                              <strong>Period:</strong> {new Date(req.startDate).toLocaleDateString()} to{' '}
                              {new Date(req.endDate).toLocaleDateString()} ({req.rentalDurationDays} days)
                            </p>
                            <p>
                              <strong>Operator:</strong> {req.operatorRequested ? 'Requested by contractor' : 'Standard'}
                            </p>
                            <p className="text-brand-600 font-bold">
                              Rental Value: ₹{totalRupees.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Owner Workflow Actions */}
                        <div className="flex flex-col justify-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                          {req.bookingStatus === 'Pending' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleOwnerResponse(req._id, 'accept')}
                                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Accept Request</span>
                              </button>
                              <button
                                onClick={() => handleOwnerResponse(req._id, 'reject')}
                                className="px-3.5 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-wider flex items-center space-x-1"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}

                          {req.bookingStatus === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateProgress(req._id, 'Ongoing')}
                              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                            >
                              Record Handover (Ongoing)
                            </button>
                          )}

                          {req.bookingStatus === 'Ongoing' && (
                            <button
                              onClick={() => handleUpdateProgress(req._id, 'Completed')}
                              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                            >
                              Record Return (Completed)
                            </button>
                          )}

                          {['Confirmed', 'Ongoing', 'Completed'].includes(req.bookingStatus) && (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setTrackingBooking(req)}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition"
                                title="Live Telematics & Radar Route"
                              >
                                <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Track Machinery</span>
                              </button>
                              <button
                                onClick={() => setSelectedInvoice(req)}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center space-x-1"
                              >
                                <FileText className="h-3.5 w-3.5 text-brand-600" />
                                <span>View Invoice</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. SUBSCRIPTIONS TAB */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Equipment Listing Subscriptions</h3>
                  <p className="text-xs text-slate-500">Manage your subscription plan, payments, and listing limits</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchSubscriptionDetails}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    title="Refresh subscription status"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingSub ? 'animate-spin' : ''}`} />
                  </button>
                  <Link
                    to="/plans"
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase transition"
                  >
                    Upgrade Tier
                  </Link>
                </div>
              </div>

              {hasActiveSubscription && activePlan ? (
                <div className="p-6 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        Active Verified Plan
                      </span>
                      <h4 className="text-xl font-black text-slate-900 mt-2">
                        {activePlan.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Billing: ₹{(activePlan.price / 100).toLocaleString('en-IN')}/
                        {activePlan.billingInterval || 'month'}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-xs text-slate-500 font-medium">Valid Until</div>
                      <div className="text-sm font-bold text-slate-900">
                        {new Date(subDetails?.subscription?.endDate || user.activeSubscription?.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="pt-4 border-t border-emerald-200/60">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Listing Allowance Usage:</span>
                      <span>
                        {myEquipment.length} of {activePlan.listingLimit} machine slots used
                      </span>
                    </div>
                    <div className="w-full h-3 bg-emerald-200/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((myEquipment.length / activePlan.listingLimit) * 100) || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                      <span>
                        Remaining slots: {Math.max(0, activePlan.listingLimit - myEquipment.length)}
                      </span>
                      <span className="text-emerald-700 font-medium">Verified by Backend</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={handleRegisterEquipment}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                    >
                      + Register Equipment Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                  <Crown className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-base font-bold text-slate-800">No Active Subscription Plan</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                    To register equipment on EquipmentHub and receive contractor rental bookings, select a monthly tier.
                  </p>
                  <Link
                    to="/plans"
                    className="inline-block px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                  >
                    Select a Plan (from ₹499/mo)
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 6. PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Profile Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Full Name</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email Address</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Verification Status</span>
                  <p className="text-sm font-bold capitalize text-amber-600 mt-0.5">
                    {user?.verificationStatus || 'unverified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Razorpay Rental Escrow Payment Simulation Dialog */}
        {paymentModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-brand-600">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-bold text-sm">Razorpay Rental Escrow Checkout</span>
                </div>
                <button
                  onClick={() => setPaymentModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Equipment:</div>
                  <div className="text-base font-bold text-slate-900">
                    {paymentModal.booking.equipmentId?.name}
                  </div>
                  <div className="text-xl font-black text-brand-600 mt-1">
                    ₹{(paymentModal.orderData.amount / 100).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Razorpay Order: {paymentModal.orderData.orderId}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                  <p>
                    <strong>Escrow Security:</strong> Funds are verified via backend cryptographic signature and held safely until equipment handover.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRentalPayment}
                  disabled={processingPayment}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white uppercase tracking-wider shadow-sm flex items-center justify-center space-x-1.5"
                >
                  {processingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Confirm & Verify (Pay)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {selectedInvoice && (
          <InvoiceModal
            booking={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}

        {/* Live Equipment Telematics Tracker Modal */}
        {trackingBooking && (
          <LiveEquipmentTrackerModal
            booking={trackingBooking}
            onClose={() => setTrackingBooking(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
