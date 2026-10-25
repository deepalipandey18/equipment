import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StorentLogo from '../components/common/StorentLogo';
import {
  ShieldCheck,
  Users,
  Truck,
  Crown,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
  Ban,
  Activity,
  History,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Tab
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Equipment Tab
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState('');

  // Subscriptions Tab
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Bookings Tab
  const [bookingsList, setBookingsList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Audit Logs Tab
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch platform stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/admin/users', {
        params: { search: userSearch },
      });
      if (res.data?.success) {
        setUsersList(res.data.data.users);
      }
    } catch (err) {
      console.warn('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch equipment
  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const res = await api.get('/admin/equipment', {
        params: { approvalStatus: equipmentFilter },
      });
      if (res.data?.success) {
        setEquipmentList(res.data.data.equipment);
      }
    } catch (err) {
      console.warn('Failed to load equipment:', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoadingSubs(true);
      const res = await api.get('/admin/subscriptions');
      if (res.data?.success) {
        setSubscriptionsList(res.data.data.subscriptions);
      }
    } catch (err) {
      console.warn('Failed to load subscriptions:', err);
    } finally {
      setLoadingSubs(false);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.get('/admin/bookings');
      if (res.data?.success) {
        setBookingsList(res.data.data.bookings);
      }
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch audit logs
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get('/admin/audit-logs');
      if (res.data?.success) {
        setAuditLogs(res.data.data.logs);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'equipment') fetchEquipment();
    if (activeTab === 'subscriptions') fetchSubscriptions();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  // Actions
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.accountStatus === 'active' ? 'suspended' : 'active';
    const confirmChange = window.confirm(
      `Are you sure you want to set ${targetUser.email} to "${nextStatus}"?`
    );
    if (!confirmChange) return;

    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/status`, {
        status: nextStatus,
        reason: 'Administrative action via STORENT Admin Console',
      });
      if (res.data?.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, accountStatus: nextStatus } : u))
        );
        fetchStats();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update account status');
    }
  };

  const handleReviewEquipment = async (item, approvalStatus) => {
    try {
      const res = await api.patch(`/admin/equipment/${item._id}/review`, {
        approvalStatus,
        adminNotes: `Reviewed and set to ${approvalStatus} by STORENT admin`,
      });
      if (res.data?.success) {
        setEquipmentList((prev) =>
          prev.map((eq) => (eq._id === item._id ? { ...eq, approvalStatus } : eq))
        );
        fetchStats();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to review equipment listing');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Admin Header */}
        <div className="bg-[#222428] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#34373C]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#FCC837] text-[#222428] flex items-center justify-center font-bold shadow-md shadow-[#FCC837]/20">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">STORENT Administration</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCC837]/20 text-[#FCC837] border border-[#FCC837]/30">
                    SuperAdmin
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Protected RBAC Console • Managing users, machinery approvals, subscriptions, and escrow
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchStats();
                if (activeTab === 'users') fetchUsers();
                if (activeTab === 'equipment') fetchEquipment();
                if (activeTab === 'subscriptions') fetchSubscriptions();
                if (activeTab === 'bookings') fetchBookings();
                if (activeTab === 'logs') fetchLogs();
              }}
              className="px-3.5 py-2 rounded-lg bg-[#34373C] hover:bg-[#34373C]/80 text-xs font-bold uppercase tracking-wider text-[#FCC837] border border-[#34373C] flex items-center space-x-1.5 self-start sm:self-auto transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#34373C]">
            <div>
              <span className="text-[11px] font-semibold uppercase text-white/60">Total Users</span>
              <div className="text-2xl font-black text-white mt-0.5">
                {stats?.totalUsers ?? '...'}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-white/60">Machinery Units</span>
              <div className="text-2xl font-black text-[#FCC837] mt-0.5">
                {stats?.totalEquipment ?? '...'}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-white/60">Active Subscriptions</span>
              <div className="text-2xl font-black text-[#FCC837] mt-0.5">
                {stats?.activeSubscriptionsCount ?? '...'}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-white/60">Total Platform Escrow</span>
              <div className="text-2xl font-black text-white mt-0.5">
                ₹{(stats?.totalRevenueRupees ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Administration Navigation Tabs */}
        <div className="flex border-b border-[#34373C]/20 overflow-x-auto space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'equipment', label: `Fleet Approvals (${equipmentList.length || stats?.totalEquipment || 0})`, icon: Truck },
            { id: 'users', label: `User Accounts (${usersList.length || stats?.totalUsers || 0})`, icon: Users },
            { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
            { id: 'bookings', label: 'Platform Bookings', icon: CreditCard },
            { id: 'logs', label: 'Audit Trail', icon: History },
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
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#34373C]/10 shadow-sm min-h-[400px]">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#222428]">Platform Operations Overview</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-[#34373C]/15 bg-[#F8F9FA]">
                  <div className="text-xs font-semibold uppercase text-[#34373C]/70">Fleet Health</div>
                  <div className="text-xl font-black text-[#222428] mt-1">
                    {stats?.totalEquipment || 0} Registered Units
                  </div>
                  <p className="text-xs text-[#34373C]/70 mt-1">
                    Pending Review: <strong>{stats?.pendingEquipmentCount || 0}</strong>
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-[#34373C]/15 bg-[#F8F9FA]">
                  <div className="text-xs font-semibold uppercase text-[#34373C]/70">Rental Bookings</div>
                  <div className="text-xl font-black text-[#222428] mt-1">
                    {stats?.totalBookings || 0} Total Requests
                  </div>
                  <p className="text-xs text-[#34373C]/70 mt-1">
                    Confirmed / Active: <strong>{stats?.confirmedBookingsCount || 0}</strong>
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-[#34373C]/15 bg-[#F8F9FA]">
                  <div className="text-xs font-semibold uppercase text-[#34373C]/70">Membership Revenue</div>
                  <div className="text-xl font-black text-[#222428] mt-1">
                    {stats?.activeSubscriptionsCount || 0} Active Fleet Subscriptions
                  </div>
                  <p className="text-xs text-[#34373C]/70 mt-1">Gating active equipment creation</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCC837]/10 border border-[#FCC837]/30 text-xs text-[#222428] leading-relaxed">
                <strong>STORENT RBAC Protection:</strong> All administrative endpoints mounted under <code>/api/admin/*</code> are protected on the server using <code>authorizeRoles('admin')</code> middleware and verified JWT session tokens.
              </div>
            </div>
          )}

          {/* 2. FLEET APPROVALS */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#34373C]/10">
                <h3 className="text-base font-bold text-[#222428]">Machinery Approvals & Review</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={equipmentFilter}
                    onChange={(e) => setEquipmentFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#34373C]/20 text-xs font-semibold bg-white text-[#222428] outline-none focus:border-[#222428]"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {loadingEquipment ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : equipmentList.length === 0 ? (
                <div className="text-center py-12 text-[#34373C]/60 text-xs font-medium">
                  No machinery listings found matching filter.
                </div>
              ) : (
                <div className="divide-y divide-[#34373C]/10">
                  {equipmentList.map((item) => (
                    <div
                      key={item._id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={item.photos?.[0] || 'https://via.placeholder.com/80'}
                          alt=""
                          className="h-14 w-18 object-cover rounded-lg bg-[#F8F9FA] border border-[#34373C]/10 shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-[#222428]">{item.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.approvalStatus === 'approved'
                                  ? 'bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]'
                                  : item.approvalStatus === 'pending'
                                  ? 'bg-[#34373C]/10 text-[#34373C] border border-[#34373C]/20'
                                  : 'bg-[#222428] text-white border border-[#34373C]'
                              }`}
                            >
                              {item.approvalStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#34373C]/70 mt-0.5">
                            Owner: <strong>{item.ownerId?.name || 'Owner'}</strong> ({item.ownerId?.phone}) • Daily: ₹{item.dailyRate?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-start md:self-auto">
                        <Link
                          to={`/equipment/${item._id}`}
                          target="_blank"
                          className="px-2.5 py-1.5 rounded-lg border border-[#34373C]/20 text-[#222428] hover:bg-[#F8F9FA] text-xs font-semibold flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View Public Page</span>
                        </Link>

                        {item.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => handleReviewEquipment(item, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] text-xs font-bold uppercase tracking-wider flex items-center space-x-1 shadow-sm transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {item.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => handleReviewEquipment(item, 'rejected')}
                            className="px-3 py-1.5 rounded-lg border border-[#34373C] text-[#34373C] hover:bg-[#222428] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. USER ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#34373C]/10">
                <h3 className="text-base font-bold text-[#222428]">User Accounts Directory</h3>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-[#34373C]/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-[#34373C]/20 text-xs text-[#222428] outline-none focus:border-[#222428] w-56 bg-white"
                  />
                </div>
              </div>

              {loadingUsers ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FA] text-[#34373C] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-4">Name & Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4 text-right">Moderation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#34373C]/10 text-[#222428]">
                      {usersList.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F8F9FA]/70">
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#222428] block">{u.name}</span>
                            <span className="text-[#34373C]/60 text-[11px]">{u.email}</span>
                          </td>
                          <td className="py-3 px-4 uppercase font-semibold text-[11px]">
                            {u.role}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.accountStatus === 'active'
                                  ? 'bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]'
                                  : 'bg-[#222428] text-white'
                              }`}
                            >
                              {u.accountStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 capitalize text-[#34373C]/70">
                            {u.verificationStatus || 'unverified'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u._id !== user?._id ? (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                                  u.accountStatus === 'active'
                                    ? 'border border-[#34373C] text-[#34373C] hover:bg-[#222428] hover:text-white'
                                    : 'bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428]'
                                }`}
                              >
                                {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#34373C]/50 italic">Self (Admin)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#222428] pb-3 border-b border-[#34373C]/10">
                Active Member Subscriptions
              </h3>

              {loadingSubs ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : subscriptionsList.length === 0 ? (
                <div className="text-center py-12 text-[#34373C]/60 text-xs">
                  No active member subscriptions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FA] text-[#34373C] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-4">Member Name</th>
                        <th className="py-3 px-4">Plan Tier</th>
                        <th className="py-3 px-4">Allowance</th>
                        <th className="py-3 px-4">Valid Until</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#34373C]/10 text-[#222428]">
                      {subscriptionsList.map((sub) => (
                        <tr key={sub._id}>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#222428] block">{sub.userId?.name}</span>
                            <span className="text-[#34373C]/60 text-[11px]">{sub.userId?.email}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#222428]">
                            {sub.planId?.name}
                          </td>
                          <td className="py-3 px-4">
                            Up to {sub.planId?.listingLimit} machines
                          </td>
                          <td className="py-3 px-4 text-[#34373C]">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]/40">
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. PLATFORM BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#222428] pb-3 border-b border-[#34373C]/10">
                All STORENT Rental Bookings
              </h3>

              {loadingBookings ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : bookingsList.length === 0 ? (
                <div className="text-center py-12 text-[#34373C]/60 text-xs">
                  No rental bookings recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FA] text-[#34373C] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Machinery</th>
                        <th className="py-3 px-4">Renter</th>
                        <th className="py-3 px-4">Owner</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#34373C]/10 text-[#222428]">
                      {bookingsList.map((b) => (
                        <tr key={b._id}>
                          <td className="py-3 px-4 font-mono font-bold text-[#222428]">
                            {b.invoiceNumber || b._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#222428]">
                            {b.equipmentId?.name}
                          </td>
                          <td className="py-3 px-4 text-[#34373C]">{b.renterId?.name}</td>
                          <td className="py-3 px-4 text-[#34373C]">{b.ownerId?.name}</td>
                          <td className="py-3 px-4 font-bold text-[#222428]">
                            ₹{((b.pricingBreakdown?.totalAmountPaise || 0) / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#34373C]/10 text-[#222428]">
                              {b.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 6. AUDIT TRAIL */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#222428] pb-3 border-b border-[#34373C]/10">
                Administrative Audit Log History
              </h3>

              {loadingLogs ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#222428]" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-[#34373C]/60 text-xs">
                  No administrative operations recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-[#34373C]/10 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="py-3 flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[11px] bg-[#34373C]/10 px-2 py-0.5 rounded text-[#222428]">
                            {log.action}
                          </span>
                          <span className="text-[#34373C]/70">on {log.targetResource}</span>
                        </div>
                        <p className="text-[#222428] mt-1">{log.details}</p>
                      </div>
                      <div className="text-right text-[11px] text-[#34373C]/60 shrink-0">
                        <div>Admin: {log.adminId?.name || 'Admin'}</div>
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;