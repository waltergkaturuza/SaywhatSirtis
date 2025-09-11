/**
 * Utility functions for safe array operations
 */

/**
 * Ensures a value is an array, returning an empty array if not
 * This is more robust than the || [] fallback because it handles edge cases
 * where a value might be null, undefined, or a different type entirely
 */
export function ensureArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value
  }
  
  // Log warning for debugging purposes in development
  if (process.env.NODE_ENV === 'development' && value !== null && value !== undefined) {
    console.warn('ensureArray: Value is not an array:', typeof value, value)
  }
  
  return []
}

/**
 * Safe filter function that ensures the input is an array before filtering
 */
export function safeFilter<T>(value: any, predicate: (item: T) => boolean): T[] {
  const array = ensureArray<T>(value)
  return array.filter(predicate)
}

/**
 * Safe map function that ensures the input is an array before mapping
 */
export function safeMap<T, U>(value: any, mapper: (item: T, index: number) => U): U[] {
  const array = ensureArray<T>(value)
  return array.map(mapper)
}

/**
 * Safe reduce function that ensures the input is an array before reducing
 */
export function safeReduce<T, U>(
  value: any, 
  reducer: (acc: U, item: T, index: number) => U, 
  initialValue: U
): U {
  const array = ensureArray<T>(value)
  return array.reduce(reducer, initialValue)
}
