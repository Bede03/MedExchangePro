import React from 'react';
import { Home, Users, Building, FileText, ClipboardList, BarChart3, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../hooks/useMockData';

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className = '', isMobile = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { hospitals } = useMockData();

  const hospital = hospitals.find((h) => h.id === user?.hospital_id);

  const links = React.useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: 'Admin Panel', icon: Users },
        { to: '/reports', label: 'Reports', icon: BarChart3 },
      ];
    }

    return [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
      { to: '/patients', label: 'Patients', icon: ClipboardList },
      { to: '/referrals', label: 'Referrals', icon: FileText },
      { to: '/transfers', label: 'Transfers', icon: Building },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ];
  }, [user?.role]);

  return (
    <aside className={`flex h-full w-72 flex-col bg-slate-900 text-white ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
            M
          </div>
          <div>
            <p className="text-lg font-semibold">MedExchange</p>
            <p className="text-xs text-slate-200">{hospital?.name ?? 'Referral management'}</p>
          </div>
        </div>
        {isMobile && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
