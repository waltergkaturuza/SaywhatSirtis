import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - in production, use your actual database
const employees: Record<string, unknown>[] = []
let nextId = 1

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return all employees (in production, filter by user permissions)
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new employee
    const newEmployee = {
      id: nextId++,
      ...formData,
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    }

    // Add to mock database
    employees.push(newEmployee)

    // Save to documents repository
    try {
      await saveToDocumentRepository(newEmployee)
    } catch (docError) {
      console.warn('Failed to save to document repository:', docError)
      // Continue with the response even if document save fails
    }

    return NextResponse.json({ 
      success: true, 
      employee: newEmployee,
      message: 'Employee created successfully'
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Function to save employee to documents repository
async function saveToDocumentRepository(employee: Record<string, unknown>) {
  try {
    // Generate document content
    const documentContent = generateEmployeeDocument(employee)
    
    // Save to document repository via API
    const documentData = {
      title: `Employee Profile - ${employee.firstName} ${employee.lastName}`,
      content: documentContent,
      type: 'employee_profile',
      category: 'HR Documents',
      tags: ['employee', 'profile', 'hr', (employee.department as string)?.toLowerCase()],
      metadata: {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
        startDate: employee.startDate,
        systemId: employee.id
      }
    }

    // In production, make an internal API call to save to document repository
    // For now, we'll simulate this
    console.log('Saving employee document to repository:', documentData)
    
    return { success: true }
  } catch (error) {
    console.error('Error saving to document repository:', error)
    throw error
  }
}

// Function to generate document content from employee data
function generateEmployeeDocument(employee: Record<string, unknown>) {
  const date = new Date().toLocaleDateString()
  
  return `
# Employee Profile

**Employee ID:** ${employee.employeeId}
**Name:** ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}
**Position:** ${employee.position}
**Department:** ${employee.department}
**Start Date:** ${employee.startDate}
**Date Generated:** ${date}

## Personal Information

- **Date of Birth:** ${employee.dateOfBirth}
- **Gender:** ${employee.gender}
- **Marital Status:** ${employee.maritalStatus}
- **Phone:** ${employee.phoneNumber}
- **Email:** ${employee.email}
- **Personal Email:** ${employee.personalEmail}
- **Address:** ${employee.address}

## Emergency Contact

- **Name:** ${employee.emergencyContactName}
- **Phone:** ${employee.emergencyContactPhone}
- **Relationship:** ${employee.emergencyContactRelationship}

## Employment Details

- **Employee ID:** ${employee.employeeId}
- **Department:** ${employee.department}
- **Position:** ${employee.position}
- **Reporting Manager:** ${employee.reportingManager}
- **Start Date:** ${employee.startDate}
- **Employment Type:** ${employee.employmentType}
- **Work Location:** ${employee.workLocation}

## Compensation

- **Base Salary:** ${employee.baseSalary} ${employee.currency}
- **Pay Grade:** ${employee.payGrade}
- **Pay Frequency:** ${employee.payFrequency}

### Benefits
${Array.isArray(employee.benefits) && employee.benefits.length > 0 ? employee.benefits.map((benefit: string) => `- ${benefit}`).join('\n') : 'No benefits specified'}

## Education & Skills

- **Education Level:** ${employee.education}

### Skills
${Array.isArray(employee.skills) && employee.skills.length > 0 ? employee.skills.map((skill: string) => `- ${skill}`).join('\n') : 'No skills specified'}

### Certifications
${Array.isArray(employee.certifications) && employee.certifications.length > 0 ? employee.certifications.map((cert: string) => `- ${cert}`).join('\n') : 'No certifications specified'}

### Training Requirements
${Array.isArray(employee.trainingRequired) && employee.trainingRequired.length > 0 ? employee.trainingRequired.map((training: string) => `- ${training}`).join('\n') : 'No training requirements'}

## Access & Security

- **Access Level:** ${employee.accessLevel}
- **Security Clearance:** ${employee.securityClearance}

### System Access
${Array.isArray(employee.systemAccess) && employee.systemAccess.length > 0 ? employee.systemAccess.map((system: string) => `- ${system}`).join('\n') : 'No system access specified'}

## Documents & Onboarding Status

- **Contract Signed:** ${employee.contractSigned ? 'Yes' : 'No'}
- **Background Check:** ${employee.backgroundCheckCompleted ? 'Completed' : 'Pending'}
- **Medical Check:** ${employee.medicalCheckCompleted ? 'Completed' : 'Pending'}
- **Training Completed:** ${employee.trainingCompleted ? 'Yes' : 'No'}

## Additional Notes

${employee.additionalNotes || 'No additional notes'}

---
*This document was automatically generated from the SIRTIS HR Management System*
  `.trim()
}
