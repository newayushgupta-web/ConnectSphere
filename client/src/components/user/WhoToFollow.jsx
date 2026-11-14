import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserCardSkeleton } from '../common/SkeletonLoader';

const WhoToFollow = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/users/suggestions');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollowToggle = async (targetId, username) => {
    try {
      const isCurrentlyFollowing = !!followingMap[targetId];
      // Optimistic update
      setFollowingMap((prev) => ({
        ...prev,
        [targetId]: !isCurrentlyFollowing,
      }));

      const res = await api.put(`/users/${targetId}/follow`);
      if (res.data.success) {
        showToast(
          res.data.data.isFollowing
            ? `Followed @${username}`
            : `Unfollowed @${username}`,
          'success'
        );
      }
    } catch (err) {
      // Revert optimistic update
      setFollowingMap((prev) => ({
        ...prev,
        [targetId]: !prev[targetId],
      }));
      showToast('Action failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-800 dark:text-slate-100">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Who to follow</span>
        </div>
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-soft">
      <div className="flex items-center gap-2 mb-3 font-bold text-sm text-slate-800 dark:text-slate-100">
        <Sparkles className="w-4 h-4 text-brand-500" />
        <span>Who to follow</span>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const isFollowing = !!followingMap[user._id];

          return (
            <div
              key={user._id}
              className="flex items-center justify-between gap-3 group"
            >
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-2.5 min-w-0"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                    {user.bio || `${user.followersCount} followers`}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleFollowToggle(user._id, user.username)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isFollowing
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhoToFollow;
