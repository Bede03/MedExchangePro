import { Request, Response } from 'express';
import { hospitalService } from '../services/hospital.service';
import { auditService } from '../services/audit.service';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const createHospital = async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const hospital = await hospitalService.createHospital(req.body);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'User_Created',
      'Hospital',
      hospital.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { name: hospital.name }
    );

    res.status(201).json({
      success: true,
      data: hospital,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const hospital = await hospitalService.getHospitalById(req.params.id);

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await hospitalService.getAllHospitals();

    res.json({
      success: true,
      data: hospitals,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateHospital = async (req: Request, res: Response) => {
  try {
    const hospital = await hospitalService.updateHospital(
      req.params.id,
      req.body,
      req.user!
    );

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'User_Updated',
      'Hospital',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      req.body
    );

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteHospital = async (req: Request, res: Response) => {
  try {
    await hospitalService.deleteHospital(req.params.id, req.user!);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'User_Updated',
      'Hospital',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { action: 'deleted' }
    );

    res.json({
      success: true,
      message: 'Hospital deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
