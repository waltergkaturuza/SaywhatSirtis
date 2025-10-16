import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    // Find employee by email
    const employee = await prisma.employees.findFirst({
      where: {
        email: decodedEmail,
        status: 'ACTIVE'
      },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        job_descriptions: {
          select: {
            id: true,
            jobTitle: true,
            location: true,
            jobSummary: true,
            keyResponsibilities: true,
            essentialExperience: true,
            essentialSkills: true,
            acknowledgment: true,
            version: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ 
        error: 'Employee not found',
        department: { name: 'General', code: 'GEN' } // Fallback
      }, { status: 404 });
    }

    return NextResponse.json({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      department: employee.departments || { name: 'General', code: 'GEN' },
      departments: employee.departments,
      position: employee.position,
      supervisorId: employee.supervisor_id,
      reviewerId: employee.reviewer_id,
      supervisor: employee.employees,
      reviewer: employee.reviewer,
      jobDescription: employee.job_descriptions ? {
        id: employee.job_descriptions.id,
        jobTitle: employee.job_descriptions.jobTitle,
        location: employee.job_descriptions.location,
        jobSummary: employee.job_descriptions.jobSummary,
        keyResponsibilities: employee.job_descriptions.keyResponsibilities,
        essentialExperience: employee.job_descriptions.essentialExperience,
        essentialSkills: employee.job_descriptions.essentialSkills,
        acknowledgment: employee.job_descriptions.acknowledgment,
        version: employee.job_descriptions.version
      } : null
    });

  } catch (error) {
    console.error('Error fetching employee by email:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        department: { name: 'General', code: 'GEN' } // Fallback
      }, 
      { status: 500 }
    );
  }
}