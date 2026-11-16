const crypto = require('crypto');
const User = require('../models/User');
const EmailService = require('./emailService');

class AuthService {
  /**
   * Register a new user
   */
  static async registerUser({ username, email, password, bio, avatar }) {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        const error = new Error('Email is already registered');
        error.statusCode = 400;
        throw error;
      }
      if (existingUser.username === username.toLowerCase()) {
        const error = new Error('Username is already taken');
        error.statusCode = 400;
        throw error;
      }
    }

    const passwordHash = await User.hashPassword(password);

    const userData = {
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      bio: bio || '',
    };

    if (avatar) {
      userData.avatar = avatar;
    }

    const user = await User.create(userData);
    const token = user.generateAuthToken();

    return {
      token,
      user,
    };
  }

  /**
   * Login user with email/username and password
   */
  static async loginUser({ loginIdentifier, password }) {
    if (!loginIdentifier || !password) {
      const error = new Error('Please provide email/username and password');
      error.statusCode = 400;
      throw error;
    }

    const cleanIdentifier = loginIdentifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    }).select('+passwordHash');

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = user.generateAuthToken();
    const userObj = user.toJSON();

    return {
      token,
      user: userObj,
    };
  }

  /**
   * Get current authenticated user details
   */
  static async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Request password reset token and send email
   */
  static async forgotPassword(email) {
    if (!email) {
      const error = new Error('Please provide an email address');
      error.statusCode = 400;
      throw error;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Always generic return message regardless of whether user exists
    const genericMessage =
      'If an account with that email exists, we have sent a password reset link to it.';

    if (!user) {
      return { message: genericMessage };
    }

    // Generate random 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store SHA-256 hash in database with 15-minute expiration
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    try {
      await EmailService.sendPasswordResetEmail({
        to: user.email,
        token: resetToken,
      });
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      // Even if email sending had a local error, don't expose email presence
    }

    return { message: genericMessage };
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token, password, confirmPassword) {
    if (!password || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error('Passwords do not match');
      error.statusCode = 400;
      throw error;
    }

    // Hash token to compare with stored SHA-256 hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      const error = new Error('Invalid or expired password reset link. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    // Update password
    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { success: true };
  }
}

module.exports = AuthService;
