import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, FileText, HeartPulse, Folder, Paperclip, Download, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { apiClient } from '../services/api';
import { StatusBadge } from '../components/UI/StatusBadge';
import { Table } from '../components/UI/Table';

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
  const { hospitals, referrals, patients, transfers } = useMockData();
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

  const patientReferrals = useMemo(() => {
    const currentPatientId = localPatient?.id ?? patient?.id ?? null;
    const currentNationalId = localPatient?.national_id ?? patient?.nationalId ?? null;
    const routeIdNormalized = normalizedRouteId;

    return referrals.filter((r) => {
      const matchesPatientId = currentPatientId ? r.patient_id === currentPatientId : false;
      const matchesNationalId = currentNationalId
        ? r.patient_national_id === currentNationalId || r.patient_id === currentNationalId
        : false;
      const matchesRouteId = routeIdNormalized ? r.patient_id === routeIdNormalized || r.patient_national_id === routeIdNormalized : false;

      return matchesPatientId || matchesNationalId || matchesRouteId;
    });
  }, [referrals, localPatient, patient, normalizedRouteId]);

  const patientTransfers = useMemo(() => {
    const currentNationalId = localPatient?.national_id ?? patient?.nationalId ?? null;
    const currentPatientName = (patient?.name ?? localPatient?.name ?? '').trim().toLowerCase();

    return transfers.filter((transfer) => {
      const matchesNationalId = currentNationalId
        ? transfer.patientNationalId === currentNationalId || transfer.patientName === currentNationalId
        : false;
      const matchesPatientName = currentPatientName
        ? transfer.patientName?.toLowerCase() === currentPatientName
        : false;
      const matchesRouteId = normalizedRouteId
        ? transfer.patientNationalId === normalizedRouteId || transfer.patientName === normalizedRouteId
        : false;

      return matchesNationalId || matchesPatientName || matchesRouteId;
    });
  }, [transfers, localPatient, patient, normalizedRouteId]);

  const [activeTab, setActiveTab] = useState<Tab>('Demographics');

  const externalDocumentEntries = useMemo(() => {
    const entries: Array<{ title: string; text: string; source: string }> = [];

    const addEntry = (text: string, source: string, title?: string) => {
      const normalized = (text ?? '').toString().trim();
      if (!normalized || /no documents available/i.test(normalized) || /no diagnoses found/i.test(normalized)) {
        return;
      }

      const lines = normalized
        .split(/\r?\n|;\s*/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return;

      lines.forEach((line, index) => {
        entries.push({
          title: title && index === 0 ? title : 'Document',
          text: line,
          source,
        });
      });
    };

    if (Array.isArray(externalHistory)) {
      externalHistory.forEach((record: any) => {
        const documentText = record?.patient_documents || record?.documents || record?.diagnosis || record?.description;
        if (documentText) {
          addEntry(String(documentText), record?.source_system || 'External hospital database');
        }
      });
    }

    return entries;
  }, [patient, externalHistory]);

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
                      <section>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnoses</h4>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {(patient.diagnoses ?? []).length} record(s)
                          </span>
                        </div>
                        <Table
                          columns={[
                            { header: 'Code', accessor: (row: any) => row.icd10Code || 'N/A' },
                            { header: 'Diagnosis', accessor: (row: any) => row.description || 'N/A' },
                            { header: 'Primary', accessor: (row: any) => row.isPrimary ? 'Yes' : 'No' },
                            { header: 'Confirmed', accessor: (row: any) => (row.confirmedAt ? formatDate(row.confirmedAt) : 'N/A') },
                          ]}
                          data={patient.diagnoses ?? []}
                          rowKey={(row: any) => String(row.id ?? `${row.icd10Code}-${row.confirmedAt}`)}
                          emptyMessage="No diagnoses found for this patient."
                        />
                      </section>

                      <section>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medication history</h4>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {(patient.medications ?? []).length} medication(s)
                          </span>
                        </div>
                        <Table
                          columns={[
                            { header: 'Medication', accessor: (row: any) => row.medicationName || row.name || 'N/A' },
                            { header: 'Dose', accessor: (row: any) => row.dose || 'N/A' },
                            { header: 'Frequency', accessor: (row: any) => row.frequency || 'N/A' },
                            { header: 'Duration', accessor: (row: any) => row.durationDays ? `${row.durationDays} day(s)` : 'Ongoing' },
                            { header: 'Prescribed By', accessor: (row: any) => row.prescribedBy || 'Unknown' },
                            { header: 'Diagnosis', accessor: (row: any) => row.diagnosis || 'N/A' },
                          ]}
                          data={patient.medications ?? []}
                          rowKey={(row: any) => String(row.id ?? `${row.medicationName}-${row.dose}`)}
                          emptyMessage="No medication history found for this patient."
                        />
                      </section>
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
            <div>
              {externalDocumentEntries.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-medium text-slate-700">No external hospital documents available.</p>
                  <p className="mt-2 text-sm text-slate-500">Documents from the external hospital database will appear here when they exist.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-1">External hospital documents</p>
                  <p className="mb-4 text-xs text-slate-500">Only records available from the external hospital database are shown in this tab.</p>
                  <div className="space-y-3">
                    {externalDocumentEntries.map((entry, index) => (
                      <article key={`${entry.source}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                            <p className="text-xs uppercase tracking-wide text-slate-500">{entry.source}</p>
                          </div>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">External record</span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{entry.text}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
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
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
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
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        <Link
                          to={`/referrals/${ref.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transfers</h2>
            <p className="mt-1 text-sm text-slate-500">Transfers associated with this patient.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {patientTransfers.length} record{patientTransfers.length === 1 ? '' : 's'}
          </span>
        </div>

        {patientTransfers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No transfers yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer Id</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientTransfers.map((transfer) => {
                  const from = hospitals.find((h) => h.id === transfer.fromHospitalId);
                  const to = hospitals.find((h) => h.id === transfer.toHospitalId);
                  const statusClassMap: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-800',
                    approved: 'bg-emerald-100 text-emerald-800',
                    in_transit: 'bg-sky-100 text-sky-800',
                    completed: 'bg-indigo-100 text-indigo-800',
                    cancelled: 'bg-rose-100 text-rose-800',
                  };

                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{transfer.transferNumber != null ? `TRF-${transfer.transferNumber}` : transfer.transferId}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{from?.name ?? 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{to?.name ?? 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{transfer.transferType}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{transfer.reasonForTransfer || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[transfer.status] ?? 'bg-slate-100 text-slate-800'}`}>
                          {transfer.status === 'in_transit' ? 'In Transit' : transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{formatDate(transfer.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        <Link
                          to={`/transfers/${transfer.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
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
