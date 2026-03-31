import { PrismaClient } from '@prisma/client';
import { JwtPayload } from '../utils/jwt';
import { getClientIp, getUserAgent } from '../utils/helpers';

const prisma = new PrismaClient();

export class AuditService {
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
    details?: any
  ) {
    return await prisma.auditLog.create({
      data: {
        action: action as any,
        entityType: entityType as any,
        entityId,
        userId,
        ipAddress,
        userAgent,
        details: details || {},
      },
    });
  }

  async getAuditLogs(limit: number = 100, skip: number = 0) {
    return await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
    });
  }

  async getAuditLogsByHospital(hospitalId: string, limit: number = 100, skip: number = 0) {
    return await prisma.auditLog.findMany({
      where: {
        user: {
          hospitalId,
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            hospitalId: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
    });
  }

  async getAuditLogsByEntity(entityType: string, entityId: string) {
    return await prisma.auditLog.findMany({
      where: {
        entityType: entityType as any,
        entityId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async filterAuditLogs(
    action?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
    skip: number = 0
  ) {
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
    });
  }

  async getDistinctActions() {
    const logs = await prisma.auditLog.findMany({
      distinct: ['action'],
      select: {
        action: true,
      },
      orderBy: { action: 'asc' },
    });

    return logs.map((log) => log.action);
  }

  async getAuditLogsWithCount(
    action?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 10,
    skip: number = 0
  ) {
    const where: any = {};

    if (action && action !== 'All Actions') {
      where.action = action;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
