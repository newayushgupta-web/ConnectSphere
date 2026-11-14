const Post = require('../models/Post');
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

    const post = await Post.create({
      author: authorId,
      text,
      image,
    });

    await post.populate('author', 'username avatar bio');
    return post;
  }

  /**
   * Get single post by ID
   */
  static async getPostById(postId, currentUserId = null) {
    const post = await Post.findById(postId).populate('author', 'username avatar bio');
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const postObj = post.toObject();
    postObj.likesCount = post.likes.length;
    postObj.isLiked = currentUserId
      ? post.likes.some((id) => id.toString() === currentUserId.toString())
      : false;
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

    // Owner check
    if (post.author.toString() !== userId.toString()) {
      const error = new Error('Not authorized to edit this post');
      error.statusCode = 403;
      throw error;
    }

    if (text !== undefined) {
      post.text = text;
    }

    await post.save();
    await post.populate('author', 'username avatar bio');
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

    // Owner check
    if (post.author.toString() !== userId.toString()) {
      const error = new Error('Not authorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    // Cascade delete associated comments and notifications
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Comment.deleteMany({ post: postId }),
      Notification.deleteMany({ post: postId }),
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
      // Unlike
      post.likes.pull(userId);
      action = 'unliked';
    } else {
      // Like
      post.likes.addToSet(userId);
      action = 'liked';

      // Send notification to author if not liking own post
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
}

module.exports = PostService;
