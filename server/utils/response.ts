import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Send a successful response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
export const sendCreated = <T>(res: Response, data: T): Response => {
  return sendSuccess(res, data, 201);
};

/**
 * Send a no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response => {
  return sendSuccess(res, data, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

/**
 * Parse pagination parameters from request query
 */
export const getPaginationParams = (query: any): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
