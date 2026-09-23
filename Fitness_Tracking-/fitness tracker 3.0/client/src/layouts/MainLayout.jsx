import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AIChatWidget from '../components/AIChatWidget';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-700 flex flex-col selection:bg-green-100 selection:text-green-900 font-inter relative">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
        <Outlet />
      </main>

      {/* Floating Bottom-Right AI Assistant Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

export default MainLayout;

