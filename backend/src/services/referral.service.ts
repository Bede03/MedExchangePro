import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';
import { validateReferralDepartment, hospitalHasDepartment } from '../utils/departments';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class ReferralService {
  async createReferral(data: any, currentUser: JwtPayload) {
    // Verify patient exists and belongs to requesting hospital
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    if (patient.hospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Can only refer patients from your hospital');
    }

    // Verify receiving hospital exists
    const receivingHospital = await prisma.hospital.findUnique({
      where: { id: data.receivingHospitalId },
    });

    if (!receivingHospital) {
      throw new AppError(404, 'Receiving hospital not found');
    }

    // Validate department
    const deptValidation = validateReferralDepartment(
      data.department,
      data.receivingHospitalId,
      receivingHospital.name
    );
    if (!deptValidation.isValid) {
      throw new AppError(400, `Invalid department: ${deptValidation.errors.join(', ')}`);
    }

    const referral = await prisma.referral.create({
      data: {
        patientId: data.patientId,
        reason: data.reason,
        priority: data.priority,
        department: deptValidation.department as string,
        requestingHospitalId: currentUser.hospitalId,
        receivingHospitalId: data.receivingHospitalId,
      },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    // Notify receiving hospital about new referral
    await notificationService.notifyNewReferral(
      data.receivingHospitalId,
      referral.patient.name,
      referral.priority,
      referral.requestingHospital.name
    );

    return referral;
  }

  async getReferralById(id: string, currentUser: JwtPayload) {
    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }

    // Verify user has access
    const hasAccess =
      referral.requestingHospitalId === currentUser.hospitalId ||
      referral.receivingHospitalId === currentUser.hospitalId ||
      currentUser.role === 'admin';

    if (!hasAccess) {
      throw new AppError(403, 'Unauthorized to view this referral');
    }

    return referral;
  }

  async getReferralsByHospital(hospitalId: string) {
    return await prisma.referral.findMany({
      where: {
        OR: [
          { requestingHospitalId: hospitalId },
          { receivingHospitalId: hospitalId },
        ],
      },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReferralStatus(id: string, status: string, currentUser: JwtPayload) {
    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        receivingHospital: true,
        requestingHospital: true,
      },
    });

    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }

    // Only receiving hospital can approve/reject
    if (referral.receivingHospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Only receiving hospital can update referral status');
    }

    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    // Notify requesting hospital about status change
    await notificationService.notifyReferralStatusChange(
      referral.requestingHospitalId,
      referral.patient.name,
      status,
      referral.receivingHospital.name
    );

    return updatedReferral;
  }

  async getReferralStats(hospitalId: string) {
    const referrals = await prisma.referral.findMany({
      where: {
        OR: [
          { requestingHospitalId: hospitalId },
          { receivingHospitalId: hospitalId },
        ],
      },
    });

    return {
      total: referrals.length,
      pending: referrals.filter((r) => r.status === 'pending').length,
      approved: referrals.filter((r) => r.status === 'approved').length,
      completed: referrals.filter((r) => r.status === 'completed').length,
      rejected: referrals.filter((r) => r.status === 'rejected').length,
    };
  }
}

export const referralService = new ReferralService();
