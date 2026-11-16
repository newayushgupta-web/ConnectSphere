import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit3,
  Trash2,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Avatar from '../ui/Avatar';
import CommentSection from '../comment/CommentSection';
import EditPostModal from './EditPostModal';
import ImageLightbox from './ImageLightbox';
import FormattedText from './FormattedText';

const PostCard = ({ post: initialPost, onPostDeleted }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(() => {
    if (!user) return false;
    return (
      post.isLiked ||
      (post.likes &&
        post.likes.some((id) => (id._id || id).toString() === user._id.toString()))
    );
  });
  const [likesCount, setLikesCount] = useState(
    post.likesCount !== undefined ? post.likesCount : post.likes?.length || 0
  );
  const [commentsCount, setCommentsCount] = useState(
    post.commentsCount !== undefined ? post.commentsCount : 0
  );
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (!user) return false;
    return (
      post.isBookmarked ||
      (user.bookmarks &&
        user.bookmarks.some((b) => (b._id || b).toString() === post._id.toString()))
    );
  });

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const lastTapRef = useRef(0);

  const isOwner = user && (post.author?._id || post.author) === user._id;

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to like posts', 'info');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.put(`/posts/${post._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.data.isLiked);
        setLikesCount(res.data.data.likesCount);
      }
    } catch (err) {
      // Revert optimistic update
      setIsLiked(!nextIsLiked);
      setLikesCount((prev) => (!nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to bookmark posts', 'info');
      return;
    }

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    showToast(nextBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success');

    try {
      const res = await api.put(`/posts/${post._id}/bookmark`);
      if (res.data.success) {
        setIsBookmarked(res.data.data.isBookmarked);
        if (updateUser && user) {
          const currentBookmarks = user.bookmarks || [];
          const updated = res.data.data.isBookmarked
            ? [...currentBookmarks, post._id]
            : currentBookmarks.filter((id) => (id._id || id).toString() !== post._id.toString());
          updateUser({ bookmarks: updated });
        }
      }
    } catch (err) {
      setIsBookmarked(!nextBookmarked);
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        handleLikeToggle();
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
    lastTapRef.current = now;
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        showToast('Post deleted', 'success');
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete post', 'error');
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    showToast('Post link copied to clipboard!', 'success');
  };

  const handleCommentCountDelta = (delta) => {
    setCommentsCount((prev) => Math.max(0, prev + delta));
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700/70">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3.5">
        <Link
          to={`/profile/${post.author?.username}`}
          className="flex items-center gap-3 group min-w-0"
        >
          <Avatar
            src={post.author?.avatar}
            name={post.author?.username}
            size="md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.author?.username}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400">
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                : 'Just now'}
            </p>
          </div>
        </Link>

        {/* Owner Dropdown Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Post options"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Text with Hashtag Highlighting */}
      <div className="mb-3.5">
        <Link to={`/posts/${post._id}`}>
          <FormattedText
            text={post.text}
            className="text-slate-800 dark:text-slate-100 text-sm sm:text-base hover:text-slate-900 dark:hover:text-white transition-colors"
          />
        </Link>
      </div>

      {/* Post Image with Lightbox Preview and Double-tap Like */}
      {post.image && (
        <div
          className="relative mb-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group/image cursor-pointer select-none"
          onClick={handleImageTap}
        >
          <img
            src={post.image}
            alt="Post media"
            loading="lazy"
            className="w-full max-h-[480px] object-cover group-hover/image:scale-[1.01] transition-transform duration-300"
          />

          {/* Floating Double-Tap Heart Burst */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-in zoom-in-50 duration-200">
              <Heart className="w-20 h-20 fill-rose-500 text-rose-500 drop-shadow-2xl animate-heart" />
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            aria-label="View full size image"
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md opacity-0 group-hover/image:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-full transition-colors ${
              isLiked
                ? 'text-rose-500 hover:text-rose-600 bg-rose-50/60 dark:bg-rose-950/30'
                : 'hover:text-rose-500 hover:bg-rose-50/60 dark:hover:bg-rose-950/30'
            }`}
          >
            <Heart
              className={`w-4.5 h-4.5 transition-transform ${
                isLiked ? 'fill-rose-500 stroke-rose-500 animate-heart' : ''
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            aria-label="View and add comments"
            className="flex items-center gap-2 py-1 px-2.5 rounded-full hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* Right Actions: Bookmark & Share */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBookmarkToggle}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
                : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            aria-label="Share post link"
            className="p-2 rounded-full hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Comments Trigger */}
      {commentsCount > 0 && !showComments && (
        <button
          onClick={() => setShowComments(true)}
          className="mt-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors block text-left"
        >
          View all {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {/* Embedded Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          onCommentCountChange={handleCommentCountDelta}
        />
      )}

      {/* Lightbox Modal */}
      <ImageLightbox
        src={post.image}
        alt={post.text}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Edit Modal */}
      <EditPostModal
        post={post}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPostUpdated={(updated) => setPost((prev) => ({ ...prev, ...updated }))}
      />
    </article>
  );
};

export default PostCard;
