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
      session.user.permissions?.includes('call_center_full') ||
      session.user.permissions?.includes('callcentre.access') ||
      session.user.permissions?.includes('callcentre.officer') ||
      session.user.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()));

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      // Get active users who can be assigned tasks
      console.log('Fetching officers from database...') // Debug log
      
      // First check if there are any users at all
      const allUsersCount = await prisma.users.count()
      console.log('Total users in database:', allUsersCount)
      
      // If no users, let's check active/inactive breakdown
      if (allUsersCount > 0) {
        const activeCount = await prisma.users.count({ where: { isActive: true } })
        const inactiveCount = await prisma.users.count({ where: { isActive: false } })
        console.log('Active users:', activeCount, 'Inactive users:', inactiveCount)
      }
      
      const queryPromise = Promise.race([
        prisma.users.findMany({
          where: {
            // Remove isActive filter to see all users
            // isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: true,
            position: true,
            isActive: true
          },
          orderBy: [
            { role: 'asc' },
            { firstName: 'asc' },
            { lastName: 'asc' }
          ],
          take: 10 // Limit to first 10 users for debugging
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Officers query timeout')), 10000)
        )
      ]);
      
      const users = await queryPromise as any[];
      console.log('Raw users from database:', users) // Debug log
      console.log('Users with roles:', users.map(u => ({ id: u.id, email: u.email, role: u.role, isActive: u.isActive })))

      // Filter only active users for the dropdown, but show all in logs
      const activeUsers = users.filter(user => user.isActive)
      console.log('Active users after filtering:', activeUsers.length)

      // Transform active users into officers format for dropdowns
      const officers = activeUsers.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        value: `${user.firstName} ${user.lastName}`.trim() || user.email
      }));

      console.log('Transformed officers:', officers) // Debug log

      // If no officers found, provide some mock data for testing
      if (officers.length === 0) {
        console.log('No officers found, providing mock data for testing')
        const mockOfficers = [
          {
            id: 'mock-1',
            name: 'Admin User',
            email: 'admin@saywhat.org',
            role: 'ADMIN',
            department: 'Administration',
            position: 'Administrator',
            displayName: 'Admin User',
            value: 'Admin User'
          },
          {
            id: 'mock-2',
            name: 'John Doe',
            email: 'john.doe@saywhat.org',
            role: 'EMPLOYEE',
            department: 'Call Centre',
            position: 'Call Centre Agent',
            displayName: 'John Doe',
            value: 'John Doe'
          },
          {
            id: 'mock-3',
            name: 'Jane Smith',
            email: 'jane.smith@saywhat.org',
            role: 'PROJECT_MANAGER',
            department: 'Programs',
            position: 'Project Manager',
            displayName: 'Jane Smith',
            value: 'Jane Smith'
          }
        ]
        
        return NextResponse.json({
          success: true,
          officers: mockOfficers,
          total: mockOfficers.length,
          debug: {
            totalUsersInDb: allUsersCount,
            usersReturned: users.length,
            activeUsers: activeUsers.length,
            usingMockData: true
          }
        });
      }

      return NextResponse.json({
        success: true,
        officers: officers,
        total: officers.length,
        debug: {
          totalUsersInDb: allUsersCount,
          usersReturned: users.length,
          activeUsers: activeUsers.length
        }
      });

    } catch (error) {
      console.error('Failed to fetch officers:', error);
      return NextResponse.json({
        success: false,
        officers: [],
        error: 'Database query failed',
        message: error instanceof Error ? error.message : 'Unknown error'
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