import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, UserPlus, UserCheck } from 'lucide-react';
import api from '../../services/api';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import { useToast } from '../../context/ToastContext';

const trendingTopics = [
  { tag: 'FullStack', posts: '2.4k posts' },
  { tag: 'React18', posts: '1.8k posts' },
  { tag: 'TailwindCSS', posts: '950 posts' },
  { tag: 'WebDev', posts: '3.1k posts' },
  { tag: 'OpenSource', posts: '840 posts' },
];

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/users/suggestions');
        if (res.data.success) {
          setSuggestions(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleFollowToggle = async (userId, username) => {
    try {
      const isFollowing = !!followingMap[userId];
      setFollowingMap((prev) => ({ ...prev, [userId]: !isFollowing }));

      const res = await api.put(`/users/${userId}/follow`);
      if (res.data.success) {
        showToast(
          res.data.data.isFollowing ? `Followed @${username}` : `Unfollowed @${username}`,
          'success'
        );
      }
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
      showToast('Action failed. Please try again.', 'error');
    }
  };

  return (
    <aside className="hidden xl:block w-80 space-y-5 sticky top-6 h-fit">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search creators & topics..."
          className="w-full bg-white dark:bg-slate-900 text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-soft transition-all"
        />
      </form>

      {/* Who To Follow */}
      <Card padding="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Who to follow
            </h3>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Explore
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-1">
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-14 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="w-16 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            No suggestions available right now.
          </p>
        ) : (
          <div className="space-y-3.5">
            {suggestions.map((u) => {
              const isFollowing = !!followingMap[u._id];

              return (
                <div key={u._id} className="flex items-center justify-between gap-3 group">
                  <Link
                    to={`/profile/${u.username}`}
                    className="flex items-center gap-2.5 min-w-0"
                  >
                    <Avatar src={u.avatar} name={u.username} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {u.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[110px]">
                        {u.bio || `${u.followersCount} followers`}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleFollowToggle(u._id, u.username)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                        : 'bg-gradient-brand text-white hover:brightness-105'
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
        )}
      </Card>

      {/* Trending Topics */}
      <Card padding="p-5">
        <div className="flex items-center gap-2 mb-3.5">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Trending in the Sphere
          </h3>
        </div>

        <div className="space-y-2.5">
          {trendingTopics.map((topic) => (
            <button
              key={topic.tag}
              type="button"
              onClick={() => navigate(`/search?q=${topic.tag}`)}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  #{topic.tag}
                </p>
                <p className="text-[10px] text-slate-400">{topic.posts}</p>
              </div>
              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore →
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Footer Info */}
      <footer className="px-4 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          <Link to="/search" className="hover:underline">About</Link>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Terms</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">API</span>
        </div>
        <p>© {new Date().getFullYear()} ConnectSphere • CodeAlpha Task 2</p>
      </footer>
    </aside>
  );
};

export default RightSidebar;
