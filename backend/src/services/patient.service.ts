import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';

const prisma = new PrismaClient();

export class PatientService {
  async createPatient(data: any, hospitalId: string) {
    // Check if national ID already exists
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

  async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { hospital: true },
    });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    return patient;
  }

  async getPatientsByHospital(hospitalId: string) {
    return await prisma.patient.findMany({
      where: { hospitalId },
      include: { hospital: true },
    });
  }

  async updatePatient(id: string, data: any, currentUser: JwtPayload) {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    // Verify user's hospital matches patient's hospital
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
    return await prisma.patient.findMany({
      where: {
        hospitalId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nationalId: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}

export const patientService = new PatientService();
