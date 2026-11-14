const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

class CommentService {
  /**
   * Add a comment to a post
   */
  static async addComment(postId, authorId, text, userObj) {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const comment = await Comment.create({
      post: postId,
      author: authorId,
      text,
    });

    // Increment comment count on post
    post.commentsCount += 1;
    await post.save();

    await comment.populate('author', 'username avatar');

    // Notify post author if not self-commenting
    if (post.author.toString() !== authorId.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: authorId,
        type: 'comment',
        post: post._id,
      });

      await notification.populate('sender', 'username avatar');

      emitToUser(post.author, 'notification', {
        notification,
        message: `${userObj.username} commented on your post: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      });
    }

    return comment;
  }

  /**
   * Get all comments for a post
   */
  static async getCommentsByPost(postId) {
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    return comments;
  }

  /**
   * Delete comment (owner only)
   */
  static async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      const error = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }

    // Owner check
    if (comment.author.toString() !== userId.toString()) {
      const error = new Error('Not authorized to delete this comment');
      error.statusCode = 403;
      throw error;
    }

    await Comment.findByIdAndDelete(commentId);

    // Decrement post commentsCount
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 },
    });

    return { commentId, postId: comment.post };
  }
}

module.exports = CommentService;
