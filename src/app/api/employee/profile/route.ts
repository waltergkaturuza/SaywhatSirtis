import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// GET: Fetch employee profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Format response
    const profileData = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      username: employee.username,
      phoneNumber: employee.phoneNumber,
      bio: employee.bio,
      location: employee.location,
      position: employee.position,
      department: employee.department || 'Unassigned',
      role: employee.role,
      profileImage: employee.profileImage,
      isActive: employee.isActive,
      lastLogin: employee.lastLogin?.toISOString() || null,
      createdAt: employee.createdAt?.toISOString() || null,
      supervisor: employee.users ? {
        id: employee.users.id,
        name: `${employee.users.firstName} ${employee.users.lastName}`,
        email: employee.users.email
      } : null
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT: Update employee profile (editable fields only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input data
    const allowedFields = [
      'phoneNumber',
      'alternativePhone', 
      'address',
      'emergencyContact',
      'emergencyPhone',
      'profilePicture'
    ];

    const updateData: any = {};
    
    // Only allow updating specific fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Find employee by email
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Update employee profile
    const updatedEmployee = await prisma.users.update({
      where: { id: employee.id },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: employee.id,
        action: 'UPDATE',
        resource: 'Employee',
        resourceId: updatedEmployee.id,
        details: {
          module: 'Employee Profile',
          before: Object.keys(updateData).reduce((acc, key) => {
            acc[key] = employee[key as keyof typeof employee];
            return acc;
          }, {} as any),
          after: updateData
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Format response
    const profileData = {
      id: updatedEmployee.id,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      email: updatedEmployee.email,
      username: updatedEmployee.username,
      phoneNumber: updatedEmployee.phoneNumber,
      bio: updatedEmployee.bio,
      location: updatedEmployee.location,
      position: updatedEmployee.position,
      department: updatedEmployee.department || 'Unassigned',
      role: updatedEmployee.role,
      profileImage: updatedEmployee.profileImage,
      isActive: updatedEmployee.isActive,
      lastLogin: updatedEmployee.lastLogin?.toISOString() || null,
      createdAt: updatedEmployee.createdAt?.toISOString() || null,
      supervisor: updatedEmployee.users ? {
        id: updatedEmployee.users.id,
        name: `${updatedEmployee.users.firstName} ${updatedEmployee.users.lastName}`,
        email: updatedEmployee.users.email
      } : null
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
