import React, { useState, useRef } from 'react';
import { Upload, Check, Image as ImageIcon, MapPin, Globe } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

const EditProfileModal = ({ profile, isOpen, onClose, onProfileUpdated }) => {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || '');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(profile?.cover || '');
  const [loading, setLoading] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  if (!isOpen || !profile) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Avatar image exceeds 5MB limit', 'error');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Cover image exceeds 8MB limit', 'error');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('website', website);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const res = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        updateUser(res.data.data.user);
        if (onProfileUpdated) {
          onProfileUpdated(res.data.data.user);
        }
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover Photo Upload Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Cover Banner
          </label>
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 cursor-pointer group border border-slate-200 dark:border-slate-700"
          >
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-2 text-xs font-semibold">
              <ImageIcon className="w-4 h-4" />
              <span>Change Cover</span>
            </div>
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />
        </div>

        {/* Avatar Upload with Live Preview */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative group cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
          >
            <Avatar
              src={avatarPreview}
              name={profile.username}
              size="xl"
              border
            />
            <div className="absolute inset-0 rounded-full bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Upload className="w-6 h-6" />
            </div>
          </div>

          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Change avatar
          </button>
        </div>

        {/* Username (Read Only) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Username
          </label>
          <input
            type="text"
            disabled
            value={profile.username}
            className="w-full bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <span className="text-[11px] text-slate-400">{bio.length}/160</span>
          </div>
          <textarea
            rows={3}
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about yourself..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
          />
        </div>

        {/* Location & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full bg-slate-50 dark:bg-slate-800/60 pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website
            </label>
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mysite.dev"
                className="w-full bg-slate-50 dark:bg-slate-800/60 pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
