import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  User,
  Mail,
  Shield,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Edit3
} from 'lucide-react';

const AdminProfile = () => {
  const { user, fetchUser, logout } = useAuth();
  const navigate = useNavigate();

  // Edit Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: '', text: '' });

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', text: '' });

  // Handle Edit Profile Form
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileFeedback({ type: '', text: '' });

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileFeedback({ type: 'error', text: 'Name and Email are required.' });
      return;
    }

    try {
      setProfileLoading(true);
      const res = await api.put('/admin/profile', {
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      });
      if (res.data.success) {
        setProfileFeedback({ type: 'success', text: 'Admin profile updated successfully.' });
        await fetchUser();
      }
    } catch (err) {
      setProfileFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Change Password Form
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', text: '' });

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.put('/admin/change-password', passwordForm);
      if (res.data.success) {
        setPasswordFeedback({ type: 'success', text: 'Password changed successfully.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="font-sora font-bold text-xl text-navy-900">Admin Profile &amp; Security</h2>
        <p className="text-xs text-slate-500">
          Manage your administrator account credentials and access credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* Left Column: Admin Identity Summary Card (5 cols) */}
        {/* ========================================================= */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-line shadow-xs p-6 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md shadow-green-700/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h3 className="font-sora font-bold text-lg text-navy-900">{user?.name || 'Administrator'}</h3>
              <p className="text-xs font-mono text-slate-500">{user?.email || 'admin@fittrack.com'}</p>
            </div>

            <div className="inline-flex items-center space-x-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full font-mono">
              <Shield className="w-3.5 h-3.5 text-green-700" />
              <span>Role: Administrator</span>
            </div>

            <div className="pt-4 border-t border-line text-left text-xs space-y-2 text-slate-500">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-semibold text-green-700">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Access Level:</span>
                <span className="font-semibold text-navy-900">Full Administrative</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Admin Panel</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Right Column: Edit Profile & Password Forms (7 cols) */}
        {/* ========================================================= */}
        <div className="md:col-span-7 space-y-6">
          {/* 1. Edit Profile Form */}
          <div className="bg-white rounded-2xl border border-line shadow-xs p-6 space-y-5">
            <div className="flex items-center space-x-2.5 border-b border-line pb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base text-navy-900">Edit Profile</h3>
                <p className="text-[11px] text-slate-400">Update your administrator display name and email</p>
              </div>
            </div>

            {profileFeedback.text && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                  profileFeedback.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {profileFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                )}
                <span>{profileFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                  Assigned Role (Read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value="Administrator (ADMIN)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password Form */}
          <div className="bg-white rounded-2xl border border-line shadow-xs p-6 space-y-5">
            <div className="flex items-center space-x-2.5 border-b border-line pb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base text-navy-900">Change Password</h3>
                <p className="text-[11px] text-slate-400">Update your account login password</p>
              </div>
            </div>

            {passwordFeedback.text && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                  passwordFeedback.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                )}
                <span>{passwordFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                  New Password * (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
