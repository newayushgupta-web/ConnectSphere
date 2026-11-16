import React, { useState } from 'react';
import SidebarNav from './SidebarNav';
import RightSidebar from './RightSidebar';
import TopHeader from './TopHeader';
import MobileBottomBar from './MobileBottomBar';
import EditProfileModal from '../user/EditProfileModal';
import CreatePostModal from '../post/CreatePostModal';
import { useAuth } from '../../context/AuthContext';

const AppLayout = ({ children, onOpenCreatePost }) => {
  const { user, updateUser } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handleOpenCreate = () => {
    setIsCreatePostOpen(true);
    if (onOpenCreatePost) {
      onOpenCreatePost();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <TopHeader onOpenEditProfile={() => setIsEditProfileOpen(true)} />

      {/* Main 3-Column Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center px-0 sm:px-4 lg:px-6">
        {/* Left Sidebar Nav (Desktop) */}
        <SidebarNav onOpenCreatePost={handleOpenCreate} />

        {/* Center Content Column */}
        <main className="flex-1 max-w-2xl w-full min-w-0 px-3 sm:px-4 py-4 sm:py-6 pb-28 lg:pb-12">
          {children}
        </main>

        {/* Right Sidebar (Desktop) */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation & FAB */}
      <MobileBottomBar onOpenCreatePost={handleOpenCreate} />

      {/* Global Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      {/* Global Edit Profile Modal */}
      {user && (
        <EditProfileModal
          profile={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onProfileUpdated={(updated) => updateUser(updated)}
        />
      )}
    </div>
  );
};

export default AppLayout;
