import React, { useMemo } from 'react';
import { useMockData } from '../../hooks/useMockData';
import { useAuth } from '../../context/AuthContext';
import { NotificationsPanel } from '../UI/NotificationsPanel';

export function Navbar() {
  const { hospitals } = useMockData();
  const { user } = useAuth();

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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-900">Welcome, {firstName}</h2>
        <p className="text-sm text-slate-500">
          {hospital?.name ?? 'Unknown Hospital'} · {roleLabel}
        </p>
      </div>
      <NotificationsPanel />
    </header>
  );
}
