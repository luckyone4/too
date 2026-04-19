/**
 * Response formatting utilities
 */

import { Response } from 'express';
import { ApiResponse, ResponseMeta } from '../types';
import { HTTP_STATUS } from '../config/constants';

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = HTTP_STATUS.OK,
  meta?: ResponseMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };
  res.status(statusCode).json(response);
}

/**
 * Send created response
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: ResponseMeta
): void {
  sendSuccess(res, data, HTTP_STATUS.CREATED, meta);
}

/**
 * Send no content response
 */
export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: Record<string, any>
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  sendSuccess(res, data, HTTP_STATUS.OK, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

/**
 * Send unauthorized error
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): void {
  sendError(
    res,
    'AUTH_UNAUTHORIZED',
    message,
    HTTP_STATUS.UNAUTHORIZED
  );
}

/**
 * Send forbidden error
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access denied'
): void {
  sendError(
    res,
    'AUTH_UNAUTHORIZED',
    message,
    HTTP_STATUS.FORBIDDEN
  );
}

/**
 * Send not found error
 */
export function sendNotFound(
  res: Response,
  resource: string = 'Resource'
): void {
  sendError(
    res,
    'RESOURCE_NOT_FOUND',
    `${resource} not found`,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Send validation error
 */
export function sendValidationError(
  res: Response,
  details: Record<string, string>
): void {
  sendError(
    res,
    'VALIDATION_ERROR',
    'Validation failed',
    HTTP_STATUS.BAD_REQUEST,
    details
  );
}

/**
 * Send internal error
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error'
): void {
  sendError(
    res,
    'INTERNAL_ERROR',
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}