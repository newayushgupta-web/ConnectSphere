import React from 'react';

const Badge = ({
  children,
  variant = 'brand', // 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
  size = 'md',        // 'sm' | 'md'
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    brand:
      'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40',
    success:
      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
    warning:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40',
    danger:
      'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40',
    neutral:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.brand
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-500'
              : variant === 'danger'
              ? 'bg-rose-500'
              : variant === 'warning'
              ? 'bg-amber-500'
              : 'bg-indigo-500'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
