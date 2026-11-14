import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/post/PostCard';
import EditProfileModal from '../components/user/EditProfileModal';
import { ProfileSkeleton, PostSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'feed'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState({ open: false, title: '', users: [] });

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
  }, [username]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to follow users', 'info');
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

  const handleProfileUpdated = (updatedUser) => {
    setProfile((prev) => ({
      ...prev,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    }));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setProfile((prev) => ({ ...prev, postCount: Math.max(0, prev.postCount - 1) }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="User Not Found"
          description={`The user @${username} does not exist or may have been removed.`}
          actionLabel="Return Home"
          onAction={() => (window.location.href = '/')}
        />
      </div>
    );
  }

  const isSelf = currentUser && currentUser.username === profile.username;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Instagram-style Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800"
            />
          </div>

          {/* User Details & Stats */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profile.username}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'recently'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                {isSelf ? (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold shadow-sm transition-all ${
                      profile.isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {profile.isFollowing ? (
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
            </div>

            {/* Stats: Posts, Followers, Following */}
            <div className="flex items-center justify-center sm:justify-start gap-8 py-3 border-y border-slate-100 dark:border-slate-800/80 mb-4">
              <div className="text-center sm:text-left">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 mr-1.5">
                  {profile.postCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">posts</span>
              </div>

              <button
                onClick={() =>
                  setFollowModal({
                    open: true,
                    title: 'Followers',
                    users: profile.followers || [],
                  })
                }
                className="text-center sm:text-left hover:opacity-80 transition-opacity"
              >
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 mr-1.5">
                  {profile.followersCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">followers</span>
              </button>

              <button
                onClick={() =>
                  setFollowModal({
                    open: true,
                    title: 'Following',
                    users: profile.following || [],
                  })
                }
                className="text-center sm:text-left hover:opacity-80 transition-opacity"
              >
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 mr-1.5">
                  {profile.followingCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">following</span>
              </button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex items-center gap-2 pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'grid'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'feed'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Feed View</span>
        </button>
      </div>

      {/* Tab Content */}
      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description={
            isSelf
              ? 'Share your first story or photo with the community!'
              : `@${profile.username} hasn't posted anything yet.`
          }
        />
      ) : activeTab === 'grid' ? (
        /* Instagram 3-column photo / text grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {posts.map((post) => (
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
                  <p className="line-clamp-4">{post.text}</p>
                </div>
              )}

              {/* Hover overlay with likes and comment counts */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
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
        /* Feed View */
        <div className="max-w-2xl mx-auto space-y-4">
          {posts.map((post) => (
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
      {followModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {followModal.title}
              </h3>
              <button
                onClick={() => setFollowModal({ open: false, title: '', users: [] })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-3 pr-1">
              {followModal.users.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  No {followModal.title.toLowerCase()} yet.
                </p>
              ) : (
                followModal.users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    onClick={() => setFollowModal({ open: false, title: '', users: [] })}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-9 h-9 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
