const express = require('express');
const {
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
} = require('../controllers/postController');
const {
  addComment,
  getComments,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

// Specific routes first to prevent collision with :id
router.get('/feed', protect, getFeed);
router.get('/bookmarks', protect, getBookmarks);
router.get('/trending', getTrending);
router.get('/hashtag/:tag', optionalAuth, getByHashtag);

// Post CRUD
router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Interactions (Like & Bookmark)
router.put('/:id/like', protect, toggleLike);
router.put('/:id/bookmark', protect, toggleBookmark);

// Comments for post
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', optionalAuth, getComments);

module.exports = router;
