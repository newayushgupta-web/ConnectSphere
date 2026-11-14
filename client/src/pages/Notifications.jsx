import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserPlus, CheckCheck, Bell } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationsCount } = useSocket();
  const { showToast } = useToast();

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
        return <MessageCircle className="w-3.5 h-3.5 text-sky-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-violet-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stay up to date with activity on your posts and profile.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 text-xs font-bold transition-all shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4">
          <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When members follow you, like your posts, or drop comments, they'll appear right here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {notifications.map((n) => {
            const targetUrl =
              n.type === 'follow'
                ? `/profile/${n.sender?.username}`
                : `/posts/${n.post?._id || n.post}`;

            return (
              <Link
                key={n._id}
                to={targetUrl}
                className={`flex items-start gap-3.5 p-4 sm:p-5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                  !n.isRead ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                }`}
              >
                {/* Sender Avatar with type icon overlay */}
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      n.sender?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${n.sender?.username}`
                    }
                    alt={n.sender?.username}
                    className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
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
                    {n.type === 'follow' && 'started following you'}
                  </p>

                  {n.post && n.post.text && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 italic">
                      "{n.post.text}"
                    </p>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {n.createdAt
                      ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                      : ''}
                  </span>
                </div>

                {/* Unread dot indicator */}
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 flex-shrink-0 self-center" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
