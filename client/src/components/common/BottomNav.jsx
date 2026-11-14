import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const BottomNav = ({ onOpenCreatePost }) => {
  const { user, isAuthenticated } = useAuth();
  const { unreadNotificationsCount } = useSocket();

  if (!isAuthenticated) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-between">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `p-2 flex flex-col items-center transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Home className="w-6 h-6" />
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) =>
          `p-2 flex flex-col items-center transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Search className="w-6 h-6" />
      </NavLink>

      {onOpenCreatePost && (
        <button
          onClick={onOpenCreatePost}
          className="p-1 text-brand-600 dark:text-brand-400 hover:scale-110 active:scale-95 transition-transform"
          aria-label="Create Post"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      )}

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `p-2 flex flex-col items-center relative transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Bell className="w-6 h-6" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </NavLink>

      <NavLink
        to={`/profile/${user?.username}`}
        className={({ isActive }) =>
          `p-2 flex flex-col items-center transition-colors ${
            isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <User className="w-6 h-6" />
      </NavLink>
    </nav>
  );
};

export default BottomNav;
