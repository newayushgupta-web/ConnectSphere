import React from 'react';

const Card = ({
  children,
  className = '',
  glass = false,
  hoverable = false,
  padding = 'p-5 sm:p-6',
  ...props
}) => {
  return (
    <div
      className={`rounded-3xl border transition-all duration-200 ${
        glass
          ? 'glass-panel'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-soft'
      } ${
        hoverable
          ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5'
          : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
