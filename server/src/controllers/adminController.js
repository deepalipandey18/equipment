const adminService = require('../services/adminService');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const updated = await adminService.toggleUserAccountStatus(
      req.params.id,
      req.user._id,
      status,
      reason
    );

    res.status(200).json({
      success: true,
      message: `User account set to ${status}`,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEquipment = async (req, res, next) => {
  try {
    const result = await adminService.getAllEquipment(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewEquipment = async (req, res, next) => {
  try {
    const { approvalStatus, adminNotes } = req.body;
    const updated = await adminService.reviewEquipmentListing(
      req.params.id,
      req.user._id,
      approvalStatus,
      adminNotes
    );

    res.status(200).json({
      success: true,
      message: `Equipment listing ${approvalStatus}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const result = await adminService.getAllSubscriptions(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const result = await adminService.getAllBookings(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const result = await adminService.getAuditLogs(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

