import { Router } from 'express';
import * as patientRecordsController from '../controllers/patient-records.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/auth';
import { sharePatientRecordsSchema } from '../schemas/validation';

const router = Router();

router.use(authMiddleware);

/**
 * POST /api/patient-records/share
 * Share patient medical records with receiving hospital (for approved referrals)
 * Auth: Requesting hospital clinician/admin
 */
router.post(
  '/share',
  validateRequest(sharePatientRecordsSchema),
  patientRecordsController.sharePatientRecords
);

/**
 * GET /api/patient-records/shared
 * Get all shared patient records for receiving hospital
 * Auth: Receiving hospital clinician/admin
 */
router.get('/shared', patientRecordsController.getSharedRecordsByHospital);

/**
 * GET /api/patient-records/referral/:referralId
 * Get shared patient records for specific referral
 * Auth: Receiving hospital or requesting hospital
 */
router.get('/referral/:referralId', patientRecordsController.getSharedRecordByReferral);

/**
 * GET /api/patient-records/:patientId
 * Get patient record details (basic info)
 * Auth: Patient's hospital only
 */
router.get('/:patientId', patientRecordsController.getPatientRecords);

export default router;
