import { Router } from 'express';
import * as hospitalController from '../controllers/hospital.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/auth';
import {
  createHospitalSchema,
  updateHospitalSchema,
} from '../schemas/validation';

const router = Router();

router.get('/', hospitalController.getAllHospitals);
router.get('/:id', hospitalController.getHospitalById);

router.use(authMiddleware);
router.post('/', requireAdmin, validateRequest(createHospitalSchema), hospitalController.createHospital);
router.put('/:id', requireAdmin, validateRequest(updateHospitalSchema), hospitalController.updateHospital);
router.delete('/:id', requireAdmin, hospitalController.deleteHospital);

export default router;
