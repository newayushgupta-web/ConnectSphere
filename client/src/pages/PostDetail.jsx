import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import { SkeletonPost } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Post Discussion | ConnectSphere';
  }, []);

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
    <div className="w-full">
      {/* Back Button */}
      <div className="mb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
      </div>

      {loading ? (
        <SkeletonPost />
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
