import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getPresignedUrl } from './uploads.controller';
import { authenticate } from '../../middleware/auth';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, _file, cb) => cb(null, req.query.filename as string || `${Date.now()}-local.jpg`),
});
const upload = multer({ storage });

export const uploadsRouter = Router();

uploadsRouter.post('/presigned', authenticate, getPresignedUrl);

// Fallback endpoint if S3 is not configured
uploadsRouter.post('/local', authenticate, upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file?.filename}` });
});
