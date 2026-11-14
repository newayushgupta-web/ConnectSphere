import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './components/layout/AppLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Guard (prevents logged in users from visiting login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const handleOpenCreatePost = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Routes>
      {/* Auth Pages (Clean Split Screen without App Shell) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Main App Pages (Wrapped in 3-Column App Shell) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout onOpenCreatePost={handleOpenCreatePost}>
              <Home />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <AppLayout onOpenCreatePost={handleOpenCreatePost}>
            <Profile />
          </AppLayout>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <AppLayout onOpenCreatePost={handleOpenCreatePost}>
            <PostDetail />
          </AppLayout>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppLayout onOpenCreatePost={handleOpenCreatePost}>
              <Search />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout onOpenCreatePost={handleOpenCreatePost}>
              <Notifications />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <AppLayout onOpenCreatePost={handleOpenCreatePost}>
            <NotFound />
          </AppLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
