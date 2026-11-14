import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const MobileBottomBar = ({ onOpenCreatePost }) => {
  const { user, isAuthenticated } = useAuth();
  const { unreadNotificationsCount } = useSocket();

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Action Button (FAB) for Create Post */}
      {onOpenCreatePost && (
        <button
          onClick={onOpenCreatePost}
          aria-label="Create new post"
          className="lg:hidden fixed bottom-20 right-5 z-40 w-13 h-13 rounded-2xl bg-gradient-brand text-white shadow-xl shadow-indigo-500/35 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-2.5 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2 rounded-xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`
          }
        >
          <Home className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `p-2 rounded-xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`
          }
        >
          <Compass className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `p-2 rounded-xl flex flex-col items-center relative transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`
          }
        >
          <Bell className="w-6 h-6" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to={`/profile/${user?.username || ''}`}
          className={({ isActive }) =>
            `p-2 rounded-xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`
          }
        >
          <User className="w-6 h-6" />
        </NavLink>
      </nav>
    </>
  );
};

export default MobileBottomBar;
