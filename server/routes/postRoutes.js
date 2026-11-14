const express = require('express');
const {
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  getFeed,
} = require('../controllers/postController');
const {
  addComment,
  getComments,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

// Feed route before /:id to prevent collision
router.get('/feed', protect, getFeed);

// Post CRUD
router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Like toggle
router.put('/:id/like', protect, toggleLike);

// Comments for post
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', optionalAuth, getComments);

module.exports = router;
