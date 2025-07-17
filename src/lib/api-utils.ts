/**
 * Centralized error handling utilities for SIRTIS API endpoints
 */

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/**
 * Standard error codes used across the application
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN', 
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

/**
 * Standard HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  options: {
    message?: string;
    code?: string;
    details?: Record<string, unknown>;
  } = {}
): { response: ApiError; status: number } {
  return {
    response: {
      success: false,
      error,
      message: options.message,
      code: options.code,
      details: options.details
    },
    status
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  options: {
    message?: string;
    meta?: Record<string, unknown>;
  } = {}
): ApiSuccess<T> {
  return {
    success: true,
    data,
    message: options.message,
    meta: options.meta
  };
}

/**
 * Handle Prisma errors and convert them to standardized responses
 */
export function handlePrismaError(error: unknown): { response: ApiError; status: number } {
  // Prisma specific error handling
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    
    switch (prismaError.code) {
      case 'P2002':
        return createErrorResponse(
          'A record with this information already exists',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.DUPLICATE_ENTRY,
            message: 'Unique constraint violation'
          }
        );
      
      case 'P2025':
        return createErrorResponse(
          'Record not found',
          HttpStatus.NOT_FOUND,
          {
            code: ErrorCodes.NOT_FOUND,
            message: 'The requested record does not exist'
          }
        );
      
      case 'P2003':
        return createErrorResponse(
          'Foreign key constraint failed',
          HttpStatus.BAD_REQUEST,
          {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Referenced record does not exist'
          }
        );
      
      default:
        return createErrorResponse(
          'Database operation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            code: ErrorCodes.DATABASE_ERROR,
            message: prismaError.message
          }
        );
    }
  }

  // Generic error handling
  if (error instanceof Error) {
    return createErrorResponse(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: error.message
      }
    );
  }

  return createErrorResponse(
    'Unknown error occurred',
    HttpStatus.INTERNAL_SERVER_ERROR,
    {
      code: ErrorCodes.INTERNAL_SERVER_ERROR
    }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): string | null {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Log error with context information
 */
export function logError(
  error: unknown,
  context: {
    endpoint?: string;
    userId?: string;
    requestId?: string;
    additionalInfo?: Record<string, unknown>;
  } = {}
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${timestamp}] ERROR:`, {
    message: errorMessage,
    stack: errorStack,
    context,
    error
  });
}

/**
 * Wrapper for async API route handlers with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error, {
        endpoint: 'Unknown',
        additionalInfo: { args }
      });

      const { response, status } = handlePrismaError(error);
      return new Response(JSON.stringify(response), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
