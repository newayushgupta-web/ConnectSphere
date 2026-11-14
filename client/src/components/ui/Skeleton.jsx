import React from 'react';

export const SkeletonLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div
    className={`${width} ${height} rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
  />
);

export const SkeletonAvatar = ({ size = 'w-10 h-10', className = '' }) => (
  <div
    className={`${size} rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0 ${className}`}
  />
);

export const SkeletonPost = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft mb-5 animate-pulse">
    {/* Author Header */}
    <div className="flex items-center gap-3 mb-4">
      <SkeletonAvatar size="w-11 h-11" />
      <div className="space-y-1.5 flex-1">
        <SkeletonLine width="w-28" height="h-3.5" />
        <SkeletonLine width="w-16" height="h-2.5" />
      </div>
    </div>
    {/* Text Lines */}
    <div className="space-y-2 mb-4">
      <SkeletonLine width="w-full" height="h-3.5" />
      <SkeletonLine width="w-4/5" height="h-3.5" />
    </div>
    {/* Image Placeholder */}
    <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
    {/* Actions */}
    <div className="flex gap-6 pt-1">
      <SkeletonLine width="w-12" height="h-4" />
      <SkeletonLine width="w-12" height="h-4" />
      <SkeletonLine width="w-8" height="h-4" className="ml-auto" />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft mb-8 animate-pulse">
    {/* Cover Placeholder */}
    <div className="w-full h-36 sm:h-48 bg-slate-200 dark:bg-slate-800" />
    <div className="p-6 sm:p-8 pt-0 relative">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
        <SkeletonAvatar size="w-28 h-28 sm:w-32 sm:h-32" className="border-4 border-white dark:border-slate-900" />
        <SkeletonLine width="w-28" height="h-9" className="rounded-full" />
      </div>
      <div className="space-y-2 mb-4 text-center sm:text-left">
        <SkeletonLine width="w-36" height="h-6" className="mx-auto sm:mx-0" />
        <SkeletonLine width="w-24" height="h-3.5" className="mx-auto sm:mx-0" />
        <SkeletonLine width="w-3/4" height="h-4" className="mx-auto sm:mx-0 mt-3" />
      </div>
      <div className="flex justify-center sm:justify-start gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
        <SkeletonLine width="w-16" height="h-5" />
        <SkeletonLine width="w-16" height="h-5" />
        <SkeletonLine width="w-16" height="h-5" />
      </div>
    </div>
  </div>
);

export default {
  Line: SkeletonLine,
  Avatar: SkeletonAvatar,
  Post: SkeletonPost,
  Profile: SkeletonProfile,
};
