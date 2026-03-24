import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getCrops, getCropById, createCrop, updateCrop, deleteCrop, getMycrops } from './crops.controller';
import { authenticate, authorize } from '../../middleware/auth';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

export const cropsRouter = Router();

cropsRouter.get('/', getCrops);
cropsRouter.get('/my', authenticate, authorize('FARMER'), getMycrops);
cropsRouter.get('/:id', getCropById);
cropsRouter.post('/', authenticate, authorize('FARMER'), upload.array('images', 5), createCrop);
cropsRouter.patch('/:id', authenticate, updateCrop);
cropsRouter.delete('/:id', authenticate, deleteCrop);
