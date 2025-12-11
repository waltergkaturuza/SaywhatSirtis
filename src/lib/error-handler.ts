// Comprehensive error handling for production
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export interface ErrorDetails {
  code?: string;
  message: string;
  field?: string;
  value?: any;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: ErrorDetails,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standard error response format
export interface StandardErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: ErrorDetails[];
    timestamp: string;
    path?: string;
  };
}

/**
 * Handle Prisma errors and convert to standard format
 */
export function handlePrismaError(error: unknown): { status: number; response: StandardErrorResponse } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          status: 409,
          response: {
            success: false,
            error: {
              message: 'A record with this information already exists',
              code: 'DUPLICATE_ENTRY',
              timestamp: new Date().toISOString()
            }
          }
        };

      case 'P2025':
        return {
          status: 404,
          response: {
            success: false,
            error: {
              message: 'Record not found',
              code: 'NOT_FOUND',
              timestamp: new Date().toISOString()
            }
          }
        };

      case 'P2003':
        return {
          status: 400,
          response: {
            success: false,
            error: {
              message: 'Invalid reference data provided',
              code: 'FOREIGN_KEY_CONSTRAINT',
              timestamp: new Date().toISOString()
            }
          }
        };

      case 'P2014':
        return {
          status: 400,
          response: {
            success: false,
            error: {
              message: 'Invalid ID provided',
              code: 'INVALID_ID',
              timestamp: new Date().toISOString()
            }
          }
        };

      case 'P2021':
        return {
          status: 500,
          response: {
            success: false,
            error: {
              message: 'Database table does not exist',
              code: 'TABLE_NOT_FOUND',
              timestamp: new Date().toISOString()
            }
          }
        };

      case 'P2024':
        return {
          status: 503,
          response: {
            success: false,
            error: {
              message: 'Database connection timeout. Please try again later.',
              code: 'CONNECTION_TIMEOUT',
              timestamp: new Date().toISOString()
            }
          }
        };

      default:
        return {
          status: 500,
          response: {
            success: false,
            error: {
              message: 'Database operation failed',
              code: 'DATABASE_ERROR',
              timestamp: new Date().toISOString()
            }
          }
        };
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      response: {
        success: false,
        error: {
          message: 'Database connection unavailable. Please try again later.',
          code: 'DATABASE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      response: {
        success: false,
        error: {
          message: 'Invalid data provided',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  // Generic Prisma error
  return {
    status: 500,
    response: {
      success: false,
      error: {
        message: 'Database error occurred',
        code: 'DATABASE_ERROR',
        timestamp: new Date().toISOString()
      }
    }
  };
}

/**
 * Handle application errors
 */
export function handleAppError(error: unknown, path?: string): { status: number; response: StandardErrorResponse } {
  // Handle custom AppError
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      response: {
        success: false,
        error: {
          message: error.message,
          code: error.details?.code,
          details: error.details ? [error.details] : undefined,
          timestamp: new Date().toISOString(),
          path
        }
      }
    };
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientValidationError) {
    const result = handlePrismaError(error);
    if (path) {
      result.response.error.path = path;
    }
    return result;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment ? error.message : 'An unexpected error occurred';

    return {
      status: 500,
      response: {
        success: false,
        error: {
          message,
          code: 'INTERNAL_SERVER_ERROR',
          timestamp: new Date().toISOString(),
          path
        }
      }
    };
  }

  // Handle unknown errors
  return {
    status: 500,
    response: {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        path
      }
    }
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: unknown,
  path?: string,
  logError: boolean = true
): NextResponse {
  const { status, response } = handleAppError(error, path);

  // Log error server-side (never expose to client)
  if (logError) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[${status}] Error in ${path || 'unknown'}:`, {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json(response, { status });
}

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      const path = new URL(request.url).pathname;
      return createErrorResponse(error, path);
    }
  };
}

/**
 * Validation error creator
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: any
): AppError {
  return new AppError(
    400,
    message,
    {
      code: 'VALIDATION_ERROR',
      message,
      field,
      value
    }
  );
}

/**
 * Authentication error creator
 */
export function createAuthError(message: string = 'Authentication required'): AppError {
  return new AppError(
    401,
    message,
    {
      code: 'UNAUTHORIZED',
      message
    }
  );
}

/**
 * Authorization error creator
 */
export function createForbiddenError(message: string = 'Insufficient permissions'): AppError {
  return new AppError(
    403,
    message,
    {
      code: 'FORBIDDEN',
      message
    }
  );
}

/**
 * Not found error creator
 */
export function createNotFoundError(resource: string = 'Resource'): AppError {
  return new AppError(
    404,
    `${resource} not found`,
    {
      code: 'NOT_FOUND',
      message: `${resource} not found`
    }
  );
}

/**
 * Rate limit error creator
 */
export function createRateLimitError(message: string = 'Too many requests'): AppError {
  return new AppError(
    429,
    message,
    {
      code: 'RATE_LIMIT_EXCEEDED',
      message
    }
  );
}

