const PostService = require('../services/postService');
const User = require('../models/User');
const Post = require('../models/Post');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { text, imageUrl } = req.body;

  if (!text || text.trim() === '') {
    return ApiResponse.error(res, 'Post text is required', 400);
  }

  const post = await PostService.createPost({
    authorId: req.user._id,
    text: text.trim(),
    imageFile: req.file,
    imageUrl,
  });

  return ApiResponse.success(res, post, 'Post created successfully', 201);
});

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public (Optional Auth)
const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user ? req.user._id : null;

  const post = await PostService.getPostById(id, currentUserId);
  return ApiResponse.success(res, post, 'Post retrieved successfully');
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Owner only)
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return ApiResponse.error(res, 'Post text cannot be empty', 400);
  }

  const updatedPost = await PostService.updatePost(id, req.user._id, { text });
  return ApiResponse.success(res, updatedPost, 'Post updated successfully');
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner only)
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.deletePost(id, req.user._id);
  return ApiResponse.success(res, result, 'Post deleted successfully');
});

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.toggleLike(id, req.user._id, req.user);
  return ApiResponse.success(res, result, `Post ${result.action} successfully`);
});

// @desc    Toggle bookmark on a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.toggleBookmark(id, req.user._id);
  return ApiResponse.success(res, result, `Post ${result.action} successfully`);
});

// @desc    Get user bookmarks
// @route   GET /api/posts/bookmarks
// @access  Private
const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await PostService.getBookmarks(req.user._id);
  return ApiResponse.success(res, bookmarks, 'Bookmarks retrieved successfully');
});

// @desc    Get posts by hashtag
// @route   GET /api/posts/hashtag/:tag
// @access  Public (Optional Auth)
const getByHashtag = asyncHandler(async (req, res) => {
  const { tag } = req.params;
  const currentUserId = req.user ? req.user._id : null;
  const posts = await PostService.getPostsByHashtag(tag, currentUserId);
  return ApiResponse.success(res, posts, 'Posts retrieved by hashtag');
});

// @desc    Get trending hashtags
// @route   GET /api/posts/trending
// @access  Public
const getTrending = asyncHandler(async (req, res) => {
  const trending = await PostService.getTrendingHashtags();
  return ApiResponse.success(res, trending, 'Trending hashtags retrieved successfully');
});

// @desc    Get user feed (posts from followed users + own posts)
// @route   GET /api/posts/feed?page=1&limit=10
// @access  Private
const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id);
  const feedAuthors = [...currentUser.following, currentUser._id];

  let query = { author: { $in: feedAuthors } };

  const feedCount = await Post.countDocuments(query);
  let isDiscovery = false;

  if (feedCount === 0 && currentUser.following.length === 0) {
    query = {};
    isDiscovery = true;
  }

  const total = await Post.countDocuments(query);
  const posts = await Post.find(query)
    .populate('author', 'username avatar bio location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const userBookmarks = currentUser.bookmarks || [];

  const enrichedPosts = posts.map((post) => {
    const postObj = post.toObject();
    postObj.likesCount = post.likes.length;
    postObj.isLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );
    postObj.isBookmarked = userBookmarks.some(
      (id) => id.toString() === post._id.toString()
    );
    postObj.isOwner = post.author._id.toString() === req.user._id.toString();
    return postObj;
  });

  return ApiResponse.success(
    res,
    {
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasMore: page * limit < total,
      },
      isDiscovery,
    },
    'Feed retrieved successfully'
  );
});

module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarks,
  getByHashtag,
  getTrending,
  getFeed,
};
