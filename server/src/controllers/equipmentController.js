const equipmentService = require('../services/equipmentService');
const {
  createEquipmentSchema,
  updateEquipmentSchema,
} = require('../validators/equipmentValidators');

exports.searchMarketplace = async (req, res, next) => {
  try {
    const result = await equipmentService.searchMarketplace(req.query);
    res.status(200).json({
      success: true,
      count: result.items.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      hasCoordinates: result.hasCoordinates,
      data: result.items,
    });
  } catch (error) {
    next(error);
  }
};

exports.createEquipment = async (req, res, next) => {
  try {
    const validatedData = createEquipmentSchema.parse(req.body);
    const equipment = await equipmentService.createEquipment(req.user._id, validatedData);

    res.status(201).json({
      success: true,
      message: 'Machinery registered successfully!',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyEquipment = async (req, res, next) => {
  try {
    const equipmentList = await equipmentService.getOwnerEquipment(req.user._id);

    res.status(200).json({
      success: true,
      count: equipmentList.length,
      data: equipmentList,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id);

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const validatedData = updateEquipmentSchema.parse(req.body);
    const updated = await equipmentService.updateEquipment(
      req.params.id,
      req.user._id,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: 'Equipment details updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await equipmentService.toggleListingStatus(
      req.params.id,
      req.user._id,
      status
    );

    res.status(200).json({
      success: true,
      message: `Equipment status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEquipment = async (req, res, next) => {
  try {
    const result = await equipmentService.deleteEquipment(req.params.id, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Hirer Mobile OTP Contact Unlock Endpoint
 * Gated by mandatory terms acceptance & mobile verification
 */
exports.unlockContact = async (req, res, next) => {
  try {
    const { hirerPhone, termsAccepted, otp } = req.body;
    const result = await equipmentService.unlockOwnerContact(req.params.id, {
      hirerPhone,
      termsAccepted: Boolean(termsAccepted),
      otp,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Hirer Contact Experience Rating & Feedback Endpoint
 */
exports.submitContactFeedback = async (req, res, next) => {
  try {
    const { ratingType, hirerPhone, feedbackText } = req.body;
    const result = await equipmentService.submitContactFeedback(req.params.id, {
      ratingType,
      hirerPhone,
      feedbackText,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
