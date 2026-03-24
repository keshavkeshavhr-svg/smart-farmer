import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many auth attempts, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many payment requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests, please slow down' } },
  standardHeaders: true,
  legacyHeaders: false,
});
