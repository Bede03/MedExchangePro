import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';

const prisma = new PrismaClient();

export class NotificationService {
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error'
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          read: false,
        },
      });
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getNotificationsByUser(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications;
  }

  async getUnreadNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
    return notifications;
  }

  async markAsRead(notificationId: string, currentUser: JwtPayload) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    if (notification.userId !== currentUser.id) {
      throw new AppError(403, 'Unauthorized');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return result;
  }

  async deleteNotification(notificationId: string, currentUser: JwtPayload) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    if (notification.userId !== currentUser.id) {
      throw new AppError(403, 'Unauthorized');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  // Helper: Notify receiving hospital about new referral
  async notifyNewReferral(
    receivingHospitalId: string,
    patientName: string,
    referralPriority: string,
    requestingHospitalName: string
  ) {
    const users = await prisma.user.findMany({
      where: {
        hospitalId: receivingHospitalId,
        role: { in: ['admin', 'clinician'] },
      },
    });

    const notificationPromises = users.map((user) =>
      this.createNotification(
        user.id,
        'New Referral Received',
        `New ${referralPriority} referral for ${patientName} from ${requestingHospitalName}`,
        'info'
      )
    );

    await Promise.all(notificationPromises);
  }

  // Helper: Notify requesting hospital about referral status change
  async notifyReferralStatusChange(
    requestingHospitalId: string,
    patientName: string,
    newStatus: string,
    receivingHospitalName: string
  ) {
    const users = await prisma.user.findMany({
      where: {
        hospitalId: requestingHospitalId,
        role: { in: ['admin', 'clinician'] },
      },
    });

    const statusMessages: Record<string, { title: string; type: 'success' | 'warning' | 'error' }> = {
      approved: { title: 'Referral Approved', type: 'success' },
      completed: { title: 'Referral Completed', type: 'success' },
      rejected: { title: 'Referral Rejected', type: 'error' },
    };

    const statusInfo = statusMessages[newStatus] || {
      title: 'Referral Status Updated',
      type: 'info' as const,
    };

    const notificationPromises = users.map((user) =>
      this.createNotification(
        user.id,
        statusInfo.title,
        `Referral for ${patientName} has been ${newStatus} by ${receivingHospitalName}`,
        statusInfo.type
      )
    );

    await Promise.all(notificationPromises);
  }
}

export const notificationService = new NotificationService();
