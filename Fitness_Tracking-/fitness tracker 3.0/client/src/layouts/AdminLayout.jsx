import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Bot,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Calendar,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'AI Monitoring & Configuration', path: '/admin/ai', icon: Bot },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('/admin/ai')) return 'AI Monitoring & Configuration';
    if (location.pathname.includes('/admin/profile')) return 'Admin Profile';
    return 'Admin Dashboard';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy-900 text-white w-72 p-4 border-r border-line-dark selection:bg-green-600 selection:text-white">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-4 mb-3 border-b border-line-dark">
        <NavLink to="/admin/dashboard" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center text-white shadow-md shadow-green-700/30 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-sora font-bold text-base text-white tracking-wide leading-none">FITTRACK</h1>
              <span className="bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                ADMIN
              </span>
            </div>
            <span className="font-mono text-[10px] text-green-400 font-medium tracking-wider uppercase block mt-0.5">
              Admin Panel
            </span>
          </div>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1.5 overflow-y-auto py-2">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-700 text-white shadow-sm font-semibold'
                  : 'text-[#9AA6AC] hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Logout */}
      <div className="pt-3 border-t border-line-dark mt-auto space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-navy-800 border border-line-dark/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-green-400 font-mono truncate">Role: ADMIN</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex selection:bg-green-100 selection:text-green-900 font-inter">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-[#FAFAF8]/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-line dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <span className="hidden sm:inline">Admin Panel</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline text-slate-400" />
              <span className="font-sora font-semibold text-sm sm:text-base text-navy-900 dark:text-slate-200">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-line dark:border-slate-700 px-3 py-1.5 rounded-full font-medium shadow-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
              <span>{todayFormatted}</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:px-3 sm:py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-line dark:hover:border-slate-700 rounded-lg transition-colors flex items-center space-x-1.5"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
