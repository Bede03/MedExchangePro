export type UserRole = 'admin' | 'clinician' | 'registrar' | 'hospital_staff';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  hospital_id: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  dob: string; // ISO date
  phone: string;
  address: string;
  national_id: string;
  registered_at: string; // ISO date
  hospital_id: string;
}

export type ReferralStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export type ReferralPriority = 'Emergency' | 'Urgent' | 'Routine';

export interface Referral {
  id: string;
  referral_number?: number;
  patient_id: string;
  patient_name: string;
  // Shared patient info fields (optional)
  patient_dob?: string;
  patient_gender?: string;
  patient_phone?: string;
  patient_national_id?: string;
  patient_address?: string;
  // Medical history, lab results, and documents
  medical_history?: string;
  lab_results?: string;
  patient_documents?: string;
  allergies?: string;
  current_medications?: string;
  diagnoses?: string;
  vitals?: string;
  reason: string;
  status: ReferralStatus;
  priority: ReferralPriority;
  requesting_hospital_id: string;
  receiving_hospital_id: string;
  created_at: string;
  department?: string;
}

export type AppNotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  datetime: string; // ISO
  type: AppNotificationType;
  read?: boolean;
}

export type AuditAction = 'User Updated' | 'Status Changed' | 'User Created' | 'Data Accessed';

export type AuditEntityType = 'User' | 'Referral' | 'Patient';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  user_id: string;
  ip_address: string;
  details: Record<string, any>;
  timestamp: string; // ISO date
  hospital_id: string;
}
