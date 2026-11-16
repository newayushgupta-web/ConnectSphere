const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication routes (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

// Password reset rate limiter: 5 requests / 15 min / IP
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many password reset requests from this IP, please try again after 15 minutes.',
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

module.exports = { authLimiter, passwordResetLimiter, apiLimiter };
