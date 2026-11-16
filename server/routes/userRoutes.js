const express = require('express');
const {
  getProfile,
  updateMe,
  toggleFollow,
  getFollowers,
  getFollowing,
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

// Profile updates (avatar and cover images)
router.put(
  '/me',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  updateMe
);

// Follow toggle & lists
router.put('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', optionalAuth, getFollowers);
router.get('/:id/following', optionalAuth, getFollowing);

// User profile & posts
router.get('/:username', optionalAuth, getProfile);
router.get('/:username/posts', optionalAuth, getUserPosts);

module.exports = router;
