import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { apiClient } from '../services/api';
import { getDepartmentsForHospital, hospitalHasDepartment } from '../data/departments';

const priorities = ['Emergency', 'Urgent', 'Routine'] as const;
const referralReasons = [
  'Acute pain',
  'Chronic condition management',
  'Diagnostic imaging',
  'Specialist consultation',
  'Surgical evaluation',
  'Medication review',
  'Lab tests',
  'Rehabilitation needs',
  'Mental health assessment',
  'Other',
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
  const [patientSearch, setPatientSearch] = useState('');
  const [patientListOpen, setPatientListOpen] = useState(false);
  const patient = useMemo(
    () => patientsForHospital.find((p) => p.id === patientId) ?? null,
    [patientsForHospital, patientId]
  );

  const filteredPatients = useMemo(
    () =>
      patientsForHospital.filter((p) =>
        `${p.name}${p.national_id ? ` (${p.national_id})` : ''}`
          .toLowerCase()
          .includes(patientSearch.toLowerCase())
      ),
    [patientsForHospital, patientSearch]
  );

  useEffect(() => {
    // Do not auto-select a patient on load. Keep the input empty so clinician must choose.
    if (!patientId) {
      setPatientSearch('');
    }
  }, [patientId, patientsForHospital]);

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reasonDetails, setReasonDetails] = useState('');
  const [priority, setPriority] = useState<typeof priorities[number]>('Emergency');
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [departmentOpen, setDepartmentOpen] = useState(false);

  const [receivingHospitalId, setReceivingHospitalId] = useState(hospitals[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('No file chosen');
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
  useEffect(() => {
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

  // Reset departments when receiving hospital changes
  React.useEffect(() => {
    if (availableDepartments.length > 0) {
      setDepartments([availableDepartments[0]]);
      setDepartmentError(null);
    } else {
      setDepartments([]);
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

    if (selectedReasons.length === 0) {
      setError('Please select at least one reason for referral.');
      return;
    }

    if (selectedReasons.includes('Other') && !reasonDetails.trim()) {
      setError('Please provide details for the selected Other reason.');
      return;
    }

    if (departments.length === 0) {
      setDepartmentError('Please select at least one department.');
      return;
    }

    // Validate each selected department is shared by both hospitals
    for (const dept of departments) {
      if (
        !hospitalHasDepartment(receivingHospitalId, dept, hospitals.find((h) => h.id === receivingHospitalId)?.name) ||
        !hospitalHasDepartment(requestingHospitalId, dept, requestingHospitalName)
      ) {
        setDepartmentError(`${dept} is not available for shared referral between selected hospitals.`);
        return;
      }
    }

    setShowConfirm(true);
  }

  async function submitReferral() {
    setShowConfirm(false);
    setError(null);

    const patient = patients.find((p) => p.id === patientId);

    try {
      let attachmentUrl: string | undefined;
      if (attachmentFile) {
        const fd = new FormData();
        fd.append('file', attachmentFile);
        const uploadResp: any = await apiClient.uploads.create(fd);
        // Try several common response shapes
        attachmentUrl = uploadResp?.data?.url || uploadResp?.url || uploadResp?.path || uploadResp?.data?.path || uploadResp?.attachmentUrl || uploadResp?.attachment_url;
      }

      await addReferral({
        patient_id: patientId,
        patient_name: patient?.name ?? 'Unknown',
        reason: selectedReasons,
        reasonDetails: reasonDetails.trim(),
        status: 'pending',
        priority,
        department: departments,
        requesting_hospital_id: requestingHospitalId ?? '',
        receiving_hospital_id: receivingHospitalId,
        attachmentUrl,
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

      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Submit Referral</h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <label className="text-sm font-medium text-slate-700" htmlFor="patient">
                Patient *
              </label>
              <input
                id="patient"
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setPatientListOpen(true);
                  const matchingPatient = patientsForHospital.find(
                    (p) =>
                      e.target.value ===
                      `${p.name}${p.national_id ? ` (${p.national_id})` : ''}`
                  );
                  setPatientId(matchingPatient?.id ?? '');
                }}
                onFocus={() => setPatientListOpen(true)}
                onBlur={() => setTimeout(() => setPatientListOpen(false), 150)}
                placeholder="Type or select a patient"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {patientListOpen && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => {
                          setPatientSearch(`${p.name}${p.national_id ? ` (${p.national_id})` : ''}`);
                          setPatientId(p.id);
                          setPatientListOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100"
                      >
                        {p.name} {p.national_id ? `(${p.national_id})` : ''}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No patients found.</div>
                  )}
                </div>
              )}
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

            <div className="relative">
              <label className="text-sm font-medium text-slate-700">Department *</label>
              <button
                type="button"
                onClick={() => setDepartmentOpen((open) => !open)}
                className="mt-1 flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <span className="truncate">
                  {departments.length > 0 ? departments.join(', ') : 'Select one or more departments'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${departmentOpen ? 'rotate-180' : ''}`} />
              </button>
              {departmentOpen && (
                <div className="absolute left-0 top-full z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  {availableDepartments.length > 0 ? (
                    <div className="grid gap-2">
                      {availableDepartments.map((dept) => (
                        <label
                          key={dept}
                          className="inline-flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 hover:border-indigo-300"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={departments.includes(dept)}
                            onChange={() => {
                              setDepartments((prev) =>
                                prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
                              );
                              setDepartmentError(null);
                            }}
                          />
                          <span>{dept}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No departments available for this hospital.
                    </div>
                  )}
                </div>
              )}
              {departmentError ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <p>{departmentError}</p>
                </div>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">Click to open and select one or more receiving departments.</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-700">Reason(s) for Referral *</p>
              <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 max-h-52 overflow-auto">
                {referralReasons.map((reasonOption) => (
                  <label key={reasonOption} className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 hover:border-indigo-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedReasons.includes(reasonOption)}
                      onChange={() => {
                        setSelectedReasons((prev) =>
                          prev.includes(reasonOption)
                            ? prev.filter((reason) => reason !== reasonOption)
                            : [...prev, reasonOption]
                        );
                        setError(null);
                      }}
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReasons.includes('Other') && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="reasonDetails">
                  Other reason details *
                </label>
                <textarea
                  id="reasonDetails"
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  rows={3}
                  placeholder="Please specify the other reason..."
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

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
                <input
                  type="file"
                  className="hidden"
                  id="attachment"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setAttachmentFile(f);
                    setAttachmentName(f?.name ?? 'No file chosen');
                  }}
                />
                <label
                  htmlFor="attachment"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Choose File
                </label>
                <span className="text-sm text-slate-500">{attachmentName}</span>
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
