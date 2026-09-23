import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  Utensils,
  Droplets,
  Scale,
  Calculator,
  Bot,
  User,
  LogOut,
  Activity,
  X,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Nutrition', path: '/meals', icon: Utensils },
    { name: 'Water', path: '/water', icon: Droplets },
    { name: 'Health & BMI', path: '/bmi', icon: Calculator },
    { name: 'Weight History', path: '/weight', icon: Scale },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' },
    { name: 'Profile', path: '/profile', icon: User },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldCheck, badge: 'ADMIN' }]
      : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-navy-900 text-white w-64 p-4 border-r border-line-dark">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-4 mb-4 border-b border-line-dark">
        <NavLink to="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-[9px] bg-green-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-sora font-bold text-base text-white tracking-wide leading-none">FITTRACK</h1>
            <span className="font-mono text-[10px] text-green-400 font-semibold tracking-wider uppercase">App Dashboard</span>
          </div>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all ${
                  isActive
                    ? 'bg-green-700 text-white shadow-sm font-semibold'
                    : 'text-[#9AA6AC] hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-400/20 text-green-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Quick Info & Logout */}
      <div className="pt-4 border-t border-line-dark mt-auto space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-navy-800 border border-line-dark/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-green-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[#8792A0] truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 w-full px-3 py-2 rounded-[10px] text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30 w-64">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>
    </>
  );
};

export default Sidebar;

