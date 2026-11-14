import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import CommentSection from '../comment/CommentSection';
import EditPostModal from './EditPostModal';

const PostCard = ({ post: initialPost, onPostDeleted }) => {
  const { user, isAuthenticated } = useAuth();
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
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = user && (post.author?._id || post.author) === user._id;

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to like posts', 'info');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
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
    <article className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-5 transition-all">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3.5">
        <Link
          to={`/profile/${post.author?.username}`}
          className="flex items-center gap-3 group"
        >
          <img
            src={
              post.author?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.username}`
            }
            alt={post.author?.username}
            className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-brand-500/30 transition-all"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {post.author?.username}
            </h4>
            <p className="text-[11px] text-slate-400">
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })
                : 'Just now'}
            </p>
          </div>
        </Link>

        {/* Owner Menu / Dropdown */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
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
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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

      {/* Post Text */}
      <Link to={`/posts/${post._id}`}>
        <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed mb-3 whitespace-pre-line hover:text-slate-900 dark:hover:text-white transition-colors">
          {post.text}
        </p>
      </Link>

      {/* Post Image */}
      {post.image && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
          <img
            src={post.image}
            alt="Post media"
            loading="lazy"
            className="w-full max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 p-1.5 rounded-full transition-colors ${
              isLiked
                ? 'text-rose-500 hover:text-rose-600'
                : 'hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-transform ${
                isLiked ? 'fill-rose-500 stroke-rose-500 animate-heart' : ''
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment Toggle Button */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1.5 p-1.5 rounded-full hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-1.5 rounded-full hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
          title="Share post"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Embedded Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          onCommentCountChange={handleCommentCountDelta}
        />
      )}

      {/* Edit Post Modal */}
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
