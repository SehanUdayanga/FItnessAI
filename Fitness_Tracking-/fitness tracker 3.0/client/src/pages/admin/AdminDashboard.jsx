import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  Edit2,
  Power,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Activity,
  User,
  Mail,
  ShieldAlert,
  Utensils,
  Droplets,
  Scale,
  Flame
} from 'lucide-react';

const AdminDashboard = () => {
  // Statistics State
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Users Table State
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Alerts
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTab, setViewTab] = useState('overview'); // 'overview' | 'meals' | 'water' | 'weight'

  const [editUser, setEditUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    age: 25,
    gender: 'Male',
    height: 170,
    weight: 70,
    fitnessGoal: 'Maintain Weight'
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Confirmation Modals
  const [statusToggleUser, setStatusToggleUser] = useState(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/statistics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = {
        page,
        limit,
        status: statusFilter,
        search: searchQuery
      };
      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load users' });
    } finally {
      setTableLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search Input Debounce/Trigger
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Open View User Details & Fitness Records Modal
  const handleOpenViewModal = async (user) => {
    setViewUser(user);
    setViewTab('overview');
    try {
      setViewLoading(true);
      const res = await api.get(`/admin/users/${user._id}`);
      if (res.data.success) {
        setViewUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user fitness details:', err);
    } finally {
      setViewLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setModalError('');
    setEditUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      age: user.age || 25,
      gender: user.gender || 'Male',
      height: user.height || 170,
      weight: user.weight || 70,
      fitnessGoal: user.fitnessGoal || 'Maintain Weight'
    });
  };

  // Submit Edit User Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      setModalError('Name and Email are required.');
      return;
    }

    try {
      setEditSubmitting(true);
      const res = await api.put(`/admin/users/${editUser._id}`, editFormData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'User details updated successfully.' });
        setEditUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Toggle User Status
  const handleConfirmToggleStatus = async () => {
    if (!statusToggleUser) return;
    try {
      setActionLoading(true);
      const nextStatus = statusToggleUser.status === 'active' ? 'inactive' : 'active';
      const res = await api.patch(`/admin/users/${statusToggleUser._id}/status`, { status: nextStatus });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `User "${statusToggleUser.name}" has been ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`
        });
        setStatusToggleUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!deleteTargetUser) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/admin/users/${deleteTargetUser._id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: `User "${deleteTargetUser.name}" was deleted successfully.` });
        setDeleteTargetUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete user.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback Notification */}
      {feedback.message && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm font-medium border animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Top Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-sora font-bold text-xl text-navy-900">Platform Overview</h2>
            <p className="text-xs text-slate-500">Live dynamic metrics from MongoDB users collection</p>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchUsers();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-line rounded-lg text-xs font-semibold text-slate-600 hover:text-navy-900 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin text-green-700' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Total Users */}
          <div className="bg-white p-6 rounded-2xl border border-line shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500">
                  Total Users
                </p>
                <h3 className="font-sora text-3xl font-extrabold text-navy-900 mt-2">
                  {statsLoading ? '—' : stats.totalUsers}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Registered member accounts</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
          </div>

          {/* 2. Active Users */}
          <div className="bg-white p-6 rounded-2xl border border-line shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500">
                  Active Users
                </p>
                <h3 className="font-sora text-3xl font-extrabold text-green-700 mt-2">
                  {statsLoading ? '—' : stats.activeUsers}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Enabled &amp; active status</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />
          </div>

          {/* 3. Inactive Users */}
          <div className="bg-white p-6 rounded-2xl border border-line shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500">
                  Inactive Users
                </p>
                <h3 className="font-sora text-3xl font-extrabold text-amber-600 mt-2">
                  {statsLoading ? '—' : stats.inactiveUsers}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Suspended or disabled</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <UserX className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        {/* Section Header & Toolbar */}
        <div className="p-6 border-b border-line space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-sora font-bold text-lg text-navy-900">User Management</h2>
              <p className="text-xs text-slate-500">Manage member accounts, view tracking logs, and update records</p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-line self-start sm:self-auto">
              Total: <span className="font-bold text-navy-900">{totalCount}</span> Users
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm text-navy-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm font-medium text-navy-900 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-line text-[11px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Age</th>
                <th className="py-3.5 px-4">Goal</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {tableLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="inline-flex items-center space-x-2 text-slate-500 font-medium">
                      <RefreshCw className="w-5 h-5 animate-spin text-green-700" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <UserX className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-navy-900">No users found</p>
                    <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or filter status.</p>
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item._id} className="hover:bg-[#FAFAF8] transition-colors group">
                    {/* Name & Avatar */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleOpenViewModal(item)}
                        className="flex items-center space-x-3 text-left group-hover:opacity-90 focus:outline-none"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-navy-900 block hover:text-green-700 transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Joined {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {item.email}
                    </td>

                    {/* Age */}
                    <td className="py-4 px-4 text-center font-mono text-xs text-slate-700">
                      {item.age || 25} yrs
                    </td>

                    {/* Fitness Goal */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        {item.fitnessGoal || 'Maintain Weight'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            item.status === 'active' ? 'bg-green-600' : 'bg-rose-600'
                          }`}
                        />
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions: View, Edit, Activate/Deactivate, Delete */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => handleOpenViewModal(item)}
                          title="View User Details & Activity"
                          className="p-1.5 text-slate-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit User"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Activate/Deactivate Button */}
                        <button
                          onClick={() => setStatusToggleUser(item)}
                          title={item.status === 'active' ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-700 hover:bg-green-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteTargetUser(item)}
                          title="Delete User"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-navy-900">{users.length}</span> of{' '}
            <span className="font-semibold text-navy-900">{totalCount}</span> users (Page {page} of {totalPages})
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || tableLoading}
              className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                        page === p
                          ? 'bg-green-700 text-white shadow-xs'
                          : 'border border-line bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || tableLoading}
              className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VIEW USER MODAL (Details + Meals + Water + Weight) */}
      {/* ========================================================= */}
      {viewUser && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-line shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-slate-50 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  {viewUser.name ? viewUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-sora font-bold text-base text-navy-900">{viewUser.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{viewUser.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    viewUser.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {viewUser.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setViewUser(null)}
                  className="text-slate-400 hover:text-navy-900 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-line bg-[#FAFAF8] px-5 pt-2 gap-2 overflow-x-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewTab('overview')}
                className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  viewTab === 'overview'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile Info</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab('meals')}
                className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  viewTab === 'meals'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Meals Logged</span>
                {viewUser.meals && (
                  <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                    {viewUser.meals.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewTab('water')}
                className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  viewTab === 'water'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Water Intake</span>
                {viewUser.waterLogs && (
                  <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                    {viewUser.waterLogs.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewTab('weight')}
                className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  viewTab === 'weight'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Weight History</span>
                {viewUser.weightHistory && (
                  <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                    {viewUser.weightHistory.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body with Tab Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {viewLoading ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-green-700" />
                  <p className="text-xs font-medium">Fetching latest fitness records...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {viewTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl border border-line bg-[#FAFAF8]">
                          <span className="text-slate-400 uppercase font-mono block text-[10px]">Age</span>
                          <span className="font-semibold text-navy-900 text-sm mt-0.5 block">
                            {viewUser.age || 25} years
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-[#FAFAF8]">
                          <span className="text-slate-400 uppercase font-mono block text-[10px]">Gender</span>
                          <span className="font-semibold text-navy-900 text-sm mt-0.5 block">
                            {viewUser.gender || 'Male'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-[#FAFAF8]">
                          <span className="text-slate-400 uppercase font-mono block text-[10px]">Height</span>
                          <span className="font-semibold text-navy-900 text-sm mt-0.5 block">
                            {viewUser.height || 170} cm
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-[#FAFAF8]">
                          <span className="text-slate-400 uppercase font-mono block text-[10px]">Current Weight</span>
                          <span className="font-semibold text-navy-900 text-sm mt-0.5 block">
                            {viewUser.weight || 70} kg
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-line bg-[#FAFAF8] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 uppercase font-mono text-[10px]">Primary Fitness Goal</span>
                          <span className="font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                            {viewUser.fitnessGoal || 'Maintain Weight'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-line">
                          <span className="text-slate-400 uppercase font-mono text-[10px]">Registration Date</span>
                          <span className="font-mono text-slate-700">
                            {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MEALS LOGGED */}
                  {viewTab === 'meals' && (
                    <div className="space-y-3">
                      {!viewUser.meals || viewUser.meals.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-navy-900 text-xs">No meals logged yet</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">User has not recorded any meal entries.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {viewUser.meals.map((meal) => (
                            <div
                              key={meal._id}
                              className="p-3.5 rounded-xl border border-line bg-[#FAFAF8] flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-navy-900 text-sm">{meal.foodName}</span>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {meal.mealType}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  Qty: {meal.quantity || '1 serving'} • Date: {meal.date || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 font-sora font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                <Flame className="w-3.5 h-3.5 text-amber-500" />
                                <span>{meal.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: WATER INTAKE */}
                  {viewTab === 'water' && (
                    <div className="space-y-3">
                      {!viewUser.waterLogs || viewUser.waterLogs.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <Droplets className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-navy-900 text-xs">No water intake logged yet</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">User has not logged hydration entries.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {viewUser.waterLogs.map((log) => (
                            <div
                              key={log._id}
                              className="p-3.5 rounded-xl border border-line bg-[#FAFAF8] flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                                  <Droplets className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-semibold text-navy-900 block text-sm">
                                    {log.amount} ml
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    Logged on {log.date || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-line">
                                {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: WEIGHT HISTORY */}
                  {viewTab === 'weight' && (
                    <div className="space-y-3">
                      {!viewUser.weightHistory || viewUser.weightHistory.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <Scale className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-navy-900 text-xs">No weight records logged yet</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">User has not logged historical weight data.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {viewUser.weightHistory.map((item) => (
                            <div
                              key={item._id}
                              className="p-3.5 rounded-xl border border-line bg-[#FAFAF8] flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                  <Scale className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-semibold text-navy-900 block text-sm">
                                    {item.weight} kg
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    Recorded for {item.date || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-line">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-line bg-slate-50 text-right flex-shrink-0">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 bg-white border border-line hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT USER MODAL */}
      {/* ========================================================= */}
      {editUser && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-line shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-sora font-bold text-base text-navy-900">Edit User Information</h3>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="text-slate-400 hover:text-navy-900 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit}>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={editFormData.age}
                      onChange={(e) => setEditFormData({ ...editFormData, age: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                      Gender
                    </label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="30"
                      max="250"
                      value={editFormData.height}
                      onChange={(e) => setEditFormData({ ...editFormData, height: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="300"
                      value={editFormData.weight}
                      onChange={(e) => setEditFormData({ ...editFormData, weight: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1">
                    Fitness Goal
                  </label>
                  <select
                    value={editFormData.fitnessGoal}
                    onChange={(e) => setEditFormData({ ...editFormData, fitnessGoal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900 cursor-pointer"
                  >
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Maintain Weight">Maintain Weight</option>
                    <option value="Gain Weight">Gain Weight</option>
                    <option value="Improve General Health">Improve General Health</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-line bg-slate-50 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 bg-white border border-line hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ACTIVATE / DEACTIVATE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {statusToggleUser && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-line shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  statusToggleUser.status === 'active'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base text-navy-900">
                  {statusToggleUser.status === 'active' ? 'Deactivate User Account' : 'Activate User Account'}
                </h3>
                <p className="text-xs text-slate-500">Confirm status change</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to{' '}
              <strong className="text-navy-900">
                {statusToggleUser.status === 'active' ? 'deactivate' : 'activate'}
              </strong>{' '}
              the account for <strong className="text-navy-900">{statusToggleUser.name}</strong> ({statusToggleUser.email})?
            </p>

            {statusToggleUser.status === 'active' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Deactivated users will not be able to log in until their account is reactivated.
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusToggleUser(null)}
                className="px-4 py-2 bg-white border border-line hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmToggleStatus}
                className={`px-4 py-2 font-semibold text-xs rounded-xl text-white transition-colors disabled:opacity-50 ${
                  statusToggleUser.status === 'active'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-green-700 hover:bg-green-600'
                }`}
              >
                {actionLoading ? 'Updating...' : statusToggleUser.status === 'active' ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteTargetUser && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-line shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base text-rose-900">Delete User Account</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent Action</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-navy-900">{deleteTargetUser.name}</strong> ({deleteTargetUser.email})?
            </p>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              ⚠️ This will permanently remove the user and all their associated fitness records (weight, meals, water intake). This action cannot be undone.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 bg-white border border-line hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50 shadow-xs"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
