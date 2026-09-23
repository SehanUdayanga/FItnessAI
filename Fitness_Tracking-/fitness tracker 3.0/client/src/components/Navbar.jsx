import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Calendar,
  User,
  Activity,
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const [activeSection, setActiveSection] = useState('dashboard-overview');
  const isProgressPage = location.pathname === '/progress' || location.pathname === '/progression';

  const navLinks = [
    { name: 'Dashboard', sectionId: 'dashboard-overview', path: '/dashboard', isPage: false },
    { name: 'Progression', path: '/progress', isPage: true },
  ];

  const handleNavClick = (e, link) => {
    e.preventDefault();
    if (link.isPage) {
      navigate(link.path);
      return;
    }

    // Dashboard click
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF8] dark:bg-slate-900/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-line dark:border-slate-800 px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <NavLink
          to="/dashboard"
          onClick={(e) => handleNavClick(e, { sectionId: 'dashboard-overview', isPage: false })}
          className="flex items-center space-x-2.5 flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-[10px] bg-green-700 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-sora font-bold text-base text-navy-900 dark:text-slate-200 tracking-tight leading-none">
              FITTRACK
            </span>
            <span className="font-mono text-[9.5px] text-green-700 font-semibold tracking-wider uppercase leading-tight mt-0.5">
              Health & Fitness
            </span>
          </div>
        </NavLink>

        {/* Center: Top Navigation Links [ Dashboard ] [ Meals ] [ Water ] [ Weight ] [ AI Assistant ] [ Progression ] */}
        <nav className="flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 p-1 rounded-xl border border-line dark:border-slate-700 shadow-xs font-inter text-xs overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = link.isPage
              ? isProgressPage
              : !isProgressPage && activeSection === link.sectionId;

            return (
              <button
                key={link.name}
                type="button"
                onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-green-700 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Right: Date Badge, User Info & Logout Button */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-line dark:border-slate-700 px-3 py-1.5 rounded-full font-medium shadow-xs font-mono">
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

          {/* User Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-green-400 transition-all focus:outline-none"
            >
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-green-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-green-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
              <span className="hidden sm:inline font-semibold text-xs text-navy-900 dark:text-slate-200 max-w-[100px] truncate">
                {user?.name || 'Alex'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-line dark:border-slate-700 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-line dark:border-slate-700">
                  <p className="text-xs font-bold text-navy-900 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 font-medium flex items-center space-x-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

