import React, { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
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
        {/* Avatar Upload with Live Preview */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
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
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Change profile picture
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
