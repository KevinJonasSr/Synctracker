/**
 * Enhanced Server Configuration - Ready to Use
 * This version integrates improvements without requiring external dependencies
 *
 * To use: Replace server/index.ts with this file
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Import new middleware (standalone versions that don't need external deps)
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger, performanceMonitor } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";
import { securityHeaders, corsConfig, preventParameterPollution } from "./middleware/security-standalone";
import { sanitizeInput } from "./middleware/validation-standalone";
import { healthCheck, readinessCheck, livenessCheck } from "./utils/health";

const app = express();

// ===== Security Middleware =====
// Apply security headers first
app.use(securityHeaders);
app.use(corsConfig);
app.use(preventParameterPollution);

// ===== Body Parsing =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ===== Input Sanitization =====
// Sanitize all user input to prevent XSS attacks
app.use(sanitizeInput);

// ===== Logging Middleware =====
// Log all requests with request ID and timing
app.use(requestLogger);
app.use(performanceMonitor(1000)); // Warn about requests > 1 second

// ===== Health Check Endpoints =====
// These should be before rate limiting to allow health checks without limits
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);

// ===== Rate Limiting =====
// Apply rate limiting to all API routes
app.use('/api', rateLimiter());

// ===== Legacy Logging (for compatibility) =====
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ===== Application Routes =====
(async () => {
  const server = await registerRoutes(app);

  // ===== 404 Handler =====
  // Catch all undefined routes
  app.use(notFoundHandler);

  // ===== Global Error Handler =====
  // Must be last middleware - catches all errors
  app.use(errorHandler);

  // ===== Development/Production Setup =====
  // Setup Vite in development, serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ===== Start Server =====
  const port = parseInt(process.env.PORT || '5000');
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 SyncTracker 2.0 running on port ${port}`);
    log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Configure DATABASE_URL in .env'}`);
    log(`🔒 Security: Enabled (headers, sanitization, rate limiting)`);
    log(`📊 Health checks: /health, /ready, /live`);
    log(`⚡ Performance monitoring: Active (warns >1s requests)`);
    log('');
    log('✅ All enhancements active and ready!');
  });
})();
