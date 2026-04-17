import { Router } from 'express';
import { externalMysqlService } from '../services/external-mysql.service.js';

const router = Router();

router.get('/patients/:nationalId', async (req, res, next) => {
  try {
    const nationalId = String(req.params.nationalId);
    const data = await externalMysqlService.getPatientRecordsByNationalId(nationalId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/hospitals', async (req, res, next) => {
  try {
    const data = await externalMysqlService.getHospitalLookup();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
