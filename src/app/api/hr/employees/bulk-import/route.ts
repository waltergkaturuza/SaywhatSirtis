import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.create') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be CSV format' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain header and at least one data row' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const dataLines = lines.slice(1)
    
    // Validate required headers
    const requiredFields = ['firstname', 'lastname', 'email', 'department']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    const results = {
      total: dataLines.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number, message: string }>
    }

    // Process each row
    for (let i = 0; i < dataLines.length; i++) {
      const rowNumber = i + 2 // +2 because we start from line 1 and skip header
      const values = dataLines[i].split(',').map(v => v.trim())
      
      try {
        // Map values to object based on headers
        const employeeData: any = {}
        headers.forEach((header, index) => {
          employeeData[header] = values[index] || null
        })

        // Validate required fields
        if (!employeeData.firstname || !employeeData.lastname || !employeeData.email) {
          results.errors.push({
            row: rowNumber,
            message: 'Missing required fields: firstName, lastName, or email'
          })
          results.failed++
          continue
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(employeeData.email)) {
          results.errors.push({
            row: rowNumber,
            message: 'Invalid email format'
          })
          results.failed++
          continue
        }

        // Check if employee already exists
        const existingEmployee = await prisma.users.findFirst({
          where: { email: employeeData.email }
        })

        if (existingEmployee) {
          results.errors.push({
            row: rowNumber,
            message: 'Employee with this email already exists'
          })
          results.failed++
          continue
        }

        // Create employee with required userId (temporary approach - create minimal user)
        const userData = await prisma.users.create({
          data: {
            id: randomUUID(),
            email: employeeData.email,
            username: employeeData.email.split('@')[0],
            firstName: employeeData.firstname || null,
            lastName: employeeData.lastname || null,
            department: employeeData.department || null,
            position: employeeData.position || null,
            role: 'USER',
            updatedAt: new Date()
          }
        })

        await prisma.employees.create({
          data: {
            id: randomUUID(),
            userId: userData.id,
            firstName: employeeData.firstname,
            lastName: employeeData.lastname,
            email: employeeData.email,
            department: employeeData.department,
            position: employeeData.position || 'Staff',
            status: employeeData.status?.toUpperCase() || 'ACTIVE',
            hireDate: employeeData.hiredate ? new Date(employeeData.hiredate) : null,
            phoneNumber: employeeData.phone || null,
            address: employeeData.address || null,
            employeeId: employeeData.employeeid || `EMP${Date.now()}-${i}`,
            startDate: employeeData.startdate ? new Date(employeeData.startdate) : new Date(),
            updatedAt: new Date()
          }
        })

        results.successful++

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error)
        results.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
        results.failed++
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    )
  }
}
