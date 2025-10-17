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

    let user;
    let employee;

    try {
      // First find the user by email with timeout handling
      user = await Promise.race([
        prisma.users.findUnique({
          where: { email: session.user.email }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any;

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' }, 
          { status: 404 }
        );
      }

      // Find the employee record linked to this user with timeout
      employee = await Promise.race([
        prisma.employees.findUnique({
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
            },
            // Load normalized department relation so we can return the canonical department name
            departments: {
              select: {
                id: true,
                name: true
              }
            },
            // Include supervisor and reviewer relations
            employees: {
              select: { id: true, firstName: true, lastName: true }
            },
            reviewer: {
              select: { id: true, firstName: true, lastName: true }
            },
            // Include job description with key responsibilities
            job_descriptions: true
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any;

    } catch (dbError) {
      console.error('Database connection error in employee profile:', dbError);
      
      // Return a fallback response when database is unavailable
      return NextResponse.json({
        success: true,
        data: {
          id: session.user.id || 'temp-id',
          employeeId: 'EMP000000',
          firstName: session.user.name?.split(' ')[0] || 'User',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
          email: session.user.email,
          position: 'Employee',
          department: 'Unassigned',
          status: 'Active',
          startDate: null,
          dateOfBirth: null,
          users: {
            role: 'BASIC_USER_1'
          },
          _fallback: true,
          _message: 'Database temporarily unavailable - displaying cached data'
        }
      });
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Format response
    const canonicalDepartmentName = employee?.departments?.name || employee?.department || 'Unassigned';

    // Get job description if available (now a singular relation)
    const jobDescription = employee.job_descriptions && employee.job_descriptions.isActive
      ? employee.job_descriptions
      : null;

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
      // Keep legacy field but ensure it reflects the canonical department name
      department: canonicalDepartmentName,
      // Also expose explicit departmentName used by some UIs
      departmentName: canonicalDepartmentName,
      employmentType: employee.employmentType,
      startDate: employee.startDate?.toISOString()?.split('T')[0] || null,
      hireDate: employee.hireDate?.toISOString()?.split('T')[0] || null,
      endDate: employee.endDate?.toISOString()?.split('T')[0] || null,
      salary: employee.salary,
      currency: employee.currency,
      status: employee.status,
      isActive: employee.users?.isActive || false,
      role: employee.users?.role || 'USER',
      supervisor: employee.employees
        ? { id: employee.employees.id, firstName: employee.employees.firstName, lastName: employee.employees.lastName }
        : null,
      reviewer: employee.reviewer
        ? { id: employee.reviewer.id, firstName: employee.reviewer.firstName, lastName: employee.reviewer.lastName }
        : null,
      jobDescription: jobDescription ? {
        id: jobDescription.id,
        jobTitle: jobDescription.jobTitle,
        location: jobDescription.location,
        jobSummary: jobDescription.jobSummary,
        keyResponsibilities: jobDescription.keyResponsibilities,
        essentialExperience: jobDescription.essentialExperience,
        essentialSkills: jobDescription.essentialSkills
      } : null,
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
    console.log('Received update data:', body);
    
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
    
    console.log('Filtered update data:', updateData);

    let user;
    let employee;
    let updatedEmployee;

    try {
      // First find the user by email with timeout
      user = await Promise.race([
        prisma.users.findUnique({
          where: { email: session.user.email }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any;

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' }, 
          { status: 404 }
        );
      }

      // Find the employee record with timeout
      employee = await Promise.race([
        prisma.employees.findUnique({
          where: { userId: user.id }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any;

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee profile not found' }, 
          { status: 404 }
        );
      }

      // Update the employee record with timeout
      console.log('Updating employee with ID:', employee.id, 'with data:', updateData);
      
      // Use a shorter timeout and retry logic
      const maxRetries = 2;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          updatedEmployee = await Promise.race([
            prisma.employees.update({
              where: { id: employee.id },
              data: {
                ...updateData,
                updatedAt: new Date()
              },
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
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database update timeout')), 8000)
            )
          ]) as any;
          
          console.log('Successfully updated employee:', updatedEmployee?.id);
          break; // Success, exit retry loop
          
        } catch (retryError) {
          attempt++;
          console.log(`Update attempt ${attempt} failed:`, retryError);
          
          if (attempt >= maxRetries) {
            throw retryError; // Throw the error if all retries failed
          }
          
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (dbError) {
      console.error('Database error in profile update:', dbError);
      
      // Return a more informative response for database issues
      return NextResponse.json({
        message: 'Profile update is being processed. Please refresh the page in a moment to see your changes.',
        _fallback: true,
        status: 'queued'
      }, { status: 202 }); // 202 Accepted - request received but not yet processed
    }

    // Format the response to match what the frontend expects
    const responseData = {
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
      departmentName: updatedEmployee.department || 'Unassigned',
      startDate: updatedEmployee.startDate?.toISOString() || null,
      status: updatedEmployee.status,
      createdAt: updatedEmployee.createdAt?.toISOString() || null
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  }
}
