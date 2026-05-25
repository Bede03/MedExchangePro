import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../hooks/useMockData';
import { getDepartmentsForHospital } from '../data/departments';
import { apiClient } from '../services/api';

const transferTypes = ['Emergency', 'Non-Emergency', 'Follow-up'] as const;
const transportTypes = ['Ambulance', 'Other', 'None'] as const;
const insuranceOptions = ['CBHI', 'RSSB', 'MMI', 'Other'] as const;

export function NewTransferPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hospitals, patients } = useMockData();

  const requestingHospitalId = user?.hospital_id ?? hospitals[0]?.id ?? '';
  const requestingHospital = useMemo(
    () => hospitals.find((h) => h.id === requestingHospitalId) ?? null,
    [hospitals, requestingHospitalId]
  );

  const receivingHospitals = useMemo(
    () => hospitals.filter((h) => h.id !== requestingHospitalId),
    [hospitals, requestingHospitalId]
  );

  const patientsForHospital = useMemo(
    () => patients.filter((p) => p.hospital_id === requestingHospitalId),
    [patients, requestingHospitalId]
  );

  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patientListOpen, setPatientListOpen] = useState(false);
  const [receivingHospitalId, setReceivingHospitalId] = useState(receivingHospitals[0]?.id ?? '');
  const [referringClinician, setReferringClinician] = useState(user?.full_name ?? '');
  const [referringPhone, setReferringPhone] = useState('');
  const [receivingServices, setReceivingServices] = useState<string[]>([]);
  const [receivingServiceOpen, setReceivingServiceOpen] = useState(false);
  const [receivingPhone, setReceivingPhone] = useState('');
  const [transferType, setTransferType] = useState<typeof transferTypes[number]>('Emergency');
  const [reason, setReason] = useState('');
  const [significantFindings, setSignificantFindings] = useState('');
  const [clinicalPresentation, setClinicalPresentation] = useState('');
  const [immediateCondition, setImmediateCondition] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [admissionTime, setAdmissionTime] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [decisionTime, setDecisionTime] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [rr, setRr] = useState('');
  const [pulse, setPulse] = useState('');
  const [bp, setBp] = useState('');
  const [weight, setWeight] = useState('');
  const [muac, setMuac] = useState('');
  const [laboratory, setLaboratory] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [procedures, setProcedures] = useState('');
  const [medications, setMedications] = useState('');
  const [transportType, setTransportType] = useState<typeof transportTypes[number]>('Ambulance');
  const [transportNotes, setTransportNotes] = useState('');
  const [insuranceType, setInsuranceType] = useState<typeof insuranceOptions[number]>('CBHI');
  const [insuranceOther, setInsuranceOther] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const receivingHospital = useMemo(
    () => hospitals.find((h) => h.id === receivingHospitalId) ?? null,
    [hospitals, receivingHospitalId]
  );

  const availableReceivingServices = useMemo(
    () => getDepartmentsForHospital(receivingHospitalId, receivingHospital?.name),
    [receivingHospitalId, receivingHospital?.name]
  );

  useEffect(() => {
    if (receivingServices.length === 0 && availableReceivingServices.length > 0) {
      setReceivingServices([availableReceivingServices[0].name]);
    } else if (receivingServices.length > 0) {
      const validSelected = receivingServices.filter((service) =>
        availableReceivingServices.some((dept) => dept.name === service)
      );
      if (validSelected.length !== receivingServices.length) {
        setReceivingServices(validSelected);
      }
    }
  }, [availableReceivingServices, receivingServices]);

  const selectedPatient = useMemo(
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
    // Do not auto-select a patient on load. Keep the search field empty so the clinician chooses.
    if (!patientId) {
      setPatientSearch('');
    }
  }, [patientId, patientsForHospital]);

  useEffect(() => {
    if (!receivingHospitalId && receivingHospitals.length > 0) {
      setReceivingHospitalId(receivingHospitals[0].id);
    }
  }, [receivingHospitalId, receivingHospitals]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (!receivingHospitalId) {
      setError('Please select a receiving hospital.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for transfer.');
      return;
    }

    if (receivingServices.length === 0) {
      setError('Please select at least one receiving department.');
      return;
    }

    if (!admissionDate || !decisionDate) {
      setError('Please enter admission and decision dates.');
      return;
    }

    // Call the API to create the transfer
    submitTransfer();
  }

  async function submitTransfer() {
    try {
      setError(null);
      setSuccess(null);

      // Get the selected patient object
      const patient = patientsForHospital.find((p) => p.id === patientId);
      
      if (!patient) {
        setError('Patient not found');
        return;
      }

      const transferData = {
        patientNationalId: patient.national_id, // Use national ID from external database
        patientName: patient.name,
        fromHospitalId: requestingHospitalId,
        toHospitalId: receivingHospitalId,
        transferType,
        reasonForTransfer: reason,
        significantFindings,
        clinicalPresentation,
        immediateCondition,
        temperature,
        spo2,
        rr,
        pulse,
        bp,
        weight,
        muac,
        laboratory,
        diagnosis,
        procedures,
        medications,
        transportType,
        transportNotes,
        insuranceType,
        insuranceOther,
        referringClinician,
        referringPhone,
        receivingService: receivingServices.join(', '),
        receivingPhone,
        admissionDate,
        admissionTime,
        decisionDate,
        decisionTime,
      };

      const response = await apiClient.transfers.create(transferData);

      if (response.success) {
        const reference = response.data.transferNumber != null ? `TRF-${response.data.transferNumber}` : response.data.transferId;
        setSuccess(`Transfer created successfully! Transfer Number: ${reference}`);
        // Reset form after successful submission
        setTimeout(() => {
          navigate('/transfers');
        }, 1500);
      } else {
        setError(response.message || 'Failed to create transfer');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the transfer');
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/transfers')}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transfers
          </button>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900 md:mt-0">Create Transfer</h1>
          <p className="text-sm text-slate-500">Use this form to send patient information, clinical findings, vitals, transport details, and handover notes to the receiving hospital.</p>
        </div>

      </header>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <label htmlFor="patient" className="text-sm font-medium text-slate-700">Patient</label>
              <input
                id="patient"
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setPatientSearch(value);
                  setPatientListOpen(true);
                  const matchingPatient = patientsForHospital.find(
                    (patient) =>
                      value === `${patient.name}${patient.national_id ? ` (${patient.national_id})` : ''}`
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
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onMouseDown={() => {
                          setPatientSearch(`${patient.name}${patient.national_id ? ` (${patient.national_id})` : ''}`);
                          setPatientId(patient.id);
                          setPatientListOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100"
                      >
                        {patient.name} {patient.national_id ? `(${patient.national_id})` : ''}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No patients found.</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="receivingHospital" className="text-sm font-medium text-slate-700">Receiving Hospital</label>
              <select
                id="receivingHospital"
                value={receivingHospitalId}
                onChange={(e) => setReceivingHospitalId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {receivingHospitals.length === 0 ? (
                  <option value="">No available hospitals</option>
                ) : (
                  receivingHospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Referring Hospital</label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900">
                {requestingHospital?.name ?? 'Not available'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Referring Clinician</label>
              <input
                value={referringClinician}
                onChange={(e) => setReferringClinician(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Referring Phone</label>
              <input
                value={referringPhone}
                onChange={(e) => setReferringPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. +250 788 123 456"
              />
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-slate-700">Receiving Service/ Unit</label>
              <button
                type="button"
                onClick={() => setReceivingServiceOpen((open) => !open)}
                className="mt-1 flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <span className="truncate">
                  {receivingServices.length > 0 ? receivingServices.join(', ') : 'Select one or more departments'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${receivingServiceOpen ? 'rotate-180' : ''}`} />
              </button>
              {receivingServiceOpen && (
                <div className="absolute left-0 top-full z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  {availableReceivingServices.length > 0 ? (
                    <div className="grid gap-2">
                      {availableReceivingServices.map((dept) => (
                        <label
                          key={dept.id}
                          className="inline-flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 hover:border-indigo-300"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={receivingServices.includes(dept.name)}
                            onChange={() => {
                              setReceivingServices((prev) =>
                                prev.includes(dept.name)
                                  ? prev.filter((service) => service !== dept.name)
                                  : [...prev, dept.name]
                              );
                            }}
                          />
                          <span>{dept.name}</span>
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
              <p className="mt-2 text-xs text-slate-500">
                Click to open and select one or more receiving departments.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Receiving Phone</label>
              <input
                value={receivingPhone}
                onChange={(e) => setReceivingPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. +250 788 987 654"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Transfer Type</label>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as typeof transferTypes[number])}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {transferTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Admission Date</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Admission Time</label>
              <input
                type="time"
                value={admissionTime}
                onChange={(e) => setAdmissionTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Decision Date</label>
              <input
                type="date"
                value={decisionDate}
                onChange={(e) => setDecisionDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Decision Time</label>
              <input
                type="time"
                value={decisionTime}
                onChange={(e) => setDecisionTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Temperature (°C)</label>
              <input
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 37.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">SpO₂ (%)</label>
              <input
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 95"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">RR</label>
              <input
                value={rr}
                onChange={(e) => setRr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 18"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Pulse</label>
              <input
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 80"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">BP</label>
              <input
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 120/80"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Weight / MUAC</label>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="kg"
                />
                <input
                  value={muac}
                  onChange={(e) => setMuac(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="cm"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Reason for Transfer</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Significant Findings</label>
              <textarea
                value={significantFindings}
                onChange={(e) => setSignificantFindings(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Clinical Presentation</label>
              <textarea
                value={clinicalPresentation}
                onChange={(e) => setClinicalPresentation(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Immediate Condition</label>
              <textarea
                value={immediateCondition}
                onChange={(e) => setImmediateCondition(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Lab Results / Other</label>
            <textarea
              value={laboratory}
              onChange={(e) => setLaboratory(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Diagnosis</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Procedures / Treatments</label>
              <textarea
                value={procedures}
                onChange={(e) => setProcedures(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Medications</label>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Transport</label>
            <select
              value={transportType}
              onChange={(e) => setTransportType(e.target.value as typeof transportTypes[number])}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {transportTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Insurance</label>
            <select
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value as typeof insuranceOptions[number])}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {insuranceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {insuranceType === 'Other' ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Other Insurance</label>
              <input
                value={insuranceOther}
                onChange={(e) => setInsuranceOther(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <label className="text-sm font-medium text-slate-700">Transport Notes</label>
          <textarea
            value={transportNotes}
            onChange={(e) => setTransportNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">Fill all required fields and submit to create the transfer record.</div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Save Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
