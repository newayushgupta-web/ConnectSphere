import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../ui/Avatar';

const CommentSection = ({ postId, onCommentCountChange }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        if (res.data.success) {
          setComments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!isAuthenticated) {
      showToast('Please sign in to leave a comment', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        text: text.trim(),
      });

      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setText('');
        if (onCommentCountChange) {
          onCommentCountChange(1);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        showToast('Comment deleted', 'success');
        if (onCommentCountChange) {
          onCommentCountChange(-1);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-4 text-xs text-slate-400">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            No comments yet. Be the first to share your perspective!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && comment.author?._id === user._id;

            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Link to={`/profile/${comment.author?.username}`}>
                    <Avatar
                      src={comment.author?.avatar}
                      name={comment.author?.username}
                      size="sm"
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${comment.author?.username}`}
                        className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {comment.author?.username}
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        {comment.createdAt
                          ? formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 break-words leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    aria-label="Delete comment"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <Avatar src={user?.avatar} name={user?.username} size="sm" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={300}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs px-4 py-2.5 rounded-full border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            aria-label="Post comment"
            className="p-2.5 rounded-full bg-gradient-brand text-white shadow-sm disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-2 text-xs text-slate-400">
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>{' '}
          to join this discussion.
        </div>
      )}
    </div>
  );
};

export default CommentSection;
