import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import PostComposer from '../components/post/PostComposer';
import PostCard from '../components/post/PostCard';
import WhoToFollow from '../components/user/WhoToFollow';
import { PostSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <main className="lg:col-span-2">
          {/* Post Creation Box */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* Discovery banner when user follows 0 people */}
          {isDiscovery && posts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 mb-5 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/30 rounded-2xl border border-brand-100 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Discovery Feed:</strong> Showing trending posts from across the ConnectSphere community. Follow users on the right to personalize your home stream!
              </span>
            </div>
          )}

          {/* Feed Content */}
          {loading ? (
            <div>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
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

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-6 mb-10">
                  <button
                    onClick={() => fetchFeed(page + 1, true)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load More Stories</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar Column */}
        <aside className="hidden lg:block space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* Who To Follow Component */}
            <WhoToFollow />

            {/* Footer / Info */}
            <footer className="px-4 text-xs text-slate-400 space-y-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span>About</span>
                <span>Privacy</span>
                <span>Terms</span>
                <span>CodeAlpha Internship</span>
              </div>
              <p>&copy; {new Date().getFullYear()} ConnectSphere Platform. Built with care.</p>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
