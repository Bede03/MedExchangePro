import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';

const priorities = ['Emergency', 'Urgent', 'Routine'] as const;
const departments = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Obstetrics',
  'Surgery',
  'Emergency',
  'ICU',
  'Oncology',
  'Psychiatry',
  'Radiology',
  'Pathology',
  'General Practice',
] as const;

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
  const [department, setDepartment] = useState<typeof departments[number]>('General Practice');

  const [receivingHospitalId, setReceivingHospitalId] = useState(hospitals[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requestingHospitalId = user?.hospital_id ?? hospitals[0]?.id;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

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
      setError('Please select a department.');
      return;
    }

    const patient = patients.find((p) => p.id === patientId);

    addReferral({
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
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
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
                onChange={(e) => setDepartment(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
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
    </div>
  );
}
