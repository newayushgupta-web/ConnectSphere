import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  Bookmark,
  User,
  PlusCircle,
  Sparkles,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const SidebarNav = ({ onOpenCreatePost }) => {
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/search', icon: Compass },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    {
      label: 'Bookmarks',
      path: `/profile/${user?.username || ''}?tab=saved`,
      icon: Bookmark,
    },
    {
      label: 'Profile',
      path: `/profile/${user?.username || ''}`,
      icon: User,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 px-4 py-6 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-20">
      {/* Top: Logo & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight bg-gradient-brand bg-clip-text text-transparent">
              ConnectSphere
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Community Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-brand-subtle text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Button */}
        {onOpenCreatePost && (
          <div className="pt-2">
            <Button
              onClick={onOpenCreatePost}
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-indigo-500/20"
              leftIcon={<PlusCircle className="w-5 h-5" />}
            >
              Create Post
            </Button>
          </div>
        )}
      </div>

      {/* Bottom: Theme Toggle & User Widget */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {/* Theme switcher button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500" />
            )}
            <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-3 min-w-0 group"
            >
              <Avatar
                src={user.avatar}
                name={user.username}
                size="sm"
                status="online"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {user.username}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarNav;
