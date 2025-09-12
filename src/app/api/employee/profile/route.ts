import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const employee = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        departmentRef: {
          select: {
            name: true
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
      address: employee.address,
      dateOfBirth: employee.dateOfBirth?.toISOString(),
      gender: employee.gender,
      nationality: employee.nationality,
      nationalId: employee.nationalId,
      passportNumber: employee.passportNumber,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      position: employee.position,
      department: employee.departmentRef?.name || employee.department || 'Unassigned',
      startDate: employee.startDate?.toISOString() || null,
      profilePicture: null, // Profile pictures are stored in User model
      supervisor: employee.supervisor ? {
        id: employee.supervisor.id,
        name: `${employee.supervisor.firstName} ${employee.supervisor.lastName}`,
        email: employee.supervisor.email
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
    const employee = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Update employee profile
    const updatedEmployee = await prisma.user.update({
      where: { id: employee.id },
      data: updateData,
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        departmentRef: {
          select: {
            name: true
          }
        }
      }
    });

    // Create audit trail
    await prisma.auditLog.create({
      data: {
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
      middleName: updatedEmployee.middleName,
      email: updatedEmployee.email,
      phoneNumber: updatedEmployee.phoneNumber,
      alternativePhone: updatedEmployee.alternativePhone,
      address: updatedEmployee.address,
      dateOfBirth: updatedEmployee.dateOfBirth?.toISOString(),
      gender: updatedEmployee.gender,
      nationality: updatedEmployee.nationality,
      nationalId: updatedEmployee.nationalId,
      passportNumber: updatedEmployee.passportNumber,
      emergencyContact: updatedEmployee.emergencyContact,
      emergencyPhone: updatedEmployee.emergencyPhone,
      position: updatedEmployee.position,
      department: updatedEmployee.departmentRef?.name || updatedEmployee.department || 'Unassigned',
      startDate: updatedEmployee.startDate?.toISOString() || null,
      profilePicture: null, // Profile pictures are stored in User model
      supervisor: updatedEmployee.supervisor ? {
        id: updatedEmployee.supervisor.id,
        name: `${updatedEmployee.supervisor.firstName} ${updatedEmployee.supervisor.lastName}`,
        email: updatedEmployee.supervisor.email
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
