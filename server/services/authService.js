const User = require('../models/User');

class AuthService {
  /**
   * Register a new user
   */
  static async registerUser({ username, email, password, bio, avatar }) {
    // Check if user already exists
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

    // Find user by either email or username, explicitly selecting passwordHash
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

    // Clean user object
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
}

module.exports = AuthService;
