import { Request, Response } from 'express';
import { db } from '../db';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
    environment: {
      nodeEnv: string;
      nodeVersion: string;
    };
  };
}

/**
 * Check database connectivity
 */
const checkDatabase = async (): Promise<HealthStatus['checks']['database']> => {
  const startTime = Date.now();
  try {
    // Simple query to check database connectivity
    await db.execute('SELECT 1');
    const responseTime = Date.now() - startTime;
    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check memory usage
 */
const checkMemory = (): HealthStatus['checks']['memory'] => {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  const percentage = (used / total) * 100;

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentage > 90) {
    status = 'critical';
  } else if (percentage > 75) {
    status = 'warning';
  }

  return {
    status,
    used,
    total,
    percentage: Math.round(percentage * 100) / 100,
  };
};

/**
 * Health check endpoint handler
 */
export const healthCheck = async (req: Request, res: Response) => {
  const database = await checkDatabase();
  const memory = checkMemory();

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database,
      memory,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      },
    },
  };

  // Determine overall health status
  if (database.status === 'down' || memory.status === 'critical') {
    health.status = 'unhealthy';
  } else if (memory.status === 'warning') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
};

/**
 * Readiness probe - checks if the service is ready to accept traffic
 */
export const readinessCheck = async (req: Request, res: Response) => {
  const database = await checkDatabase();

  if (database.status === 'up') {
    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      reason: 'Database not available',
    });
  }
};

/**
 * Liveness probe - checks if the service is alive
 */
export const livenessCheck = (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
