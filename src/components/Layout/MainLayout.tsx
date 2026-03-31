import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-slate-50 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto px-6 py-6 flex flex-col">
          <div className="mx-auto w-full max-w-6xl flex-1">
            {children || <Outlet />}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
