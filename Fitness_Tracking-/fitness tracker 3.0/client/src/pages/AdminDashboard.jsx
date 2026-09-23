import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  ShieldCheck,
  Activity,
  KeyRound,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Copy,
  Check,
  X,
  AlertTriangle,
  Utensils,
  Droplets,
  Scale,
  Calendar,
  CheckCircle2,
  Database,
  User as UserIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();

  // State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'user', 'admin'

  // Modal States
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityTab, setActivityTab] = useState('meals'); // 'meals', 'water', 'weight'

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [customPassword, setCustomPassword] = useState('');
  const [resetSuccessData, setResetSuccessData] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch Stats & Users
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showNotification(
        err.response?.data?.message || 'Failed to load admin dashboard data',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch User Activity
  const handleViewActivity = async (user) => {
    setSelectedUserActivity(null);
    setActivityLoading(true);
    setActivityModalOpen(true);
    setActivityTab('meals');

    try {
      const res = await api.get(`/admin/users/${user._id}/activity`);
      if (res.data.success) {
        setSelectedUserActivity(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user activity:', err);
      showNotification('Failed to fetch activity records for this user', 'error');
    } finally {
      setActivityLoading(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenReset = (user) => {
    setUserToReset(user);
    setCustomPassword('');
    setResetSuccessData(null);
    setCopied(false);
    setResetModalOpen(true);
  };

  // Submit Password Reset
  const handleConfirmReset = async () => {
    if (!userToReset) return;
    setResettingPassword(true);

    try {
      const payload = customPassword.trim() ? { newPassword: customPassword.trim() } : {};
      const res = await api.post(`/admin/users/${userToReset._id}/reset-password`, payload);

      if (res.data.success) {
        setResetSuccessData({
          temporaryPassword: res.data.temporaryPassword,
          userEmail: userToReset.email
        });
        showNotification(`Password for ${userToReset.email} successfully updated!`);
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      showNotification(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setResettingPassword(false);
    }
  };

  // Copy Temporary Password to Clipboard
  const handleCopyPassword = () => {
    if (resetSuccessData?.temporaryPassword) {
      navigator.clipboard.writeText(resetSuccessData.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Open Delete User Modal
  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Submit User Deletion
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);

    try {
      const res = await api.delete(`/admin/users/${userToDelete._id}`);
      if (res.data.success) {
        showNotification(`User ${userToDelete.name} and related logs deleted permanently`);
        setDeleteModalOpen(false);
        setUserToDelete(null);
        // Refresh users & stats
        fetchData(true);
      }
    } catch (err) {
      console.error('User deletion error:', err);
      showNotification(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
          Loading Admin Platform Controls...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-5 ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-green-050 border-green-400 text-green-900'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header & Platform Badge */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              ADMIN PLATFORM CONTROL
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
          </div>
          <h1 className="font-sora text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            System Administration & Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-normal">
            Supervise registered fitness members, inspect nutrition and health metric activity, reset account access credentials, and maintain data hygiene.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-line hover:bg-slate-100/80 text-navy-900 font-semibold text-xs transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-green-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {/* 4 Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs hover:border-green-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-sora text-3xl font-bold text-navy-900">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              <span className="text-green-700 font-semibold">{stats?.regularUsers || 0} Members</span> · {stats?.adminUsers || 0} Admins
            </div>
          </div>
        </div>

        {/* Card 2: Active Users Today */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs hover:border-green-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">
              Active Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-sora text-3xl font-bold text-navy-900">
              {stats?.activeUsersToday || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {stats?.totalMealsToday || 0} meals · {((stats?.totalWaterToday || 0) / 1000).toFixed(1)}L hydration
            </div>
          </div>
        </div>

        {/* Card 3: Total System Records */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs hover:border-green-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">
              System Logs
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-sora text-3xl font-bold text-navy-900">
              {stats?.totalSystemRecords || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Platform Avg BMI: <span className="font-bold text-navy-900">{stats?.averageBMI || '22.4'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: System Health */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs hover:border-green-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">
              System Health
            </span>
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-sora text-2xl font-bold text-green-700 flex items-center gap-1.5">
              <span>Operational</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Uptime {stats?.systemHealth?.uptime || '99.9%'} · DB Live
            </div>
          </div>
        </div>
      </div>

      {/* Users Management Section */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 sm:p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFAF8]/50">
          <div>
            <h2 className="font-sora text-lg font-bold text-navy-900">
              Registered Users Directory ({filteredUsers.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage accounts, inspect user logs, or perform administrative operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user or email..."
                className="pl-9 pr-4 py-2 text-xs bg-white border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-navy-900 w-full sm:w-56 font-inter"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl font-mono text-xs border border-line">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  roleFilter === 'all'
                    ? 'bg-white text-navy-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  roleFilter === 'user'
                    ? 'bg-white text-navy-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  roleFilter === 'admin'
                    ? 'bg-white text-navy-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Admins
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-slate-500 font-mono uppercase tracking-wider border-b border-line text-[10.5px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Registered</th>
                <th className="px-5 py-3.5 font-semibold">Weight / Target</th>
                <th className="px-5 py-3.5 font-semibold">Profile Details</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-inter">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-navy-900">No users found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm ? 'Try adjusting your search query or filter' : 'No registered users available'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf =
                    currentUser?._id === u._id || currentUser?.id === u._id;
                  const registeredDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Recent';

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-[#F4FAF6]/40 transition-colors group"
                    >
                      {/* User Avatar & Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-600 to-green-800 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900 text-[13px] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="font-mono text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ID: {u._id.substring(u._id.length - 6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 font-mono text-slate-600 text-xs">
                        {u.email}
                      </td>

                      {/* Registered Date */}
                      <td className="px-5 py-4 text-slate-600 font-mono text-[11.5px]">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{registeredDate}</span>
                        </div>
                      </td>

                      {/* Weight / Target */}
                      <td className="px-5 py-4">
                        {u.currentWeight ? (
                          <div>
                            <span className="font-bold text-navy-900 font-mono">
                              {u.currentWeight} kg
                            </span>
                            {u.targetWeight && (
                              <span className="text-slate-400 text-[11px] font-mono ml-1">
                                → {u.targetWeight} kg
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not logged</span>
                        )}
                      </td>

                      {/* Profile Details */}
                      <td className="px-5 py-4 text-slate-600 text-xs">
                        <div>
                          <span>{u.gender || 'Unknown'}</span>
                          {u.height && (
                            <span className="text-slate-400 font-mono ml-1.5">
                              · {u.height} cm
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-green-700 font-medium truncate max-w-[140px]">
                          {u.healthGoal || 'General'}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-300">
                            <ShieldCheck className="w-3 h-3" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            USER
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Logs Button */}
                          <button
                            onClick={() => handleViewActivity(u)}
                            title="View Activity Logs"
                            className="p-1.5 rounded-lg bg-[#FAFAF8] border border-line text-slate-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50/50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => handleOpenReset(u)}
                            title="Reset User Password"
                            className="p-1.5 rounded-lg bg-[#FAFAF8] border border-line text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => handleOpenDelete(u)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot delete your own active admin account" : "Delete User"}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSelf
                                ? 'bg-slate-50 border-line text-slate-300 cursor-not-allowed'
                                : 'bg-[#FAFAF8] border-line text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. VIEW ACTIVITY LOGS MODAL                              */}
      {/* ======================================================== */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setActivityModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-line overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-[#FAFAF8]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sora text-sm font-bold text-navy-900">
                    User Activity & History Logs
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedUserActivity?.user?.name} ({selectedUserActivity?.user?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Quick Bar */}
            {selectedUserActivity?.profile && (
              <div className="bg-[#F4FAF6] px-6 py-3 border-b border-green-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-mono">Gender:</span>{' '}
                  <strong className="text-navy-900">{selectedUserActivity.profile.gender || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">Height:</span>{' '}
                  <strong className="text-navy-900">{selectedUserActivity.profile.height || 'N/A'} cm</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">Current:</span>{' '}
                  <strong className="text-navy-900">{selectedUserActivity.profile.currentWeight || 'N/A'} kg</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">Goal:</span>{' '}
                  <strong className="text-green-700">{selectedUserActivity.profile.healthGoal || 'N/A'}</strong>
                </div>
              </div>
            )}

            {/* Tab Selector */}
            <div className="flex border-b border-line px-6 pt-2 bg-white">
              <button
                onClick={() => setActivityTab('meals')}
                className={`pb-2.5 px-3 font-mono text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activityTab === 'meals'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                Meals ({selectedUserActivity?.meals?.length || 0})
              </button>
              <button
                onClick={() => setActivityTab('water')}
                className={`pb-2.5 px-3 font-mono text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activityTab === 'water'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                Water ({selectedUserActivity?.water?.length || 0})
              </button>
              <button
                onClick={() => setActivityTab('weight')}
                className={`pb-2.5 px-3 font-mono text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activityTab === 'weight'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Weight & BMI ({selectedUserActivity?.weightHistory?.length || 0})
              </button>
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {activityLoading ? (
                <div className="py-12 text-center text-slate-400 font-mono">
                  Loading user activity history...
                </div>
              ) : (
                <>
                  {/* Tab 1: Meals */}
                  {activityTab === 'meals' && (
                    <div className="space-y-2">
                      {!selectedUserActivity?.meals || selectedUserActivity.meals.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 italic">
                          No nutrition records logged by this user yet.
                        </p>
                      ) : (
                        selectedUserActivity.meals.map((meal) => (
                          <div
                            key={meal._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAFAF8]/50 hover:bg-white transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 uppercase">
                                {meal.mealType}
                              </span>
                              <div>
                                <p className="font-semibold text-navy-900 text-xs">
                                  {meal.foodName}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Qty: {meal.quantity} · {meal.date}
                                </p>
                              </div>
                            </div>
                            <div className="font-mono font-bold text-green-700 text-xs">
                              +{meal.calories} kcal
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab 2: Water */}
                  {activityTab === 'water' && (
                    <div className="space-y-2">
                      {!selectedUserActivity?.water || selectedUserActivity.water.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 italic">
                          No hydration records logged by this user yet.
                        </p>
                      ) : (
                        selectedUserActivity.water.map((w) => (
                          <div
                            key={w._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAFAF8]/50"
                          >
                            <div className="flex items-center space-x-2.5">
                              <Droplets className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-semibold text-navy-900">
                                {w.date}
                              </span>
                            </div>
                            <div className="font-mono font-bold text-blue-600">
                              +{w.amount} ml
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab 3: Weight & BMI */}
                  {activityTab === 'weight' && (
                    <div className="space-y-2">
                      {!selectedUserActivity?.weightHistory || selectedUserActivity.weightHistory.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 italic">
                          No weight logs recorded yet.
                        </p>
                      ) : (
                        selectedUserActivity.weightHistory.map((rec) => (
                          <div
                            key={rec._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAFAF8]/50"
                          >
                            <div className="flex items-center space-x-2.5">
                              <Scale className="w-3.5 h-3.5 text-green-600" />
                              <span className="font-semibold text-navy-900 font-mono">
                                {rec.date}
                              </span>
                            </div>
                            <div className="font-mono font-bold text-navy-900">
                              {rec.weight} kg
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-line bg-[#FAFAF8] flex justify-end">
              <button
                onClick={() => setActivityModalOpen(false)}
                className="px-4 py-2 bg-white border border-line rounded-xl font-semibold text-xs text-navy-900 hover:bg-slate-100"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RESET PASSWORD MODAL                                  */}
      {/* ======================================================== */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setResetModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-line overflow-hidden z-10 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sora text-base font-bold text-navy-900">
                  Reset User Password
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {userToReset?.email}
                </p>
              </div>
            </div>

            {!resetSuccessData ? (
              <>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  You are resetting the password for <strong>{userToReset?.name}</strong>. By default, the temporary password will be set to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-green-700 font-bold">Reset@123</code>.
                </p>

                <div className="space-y-2 mb-5">
                  <label className="text-[11.5px] font-semibold text-slate-700 block font-mono">
                    Custom Temporary Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Leave empty for 'Reset@123'"
                    className="w-full px-3.5 py-2 text-xs border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={resettingPassword}
                    className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {resettingPassword ? 'Resetting...' : 'Confirm Password Reset'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center space-x-2 text-green-800 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Password Reset Completed</span>
                  </div>
                  <p className="text-[11.5px] text-green-700 mb-3">
                    Provide the following temporary password to the user:
                  </p>
                  <div className="flex items-center justify-between bg-white border border-green-300 rounded-lg p-2.5">
                    <span className="font-mono font-bold text-sm text-navy-900 select-all">
                      {resetSuccessData.temporaryPassword}
                    </span>
                    <button
                      onClick={handleCopyPassword}
                      className="flex items-center gap-1 text-[11px] font-bold text-green-700 hover:text-green-800 px-2 py-1 rounded bg-green-100"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DELETE USER CONFIRMATION MODAL                        */}
      {/* ======================================================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-line overflow-hidden z-10 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sora text-base font-bold text-navy-900">
                  Confirm User Deletion
                </h3>
                <p className="text-xs text-rose-600 font-semibold font-mono">
                  Irreversible Cascade Action
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-900 mb-4 space-y-1.5">
              <p>
                Are you sure you want to permanently delete user <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
              </p>
              <p className="text-[11px] text-rose-700">
                ⚠️ All associated records including user profile, meals, water intake logs, weight history, and BMI calculations will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {deletingUser ? 'Deleting...' : 'Delete User Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
