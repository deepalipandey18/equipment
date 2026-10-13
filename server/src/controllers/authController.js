const authService = require('../services/authService');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/authValidators');
const { sendTokenResponse, clearTokenCookie } = require('../utils/tokenUtils');

exports.register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.register(validatedData);
    return sendTokenResponse(user, 201, res, 'Registration successful. Welcome to EquipmentHub!');
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await authService.login(validatedData);
    return sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userProfile = await authService.getProfile(req.user._id);
    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updatedUser = await authService.updateProfile(req.user._id, validatedData);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(
      req.user._id,
      validatedData.currentPassword,
      validatedData.newPassword
    );
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

