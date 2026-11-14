const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Get notifications for a user with unread count
   */
  static async getNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate('sender', 'username avatar')
        .populate('post', 'text image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(userId, notificationId = null) {
    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true }
      );
    } else {
      // Mark all unread notifications as read
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return { unreadCount };
  }
}

module.exports = NotificationService;
