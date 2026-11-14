import React, { useState, useRef } from 'react';
import { Image, X, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

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
      showToast('Please add text or a photo to post', 'error');
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
        showToast('Your post is live in the sphere!', 'success');
        setText('');
        removeImage();
        if (onPostCreated) {
          onPostCreated(res.data.data);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-6 transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3.5">
          <Avatar
            src={user?.avatar}
            name={user?.username}
            size="md"
            status="online"
          />

          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What's happening in your sphere, ${user?.username || 'friend'}?`}
              maxLength={1000}
              rows={3}
              className="w-full bg-transparent resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-sm sm:text-base leading-relaxed"
            />

            {/* Image Preview with Remove Button */}
            {imagePreview && (
              <div className="relative mt-2 mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-80 animate-in fade-in zoom-in-95 duration-150">
                <img
                  src={imagePreview}
                  alt="Post attachment preview"
                  className="w-full h-auto object-cover max-h-80 rounded-2xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="composer-image-upload"
                />
                <label
                  htmlFor="composer-image-upload"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  <Image className="w-4 h-4 text-indigo-500" />
                  <span>Photo</span>
                </label>

                <button
                  type="button"
                  onClick={() => setText((prev) => (prev ? `${prev} #ConnectSphere` : '#ConnectSphere'))}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Add tag</span>
                </button>
              </div>

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
                  size="sm"
                  variant="primary"
                  isLoading={loading}
                  disabled={!text.trim() && !imageFile}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
