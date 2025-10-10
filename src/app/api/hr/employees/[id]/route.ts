import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: requestId } = await params

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager') ||
                         session.user?.roles?.includes('hr_staff')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Find the employee by ID
    const employee = await prisma.employees.findUnique({
      where: { id: requestId },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ 
        error: 'Employee not found',
        message: `Employee with ID ${requestId} does not exist.`,
        code: 'EMPLOYEE_NOT_FOUND'
      }, { status: 404 })
    }

    // Transform employee data for frontend
    const transformedEmployee = {
      id: employee.id,
      employeeId: employee.employeeId,
      
      // Personal Information
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      fullName: `${employee.firstName || ''} ${employee.middleName ? ' ' + employee.middleName : ''} ${employee.lastName || ''}`.trim(),
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      nationality: employee.nationality,
      nationalId: employee.nationalId,
      passportNumber: employee.passportNumber,
      
      // Contact Information
      email: employee.email,
      personalEmail: employee.personalEmail,
      phoneNumber: employee.phoneNumber,
      alternativePhone: employee.alternativePhone,
      address: employee.address,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      emergencyContactRelationship: employee.emergencyContactRelationship,
      
      // Employment Information
      position: employee.position,
      department: employee.department,
      departmentId: employee.departmentId,
      employmentType: employee.employmentType,
      startDate: employee.startDate,
      hireDate: employee.hireDate,
      endDate: employee.endDate,
      
      // Compensation
      salary: employee.salary,
      currency: employee.currency,
      
      // Benefits
      medicalAid: employee.medical_aid,
      funeralCover: employee.funeral_cover,
      vehicleBenefit: employee.vehicle_benefit,
      fuelAllowance: employee.fuel_allowance,
      airtimeAllowance: employee.airtime_allowance,
      otherBenefits: employee.other_benefits,
      
      // NEW PERSONAL FIELDS - map snake_case to camelCase for frontend
      maritalStatus: employee.marital_status,
      country: employee.country,
      province: employee.province,
      
      // NEW WORK FIELDS - map snake_case to camelCase for frontend
      workLocation: employee.work_location,
      payGrade: employee.pay_grade,
      payFrequency: employee.pay_frequency,
      
      // NEW EDUCATION FIELDS
      education: employee.education,
      skills: employee.skills,
      certifications: employee.certifications,
      
      // NEW ADDITIONAL BENEFITS - map snake_case to camelCase for frontend
      healthInsurance: employee.health_insurance,
      dentalCoverage: employee.dental_coverage,
      visionCoverage: employee.vision_coverage,
      lifeInsurance: employee.life_insurance,
      retirementPlan: employee.retirement_plan,
      flexiblePTO: employee.flexible_pto,
      
      // NEW TRAINING FIELDS - map snake_case to camelCase for frontend
      orientationTrainingRequired: employee.orientation_training_required,
      securityTrainingRequired: employee.security_training_required,
      departmentSpecificTrainingRequired: employee.department_specific_training_required,
      trainingCompleted: employee.training_completed,
      initialTrainingCompleted: employee.initial_training_completed,
      
      // NEW ACCESS/SECURITY FIELDS - map snake_case to camelCase for frontend
      accessLevel: employee.access_level,
      userRole: employee.user_role,
      systemAccess: employee.system_access,
      documentSecurityClearance: employee.document_security_clearance,
      
      // NEW ONBOARDING FIELDS - map snake_case to camelCase for frontend
      contractSigned: employee.contract_signed,
      backgroundCheckCompleted: employee.background_check_completed,
      medicalCheckCompleted: employee.medical_check_completed,
      
      // Role Information
      supervisorId: employee.supervisor_id,
      isSupervisor: employee.is_supervisor,
      isReviewer: employee.is_reviewer,
      
      // Relationships
      supervisor: employee.employees, // This is the supervisor relationship
      subordinates: employee.other_employees, // These are the subordinates
      departments: employee.departments, // Department details
      
      // Status and timestamps
      status: employee.status,
      archivedAt: employee.archived_at,
      archiveReason: employee.archive_reason,
      accessRevoked: employee.access_revoked,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: transformedEmployee
    })

  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT request received for employee update')
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('Unauthorized: no session or user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: requestId } = await params
    console.log('Request ID:', requestId)
    
    const formData = await request.json()
    console.log('Form data keys:', Object.keys(formData))
    console.log('Sample form data:', JSON.stringify(formData, null, 2))

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { id: requestId }
    })

    if (!existingEmployee) {
      return NextResponse.json({ 
        error: 'Employee not found',
        message: `No employee found with ID ${requestId}.`,
        code: 'EMPLOYEE_NOT_FOUND'
      }, { status: 404 })
    }

    // Prepare update data - only include fields that exist in the database schema
    const updateData: any = {
      updatedAt: new Date()
    }

    // Only update fields that exist in the database schema
    if (formData.firstName !== undefined) updateData.firstName = formData.firstName
    if (formData.lastName !== undefined) updateData.lastName = formData.lastName
    if (formData.middleName !== undefined) updateData.middleName = formData.middleName || null
    if (formData.email !== undefined) updateData.email = formData.email.toLowerCase().trim()
    if (formData.phoneNumber !== undefined) updateData.phoneNumber = formData.phoneNumber || null
    if (formData.personalEmail !== undefined) updateData.personalEmail = formData.personalEmail || null
    if (formData.position !== undefined) updateData.position = formData.position
    if (formData.department !== undefined) updateData.department = formData.department
    if (formData.departmentId !== undefined) updateData.departmentId = formData.departmentId // This field exists in schema
    if (formData.employeeId !== undefined) updateData.employeeId = formData.employeeId
    if (formData.status !== undefined) updateData.status = formData.status
    if (formData.dateOfBirth !== undefined) updateData.dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
    if (formData.gender !== undefined) updateData.gender = formData.gender
    if (formData.nationality !== undefined) updateData.nationality = formData.nationality
    if (formData.nationalId !== undefined) updateData.nationalId = formData.nationalId
    if (formData.alternativePhone !== undefined) updateData.alternativePhone = formData.alternativePhone || null
    if (formData.address !== undefined) updateData.address = formData.address
    if (formData.emergencyContact !== undefined) updateData.emergencyContact = formData.emergencyContact
    if (formData.emergencyPhone !== undefined) updateData.emergencyPhone = formData.emergencyPhone
    if (formData.emergencyContactRelationship !== undefined) updateData.emergencyContactRelationship = formData.emergencyContactRelationship
    if (formData.startDate !== undefined) updateData.startDate = formData.startDate ? new Date(formData.startDate) : null
    if (formData.hireDate !== undefined) updateData.hireDate = formData.hireDate ? new Date(formData.hireDate) : null
    if (formData.employmentType !== undefined) updateData.employmentType = formData.employmentType
    if (formData.isSupervisor !== undefined) updateData.is_supervisor = formData.isSupervisor // Map to snake_case
    if (formData.isReviewer !== undefined) updateData.is_reviewer = formData.isReviewer // Map to snake_case
    if (formData.salary !== undefined) updateData.salary = formData.salary ? parseFloat(formData.salary) : null
    if (formData.currency !== undefined) updateData.currency = formData.currency
    
    // Benefits - map camelCase to snake_case database fields
    if (formData.medicalAid !== undefined) updateData.medical_aid = formData.medicalAid
    if (formData.funeralCover !== undefined) updateData.funeral_cover = formData.funeralCover
    if (formData.vehicleBenefit !== undefined) updateData.vehicle_benefit = formData.vehicleBenefit
    if (formData.fuelAllowance !== undefined) updateData.fuel_allowance = formData.fuelAllowance
    if (formData.airtimeAllowance !== undefined) updateData.airtime_allowance = formData.airtimeAllowance
    if (formData.otherBenefits !== undefined) updateData.other_benefits = Array.isArray(formData.otherBenefits) ? formData.otherBenefits : []
    
    // NEW PERSONAL FIELDS - map camelCase to snake_case
    if (formData.maritalStatus !== undefined) updateData.marital_status = formData.maritalStatus
    if (formData.country !== undefined) updateData.country = formData.country
    if (formData.province !== undefined) updateData.province = formData.province
    
    // NEW WORK FIELDS - map camelCase to snake_case
    if (formData.workLocation !== undefined) updateData.work_location = formData.workLocation
    if (formData.payGrade !== undefined) updateData.pay_grade = formData.payGrade
    if (formData.payFrequency !== undefined) updateData.pay_frequency = formData.payFrequency
    
    // NEW EDUCATION FIELDS
    if (formData.education !== undefined) updateData.education = formData.education
    if (formData.skills !== undefined) updateData.skills = Array.isArray(formData.skills) ? formData.skills : []
    if (formData.certifications !== undefined) updateData.certifications = Array.isArray(formData.certifications) ? formData.certifications : []
    
    // NEW ADDITIONAL BENEFITS - map camelCase to snake_case
    if (formData.healthInsurance !== undefined) updateData.health_insurance = formData.healthInsurance
    if (formData.dentalCoverage !== undefined) updateData.dental_coverage = formData.dentalCoverage
    if (formData.visionCoverage !== undefined) updateData.vision_coverage = formData.visionCoverage
    if (formData.lifeInsurance !== undefined) updateData.life_insurance = formData.lifeInsurance
    if (formData.retirementPlan !== undefined) updateData.retirement_plan = formData.retirementPlan
    if (formData.flexiblePTO !== undefined) updateData.flexible_pto = formData.flexiblePTO
    
    // NEW TRAINING FIELDS - map camelCase to snake_case
    if (formData.orientationTrainingRequired !== undefined) updateData.orientation_training_required = formData.orientationTrainingRequired
    if (formData.securityTrainingRequired !== undefined) updateData.security_training_required = formData.securityTrainingRequired
    if (formData.departmentSpecificTrainingRequired !== undefined) updateData.department_specific_training_required = formData.departmentSpecificTrainingRequired
    if (formData.trainingCompleted !== undefined) updateData.training_completed = formData.trainingCompleted
    if (formData.initialTrainingCompleted !== undefined) updateData.initial_training_completed = formData.initialTrainingCompleted
    
    // NEW ACCESS/SECURITY FIELDS - map camelCase to snake_case
    if (formData.accessLevel !== undefined) updateData.access_level = formData.accessLevel
    if (formData.userRole !== undefined) updateData.user_role = formData.userRole
    if (formData.systemAccess !== undefined) updateData.system_access = Array.isArray(formData.systemAccess) ? formData.systemAccess : []
    if (formData.documentSecurityClearance !== undefined) updateData.document_security_clearance = formData.documentSecurityClearance
    
    // NEW ONBOARDING FIELDS - map camelCase to snake_case
    if (formData.contractSigned !== undefined) updateData.contract_signed = formData.contractSigned
    if (formData.backgroundCheckCompleted !== undefined) updateData.background_check_completed = formData.backgroundCheckCompleted
    if (formData.medicalCheckCompleted !== undefined) updateData.medical_check_completed = formData.medicalCheckCompleted
    
    // Handle supervisor relationship - use correct database field name
    if (formData.supervisorId !== undefined) {
      if (formData.supervisorId === 'no-supervisor' || !formData.supervisorId) {
        updateData.supervisor_id = null // Use snake_case field name
      } else {
        // Validate that the supervisor exists in the employees table
        const supervisorExists = await prisma.employees.findUnique({
          where: { id: formData.supervisorId },
          select: { id: true }
        })
        
        if (!supervisorExists) {
          console.error(`Supervisor with ID ${formData.supervisorId} not found`)
          updateData.supervisor_id = null // Set to null if supervisor doesn't exist
        } else {
          updateData.supervisor_id = formData.supervisorId // Use snake_case field name
        }
      }
    }

    console.log(`Updating employee ${requestId} with data:`, updateData)

    // Update the employee using correct relationships
    const updatedEmployee = await prisma.employees.update({
      where: { id: requestId },
      data: updateData,
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })
    // Transform updated employee data for frontend
    const transformedEmployee = {
      id: updatedEmployee.id,
      employeeId: updatedEmployee.employeeId,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      middleName: updatedEmployee.middleName,
      fullName: `${updatedEmployee.firstName || ''} ${updatedEmployee.middleName ? ' ' + updatedEmployee.middleName : ''} ${updatedEmployee.lastName || ''}`.trim(),
      email: updatedEmployee.email,
      phoneNumber: updatedEmployee.phoneNumber,
      personalEmail: updatedEmployee.personalEmail,
      alternativePhone: updatedEmployee.alternativePhone,
      address: updatedEmployee.address,
      position: updatedEmployee.position,
      department: updatedEmployee.department,
      departmentId: updatedEmployee.departmentId,
      dateOfBirth: updatedEmployee.dateOfBirth,
      gender: updatedEmployee.gender,
      nationality: updatedEmployee.nationality,
      nationalId: updatedEmployee.nationalId,
      emergencyContact: updatedEmployee.emergencyContact,
      emergencyPhone: updatedEmployee.emergencyPhone,
      emergencyContactRelationship: updatedEmployee.emergencyContactRelationship,
      startDate: updatedEmployee.startDate,
      hireDate: updatedEmployee.hireDate,
      employmentType: updatedEmployee.employmentType,
      salary: updatedEmployee.salary,
      currency: updatedEmployee.currency,
      
      // Role information - use correct field names
      supervisorId: updatedEmployee.supervisor_id,
      isSupervisor: updatedEmployee.is_supervisor,
      isReviewer: updatedEmployee.is_reviewer,
      
      // Benefits - map snake_case to camelCase for frontend
      medicalAid: updatedEmployee.medical_aid,
      funeralCover: updatedEmployee.funeral_cover,
      vehicleBenefit: updatedEmployee.vehicle_benefit,
      fuelAllowance: updatedEmployee.fuel_allowance,
      airtimeAllowance: updatedEmployee.airtime_allowance,
      otherBenefits: updatedEmployee.other_benefits,
      
      // NEW PERSONAL FIELDS - map snake_case to camelCase for frontend
      maritalStatus: updatedEmployee.marital_status,
      country: updatedEmployee.country,
      province: updatedEmployee.province,
      
      // NEW WORK FIELDS - map snake_case to camelCase for frontend
      workLocation: updatedEmployee.work_location,
      payGrade: updatedEmployee.pay_grade,
      payFrequency: updatedEmployee.pay_frequency,
      
      // NEW EDUCATION FIELDS
      education: updatedEmployee.education,
      skills: updatedEmployee.skills,
      certifications: updatedEmployee.certifications,
      
      // NEW ADDITIONAL BENEFITS - map snake_case to camelCase for frontend
      healthInsurance: updatedEmployee.health_insurance,
      dentalCoverage: updatedEmployee.dental_coverage,
      visionCoverage: updatedEmployee.vision_coverage,
      lifeInsurance: updatedEmployee.life_insurance,
      retirementPlan: updatedEmployee.retirement_plan,
      flexiblePTO: updatedEmployee.flexible_pto,
      
      // NEW TRAINING FIELDS - map snake_case to camelCase for frontend
      orientationTrainingRequired: updatedEmployee.orientation_training_required,
      securityTrainingRequired: updatedEmployee.security_training_required,
      departmentSpecificTrainingRequired: updatedEmployee.department_specific_training_required,
      trainingCompleted: updatedEmployee.training_completed,
      initialTrainingCompleted: updatedEmployee.initial_training_completed,
      
      // NEW ACCESS/SECURITY FIELDS - map snake_case to camelCase for frontend
      accessLevel: updatedEmployee.access_level,
      userRole: updatedEmployee.user_role,
      systemAccess: updatedEmployee.system_access,
      documentSecurityClearance: updatedEmployee.document_security_clearance,
      
      // NEW ONBOARDING FIELDS - map snake_case to camelCase for frontend
      contractSigned: updatedEmployee.contract_signed,
      backgroundCheckCompleted: updatedEmployee.background_check_completed,
      medicalCheckCompleted: updatedEmployee.medical_check_completed,
      
      // Relationships
      supervisor: updatedEmployee.employees, // This is the supervisor relationship
      subordinates: updatedEmployee.other_employees, // These are the subordinates
      departments: updatedEmployee.departments, // Department details
      
      // Status and timestamps
      status: updatedEmployee.status,
      createdAt: updatedEmployee.createdAt,
      updatedAt: updatedEmployee.updatedAt
    }

    console.log(`✅ Employee ${requestId} updated successfully`)

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: transformedEmployee
    })

  } catch (error) {
    console.error('Error updating employee:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      stack: errorStack
    })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
