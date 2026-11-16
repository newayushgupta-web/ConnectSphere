import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import StoryModal from './StoryModal';

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
      username: 'jordan_k',
      name: 'Jordan King',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
    media: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    caption: 'Reviewing PRs on this sunny afternoon 💻☀️',
    timeAgo: '8h ago',
  },
];

const StoriesRow = () => {
  const { user } = useAuth();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-5 overflow-hidden">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {/* User's own story item */}
          <button
            type="button"
            onClick={() => setSelectedStoryIndex(0)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
          >
            <div className="relative">
              <div className="p-[2px] rounded-full bg-slate-200 dark:bg-slate-700 group-hover:scale-105 transition-transform">
                <Avatar
                  src={user?.avatar}
                  name={user?.username || 'You'}
                  size="lg"
                  className="border-2 border-white dark:border-slate-900"
                />
              </div>
              <div className="absolute bottom-0 right-0 p-1 rounded-full bg-indigo-600 text-white border-2 border-white dark:border-slate-900 shadow-sm">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
              Your story
            </span>
          </button>

          {/* Creators Stories */}
          {sampleStories.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setSelectedStoryIndex(idx)}
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
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
                {story.user.username.split('_')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <StoryModal
        stories={sampleStories}
        initialIndex={selectedStoryIndex ?? 0}
        isOpen={selectedStoryIndex !== null}
        onClose={() => setSelectedStoryIndex(null)}
      />
    </>
  );
};

export default StoriesRow;
