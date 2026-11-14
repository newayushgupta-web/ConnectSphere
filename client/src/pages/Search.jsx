import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, UserPlus, UserCheck, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserCardSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

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

  const handleFollowToggle = async (targetId, username) => {
    if (!isAuthenticated) {
      showToast('Please log in to follow users', 'info');
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
      showToast('Action failed. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Discover ConnectSphere
        </h2>
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or keywords in bio..."
            className="w-full bg-white dark:bg-slate-900 pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-soft focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
        </div>
      ) : results.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft divide-y divide-slate-100 dark:divide-slate-800">
          {results.map((targetUser) => {
            const isSelf = currentUser && currentUser._id === targetUser._id;
            const isFollowing =
              followingMap[targetUser._id] !== undefined
                ? followingMap[targetUser._id]
                : targetUser.isFollowing;

            return (
              <div
                key={targetUser._id}
                className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1 group"
              >
                <Link
                  to={`/profile/${targetUser.username}`}
                  className="flex items-center gap-3.5 min-w-0"
                >
                  <img
                    src={
                      targetUser.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.username}`
                    }
                    alt={targetUser.username}
                    className="w-12 h-12 rounded-full object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-brand-500/30 transition-all"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {targetUser.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {targetUser.bio || `${targetUser.followersCount} followers`}
                    </p>
                  </div>
                </Link>

                {!isSelf && (
                  <button
                    onClick={() => handleFollowToggle(targetUser._id, targetUser.username)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
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
        </div>
      ) : query.trim() ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={`No members found matching "${query}". Try searching for another name or keyword.`}
        />
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="Search the Sphere"
          description="Type a username or interests to find friends, colleagues, and trending creators."
        />
      )}
    </div>
  );
};

export default Search;
