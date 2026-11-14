import React from 'react';

export const PostSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft animate-pulse mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-1.5 flex-1">
        <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="w-4/5 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
    <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
    <div className="flex gap-4">
      <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-soft animate-pulse mb-6">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="flex-1 space-y-4 text-center sm:text-left w-full">
        <div className="w-40 h-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto sm:mx-0" />
        <div className="flex justify-center sm:justify-start gap-8">
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-800 rounded mx-auto sm:mx-0" />
      </div>
    </div>
  </div>
);

export const UserCardSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-1">
        <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
    <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
  </div>
);
