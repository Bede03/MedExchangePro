import { Router } from 'express';
import { kfhOracleService } from '../services/kfh-oracle.service.js';

const router = Router();

// Get all patients
router.get('/patients', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getPatients(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get patient by ID
router.get('/patients/id/:patientId', async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const data = await kfhOracleService.getPatientById(patientId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get patient by national ID
router.get('/patients/:nationalId', async (req, res, next) => {
  try {
    const nationalId = String(req.params.nationalId);
    const data = await kfhOracleService.getPatientByNationalId(nationalId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get patient records by national ID (with visits and referrals)
router.get('/patient-records/:nationalId', async (req, res, next) => {
  try {
    const nationalId = String(req.params.nationalId);
    const data = await kfhOracleService.getPatientRecordsByNationalId(nationalId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all staff
router.get('/staff', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getStaff(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get staff by ID
router.get('/staff/:staffId', async (req, res, next) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const data = await kfhOracleService.getStaffById(staffId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all visits
router.get('/visits', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getVisits(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get visit by ID
router.get('/visits/:visitId', async (req, res, next) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const data = await kfhOracleService.getVisitById(visitId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get visits by patient ID
router.get('/visits/patient/:patientId', async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const data = await kfhOracleService.getVisitsByPatientId(patientId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all encounters
router.get('/encounters', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getEncounters(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get encounters by visit ID
router.get('/encounters/visit/:visitId', async (req, res, next) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const data = await kfhOracleService.getEncountersByVisitId(visitId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all departments
router.get('/departments', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getDepartments(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all wards
router.get('/wards', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getWards(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all beds
router.get('/beds', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getBeds(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get all referrals
router.get('/referrals', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await kfhOracleService.getReferrals(limit);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get referrals by patient ID
router.get('/referrals/patient/:patientId', async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const data = await kfhOracleService.getReferralsByPatientId(patientId);
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

// Get hospital info
router.get('/hospital', async (req, res, next) => {
  try {
    const data = await kfhOracleService.getHospitalInfo();
    res.json({ success: true, data, source: 'KFH Oracle' });
  } catch (error) {
    next(error);
  }
});

export default router;