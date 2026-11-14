import React, { useState } from 'react';

// Get initials from string
const getInitials = (name = '') => {
  if (!name) return 'CS';
  const clean = name.replace(/[@_-]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

// Deterministic gradient from string
const getAvatarGradient = (str = '') => {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-violet-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-orange-500',
    'from-amber-500 to-red-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const Avatar = ({
  src,
  alt = 'User avatar',
  name = '',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status = null, // 'online' | 'offline' | null
  className = '',
  border = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl font-extrabold',
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-5 h-5 ring-3',
  };

  const initials = getInitials(name || alt);
  const gradient = getAvatarGradient(name || alt);

  return (
    <div className={`relative inline-block flex-shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full overflow-hidden flex items-center justify-center ${
          border ? 'border-2 sm:border-3 border-white dark:border-slate-800 shadow-sm' : ''
        } ${imageError || !src ? `bg-gradient-to-tr ${gradient} text-white` : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white dark:ring-slate-900 ${
            status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
          } ${statusDotSizes[size] || statusDotSizes.md}`}
        />
      )}
    </div>
  );
};

export default Avatar;
