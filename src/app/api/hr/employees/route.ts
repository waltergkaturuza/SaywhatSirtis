import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users (employees) with active status
    const employees = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        department: true,
        position: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      },
      orderBy: { lastName: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: employees
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch employees',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { formData } = body

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.position || !formData.department) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Check if employee email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Employee with this email already exists' 
      }, { status: 400 })
    }

    // Create new employee
    const newEmployee = await prisma.user.create({
      data: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        department: formData.department,
        position: formData.position,
        employeeId: formData.employeeId || null,
        hashedPassword: '$2a$10$rZvGJ5xI7gMEwAi8IWW8KO7/Eo3QKsVxQhVJ2X7w9m0N1QmRZJQzK', // Default password
        isActive: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: newEmployee,
      message: 'Employee created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create employee',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
