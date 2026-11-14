const CommentService = require('../services/commentService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return ApiResponse.error(res, 'Comment text is required', 400);
  }

  const comment = await CommentService.addComment(
    postId,
    req.user._id,
    text.trim(),
    req.user
  );

  return ApiResponse.success(res, comment, 'Comment added successfully', 201);
});

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const comments = await CommentService.getCommentsByPost(postId);
  return ApiResponse.success(res, comments, 'Comments retrieved successfully');
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner only)
const deleteComment = asyncHandler(async (req, res) => {
  const { id: commentId } = req.params;
  const result = await CommentService.deleteComment(commentId, req.user._id);
  return ApiResponse.success(res, result, 'Comment deleted successfully');
});

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
