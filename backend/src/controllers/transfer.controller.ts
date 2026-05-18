import { Request, Response } from 'express';
import { transferService } from '../services/transfer.service';
import { auditService } from '../services/audit.service';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const transfer = await transferService.createTransfer(req.body, req.user!.id);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Transfer',
      transfer.id,
      req.user!.id,
      ipAddress,
      userAgent,
      {
        patientNationalId: transfer.patientNationalId,
        fromHospital: transfer.fromHospitalId,
        toHospital: transfer.toHospitalId,
        transferType: transfer.transferType,
      }
    );

    res.status(201).json({
      success: true,
      data: transfer,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransferById = async (req: Request, res: Response) => {
  try {
    const transfer = await transferService.getTransferById(req.params.id);

    res.json({
      success: true,
      data: transfer,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransfersByHospital = async (req: Request, res: Response) => {
  try {
    const direction = (req.query.direction as string) || 'all';
    const transfers = await transferService.getTransfersByHospital(
      req.user!.hospitalId,
      direction as 'from' | 'to' | 'all'
    );

    res.json({
      success: true,
      data: transfers,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTransferStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const transfer = await transferService.updateTransferStatus(req.params.id, status);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Status_Changed',
      'Transfer',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { status }
    );

    res.json({
      success: true,
      data: transfer,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTransfer = async (req: Request, res: Response) => {
  try {
    await transferService.deleteTransfer(req.params.id);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Transfer',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { action: 'deleted' }
    );

    res.json({
      success: true,
      message: 'Transfer deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransferStats = async (req: Request, res: Response) => {
  try {
    const stats = await transferService.getTransferStats(req.user!.hospitalId);

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
