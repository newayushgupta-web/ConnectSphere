const UserService = require('../services/userService');
const Post = require('../models/Post');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public (Optional Auth for isFollowing status)
const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user ? req.user._id : null;

  const profile = await UserService.getProfileByUsername(username, currentUserId);
  return ApiResponse.success(res, profile, 'Profile fetched successfully');
});

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfile(
    req.user._id,
    req.body,
    req.file
  );
  return ApiResponse.success(res, { user: updatedUser }, 'Profile updated successfully');
});

// @desc    Follow or unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
const toggleFollow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.toggleFollow(req.user._id, id);
  return ApiResponse.success(
    res,
    result,
    `Successfully ${result.action} user`
  );
});

// @desc    Search users by username or bio
// @route   GET /api/users/search
// @access  Public (Optional Auth)
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user ? req.user._id : null;
  const users = await UserService.searchUsers(q, currentUserId);
  return ApiResponse.success(res, users, 'Users retrieved successfully');
});

// @desc    Get suggestions for who to follow
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await UserService.getSuggestions(req.user._id);
  return ApiResponse.success(res, suggestions, 'Suggestions retrieved successfully');
});

// @desc    Get all posts by a specific user
// @route   GET /api/users/:username/posts
// @access  Public
const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await UserService.getProfileByUsername(username);

  const posts = await Post.find({ author: user._id })
    .populate('author', 'username avatar')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, posts, 'User posts retrieved successfully');
});

module.exports = {
  getProfile,
  updateMe,
  toggleFollow,
  searchUsers,
  getSuggestions,
  getUserPosts,
};
