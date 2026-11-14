const express = require('express');
const {
  getProfile,
  updateMe,
  toggleFollow,
  searchUsers,
  getSuggestions,
  getUserPosts,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

// Specific routes first to prevent collision with :username
router.get('/search', optionalAuth, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.put('/me', protect, upload.single('avatar'), updateMe);
router.put('/:id/follow', protect, toggleFollow);
router.get('/:username', optionalAuth, getProfile);
router.get('/:username/posts', optionalAuth, getUserPosts);

module.exports = router;
