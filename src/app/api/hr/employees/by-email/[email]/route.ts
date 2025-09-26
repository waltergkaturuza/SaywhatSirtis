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
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      department: employee.departments || { name: 'General', code: 'GEN' },
      position: employee.position,
      employeeId: employee.employeeId
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