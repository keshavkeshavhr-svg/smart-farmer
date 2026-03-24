import { Router } from 'express';
import { getWeather } from './weather.controller';
import { authenticate } from '../../middleware/auth';

export const weatherRouter = Router();

weatherRouter.get('/', getWeather);
