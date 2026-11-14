const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication routes (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many login or registration attempts from this IP, please try again after 15 minutes.',
  },
});

// General API rate limiter for regular traffic
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many requests, please slow down.',
  },
});

module.exports = { authLimiter, apiLimiter };
