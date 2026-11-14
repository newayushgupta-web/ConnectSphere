const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password, bio, avatar } = req.body;
  const result = await AuthService.registerUser({
    username,
    email,
    password,
    bio,
    avatar,
  });

  return ApiResponse.success(res, result, 'User registered successfully', 201);
});

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, username, loginIdentifier, password } = req.body;
  const identifier = loginIdentifier || email || username;

  const result = await AuthService.loginUser({
    loginIdentifier: identifier,
    password,
  });

  return ApiResponse.success(res, result, 'Login successful', 200);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user._id);
  return ApiResponse.success(res, { user }, 'User profile retrieved successfully', 200);
});

module.exports = {
  register,
  login,
  getMe,
};
