import { PrismaClient } from '@prisma/client';
import { RowDataPacket } from 'mysql2';
import pool from '../db/mysqlClient.js';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';

const prisma = new PrismaClient();

interface ChukPatientRow extends RowDataPacket {
  patient_id?: number;
  first_name?: string;
  last_name?: string;
  gender?: string;
  dob?: string;
  national_id?: string;
  phone?: string;
  blood_type?: string;
  insurance_id?: number;
  address?: string;
}

interface PatientEncounterRow extends RowDataPacket {
  encounter_id: number;
  visit_id?: number;
  staff_id?: number;
  encounter_time?: string;
  notes?: string;
  type?: string;
}

interface PatientDiagnosisRow extends RowDataPacket {
  diag_id: number;
  encounter_id?: number;
  icd10_code?: string;
  description?: string;
  is_primary?: number;
  confirmed_at?: string;
}

interface PatientPrescriptionRow extends RowDataPacket {
  rx_id: number;
  encounter_id?: number;
  med_id?: number;
  dose?: string;
  frequency?: string;
  duration_days?: number;
  prescribed_by?: number;
  prescriber_name?: string;
  medication_name?: string;
  diagnosis?: string;
}

interface PatientLabResultRow extends RowDataPacket {
  result_id: number;
  order_id?: number;
  parameter?: string;
  value?: string;
  unit?: string;
  ref_range?: string;
  flag?: string;
  resulted_at?: string;
}

interface PatientInsuranceRow extends RowDataPacket {
  scheme?: string;
  member_number?: string;
}

const normalizeChukPatient = (row: ChukPatientRow, hospitalId: string, hospitalName = 'CHUK') => {
  const firstName = String(row.first_name ?? '');
  const lastName = String(row.last_name ?? '');
  return {
    id: String(row.patient_id ?? ''),
    name: [firstName, lastName].filter(Boolean).join(' '),
    gender: String(row.gender ?? 'other'),
    dob: String(row.dob ?? ''),
    phone: String(row.phone ?? ''),
    address: String(row.address ?? ''),
    nationalId: String(row.national_id ?? ''),
    bloodType: String(row.blood_type ?? ''),
    insuranceId: row.insurance_id ?? null,
    hospitalId,
    hospital: {
      id: hospitalId,
      name: hospitalName,
    },
  };
};

export class PatientService {
  private async findChukHospitalId() {
    const hospital = await prisma.hospital.findFirst({
      where: { name: 'CHUK' },
    });
    return hospital?.id ?? 'chuk';
  }

  async createPatient(data: any, hospitalId: string) {
    const existing = await prisma.patient.findUnique({
      where: { nationalId: data.nationalId },
    });

    if (existing) {
      throw new AppError(409, 'Patient with this national ID already exists');
    }

    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        gender: data.gender,
        dob: data.dob,
        phone: data.phone,
        address: data.address,
        nationalId: data.nationalId,
        hospitalId,
      },
    });

    return patient;
  }

  private async getChukPatientByIdentifier(identifier: string) {
    const normalizedIdentifier = identifier.replace(/[_\s]/g, '').trim();
    const numericId = Number(normalizedIdentifier);
    const baseQuery = `
      SELECT
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.national_id,
        p.phone,
        p.blood_type,
        p.insurance_id,
        CONCAT_WS(', ', a.cell, a.sector, a.district, a.province) AS address
      FROM patients p
      LEFT JOIN addresses a ON p.address_id = a.address_id
    `;

    if (!Number.isNaN(numericId) && Number.isInteger(numericId)) {
      const [rows] = await pool.query<ChukPatientRow[]>(`${baseQuery} WHERE p.patient_id = ?`, [numericId]);
      if (rows.length > 0) return rows[0];
    }

    const [rowsByNational] = await pool.query<ChukPatientRow[]>(`${baseQuery} WHERE p.national_id = ?`, [normalizedIdentifier]);
    return rowsByNational[0] ?? null;
  }

  async getPatientById(id: string) {
    let row = await this.getChukPatientByIdentifier(id);

    if (!row) {
      const localPatient = await prisma.patient.findUnique({
        where: { id },
      });

      if (localPatient?.nationalId) {
        row = await this.getChukPatientByIdentifier(localPatient.nationalId);
      }
    }

    if (!row) {
      throw new AppError(404, 'Patient not found');
    }

    const chukHospitalId = await this.findChukHospitalId();
    const patient = normalizeChukPatient(row, chukHospitalId);
    let insurance = {
      id: row.insurance_id ?? null,
      scheme: null,
      memberNumber: null,
    };

    if (row.insurance_id != null) {
      const [insuranceRows] = await pool.query<PatientInsuranceRow[]>(
        `SELECT scheme, member_number FROM patient_insurance WHERE pi_id = ?`,
        [row.insurance_id]
      );
      if (insuranceRows.length > 0) {
        insurance = {
          id: row.insurance_id,
          scheme: insuranceRows[0].scheme ?? null,
          memberNumber: insuranceRows[0].member_number ?? null,
        };
      }
    }

    const chukPatientId = row.patient_id ?? 0;

    const [encounterRows] = await pool.query<PatientEncounterRow[]>(
      `SELECT e.encounter_id, e.visit_id, e.staff_id, e.encounter_time, e.notes, e.type
       FROM encounters e
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = ?
       ORDER BY e.encounter_time DESC`,
      [chukPatientId]
    );

    const [diagnosisRows] = await pool.query<PatientDiagnosisRow[]>(
      `SELECT d.diag_id, d.encounter_id, d.icd10_code, d.description, d.is_primary, d.confirmed_at
       FROM diagnoses d
       JOIN encounters e ON d.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = ?
       ORDER BY d.confirmed_at DESC`,
      [chukPatientId]
    );

    const [prescriptionRows] = await pool.query<PatientPrescriptionRow[]>(
      `SELECT
        pr.rx_id,
        pr.encounter_id,
        pr.dose,
        pr.frequency,
        pr.duration_days,
        pr.prescribed_by,
        CONCAT_WS(' ', s.first_name, s.last_name) AS prescriber_name,
        COALESCE(m.brand_name, m.generic_name, 'Medication') AS medication_name,
        COALESCE(d.description, 'No diagnosis found') AS diagnosis
       FROM prescriptions pr
       LEFT JOIN medications m ON pr.med_id = m.med_id
       LEFT JOIN diagnoses d ON d.encounter_id = pr.encounter_id AND d.is_primary = 1
       LEFT JOIN staff s ON pr.prescribed_by = s.staff_id
       JOIN encounters e ON pr.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = ?
       ORDER BY pr.rx_id DESC`,
      [chukPatientId]
    );

    const [labResultRows] = await pool.query<PatientLabResultRow[]>(
      `SELECT
        r.result_id,
        r.order_id,
        r.parameter,
        r.value,
        r.unit,
        r.ref_range,
        r.flag,
        r.resulted_at
       FROM lab_results r
       JOIN lab_orders o ON r.order_id = o.order_id
       JOIN encounters e ON o.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = ?
       ORDER BY r.resulted_at DESC`,
      [chukPatientId]
    );

    return {
      ...patient,
      insurance,
      encounters: encounterRows.map((enc) => ({
        id: enc.encounter_id,
        visitId: enc.visit_id ?? null,
        staffId: enc.staff_id ?? null,
        encounterTime: enc.encounter_time ?? null,
        notes: enc.notes ?? '',
        type: enc.type ?? 'Consultation',
      })),
      diagnoses: diagnosisRows.map((diag) => ({
        id: diag.diag_id,
        encounterId: diag.encounter_id ?? null,
        icd10Code: diag.icd10_code ?? '',
        description: diag.description ?? '',
        isPrimary: Boolean(diag.is_primary),
        confirmedAt: diag.confirmed_at ?? null,
      })),
      medications: prescriptionRows.map((presc) => ({
        id: presc.rx_id,
        encounterId: presc.encounter_id ?? null,
        medicationName: presc.medication_name ?? 'Medication',
        dose: presc.dose ?? '',
        frequency: presc.frequency ?? '',
        durationDays: presc.duration_days ?? null,
        prescribedBy: presc.prescriber_name ?? String(presc.prescribed_by ?? 'Unknown'),
        diagnosis: presc.diagnosis ?? null,
      })),
      labResults: labResultRows.map((result) => ({
        id: result.result_id,
        orderId: result.order_id ?? null,
        parameter: result.parameter ?? '',
        value: result.value ?? '',
        unit: result.unit ?? '',
        refRange: result.ref_range ?? '',
        flag: result.flag ?? '',
        resultedAt: result.resulted_at ?? null,
      })),
    };
  }

  async getPatientsByHospital(hospitalId: string) {
    const query = `
      SELECT
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.national_id,
        p.phone,
        p.blood_type,
        p.insurance_id,
        CONCAT_WS(', ', a.cell, a.sector, a.district, a.province) AS address
      FROM patients p
      LEFT JOIN addresses a ON p.address_id = a.address_id
    `;

    const [rows] = await pool.query<ChukPatientRow[]>(query);
    const chukHospitalId = await this.findChukHospitalId();

    const patients = rows.map((row) => normalizeChukPatient(row, chukHospitalId));
    return patients.filter(
      (patient) =>
        patient.hospitalId === hospitalId ||
        patient.hospital.name.toLowerCase() === 'chuk'
    );
  }

  async updatePatient(id: string, data: any, currentUser: JwtPayload) {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    if (patient.hospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Unauthorized to update this patient');
    }

    return await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        dob: data.dob,
        phone: data.phone,
        address: data.address,
      },
      include: { hospital: true },
    });
  }

  async deletePatient(id: string, currentUser: JwtPayload) {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    if (patient.hospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Unauthorized to delete this patient');
    }

    await prisma.patient.delete({
      where: { id },
    });
  }

  async searchPatients(query: string, hospitalId: string) {
    const likeQuery = `%${query.toLowerCase()}%`;
    const searchQuery = `
      SELECT
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.national_id,
        p.phone,
        p.blood_type,
        p.insurance_id,
        CONCAT_WS(', ', a.cell, a.sector, a.district, a.province) AS address
      FROM patients p
      LEFT JOIN addresses a ON p.address_id = a.address_id
      WHERE LOWER(CONCAT_WS(' ', p.first_name, p.last_name)) LIKE ?
        OR LOWER(p.national_id) LIKE ?
        OR p.phone LIKE ?
    `;

    const [rows] = await pool.query<ChukPatientRow[]>(searchQuery, [likeQuery, likeQuery, likeQuery]);
    const chukHospitalId = await this.findChukHospitalId();

    const patients = rows.map((row) => normalizeChukPatient(row, chukHospitalId));
    return patients.filter(
      (patient) =>
        patient.hospitalId === hospitalId ||
        patient.hospital.name.toLowerCase() === 'chuk'
    );
  }
}

export const patientService = new PatientService();
