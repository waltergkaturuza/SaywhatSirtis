import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre officers API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = session.user.permissions?.includes('calls.view') ||
      session.user.permissions?.includes('calls.full_access') ||
      session.user.roles?.includes('admin') ||
      session.user.roles?.includes('manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      // Get active users who can be assigned tasks
      const queryPromise = Promise.race([
        prisma.users.findMany({
          where: {
            isActive: true,
            role: {
              in: ['ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'CALL_CENTRE_AGENT', 'EMPLOYEE', 'USER']
            }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: true,
            position: true
          },
          orderBy: [
            { role: 'asc' },
            { firstName: 'asc' },
            { lastName: 'asc' }
          ]
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Officers query timeout')), 10000)
        )
      ]);
      
      const users = await queryPromise as any[];

      // Transform users into officers format for dropdowns
      const officers = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        value: `${user.firstName} ${user.lastName}`.trim() || user.email
      }));

      return NextResponse.json({
        success: true,
        officers: officers,
        total: officers.length
      });

    } catch (error) {
      console.error('Failed to fetch officers:', error);
      return NextResponse.json({
        success: true,
        officers: [],
        error: 'Database query failed, showing empty results'
      });
    }

  } catch (error) {
    console.error('Error fetching officers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch officers', 
        details: error instanceof Error ? { name: error.name, message: error.message } : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}