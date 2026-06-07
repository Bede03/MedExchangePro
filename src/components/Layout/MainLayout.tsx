import React, { useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <div
          className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity duration-200 md:hidden ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-900 text-white transition-transform duration-300 md:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex flex-1 flex-col bg-slate-50 overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col">
            <div className="mx-auto w-full max-w-7xl flex-1">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
