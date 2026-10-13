const User = require('../models/User');
const Subscription = require('../models/Subscription');

class AuthService {
  async register({ name, email, phone, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      passwordHash: password, // Will be hashed in pre-save hook
      role: 'user',
      accountStatus: 'active',
      verificationStatus: 'unverified',
    });

    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.accountStatus === 'suspended') {
      const error = new Error('Your account has been suspended. Please contact platform support.');
      error.statusCode = 403;
      throw error;
    }

    return user;
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Attach active subscription information if available
    const activeSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() },
    }).populate('planId');

    const safeUser = user.toSafeJSON();
    safeUser.activeSubscription = activeSubscription || null;

    return safeUser;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.address) {
      user.address = {
        ...user.address,
        ...updateData.address,
      };
    }

    await user.save();
    return user.toSafeJSON();
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password does not match');
      error.statusCode = 400;
      throw error;
    }

    user.passwordHash = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();

