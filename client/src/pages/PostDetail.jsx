import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        if (res.data.success) {
          setPost(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handlePostDeleted = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {loading ? (
        <PostSkeleton />
      ) : !post ? (
        <EmptyState
          title="Post not found"
          description="This post may have been removed or does not exist."
          actionLabel="Explore Feed"
          onAction={() => navigate('/')}
        />
      ) : (
        <PostCard post={post} onPostDeleted={handlePostDeleted} />
      )}
    </div>
  );
};

export default PostDetail;
