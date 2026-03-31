import { Request, Response } from 'express';
import { auditService } from '../services/audit.service';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;

    const logs = await auditService.getAuditLogs(limit, skip);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAuditLogsByHospital = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;

    const logs = await auditService.getAuditLogsByHospital(
      req.user!.hospitalId,
      limit,
      skip
    );

    res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const filterAuditLogs = async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { action, startDate, endDate, limit = '100', skip = '0' } = req.query;

    const logs = await auditService.filterAuditLogs(
      action as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      parseInt(limit as string),
      parseInt(skip as string)
    );

    res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDistinctActions = async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const actions = await auditService.getDistinctActions();

    res.json({
      success: true,
      data: actions,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAuditLogsWithCount = async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { action, startDate, endDate, limit = '10', skip = '0' } = req.query;

    const { logs, total } = await auditService.getAuditLogsWithCount(
      action as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      parseInt(limit as string),
      parseInt(skip as string)
    );

    res.json({
      success: true,
      data: logs,
      total,
      page: Math.floor(parseInt(skip as string) / parseInt(limit as string)) + 1,
      pageSize: parseInt(limit as string),
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
