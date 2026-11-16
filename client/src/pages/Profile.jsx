import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Grid,
  List,
  Edit2,
  UserPlus,
  UserCheck,
  Calendar,
  Heart,
  MessageCircle,
  X,
  Bookmark,
  MapPin,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/post/PostCard';
import EditProfileModal from '../components/user/EditProfileModal';
import { SkeletonProfile, SkeletonPost } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Profile = () => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'feed'
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'saved' ? 'saved' : 'posts'
  ); // 'posts' | 'media' | 'saved'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState({ open: false, title: '', users: [], loading: false });
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  useEffect(() => {
    document.title = username ? `@${username} | ConnectSphere` : 'Profile | ConnectSphere';
  }, [username]);

  const fetchProfileAndPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`),
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      if (postsRes.data.success) {
        setPosts(postsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast('User profile not found', 'error');
    } finally {
      setLoading(false);
    }
  }, [username, showToast]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const isSelf = currentUser && profile && currentUser.username === profile.username;

  // Fetch saved bookmarks when Saved tab is selected
  useEffect(() => {
    if (activeTab === 'saved' && isSelf && savedPosts.length === 0) {
      const fetchBookmarks = async () => {
        setLoadingSaved(true);
        try {
          const res = await api.get('/posts/bookmarks');
          if (res.data.success) {
            setSavedPosts(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load bookmarks:', err);
        } finally {
          setLoadingSaved(false);
        }
      };
      fetchBookmarks();
    }
  }, [activeTab, isSelf, savedPosts.length]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow users', 'info');
      return;
    }

    try {
      const res = await api.put(`/users/${profile._id}/follow`);
      if (res.data.success) {
        const { isFollowing, followersCount } = res.data.data;
        setProfile((prev) => ({
          ...prev,
          isFollowing,
          followersCount,
        }));
        showToast(
          isFollowing ? `Now following @${profile.username}` : `Unfollowed @${profile.username}`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const openFollowModal = async (type) => {
    setFollowModal({
      open: true,
      title: type === 'followers' ? 'Followers' : 'Following',
      users: [],
      loading: true,
    });

    try {
      const res = await api.get(`/users/${profile._id}/${type}`);
      if (res.data.success) {
        setFollowModal({
          open: true,
          title: type === 'followers' ? 'Followers' : 'Following',
          users: res.data.data,
          loading: false,
        });
      }
    } catch (err) {
      setFollowModal((prev) => ({ ...prev, loading: false }));
      showToast(`Failed to load ${type}`, 'error');
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setSavedPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setProfile((prev) => ({ ...prev, postCount: Math.max(0, prev.postCount - 1) }));
  };

  if (loading) {
    return (
      <div className="w-full">
        <SkeletonProfile />
        <SkeletonPost />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full py-12">
        <EmptyState
          title="User Not Found"
          description={`The member @${username} does not exist or may have been removed.`}
          actionLabel="Return Home"
          onAction={() => (window.location.href = '/')}
        />
      </div>
    );
  }

  let displayedPosts = posts;
  if (activeTab === 'media') {
    displayedPosts = posts.filter((p) => !!p.image);
  } else if (activeTab === 'saved') {
    displayedPosts = savedPosts;
  }

  return (
    <div className="w-full">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft mb-6">
        {/* Cover Banner */}
        <div className="relative h-36 sm:h-52 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
          {profile.cover ? (
            <img
              src={profile.cover}
              alt={`${profile.username}'s cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-mesh opacity-30" />
          )}
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          {/* Avatar and Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5">
            <Avatar
              src={profile.avatar}
              name={profile.username}
              size="xl"
              border
              status={isSelf ? 'online' : null}
            />

            <div>
              {isSelf ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Profile
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  onMouseEnter={() => setIsHoveringFollow(true)}
                  onMouseLeave={() => setIsHoveringFollow(false)}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                    profile.isFollowing
                      ? isHoveringFollow
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-gradient-brand text-white shadow-indigo-500/25 hover:brightness-105'
                  }`}
                >
                  {profile.isFollowing ? (
                    isHoveringFollow ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Following</span>
                      </>
                    )
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Name & Bio */}
          <div className="text-center sm:text-left space-y-2 mb-5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {profile.username}
            </h1>
            <p className="text-xs text-slate-400">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-1 max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Profile Meta info (Joined, Location, Website) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'recently'}
                </span>
              </div>

              {profile.location && (
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Stats Bar */}
          <div className="flex items-center justify-center sm:justify-start gap-8 py-3.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-center sm:text-left">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mr-1.5">
                {profile.postCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">posts</span>
            </div>

            <button
              onClick={() => openFollowModal('followers')}
              className="text-center sm:text-left hover:opacity-80 transition-opacity"
            >
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mr-1.5">
                {profile.followersCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">followers</span>
            </button>

            <button
              onClick={() => openFollowModal('following')}
              className="text-center sm:text-left hover:opacity-80 transition-opacity"
            >
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mr-1.5">
                {profile.followingCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Grid/Feed Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6 px-1">
        {/* Content Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Posts ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'media'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Photos ({posts.filter((p) => !!p.image).length})
          </button>

          {isSelf && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
            </button>
          )}
        </div>

        {/* View Mode Toggle (Grid vs Feed) */}
        <div className="flex items-center gap-1 pb-3">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-200/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('feed')}
            aria-label="Feed view"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'feed'
                ? 'bg-slate-200/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {loadingSaved && activeTab === 'saved' ? (
        <div className="space-y-4">
          <SkeletonPost />
          <SkeletonPost />
        </div>
      ) : displayedPosts.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'saved'
              ? 'No saved posts'
              : activeTab === 'media'
              ? 'No photos yet'
              : 'No posts yet'
          }
          description={
            activeTab === 'saved'
              ? 'Save inspiring posts using the bookmark icon on any post!'
              : isSelf
              ? 'Share your first story or photo with your community!'
              : `@${profile.username} hasn't posted anything in this category.`
          }
        />
      ) : viewMode === 'grid' ? (
        /* Instagram 3-column square grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {displayedPosts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group shadow-sm border border-slate-200/60 dark:border-slate-800"
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.text}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full p-4 flex items-center justify-center text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 group-hover:scale-105 transition-transform duration-300">
                  <p className="line-clamp-4 leading-relaxed">{post.text}</p>
                </div>
              )}

              {/* Hover overlay with likes and comment counts */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentsCount || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Full Feed View */
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Followers / Following List Modal */}
      <Modal
        isOpen={followModal.open}
        onClose={() => setFollowModal({ open: false, title: '', users: [], loading: false })}
        title={followModal.title}
      >
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {followModal.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : followModal.users.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">
              No {followModal.title.toLowerCase()} to display.
            </p>
          ) : (
            followModal.users.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u.username}`}
                onClick={() => setFollowModal({ open: false, title: '', users: [], loading: false })}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Avatar src={u.avatar} name={u.username} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {u.username}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {u.bio || 'ConnectSphere member'}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
