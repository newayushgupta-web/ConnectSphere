import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No content yet',
  description = 'Check back later or explore new creators to populate this space with inspiring stories.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft ${className}`}
    >
      <div className="relative mb-4">
        {/* Soft glowing ambient circle */}
        <div className="absolute inset-0 rounded-3xl bg-brand-500/20 blur-xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-brand-subtle text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
