import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, X, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { StatusBadge } from '../components/UI/StatusBadge';
import { ReferralStatus, Referral } from '../types';
import { apiClient } from '../services/api';
import { generateReferralReference, formatReferralId, copyToClipboard } from '../utils/referral';

const statusFlow: Record<ReferralStatus, { label: string; next: ReferralStatus | null }> = {
  pending: { label: 'Pending', next: 'approved' },
  approved: { label: 'Approved', next: 'completed' },
  completed: { label: 'Completed', next: null },
  rejected: { label: 'Rejected', next: null },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB');
}

export function ReferralDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateReferralStatus, hospitals, patients } = useMockData();
  const [referralData, setReferralData] = useState<Partial<Referral> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharedRecords, setSharedRecords] = useState<any>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [shareFormData, setShareFormData] = useState({
    testResults: '',
    medications: '',
    allergies: '',
    medicalHistory: '',
    vitalsLastRecorded: '',
    currentDiagnosis: '',
    clinicalNotes: '',
  });
  const [sharingRecords, setSharingRecords] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Helper function to update referral status with proper error handling
  async function updateReferralStatusWithAuth(referralId: string, newStatus: ReferralStatus) {
    if (!canApproveOrReject) {
      alert('You do not have permission to update this referral');
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await apiClient.referrals.updateStatus(referralId, newStatus);
      
      if (response.success && response.data) {
        // Update local state
        setReferralData(prev => prev ? { ...prev, status: newStatus } : null);
        if (newStatus === 'approved') {
          setIsAccepted(true);
        }
      } else {
        alert(response.message || 'Failed to update referral status');
      }
    } catch (err: any) {
      console.error('Failed to update referral status:', err);
      if (err.message?.includes('401') || err.message?.includes('403')) {
        alert('You do not have permission to perform this action');
      } else {
        alert(err.message || 'Failed to update referral status');
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Fetch referral from API
  useEffect(() => {
    const fetchReferral = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await apiClient.referrals.get(id);
        if (response.success && response.data) {
          // Map backend fields to frontend format
          const mapped: Partial<Referral> = {
            id: response.data.id,
            referral_number: response.data.referralNumber,
            patient_id: response.data.patientId,
            patient_name: response.data.patient?.name || '',
            reason: response.data.reason,
            status: response.data.status as ReferralStatus,
            priority: response.data.priority as any,
            requesting_hospital_id: response.data.requestingHospitalId,
            receiving_hospital_id: response.data.receivingHospitalId,
            created_at: response.data.createdAt,
            department: response.data.department,
          };
          setReferralData(mapped);

          // Fetch shared records if receiving hospital
          if (user && user.hospital_id === response.data.receivingHospitalId) {
            try {
              setLoadingRecords(true);
              const recordsResponse = await apiClient.patientRecords.getByReferral(id);
              // The API returns either the record directly or an error
              if (recordsResponse && recordsResponse.success) {
                setSharedRecords(recordsResponse.data);
              } else if (recordsResponse && recordsResponse.data) {
                // Handle case where data is returned directly
                setSharedRecords(recordsResponse.data);
              }
            } catch (err: any) {
              // Silently ignore 404 - records haven't been shared yet
              // This is expected when referral is still pending
              if (!err.message?.includes('Failed to fetch referral records')) {
                console.error('Unexpected error fetching shared records:', err);
              }
            } finally {
              setLoadingRecords(false);
            }
          }
        } else {
          setError('Referral not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load referral');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferral();
  }, [id, user]);

  // Define referral (may be null)
  const referral = referralData as Referral | null;

  // Call all hooks unconditionally BEFORE any conditional returns
  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const patient = useMemo(() => patients.find((p) => p.id === referral?.patient_id) ?? null, [patients, referral?.patient_id]);

  const flow = referral && referral.status ? statusFlow[referral.status] : { label: '', next: null };

  const timeline = useMemo(() => {
    if (!referral) return [];
    const created = new Date(referral.created_at);
    const events = [
      { title: 'Created', subtitle: '', date: created },
    ];

    if (referral.status === 'approved' || referral.status === 'completed') {
      events.push({
        title: 'Status changed',
        subtitle: 'pending → approved',
        date: new Date(created.getTime() + 1000 * 60 * 5),
      });
    }

    if (referral.status === 'completed') {
      events.push({
        title: 'Status changed',
        subtitle: 'approved → completed',
        date: new Date(created.getTime() + 1000 * 60 * 10),
      });
    }

    if (referral.status === 'rejected') {
      events.push({
        title: 'Status changed',
        subtitle: 'pending → rejected',
        date: new Date(created.getTime() + 1000 * 60 * 5),
      });
    }

    return events;
  }, [referral]);

  // Parse referral reasons from stored string format
  const parsedReasons = useMemo(() => {
    if (!referral?.reason) return { reasons: [], details: null };

    const parts = referral.reason.split(' - ');
    const reasonString = parts[0];
    const details = parts[1] || null;

    // Split reasons by '; ' and filter out empty strings
    const reasons = reasonString.split('; ').filter(r => r.trim());

    return { reasons, details };
  }, [referral?.reason]);

  // Now check loading state and render conditionally
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-sm text-slate-500">Loading referral details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">Referral not found</h1>
        <p className="text-sm text-slate-500">{error || 'We couldn\'t find the referral you were looking for.'}</p>
        <button
          onClick={() => navigate('/referrals')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Back to referrals
        </button>
      </div>
    );
  }

  // Check if user can approve/reject (only receiving hospital can)
  const canApproveOrReject = user && referral && user.hospital_id === referral.receiving_hospital_id;
  
  // Check if user is from requesting hospital
  const isRequestingHospital = user && referral && user.hospital_id === referral.requesting_hospital_id;

  // Both hospitals involved in the referral can share records
  const canShareRecords = user && referral &&
    (user.hospital_id === referral.requesting_hospital_id || user.hospital_id === referral.receiving_hospital_id);

  async function handleShareRecords() {
    if (!referral) return;
    
    try {
      setShareError(null);
      setSharingRecords(true);
      const response = await apiClient.patientRecords.share({
        referralId: referral.id,
        patientId: referral.patient_id,
        requestingHospitalId: referral.requesting_hospital_id,
        respondingHospitalId: referral.receiving_hospital_id,
        testResults: shareFormData.testResults || null,
        medications: shareFormData.medications || null,
        allergies: shareFormData.allergies || null,
        medicalHistory: shareFormData.medicalHistory || null,
        vitalsLastRecorded: shareFormData.vitalsLastRecorded || null,
        currentDiagnosis: shareFormData.currentDiagnosis || null,
        clinicalNotes: shareFormData.clinicalNotes || null,
      });

      if (response.success) {
        // Update referral status to approved
        await updateReferralStatusWithAuth(referral.id, 'approved');
        
        // Update shared records in display
        setSharedRecords(response.data);
        
        // Clear any previous share error and reset form
        setShareError(null);
        setShareFormData({
          testResults: '',
          medications: '',
          allergies: '',
          medicalHistory: '',
          vitalsLastRecorded: '',
          currentDiagnosis: '',
          clinicalNotes: '',
        });
        setShowConfirmModal(false);
      }
    } catch (err: any) {
      console.error('Failed to share records:', err);
      setShareError(err.message || 'Failed to share patient records');
    } finally {
      setSharingRecords(false);
    }
  }

  async function handleCopyId() {
    if (!referral) return;
    const success = await copyToClipboard(formatReferralId(referral.id));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-slate-900">{referral.patient_name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium">{referral.reason}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="cursor-help rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-700"
              >
                {generateReferralReference(referral.referral_number || referral.id)}
              </span>
              <button
                onClick={handleCopyId}
                title="Copy full ID to clipboard"
                className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">Created {formatDate(referral.created_at)}</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                referral.priority === 'Emergency'
                  ? 'bg-rose-100 text-rose-800'
                  : referral.priority === 'Urgent'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {referral.priority}
            </span>
            <StatusBadge status={referral.status} />
            {sharedRecords && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                ✓ Records Shared
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Awaiting Response Message */}
      {user && user.hospital_id === referral.requesting_hospital_id && referral.status === 'pending' ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
            <p className="text-sm font-medium text-blue-800">
              Awaiting response from <span className="font-semibold">{hospitalMap.get(referral.receiving_hospital_id) ?? 'the responding hospital'}</span>
            </p>
          </div>
        </div>
      ) : null}

      {/* Referral Accepted - Requesting Hospital Waiting for Data */}
      {user && user.hospital_id === referral.requesting_hospital_id && referral.status === 'approved' && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">
                Referral accepted by <span className="font-bold">{hospitalMap.get(referral.receiving_hospital_id) ?? 'Unknown'}</span>.
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Waiting for {hospitalMap.get(referral.receiving_hospital_id) ?? 'Unknown'} to share patient information.
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
          </div>
        </div>
      )}

      {/* Patient Data Shared Message */}
      {(user && user.hospital_id === referral.receiving_hospital_id && referral.status === 'completed') ? (
        <div className="rounded-lg border border-slate-200 bg-sky-50 px-5 py-4">
          <p className="text-sm font-medium text-sky-800">Patient data has been shared with the requesting hospital.</p>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requesting Hospital</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {hospitalMap.get(referral.requesting_hospital_id) ?? 'Unknown'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Responding Hospital</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {hospitalMap.get(referral.receiving_hospital_id) ?? 'Unknown'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
              {referral.priority}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Reason for Referral</p>
          <div className="mt-2 space-y-3">
            {parsedReasons.reasons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {parsedReasons.reasons.map((reason, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
            {parsedReasons.details && (
              <div className="rounded-md bg-white p-3 border border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Additional Details</p>
                <p className="mt-1 text-sm text-slate-900">{parsedReasons.details}</p>
              </div>
            )}
          </div>
        </div>

        {/* Authorization Message & Action Buttons */}
        {referral.status === 'pending' && canApproveOrReject && !isAccepted && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-900">
                  This referral is awaiting your review.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={updatingStatus}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="mr-2 inline-block h-4 w-4" />
                  Reject Referral
                </button>
                <button
                  onClick={() => updateReferralStatusWithAuth(referral.id, 'approved')}
                  disabled={updatingStatus}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="mr-2 inline-block h-4 w-4" />
                  Accept Referral
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Referral Accepted Success Card */}
        {referral.status === 'approved' && canShareRecords && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-medium text-green-900">
                  Referral accepted. You may now share patient data with the requesting hospital.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Scroll to patient information section
                    const patientSection = document.querySelector('[data-patient-section]');
                    if (patientSection) {
                      patientSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-50"
                >
                  👤 View Patient
                </button>
                <button
                  onClick={() => {
                    setShareError(null);
                    setShowConfirmModal(true);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  📤 Send Patient Information
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4" data-patient-section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Shared Patient Information</p>
              <p className="mt-1 text-xs text-slate-500">
                Date shared: {formatDate(referral.created_at)} · From:{' '}
                {hospitalMap.get(referral.requesting_hospital_id) ?? 'Unknown'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{patient?.name ?? referral.patient_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date of Birth</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{patient ? formatDate(patient.dob) : '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{patient?.gender ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{patient?.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">National ID</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{patient?.national_id ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{patient?.address ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Shared Medical Records Section */}
        {sharedRecords && canApproveOrReject && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-emerald-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Shared Medical Records</p>
                <p className="mt-1 text-xs text-slate-500">
                  Medical data shared by {hospitalMap.get(referral.requesting_hospital_id) ?? 'Unknown'}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                Records Shared
              </span>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {sharedRecords.testResults && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Test Results</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.testResults}</p>
                </div>
              )}
              {sharedRecords.medications && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medications</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.medications}</p>
                </div>
              )}
              {sharedRecords.allergies && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Allergies</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.allergies}</p>
                </div>
              )}
              {sharedRecords.medicalHistory && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medical History</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.medicalHistory}</p>
                </div>
              )}
              {sharedRecords.vitals && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vitals</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.vitals}</p>
                </div>
              )}
              {sharedRecords.diagnoses && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnoses</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.diagnoses}</p>
                </div>
              )}
              {sharedRecords.clinicalNotes && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clinical Notes</p>
                  <p className="mt-1 text-sm text-slate-900">{sharedRecords.clinicalNotes}</p>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Shared on: {sharedRecords.createdAt ? formatDate(sharedRecords.createdAt) : 'Date unknown'}
            </p>
          </div>
        )}

        {/* Shared Medical Records Restricted Message */}
        {sharedRecords && !canApproveOrReject && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3">
              <div className="text-amber-600">⚠</div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Shared Medical Records</p>
                <p className="mt-1 text-sm text-amber-800">
                  Medical records have been shared for this referral, but only the receiving hospital can view them.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-semibold text-slate-900">Referral Timeline</p>
          <div className="mt-4 space-y-4">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  {event.subtitle ? (
                    <p className="text-xs text-slate-500">{event.subtitle}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">{event.date.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Patient Data Sharing Modal */}
      {showConfirmModal && canApproveOrReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Confirm Patient Data Sharing</h2>
                <p className="mt-1 text-sm text-slate-600">
                  You are about to share this patient's medical information with {hospitalMap.get(referral?.requesting_hospital_id) ?? 'Unknown'}. Please confirm that this is correct.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Patient</span>
                <span className="text-sm font-semibold text-slate-900">{referral?.patient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Patient ID</span>
                <span className="text-sm font-semibold text-slate-900 font-mono">{referral?.patient_id?.substring(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Referral</span>
                <span className="text-sm font-semibold text-slate-900">{generateReferralReference(referral?.referral_number ?? referral?.id ?? '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Requesting Hospital</span>
                <span className="text-sm font-semibold text-slate-900">{hospitalMap.get(referral?.requesting_hospital_id) ?? 'Unknown'}</span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900 mb-3">Data to be shared:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-blue-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-900">Personal information (name, DOB, gender, contact)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-blue-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-900">2 medical record(s)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-blue-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-900">1 lab result(s)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-blue-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-900">Associated attachments</span>
                </li>
              </ul>
            </div>

            {shareError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">Could not share patient records</p>
                <p className="mt-1">{shareError}</p>
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShareError(null);
                  setShowConfirmModal(false);
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShareRecords}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reject Referral Modal */}
      {showRejectModal && canApproveOrReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Reject Referral</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Are you sure you want to reject this referral? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (referral) {
                    updateReferralStatusWithAuth(referral.id, 'rejected');
                  }
                  setShowRejectModal(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Reject Referral
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
