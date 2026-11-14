const NotificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await NotificationService.getNotifications(
    req.user._id,
    page,
    limit
  );

  return ApiResponse.success(res, result, 'Notifications retrieved successfully');
});

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.body;
  const result = await NotificationService.markAsRead(
    req.user._id,
    notificationId
  );

  return ApiResponse.success(res, result, 'Notifications marked as read');
});

module.exports = {
  getNotifications,
  markAsRead,
};
