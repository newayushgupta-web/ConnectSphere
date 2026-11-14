const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Delete comment (owner only)
router.delete('/:id', protect, deleteComment);

module.exports = router;
