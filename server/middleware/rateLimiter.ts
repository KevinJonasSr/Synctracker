import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */
export const rateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
} = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
  } = options;

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP address as the key (in production, consider using user ID)
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    store[key].count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    // Check if limit exceeded
    if (store[key].count > max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: new Date(store[key].resetTime).toISOString(),
        },
      });
    }

    // If skipSuccessfulRequests is enabled, decrement on successful response
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          store[key].count--;
        }
      });
    }

    next();
  };
};

/**
 * Stricter rate limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many attempts, please try again later',
});

/**
 * More lenient rate limiter for read operations
 */
export const readRateLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skipSuccessfulRequests: true,
});
