/**
 * Utility functions for handling database responses and JSON serialization
 */

/**
 * Converts BigInt values to strings for JSON serialization
 * @param obj - Object that may contain BigInt values
 * @returns Object with BigInt values converted to strings
 */
export function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ))
}

/**
 * Safe JSON response wrapper that handles BigInt serialization
 * @param data - Data to serialize
 * @param status - HTTP status code (optional)
 * @returns NextResponse with properly serialized data
 */
export function createSafeJsonResponse(data: any, status?: number) {
  const { NextResponse } = require('next/server')
  
  try {
    // First try normal serialization
    return NextResponse.json(data, status ? { status } : undefined)
  } catch (error) {
    // If that fails due to BigInt, use safe serialization
    if (error instanceof TypeError && error.message.includes('BigInt')) {
      const safeData = serializeBigInt(data)
      return NextResponse.json(safeData, status ? { status } : undefined)
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Process Prisma query results to handle BigInt values
 * @param queryResult - Result from Prisma query
 * @returns Processed result safe for JSON serialization
 */
export function processPrismaResult(queryResult: any): any {
  if (Array.isArray(queryResult)) {
    return queryResult.map(row => serializeBigInt(row))
  }
  return serializeBigInt(queryResult)
}
