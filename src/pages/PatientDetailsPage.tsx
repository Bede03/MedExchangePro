import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, FileText, HeartPulse, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { apiClient } from '../services/api';
import { StatusBadge } from '../components/UI/StatusBadge';

const TABS = ['Demographics', 'Medical History', 'Lab Results', 'Documents'] as const;

type Tab = (typeof TABS)[number];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB');
}

export function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hospitals, referrals, patients } = useMockData();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [externalHistory, setExternalHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const localPatient = useMemo(
    () => patients.find((p) => p.id === id) ?? null,
    [patients, id]
  );

  const normalizedRouteId = useMemo(
    () => (id ? id.replace(/_/g, '') : ''),
    [id]
  );

  useEffect(() => {
    const loadPatientWithHistory = async () => {
      if (!id) return;
      setLoading(true);
      setHistoryLoading(true);
      setError(null);
      setHistoryError(null);

      try {
        const requestId = localPatient?.national_id ?? normalizedRouteId;
        const response = await apiClient.patients.getCombined(requestId);
        setPatient(response.data.patient);
        setExternalHistory(response.data.externalHistory || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load patient details');
        setHistoryError(err.message || 'Failed to load medical history');
      } finally {
        setLoading(false);
        setHistoryLoading(false);
      }
    };

    loadPatientWithHistory();
  }, [id, localPatient, normalizedRouteId]);

  const hospital = useMemo(
    () => hospitals.find((h) => h.id === patient?.hospitalId) ?? null,
    [hospitals, patient?.hospitalId]
  );

  const patientReferrals = useMemo(
    () => referrals.filter((r) => r.patient_id === id),
    [referrals, id]
  );

  const [activeTab, setActiveTab] = useState<Tab>('Demographics');

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-sm text-slate-500">Loading patient details…</p>
      </div>
    );
  }

  if (!patient || error) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-sm text-slate-500">{error ?? 'Patient not found or access denied.'}</p>
      </div>
    );
  }

  const initials = patient.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{patient.name}</p>
              <p className="text-sm text-slate-500">{hospital?.name ?? 'Unknown Hospital'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'Demographics'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab('Demographics')}
            >
              <ClipboardList className="mr-2 inline h-4 w-4" />
              Demographics
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'Medical History'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab('Medical History')}
            >
              <FileText className="mr-2 inline h-4 w-4" />
              Medical History
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'Lab Results'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab('Lab Results')}
            >
              <HeartPulse className="mr-2 inline h-4 w-4" />
              Lab Results
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'Documents'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab('Documents')}
            >
              <Folder className="mr-2 inline h-4 w-4" />
              Documents
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'Demographics' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Date of Birth</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(patient.dob)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Gender</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Phone</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">National ID</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.nationalId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Blood Type</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.bloodType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Address</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Insurance Scheme</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.insurance?.scheme ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Member Number</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{patient.insurance?.memberNumber ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Registered</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(patient.registeredAt ?? patient.dob)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Medical History' && (
            <div className="space-y-6">
              {historyLoading ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-medium text-slate-700">Loading medical history…</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Medical history</h3>
                    <div className="mt-5 space-y-6">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medication history</h4>
                        {patient.medications && patient.medications.length > 0 ? (
                          <div className="mt-3 space-y-4">
                            {patient.medications.map((med: any) => (
                              <div key={med.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-slate-900">{med.medicationName}</p>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {med.durationDays
                                      ? `${med.durationDays} ${med.durationDays === 1 ? 'day' : 'days'}`
                                      : 'Ongoing'}
                                  </p>
                                </div>
                                <p className="mt-2 text-sm text-slate-700">Dose: {med.dose || 'N/A'}</p>
                                <p className="mt-1 text-sm text-slate-700">Frequency: {med.frequency || 'N/A'}</p>
                                <p className="mt-1 text-sm text-slate-700">Prescribed by: {med.prescribedBy ?? 'Unknown'}</p>
                                <p className="mt-1 text-sm text-slate-700">Diagnosis: {med.diagnosis || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-6">
                            <p className="text-sm font-medium text-slate-700">No medication history found.</p>
                            <p className="mt-2 text-sm text-slate-500">Medication records will appear here when available.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Lab Results' && (
            <div className="space-y-4">
              {patient.labResults && patient.labResults.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Test</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Result</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Flag</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {patient.labResults.map((lab: any) => (
                        <tr key={lab.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700">{lab.parameter}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{lab.value} {lab.unit}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{lab.refRange || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{lab.flag || 'Pending'}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700">{lab.resultedAt ? formatDate(lab.resultedAt) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-medium text-slate-700">No lab results available.</p>
                  <p className="mt-2 text-sm text-slate-500">Upload lab reports to keep this section updated.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-700">No documents uploaded.</p>
              <p className="mt-2 text-sm text-slate-500">Add documents to keep patient records complete.</p>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Referrals</h2>
        <p className="mt-1 text-sm text-slate-500">Referrals for this patient.</p>

        {patientReferrals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No referrals yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientReferrals.map((ref) => {
                  const from = hospitals.find((h) => h.id === ref.requesting_hospital_id);
                  const to = hospitals.find((h) => h.id === ref.receiving_hospital_id);
                  return (
                    <tr key={ref.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{from?.name ?? ''}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{to?.name ?? ''}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            ref.priority === 'Emergency'
                              ? 'bg-rose-100 text-rose-800'
                              : ref.priority === 'Urgent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {ref.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{ref.reason}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <StatusBadge status={ref.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{formatDate(ref.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
