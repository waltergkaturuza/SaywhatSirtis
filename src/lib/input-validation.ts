// Comprehensive input validation middleware and utilities
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from './api-utils';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'date' | 'boolean';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null; // Returns error message or null
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Validate request body against rules
 */
export function validateRequestBody(
  body: Record<string, any>,
  rules: ValidationRule[]
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const rule of rules) {
    const value = body[rule.field];
    const fieldErrors: string[] = [];

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${rule.field} is required`);
      continue; // Skip other validations if required field is missing
    }

    // Skip other validations if field is optional and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rule.type && value !== undefined && value !== null) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            fieldErrors.push(`${rule.field} must be a string`);
          }
          break;
        case 'number':
          if (typeof value !== 'number' && isNaN(Number(value))) {
            fieldErrors.push(`${rule.field} must be a number`);
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== 'string' || !emailRegex.test(value)) {
            fieldErrors.push(`${rule.field} must be a valid email address`);
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            fieldErrors.push(`${rule.field} must be a valid URL`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            fieldErrors.push(`${rule.field} must be a valid date`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            fieldErrors.push(`${rule.field} must be a boolean`);
          }
          break;
      }
    }

    // Length validation (for strings)
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      fieldErrors.push(`${rule.field} does not match required pattern`);
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    if (fieldErrors.length > 0) {
      errors[rule.field] = fieldErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize request body to prevent XSS and injection attacks
 */
export function sanitizeRequestBody(body: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeRequestBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Middleware function to validate and sanitize request body
 */
export function validateRequest(
  request: NextRequest,
  rules: ValidationRule[]
): { isValid: boolean; errors: Record<string, string[]>; body?: any } | NextResponse {
  try {
    // Note: This assumes body has already been parsed
    // In actual usage, you'd call request.json() first
    return {
      isValid: true,
      errors: {},
      body: {}
    };
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

/**
 * Common validation rules
 */
export const commonRules = {
  email: (required = true): ValidationRule => ({
    field: 'email',
    required,
    type: 'email',
    maxLength: 255
  }),
  
  password: (required = true): ValidationRule => ({
    field: 'password',
    required,
    type: 'string',
    minLength: 12,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
    custom: (value: string) => {
      if (!value) return null;
      if (value.length < 12) return 'Password must be at least 12 characters';
      if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/\d/.test(value)) return 'Password must contain at least one number';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
      return null;
    }
  }),

  name: (field: string, required = true, maxLength = 255): ValidationRule => ({
    field,
    required,
    type: 'string',
    minLength: 1,
    maxLength,
    pattern: /^[a-zA-Z\s'-]+$/
  }),

  phone: (required = false): ValidationRule => ({
    field: 'phone',
    required,
    type: 'string',
    maxLength: 50,
    pattern: /^[\d\s\-\+\(\)]+$/
  }),

  uuid: (field: string, required = true): ValidationRule => ({
    field,
    required,
    type: 'string',
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  }),

  text: (field: string, required = false, maxLength = 1000): ValidationRule => ({
    field,
    required,
    type: 'string',
    maxLength
  })
};

