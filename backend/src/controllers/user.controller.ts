import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { auditService } from '../services/audit.service';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const createUser = async (req: Request, res: Response) => {
  try {
    // Only admins can create users
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const user = await userService.createUser(req.body);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'User_Created',
      'User',
      user.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { fullName: user.fullName, email: user.email, role: user.role }
    );

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUsersByHospital = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsersByHospital(req.user!.hospitalId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'User_Updated',
      'User',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      req.body
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    await userService.deleteUser(req.params.id);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'User_Updated',
      'User',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { action: 'deleted' }
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers(req.user!);

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
