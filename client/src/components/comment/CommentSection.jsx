import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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
      showToast('Please log in to leave a comment', 'info');
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
          <div className="text-center py-4 text-xs text-slate-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && comment.author?._id === user._id;

            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Link to={`/profile/${comment.author?.username}`}>
                    <img
                      src={
                        comment.author?.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.username}`
                      }
                      alt={comment.author?.username}
                      className="w-7 h-7 rounded-full object-cover bg-slate-200 dark:bg-slate-700 mt-0.5"
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${comment.author?.username}`}
                        className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
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
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                    title="Delete Comment"
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
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={300}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-full border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="p-2 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-all shadow-sm"
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
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Log in
          </Link>{' '}
          to join the conversation.
        </div>
      )}
    </div>
  );
};

export default CommentSection;
