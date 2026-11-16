import React, { useState, useRef } from 'react';
import { Image, X, Sparkles, Send, Palette, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const PRESET_GRADIENTS = [
  { id: 'grad-sunset', label: 'Sunset', bg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600', media: 'gradient:sunset' },
  { id: 'grad-neon', label: 'Neon Cyber', bg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500', media: 'gradient:neon' },
  { id: 'grad-ocean', label: 'Deep Ocean', bg: 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-900', media: 'gradient:ocean' },
  { id: 'grad-emerald', label: 'Emerald Forest', bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900', media: 'gradient:emerald' },
  { id: 'grad-midnight', label: 'Midnight Glow', bg: 'bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900', media: 'gradient:midnight' },
];

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedGradient, setSelectedGradient] = useState(PRESET_GRADIENTS[0]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size exceeds 8MB limit', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setMediaPreview(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShareStory = () => {
    if (!mediaPreview && !caption.trim() && !selectedGradient) {
      showToast('Please add a photo or text for your story', 'error');
      return;
    }

    setLoading(true);

    const storyObject = {
      id: `user-story-${Date.now()}`,
      isOwnStory: true,
      user: {
        username: user?.username || 'You',
        name: user?.name || user?.username || 'You',
        avatar: user?.avatar,
      },
      media: mediaPreview || null,
      gradient: !mediaPreview ? selectedGradient.bg : null,
      caption: caption.trim(),
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('connectsphere_my_story', JSON.stringify(storyObject));
      showToast('Your story is live in your sphere! 🌟', 'success');

      if (onStoryCreated) {
        onStoryCreated(storyObject);
      }

      // Reset
      setCaption('');
      setMediaPreview(null);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save story. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Your Story"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Instagram-style Vertical Preview Card */}
        <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 bg-slate-900 select-none">
          {/* Background: Either Uploaded Photo OR Gradient */}
          {mediaPreview ? (
            <img
              src={mediaPreview}
              alt="Story preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className={`absolute inset-0 ${selectedGradient.bg}`} />
          )}

          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none" />

          {/* Story Header (Progress bar + User info) */}
          <div className="relative z-10 space-y-2">
            <div className="h-1 w-full rounded-full bg-white/40 overflow-hidden">
              <div className="h-full bg-white w-2/3" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Avatar
                  src={user?.avatar}
                  name={user?.username}
                  size="sm"
                  className="border border-white/80"
                />
                <span className="text-xs font-bold">{user?.username || 'You'}</span>
                <span className="text-[10px] text-white/80">Just now</span>
              </div>

              {mediaPreview && (
                <button
                  type="button"
                  onClick={removeMedia}
                  className="p-1 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Story Caption / Text overlay */}
          <div className="relative z-10">
            {caption.trim() ? (
              <p className="text-sm font-semibold text-white drop-shadow-lg text-center bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                {caption}
              </p>
            ) : (
              <p className="text-xs text-white/60 italic text-center">
                Type your caption below...
              </p>
            )}
          </div>
        </div>

        {/* Upload Media / Camera button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            id="story-photo-input"
          />
          <label
            htmlFor="story-photo-input"
            className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Camera className="w-4 h-4 text-indigo-500" />
            <span>{mediaPreview ? 'Change Story Photo' : 'Upload Story Photo'}</span>
          </label>
        </div>

        {/* Gradient Presets (if no photo uploaded) */}
        {!mediaPreview && (
          <div>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-2">
              <Palette className="w-3.5 h-3.5" /> Choose Background Style:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_GRADIENTS.map((grad) => (
                <button
                  key={grad.id}
                  type="button"
                  onClick={() => setSelectedGradient(grad)}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl ${grad.bg} transition-all duration-150 ${
                    selectedGradient.id === grad.id
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-md'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={grad.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Caption Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Story Caption
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What are you up to? Add a caption or emoji... ✨"
            maxLength={180}
            className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <div className="text-[10px] text-slate-400 text-right mt-1">
            {caption.length}/180
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={handleShareStory}
            isLoading={loading}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Share to Story
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateStoryModal;
