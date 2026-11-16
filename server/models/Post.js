const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [1000, 'Post content cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });

// Helper to extract hashtags from text
postSchema.pre('save', function (next) {
  if (this.isModified('text') && this.text) {
    const matches = this.text.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      this.hashtags = [
        ...new Set(matches.map((tag) => tag.substring(1).toLowerCase())),
      ];
    } else {
      this.hashtags = [];
    }
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
