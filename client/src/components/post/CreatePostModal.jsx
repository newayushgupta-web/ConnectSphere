import React, { useState, useRef, useEffect } from 'react';
import { Image, X, Sparkles, Send, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const SUGGESTED_TAGS = ['#ConnectSphere', '#FullStack', '#React18', '#WebDev', '#Design'];

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (textareaRef.current) textareaRef.current.focus();
      }, 100);
    } else {
      setText('');
      removeImage();
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = (tag) => {
    setText((prev) => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev} ${tag}` : tag;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      showToast('Please add text or an image to post', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast('Your post has been published! 🚀', 'success');
        const createdPost = res.data.data;

        // Notify local listener or parent
        if (onPostCreated) {
          onPostCreated(createdPost);
        }
        // Broadcast custom event for feed listeners across the app
        window.dispatchEvent(
          new CustomEvent('connectsphere:post-created', { detail: createdPost })
        );

        setText('');
        removeImage();
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Post"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Header */}
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar}
            name={user?.username}
            size="md"
            status="online"
          />
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {user?.username}
            </div>
            <div className="text-xs text-slate-400">
              Posting to Community Sphere
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's happening in your sphere, ${user?.username || 'friend'}?`}
            maxLength={1000}
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm leading-relaxed resize-none"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-72 animate-in fade-in zoom-in-95 duration-150">
            <img
              src={imagePreview}
              alt="Post preview"
              className="w-full h-auto object-cover max-h-72"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Hash className="w-3 h-3" /> Tags:
          </span>
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* File Upload Trigger */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              id="modal-post-image-upload"
            />
            <label
              htmlFor="modal-post-image-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Image className="w-4 h-4 text-indigo-500" />
              <span>{imageFile ? 'Change Photo' : 'Add Photo'}</span>
            </label>
          </div>

          {/* Char Counter & Submit */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${
                text.length > 900
                  ? 'text-rose-500 font-bold'
                  : text.length > 700
                  ? 'text-amber-500 font-medium'
                  : 'text-slate-400'
              }`}
            >
              {text.length}/1000
            </span>

            <Button
              type="submit"
              variant="gradient"
              isLoading={loading}
              disabled={!text.trim() && !imageFile}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Publish Post
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
