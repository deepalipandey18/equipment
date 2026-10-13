const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Subscription = require('../models/Subscription');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

class AdminService {
  /**
   * High level platform statistics & financial totals
   */
  async getPlatformStats() {
    const [
      totalUsers,
      totalEquipment,
      pendingEquipmentCount,
      activeSubscriptionsCount,
      totalBookings,
      confirmedBookingsCount,
      paymentsSummary,
    ] = await Promise.all([
      User.countDocuments(),
      Equipment.countDocuments({ listingStatus: { $ne: 'deleted' } }),
      Equipment.countDocuments({ approvalStatus: 'pending', listingStatus: { $ne: 'deleted' } }),
      Subscription.countDocuments({ status: 'active', endDate: { $gt: new Date() } }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: { $in: ['Confirmed', 'Ongoing', 'Completed'] } }),
      Payment.aggregate([
        { $match: { status: 'verified' } },
        { $group: { _id: null, totalPaise: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenueRupees =
      paymentsSummary.length > 0 ? paymentsSummary[0].totalPaise / 100 : 0;

    return {
      totalUsers,
      totalEquipment,
      pendingEquipmentCount,
      activeSubscriptionsCount,
      totalBookings,
      confirmedBookingsCount,
      totalRevenueRupees,
    };
  }

  /**
   * Paginated user directory with search & status filters
   */
  async getUsers({ page = 1, limit = 20, search = '', status = '', role = '' }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status) query.accountStatus = status;
    if (role) query.role = role;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return {
      users: users.map((u) => u.toSafeJSON()),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Suspend or reactivate user account with audit trail
   */
  async toggleUserAccountStatus(userId, adminId, newStatus, reason = '') {
    if (userId.toString() === adminId.toString()) {
      const error = new Error('Administrators cannot suspend their own account');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    user.accountStatus = newStatus;
    await user.save();

    await AuditLog.create({
      adminId,
      action: newStatus === 'suspended' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      targetResource: 'User',
      targetId: user._id,
      details: `User account set to ${newStatus}. Reason: ${reason || 'N/A'}`,
    });

    return user.toSafeJSON();
  }

  /**
   * Paginated equipment fleet for review & approvals
   */
  async getAllEquipment({ page = 1, limit = 20, approvalStatus = '', search = '' }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = { listingStatus: { $ne: 'deleted' } };
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { brand: regex }, { model: regex }];
    }

    const [equipmentList, total] = await Promise.all([
      Equipment.find(query)
        .populate('ownerId', 'name email phone')
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Equipment.countDocuments(query),
    ]);

    return {
      equipment: equipmentList,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Approve or reject equipment listing
   */
  async reviewEquipmentListing(equipmentId, adminId, approvalStatus, adminNotes = '') {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      const error = new Error('Equipment not found');
      error.statusCode = 404;
      throw error;
    }

    equipment.approvalStatus = approvalStatus;
    if (adminNotes) equipment.adminNotes = adminNotes;
    await equipment.save();

    await AuditLog.create({
      adminId,
      action: approvalStatus === 'approved' ? 'APPROVE_EQUIPMENT' : 'REJECT_EQUIPMENT',
      targetResource: 'Equipment',
      targetId: equipment._id,
      details: `Listing status updated to ${approvalStatus}. Notes: ${adminNotes || 'None'}`,
    });

    return await Equipment.findById(equipmentId)
      .populate('ownerId', 'name email phone')
      .populate('categoryId', 'name');
  }

  /**
   * View all active and expired subscriptions
   */
  async getAllSubscriptions({ page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [subscriptions, total] = await Promise.all([
      Subscription.find()
        .populate('userId', 'name email phone')
        .populate('planId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Subscription.countDocuments(),
    ]);

    return {
      subscriptions,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * View all platform bookings & statuses
   */
  async getAllBookings({ page = 1, limit = 20, status = '' }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status) query.bookingStatus = status;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('equipmentId', 'name brand model dailyRate')
        .populate('ownerId', 'name email phone')
        .populate('renterId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Audit log history
   */
  async getAuditLogs({ page = 1, limit = 30 }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(),
    ]);

    return {
      logs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  }
}

module.exports = new AdminService();

