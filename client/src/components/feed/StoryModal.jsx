import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Trash2, Plus } from 'lucide-react';
import Avatar from '../ui/Avatar';

const StoryModal = ({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
  onDeleteOwnStory,
  onOpenCreateStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setLiked(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const DURATION = 5000; // 5 seconds per story
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story if available
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((curr) => curr + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  if (!isOpen || !stories || stories.length === 0) return null;

  const currentStory = stories[currentIndex] || stories[0];
  const isOwnStory = Boolean(currentStory.isOwnStory);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((curr) => curr - 1);
      setProgress(0);
      setLiked(false);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((curr) => curr + 1);
      setProgress(0);
      setLiked(false);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close story viewer"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev / Next desktop chevron triggers */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          aria-label="Previous story"
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          aria-label="Next story"
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story Card Container */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[85vh] max-h-[750px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 flex flex-col justify-between">
        {/* Story Background Media: Either Image OR Gradient */}
        {currentStory.media ? (
          <img
            src={currentStory.media}
            alt={currentStory.caption || 'Story'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 ${currentStory.gradient || 'bg-gradient-brand'}`} />
        )}

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Top Progress Bars and User Info */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Multi-story progress indicators */}
          <div className="flex gap-1.5 w-full">
            {stories.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      i < currentIndex
                        ? '100%'
                        : i === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User profile row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={currentStory.user.avatar}
                name={currentStory.user.username}
                size="sm"
                className="border border-white/80"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">
                    {isOwnStory ? 'Your story' : currentStory.user.username}
                  </span>
                  {isOwnStory && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold">
                      You
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/70">
                  {currentStory.timeAgo || '2h ago'}
                </span>
              </div>
            </div>

            {/* Actions for own story: Delete or Add another */}
            {isOwnStory && (
              <div className="flex items-center gap-2">
                {onOpenCreateStory && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onOpenCreateStory();
                    }}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    title="Add new story"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                {onDeleteOwnStory && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOwnStory();
                      onClose();
                    }}
                    className="p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                    title="Delete your story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clickable tap zones for mobile/fast navigation */}
        <div className="absolute inset-y-16 inset-x-0 flex z-10">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Bottom Caption & Reply Bar */}
        <div className="relative z-20 p-4 space-y-3">
          {currentStory.caption && (
            <p className="text-sm text-white font-medium drop-shadow-md text-center bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              {currentStory.caption}
            </p>
          )}

          {/* Reply and Like bar (only for others' stories) */}
          {!isOwnStory ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Reply to ${currentStory.user.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      setReplyText('');
                    }
                  }}
                  className="w-full text-xs py-2.5 pl-3.5 pr-9 rounded-full bg-white/20 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 backdrop-blur-md"
                />
                <button
                  type="button"
                  onClick={() => setReplyText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setLiked((prev) => !prev)}
                aria-label="Like story"
                className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
              >
                <Heart
                  className={`w-4.5 h-4.5 transition-transform ${
                    liked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                  }`}
                />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-[11px] text-white/80 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                Seen by sphere creators • Active for 24h
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
