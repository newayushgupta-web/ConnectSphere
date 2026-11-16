import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserPlus, CheckCheck, Bell } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonAvatar, SkeletonLine } from '../components/ui/Skeleton';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationsCount } = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Notifications | ConnectSphere';
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=30');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadNotificationsCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/read', {});
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      showToast('Failed to mark notifications read', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const renderNotificationItem = (n) => {
    const targetUrl =
      n.type === 'follow'
        ? `/profile/${n.sender?.username}`
        : `/posts/${n.post?._id || n.post}`;

    return (
      <Link
        key={n._id}
        to={targetUrl}
        className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
          !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
        }`}
      >
        {/* Sender Avatar with type icon overlay */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={n.sender?.avatar}
            name={n.sender?.username}
            size="md"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-800">
            {getNotificationIcon(n.type)}
          </div>
        </div>

        {/* Message & Details */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
            <strong className="font-bold text-slate-900 dark:text-white">
              {n.sender?.username}
            </strong>{' '}
            {n.type === 'like' && 'liked your post'}
            {n.type === 'comment' && 'commented on your post'}
            {n.type === 'follow' && 'started following your sphere'}
          </p>

          {n.post && n.post.text && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 italic">
              &quot;{n.post.text}&quot;
            </p>
          )}

          <span className="text-[10px] text-slate-400 mt-1.5 block">
            {n.createdAt
              ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
              : ''}
          </span>
        </div>

        {/* Unread indicator */}
        {!n.isRead && (
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0 self-center" />
        )}
      </Link>
    );
  };

  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const todayNotifications = notifications.filter(
    (n) => now - new Date(n.createdAt) < ONE_DAY_MS
  );
  const earlierNotifications = notifications.filter(
    (n) => now - new Date(n.createdAt) >= ONE_DAY_MS
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Activity and interactions from your sphere
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="p-4" className="flex items-center gap-3.5 animate-pulse">
              <SkeletonAvatar size="w-10 h-10" />
              <div className="space-y-1.5 flex-1">
                <SkeletonLine width="w-48" height="h-3.5" />
                <SkeletonLine width="w-24" height="h-2.5" />
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When members follow you, like your posts, or drop comments, they'll appear right here."
        />
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {todayNotifications.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 uppercase tracking-wider">
                Today
              </h2>
              <Card padding="p-1 sm:p-2" className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayNotifications.map(renderNotificationItem)}
              </Card>
            </div>
          )}

          {/* Earlier Group */}
          {earlierNotifications.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 uppercase tracking-wider">
                Earlier
              </h2>
              <Card padding="p-1 sm:p-2" className="divide-y divide-slate-100 dark:divide-slate-800">
                {earlierNotifications.map(renderNotificationItem)}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
