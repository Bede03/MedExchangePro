import { Router } from 'express';
import * as referralController from '../controllers/referral.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/auth';
import {
  createReferralSchema,
  updateReferralSchema,
} from '../schemas/validation';

const router = Router();

router.use(authMiddleware);

router.post('/', validateRequest(createReferralSchema), referralController.createReferral);
router.get('/', referralController.getReferralsByHospital);
router.get('/stats', referralController.getReferralStats);
router.get('/:id', referralController.getReferralById);
router.put('/:id/status', validateRequest(updateReferralSchema), referralController.updateReferralStatus);

export default router;
