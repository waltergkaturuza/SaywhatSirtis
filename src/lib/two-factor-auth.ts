// Two-Factor Authentication (2FA) Service
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Configure OTP
authenticator.options = {
  step: 30, // 30-second time windows
  window: [1, 1], // Allow 1 step before/after current time
};

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: boolean;
}

/**
 * Generate a secret for a user
 */
export function generateSecret(email: string): string {
  return authenticator.generateSecret();
}

/**
 * Generate QR code URL for authenticator apps
 */
export async function generateQRCode(secret: string, email: string, issuer: string = 'SAYWHAT SIRTIS'): Promise<string> {
  const otpAuthUrl = authenticator.keyuri(email, issuer, secret);
  
  try {
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate backup codes (8 codes, 8 characters each)
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash backup codes for storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const crypto = await import('crypto');
  return codes.map(code => {
    return crypto.createHash('sha256').update(code).digest('hex');
  });
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
  const crypto = await import('crypto');
  const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
  return hashedCodes.includes(hashedCode);
}

/**
 * Setup 2FA for a user
 */
export async function setupTwoFactor(userId: string, email: string): Promise<TwoFactorSetup> {
  const secret = generateSecret(email);
  const qrCodeUrl = await generateQRCode(secret, email);
  const backupCodes = generateBackupCodes();

  // Hash backup codes for storage
  const hashedBackupCodes = await hashBackupCodes(backupCodes);

  // Store in database (you'll need to add a twoFactorAuth table or extend users table)
  // For now, we'll return the setup data
  // In production, store: secret, hashedBackupCodes, enabled: false (until verified)

  return {
    secret,
    qrCodeUrl,
    backupCodes // Return plain codes to user (they should save these)
  };
}

/**
 * Verify 2FA token
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
}

/**
 * Enable 2FA for user (after they verify with a token)
 */
export async function enableTwoFactor(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<void> {
  const hashedBackupCodes = await hashBackupCodes(backupCodes);

  // Store in database
  await prisma.users.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedBackupCodes,
      twoFactorEnabled: true
    }
  });
}

/**
 * Disable 2FA for user
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.users.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      twoFactorEnabled: false
    }
  });
}

/**
 * Check if user has 2FA enabled
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true }
  });
  return user?.twoFactorEnabled || false;
}

/**
 * Get user's 2FA secret (for verification during setup)
 */
export async function getUserTwoFactorSecret(userId: string): Promise<string | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true }
  });
  return user?.twoFactorSecret || null;
}

/**
 * Get user's backup codes (hashed)
 */
export async function getUserBackupCodes(userId: string): Promise<string[]> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { twoFactorBackupCodes: true }
  });
  return user?.twoFactorBackupCodes || [];
}

/**
 * Verify and consume backup code
 */
export async function verifyAndConsumeBackupCode(userId: string, code: string): Promise<boolean> {
  const hashedCodes = await getUserBackupCodes(userId);
  const cryptoModule = await import('crypto');
  const codeHash = cryptoModule.createHash('sha256').update(code.toUpperCase()).digest('hex');
  
  // Find the matching backup code
  const codeIndex = hashedCodes.findIndex(hashed => hashed === codeHash);
  
  if (codeIndex === -1) {
    return false; // Code not found
  }
  
  // Remove used backup code
  const updatedCodes = hashedCodes.filter((_, index) => index !== codeIndex);
  
  await prisma.users.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: updatedCodes }
  });
  
  return true;
}

