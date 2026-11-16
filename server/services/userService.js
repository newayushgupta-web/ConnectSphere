const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

class UserService {
  /**
   * Get user profile by username with stats
   */
  static async getProfileByUsername(username, currentUserId = null) {
    const user = await User.findOne({ username: username.toLowerCase() })
      .populate('followers', 'username avatar bio')
      .populate('following', 'username avatar bio');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const postCount = await Post.countDocuments({ author: user._id });

    const isFollowing = currentUserId
      ? user.followers.some((f) => f._id.toString() === currentUserId.toString())
      : false;

    const isSelf = currentUserId
      ? user._id.toString() === currentUserId.toString()
      : false;

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      cover: user.cover,
      bio: user.bio,
      location: user.location || '',
      website: user.website || '',
      createdAt: user.createdAt,
      postCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      bookmarksCount: user.bookmarks ? user.bookmarks.length : 0,
      followers: user.followers,
      following: user.following,
      isFollowing,
      isSelf,
    };
  }

  /**
   * Update current user profile
   */
  static async updateProfile(userId, updateData, files = null) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.location !== undefined) user.location = updateData.location;
    if (updateData.website !== undefined) user.website = updateData.website;

    // Handle file uploads (avatar and cover)
    if (files) {
      if (files.avatar && files.avatar[0]) {
        user.avatar = `/uploads/${files.avatar[0].filename}`;
      }
      if (files.cover && files.cover[0]) {
        user.cover = `/uploads/${files.cover[0].filename}`;
      }
    }

    if (updateData.avatar && (!files || !files.avatar)) {
      user.avatar = updateData.avatar;
    }
    if (updateData.cover && (!files || !files.cover)) {
      user.cover = updateData.cover;
    }

    await user.save();
    return user;
  }

  /**
   * Get user followers list
   */
  static async getFollowers(userId) {
    const user = await User.findById(userId).populate(
      'followers',
      'username avatar bio followers'
    );
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.followers;
  }

  /**
   * Get user following list
   */
  static async getFollowing(userId) {
    const user = await User.findById(userId).populate(
      'following',
      'username avatar bio followers'
    );
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.following;
  }

  /**
   * Follow or Unfollow a user
   */
  static async toggleFollow(currentUserId, targetUserId) {
    if (currentUserId.toString() === targetUserId.toString()) {
      const error = new Error('You cannot follow yourself');
      error.statusCode = 400;
      throw error;
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!targetUser) {
      const error = new Error('Target user not found');
      error.statusCode = 404;
      throw error;
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString()
    );

    let action = '';

    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      action = 'unfollowed';
    } else {
      currentUser.following.addToSet(targetUserId);
      targetUser.followers.addToSet(currentUserId);
      action = 'followed';

      const notification = await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow',
      });

      await notification.populate('sender', 'username avatar');

      emitToUser(targetUser._id, 'notification', {
        notification,
        message: `${currentUser.username} started following your sphere`,
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    return {
      action,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length,
      targetUser: {
        _id: targetUser._id,
        username: targetUser.username,
      },
    };
  }

  /**
   * Search users by username or bio
   */
  static async searchUsers(query, currentUserId = null) {
    if (!query || query.trim() === '') {
      return [];
    }

    const regex = new RegExp(query.trim(), 'i');

    const users = await User.find({
      $or: [{ username: regex }, { bio: regex }],
    })
      .select('username avatar cover bio location website followers following')
      .limit(20);

    return users.map((u) => ({
      _id: u._id,
      username: u.username,
      avatar: u.avatar,
      cover: u.cover,
      bio: u.bio,
      location: u.location,
      website: u.website,
      followersCount: u.followers.length,
      followingCount: u.following.length,
      isFollowing: currentUserId
        ? u.followers.some((f) => f.toString() === currentUserId.toString())
        : false,
    }));
  }

  /**
   * Who To Follow suggestions
   */
  static async getSuggestions(currentUserId, limit = 5) {
    const currentUser = await User.findById(currentUserId);
    const excludeIds = [currentUser._id, ...currentUser.following];

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
    })
      .select('username avatar bio location followers following')
      .limit(limit);

    return suggestions.map((u) => ({
      _id: u._id,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
      location: u.location,
      followersCount: u.followers.length,
      followingCount: u.following.length,
      isFollowing: false,
    }));
  }
}

module.exports = UserService;
