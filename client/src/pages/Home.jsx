import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StoriesRow from '../components/feed/StoriesRow';
import PostComposer from '../components/post/PostComposer';
import PostCard from '../components/post/PostCard';
import { SkeletonPost } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isDiscovery, setIsDiscovery] = useState(false);

  useEffect(() => {
    document.title = 'Home Feed | ConnectSphere';
  }, []);

  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get(`/posts/feed?page=${pageNum}&limit=8`);
      if (res.data.success) {
        const { posts: newPosts, pagination, isDiscovery: discoveryFlag } = res.data.data;
        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(pagination.hasMore);
        setIsDiscovery(discoveryFlag);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="w-full">
      {/* Top Welcome & Subheading */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Home Feed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stories and real-time updates from your sphere
          </p>
        </div>

        <button
          onClick={() => fetchFeed(1)}
          disabled={loading}
          aria-label="Refresh feed"
          title="Refresh feed"
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stories Carousel Row */}
      <StoriesRow />

      {/* Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Discovery Feed Banner */}
      {isDiscovery && posts.length > 0 && (
        <div className="flex items-start gap-3 p-4 mb-5 bg-gradient-brand-subtle rounded-3xl border border-indigo-200/50 dark:border-indigo-800/40 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Community Discovery:</strong> Showing trending posts from across ConnectSphere. Follow creators to personalize your feed!
          </p>
        </div>
      )}

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Your feed is quiet"
          description="Be the first to share an update, or explore creators to fill your feed with inspiring stories!"
        />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}

          {/* Infinite Scroll / Load More */}
          {hasMore && (
            <div className="text-center mt-6 mb-8">
              <Button
                variant="outline"
                size="md"
                onClick={() => fetchFeed(page + 1, true)}
                isLoading={loadingMore}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Load More Stories
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
