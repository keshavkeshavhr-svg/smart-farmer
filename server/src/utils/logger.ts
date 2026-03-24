import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.isDev ? 'debug' : 'info',
  redact: ['req.headers.authorization', 'req.body.password', 'req.body.passwordHash'],
  base: { service: 'smart-farmer-api' },
});
