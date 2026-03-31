import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', auditController.getAuditLogsByHospital);
router.get('/admin/all', auditController.getAuditLogs);
router.get('/admin/filter', auditController.filterAuditLogs);
router.get('/admin/actions', auditController.getDistinctActions);
router.get('/admin/paginated', auditController.getAuditLogsWithCount);

export default router;
