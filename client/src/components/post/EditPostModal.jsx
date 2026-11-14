import React, { useState } from 'react';
import { Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const EditPostModal = ({ post, isOpen, onClose, onPostUpdated }) => {
  const [text, setText] = useState(post?.text || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      showToast('Post text cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/posts/${post._id}`, { text: text.trim() });
      if (res.data.success) {
        showToast('Post updated successfully', 'success');
        if (onPostUpdated) {
          onPostUpdated(res.data.data);
        }
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={1000}
          className="w-full bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            {text.length}/1000
          </span>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
              disabled={!text.trim()}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditPostModal;
