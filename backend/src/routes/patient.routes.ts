import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/auth';
import {
  createPatientSchema,
  updatePatientSchema,
} from '../schemas/validation';

const router = Router();

router.use(authMiddleware);

router.post('/', validateRequest(createPatientSchema), patientController.createPatient);
router.get('/', patientController.getPatientsByHospital);
router.get('/search', patientController.searchPatients);
router.get('/:id/combined', patientController.getPatientWithExternalHistory);
router.get('/:id', patientController.getPatientById);
router.put('/:id', validateRequest(updatePatientSchema), patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

export default router;
