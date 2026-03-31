import { useCallback, useEffect, useState } from 'react';
import { AppNotification, Hospital, Patient, Referral, User, AuditLog } from '../types';
import { apiClient } from '../services/api';

export function useMockData() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
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
          registered_at: p.createdAt,
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
          patient_name: r.patient?.name || '',
          reason: r.reason,
          status: r.status,
          priority: r.priority,
          requesting_hospital_id: r.requestingHospitalId,
          receiving_hospital_id: r.receivingHospitalId,
          created_at: r.createdAt,
          department: r.department,
        }));
        setReferrals(mappedReferrals);

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
      const response = await apiClient.referrals.create({
        patientId: referral.patient_id,
        reason: referral.reason,
        priority: referral.priority,
        receivingHospitalId: referral.receiving_hospital_id,
        department: referral.department,
      });

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
    notifications,
    auditLogs,
    addReferral,
    updateReferralStatus,
    updateUser,
    addUser,
    getReferralById,
    counts,
    isLoading,
  };
}


