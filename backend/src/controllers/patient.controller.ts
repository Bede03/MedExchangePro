import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';
import { auditService } from '../services/audit.service';
import { getClientIp, getUserAgent } from '../utils/helpers';

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await patientService.createPatient(req.body, req.user!.hospitalId);

    // Log audit
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await auditService.logAction(
      'Patient_Created',
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
    const patient = await patientService.getPatientById(req.params.id);

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
      'Patient_Updated',
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
      'Patient_Updated',
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
