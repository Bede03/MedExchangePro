import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getNotificationsByUser(req.user!.id);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.user!.id);
    const count = notifications.length;

    res.json({
      success: true,
      data: notifications,
      unreadCount: count,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user!
    );

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user!);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
