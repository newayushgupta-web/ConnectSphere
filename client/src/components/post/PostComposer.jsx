import React, { useState, useRef } from 'react';
import { Image, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const PostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      showToast('Please add some text or an image to post', 'error');
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        showToast('Post shared with your sphere!', 'success');
        setText('');
        removeImage();
        if (onPostCreated) {
          onPostCreated(res.data.data);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish post';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-6 transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt={user?.username}
            className="w-11 h-11 rounded-full object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-700"
          />

          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What's happening in your sphere, ${user?.username}?`}
              maxLength={1000}
              rows={3}
              className="w-full bg-transparent resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-base"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mt-2 mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-80">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-auto object-cover max-h-80 rounded-2xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="post-image-input"
                />
                <label
                  htmlFor="post-image-input"
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  <Image className="w-4 h-4 text-brand-500" />
                  <span>Photo</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs ${text.length > 900 ? 'text-amber-500 font-semibold' : 'text-slate-400'}`}>
                  {text.length}/1000
                </span>

                <button
                  type="submit"
                  disabled={loading || (!text.trim() && !imageFile)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-all hover:shadow hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
