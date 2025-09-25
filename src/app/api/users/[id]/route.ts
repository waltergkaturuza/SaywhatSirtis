import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Try to fetch user from users table
    let user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    // If not found in users table, try employees table (as users might be stored there)
    if (!user) {
      const employee = await prisma.employees.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (employee) {
        user = {
          id: employee.id,
          username: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
        };
      }
    }

    if (!user) {
      return NextResponse.json({ 
        id: userId, 
        name: 'Unknown User', 
        email: null 
      });
    }

    return NextResponse.json({
      id: user.id,
      name: user.username || user.email || 'Unknown User',
      email: user.email,
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        id: params.id, 
        name: 'Unknown User', 
        email: null 
      }
    );
  }
}