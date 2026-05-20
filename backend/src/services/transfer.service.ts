import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';
import { KFHOracleService, KFHPatient } from './kfh-oracle.service';
import { externalMysqlService, ExternalPatientRecord } from './external-mysql.service';
import { patientService } from './patient.service';

const prisma = new PrismaClient();
const kfhOracleService = new KFHOracleService();

export class TransferService {
  // Generate a unique transfer ID
  private generateTransferId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TRF-${timestamp}-${random}`.toUpperCase();
  }

  async createTransfer(data: any, userId: string) {
    // Validate required fields
    if (!data.patientNationalId) {
      throw new AppError(400, 'Patient national ID is required');
    }
    if (!data.fromHospitalId) {
      throw new AppError(400, 'From hospital ID is required');
    }
    if (!data.toHospitalId) {
      throw new AppError(400, 'To hospital ID is required');
    }
    if (!data.transferType) {
      throw new AppError(400, 'Transfer type is required');
    }

    // Verify hospitals exist
    const fromHospital = await prisma.hospital.findUnique({
      where: { id: data.fromHospitalId },
    });

    if (!fromHospital) {
      throw new AppError(404, 'From hospital not found');
    }

    const toHospital = await prisma.hospital.findUnique({
      where: { id: data.toHospitalId },
    });

    if (!toHospital) {
      throw new AppError(404, 'To hospital not found');
    }

    // Try to fetch patient from external database to validate and cache name
    let patientName = data.patientName || null;
    try {
      const isKFH = fromHospital.name.toLowerCase().includes('king faisal');
      
      if (isKFH) {
        const kfhPatient = await kfhOracleService.getPatientByNationalId(data.patientNationalId);
        if (kfhPatient) {
          patientName = `${kfhPatient.FIRST_NAME || ''} ${kfhPatient.LAST_NAME || ''}`.trim();
        }
      } else {
        const chukPatients = await externalMysqlService.getPatientRecordsByNationalId(data.patientNationalId);
        if (chukPatients && chukPatients.length > 0) {
          const chukPatient = chukPatients[0];
          patientName = chukPatient.name || '';
        }
      }
    } catch (error: any) {
      console.error('Warning: Could not fetch patient from external DB:', error.message);
      // Don't fail - we can still create the transfer without validating the patient exists
    }

    const transfer = await prisma.transfer.create({
      data: {
        transferId: this.generateTransferId(),
        patientNationalId: data.patientNationalId,
        patientName: patientName,
        fromHospitalId: data.fromHospitalId,
        toHospitalId: data.toHospitalId,
        transferType: data.transferType,
        reasonForTransfer: data.reasonForTransfer || null,
        significantFindings: data.significantFindings || null,
        clinicalPresentation: data.clinicalPresentation || null,
        immediateCondition: data.immediateCondition || null,
        temperature: data.temperature || null,
        spo2: data.spo2 || null,
        rr: data.rr || null,
        pulse: data.pulse || null,
        bp: data.bp || null,
        weight: data.weight || null,
        muac: data.muac || null,
        laboratory: data.laboratory || null,
        diagnosis: data.diagnosis || null,
        procedures: data.procedures || null,
        medications: data.medications || null,
        transportType: data.transportType || null,
        transportNotes: data.transportNotes || null,
        insuranceType: data.insuranceType || null,
        insuranceOther: data.insuranceOther || null,
        referringClinician: data.referringClinician || null,
        referringPhone: data.referringPhone || null,
        receivingService: data.receivingService || null,
        receivingPhone: data.receivingPhone || null,
        admissionDate: data.admissionDate || null,
        admissionTime: data.admissionTime || null,
        decisionDate: data.decisionDate || null,
        decisionTime: data.decisionTime || null,
        status: 'pending',
      },
      include: {
        fromHospital: true,
        toHospital: true,
      },
    });

    return transfer;
  }

  private async fetchExternalPatientProfile(patientNationalId: string, fromHospitalName: string | null) {
    if (!patientNationalId) {
      return null;
    }

    const isKFH = Boolean(fromHospitalName?.toLowerCase().includes('king faisal'));

    try {
      if (isKFH) {
        const kfhPatient = await kfhOracleService.getPatientByNationalId(patientNationalId);
        if (!kfhPatient) return null;

        return {
          name: `${kfhPatient.FIRST_NAME || ''} ${kfhPatient.LAST_NAME || ''}`.trim(),
          dob: kfhPatient.DOB ? new Date(kfhPatient.DOB).toISOString() : null,
          gender: kfhPatient.GENDER?.toLowerCase() || null,
          phone: kfhPatient.PHONE || null,
          nationalId: kfhPatient.NATIONAL_ID || patientNationalId,
          sourceSystem: 'KFH Oracle',
        };
      }

      const externalPatients = await externalMysqlService.getPatientRecordsByNationalId(patientNationalId);
      const patientRecord = externalPatients?.[0] ?? null;
      if (!patientRecord) return null;

      return {
        name: patientRecord.name || null,
        dob: patientRecord.dob ? new Date(patientRecord.dob).toISOString() : null,
        gender: null,
        phone: patientRecord.phone || null,
        nationalId: patientRecord.national_id || patientNationalId,
        sourceSystem: patientRecord.source_system || 'CHUK MySQL',
      };
    } catch (error: any) {
      console.error('Warning: Could not fetch external patient profile:', error.message || error);
      return null;
    }
  }

  async getTransferById(id: string) {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromHospital: true,
        toHospital: true,
      },
    });

    if (!transfer) {
      throw new AppError(404, 'Transfer not found');
    }

    const patientProfile = await this.fetchExternalPatientProfile(
      transfer.patientNationalId,
      transfer.fromHospital?.name ?? null
    );

    return {
      ...transfer,
      patientProfile,
    };
  }

  async getTransfersByHospital(hospitalId: string, direction: 'from' | 'to' | 'all' = 'all') {
    let where: any = {};

    if (direction === 'from') {
      where.fromHospitalId = hospitalId;
    } else if (direction === 'to') {
      where.toHospitalId = hospitalId;
    } else {
      where.OR = [
        { fromHospitalId: hospitalId },
        { toHospitalId: hospitalId },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        fromHospital: true,
        toHospital: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transfers;
  }

  async updateTransferStatus(id: string, status: string) {
    const normalizedStatus = status === 'in_transit' ? 'in_transit' : status;
    const validStatuses = ['pending', 'approved', 'in_transit', 'completed', 'cancelled', 'rejected', 'in-transit'];

    if (!validStatuses.includes(normalizedStatus) && !validStatuses.includes(status)) {
      throw new AppError(400, `Invalid status. Valid statuses: ${validStatuses.join(', ')}`);
    }

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromHospital: true,
      },
    });

    if (!transfer) {
      throw new AppError(404, 'Transfer not found');
    }

    let externalPatientData: any = transfer.externalPatientData || null;

    if (normalizedStatus === 'in_transit' && !externalPatientData) {
      externalPatientData = await this.captureExternalPatientSnapshot(
        transfer.fromHospitalId,
        transfer.patientNationalId
      );

      if (!externalPatientData) {
        throw new AppError(400, 'Failed to capture external patient information for transfer.');
      }
    }

      const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: {
        status: normalizedStatus,
        externalPatientData: externalPatientData ? (externalPatientData as any) : undefined,
      },
      include: {
        fromHospital: true,
        toHospital: true,
      },
    });

    return updatedTransfer;
  }

  private async captureExternalPatientSnapshot(fromHospitalId: string, patientNationalId: string) {
    try {
      const hospital = await prisma.hospital.findUnique({
        where: { id: fromHospitalId },
      });

      if (!hospital) return null;

      const patient = await patientService.getPatientById(patientNationalId, fromHospitalId);
      let externalHistory = null;

      if (!hospital.name.toLowerCase().includes('king faisal')) {
        externalHistory = await externalMysqlService.getPatientRecordsByNationalId(patientNationalId);
      }

      return {
        patient,
        externalHistory,
      };
    } catch (error: any) {
      console.error('Failed to capture external patient snapshot:', error.message || error);
      return null;
    }
  }

  async deleteTransfer(id: string) {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      throw new AppError(404, 'Transfer not found');
    }

    await prisma.transfer.delete({
      where: { id },
    });
  }

  async getTransferStats(hospitalId: string) {
    const total = await prisma.transfer.count({
      where: {
        OR: [
          { fromHospitalId: hospitalId },
          { toHospitalId: hospitalId },
        ],
      },
    });

    const pending = await prisma.transfer.count({
      where: {
        OR: [
          { fromHospitalId: hospitalId },
          { toHospitalId: hospitalId },
        ],
        status: 'pending',
      },
    });

    const approved = await prisma.transfer.count({
      where: {
        OR: [
          { fromHospitalId: hospitalId },
          { toHospitalId: hospitalId },
        ],
        status: 'approved',
      },
    });

    const completed = await prisma.transfer.count({
      where: {
        OR: [
          { fromHospitalId: hospitalId },
          { toHospitalId: hospitalId },
        ],
        status: 'completed',
      },
    });

    return {
      total,
      pending,
      approved,
      completed,
    };
  }
}

export const transferService = new TransferService();
