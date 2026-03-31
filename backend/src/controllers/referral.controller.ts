import { Request, Response } from 'express';
import { referralService } from '../services/referral.service';
import { auditService } from '../services/audit.service';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const createReferral = async (req: Request, res: Response) => {
  try {
    const referral = await referralService.createReferral(req.body, req.user!);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Referral_Created',
      'Referral',
      referral.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { patientName: referral.patient.name, priority: referral.priority }
    );

    res.status(201).json({
      success: true,
      data: referral,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReferralById = async (req: Request, res: Response) => {
  try {
    const referral = await referralService.getReferralById(req.params.id, req.user!);

    res.json({
      success: true,
      data: referral,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReferralsByHospital = async (req: Request, res: Response) => {
  try {
    const referrals = await referralService.getReferralsByHospital(req.user!.hospitalId);

    res.json({
      success: true,
      data: referrals,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReferralStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const referral = await referralService.updateReferralStatus(
      req.params.id,
      status,
      req.user!
    );

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Status_Changed',
      'Referral',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { newStatus: status, patientName: referral.patient.name }
    );

    res.json({
      success: true,
      data: referral,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReferralStats = async (req: Request, res: Response) => {
  try {
    const stats = await referralService.getReferralStats(req.user!.hospitalId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
