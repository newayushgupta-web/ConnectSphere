const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(
      res,
      'Access denied. Not authorized, no authentication token provided.',
      401
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'connectsphere_default_secret_key'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(
        res,
        'User belonging to this token no longer exists.',
        401
      );
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Session expired. Please log in again.', 401);
    }
    return ApiResponse.error(res, 'Invalid token. Authorization failed.', 401);
  }
};

// Optional auth: if token is present, decode and attach user; otherwise proceed
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'connectsphere_default_secret_key'
    );
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token for optional auth routes
  }

  next();
};

module.exports = { protect, optionalAuth };
