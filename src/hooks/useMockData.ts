import { useCallback, useEffect, useState } from 'react';
import { AppNotification, Hospital, Patient, Referral, User, AuditLog, Transfer } from '../types';
import { apiClient } from '../services/api';

export function useMockData() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [notifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch hospitals
        const hospitalsRes = await apiClient.hospitals.list();
        setHospitals(hospitalsRes.data || []);

        // Fetch users
        const usersRes = await apiClient.users.list();
        const userData = usersRes.data || [];
        // Map backend field names to frontend
        const mappedUsers = userData.map((u: any) => ({
          id: u.id,
          full_name: u.fullName,
          email: u.email,
          role: u.role,
          hospital_id: u.hospitalId,
          created_at: u.createdAt,
          active: u.isActive ?? false,
        }));
        setUsers(mappedUsers);

        // Fetch patients
        const patientsRes = await apiClient.patients.list();
        const patientData = patientsRes.data || [];
        // Map backend field names to frontend
        const mappedPatients = patientData.map((p: any) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          dob: p.dob,
          phone: p.phone,
          address: p.address,
          national_id: p.nationalId,
          registered_at: p.createdAt ?? p.dob,
          hospital_id: p.hospitalId,
        }));
        setPatients(mappedPatients);

        // Fetch referrals
        const referralsRes = await apiClient.referrals.list();
        const referralData = referralsRes.data || [];
        // Map backend field names to frontend
        const mappedReferrals = referralData.map((r: any) => ({
          id: r.id,
          patient_id: r.patientId,
          patient_national_id: r.patient?.nationalId || r.patientNationalId || null,
          patient_name: r.patient?.name || '',
          reason: r.reason,
          status: r.status,
          priority: r.priority,
          requesting_hospital_id: r.requestingHospitalId,
          receiving_hospital_id: r.receivingHospitalId,
          created_at: r.createdAt,
          department: r.department,
          attachmentUrl: r.attachmentUrl || r.attachment_url || null,
        }));
        setReferrals(mappedReferrals);

        // Fetch transfers
        const transfersRes = await apiClient.transfers.list();
        const transferData = transfersRes.data || [];
        const mappedTransfers = transferData.map((t: any) => ({
          id: t.id,
          transferNumber: t.transferNumber,
          transferId: t.transferId || t.id,
          patientNationalId: t.patientNationalId || t.patient_national_id || null,
          patientName: t.patientName || t.patient_name || t.patient?.name || '',
          fromHospitalId: t.fromHospitalId || t.from_hospital_id || t.fromHospital?.id || '',
          toHospitalId: t.toHospitalId || t.to_hospital_id || t.toHospital?.id || '',
          transferType: t.transferType || t.transfer_type,
          status: t.status,
          reasonForTransfer: t.reasonForTransfer || t.reason_for_transfer || t.reason || '',
          significantFindings: t.significantFindings || t.significant_findings,
          clinicalPresentation: t.clinicalPresentation || t.clinical_presentation,
          immediateCondition: t.immediateCondition || t.immediate_condition,
          temperature: t.temperature,
          spo2: t.spo2,
          rr: t.rr,
          pulse: t.pulse,
          bp: t.bp,
          weight: t.weight,
          muac: t.muac,
          laboratory: t.laboratory,
          diagnosis: t.diagnosis,
          procedures: t.procedures,
          medications: t.medications,
          transportType: t.transportType || t.transport_type,
          transportNotes: t.transportNotes || t.transport_notes,
          insuranceType: t.insuranceType || t.insurance_type,
          receivingService: t.receivingService || t.receiving_service,
          createdAt: t.createdAt || t.created_at,
          fromHospital: t.fromHospital,
          toHospital: t.toHospital,
        }));
        setTransfers(mappedTransfers);

        // Fetch audit logs
        const auditRes = await apiClient.audit.list();
        const auditData = auditRes.data || [];
        // Map backend field names to frontend
        const mappedAudit = auditData.map((a: any) => ({
          id: a.id,
          action: a.action,
          entity_type: a.entityType,
          entity_id: a.entityId,
          user_id: a.userId,
          ip_address: a.ipAddress,
          details: a.details,
          timestamp: a.timestamp,
          hospital_id: a.user?.hospitalId || '',
        }));
        setAuditLogs(mappedAudit);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Silently fail - UI will show empty lists
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addReferral = useCallback(async (referral: any) => {
    try {
      const payload: any = {
        patientId: referral.patient_id,
        reason: Array.isArray(referral.reason) ? referral.reason.join('; ') : referral.reason,
        reasonDetails: referral.reasonDetails,
        priority: referral.priority,
        receivingHospitalId: referral.receiving_hospital_id,
        department: referral.department,
      };

      if (referral.attachmentUrl || referral.attachment_url || referral.attachment) {
        payload.attachmentUrl = referral.attachmentUrl || referral.attachment_url || referral.attachment;
      }

      const response = await apiClient.referrals.create(payload);

      if (response.data) {
        const newRef = {
          id: response.data.id,
          patient_id: response.data.patientId,
          patient_name: response.data.patient?.name || '',
          reason: response.data.reason,
          status: response.data.status,
          priority: response.data.priority,
          requesting_hospital_id: response.data.requestingHospitalId,
          receiving_hospital_id: response.data.receivingHospitalId,
          created_at: response.data.createdAt,
          department: response.data.department,
          attachmentUrl: response.data.attachmentUrl || response.data.attachment_url || null,
        };
        setReferrals((prev) => [newRef, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add referral:', error);
      throw error;
    }
  }, []);

  const updateReferralStatus = useCallback(async (id: string, status: Referral['status']) => {
    try {
      const response = await apiClient.referrals.updateStatus(id, status);

      if (response.data) {
        setReferrals((prev) =>
          prev.map((ref) => (ref.id === id ? { ...ref, status: response.data.status } : ref))
        );
      }
    } catch (error) {
      console.error('Failed to update referral status:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const response = await apiClient.users.update(id, updates);

      if (response.data) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      const response = await apiClient.users.create({
        fullName: user.full_name,
        email: user.email,
        password: 'defaultPassword123', // Default password, user should reset on first login
        role: user.role,
        hospitalId: user.hospital_id,
      });

      if (response.data) {
        const newUser: User = {
          id: response.data.id,
          full_name: response.data.fullName,
          email: response.data.email,
          role: response.data.role,
          hospital_id: response.data.hospitalId,
        };
        setUsers((prev) => [newUser, ...prev]);
        return newUser;
      }
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Failed to add user:', error);
      throw error;
    }
  }, []);

  const addHospital = useCallback(async (hospital: Omit<Hospital, 'id'>) => {
    try {
      const response = await apiClient.hospitals.list();
      const newHospital: Hospital = {
        ...hospital,
        id: `hosp-${Date.now()}`,
      };
      setHospitals((prev) => [newHospital, ...prev]);
      return newHospital;
    } catch (error) {
      console.error('Failed to add hospital:', error);
      throw error;
    }
  }, []);

  const updateHospital = useCallback((id: string, updates: Partial<Hospital>) => {
    setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const deleteHospital = useCallback((id: string) => {
    setHospitals((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const getReferralById = useCallback(
    (id: string) => referrals.find((r) => r.id === id) ?? null,
    [referrals]
  );

  const counts = {
    hospitals: hospitals.length,
    patients: patients.length,
    referrals: referrals.length,
  };

  return {
    hospitals,
    addHospital,
    updateHospital,
    deleteHospital,
    patients,
    users,
    referrals,
    transfers,
    notifications,
    auditLogs,
    addReferral,
    updateReferralStatus,
    updateUser,
    deleteUser,
    addUser,
    getReferralById,
    counts,
    isLoading,
  };
}


