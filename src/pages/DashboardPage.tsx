import React, { useMemo, useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import {
  ClipboardList,
  FileText,
  Users,
  Building,
  Send,
  UserPlus,
  ListChecks,
  Truck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMockData } from '../hooks/useMockData';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/UI/StatCard';
import { StatusBadge } from '../components/UI/StatusBadge';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function DashboardPage() {
  const { hospitals, patients, referrals } = useMockData();
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'referrals' | 'transfers'>('referrals');
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [transfersError, setTransfersError] = useState<string | null>(null);

  const { filteredPatients, filteredReferrals } = useMemo(() => {
    if (!user) {
      return { filteredPatients: [], filteredReferrals: [] };
    }

    const filteredPatients = patients.filter((p) => p.hospital_id === user.hospital_id);
    const filteredReferrals = referrals.filter(
      (r) =>
        r.requesting_hospital_id === user.hospital_id ||
        r.receiving_hospital_id === user.hospital_id
    );

    return { filteredPatients, filteredReferrals };
  }, [patients, referrals, user]);

  const transfersForUser = useMemo(() => {
    if (!user) return [];
    return transfers.filter(
      (t) => t.fromHospitalId === user.hospital_id || t.toHospitalId === user.hospital_id
    );
  }, [transfers, user]);

  const counts = useMemo(() => {
    const referralPending = filteredReferrals.filter((r) => r.status === 'pending').length;
    const referralApproved = filteredReferrals.filter((r) => r.status === 'approved').length;
    const referralCompleted = filteredReferrals.filter((r) => r.status === 'completed').length;
    
    const transferPending = transfersForUser.filter((t) => t.status === 'pending').length;
    const transferInTransit = transfersForUser.filter((t) => t.status === 'in_transit').length;
    const transferCompleted = transfersForUser.filter((t) => t.status === 'completed').length;
    
    return {
      patients: filteredPatients.length,
      referrals: filteredReferrals.length,
      referralPending,
      referralApproved,
      referralCompleted,
      transfers: transfersForUser.length,
      transferPending,
      transferInTransit,
      transferCompleted,
    };
  }, [filteredPatients.length, filteredReferrals, transfersForUser]);

  const recentReferrals = filteredReferrals.slice(0, 10);
  const recentTransfers = transfersForUser.slice(0, 10);

  useEffect(() => {
    if (!user) return;
    const loadTransfers = async () => {
      setTransfersLoading(true);
      setTransfersError(null);
      try {
        const res = await apiClient.transfers.list();
        if (res && res.success) {
          setTransfers(res.data || []);
        } else if (res && res.data) {
          setTransfers(res.data || []);
        } else {
          setTransfers([]);
        }
      } catch (err: any) {
        console.error('Failed to load transfers for dashboard:', err);
        setTransfersError(err?.message || 'Failed to load transfers');
        setTransfers([]);
      } finally {
        setTransfersLoading(false);
      }
    };

    loadTransfers();
  }, [user]);

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const getHospitalAbbrev = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  const getTransferStatusClasses = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-emerald-100 text-emerald-800',
      in_transit: 'bg-blue-100 text-blue-800',
      completed: 'bg-slate-100 text-slate-800',
      cancelled: 'bg-rose-100 text-rose-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Combined 9-card grid: 5 cols on large screens -> 2 rows (5 + 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Patients"
          value={counts.patients}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Total Referrals"
          value={counts.referrals}
          icon={<ClipboardList className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Transfers"
          value={counts.transfers}
          icon={<Truck className="h-5 w-5" />}
          color="red"
        />

        <StatCard
          title="Pending Referrals"
          value={counts.referralPending}
          icon={<FileText className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Approved Referrals"
          value={counts.referralApproved}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Completed Referrals"
          value={counts.referralCompleted}
          icon={<Building className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Pending Transfers"
          value={counts.transferPending}
          icon={<FileText className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="In Transit"
          value={counts.transferInTransit}
          icon={<AlertCircle className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Completed Transfers"
          value={counts.transferCompleted}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/transfers"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">View Transfers</p>
            <p className="mt-1 text-xs text-slate-500">Track patient transfers between hospitals</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Truck className="h-5 w-5" />
          </span>
        </Link>

        <Link
          to="/patients"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">View Patients</p>
            <p className="mt-1 text-xs text-slate-500">See patients' information and records</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <UserPlus className="h-5 w-5" />
          </span>
        </Link>

        <Link
          to="/referrals"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">View Referrals</p>
            <p className="mt-1 text-xs text-slate-500">Track patient referrals between hospitals</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ListChecks className="h-5 w-5" />
          </span>
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSection('referrals')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeSection === 'referrals' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Recent referrals
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('transfers')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeSection === 'transfers' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Recent transfers
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {activeSection === 'referrals' ? 'Recent referral activity in your network.' : 'Recent transfer activity involving your hospital.'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </div>

        {activeSection === 'referrals' ? (
          recentReferrals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No referrals yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden overflow-y-auto pr-2 sm:pr-0 space-y-3 rounded-xl" style={{ minHeight: '20rem', maxHeight: '20rem' }}>
              {recentReferrals.map((referral) => {
                const requestingHospital = hospitalMap.get(referral.requesting_hospital_id) ?? '';
                const receivingHospital = hospitalMap.get(referral.receiving_hospital_id) ?? '';
                const logoLabel = getInitials(referral.patient_name);
                const subtext = `${requestingHospital} → ${receivingHospital}`;

                return (
                  <Link
                    key={referral.id}
                    to={`/referrals/${referral.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {logoLabel}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{referral.patient_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{subtext}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={referral.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          // Transfers list
          <div className="mt-4 overflow-hidden overflow-y-auto pr-2 sm:pr-0 space-y-3 rounded-xl" style={{ minHeight: '20rem', maxHeight: '24rem' }}>
            {recentTransfers.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No transfers yet.</p>
            ) : (
              recentTransfers.map((t) => {
                const from = hospitalMap.get(t.fromHospitalId) ?? t.fromHospital?.name ?? '';
                const to = hospitalMap.get(t.toHospitalId) ?? t.toHospital?.name ?? '';
                const logo = getInitials(t.patientName || t.patient_name || 'PT');
                return (
                  <Link
                    key={t.id}
                    to={`/transfers/${t.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {logo}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t.patientName || t.patient_name || '—'}</p>
                        <p className="mt-1 text-xs text-slate-500">{from} → {to}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getTransferStatusClasses(t.status)}`}>
                        {t.status === 'in_transit' ? 'In Transit' : (t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Unknown')}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </section>
    </div>
  );
}
