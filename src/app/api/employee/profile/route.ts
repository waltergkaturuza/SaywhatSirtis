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

    // First find the user by email
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Find the employee record linked to this user
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true
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
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      alternativePhone: employee.alternativePhone,
      personalEmail: employee.personalEmail,
      alternativeEmail: employee.alternativeEmail,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth?.toISOString()?.split('T')[0] || null,
      gender: employee.gender,
      nationality: employee.nationality,
      nationalId: employee.nationalId,
      passportNumber: employee.passportNumber,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      emergencyContactAddress: employee.emergencyContactAddress,
      emergencyContactRelationship: employee.emergencyContactRelationship,
      profilePicture: employee.profilePicture,
      position: employee.position,
      department: employee.department || 'Unassigned',
      employmentType: employee.employmentType,
      startDate: employee.startDate?.toISOString()?.split('T')[0] || null,
      endDate: employee.endDate?.toISOString()?.split('T')[0] || null,
      salary: employee.salary,
      currency: employee.currency,
      status: employee.status,
      isActive: employee.users?.isActive || false,
      role: employee.users?.role || 'USER',
      createdAt: employee.createdAt?.toISOString() || null,
      updatedAt: employee.updatedAt?.toISOString() || null
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
      'personalEmail',
      'alternativeEmail',
      'address',
      'emergencyContact',
      'emergencyPhone',
      'emergencyContactAddress',
      'emergencyContactRelationship',
      'profilePicture'
    ];

    const updateData: any = {};
    
    // Only allow updating specific fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // First find the user by email
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Find the employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Update employee profile
    const updatedEmployee = await prisma.employees.update({
      where: { id: employee.id },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
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
      employeeId: updatedEmployee.employeeId,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      email: updatedEmployee.users.email,
      dateOfBirth: updatedEmployee.dateOfBirth?.toISOString() || null,
      phoneNumber: updatedEmployee.phoneNumber,
      alternativePhone: updatedEmployee.alternativePhone,
      personalEmail: updatedEmployee.personalEmail,
      alternativeEmail: updatedEmployee.alternativeEmail,
      address: updatedEmployee.address,
      emergencyContact: updatedEmployee.emergencyContact,
      emergencyPhone: updatedEmployee.emergencyPhone,
      emergencyContactAddress: updatedEmployee.emergencyContactAddress,
      emergencyContactRelationship: updatedEmployee.emergencyContactRelationship,
      profilePicture: updatedEmployee.profilePicture,
      position: updatedEmployee.position,
      department: updatedEmployee.department || 'Unassigned',
      startDate: updatedEmployee.startDate?.toISOString() || null,
      status: updatedEmployee.status,
      createdAt: updatedEmployee.createdAt?.toISOString() || null,
      user: updatedEmployee.users ? {
        id: updatedEmployee.users.id,
        firstName: updatedEmployee.users.firstName,
        lastName: updatedEmployee.users.lastName,
        email: updatedEmployee.users.email,
        role: updatedEmployee.users.role
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
