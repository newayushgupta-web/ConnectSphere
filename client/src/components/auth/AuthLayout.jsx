import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Heart,
  MessageCircle,
  Sun,
  Moon,
  Layers,
  Star,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

const creatorAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
];

const AuthLayout = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden">
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-5 right-5 z-30">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2.5 rounded-full glass-panel shadow-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* LEFT PANEL: Brand Presentation & Visual Interest (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              ConnectSphere
            </span>
          </Link>
        </div>

        {/* Center: Tagline, Highlights & Creator Social Proof */}
        <div className="relative z-10 max-w-lg space-y-7 my-auto py-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              Share moments.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Build connections.
              </span>
            </h1>
            <p className="text-sm xl:text-base text-slate-300 mt-3 leading-relaxed">
              A modern, decentralized-inspired social platform designed for authentic creator interactions, chronological feeds, and real-time community engagement.
            </p>
          </div>

          {/* Social Proof: Avatar Stack */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-fit">
            <div className="flex -space-x-2.5 overflow-hidden">
              {creatorAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Creator ${i + 1}`}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-indigo-900 object-cover"
                />
              ))}
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>4.9 / 5 rating</span>
              </div>
              <p className="text-slate-300 text-[11px] font-medium">
                Join <strong className="text-white">10,000+ creators</strong> on ConnectSphere
              </p>
            </div>
          </div>

          {/* 3 Feature Highlights */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Real-Time Community</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Instant live notifications, optimistic heart reactions, and threaded discussions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Clean & Chronological</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Distraction-free feeds featuring posts from creators you follow, newest first.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Security First</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  JWT protected auth, secure password reset, and full content ownership.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Mock Post Card */}
          <div className="pt-1">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-2.5 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <Avatar
                  name="Maya Designer"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Maya Lin</p>
                  <p className="text-[10px] text-slate-400">@maya_designer • 20m ago</p>
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Exploring micro-interactions and smooth transitions on the new ConnectSphere update. What do you think of this aesthetic? ✨🚀 #UIUX #FullStack
              </p>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" /> 148 likes
                </span>
                <span className="flex items-center gap-1 text-indigo-300">
                  <MessageCircle className="w-3.5 h-3.5" /> 24 comments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="relative z-10 text-xs text-slate-400">
          CodeAlpha Full Stack Internship • Task 2
        </div>
      </div>

      {/* RIGHT PANEL: Form Viewport */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Mobile Compact Header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tight bg-gradient-brand bg-clip-text text-transparent">
                ConnectSphere
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share moments. Build connections.
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Body inside Glass Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-soft backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-md w-full mx-auto pt-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
          <div className="flex justify-center gap-4 font-medium">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Terms of Service
            </span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Privacy Policy
            </span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Help Center
            </span>
          </div>
          <p>© {new Date().getFullYear()} ConnectSphere Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
