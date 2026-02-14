import { Request, Response, NextFunction } from 'express';

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request logging middleware
 * Logs all incoming requests with timing information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Add request ID to request object
  (req as any).requestId = generateRequestId();

  const startTime = Date.now();

  // Log request
  console.log({
    type: 'REQUEST',
    requestId: (req as any).requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  // Capture response
  const originalSend = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - startTime;

    console.log({
      type: 'RESPONSE',
      requestId: (req as any).requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Performance monitoring middleware
 * Warns about slow requests
 */
export const performanceMonitor = (threshold = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (duration > threshold) {
        console.warn({
          type: 'SLOW_REQUEST',
          requestId: (req as any).requestId,
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    next();
  };
};
