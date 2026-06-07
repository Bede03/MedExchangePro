import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Transfer } from '../types';

const TABS = ['Transfer Details', 'Recent Patient Info'] as const;

type TransferTab = (typeof TABS)[number];

export function TransferDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TransferTab>('Transfer Details');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) {
      setError('Transfer ID not found');
      setLoading(false);
      return;
    }

    const loadTransfer = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.transfers.get(id);
        if (response.success) {
          setTransfer(response.data);
        } else {
          setError(response.message || 'Failed to load transfer details');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load transfer details');
      } finally {
        setLoading(false);
      }
    };

    loadTransfer();
  }, [id]);

  useEffect(() => {
    const loadPatientInfo = async () => {
      if (!transfer?.patientNationalId) return;
      setPatientLoading(true);
      setPatientError(null);

      if (transfer.externalPatientData) {
        setPatientInfo(transfer.externalPatientData);
        setPatientLoading(false);
        return;
      }

      try {
        const response = await apiClient.patients.getCombined(transfer.patientNationalId);
        if (response.success) {
          setPatientInfo(response.data);
        } else {
          setPatientError(response.message || 'Failed to load external patient info');
        }
      } catch (err: any) {
        setPatientError(err?.message || 'Failed to load external patient info');
      } finally {
        setPatientLoading(false);
      }
    };

    loadPatientInfo();
  }, [transfer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-500">Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/transfers')}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transfers
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Transfer</h3>
              <p className="mt-1 text-sm text-red-800">{error || 'Transfer not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-slate-100 text-slate-800',
  };

  const statusLabel = {
    pending: 'Pending',
    in_transit: 'In Transit',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const canApproveTransfer = Boolean(
    user && transfer?.fromHospitalId === user.hospital_id && transfer.status === 'pending'
  );

  const canSendTransfer = Boolean(
    user && transfer?.fromHospitalId === user.hospital_id && transfer.status === 'approved'
  );

  const canReceiveTransfer = Boolean(
    user && transfer?.toHospitalId === user.hospital_id && transfer.status === 'in_transit'
  );

  const receivingHospitalName = transfer?.toHospital?.name || transfer?.toHospitalId || 'Receiving Hospital';

  const handleApproveTransfer = async () => {
    if (!transfer?.id) return;

    setActionError(null);
    setActionMessage(null);
    setActionLoading(true);

    try {
      const response = await apiClient.transfers.updateStatus(transfer.id, 'approved');
      if (response.success) {
        setTransfer(response.data);
        setActionMessage('Transfer approved successfully. You may now mark it as sent.');
      } else {
        setActionError(response.message || 'Failed to approve transfer.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to approve transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTransfer = async () => {
    if (!transfer?.id) return;

    setActionError(null);
    setActionMessage(null);
    setActionLoading(true);

    try {
      const response = await apiClient.transfers.updateStatus(transfer.id, 'in_transit');
      if (response.success) {
        setTransfer(response.data);
        setActionMessage('Transfer marked as sent to the receiving hospital.');
      } else {
        setActionError(response.message || 'Failed to update transfer status.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update transfer status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveTransfer = async () => {
    if (!transfer?.id) return;

    setActionError(null);
    setActionMessage(null);
    setActionLoading(true);

    try {
      const response = await apiClient.transfers.updateStatus(transfer.id, 'completed');
      if (response.success) {
        setTransfer(response.data);
        setActionMessage('Transfer completed. Patient has been received.');
      } else {
        setActionError(response.message || 'Failed to complete transfer.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to complete transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const InfoRow = ({ label, value, stackLayout }: { label: string; value?: string | number | null; stackLayout?: boolean }) => {
    if (!value && value !== 0) return null;
    const isLongText = typeof value === 'string' && value.length > 80;
    const shouldStack = stackLayout || isLongText;
    
    if (shouldStack) {
      return (
        <div className="py-3 border-b border-slate-100 last:border-0">
          <dt className="text-sm font-medium text-slate-600 mb-1">{label}</dt>
          <dd className="text-sm text-slate-900 whitespace-pre-wrap">{value}</dd>
        </div>
      );
    }

    return (
      <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
        <dt className="text-sm font-medium text-slate-600">{label}</dt>
        <dd className="text-sm text-slate-900 text-right whitespace-pre-wrap">{value}</dd>
      </div>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
      <dl className="space-y-0">{children}</dl>
    </div>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatGender = (gender?: string) => {
    if (!gender) return null;
    const lower = gender.toLowerCase();
    if (lower === 'male' || lower === 'm') return 'M';
    if (lower === 'female' || lower === 'f') return 'F';
    return gender;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/transfers')}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transfers
        </button>
      </header>

      {/* Summary + Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {transfer.transferNumber != null ? `TRF-${transfer.transferNumber}` : transfer.transferId}
            </h1>
            <p className="mt-2 text-slate-600">Transfer Reference</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyles[transfer.status] || 'bg-slate-100 text-slate-800'}`}>
            {statusLabel[transfer.status as keyof typeof statusLabel] || transfer.status}
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {canApproveTransfer && (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleApproveTransfer}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {actionLoading ? 'Approving transfer...' : 'Approve Transfer'}
            </button>
            {actionError && <p className="mt-2 text-sm text-rose-600">{actionError}</p>}
            {actionMessage && <p className="mt-2 text-sm text-emerald-600">{actionMessage}</p>}
          </div>
        )}

        {canSendTransfer && (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleSendTransfer}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {actionLoading ? `Sending to ${receivingHospitalName}...` : `Send to ${receivingHospitalName}`}
            </button>
            {actionError && <p className="mt-2 text-sm text-rose-600">{actionError}</p>}
            {actionMessage && <p className="mt-2 text-sm text-emerald-600">{actionMessage}</p>}
          </div>
        )}

        {canReceiveTransfer && (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleReceiveTransfer}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {actionLoading ? 'Receiving transfer...' : 'Transfer received'}
            </button>
            {actionError && <p className="mt-2 text-sm text-rose-600">{actionError}</p>}
            {actionMessage && <p className="mt-2 text-sm text-emerald-600">{actionMessage}</p>}
          </div>
        )}
      </div>

      {activeTab === 'Transfer Details' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transfer Summary Info */}
            <Section title="Transfer Information">
              <InfoRow label="Transfer Type" value={transfer.transferType} />
              <InfoRow label="Status" value={statusLabel[transfer.status as keyof typeof statusLabel]} />
              <InfoRow label="Reason for Transfer" value={transfer.reasonForTransfer} />
              <InfoRow label="Created Date" value={formatDate(transfer.createdAt)} />
              <InfoRow label="Decision Date" value={formatDate(transfer.decisionDate)} />
              {transfer.decisionTime && <InfoRow label="Decision Time" value={transfer.decisionTime} />}
            </Section>

            <Section title="Patient Information">
              <InfoRow label="Patient Name" value={transfer.patientProfile?.name || transfer.patientName} />
              <InfoRow label="National ID" value={transfer.patientProfile?.nationalId || transfer.patientNationalId} />
              {transfer.patientProfile?.dob && <InfoRow label="Date of Birth" value={formatDate(transfer.patientProfile.dob)} />}
              {transfer.patientProfile?.gender && <InfoRow label="Gender" value={formatGender(transfer.patientProfile.gender)} />}
              {transfer.patientProfile?.phone && <InfoRow label="Phone" value={transfer.patientProfile.phone} />}
              {transfer.patientProfile?.address && <InfoRow label="Address" value={transfer.patientProfile.address} />}
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hospital Information */}
            <Section title="Hospital Information">
              <InfoRow label="From Hospital" value={transfer.fromHospital?.name || 'N/A'} />
              <InfoRow label="To Hospital" value={transfer.toHospital?.name || 'N/A'} />
            </Section>

            {/* Contact Information */}
            <Section title="Contact Information">
              <InfoRow label="Referring Clinician" value={transfer.referringClinician} />
              {transfer.referringPhone && <InfoRow label="Referring Phone" value={transfer.referringPhone} />}
              {transfer.receivingService && <InfoRow label="Receiving Service" value={transfer.receivingService} />}
              {transfer.receivingPhone && <InfoRow label="Receiving Phone" value={transfer.receivingPhone} />}
            </Section>
          </div>

          {/* Clinical Details */}
          {(transfer.significantFindings || transfer.clinicalPresentation || transfer.immediateCondition || transfer.diagnosis) && (
            <Section title="Clinical Details">
              {transfer.significantFindings && <InfoRow label="Significant Findings" value={transfer.significantFindings} />}
              {transfer.clinicalPresentation && <InfoRow label="Clinical Presentation" value={transfer.clinicalPresentation} />}
              {transfer.immediateCondition && <InfoRow label="Immediate Condition" value={transfer.immediateCondition} />}
              {transfer.diagnosis && <InfoRow label="Diagnosis" value={transfer.diagnosis} stackLayout />}
            </Section>
          )}

          {/* Vital Signs */}
          {(transfer.temperature || transfer.spo2 || transfer.rr || transfer.pulse || transfer.bp || transfer.weight || transfer.muac) && (
            <Section title="Vital Signs">
              {transfer.temperature && <InfoRow label="Temperature (°C)" value={transfer.temperature} />}
              {transfer.spo2 && <InfoRow label="SpO₂ (%)" value={transfer.spo2} />}
              {transfer.rr && <InfoRow label="Respiratory Rate" value={transfer.rr} />}
              {transfer.pulse && <InfoRow label="Pulse (bpm)" value={transfer.pulse} />}
              {transfer.bp && <InfoRow label="Blood Pressure" value={transfer.bp} />}
              {transfer.weight && <InfoRow label="Weight (kg)" value={transfer.weight} />}
              {transfer.muac && <InfoRow label="MUAC (cm)" value={transfer.muac} />}
            </Section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Information */}
            {(transfer.laboratory || transfer.procedures || transfer.medications) && (
              <Section title="Medical Information">
                {transfer.laboratory && <InfoRow label="Laboratory Results" value={transfer.laboratory} />}
                {transfer.procedures && <InfoRow label="Procedures/Treatments" value={transfer.procedures} />}
                {transfer.medications && <InfoRow label="Medications" value={transfer.medications} />}
              </Section>
            )}

            {/* Transport Information */}
            {(transfer.transportType || transfer.transportNotes) && (
              <Section title="Transport Information">
                {transfer.transportType && <InfoRow label="Transport Type" value={transfer.transportType} />}
                {transfer.transportNotes && <InfoRow label="Transport Notes" value={transfer.transportNotes} />}
              </Section>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admission Information */}
            {(transfer.admissionDate || transfer.admissionTime) && (
              <Section title="Admission Information">
                {transfer.admissionDate && <InfoRow label="Admission Date" value={formatDate(transfer.admissionDate)} />}
                {transfer.admissionTime && <InfoRow label="Admission Time" value={transfer.admissionTime} />}
              </Section>
            )}

            {/* Insurance Information */}
            {(transfer.insuranceType || transfer.insuranceOther) && (
              <Section title="Insurance Information">
                {transfer.insuranceType && <InfoRow label="Insurance Type" value={transfer.insuranceType} />}
                {transfer.insuranceOther && <InfoRow label="Other Insurance" value={transfer.insuranceOther} />}
              </Section>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {patientLoading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-600" />
              <p>Loading external patient information...</p>
            </div>
          ) : patientError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
              <p className="font-medium">Unable to load external patient info</p>
              <p className="mt-2 text-sm">{patientError}</p>
            </div>
          ) : (
            <>
                    <Section title="Medical History">
                {patientInfo?.patient?.diagnoses?.length > 0 ? (
                  <div className="space-y-3">
                    {patientInfo.patient.diagnoses.map((diag: any) => (
                      <div key={diag.id || diag.DIAG_ID || diag.icd10Code} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-900">{diag.description || diag.DESCRIPTION || 'Diagnosis'}</p>
                          {diag.confirmedAt || diag.CONFIRMED_AT ? (
                            <span className="text-xs uppercase tracking-wide text-slate-500">
                              {formatDate(diag.confirmedAt || diag.CONFIRMED_AT)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{diag.icd10Code || diag.ICD10_CODE || ''}</p>
                      </div>
                    ))}
                  </div>
                ) : patientInfo?.patient?.encounters?.length > 0 ? (
                  <div className="space-y-3">
                    {patientInfo.patient.encounters.map((enc: any) => (
                      <div key={enc.id || enc.ENCOUNTER_ID || enc.type} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-900">{enc.type || enc.TYPE || 'Encounter'}</p>
                          {enc.time || enc.encounterTime || enc.ENCOUNTER_TIME ? (
                            <span className="text-xs uppercase tracking-wide text-slate-500">
                              {formatDateTime(enc.time || enc.encounterTime || enc.ENCOUNTER_TIME)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{enc.notes || enc.NOTES || 'No details provided'}</p>
                      </div>
                    ))}
                  </div>
                ) : patientInfo?.externalHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {patientInfo.externalHistory.map((record: any, index: number) => (
                      <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-900">{record.name || `Record ${index + 1}`}</p>
                          {record.confirmed_at || record.confirmedAt ? (
                            <span className="text-xs uppercase tracking-wide text-slate-500">
                              {formatDate(record.confirmed_at || record.confirmedAt)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{record.diagnosis || JSON.stringify(record)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No external medical history found.</p>
                )}
              </Section>

              <Section title="Lab Results">
                {patientInfo?.patient?.labResults?.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
                    <table className="min-w-[700px] w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Test</th>
                          <th className="px-4 py-3">Result</th>
                          <th className="px-4 py-3">Reference</th>
                          <th className="px-4 py-3">Flag</th>
                          <th className="px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {patientInfo.patient.labResults.map((lab: any) => (
                          <tr key={lab.id || lab.RESULT_ID || `${lab.parameter}-${lab.value}`}>
                            <td className="px-4 py-3 text-slate-900">{lab.parameter || lab.PARAMETER}</td>
                            <td className="px-4 py-3 text-slate-900">{lab.value || lab.VALUE} {lab.unit || lab.UNIT || ''}</td>
                            <td className="px-4 py-3 text-slate-900">{lab.refRange || lab.REF_RANGE || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-900">{lab.flag || lab.FLAG || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-900">{formatDate(lab.resultedAt || lab.RESULTED_AT)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No external lab results found.</p>
                )}
              </Section>

              <Section title="Documents">
                {patientInfo?.patient?.patient_documents ? (
                  <div className="space-y-3">
                    {patientInfo.patient.patient_documents.split('\n').map((doc: string, index: number) => (
                      <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-900">{doc}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No external documents found.</p>
                )}
              </Section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
