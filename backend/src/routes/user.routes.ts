import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/auth';
import { updateUserSchema } from '../schemas/validation';

const router = Router();

router.use(authMiddleware);

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/my-hospital', userController.getUsersByHospital);
router.get('/:id', userController.getUserById);
router.put('/:id', validateRequest(updateUserSchema), userController.updateUser);
router.delete('/:id', requireAdmin, userController.deleteUser);

export default router;
