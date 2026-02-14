import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware (standalone version without helmet)
 * This provides basic security headers without external dependencies
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:;"
  );

  next();
};

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
