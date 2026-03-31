import { api } from './api';

/**
 * Patient Records API Service
 * Handles secure sharing and retrieval of patient medical records
 */

export interface TestResult {
  testName: string;
  result: string;
  date: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface MedicalHistoryItem {
  condition: string;
  dateOfDiagnosis: string;
  treatment: string;
}

export interface Vitals {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
}

export interface SharedPatientRecord {
  id: string;
  referralId: string;
  patientId: string;
  receivingHospitalId: string;
  testResults?: TestResult[];
  medications?: Medication[];
  allergies?: Allergy[];
  medicalHistory?: MedicalHistoryItem[];
  vitalsLastRecorded?: Vitals;
  currentDiagnosis?: string;
  clinicalNotes?: string;
  sharedAt: string;
  accessedAt: string;
  expiresAt: string;
  patient: {
    id: string;
    name: string;
    gender: string;
    dob: string;
    nationalId: string;
  };
  referral: {
    id: string;
    status: string;
    priority: string;
    department: string;
    requestingHospital: {
      id: string;
      name: string;
    };
  };
}

class PatientRecordsService {
  /**
   * Share patient medical records with receiving hospital
   * Used when approving a referral
   */
  async sharePatientRecords(
    referralId: string,
    medicalData: {
      testResults?: TestResult[];
      medications?: Medication[];
      allergies?: Allergy[];
      medicalHistory?: MedicalHistoryItem[];
      vitalsLastRecorded?: Vitals;
      currentDiagnosis?: string;
      clinicalNotes?: string;
    }
  ) {
    try {
      const response = await api.post('/patient-records/share', {
        referralId,
        ...medicalData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all shared patient records for receiving hospital
   */
  async getSharedRecords(): Promise<SharedPatientRecord[]> {
    try {
      const response = await api.get('/patient-records/shared');
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shared patient records for specific referral
   */
  async getSharedRecordByReferral(referralId: string): Promise<SharedPatientRecord> {
    try {
      const response = await api.get(`/patient-records/referral/${referralId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient record details (basic info)
   */
  async getPatientRecords(patientId: string) {
    try {
      const response = await api.get(`/patient-records/${patientId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export const patientRecordsAPI = new PatientRecordsService();
