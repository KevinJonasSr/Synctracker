import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Basic HTML sanitization without DOMPurify
 * Removes basic HTML tags and script content
 */
function basicSanitize(value: string): string {
  if (typeof value !== 'string') return value;

  // Remove script tags and their content
  value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove basic HTML tags
  value = value.replace(/<[^>]*>/g, '');

  // Remove common XSS patterns
  value = value.replace(/javascript:/gi, '');
  value = value.replace(/on\w+\s*=/gi, '');

  return value;
}

/**
 * Validate request data against a Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
        });
      }
      next(error);
    }
  };
};

/**
 * Sanitize user input to prevent XSS attacks (basic version)
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return basicSanitize(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

  if (isNaN(page) || page < 1) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PAGE',
        message: 'Page must be a positive integer',
      },
    });
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 100',
      },
    });
  }

  next();
};

/**
 * Validate ID parameter
 */
export const validateId = (paramName = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params[paramName]);

    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: `${paramName} must be a valid positive integer`,
        },
      });
    }

    next();
  };
};

/**
 * Validate date range query parameters
 */
export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  if (startDate && isNaN(Date.parse(startDate as string))) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_START_DATE',
        message: 'startDate must be a valid date',
      },
    });
  }

  if (endDate && isNaN(Date.parse(endDate as string))) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_END_DATE',
        message: 'endDate must be a valid date',
      },
    });
  }

  if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE_RANGE',
        message: 'startDate must be before endDate',
      },
    });
  }

  next();
};
