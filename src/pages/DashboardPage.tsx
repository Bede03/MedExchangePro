import React, { useMemo } from 'react';
import {
  ClipboardList,
  FileText,
  Users,
  Building,
  Send,
  UserPlus,
  ListChecks,
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

  const counts = useMemo(() => {
    const pending = filteredReferrals.filter((r) => r.status === 'pending').length;
    const completed = filteredReferrals.filter((r) => r.status === 'completed').length;
    return {
      patients: filteredPatients.length,
      referrals: filteredReferrals.length,
      pending,
      completed,
    };
  }, [filteredPatients.length, filteredReferrals]);

  const recent = filteredReferrals.slice(0, 5);

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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
          title="Pending"
          value={counts.pending}
          icon={<FileText className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={counts.completed}
          icon={<Building className="h-5 w-5" />}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/referrals/new"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">Submit Referral</p>
            <p className="mt-1 text-xs text-slate-500">Refer a patient to another hospital</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Send className="h-5 w-5" />
          </span>
        </Link>

        <Link
          to="/patients"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">View Patients</p>
            <p className="mt-1 text-xs text-slate-500">See registered patients</p>
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
            <p className="mt-1 text-xs text-slate-500">{counts.pending} pending referrals</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ListChecks className="h-5 w-5" />
          </span>
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent referrals</h2>
            <p className="mt-1 text-sm text-slate-500">Recent referral activity in your network.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No referrals yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recent.map((referral) => {
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
        )}
      </section>
    </div>
  );
}
