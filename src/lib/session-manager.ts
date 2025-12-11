// Session Management Service
// Handles active session tracking, device management, and session limits

import { prisma } from '@/lib/prisma';
import { getClientIP } from '@/lib/production-helpers';
import AuditLogger from '@/lib/audit-logger';

export interface SessionInfo {
  id: string;
  sessionToken: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export interface DeviceInfo {
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
}

const MAX_CONCURRENT_SESSIONS = 5;
const IDLE_TIMEOUT_MINUTES = 30;
const ABSOLUTE_TIMEOUT_HOURS = 8;

/**
 * Parse user agent to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  if (ua.includes('mobile') || ua.includes('android')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  } else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) {
    deviceType = 'desktop';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  // Generate device name
  const deviceName = `${os} - ${browser}`;

  return { deviceName, deviceType, browser, os };
}

/**
 * Create or update a session record
 */
export async function createOrUpdateSession(
  userId: string,
  sessionToken: string,
  userAgent: string,
  ipAddress: string,
  expiresAt: Date
): Promise<void> {
  const deviceInfo = parseUserAgent(userAgent);
  const now = new Date();

  // Check for existing session with same token
  const existing = await prisma.user_sessions.findUnique({
    where: { sessionToken }
  });

  if (existing) {
    // Update existing session
    await prisma.user_sessions.update({
      where: { sessionToken },
      data: {
        lastActivity: now,
        ipAddress,
        expiresAt
      }
    });
  } else {
    // Check concurrent session limit
    const activeSessions = await prisma.user_sessions.count({
      where: {
        userId,
        expiresAt: { gt: now }
      }
    });

    if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
      // Revoke oldest session
      const oldestSession = await prisma.user_sessions.findFirst({
        where: {
          userId,
          expiresAt: { gt: now }
        },
        orderBy: { lastActivity: 'asc' }
      });

      if (oldestSession) {
        await prisma.user_sessions.delete({
          where: { id: oldestSession.id }
        });

        await AuditLogger.logSecurityEvent(
          'SESSION_REVOKED',
          {
            userId,
            reason: 'Concurrent session limit exceeded',
            sessionId: oldestSession.id,
            deviceName: oldestSession.deviceName
          },
          userId,
          oldestSession.ipAddress,
          oldestSession.userAgent
        );
      }
    }

    // Create new session
    await prisma.user_sessions.create({
      data: {
        id: crypto.randomUUID(),
        sessionToken,
        userId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        userAgent,
        ipAddress,
        createdAt: now,
        lastActivity: now,
        expiresAt
      }
    });

    await AuditLogger.logSecurityEvent(
      'SESSION_CREATED',
      {
        userId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        ipAddress
      },
      userId,
      ipAddress,
      userAgent
    );
  }
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  await prisma.user_sessions.updateMany({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() }
    },
    data: {
      lastActivity: new Date()
    }
  });
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(
  userId: string,
  currentSessionToken?: string
): Promise<SessionInfo[]> {
  const now = new Date();
  
  const sessions = await prisma.user_sessions.findMany({
    where: {
      userId,
      expiresAt: { gt: now }
    },
    orderBy: { lastActivity: 'desc' }
  });

  return sessions.map(session => ({
    id: session.id,
    sessionToken: session.sessionToken,
    userId: session.userId,
    deviceName: session.deviceName,
    deviceType: session.deviceType as 'desktop' | 'mobile' | 'tablet' | 'unknown',
    browser: session.browser,
    os: session.os,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    expiresAt: session.expiresAt,
    isCurrent: session.sessionToken === currentSessionToken
  }));
}

/**
 * Revoke a specific session
 */
export async function revokeSession(
  sessionId: string,
  userId: string,
  currentUserId: string,
  ipAddress: string,
  userAgent: string
): Promise<boolean> {
  const session = await prisma.user_sessions.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    return false;
  }

  // Only allow users to revoke their own sessions (or admins)
  if (session.userId !== userId && userId !== currentUserId) {
    return false;
  }

  await prisma.user_sessions.delete({
    where: { id: sessionId }
  });

  await AuditLogger.logSecurityEvent(
    'SESSION_REVOKED',
    {
      userId: session.userId,
      sessionId,
      deviceName: session.deviceName,
      revokedBy: currentUserId,
      reason: 'Manual revocation'
    },
    currentUserId,
    ipAddress,
    userAgent
  );

  return true;
}

/**
 * Revoke all sessions for a user (except current)
 */
export async function revokeAllSessions(
  userId: string,
  currentSessionToken: string,
  ipAddress: string,
  userAgent: string
): Promise<number> {
  const result = await prisma.user_sessions.deleteMany({
    where: {
      userId,
      sessionToken: { not: currentSessionToken }
    }
  });

  await AuditLogger.logSecurityEvent(
    'ALL_SESSIONS_REVOKED',
    {
      userId,
      sessionsRevoked: result.count,
      reason: 'Logout from all devices'
    },
    userId,
    ipAddress,
    userAgent
  );

  return result.count;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date();
  const result = await prisma.user_sessions.deleteMany({
    where: {
      expiresAt: { lte: now }
    }
  });

  return result.count;
}

/**
 * Check if session is idle (exceeded idle timeout)
 */
export async function checkSessionIdle(sessionToken: string): Promise<boolean> {
  const session = await prisma.user_sessions.findUnique({
    where: { sessionToken }
  });

  if (!session) {
    return true; // Session doesn't exist, consider it idle
  }

  const now = new Date();
  const idleTimeout = new Date(session.lastActivity.getTime() + IDLE_TIMEOUT_MINUTES * 60 * 1000);

  return now > idleTimeout;
}

/**
 * Check if session exceeded absolute timeout
 */
export async function checkSessionAbsoluteTimeout(sessionToken: string): Promise<boolean> {
  const session = await prisma.user_sessions.findUnique({
    where: { sessionToken }
  });

  if (!session) {
    return true;
  }

  const now = new Date();
  const absoluteTimeout = new Date(session.createdAt.getTime() + ABSOLUTE_TIMEOUT_HOURS * 60 * 60 * 1000);

  return now > absoluteTimeout;
}

