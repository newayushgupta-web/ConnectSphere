import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, UserPlus, UserCheck, Users, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonAvatar, SkeletonLine } from '../components/ui/Skeleton';

const quickTags = ['FullStack', 'React18', 'UIUX', 'TailwindCSS', 'OpenSource'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingMap, setFollowingMap] = useState({});
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Explore & Search | ConnectSphere';
  }, []);

  useEffect(() => {
    const term = searchParams.get('q');
    if (term) {
      setQuery(term);
      performSearch(term);
    }
  }, [searchParams]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    setSearchParams({ q: tag });
    performSearch(tag);
  };

  const handleFollowToggle = async (targetId, username) => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow users', 'info');
      return;
    }

    try {
      const isCurrentlyFollowing =
        followingMap[targetId] !== undefined
          ? followingMap[targetId]
          : results.find((r) => r._id === targetId)?.isFollowing;

      // Optimistic update
      setFollowingMap((prev) => ({
        ...prev,
        [targetId]: !isCurrentlyFollowing,
      }));

      const res = await api.put(`/users/${targetId}/follow`);
      if (res.data.success) {
        showToast(
          res.data.data.isFollowing ? `Followed @${username}` : `Unfollowed @${username}`,
          'success'
        );
      }
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [targetId]: !prev[targetId] }));
      showToast('Action failed. Please try again.', 'error');
    }
  };

  return (
    <div className="w-full">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Explore the Community
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Search creators, colleagues, and trending discussions across ConnectSphere.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or bio keywords..."
            className="w-full bg-white dark:bg-slate-900 pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-soft focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Suggested:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors flex-shrink-0"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="p-4" className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <SkeletonAvatar size="w-12 h-12" />
                <div className="space-y-1.5">
                  <SkeletonLine width="w-28" height="h-3.5" />
                  <SkeletonLine width="w-40" height="h-2.5" />
                </div>
              </div>
              <SkeletonLine width="w-20" height="h-8" className="rounded-full" />
            </Card>
          ))}
        </div>
      ) : results.length > 0 ? (
        <Card padding="p-2 sm:p-3" className="divide-y divide-slate-100 dark:divide-slate-800">
          {results.map((targetUser) => {
            const isSelf = currentUser && currentUser._id === targetUser._id;
            const isFollowing =
              followingMap[targetUser._id] !== undefined
                ? followingMap[targetUser._id]
                : targetUser.isFollowing;

            return (
              <div
                key={targetUser._id}
                className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <Link
                  to={`/profile/${targetUser.username}`}
                  className="flex items-center gap-3.5 min-w-0"
                >
                  <Avatar
                    src={targetUser.avatar}
                    name={targetUser.username}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {targetUser.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-sm">
                      {targetUser.bio || `${targetUser.followersCount} followers`}
                    </p>
                  </div>
                </Link>

                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => handleFollowToggle(targetUser._id, targetUser.username)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                        : 'bg-gradient-brand text-white hover:brightness-105'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </Card>
      ) : query.trim() ? (
        <EmptyState
          icon={Users}
          title="No creators found"
          description={`No members found matching "${query}". Try searching for another name or keyword.`}
        />
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="Search the Sphere"
          description="Type a username or keywords above to discover colleagues and creators."
        />
      )}
    </div>
  );
};

export default Search;
