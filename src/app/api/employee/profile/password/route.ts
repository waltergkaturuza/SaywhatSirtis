import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { securityService } from '@/lib/security-service';
import AuditLogger from '@/lib/audit-logger';
import emailService from '@/lib/email-service';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 });
    }

    // Enforce password policy using SecurityService
    const passwordValidation = securityService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    // Find the user in the database
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, firstName: true, passwordHash: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (!user.passwordHash) {
      return NextResponse.json({ 
        error: 'No password set for this account. Please contact your administrator.' 
      }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: 'Current password is incorrect' 
      }, { status: 400 });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    await prisma.users.update({
      where: { id: user.id },
      data: { 
        passwordHash: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Create audit log for password change
    try {
      await prisma.audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          action: 'UPDATE',
          resource: 'User',
          resourceId: user.id,
          details: {
            module: 'Employee Profile Password Change',
            action: 'Password updated by user',
            email: user.email
          },
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for password change:', auditError);
      // Continue anyway - password change was successful
    }

    // Send password changed notification email
    if (user.firstName) {
      emailService.sendPasswordChangedEmail(
        user.email,
        user.firstName
      ).catch(err => {
        console.error('Failed to send password changed email:', err);
        // Don't fail password change if email fails
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}