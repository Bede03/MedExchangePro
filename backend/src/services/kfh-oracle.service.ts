import oracledb from 'oracledb';
import { getOracleConnection } from '../db/oracleClient.js';

export interface KFHPatient {
  PATIENT_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  DOB: Date;
  GENDER: string;
  NATIONAL_ID: string;
  NIDA_VERIFIED: number;
  PHONE: string;
  BLOOD_TYPE: string;
  COUNTRY_OF_ORIGIN: string;
}

export interface KFHStaff {
  staff_id: number;
  first_name: string;
  last_name: string;
  role: string;
  gender: string;
  dob: Date;
  dept_id: number;
  license_number: string;
  email: string;
  phone: string;
  nationality: string;
  hire_date: Date;
}

export interface KFHVisit {
  VISIT_ID: number;
  PATIENT_ID: number;
  VISIT_TYPE: string;
  DEPT_ID: number;
  TRIAGE_LEVEL: number;
  ADMITTED_AT: Date;
  DISCHARGED_AT: Date | null;
  BED_ID: number | null;
  ROOM_TYPE: string | null;
  QUEUE_TOKEN: string;
}

export interface KFHEncounter {
  ENCOUNTER_ID: number;
  VISIT_ID: number;
  STAFF_ID: number;
  ENCOUNTER_TIME: Date;
  TYPE: string;
  NOTES: string;
  IS_PAPERLESS: number;
}

export interface KFHDepartment {
  dept_id: number;
  name: string;
  category: string;
  head_staff_id: number | null;
}

export interface KFHWard {
  ward_id: number;
  dept_id: number;
  name: string;
  floor: number;
  capacity: number;
  type: string;
}

export interface KFHBed {
  bed_id: number;
  ward_id: number;
  bed_number: string;
  room_type: string;
  status: string;
}

export interface KFHReferral {
  referral_id: number;
  patient_id: number;
  from_facility: string;
  from_country: string;
  reason: string;
  priority: string;
  referral_date: Date;
  accepted_at: Date | null;
}

export interface KFHMedication {
  med_id: number;
  generic_name: string;
  brand_name: string | null;
  category: string;
  dosage_form: string;
  strength: string;
}

export interface KFHPrescription {
  RX_ID: number;
  ENCOUNTER_ID: number;
  MED_ID: number;
  DOSE: string;
  FREQUENCY: string;
  DURATION_DAYS: number;
  PRESCRIBED_BY: number;
  E_PRESCRIPTION: number;
  DDI_CHECKED: number;
}

export interface KHFLabResult {
  RESULT_ID: number;
  ORDER_ID: number;
  PARAMETER: string;
  VALUE: string;
  UNIT: string;
  REF_RANGE: string;
  FLAG: string;
  SMS_SENT: number;
  RESULTED_AT: Date;
}

export interface KFHDiagnosis {
  DIAG_ID: number;
  ENCOUNTER_ID: number;
  ICD10_CODE: string;
  DESCRIPTION: string;
  IS_PRIMARY: number;
  CONFIRMED_AT: Date;
}

export interface KFHPatientWithDetails extends KFHPatient {
  visits?: KFHVisit[];
  staff?: KFHStaff;
}

export class KFHOracleService {
  async getPatients(limit: number = 100): Promise<KFHPatient[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM patients WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHPatient[];
    } finally {
      await connection.close();
    }
  }

  async getPatientById(patientId: number): Promise<KFHPatient | null> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM patients WHERE patient_id = :patientId`,
        [patientId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = result.rows as KFHPatient[] | undefined;
      return rows?.[0] ?? null;
    } finally {
      await connection.close();
    }
  }

  async getPatientByNationalId(nationalId: string): Promise<KFHPatient | null> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM patients WHERE national_id = :nationalId`,
        [nationalId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = result.rows as KFHPatient[] | undefined;
      return rows?.[0] ?? null;
    } finally {
      await connection.close();
    }
  }

  async getStaff(limit: number = 100): Promise<KFHStaff[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM staff WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHStaff[];
    } finally {
      await connection.close();
    }
  }

  async getStaffById(staffId: number): Promise<KFHStaff | null> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM staff WHERE staff_id = :staffId`,
        [staffId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = result.rows as KFHStaff[] | undefined;
      return rows?.[0] ?? null;
    } finally {
      await connection.close();
    }
  }

  async getVisits(limit: number = 100): Promise<KFHVisit[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM visits WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHVisit[];
    } finally {
      await connection.close();
    }
  }

  async getVisitById(visitId: number): Promise<KFHVisit | null> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM visits WHERE visit_id = :visitId`,
        [visitId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = result.rows as KFHVisit[] | undefined;
      return rows?.[0] ?? null;
    } finally {
      await connection.close();
    }
  }

  async getVisitsByPatientId(patientId: number): Promise<KFHVisit[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM visits WHERE patient_id = :patientId ORDER BY admitted_at DESC`,
        [patientId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHVisit[];
    } finally {
      await connection.close();
    }
  }

  async getEncounters(limit: number = 100): Promise<KFHEncounter[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM encounters WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHEncounter[];
    } finally {
      await connection.close();
    }
  }

  async getEncountersByVisitId(visitId: number): Promise<KFHEncounter[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM encounters WHERE visit_id = :visitId ORDER BY encounter_time DESC`,
        [visitId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHEncounter[];
    } finally {
      await connection.close();
    }
  }

  async getDepartments(limit: number = 100): Promise<KFHDepartment[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM departments WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHDepartment[];
    } finally {
      await connection.close();
    }
  }

  async getWards(limit: number = 100): Promise<KFHWard[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM wards WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHWard[];
    } finally {
      await connection.close();
    }
  }

  async getBeds(limit: number = 100): Promise<KFHBed[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM beds WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHBed[];
    } finally {
      await connection.close();
    }
  }

  async getReferrals(limit: number = 100): Promise<KFHReferral[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM referrals WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHReferral[];
    } finally {
      await connection.close();
    }
  }

  async getReferralsByPatientId(patientId: number): Promise<KFHReferral[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM referrals WHERE patient_id = :patientId ORDER BY referral_date DESC`,
        [patientId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHReferral[];
    } finally {
      await connection.close();
    }
  }

  async getPatientRecordsByNationalId(nationalId: string) {
    const connection = await getOracleConnection();
    try {
      // Get patient info
      const patientResult = await connection.execute(
        `SELECT * FROM patients WHERE national_id = :nationalId`,
        [nationalId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const patientRows = patientResult.rows as KFHPatient[] | undefined;
      if (!patientRows?.[0]) {
        return null;
      }

      const patient = patientRows[0];

      // Get visits
      const visitsResult = await connection.execute(
        `SELECT * FROM visits WHERE patient_id = :patientId ORDER BY admitted_at DESC`,
        [patient.PATIENT_ID],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Get referrals
      const referralsResult = await connection.execute(
        `SELECT * FROM referrals WHERE patient_id = :patientId ORDER BY referral_date DESC`,
        [patient.PATIENT_ID],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return {
        patient,
        visits: visitsResult.rows,
        referrals: referralsResult.rows,
        source_system: 'KFH Oracle'
      };
    } finally {
      await connection.close();
    }
  }

  async getHospitalInfo() {
    return {
      id: 'KFH-001',
      name: 'King Faisal Hospital',
      address: 'Kigali, Rwanda',
      phone: '+250 788 123 456',
      source: 'Oracle XE'
    };
  }

  // Get all medications
  async getMedications(limit: number = 100): Promise<KFHMedication[]> {
    const connection = await getOracleConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM medications WHERE ROWNUM <= :limit`,
        [limit],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows as KFHMedication[];
    } finally {
      await connection.close();
    }
  }

  // Get prescriptions by patient ID
  async getPrescriptionsByPatientId(patientId: number): Promise<any[]> {
    const connection = await getOracleConnection();
    try {
      console.log('[DEBUG KFH] getPrescriptionsByPatientId called with patientId:', patientId);
      const result = await connection.execute(
        `SELECT pr.rx_id, pr.encounter_id, pr.med_id, pr.dose, pr.frequency, pr.duration_days, pr.prescribed_by,
                m.generic_name, m.brand_name, m.form, m.strength,
                (s.first_name || ' ' || s.last_name) as prescriber_name
         FROM prescriptions pr
         LEFT JOIN medications m ON pr.med_id = m.med_id
         LEFT JOIN staff s ON pr.prescribed_by = s.staff_id
         JOIN encounters e ON pr.encounter_id = e.encounter_id
         JOIN visits v ON e.visit_id = v.visit_id
         WHERE v.patient_id = :patientId
         ORDER BY pr.rx_id DESC`,
        { patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('[DEBUG KFH] getPrescriptionsByPatientId result rows:', result.rows?.length);
      return result.rows || [];
    } finally {
      await connection.close();
    }
  }

  // Get lab results by patient ID
  async getLabResultsByPatientId(patientId: number): Promise<KHFLabResult[]> {
    const connection = await getOracleConnection();
    try {
      console.log('[DEBUG KFH] getLabResultsByPatientId called with patientId:', patientId);
      const result = await connection.execute(
        `SELECT lr.result_id, lr.order_id, lr.parameter, lr.value, lr.unit, lr.ref_range, lr.flag, lr.resulted_at
         FROM lab_results lr
         JOIN lab_orders lo ON lr.order_id = lo.order_id
         JOIN encounters e ON lo.encounter_id = e.encounter_id
         JOIN visits v ON e.visit_id = v.visit_id
         WHERE v.patient_id = :patientId
         ORDER BY lr.resulted_at DESC`,
        { patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('[DEBUG KFH] getLabResultsByPatientId result rows:', result.rows?.length);
      return result.rows as KHFLabResult[];
    } finally {
      await connection.close();
    }
  }

  // Get encounters by patient ID
  async getEncountersByPatientId(patientId: number): Promise<KFHEncounter[]> {
    const connection = await getOracleConnection();
    try {
      console.log('[DEBUG KFH] getEncountersByPatientId called with patientId:', patientId);
      const result = await connection.execute(
        `SELECT e.encounter_id, e.visit_id, e.staff_id, e.encounter_time, e.type, e.notes, e.is_paperless
         FROM encounters e
         JOIN visits v ON e.visit_id = v.visit_id
         WHERE v.patient_id = :patientId
         ORDER BY e.encounter_time DESC`,
        { patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { "NOTES": { type: oracledb.STRING } } }
      );
      console.log('[DEBUG KFH] getEncountersByPatientId result rows:', result.rows?.length);
      return result.rows as KFHEncounter[];
    } finally {
      await connection.close();
    }
  }

  // Get diagnoses by patient ID
  async getDiagnosesByPatientId(patientId: number): Promise<KFHDiagnosis[]> {
    const connection = await getOracleConnection();
    try {
      console.log('[DEBUG KFH] getDiagnosesByPatientId called with patientId:', patientId);
      const result = await connection.execute(
        `SELECT d.diag_id, d.encounter_id, d.icd10_code, d.description, d.is_primary, d.confirmed_at
         FROM diagnoses d
         JOIN encounters e ON d.encounter_id = e.encounter_id
         JOIN visits v ON e.visit_id = v.visit_id
         WHERE v.patient_id = :patientId
         ORDER BY d.confirmed_at DESC`,
        { patientId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { "DESCRIPTION": { type: oracledb.STRING } } }
      );
      console.log('[DEBUG KFH] getDiagnosesByPatientId result rows:', result.rows?.length);
      return result.rows as KFHDiagnosis[];
    } finally {
      await connection.close();
    }
  }

  }

export const kfhOracleService = new KFHOracleService();