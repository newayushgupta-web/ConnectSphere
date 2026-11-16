const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

class PostService {
  /**
   * Create a new post
   */
  static async createPost({ authorId, text, imageFile = null, imageUrl = null }) {
    let image = null;
    if (imageFile) {
      image = `/uploads/${imageFile.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    }

    const post = new Post({
      author: authorId,
      text,
      image,
    });

    await post.save();
    await post.populate('author', 'username avatar bio location');
    return post;
  }

  /**
   * Get single post by ID
   */
  static async getPostById(postId, currentUserId = null) {
    const post = await Post.findById(postId).populate('author', 'username avatar bio location');
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    let isBookmarked = false;
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select('bookmarks');
      if (currentUser && currentUser.bookmarks) {
        isBookmarked = currentUser.bookmarks.some((id) => id.toString() === postId.toString());
      }
    }

    const postObj = post.toObject();
    postObj.likesCount = post.likes.length;
    postObj.isLiked = currentUserId
      ? post.likes.some((id) => id.toString() === currentUserId.toString())
      : false;
    postObj.isBookmarked = isBookmarked;
    postObj.isOwner = currentUserId
      ? post.author._id.toString() === currentUserId.toString()
      : false;

    return postObj;
  }

  /**
   * Update post (text only, owner only)
   */
  static async updatePost(postId, userId, { text }) {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.author.toString() !== userId.toString()) {
      const error = new Error('Not authorized to edit this post');
      error.statusCode = 403;
      throw error;
    }

    if (text !== undefined) {
      post.text = text;
    }

    await post.save();
    await post.populate('author', 'username avatar bio location');
    return post;
  }

  /**
   * Delete post (owner only)
   */
  static async deletePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.author.toString() !== userId.toString()) {
      const error = new Error('Not authorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    await Promise.all([
      Post.findByIdAndDelete(postId),
      Comment.deleteMany({ post: postId }),
      Notification.deleteMany({ post: postId }),
      User.updateMany({ bookmarks: postId }, { $pull: { bookmarks: postId } }),
    ]);

    return { postId };
  }

  /**
   * Toggle like on post
   */
  static async toggleLike(postId, userId, userObj) {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const isLiked = post.likes.some((id) => id.toString() === userId.toString());
    let action = '';

    if (isLiked) {
      post.likes.pull(userId);
      action = 'unliked';
    } else {
      post.likes.addToSet(userId);
      action = 'liked';

      if (post.author.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'like',
          post: post._id,
        });

        await notification.populate('sender', 'username avatar');

        emitToUser(post.author, 'notification', {
          notification,
          message: `${userObj.username} liked your post`,
        });
      }
    }

    await post.save();

    return {
      action,
      isLiked: !isLiked,
      likesCount: post.likes.length,
      postId: post._id,
    };
  }

  /**
   * Toggle bookmark on post
   */
  static async toggleBookmark(postId, userId) {
    const [post, user] = await Promise.all([
      Post.findById(postId),
      User.findById(userId),
    ]);

    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === postId.toString()
    );

    let action = '';
    if (isBookmarked) {
      user.bookmarks.pull(postId);
      action = 'unbookmarked';
    } else {
      user.bookmarks.addToSet(postId);
      action = 'bookmarked';
    }

    await user.save();

    return {
      action,
      isBookmarked: !isBookmarked,
      postId,
    };
  }

  /**
   * Get user bookmarks
   */
  static async getBookmarks(userId) {
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'username avatar bio location' },
      options: { sort: { createdAt: -1 } },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user.bookmarks.map((post) => {
      const postObj = post.toObject();
      postObj.likesCount = post.likes.length;
      postObj.isLiked = post.likes.some((id) => id.toString() === userId.toString());
      postObj.isBookmarked = true;
      postObj.isOwner = post.author._id.toString() === userId.toString();
      return postObj;
    });
  }

  /**
   * Get posts by hashtag
   */
  static async getPostsByHashtag(tag, currentUserId = null) {
    const cleanTag = tag.toLowerCase().replace(/^#/, '');
    const posts = await Post.find({ hashtags: cleanTag })
      .populate('author', 'username avatar bio location')
      .sort({ createdAt: -1 })
      .limit(50);

    let userBookmarks = [];
    if (currentUserId) {
      const user = await User.findById(currentUserId).select('bookmarks');
      if (user) userBookmarks = user.bookmarks || [];
    }

    return posts.map((post) => {
      const postObj = post.toObject();
      postObj.likesCount = post.likes.length;
      postObj.isLiked = currentUserId
        ? post.likes.some((id) => id.toString() === currentUserId.toString())
        : false;
      postObj.isBookmarked = currentUserId
        ? userBookmarks.some((id) => id.toString() === post._id.toString())
        : false;
      postObj.isOwner = currentUserId
        ? post.author._id.toString() === currentUserId.toString()
        : false;
      return postObj;
    });
  }

  /**
   * Get top trending hashtags
   */
  static async getTrendingHashtags(limit = 6) {
    const result = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((item) => ({
      tag: item._id,
      count: item.count,
      posts: `${item.count} ${item.count === 1 ? 'post' : 'posts'}`,
    }));
  }
}

module.exports = PostService;
