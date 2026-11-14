import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-extrabold text-brand-600 dark:text-brand-400 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
      >
        <Home className="w-4 h-4" />
        <span>Return to Sphere</span>
      </Link>
    </div>
  );
};

export default NotFound;
