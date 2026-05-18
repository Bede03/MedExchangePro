import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', transferController.createTransfer);
router.get('/', transferController.getTransfersByHospital);
router.get('/stats', transferController.getTransferStats);
router.get('/:id', transferController.getTransferById);
router.put('/:id/status', transferController.updateTransferStatus);
router.delete('/:id', transferController.deleteTransfer);

export default router;
