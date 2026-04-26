import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';
import { auditService } from '../services/audit.service';
import { externalMysqlService } from '../services/external-mysql.service.js';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await patientService.createPatient(req.body, req.user!.hospitalId);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      patient.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { name: patient.name }
    );

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await patientService.getPatientById(req.params.id, req.user!.hospitalId);

    res.json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientWithExternalHistory = async (req: Request, res: Response) => {
  try {
    const patient = await patientService.getPatientById(req.params.id, req.user!.hospitalId);
    
    // Only fetch external history from CHUK MySQL if patient is NOT from KFH
    // (KFH patients already have their medical history from Oracle in patientService)
    const isKFHPatient = patient.hospital?.name?.toLowerCase().includes('king faisal');
    let externalHistory = null;
    
    if (!isKFHPatient) {
      externalHistory = await externalMysqlService.getPatientRecordsByNationalId(patient.nationalId);
    }

    res.json({
      success: true,
      data: {
        patient,
        externalHistory,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientsByHospital = async (req: Request, res: Response) => {
  try {
    const patients = await patientService.getPatientsByHospital(req.user!.hospitalId);

    res.json({
      success: true,
      data: patients,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const patient = await patientService.updatePatient(
      req.params.id,
      req.body,
      req.user!
    );

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      req.body
    );

    res.json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    await patientService.deletePatient(req.params.id, req.user!);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Data_Accessed',
      'Patient',
      req.params.id,
      req.user!.id,
      ipAddress,
      userAgent,
      { action: 'deleted' }
    );

    res.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchPatients = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const patients = await patientService.searchPatients(query, req.user!.hospitalId);

    res.json({
      success: true,
      data: patients,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
