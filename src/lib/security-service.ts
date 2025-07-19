// Phase 4: Advanced Security Service
// Comprehensive security hardening for enterprise production

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

interface SecurityConfig {
  encryption: {
    algorithm: string
    keyLength: number
    ivLength: number
  }
  jwt: {
    secret: string
    expiresIn: string
    refreshExpiresIn: string
  }
  password: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number // days
  }
  session: {
    maxSessions: number
    idleTimeout: number // minutes
    absoluteTimeout: number // hours
  }
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
}

interface AuditLogEntry {
  userId: string
  action: string
  resource: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  success: boolean
  details?: Record<string, any>
}

interface SecurityViolation {
  type: 'brute_force' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress: string
  timestamp: Date
  description: string
  metadata: Record<string, any>
}

export class SecurityService {
  private config: SecurityConfig
  private encryptionKey: Buffer
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map()
  private activeSessions: Map<string, { userId: string; lastActivity: Date; ipAddress: string }> = new Map()

  constructor(config: SecurityConfig) {
    this.config = config
    this.encryptionKey = this.deriveKey(process.env.ENCRYPTION_KEY || 'default-key-change-in-production')
  }

  // Encryption and Decryption
  private deriveKey(password: string): Buffer {
    return crypto.pbkdf2Sync(password, 'sirtis-salt', 100000, 32, 'sha256')
  }

  encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(this.config.encryption.ivLength)
      const cipher = crypto.createCipher(this.config.encryption.algorithm, this.encryptionKey)
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return iv.toString('hex') + ':' + encrypted
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Encryption failed')
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const [ivHex, encrypted] = encryptedData.split(':')
      const iv = Buffer.from(ivHex, 'hex')
      const decipher = crypto.createDecipher(this.config.encryption.algorithm, this.encryptionKey)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Decryption failed')
    }
  }

  // Password Security
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
    score: number
  } {
    const errors: string[] = []
    let score = 0

    if (password.length < this.config.password.minLength) {
      errors.push(`Password must be at least ${this.config.password.minLength} characters long`)
    } else {
      score += 1
    }

    if (this.config.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    if (this.config.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    if (this.config.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    } else {
      score += 1
    }

    if (this.config.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    // Additional security checks
    if (password.length > 12) score += 1
    if (/[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1 // Multiple special chars
    if (!/(.)\1{2,}/.test(password)) score += 1 // No repeated characters

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 10)
    }
  }

  // JWT Token Management
  generateTokens(userId: string, payload: Record<string, any> = {}): {
    accessToken: string
    refreshToken: string
  } {
    const accessPayload = {
      userId,
      type: 'access',
      ...payload
    }

    const refreshPayload = {
      userId,
      type: 'refresh'
    }

    const accessToken = jwt.sign(accessPayload, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresIn
    } as jwt.SignOptions)

    const refreshToken = jwt.sign(refreshPayload, this.config.jwt.secret, {
      expiresIn: this.config.jwt.refreshExpiresIn
    } as jwt.SignOptions)

    return { accessToken, refreshToken }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwt.secret)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Session Management
  createSession(userId: string, ipAddress: string): string {
    const sessionId = crypto.randomUUID()
    
    // Check for existing sessions
    const userSessions = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)

    if (userSessions.length >= this.config.session.maxSessions) {
      // Remove oldest session
      const oldestSession = userSessions
        .sort(([_, a], [__, b]) => a.lastActivity.getTime() - b.lastActivity.getTime())[0]
      this.activeSessions.delete(oldestSession[0])
    }

    this.activeSessions.set(sessionId, {
      userId,
      lastActivity: new Date(),
      ipAddress
    })

    return sessionId
  }

  validateSession(sessionId: string, ipAddress: string): {
    isValid: boolean
    userId?: string
    reason?: string
  } {
    const session = this.activeSessions.get(sessionId)
    
    if (!session) {
      return { isValid: false, reason: 'Session not found' }
    }

    // Check IP address consistency
    if (session.ipAddress !== ipAddress) {
      this.logSecurityViolation({
        type: 'suspicious_activity',
        severity: 'medium',
        userId: session.userId,
        ipAddress,
        timestamp: new Date(),
        description: 'IP address mismatch for active session',
        metadata: { sessionId, originalIP: session.ipAddress, newIP: ipAddress }
      })
      return { isValid: false, reason: 'IP address mismatch' }
    }

    // Check idle timeout
    const idleTime = Date.now() - session.lastActivity.getTime()
    if (idleTime > this.config.session.idleTimeout * 60 * 1000) {
      this.activeSessions.delete(sessionId)
      return { isValid: false, reason: 'Session expired due to inactivity' }
    }

    // Update last activity
    session.lastActivity = new Date()
    
    return { isValid: true, userId: session.userId }
  }

  terminateSession(sessionId: string): void {
    this.activeSessions.delete(sessionId)
  }

  terminateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId)
      }
    }
  }

  // Brute Force Protection
  recordFailedAttempt(identifier: string): boolean {
    const now = new Date()
    const attempt = this.failedAttempts.get(identifier)

    if (attempt) {
      const timeDiff = now.getTime() - attempt.lastAttempt.getTime()
      
      // Reset counter if more than 15 minutes have passed
      if (timeDiff > 15 * 60 * 1000) {
        this.failedAttempts.set(identifier, { count: 1, lastAttempt: now })
        return false
      }

      attempt.count++
      attempt.lastAttempt = now

      // Lock account after 5 failed attempts
      if (attempt.count >= 5) {
        this.logSecurityViolation({
          type: 'brute_force',
          severity: 'high',
          ipAddress: identifier,
          timestamp: now,
          description: 'Multiple failed login attempts detected',
          metadata: { attemptCount: attempt.count }
        })
        return true // Account locked
      }
    } else {
      this.failedAttempts.set(identifier, { count: 1, lastAttempt: now })
    }

    return false
  }

  isAccountLocked(identifier: string): boolean {
    const attempt = this.failedAttempts.get(identifier)
    if (!attempt) return false

    const timeDiff = Date.now() - attempt.lastAttempt.getTime()
    return attempt.count >= 5 && timeDiff < 15 * 60 * 1000
  }

  clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier)
  }

  // Request Validation and Sanitization
  validateRequest(req: NextRequest): {
    isValid: boolean
    violations: string[]
  } {
    const violations: string[] = []

    // Check for common attack patterns
    const url = req.url.toLowerCase()
    const suspiciousPatterns = [
      /(\<script[^>]*\>)/i,
      /(javascript:)/i,
      /(on\w+\s*=)/i,
      /(\bunion\b.*\bselect\b)/i,
      /(\bselect\b.*\bfrom\b)/i,
      /(\.\.\/)/,
      /(\%2e\%2e\%2f)/i
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        violations.push(`Suspicious pattern detected in URL: ${pattern.source}`)
      }
    }

    // Check headers for suspicious content
    const userAgent = req.headers.get('user-agent') || ''
    if (userAgent.length === 0 || userAgent.length > 500) {
      violations.push('Invalid User-Agent header')
    }

    // Check for excessive header size
    const headerSize = Array.from(req.headers.entries())
      .reduce((size, [key, value]) => size + key.length + value.length, 0)
    
    if (headerSize > 8192) { // 8KB limit
      violations.push('Excessive header size')
    }

    return {
      isValid: violations.length === 0,
      violations
    }
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  // Audit Logging
  async logAuditEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // In production, this would write to a secure audit log database
      console.log('🔒 Audit Log:', JSON.stringify(entry, null, 2))
      
      // Here you would typically:
      // 1. Write to dedicated audit database
      // 2. Send to SIEM system
      // 3. Trigger alerts for critical events
    } catch (error) {
      console.error('Audit logging error:', error)
    }
  }

  // Security Violation Handling
  private logSecurityViolation(violation: SecurityViolation): void {
    console.warn('🚨 Security Violation:', JSON.stringify(violation, null, 2))
    
    // In production:
    // 1. Store in security incidents database
    // 2. Send alerts to security team
    // 3. Trigger automated responses based on severity
    // 4. Update threat intelligence feeds
  }

  // Data Classification and Protection
  classifyData(data: any): 'public' | 'internal' | 'confidential' | 'restricted' {
    // Implement data classification logic based on content
    const dataStr = JSON.stringify(data).toLowerCase()
    
    if (dataStr.includes('password') || dataStr.includes('ssn') || dataStr.includes('credit')) {
      return 'restricted'
    }
    
    if (dataStr.includes('email') || dataStr.includes('phone') || dataStr.includes('salary')) {
      return 'confidential'
    }
    
    if (dataStr.includes('employee') || dataStr.includes('project')) {
      return 'internal'
    }
    
    return 'public'
  }

  // Generate Security Report
  generateSecurityReport(): {
    activeSessions: number
    failedAttempts: number
    securityViolations: number
    recommendations: string[]
  } {
    const recommendations: string[] = []
    
    if (this.activeSessions.size > 100) {
      recommendations.push('High number of active sessions detected. Consider session cleanup.')
    }
    
    if (this.failedAttempts.size > 50) {
      recommendations.push('Multiple failed login attempts. Consider implementing CAPTCHA.')
    }

    return {
      activeSessions: this.activeSessions.size,
      failedAttempts: this.failedAttempts.size,
      securityViolations: 0, // Would be tracked in production
      recommendations
    }
  }
}

// Default security configuration
export const createSecurityService = (customConfig?: Partial<SecurityConfig>): SecurityService => {
  const defaultConfig: SecurityConfig = {
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
      expiresIn: '15m',
      refreshExpiresIn: '7d'
    },
    password: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90
    },
    session: {
      maxSessions: 5,
      idleTimeout: 30,
      absoluteTimeout: 8
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    }
  }

  const config = { ...defaultConfig, ...customConfig }
  return new SecurityService(config)
}

export const securityService = createSecurityService()
