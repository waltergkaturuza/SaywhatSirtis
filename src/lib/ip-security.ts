// IP Whitelisting and Blacklisting Service
// Manages IP-based access control for enhanced security

import { prisma } from '@/lib/prisma';
import { getClientIP } from '@/lib/production-helpers';
import AuditLogger from '@/lib/audit-logger';

export interface IPRule {
  id: string;
  ipAddress: string;
  type: 'whitelist' | 'blacklist';
  userId?: string; // For user-specific rules
  role?: string; // For role-based rules
  reason?: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

/**
 * Check if IP is whitelisted for a user/role
 */
export async function isIPWhitelisted(
  ipAddress: string,
  userId?: string,
  role?: string
): Promise<boolean> {
  const now = new Date();

  // Check user-specific whitelist
  if (userId) {
    const userRule = await prisma.ip_rules.findFirst({
      where: {
        ipAddress,
        type: 'whitelist',
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    });

    if (userRule) {
      return true;
    }
  }

  // Check role-based whitelist
  if (role) {
    const roleRule = await prisma.ip_rules.findFirst({
      where: {
        ipAddress,
        type: 'whitelist',
        role,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    });

    if (roleRule) {
      return true;
    }
  }

  // Check global whitelist (no userId or role)
  const globalRule = await prisma.ip_rules.findFirst({
    where: {
      ipAddress,
      type: 'whitelist',
      userId: null,
      role: null,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    }
  });

  return !!globalRule;
}

/**
 * Check if IP is blacklisted
 */
export async function isIPBlacklisted(ipAddress: string): Promise<boolean> {
  const now = new Date();

  const blacklistRule = await prisma.ip_rules.findFirst({
    where: {
      ipAddress,
      type: 'blacklist',
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    }
  });

  return !!blacklistRule;
}

/**
 * Add IP to whitelist
 */
export async function addToWhitelist(
  ipAddress: string,
  userId?: string,
  role?: string,
  reason?: string,
  expiresAt?: Date,
  addedBy?: string
): Promise<void> {
  // Remove any existing blacklist rule for this IP
  await prisma.ip_rules.deleteMany({
    where: {
      ipAddress,
      type: 'blacklist'
    }
  });

  // Create or update whitelist rule
  await prisma.ip_rules.upsert({
    where: {
      ipAddress_type_userId_role: {
        ipAddress,
        type: 'whitelist',
        userId: userId || '',
        role: role || ''
      }
    },
    create: {
      id: crypto.randomUUID(),
      ipAddress,
      type: 'whitelist',
      userId: userId || null,
      role: role || null,
      reason: reason || 'Manual whitelist',
      expiresAt: expiresAt || null,
      isActive: true,
      createdAt: new Date()
    },
    update: {
      isActive: true,
      reason: reason || undefined,
      expiresAt: expiresAt || undefined
    }
  });

  if (addedBy) {
    await AuditLogger.logSecurityEvent(
      'IP_WHITELISTED',
      {
        ipAddress,
        userId,
        role,
        reason,
        addedBy
      },
      addedBy,
      ipAddress,
      'system'
    );
  }
}

/**
 * Add IP to blacklist
 */
export async function addToBlacklist(
  ipAddress: string,
  reason: string,
  expiresAt?: Date,
  addedBy?: string
): Promise<void> {
  // Remove any existing whitelist rules for this IP
  await prisma.ip_rules.deleteMany({
    where: {
      ipAddress,
      type: 'whitelist'
    }
  });

  // Create or update blacklist rule
  await prisma.ip_rules.upsert({
    where: {
      ipAddress_type_userId_role: {
        ipAddress,
        type: 'blacklist',
        userId: '',
        role: ''
      }
    },
    create: {
      id: crypto.randomUUID(),
      ipAddress,
      type: 'blacklist',
      userId: null,
      role: null,
      reason,
      expiresAt: expiresAt || null,
      isActive: true,
      createdAt: new Date()
    },
    update: {
      isActive: true,
      reason,
      expiresAt: expiresAt || undefined
    }
  });

  if (addedBy) {
    await AuditLogger.logSecurityEvent(
      'IP_BLACKLISTED',
      {
        ipAddress,
        reason,
        addedBy
      },
      addedBy,
      ipAddress,
      'system'
    );
  }
}

/**
 * Remove IP from whitelist/blacklist
 */
export async function removeIPRule(
  ruleId: string,
  removedBy?: string
): Promise<boolean> {
  const rule = await prisma.ip_rules.findUnique({
    where: { id: ruleId }
  });

  if (!rule) {
    return false;
  }

  await prisma.ip_rules.delete({
    where: { id: ruleId }
  });

  if (removedBy) {
    await AuditLogger.logSecurityEvent(
      'IP_RULE_REMOVED',
      {
        ipAddress: rule.ipAddress,
        type: rule.type,
        ruleId
      },
      removedBy,
      rule.ipAddress,
      'system'
    );
  }

  return true;
}

/**
 * Get all IP rules
 */
export async function getAllIPRules(
  type?: 'whitelist' | 'blacklist',
  userId?: string
): Promise<IPRule[]> {
  const rules = await prisma.ip_rules.findMany({
    where: {
      ...(type && { type }),
      ...(userId && { userId }),
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return rules.map(rule => ({
    id: rule.id,
    ipAddress: rule.ipAddress,
    type: rule.type as 'whitelist' | 'blacklist',
    userId: rule.userId || undefined,
    role: rule.role || undefined,
    reason: rule.reason || undefined,
    createdAt: rule.createdAt,
    expiresAt: rule.expiresAt || undefined,
    isActive: rule.isActive
  }));
}

/**
 * Validate IP access (check both whitelist and blacklist)
 */
export async function validateIPAccess(
  ipAddress: string,
  userId?: string,
  role?: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check blacklist first (highest priority)
  if (await isIPBlacklisted(ipAddress)) {
    return {
      allowed: false,
      reason: 'IP address is blacklisted'
    };
  }

  // For admin roles, check whitelist if enabled
  if (role && ['SYSTEM_ADMINISTRATOR', 'ADMIN'].includes(role)) {
    // Check if admin IP whitelisting is enabled
    const adminWhitelistEnabled = process.env.ENABLE_ADMIN_IP_WHITELIST === 'true';
    
    if (adminWhitelistEnabled) {
      const isWhitelisted = await isIPWhitelisted(ipAddress, userId, role);
      if (!isWhitelisted) {
        return {
          allowed: false,
          reason: 'Admin IP whitelist is enabled and this IP is not whitelisted'
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Clean up expired IP rules
 */
export async function cleanupExpiredIPRules(): Promise<number> {
  const now = new Date();
  const result = await prisma.ip_rules.deleteMany({
    where: {
      expiresAt: { lte: now },
      isActive: true
    }
  });

  return result.count;
}

