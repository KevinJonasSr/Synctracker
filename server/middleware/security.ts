import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Helmet security headers configuration
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for React
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

/**
 * CORS configuration middleware
 */
export const corsConfig = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5000',
    'http://localhost:5173', // Vite dev server
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

/**
 * Request size limiter
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760'); // 10MB default

  let size = 0;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxSize) {
      res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request entity too large',
        },
      });
      req.pause();
    }
  });

  next();
};

/**
 * Security headers for file downloads
 */
export const fileDownloadHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Download-Options', 'noopen');
  next();
};

/**
 * Prevent parameter pollution
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  // Convert array query parameters to single values (take last one)
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = (req.query[key] as string[]).pop();
    }
  }
  next();
};
