import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../../server/utils/response';
import { Response } from 'express';

describe('Response Utilities', () => {
  describe('sendSuccess', () => {
    it('should send a successful response with data', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const data = { id: 1, name: 'Test' };
      sendSuccess(mockResponse, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send a successful response with custom status code', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const data = { id: 1 };
      sendSuccess(mockResponse, data, 201);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should include meta information when provided', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const data = [{ id: 1 }];
      const meta = { page: 1, limit: 10, total: 100, totalPages: 10 };
      sendSuccess(mockResponse, data, 200, meta);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta,
      });
    });
  });

  describe('sendError', () => {
    it('should send an error response', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      sendError(mockResponse, 404, 'NOT_FOUND', 'Resource not found');

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    });

    it('should include error details when provided', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const details = { field: 'email', issue: 'Invalid format' };
      sendError(mockResponse, 400, 'VALIDATION_ERROR', 'Validation failed', details);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    });
  });

  describe('getPaginationParams', () => {
    it('should return default pagination parameters', () => {
      const params = getPaginationParams({});

      expect(params).toEqual({
        page: 1,
        limit: 50,
        offset: 0,
      });
    });

    it('should parse valid pagination parameters', () => {
      const params = getPaginationParams({ page: '2', limit: '25' });

      expect(params).toEqual({
        page: 2,
        limit: 25,
        offset: 25,
      });
    });

    it('should limit maximum limit to 100', () => {
      const params = getPaginationParams({ limit: '200' });

      expect(params.limit).toBe(100);
    });

    it('should handle invalid page numbers', () => {
      const params = getPaginationParams({ page: '0' });

      expect(params.page).toBe(1);
    });

    it('should handle negative page numbers', () => {
      const params = getPaginationParams({ page: '-1' });

      expect(params.page).toBe(1);
    });

    it('should calculate correct offset', () => {
      const params = getPaginationParams({ page: '3', limit: '20' });

      expect(params.offset).toBe(40); // (3-1) * 20
    });
  });

  describe('sendPaginated', () => {
    it('should send paginated response with correct meta', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const data = [{ id: 1 }, { id: 2 }];
      sendPaginated(mockResponse, data, 1, 10, 25);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it('should calculate totalPages correctly', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      sendPaginated(mockResponse, [], 1, 10, 100);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            totalPages: 10,
          }),
        })
      );
    });
  });
});
