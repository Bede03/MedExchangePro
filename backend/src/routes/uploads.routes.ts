import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req: Request, _file: any, cb: (error: Error | null, destination?: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: any, cb: (error: Error | null, filename?: string) => void) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${timestamp}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

router.use(authMiddleware);

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  const file = (req as any).file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

  return res.status(201).json({
    success: true,
    url: fileUrl,
    path: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
  });
});

export default router;
