import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import InvoiceModal from '../components/common/InvoiceModal';
import LiveEquipmentTrackerModal from '../components/common/LiveEquipmentTrackerModal';
import {
  Truck,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarCheck,
  CreditCard,
  FileText,
  PauseCircle,
  PlayCircle,
  Trash2,
  Crown,
  ChevronRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  Inbox,
  Check,
  X,
  Navigation,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  // Tab 1 & 2: Machinery listed by user
  const [myEquipment, setMyEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  // Tab 3: Rentals booked by user (as customer)
  const [myRentals, setMyRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(false);

  // Tab 4: Rental requests received for user's machinery (as owner)
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Subscriptions details
  const [subDetails, setSubDetails] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);

  // Selected booking for tax invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Selected booking for Live GPS Telematics Tracker Modal
  const [trackingBooking, setTrackingBooking] = useState(null);

  // Payment checkout simulation modal for Awaiting Payment bookings
  const [paymentModal, setPaymentModal] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch machinery owned by user
  const fetchMyEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const res = await api.get('/equipment/my-equipment');
      if (res.data?.success) {
        setMyEquipment(res.data.data.equipment);
      }
    } catch (err) {
      console.warn('Failed to load owned equipment:', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Fetch rentals booked by user (as customer)
  const fetchMyRentals = async () => {
    try {
      setLoadingRentals(true);
      const res = await api.get('/bookings/my-rentals');
      if (res.data?.success) {
        setMyRentals(res.data.data.bookings);
      }
    } catch (err) {
      console.warn('Failed to load customer rentals:', err);
    } finally {
      setLoadingRentals(false);
    }
  };

  // Fetch incoming booking requests for machines owned by user
  const fetchOwnerRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/bookings/owner-requests');
      if (res.data?.success) {
        setOwnerRequests(res.data.data.bookings);
      }
    } catch (err) {
      console.warn('Failed to load owner requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch subscription details
  const fetchSubscriptionDetails = async () => {
    try {
      setLoadingSub(true);
      const res = await api.get('/subscriptions/my-subscription');
      if (res.data?.success) {
        setSubDetails(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load subscription:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    fetchMyEquipment();
    fetchMyRentals();
    fetchOwnerRequests();
    fetchSubscriptionDetails();
  }, []);

  const handleRegisterEquipment = () => {
    if (!hasActiveSubscription) {
      alert('You need an active STORENT subscription plan before listing equipment.');
      navigate('/plans');
      return;
    }
    navigate('/equipment/register');
  };

  // Toggle equipment listing status (active / maintenance)
  const handleToggleStatus = async (item) => {
    const nextStatus = item.listingStatus === 'active' ? 'maintenance' : 'active';
    try {
      const res = await api.patch(`/equipment/${item._id}/status`, {
        listingStatus: nextStatus,
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

  // Delete equipment
  const handleDeleteEquipment = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${item.name}" from STORENT?`
    );
    if (!confirmed) return;

    try {
      const res = await api.delete(`/equipment/${item._id}`);
      if (res.data?.success) {
        setMyEquipment((prev) => prev.filter((eq) => eq._id !== item._id));
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to delete equipment');
    }
  };

  // Owner responds to booking request (accept / reject)
  const handleOwnerResponse = async (bookingId, decision) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/respond`, {
        action: decision,
      });
      if (res.data?.success) {
        setOwnerRequests((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.data : b))
        );
        fetchMyRentals();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to respond to booking request');
    }
  };

  // Owner updates rental progress (Ongoing / Completed)
  const handleUpdateProgress = async (bookingId, nextStatus) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/progress`, {
        bookingStatus: nextStatus,
      });
      if (res.data?.success) {
        setOwnerRequests((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.data : b))
        );
        fetchMyRentals();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update rental status');
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
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Welcome & Status Header */}
        <div className="bg-[#222428] text-white rounded-2xl p-6 sm:p-8 border border-[#34373C] shadow-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center font-black text-2xl border-2 border-[#E6B01B] shadow-md shadow-[#FCC837]/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Welcome back, {user?.name || 'User'}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#34373C] text-[#FCC837] border border-[#34373C]">
                    Dual Account: Rent & List
                  </span>
                </div>
                <p className="text-sm text-white/60 mt-0.5 flex items-center space-x-2">
                  <span>{user?.email}</span>
                  {user?.phone && <span>• {user.phone}</span>}
                </p>
              </div>
            </div>

            {/* Subscription status pill */}
            <div className="flex items-center space-x-3 bg-[#181A1D] px-4 py-3 rounded-xl border border-[#34373C]">
              <Crown className="h-5 w-5 text-[#FCC837]" />
              <div>
                <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                  Subscription Status
                </div>
                <div className="text-sm font-semibold flex items-center space-x-1.5 text-white">
                  {hasActiveSubscription && activePlan ? (
                    <>
                      <span className="text-[#FCC837] font-black">{activePlan.name}</span>
                      <span className="text-xs text-white/60 font-normal">
                        ({myEquipment.length} of {activePlan.billingInterval === 'lifetime' ? '∞' : activePlan.listingLimit} slots used)
                      </span>
                    </>
                  ) : (
                    <span className="text-white/60 font-medium">No active plan</span>
                  )}
                </div>
              </div>
              <Link
                to="/plans"
                className="ml-2 text-xs font-black px-3.5 py-1.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] border border-[#E6B01B] transition shadow-sm"
              >
                {hasActiveSubscription ? 'Upgrade' : 'Get Plan'}
              </Link>
            </div>
          </div>

          {/* Primary Two Options */}
          <div className="mt-8 pt-6 border-t border-[#34373C] grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Option A: Register Equipment */}
            <div className="p-5 rounded-xl border border-[#FCC837]/30 bg-[#181A1D] flex flex-col justify-between hover:border-[#FCC837] transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#222428] bg-[#FCC837] px-2.5 py-0.5 rounded-full">
                    Primary Action A
                  </span>
                  <PlusCircle className="h-5 w-5 text-[#FCC837]" />
                </div>
                <h3 className="text-lg font-bold text-white">Register Equipment</h3>
                <p className="text-xs text-white/70 mt-1">
                  List your JCB, crane, generator, or heavy construction machinery for rent and receive bookings.
                </p>
                {!hasActiveSubscription && (
                  <p className="mt-2 text-xs text-[#FCC837] font-semibold flex items-center space-x-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Requires an active subscription plan to list</span>
                  </p>
                )}
                {hasActiveSubscription && (
                  <p className="mt-2 text-xs text-[#FCC837] font-semibold flex items-center space-x-1">
                    <CheckCircle className="h-3.5 w-3.5 text-[#FCC837]" />
                    <span>
                      Quota: {myEquipment.length} listed / {activePlan?.billingInterval === 'lifetime' ? 'Unlimited' : (activePlan?.listingLimit || 2)} allowed
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={handleRegisterEquipment}
                className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs text-[#222428] uppercase tracking-wider transition shadow-sm border border-[#E6B01B]"
              >
                {hasActiveSubscription ? '+ Open Registration Form' : 'View Plans to Register'}
              </button>
            </div>

            {/* Action Option B: Rent Equipment */}
            <div className="p-5 rounded-xl border border-[#34373C] bg-[#181A1D] flex flex-col justify-between hover:border-[#FCC837]/60 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white bg-[#34373C] px-2.5 py-0.5 rounded-full">
                    Primary Action B
                  </span>
                  <Search className="h-5 w-5 text-[#FCC837]" />
                </div>
                <h3 className="text-lg font-bold text-white">Rent Equipment</h3>
                <p className="text-xs text-white/70 mt-1">
                  Browse available heavy machinery near your construction site with real-time GPS radar.
                </p>
              </div>
              <Link
                to="/browse"
                className="mt-4 w-full py-2.5 px-4 text-center rounded-lg bg-white hover:bg-[#F8F9FA] font-black text-xs text-[#222428] uppercase tracking-wider transition shadow-sm border border-white"
              >
                Search Machinery Nearby
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-[#34373C]/20 mb-6 overflow-x-auto space-x-2">
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
                    ? 'border-[#222428] text-[#222428]'
                    : 'border-transparent text-[#34373C]/70 hover:text-[#222428] hover:border-[#34373C]/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FCC837] text-[#222428] font-black text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#34373C]/10 shadow-sm min-h-[350px]">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#222428]">Account Activity Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#34373C]/15">
                  <div className="text-xs font-semibold text-[#34373C]/70 uppercase">My Listed Machines</div>
                  <div className="text-2xl font-black text-[#222428] mt-1">{myEquipment.length}</div>
                  <div className="text-xs text-[#34373C]/60 mt-1">
                    {hasActiveSubscription ? `Allowed: ${activePlan?.billingInterval === 'lifetime' ? 'Unlimited' : (activePlan?.listingLimit || 2)}` : 'Subscription required'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#34373C]/15">
                  <div className="text-xs font-semibold text-[#34373C]/70 uppercase">Active Rentals As Customer</div>
                  <div className="text-2xl font-black text-[#222428] mt-1">{activeRentalsCount}</div>
                  <div className="text-xs text-[#34373C]/60 mt-1">Confirmed or ongoing site rentals</div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#34373C]/15">
                  <div className="text-xs font-semibold text-[#34373C]/70 uppercase">Pending Requests To Review</div>
                  <div className="text-2xl font-black text-[#222428] mt-1">{pendingRequestsCount}</div>
                  <div className="text-xs text-[#34373C]/60 mt-1">Awaiting owner response</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCC837]/10 border border-[#FCC837]/30 text-xs text-[#222428] leading-relaxed">
                <span className="font-bold text-[#222428]">Dual Account Notice:</span> You do not need to switch logins on STORENT.
                When you list equipment, you act as the machine owner; when you book someone else's machine, you act as the contractor.
                All your invoices, earnings, and bookings are tracked right here.
              </div>
            </div>
          )}

          {/* 2. MY EQUIPMENT TAB */}
          {activeTab === 'my-equipment' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#34373C]/10 mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#222428]">My Registered Machinery Fleet</h3>
                  <p className="text-xs text-[#34373C]/70">
                    Manage active listings, pause machines for maintenance, or register new units.
                  </p>
                </div>
                <button
                  onClick={handleRegisterEquipment}
                  className="px-4 py-2 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs uppercase tracking-wider text-[#222428] border border-[#E6B01B] transition flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register Equipment</span>
                </button>
              </div>

              {loadingEquipment ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : myEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-[#34373C]/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#222428]">No Equipment Listed Yet</h3>
                  <p className="text-xs text-[#34373C]/70 max-w-md mx-auto mt-1 mb-5">
                    Register your machines to start receiving booking requests from contractors in your city.
                  </p>
                  <button
                    onClick={handleRegisterEquipment}
                    className="px-5 py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs text-[#222428] uppercase tracking-wider border border-[#E6B01B] transition shadow-sm"
                  >
                    + Register First Machine
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myEquipment.map((item) => (
                    <div
                      key={item._id}
                      className="border border-[#34373C]/15 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-[#222428] transition bg-white"
                    >
                      <img
                        src={item.photos?.[0] || 'https://via.placeholder.com/300x200'}
                        alt={item.name}
                        className="w-full sm:w-36 h-28 object-cover rounded-lg bg-[#F8F9FA] border border-[#34373C]/10 shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-[#222428] truncate">
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
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center space-x-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-pulse" />
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
                                      ? 'bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]'
                                      : 'bg-[#34373C]/10 text-[#34373C]'
                                  }`}
                                >
                                  {item.listingStatus}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="text-xs text-[#34373C]/70 mt-1 flex items-center space-x-2">
                            <span>{item.brand} {item.model}</span>
                            <span>•</span>
                            <span>{item.categoryId?.name || 'Heavy Equipment'}</span>
                          </div>

                          <div className="mt-2 text-xs flex items-center space-x-3 text-[#222428]">
                            <div className="font-black text-[#222428]">
                              ₹{item.dailyRate?.toLocaleString('en-IN')}/day
                            </div>
                            <div className="flex items-center space-x-1 text-[#34373C]/70">
                              <MapPin className="h-3 w-3 text-[#222428]" />
                              <span>{item.address?.city}, {item.address?.state}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#34373C]/10 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="inline-flex items-center space-x-1 font-bold text-[#222428] hover:underline"
                          >
                            {item.listingStatus === 'active' ? (
                              <>
                                <PauseCircle className="h-3.5 w-3.5 text-[#222428]" />
                                <span>Pause Listing</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-3.5 w-3.5 text-[#222428]" />
                                <span>Resume Listing</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteEquipment(item)}
                            className="inline-flex items-center space-x-1 text-[#34373C] hover:text-[#222428] font-bold"
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
              <div className="flex items-center justify-between pb-4 border-b border-[#34373C]/10 mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#222428]">My Rental Bookings (As Customer)</h3>
                  <p className="text-xs text-[#34373C]/70">
                    Track equipment you have requested or hired from other owners.
                  </p>
                </div>
                <Link
                  to="/browse"
                  className="px-4 py-2 rounded-lg bg-[#222428] hover:bg-[#34373C] font-black text-xs uppercase tracking-wider text-[#FCC837] border border-[#34373C] transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Search className="h-4 w-4" />
                  <span>Rent More Machines</span>
                </Link>
              </div>

              {loadingRentals ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : myRentals.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarCheck className="h-12 w-12 text-[#34373C]/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#222428]">No Rental Bookings Found</h3>
                  <p className="text-xs text-[#34373C]/70 max-w-md mx-auto mt-1 mb-5">
                    Looking for heavy machinery for your project? Search nearby JCBs, cranes, and generators.
                  </p>
                  <Link
                    to="/browse"
                    className="inline-block px-5 py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs text-[#222428] uppercase tracking-wider border border-[#E6B01B] transition shadow-sm"
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
                        className="border border-[#34373C]/15 rounded-xl p-5 hover:border-[#222428] transition flex flex-col md:flex-row justify-between gap-4 bg-white"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={booking.equipmentId?.photos?.[0] || 'https://via.placeholder.com/300x200'}
                            alt=""
                            className="w-full sm:w-36 h-28 object-cover rounded-lg bg-[#F8F9FA] border border-[#34373C]/10 shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-base text-[#222428]">
                                {booking.equipmentId?.name || 'Machinery'}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  booking.bookingStatus === 'Ongoing'
                                    ? 'bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center space-x-1'
                                    : booking.bookingStatus === 'Confirmed'
                                    ? 'bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]'
                                    : booking.bookingStatus === 'Awaiting Payment'
                                    ? 'bg-[#34373C]/15 text-[#222428] border border-[#34373C]/30'
                                    : 'bg-[#F8F9FA] text-[#222428] border border-[#34373C]/20'
                                }`}
                              >
                                {booking.bookingStatus === 'Ongoing' ? (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-pulse" />
                                    <span>Ongoing on Site</span>
                                  </>
                                ) : (
                                  booking.bookingStatus
                                )}
                              </span>
                            </div>

                            <p className="text-xs text-[#34373C]/70 mt-1">
                              Duration: {new Date(booking.startDate).toLocaleDateString()} to{' '}
                              {new Date(booking.endDate).toLocaleDateString()} ({booking.rentalDurationDays} days)
                            </p>

                            <p className="text-xs text-[#222428] mt-1">
                              Owner: <strong>{booking.ownerId?.name || 'Fleet Owner'}</strong> • {booking.ownerId?.phone}
                            </p>

                            <div className="mt-2 text-xs font-black text-[#222428]">
                              Total Payable: ₹{totalRupees.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Customer Actions */}
                        <div className="flex flex-col justify-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                          {booking.bookingStatus === 'Awaiting Payment' && (
                            <button
                              onClick={() => handleInitiatePayment(booking)}
                              className="px-4 py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1.5 border border-[#E6B01B]"
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Pay ₹{totalRupees.toLocaleString('en-IN')} via Razorpay</span>
                            </button>
                          )}

                          {['Confirmed', 'Ongoing', 'Completed'].includes(booking.bookingStatus) && (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setTrackingBooking(booking)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#222428] hover:bg-[#34373C] text-[#FCC837] font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition border border-[#34373C]"
                                title="Live GPS Fleet Telematics Tracker"
                              >
                                <Navigation className="h-3.5 w-3.5 text-[#FCC837] animate-pulse" />
                                <span>Live GPS Tracker</span>
                              </button>
                              <button
                                onClick={() => setSelectedInvoice(booking)}
                                className="px-3.5 py-1.5 rounded-lg border border-[#34373C]/30 text-[#222428] font-bold text-xs hover:bg-[#F8F9FA] flex items-center space-x-1.5"
                              >
                                <FileText className="h-3.5 w-3.5 text-[#222428]" />
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
              <div className="flex items-center justify-between pb-4 border-b border-[#34373C]/10 mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#222428]">
                    Booking Requests Received (As Machine Owner)
                  </h3>
                  <p className="text-xs text-[#34373C]/70">
                    Contractors who have requested your machinery. Accept to enable renter payment.
                  </p>
                </div>
                <button
                  onClick={fetchOwnerRequests}
                  className="p-1.5 rounded-lg border border-[#34373C]/20 text-[#222428] hover:bg-[#F8F9FA]"
                  title="Refresh incoming requests"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingRequests ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingRequests ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : ownerRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 text-[#34373C]/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#222428]">No Booking Requests Received</h3>
                  <p className="text-xs text-[#34373C]/70 max-w-md mx-auto mt-1">
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
                        className="border border-[#34373C]/15 rounded-xl p-5 hover:border-[#222428] transition flex flex-col md:flex-row justify-between gap-4 bg-white"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-base text-[#222428]">
                              {req.equipmentId?.name || 'Machinery'}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                req.bookingStatus === 'Ongoing'
                                  ? 'bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center space-x-1'
                                  : req.bookingStatus === 'Confirmed'
                                  ? 'bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]'
                                  : req.bookingStatus === 'Pending'
                                  ? 'bg-[#34373C]/10 text-[#34373C] border border-[#34373C]/20'
                                  : 'bg-[#F8F9FA] text-[#222428]'
                              }`}
                            >
                              {req.bookingStatus === 'Ongoing' ? (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-pulse" />
                                  <span>Ongoing on Site</span>
                                </>
                              ) : (
                                req.bookingStatus
                              )}
                            </span>
                          </div>

                          <div className="text-xs text-[#222428] mt-1.5 space-y-0.5">
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
                            <p className="text-[#222428] font-black">
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
                                className="px-3.5 py-2 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-bold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1 border border-[#E6B01B]"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Accept Request</span>
                              </button>
                              <button
                                onClick={() => handleOwnerResponse(req._id, 'reject')}
                                className="px-3.5 py-2 rounded-lg border border-[#34373C] text-[#34373C] hover:bg-[#222428] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1 transition"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}

                          {req.bookingStatus === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateProgress(req._id, 'Ongoing')}
                              className="px-4 py-2 rounded-lg bg-[#222428] hover:bg-[#34373C] text-[#FCC837] font-black text-xs uppercase tracking-wider shadow-sm border border-[#34373C]"
                            >
                              Record Handover (Ongoing)
                            </button>
                          )}

                          {req.bookingStatus === 'Ongoing' && (
                            <button
                              onClick={() => handleUpdateProgress(req._id, 'Completed')}
                              className="px-4 py-2 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider shadow-sm border border-[#E6B01B]"
                            >
                              Record Return (Completed)
                            </button>
                          )}

                          {['Confirmed', 'Ongoing', 'Completed'].includes(req.bookingStatus) && (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setTrackingBooking(req)}
                                className="px-3 py-1.5 rounded-lg bg-[#222428] hover:bg-[#34373C] text-[#FCC837] font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition border border-[#34373C]"
                                title="Live Telematics & Radar Route"
                              >
                                <Navigation className="h-3.5 w-3.5 text-[#FCC837]" />
                                <span>Track Machinery</span>
                              </button>
                              <button
                                onClick={() => setSelectedInvoice(req)}
                                className="px-3 py-1.5 rounded-lg border border-[#34373C]/30 text-[#222428] font-bold text-xs hover:bg-[#F8F9FA] flex items-center space-x-1"
                              >
                                <FileText className="h-3.5 w-3.5 text-[#222428]" />
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
              <div className="flex items-center justify-between pb-4 border-b border-[#34373C]/10">
                <div>
                  <h3 className="text-base font-bold text-[#222428]">Equipment Listing Subscriptions</h3>
                  <p className="text-xs text-[#34373C]/70">Manage your subscription plan, payments, and listing limits</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchSubscriptionDetails}
                    className="p-1.5 rounded-lg border border-[#34373C]/20 text-[#222428] hover:bg-[#F8F9FA]"
                    title="Refresh subscription status"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingSub ? 'animate-spin' : ''}`} />
                  </button>
                  <Link
                    to="/plans"
                    className="px-3.5 py-1.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] text-xs font-black uppercase transition border border-[#E6B01B]"
                  >
                    Upgrade Tier
                  </Link>
                </div>
              </div>

              {hasActiveSubscription && activePlan ? (
                <div className="p-6 rounded-2xl border border-[#FCC837] bg-[#222428] text-white shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#FCC837] text-[#222428] uppercase tracking-wider">
                        Active Verified Plan
                      </span>
                      <h4 className="text-xl font-black text-white mt-2">
                        {activePlan.name}
                      </h4>
                      <p className="text-xs text-white/70 mt-1">
                        Billing: ₹{(activePlan.price / 100).toLocaleString('en-IN')}
                        {activePlan.billingInterval === 'lifetime' ? ' (One-Time Lifetime VIP)' : `/${activePlan.billingInterval || 'month'}`}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-xs text-white/60 font-medium">Valid Until</div>
                      <div className="text-sm font-bold text-[#FCC837]">
                        {activePlan.billingInterval === 'lifetime'
                          ? 'Lifetime (Never Expires ♾️)'
                          : new Date(subDetails?.subscription?.endDate || user.activeSubscription?.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="pt-4 border-t border-[#34373C]">
                    <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                      <span>Listing Allowance Usage:</span>
                      <span className="text-[#FCC837]">
                        {activePlan.billingInterval === 'lifetime'
                          ? `${myEquipment.length} machines listed (Unlimited Quota)`
                          : `${myEquipment.length} of ${activePlan.listingLimit} machine slots used`}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#34373C] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FCC837] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((myEquipment.length / (activePlan.listingLimit || 999)) * 100) || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-white/60 mt-2 flex justify-between">
                      <span>
                        {activePlan.billingInterval === 'lifetime'
                          ? 'Unlimited listing slots available'
                          : `Remaining slots: ${Math.max(0, activePlan.listingLimit - myEquipment.length)}`}
                      </span>
                      <span className="text-[#FCC837] font-semibold">Verified by Backend</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={handleRegisterEquipment}
                      className="px-4 py-2 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider transition border border-[#E6B01B]"
                    >
                      + Register Equipment Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-[#34373C]/20 bg-[#F8F9FA] text-center">
                  <Crown className="h-10 w-10 text-[#FCC837] mx-auto mb-3" />
                  <p className="text-base font-bold text-[#222428]">No Active Subscription Plan</p>
                  <p className="text-xs text-[#34373C]/70 max-w-sm mx-auto mt-1 mb-5">
                    To register equipment on STORENT and receive contractor rental bookings, select a membership tier.
                  </p>
                  <Link
                    to="/plans"
                    className="inline-block px-5 py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider border border-[#E6B01B] transition shadow-sm"
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
              <h3 className="text-base font-bold text-[#222428] pb-2 border-b border-[#34373C]/10">
                Profile Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#34373C]/60 font-medium">Full Name</span>
                  <p className="text-sm font-bold text-[#222428] mt-0.5">{user?.name}</p>
                </div>
                <div>
                  <span className="text-[#34373C]/60 font-medium">Email Address</span>
                  <p className="text-sm font-bold text-[#222428] mt-0.5">{user?.email}</p>
                </div>
                <div>
                  <span className="text-[#34373C]/60 font-medium">Phone Number</span>
                  <p className="text-sm font-bold text-[#222428] mt-0.5">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[#34373C]/60 font-medium">Verification Status</span>
                  <p className="text-sm font-bold capitalize text-[#222428] mt-0.5">
                    {user?.verificationStatus || 'unverified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Razorpay Rental Escrow Payment Simulation Dialog */}
        {paymentModal && (
          <div className="fixed inset-0 z-50 bg-[#222428]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#34373C]/20">
              <div className="flex items-center justify-between pb-3 border-b border-[#34373C]/10">
                <div className="flex items-center space-x-2 text-[#222428]">
                  <CreditCard className="h-5 w-5 text-[#FCC837]" />
                  <span className="font-black text-sm">STORENT Escrow Checkout</span>
                </div>
                <button
                  onClick={() => setPaymentModal(null)}
                  className="p-1 rounded text-[#34373C] hover:text-[#222428]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#34373C]/15">
                  <div className="text-xs text-[#34373C]/70">Equipment:</div>
                  <div className="text-base font-bold text-[#222428]">
                    {paymentModal.booking.equipmentId?.name}
                  </div>
                  <div className="text-2xl font-black text-[#222428] mt-1">
                    ₹{(paymentModal.orderData.amount / 100).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-[#34373C]/60 font-mono mt-1">
                    Razorpay Order: {paymentModal.orderData.orderId}
                  </div>
                </div>

                <div className="text-xs text-[#34373C]/80 space-y-2">
                  <p>
                    <strong>Escrow Security:</strong> Funds are held safely in STORENT verified escrow until machinery handover is recorded on site.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="flex-1 py-2.5 rounded-lg border border-[#34373C]/30 text-xs font-bold text-[#222428] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRentalPayment}
                  disabled={processingPayment}
                  className="flex-1 py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-xs font-black text-[#222428] uppercase tracking-wider shadow-sm flex items-center justify-center space-x-1.5 border border-[#E6B01B]"
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
