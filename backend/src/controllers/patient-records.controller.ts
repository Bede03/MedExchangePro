import { Request, Response } from 'express';
import { patientRecordsService } from '../services/patient-records.service';
import { auditService } from '../services/audit.service';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const sharePatientRecords = async (req: Request, res: Response) => {
  try {
    const sharedRecord = await patientRecordsService.sharePatientRecords(req.body, req.user!);

    // Log audit - Data shared
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      sharedRecord.patientId,
      req.user!.id,
      ipAddress,
      userAgent,
      {
        action: 'Patient records shared',
        patientId: sharedRecord.patientId,
        receivingHospitalId: sharedRecord.receivingHospitalId,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Patient records shared successfully',
      data: sharedRecord,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSharedRecordsByHospital = async (req: Request, res: Response) => {
  try {
    const sharedRecords = await patientRecordsService.getSharedRecordsByHospital(
      req.user!.hospitalId,
      req.user!
    );

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      'multiple',
      req.user!.id,
      ipAddress,
      userAgent,
      {
        action: 'Viewed shared patient records list',
        recordCount: sharedRecords.length,
      }
    );

    res.json({
      success: true,
      data: sharedRecords,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSharedRecordByReferral = async (req: Request, res: Response) => {
  try {
    const sharedRecord = await patientRecordsService.getSharedRecordByReferral(
      req.params.referralId,
      req.user!
    );

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      sharedRecord.id,
      req.user!.id,
      ipAddress,
      userAgent,
      {
        patientName: sharedRecord.patient.name,
        referralId: req.params.referralId,
      }
    );

    res.json({
      success: true,
      data: sharedRecord,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientRecords = async (req: Request, res: Response) => {
  try {
    const records = await patientRecordsService.getPatientRecordDetails(
      req.params.patientId,
      req.user!
    );

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      req.params.patientId,
      req.user!.id,
      ipAddress,
      userAgent,
      {
        action: 'Accessed patient records',
      }
    );

    res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
