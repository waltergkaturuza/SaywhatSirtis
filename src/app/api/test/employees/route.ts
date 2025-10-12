import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to infer gender from first name for demo purposes
function getGenderFromName(firstName: string): string {
  if (!firstName) return 'unspecified'
  
  const name = firstName.toLowerCase()
  const femaleNames = ['nontsikelelo', 'egenia', 'susan', 'belinda', 'isabella', 'vanessa', 'gugulethu', 'desiree', 'melisa', 'dorcas', 'tsitsi', 'angela', 'tracy', 'valencia', 'tanyaradzwa', 'esinathy', 'shantel']
  const maleNames = ['oscar', 'john', 'tatenda', 'pascal', 'thamsanqa', 'kudzaishe', 'kupakwashe', 'rufaro', 'brian', 'elvis', 'tinashe', 'denver', 'jairos', 'praisegod', 'jimmy', 'zerdias', 'george', 'ivor', 'mallon', 'sacha', 'munashe', 'ryan', 'dylan']
  
  if (femaleNames.includes(name)) return 'female'
  if (maleNames.includes(name)) return 'male'
  return 'unspecified'
}

export async function GET() {
  try {
    const employeeCount = await prisma.users.count()
    
    // Get all users with basic fields first
    const users = await prisma.users.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        role: true,
        createdAt: true
      }
    })

    // Transform to match the HR employees API structure
    const employees = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      department: user.department || '',
      departmentInfo: user.department ? {
        name: user.department,
        displayName: user.department
      } : null,
      position: user.position || '',
      hireDate: user.createdAt, // Use account creation as hire date fallback
      status: 'active', // Default to active
      userRole: user.role || 'EMPLOYEE',
      accessLevel: user.role === 'SYSTEM_ADMINISTRATOR' ? 'ADMIN' : 
                   user.role === 'HR' ? 'HR' : 
                   user.role === 'SUPERUSER' ? 'ADMIN' : 'STANDARD',
      // Add basic gender distribution based on names for demo
      gender: getGenderFromName(user.firstName || ''),
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      count: employeeCount,
      employees
    })
  } catch (error) {
    console.error('Employee test error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error },
      { status: 500 }
    )
  }
}
