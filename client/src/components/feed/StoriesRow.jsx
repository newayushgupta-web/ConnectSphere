import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../ui/Avatar';
import StoryModal from './StoryModal';
import CreateStoryModal from './CreateStoryModal';

const sampleStories = [
  {
    id: 's1',
    user: {
      username: 'maya_designer',
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    media: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    caption: 'Finishing up the design system update for ConnectSphere! 🎨✨',
    timeAgo: '1h ago',
  },
  {
    id: 's2',
    user: {
      username: 'alex_tech',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    media: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    caption: 'Coffee + late night coding session. Shipped new auth flow ☕🚀',
    timeAgo: '3h ago',
  },
  {
    id: 's3',
    user: {
      username: 'dev_sam',
      name: 'Sam Patel',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    media: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    caption: 'Building real-time WebSockets with Socket.io! Zero latency ⚡',
    timeAgo: '5h ago',
  },
  {
    id: 's4',
    user: {
      username: 'elena_photo',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
    media: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    caption: 'Night Tokyo streets through 35mm lens 🗼📸',
    timeAgo: '6h ago',
  },
  {
    id: 's5',
    user: {
      username: 'jordan_ai',
      name: 'Jordan AI',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
    media: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    caption: 'Reviewing PRs on this sunny afternoon 💻☀️',
    timeAgo: '8h ago',
  },
];

const StoriesRow = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [myStory, setMyStory] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  // Load user's story from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('connectsphere_my_story');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Expire after 24 hours
        const diff = Date.now() - new Date(parsed.createdAt).getTime();
        if (diff < 24 * 60 * 60 * 1000) {
          setMyStory(parsed);
        } else {
          localStorage.removeItem('connectsphere_my_story');
        }
      }
    } catch (e) {
      console.error('Error loading story from storage:', e);
    }
  }, []);

  const handleStoryCreated = (newStory) => {
    setMyStory(newStory);
  };

  const handleDeleteOwnStory = () => {
    localStorage.removeItem('connectsphere_my_story');
    setMyStory(null);
    showToast('Your story has been removed', 'info');
  };

  // Compile full stories list: If user has a story, put it first!
  const fullStoriesList = myStory
    ? [{ ...myStory, isOwnStory: true }, ...sampleStories]
    : sampleStories;

  const handleUserStoryClick = (e) => {
    e.stopPropagation();
    if (myStory) {
      // User has a story -> open user's story in viewer!
      setActiveStoryIndex(0);
    } else {
      // No story -> open Create Story Modal!
      setIsCreateOpen(true);
    }
  };

  const handlePlusBadgeClick = (e) => {
    e.stopPropagation();
    setIsCreateOpen(true);
  };

  const handleCreatorStoryClick = (creatorStoryIndex) => {
    // If myStory is present, creator stories start at index + 1
    const targetIndex = myStory ? creatorStoryIndex + 1 : creatorStoryIndex;
    setActiveStoryIndex(targetIndex);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-5 overflow-hidden">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {/* USER'S OWN STORY ITEM */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
            <div className="relative cursor-pointer">
              {/* Outer ring: Gradient if story active, else neutral */}
              <div
                onClick={handleUserStoryClick}
                className={`p-[2.5px] rounded-full transition-transform group-hover:scale-105 ${
                  myStory
                    ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 ring-2 ring-indigo-500/30'
                    : 'bg-slate-200 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                title={myStory ? 'View your active story' : 'Add to your story'}
              >
                <Avatar
                  src={user?.avatar}
                  name={user?.username || 'You'}
                  size="lg"
                  className="border-2 border-white dark:border-slate-900"
                />
              </div>

              {/* Instagram-style Plus Badge (always clickable to create/add) */}
              <button
                type="button"
                onClick={handlePlusBadgeClick}
                aria-label="Add to story"
                title="Add to story"
                className={`absolute bottom-0 right-0 p-1 rounded-full text-white border-2 border-white dark:border-slate-900 shadow-sm transition-transform hover:scale-125 focus:outline-none ${
                  myStory ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gradient-brand'
                }`}
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleUserStoryClick}
              className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[68px] hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
            >
              {myStory ? 'Your story' : 'Your story'}
            </button>
          </div>

          {/* OTHER CREATORS' STORIES */}
          {sampleStories.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => handleCreatorStoryClick(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
            >
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 group-hover:scale-105 transition-transform">
                <Avatar
                  src={story.user.avatar}
                  name={story.user.name || story.user.username}
                  size="lg"
                  className="border-2 border-white dark:border-slate-900"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[64px] group-hover:text-slate-900 dark:group-hover:text-white">
                {story.user.username.split('_')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CREATE STORY MODAL */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={handleStoryCreated}
      />

      {/* STORY VIEWER MODAL */}
      <StoryModal
        stories={fullStoriesList}
        initialIndex={activeStoryIndex ?? 0}
        isOpen={activeStoryIndex !== null}
        onClose={() => setActiveStoryIndex(null)}
        onDeleteOwnStory={handleDeleteOwnStory}
        onOpenCreateStory={() => setIsCreateOpen(true)}
      />
    </>
  );
};

export default StoriesRow;
