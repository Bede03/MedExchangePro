import React, { useMemo } from 'react';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';
import { NotificationsPanel } from '../UI/NotificationsPanel';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { hospitals } = useMockData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const hospital = useMemo(() => {
    return hospitals.find((h) => h.id === user?.hospital_id) ?? null;
  }, [hospitals, user?.hospital_id]);

  const roleLabel = useMemo(() => {
    if (!user) return '';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'clinician') return 'Clinician';
    return 'Hospital Staff';
  }, [user]);

  const firstName = user?.full_name.split(' ')[0] ?? 'User';

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-4">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none md:hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-white">Welcome, {firstName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {hospital?.name ?? 'Unknown Hospital'} · {roleLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-100 shadow-sm transition hover:bg-slate-900 focus:outline-none"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationsPanel />
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-100 shadow-sm transition hover:bg-slate-900 focus:outline-none"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
