import React from 'react';
import { Home, Users, Building, FileText, ClipboardList, PlusCircle, LogOut, BarChart3 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../hooks/useMockData';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hospitals } = useMockData();

  const hospital = hospitals.find((h) => h.id === user?.hospital_id);

  const links = React.useMemo(() => {
    const base = [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
      { to: '/patients', label: 'Patients', icon: ClipboardList },
      { to: '/referrals', label: 'Referrals', icon: FileText },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ];

    if (user?.role === 'admin') {
      return [
        ...base,
        { to: '/admin', label: 'Admin Panel', icon: Users },
      ];
    }

    return base;
  }, [user?.role]);

  return (
    <aside className="flex h-full w-72 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
          M
        </div>
        <div>
          <p className="text-lg font-semibold">MedExchange</p>
          <p className="text-xs text-slate-200">{hospital?.name ?? 'Referral management'}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
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

      <div className="px-4 py-4">
        {user ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{user.full_name}</p>
              <p className="text-xs text-slate-300">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              <span>Logout</span>
              <LogOut className="h-4 w-4"/>
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
