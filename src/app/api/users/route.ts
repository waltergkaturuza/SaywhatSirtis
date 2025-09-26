import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users from users table with retry logic
    const users = await withRetry(async () => {
      return await prisma.users.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
        },
      });
    });

    // Get all employees (who are also potential users) with retry logic
    const employees = await withRetry(async () => {
      return await prisma.employees.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          status: true,
          department: true,
        },
      });
    });

    // Combine users and employees into a unified format
    const allUsers = [
      ...users.map(user => ({
        id: user.id,
        name: user.username || user.email || 'Unknown User',
        firstName: user.username?.split(' ')[0] || '',
        lastName: user.username?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: user.role,
        type: 'user',
        isActive: user.isActive || true,
        department: null,
        position: null
      })),
      ...employees.map(employee => ({
        id: employee.id,
        name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email || 'Unknown Employee',
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: 'employee',
        type: 'employee',
        isActive: employee.status === 'ACTIVE',
        department: employee.department || null,
        position: employee.position
      }))
    ];

    // Remove duplicates (in case someone exists in both tables)
    const uniqueUsers = allUsers.reduce((acc, user) => {
      const existing = acc.find(u => u.email === user.email && user.email);
      if (!existing) {
        acc.push(user);
      }
      return acc;
    }, [] as typeof allUsers);

    // Sort by name
    uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));

    // Return in different formats based on what frontend components expect
    const url = new URL(request.url);
    const format = url.searchParams.get('format');

    if (format === 'simple') {
      // Simple format for document upload and similar components
      return NextResponse.json(uniqueUsers.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: user.name
      })));
    } else if (format === 'detailed') {
      // Detailed format for risk management and other complex components
      return NextResponse.json({
        success: true,
        data: {
          users: uniqueUsers
        }
      });
    } else {
      // Default format
      return NextResponse.json({
        success: true,
        data: uniqueUsers,
        users: uniqueUsers // For backward compatibility
      });
    }

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        data: [],
        users: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    const currentUser = await prisma.users.findUnique({
      where: { email: session.user?.email || '' },
      select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userData = await request.json();

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        username: userData.username,
        email: userData.email,
        role: userData.role || 'USER',
        isActive: userData.isActive ?? true,
        updatedAt: new Date(),
        // Password handling would go here in a real implementation
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.username || newUser.email,
        firstName: newUser.username?.split(' ')[0] || '',
        lastName: newUser.username?.split(' ').slice(1).join(' ') || '',
        email: newUser.email,
        role: newUser.role,
        type: 'user',
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}