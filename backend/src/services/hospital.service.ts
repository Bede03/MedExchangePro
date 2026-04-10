import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';

const prisma = new PrismaClient();

export class HospitalService {
  async createHospital(data: any) {
    const existing = await prisma.hospital.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError(409, 'Hospital with this name already exists');
    }

    return await prisma.hospital.create({
      data: {
        name: data.name,
        location: data.location,
      },
    });
  }

  async getHospitalById(id: string) {
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!hospital) {
      throw new AppError(404, 'Hospital not found');
    }

    return hospital;
  }

  async getAllHospitals() {
    return await prisma.hospital.findMany({
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateHospital(id: string, data: any, currentUser: JwtPayload) {
    if (currentUser.role !== 'admin') {
      throw new AppError(403, 'Admin access required');
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id },
    });

    if (!hospital) {
      throw new AppError(404, 'Hospital not found');
    }

    return await prisma.hospital.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
      },
    });
  }

  async deleteHospital(id: string, currentUser: JwtPayload) {
    if (currentUser.role !== 'admin') {
      throw new AppError(403, 'Admin access required');
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id },
    });

    if (!hospital) {
      throw new AppError(404, 'Hospital not found');
    }

    await prisma.hospital.delete({
      where: { id },
    });
  }

  async getHospitalDepartments(id: string) {
    const hospital = await prisma.hospital.findUnique({
      where: { id },
    });

    if (!hospital) {
      throw new AppError(404, 'Hospital not found');
    }

    const departments = await prisma.hospitalDepartment.findMany({
      where: { hospitalId: id },
      select: {
        id: true,
        category: true,
        departmentName: true,
      },
    });

    return departments;
  }
}

export const hospitalService = new HospitalService();
