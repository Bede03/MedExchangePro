import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';
import { SharePatientRecordsInput } from '../schemas/validation';

const prisma = new PrismaClient();

export class PatientRecordsService {
  /**
   * Share patient medical records with receiving hospital
   * Called when referral is approved
   */
  async sharePatientRecords(data: SharePatientRecordsInput, currentUser: JwtPayload) {
    // Verify referral exists
    const referral = await prisma.referral.findUnique({
      where: { id: data.referralId },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }

    // Both requesting and receiving hospitals can share records for the referral
    const isInvolvedHospital =
      currentUser.hospitalId === referral.requestingHospitalId ||
      currentUser.hospitalId === referral.receivingHospitalId;

    if (!isInvolvedHospital && currentUser.role !== 'admin') {
      throw new AppError(403, 'Only hospitals involved in the referral can share patient records');
    }

    if (referral.status !== 'approved') {
      throw new AppError(400, 'Can only share records for approved referrals');
    }

    // Set expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create shared patient record
    const sharedRecord = await prisma.sharedPatientRecord.create({
      data: {
        referralId: data.referralId,
        patientId: referral.patientId,
        receivingHospitalId: referral.receivingHospitalId,
        testResults: data.testResults || null,
        medications: data.medications || null,
        allergies: data.allergies || null,
        medicalHistory: data.medicalHistory || null,
        vitalsLastRecorded: data.vitalsLastRecorded || null,
        currentDiagnosis: data.currentDiagnosis || null,
        clinicalNotes: data.clinicalNotes || null,
        expiresAt,
      },
      include: {
        patient: true,
        referral: true,
        receivingHospital: true,
      },
    });

    return sharedRecord;
  }

  /**
   * Get shared patient records for receiving hospital
   */
  async getSharedRecordsByHospital(hospitalId: string, currentUser: JwtPayload) {
    // Only receiving hospital can access their shared records
    if (currentUser.hospitalId !== hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Can only access your hospital\'s shared records');
    }

    const sharedRecords = await prisma.sharedPatientRecord.findMany({
      where: {
        receivingHospitalId: hospitalId,
        expiresAt: {
          gt: new Date(), // Only non-expired records
        },
      },
      include: {
        patient: true,
        referral: {
          include: {
            requestingHospital: true,
          },
        },
      },
      orderBy: { sharedAt: 'desc' },
    });

    return sharedRecords;
  }

  /**
   * Get specific shared patient record by referral
   */
  async getSharedRecordByReferral(referralId: string, currentUser: JwtPayload) {
    const sharedRecord = await prisma.sharedPatientRecord.findFirst({
      where: { referralId },
      include: {
        patient: true,
        referral: {
          include: {
            requestingHospital: true,
            receivingHospital: true,
          },
        },
      },
    });

    if (!sharedRecord) {
      throw new AppError(404, 'Shared patient records not found');
    }

    // Verify access
    const hasAccess =
      currentUser.hospitalId === sharedRecord.receivingHospitalId ||
      currentUser.role === 'admin';

    if (!hasAccess) {
      throw new AppError(403, 'Unauthorized to access this patient record');
    }

    // Check if expired
    if (sharedRecord.expiresAt < new Date()) {
      throw new AppError(403, 'Patient records have expired');
    }

    // Update accessed timestamp
    await prisma.sharedPatientRecord.update({
      where: { id: sharedRecord.id },
      data: { accessedAt: new Date() },
    });

    return sharedRecord;
  }

  /**
   * Get patient record details for a specific patient
   */
  async getPatientRecordDetails(patientId: string, currentUser: JwtPayload) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    // Only requesting hospital can view patient records
    if (patient.hospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Can only access patients from your hospital');
    }

    // Don't expose sensitive medical data yet
    // This endpoint serves as a base for future medical records integration
    return {
      id: patient.id,
      name: patient.name,
      gender: patient.gender,
      dob: patient.dob,
      nationalId: patient.nationalId,
      hospitalId: patient.hospitalId,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  /**
   * Check if shared records have expired and cleanup
   */
  async cleanupExpiredRecords() {
    const now = new Date();

    const deleted = await prisma.sharedPatientRecord.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return deleted.count;
  }
}

export const patientRecordsService = new PatientRecordsService();
