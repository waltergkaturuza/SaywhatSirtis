// Enhanced error handling and connection management utilities
import { PrismaClient, Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code?: string
  status: number
  details?: any
}

export class DatabaseError extends Error {
  code: string
  status: number
  
  constructor(message: string, code: string = 'DATABASE_ERROR', status: number = 500) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'DatabaseError'
  }
}

export function handlePrismaError(error: any): { error: ApiError; status: number } {
  console.error('Prisma error:', error)

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          error: { message: 'A record with this data already exists', code: 'DUPLICATE_ENTRY', status: 409 },
          status: 409
        }
      case 'P2025':
        return {
          error: { message: 'Record not found', code: 'NOT_FOUND', status: 404 },
          status: 404
        }
      case 'P2003':
        return {
          error: { message: 'Foreign key constraint violation', code: 'CONSTRAINT_VIOLATION', status: 400 },
          status: 400
        }
      case 'P2021':
        return {
          error: { message: 'Table or column does not exist', code: 'SCHEMA_ERROR', status: 500 },
          status: 500
        }
      default:
        return {
          error: { message: 'Database operation failed', code: error.code, status: 500 },
          status: 500
        }
    }
  }

  // Handle connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      error: { message: 'Database connection failed', code: 'CONNECTION_ERROR', status: 503 },
      status: 503
    }
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      error: { message: 'Database panic error', code: 'PANIC_ERROR', status: 500 },
      status: 500
    }
  }

  // Handle validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: { message: 'Invalid data provided', code: 'VALIDATION_ERROR', status: 400 },
      status: 400
    }
  }

  // Handle generic errors
  if (error instanceof DatabaseError) {
    return {
      error: { message: error.message, code: error.code, status: error.status },
      status: error.status
    }
  }

  // Default error response
  return {
    error: { 
      message: error.message || 'Internal server error', 
      code: 'INTERNAL_ERROR', 
      status: 500,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    status: 500
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry validation errors or certain business logic errors
      if (error instanceof Prisma.PrismaClientValidationError ||
          (error instanceof Prisma.PrismaClientKnownRequestError && 
           ['P2002', 'P2025', 'P2003'].includes(error.code))) {
        throw error
      }
      
      // Retry on connection and prepared statement errors
      const isRetryable = 
        error?.code === '26000' || // prepared statement errors
        error?.code === '57P01' || // connection errors
        error?.message?.includes('prepared statement') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('ConnectorError')
      
      if (attempt < maxRetries && isRetryable) {
        console.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 1.5 // Exponential backoff
      } else if (attempt >= maxRetries || !isRetryable) {
        throw error
      }
    }
  }
  
  throw lastError
}

export function createErrorResponse(error: string | ApiError, status?: number): NextResponse {
  if (typeof error === 'string') {
    return NextResponse.json(
      { success: false, error: error },
      { status: status || 500 }
    )
  }
  
  return NextResponse.json(
    { success: false, error: error.message, code: error.code, details: error.details },
    { status: error.status }
  )
}

export function createSuccessResponse(data: any, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}
