export type UserRole = 'admin' | 'clinician' | 'registrar' | 'hospital_staff';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  hospital_id: string;
  created_at?: string;
  active?: boolean;
}

export interface PatientProfile {
  name?: string;
  dob?: string; // ISO date
  gender?: string;
  phone?: string;
  address?: string;
  nationalId?: string;
  sourceSystem?: string;
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

export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

export type TransferType = 'Emergency' | 'Non-Emergency' | 'Follow-up';

export interface Hospital {
  id: string;
  name: string;
  location?: string;
}

export interface Transfer {
  id: string;
  transferNumber?: number;
  transferId: string;
  patientNationalId: string;
  patientName: string;
  fromHospitalId: string;
  toHospitalId: string;
  transferType: TransferType;
  status: TransferStatus;
  reasonForTransfer: string;
  significantFindings?: string;
  clinicalPresentation?: string;
  immediateCondition?: string;
  temperature?: number;
  spo2?: number;
  rr?: number; // respiratory rate
  pulse?: number;
  bp?: string; // blood pressure
  weight?: number;
  muac?: number; // mid-upper arm circumference
  laboratory?: string;
  diagnosis?: string;
  procedures?: string;
  medications?: string;
  transportType?: string;
  transportNotes?: string;
  insuranceType?: string;
  insuranceOther?: string;
  referringClinician: string;
  referringPhone?: string;
  receivingService?: string;
  receivingPhone?: string;
  admissionDate?: string; // ISO date
  admissionTime?: string;
  decisionDate: string; // ISO date
  decisionTime?: string;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  fromHospital?: Hospital;
  toHospital?: Hospital;
  patientProfile?: PatientProfile;
  externalPatientData?: any;
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
