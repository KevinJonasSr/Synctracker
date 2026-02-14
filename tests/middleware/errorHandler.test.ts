import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  errorHandler,
  asyncHandler,
} from '../../server/middleware/errorHandler';
import { ZodError } from 'zod';

describe('Error Handling Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      method: 'GET',
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(400, 'Test error', 'TEST_ERROR');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('AppError');
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with 404 status', () => {
      const error = new NotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an unauthorized error with 401 status', () => {
      const error = new UnauthorizedError();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(404, 'Not found', 'NOT_FOUND');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
          details: undefined,
        },
      });
    });

    it('should handle ZodError with validation details', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ]);

      errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            {
              field: 'name',
              message: 'Expected string, received number',
            },
          ],
        },
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
          }),
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async functions', async () => {
      const asyncFn = vi.fn().mockResolvedValue('success');
      const handler = asyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors from async functions', async () => {
      const error = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      const handler = asyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
