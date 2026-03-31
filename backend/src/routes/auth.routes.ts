import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRequest, authMiddleware } from '../middleware/auth.js';
import { loginSchema, signupSchema } from '../schemas/validation.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/signup', validateRequest(signupSchema), authController.signup);
router.get('/verify', authMiddleware, authController.verifyToken);

export default router;
