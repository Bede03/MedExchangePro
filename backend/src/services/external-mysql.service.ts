import { RowDataPacket } from 'mysql2';
import pool from '../db/mysqlClient.js';

export interface ExternalPatientRecord {
  id: string;
  name: string;
  dob: string;
  diagnosis: string;
  national_id: string;
  source_system?: string;
}

export interface ExternalHospitalInfo {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

export class ExternalMysqlService {
  async getPatientRecordsByNationalId(nationalId: string) {
    console.log('[DEBUG] CHUK MySQL: Querying for nationalId:', nationalId);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        p.patient_id AS id,
        CONCAT(p.first_name, ' ', p.last_name) AS name,
        p.dob,
        p.national_id,
        p.phone,
        p.blood_type,
        COALESCE(
          GROUP_CONCAT(DISTINCT d.description ORDER BY d.confirmed_at DESC SEPARATOR '; '),
          'No diagnoses found'
        ) AS diagnosis,
        'CHUK Demo' AS source_system
      FROM patients p
      LEFT JOIN visits v ON v.patient_id = p.patient_id
      LEFT JOIN encounters e ON e.visit_id = v.visit_id
      LEFT JOIN diagnoses d ON d.encounter_id = e.encounter_id
      WHERE p.national_id = ?
      GROUP BY p.patient_id`,
      [nationalId]
    );

    console.log('[DEBUG] CHUK MySQL: Found rows:', rows.length);
    return rows as ExternalPatientRecord[];
  }

  async getHospitalLookup() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, address, phone FROM external_hospitals LIMIT 100',
    );

    return rows as ExternalHospitalInfo[];
  }
}

export const externalMysqlService = new ExternalMysqlService();
