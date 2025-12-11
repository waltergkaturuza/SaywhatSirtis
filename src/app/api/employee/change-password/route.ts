import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { securityService } from '@/lib/security-service';
import AuditLogger from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }

    // Enforce password policy using SecurityService
    const passwordValidation = securityService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    try {
      // Find user with timeout
      const user = await Promise.race([
        prisma.users.findUnique({
          where: { email: session.user.email },
          select: { 
            id: true, 
            email: true, 
            passwordHash: true 
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as { id: string; email: string; passwordHash: string | null } | null;

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' }, 
          { status: 404 }
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: 'No password set for this account' }, 
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password with timeout
      await Promise.race([
        prisma.users.update({
          where: { id: user.id },
          data: { 
            passwordHash: hashedNewPassword,
            updatedAt: new Date()
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database update timeout')), 15000)
        )
      ]);

      // Log password change in audit trail
      await AuditLogger.logSecurityEvent(
        'PASSWORD_CHANGE',
        {
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString()
        },
        user.id,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ).catch(err => console.error('Failed to log password change:', err));

      // Create audit log for password change
      try {
        await Promise.race([
          prisma.audit_logs.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              action: 'UPDATE',
              resource: 'User',
              resourceId: user.id,
              details: {
                module: 'Password Change',
                action: 'Password updated by user'
              },
              ipAddress: request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown'
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Audit log timeout')), 5000)
          )
        ]);
      } catch (auditError) {
        console.warn('Failed to create audit log for password change:', auditError);
        // Continue anyway - password change was successful
      }

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (dbError) {
      console.error('Database error in password change:', dbError);
      
      // Return graceful error for database issues
      return NextResponse.json({
        error: 'Unable to change password at this time. Please try again later.',
        _fallback: true
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}