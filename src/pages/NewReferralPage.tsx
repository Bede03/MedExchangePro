import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { getDepartmentsForHospital, hospitalHasDepartment } from '../data/departments';

const priorities = ['Emergency', 'Urgent', 'Routine'] as const;

export function NewReferralPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hospitals, patients, addReferral } = useMockData();

  const patientsForHospital = useMemo(
    () => patients.filter((p) => p.hospital_id === user?.hospital_id),
    [patients, user?.hospital_id]
  );

  const [patientId, setPatientId] = useState('');
  const patient = useMemo(
    () => patientsForHospital.find((p) => p.id === patientId) ?? null,
    [patientsForHospital, patientId]
  );

  React.useEffect(() => {
    if (!patientId && patientsForHospital.length > 0) {
      setPatientId(patientsForHospital[0].id);
    }
  }, [patientId, patientsForHospital]);

  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<typeof priorities[number]>('Emergency');
  const [department, setDepartment] = useState('');
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const [receivingHospitalId, setReceivingHospitalId] = useState(hospitals[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestingHospitalId = user?.hospital_id ?? hospitals[0]?.id;
  const requestingHospitalName = useMemo(() => {
    return hospitals.find((h) => h.id === requestingHospitalId)?.name ?? '';
  }, [hospitals, requestingHospitalId]);

  const receivingHospitals = useMemo(() => {
    return hospitals.filter((h) => h.id !== requestingHospitalId);
  }, [hospitals, requestingHospitalId]);

  // Initialize receiving hospital selection when hospitals data is ready
  React.useEffect(() => {
    if (receivingHospitals.length > 0) {
      setReceivingHospitalId((prev) => {
        if (prev && receivingHospitals.some((h) => h.id === prev)) {
          return prev;
        }
        return receivingHospitals[0].id;
      });
    } else {
      setReceivingHospitalId('');
    }
  }, [receivingHospitals]);

  // Get available departments by intersection of requesting + receiving hospital
  const availableDepartments = useMemo(() => {
    if (!receivingHospitalId || !requestingHospitalId) return [];

    const receiving = getDepartmentsForHospital(receivingHospitalId, hospitals.find(h => h.id === receivingHospitalId)?.name);
    const requesting = getDepartmentsForHospital(requestingHospitalId, requestingHospitalName);

    const sharedDepartments = receiving.filter((r) =>
      requesting.some((req) => req.name === r.name)
    );

    return sharedDepartments.map((d) => d.name).sort();
  }, [receivingHospitalId, requestingHospitalId, requestingHospitalName, hospitals]);

  // Reset department when receiving hospital changes
  React.useEffect(() => {
    if (availableDepartments.length > 0) {
      setDepartment(availableDepartments[0]);
      setDepartmentError(null);
    } else {
      setDepartment('');
      setDepartmentError('Selected hospital has no departments');
    }
  }, [availableDepartments]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setDepartmentError(null);

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (!receivingHospitalId) {
      setError('Please select a receiving hospital.');
      return;
    }

    if (!reason.trim()) {
      setError('Reason for referral is required.');
      return;
    }

    if (!department) {
      setDepartmentError('Please select a department.');
      return;
    }

    // Validate selected department is shared by both hospitals
    if (
      !hospitalHasDepartment(receivingHospitalId, department, hospitals.find(h => h.id === receivingHospitalId)?.name) ||
      !hospitalHasDepartment(requestingHospitalId, department, requestingHospitalName)
    ) {
      setDepartmentError(`${department} is not available for shared referral between selected hospitals.`);
      return;
    }

    setShowConfirm(true);
  }

  async function submitReferral() {
    setShowConfirm(false);
    setError(null);

    const patient = patients.find((p) => p.id === patientId);

    try {
      await addReferral({
        patient_id: patientId,
        patient_name: patient?.name ?? 'Unknown',
        reason: reason.trim(),
        status: 'pending',
        priority,
        department,
        requesting_hospital_id: requestingHospitalId ?? '',
        receiving_hospital_id: receivingHospitalId,
      });

      navigate('/referrals');
    } catch (err: any) {
      console.error('Add referral failed', err);
      setError(err?.message || 'Failed to submit referral.');
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </header>

      <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Submit Referral</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="patient">
                Patient *
              </label>
              <select
                id="patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select patient
                </option>
                {patientsForHospital.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="receivingHospital">
                Receiving Hospital *
              </label>
              <select
                id="receivingHospital"
                value={receivingHospitalId}
                onChange={(e) => setReceivingHospitalId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select hospital
                </option>
                {receivingHospitals.length === 0 ? (
                  <option value="" disabled>
                    No receiving hospital available
                  </option>
                ) : (
                  receivingHospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="priority">
                Priority Level *
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="department">
                Department *
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setDepartmentError(null);
                }}
                disabled={availableDepartments.length === 0}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {availableDepartments.length === 0 ? 'No departments available' : 'Select department'}
                </option>
                {availableDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {departmentError && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{departmentError}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="reason">
                Reason for Referral *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Describe reason for referral..."
                className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="notes">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any additional notes..."
                className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Attachment (optional)</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="file" className="hidden" id="attachment" />
                <label
                  htmlFor="attachment"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Choose File
                </label>
                <span className="text-sm text-slate-500">No file chosen</span>
              </div>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Submit Referral
          </button>
        </form>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirm Referral Submission</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to submit this referral request?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReferral}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
