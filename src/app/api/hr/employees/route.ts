import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handlePrismaError,
  validateRequiredFields,
  validateEmail,
  sanitizeInput,
  logError,
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'

export async function GET() {
  try {
    // Authentication required for production
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Get current user to check permissions
    const currentUser = await executeQuery(async (prisma) => 
      prisma.users.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          role: true,
          department: true,
          position: true,
          isActive: true
        }
      })
    )

    if (!currentUser) {
      const { response, status } = createErrorResponse(
        'User not found',
        HttpStatus.NOT_FOUND
      )
      return NextResponse.json(response, { status })
    }

    const isHR = currentUser.role === 'HR' || currentUser.role === 'SUPERUSER'

    // Build query based on permissions
    let whereClause: any = {
      isActive: true
    }

    // If user is not HR, limit to their scope
    if (!isHR) {
      // Regular users can only see themselves
      whereClause.id = currentUser.id
    }

    // Get all employees with their user details and department hierarchy
    const employees = await executeQuery(async (prisma) => 
      prisma.employees.findMany({
        where: {
          status: { in: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED'] } // Show active employees
        },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          },
          departments: {
            select: {
              id: true,
              name: true,
              code: true,
              parentId: true
            }
          }
        },
        orderBy: { firstName: 'asc' }
      })
    )

    // Transform employee data for frontend
    const transformedEmployees = employees.map((emp: any) => {
      return {
        // Basic employee info
        id: emp.id,
        employeeId: emp.employeeId || `EMP${emp.id.slice(-6).toUpperCase()}`,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department || 'Not Assigned',
        departmentInfo: emp.departments ? {
          id: emp.departments.id,
          name: emp.departments.name,
          code: emp.departments.code,
          type: emp.departments.parentId ? 'subunit' : 'main_department',
          displayName: emp.departments.parentId 
            ? `Subunit: ${emp.departments.name} (${emp.departments.code})`
            : `Main Dept: ${emp.departments.name} (${emp.departments.code})`
        } : null,
        position: emp.position || 'N/A',
        phone: emp.phoneNumber || 'N/A',
        
        // Personal information
        dateOfBirth: emp.dateOfBirth,
        gender: emp.gender,
        nationality: emp.nationality,
        maritalStatus: emp.marital_status,
        
        // Supervisor info - Note: This would need to be fetched separately if needed
        supervisor: null,
        
        // Employee-specific data
        startDate: emp.startDate || emp.hireDate || emp.createdAt,
        hireDate: emp.hireDate || emp.startDate || emp.createdAt, // Add hireDate field for frontend compatibility
        status: emp.status?.toLowerCase() || 'active',
        employmentType: emp.employmentType,
        salary: emp.salary,
        isSupervisor: emp.isSupervisor || false,
        isReviewer: emp.isReviewer || false,
        
        // System user data (if linked)
        user: emp.users ? {
          id: emp.users.id,
          role: emp.users.role,
          isActive: emp.users.isActive,
          email: emp.users.email
        } : null,
        isSystemUser: !!emp.users,
        
        // Role and security information
        userRole: emp.users?.role || emp.user_role || 'EMPLOYEE', // Actual role from user account
        accessLevel: emp.access_level || 'BASIC',
        documentSecurityClearance: emp.document_security_clearance || 'PUBLIC',
        systemAccess: emp.system_access || [],
        securityClearance: emp.document_security_clearance || 'PUBLIC', // Legacy field for backward compatibility
        
        // Security status
        contractSigned: emp.contract_signed || false,
        backgroundCheckCompleted: emp.background_check_completed || false,
        medicalCheckCompleted: emp.medical_check_completed || false,
        trainingCompleted: emp.training_completed || false,
        
        // Education & Skills information
        education: emp.education,
        skills: emp.skills || [],
        certifications: emp.certifications || [],
        orientationTrainingRequired: emp.orientation_training_required || false,
        securityTrainingRequired: emp.security_training_required || false,
        departmentSpecificTrainingRequired: emp.department_specific_training_required || false,
        additionalNotes: emp.additional_notes,
        
        // Additional info
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt
      }
    })

    const response = createSuccessResponse(transformedEmployees, {
      message: `Retrieved ${transformedEmployees.length} employees`,
      meta: { 
        totalEmployees: employees.length
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    const body = await request.json()
    const { formData } = body

    // Validate required fields
    const validationError = validateRequiredFields(formData, [
      'email', 'position'
    ])
    
    // Department is now optional - employees can be created without departments
    
    if (validationError) {
      const { response, status } = createErrorResponse(
        validationError,
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      const { response, status } = createErrorResponse(
        'Invalid email format',
        HttpStatus.BAD_REQUEST,
        { code: ErrorCodes.VALIDATION_ERROR }
      )
      return NextResponse.json(response, { status })
    }

    // Check if employee email already exists
    const existingEmployee = await executeQuery(async (prisma) => 
      prisma.employees.findUnique({
        where: { email: formData.email }
      })
    )

    if (existingEmployee) {
      const { response, status } = createErrorResponse(
        'Employee with this email already exists',
        HttpStatus.CONFLICT,
        { code: ErrorCodes.DUPLICATE_ENTRY }
      )
      return NextResponse.json(response, { status })
    }

    // Check if user email already exists
    const existingUser = await executeQuery(async (prisma) => 
      prisma.users.findUnique({
        where: { email: formData.email },
        select: {
          id: true,
          email: true
        }
      })
    )

    if (existingUser) {
      const { response, status } = createErrorResponse(
        'User with this email already exists',
        HttpStatus.CONFLICT,
        { code: ErrorCodes.DUPLICATE_ENTRY }
      )
      return NextResponse.json(response, { status })
    }

    // Handle department validation and resolution
    let departmentName = formData.department || ''
    let validDepartmentId = null

    if (formData.departmentId) {
      // Validate that the departmentId exists
      const department = await executeQuery(async (prisma) => 
        prisma.departments.findUnique({
          where: { id: formData.departmentId },
          select: { id: true, name: true, status: true }
        })
      )
      
      if (!department) {
        const { response, status } = createErrorResponse(
          'Invalid department selected',
          HttpStatus.BAD_REQUEST,
          { code: ErrorCodes.VALIDATION_ERROR }
        )
        return NextResponse.json(response, { status })
      }
      
      if (department.status !== 'ACTIVE') {
        const { response, status } = createErrorResponse(
          'Selected department is not active',
          HttpStatus.BAD_REQUEST,
          { code: ErrorCodes.VALIDATION_ERROR }
        )
        return NextResponse.json(response, { status })
      }
      
      validDepartmentId = department.id
      departmentName = department.name
    } else if (formData.department) {
      // Try to find department by name if only name is provided
      const department = await executeQuery(async (prisma) => 
        prisma.departments.findFirst({
          where: { 
            name: formData.department,
            status: 'ACTIVE'
          },
          select: { id: true, name: true }
        })
      )
      
      if (department) {
        validDepartmentId = department.id
        departmentName = department.name
      } else {
        // Department name provided but doesn't exist - create it or use null
        console.warn(`Department "${formData.department}" not found, creating employee without department link`)
        departmentName = formData.department
        validDepartmentId = null
      }
    }

    // Generate unique employee ID
    let employeeId: string = '' // Initialize with empty string
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      const employeeCount = await executeQuery(async (prisma) => 
        prisma.employees.count()
      )
      employeeId = `EMP${(employeeCount + 1 + attempts).toString().padStart(4, '0')}`
      
      const existingEmployeeId = await executeQuery(async (prisma) => 
        prisma.employees.findUnique({
          where: { employeeId },
          select: { id: true }
        })
      )
      
      if (!existingEmployeeId) {
        isUnique = true
      } else {
        attempts++
      }
    }
    
    if (!isUnique) {
      // Fallback to timestamp-based ID
      employeeId = `EMP${Date.now().toString().slice(-8)}`
    }

    // Sanitize input data
    const sanitizedData = {
      employeeId,
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      middleName: formData.middleName ? sanitizeInput(formData.middleName) : null,
      email: formData.email.toLowerCase().trim(),
      phoneNumber: formData.phoneNumber ? sanitizeInput(formData.phoneNumber) : null,
      alternativePhone: formData.alternativePhone ? sanitizeInput(formData.alternativePhone) : null,
      address: formData.address ? sanitizeInput(formData.address) : null,
      // Fix emergency contact field mapping
      emergencyContact: formData.emergencyContactName ? sanitizeInput(formData.emergencyContactName) : null,
      emergencyPhone: formData.emergencyContactPhone ? sanitizeInput(formData.emergencyContactPhone) : null,
      department: sanitizeInput(departmentName || ''), // Keep for backward compatibility
      departmentId: validDepartmentId, // Use validated departmentId for proper relation
      position: sanitizeInput(formData.position),
      employmentType: formData.employmentType || 'FULL_TIME',
      workLocation: formData.workLocation ? sanitizeInput(formData.workLocation) : null,
      // Fix date field mapping - use startDate from form, not hireDate
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      hireDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      // Add missing personal information fields
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      gender: formData.gender || null,
      maritalStatus: formData.maritalStatus || null,
      nationality: formData.country || null,
      country: formData.country || null,
      province: formData.province || null,
      nationalId: formData.nationalId?.trim() || null,
      passportNumber: formData.passportNumber?.trim() || null,
      // Compensation fields
      salary: formData.baseSalary ? parseFloat(formData.baseSalary) : null,
      currency: formData.currency || 'USD',
      status: 'ACTIVE' as const,
      // Supervisor and role fields
      supervisorId: formData.supervisorId || null,
      reviewerId: formData.reviewerId || null,
      isSupervisor: formData.isSupervisor || false,
      isReviewer: formData.isReviewer || false,
      // Benefits fields - map form fields to database fields
      healthInsurance: formData.healthInsurance || false,
      dentalCoverage: formData.dentalCoverage || false,
      visionCoverage: formData.visionCoverage || false,
      lifeInsurance: formData.lifeInsurance || false,
      retirementPlan: formData.retirementPlan || false,
      flexiblePTO: formData.flexiblePTO || false,
      medicalAid: formData.medicalAid || false,
      funeralCover: formData.funeralCover || false,
      vehicleBenefit: formData.vehicleBenefit || false,
      fuelAllowance: formData.fuelAllowance || false,
      airtimeAllowance: formData.airtimeAllowance || false,
      otherBenefits: Array.isArray(formData.otherBenefits) ? formData.otherBenefits.filter((benefit: any) => benefit && benefit.trim() !== '') : [],
      // Job Description data
      jobDescription: formData.jobDescription ? {
        jobTitle: sanitizeInput(formData.jobDescription.jobTitle || ''),
        location: sanitizeInput(formData.jobDescription.location || ''),
        jobSummary: sanitizeInput(formData.jobDescription.jobSummary || ''),
        keyResponsibilities: formData.jobDescription.keyResponsibilities?.map((resp: any) => ({
          description: sanitizeInput(resp.description || ''),
          weight: resp.weight || 0,
          tasks: sanitizeInput(resp.tasks || '')
        })) || [],
        essentialExperience: sanitizeInput(formData.jobDescription.essentialExperience || ''),
        essentialSkills: sanitizeInput(formData.jobDescription.essentialSkills || ''),
        acknowledgment: formData.jobDescription.acknowledgment || false,
        signatureFileName: formData.jobDescription.signatureFile?.name || null
      } : null
    }

    // Pre-validate foreign keys to avoid generic FK failures
    // Prepare supervisor mapping (the incoming supervisorId might be either a userId or an employeeId)
    let supervisorUserId: string | undefined = undefined
    let supervisorEmployeeId: string | undefined = undefined
    if (sanitizedData.supervisorId) {
      const provided = sanitizedData.supervisorId
      // Try match as employee.id first
      const supervisorAsEmployee = await executeQuery(async (prisma) => prisma.employees.findUnique({ where: { id: provided }, select: { id: true, userId: true } }))
      if (supervisorAsEmployee) {
        supervisorEmployeeId = supervisorAsEmployee.id
        supervisorUserId = supervisorAsEmployee.userId
      } else {
        // Try match as users.id then find linked employee
        const supervisorUser = await executeQuery(async (prisma) => prisma.users.findUnique({ where: { id: provided }, select: { id: true } }))
        if (supervisorUser) {
          const linkedEmployee = await executeQuery(async (prisma) => prisma.employees.findUnique({ where: { userId: supervisorUser.id }, select: { id: true, userId: true } }))
          if (linkedEmployee) {
            supervisorEmployeeId = linkedEmployee.id
            supervisorUserId = linkedEmployee.userId
          } else {
            const { response, status } = createErrorResponse('Supervisor employee record not found', HttpStatus.BAD_REQUEST, { code: ErrorCodes.VALIDATION_ERROR, message: 'Provided supervisor user has no employee record' })
            return NextResponse.json(response, { status })
          }
        } else {
          const { response, status } = createErrorResponse('Supervisor does not exist', HttpStatus.BAD_REQUEST, { code: ErrorCodes.VALIDATION_ERROR, message: 'Referenced supervisor was not found' })
          return NextResponse.json(response, { status })
        }
      }
    }
    if (sanitizedData.departmentId) {
      const deptId = sanitizedData.departmentId as string
      const departmentExists = await executeQuery(async (prisma) => prisma.departments.findUnique({ where: { id: deptId }, select: { id: true } }))
      if (!departmentExists) {
        const { response, status } = createErrorResponse('Department does not exist', HttpStatus.BAD_REQUEST, { code: ErrorCodes.VALIDATION_ERROR, message: 'Referenced department was not found' })
        return NextResponse.json(response, { status })
      }
    }

    // Prepare reviewer mapping
    let reviewerEmployeeId: string | undefined = undefined
    if (sanitizedData.reviewerId) {
      const provided = sanitizedData.reviewerId
      const reviewerAsEmployee = await executeQuery(async (prisma) => prisma.employees.findUnique({ where: { id: provided }, select: { id: true } }))
      if (reviewerAsEmployee) {
        reviewerEmployeeId = reviewerAsEmployee.id
      }
    }

    // Create user and employee in a transaction
    const result = await executeQuery(async (prisma) => 
      prisma.$transaction(async (tx) => {
      // Create user account first with appropriate roles
      const userRoles = ['user'] // Base role for all users
      if (sanitizedData.isSupervisor) {
        userRoles.push('supervisor')
      }
      if (sanitizedData.isReviewer) {
        userRoles.push('reviewer')
      }
      
      // Handle role-based data from the form
      const userRole = formData.role || formData.userRole || 'BASIC_USER_1'
      const permissions = formData.permissions || {}
      
      // Calculate access level and document security clearance based on role
      const getAccessLevelFromRole = (role: string) => {
        const roleMap: Record<string, { accessLevel: string, documentLevel: string }> = {
          'BASIC_USER_1': { accessLevel: 'BASIC', documentLevel: 'CONFIDENTIAL' },
          'BASIC_USER_2': { accessLevel: 'BASIC', documentLevel: 'CONFIDENTIAL' },
          'ADVANCE_USER_1': { accessLevel: 'ADVANCED', documentLevel: 'SECRET' },
          'ADVANCE_USER_2': { accessLevel: 'ADVANCED', documentLevel: 'SECRET' },
          'HR': { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
          'SUPERUSER': { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
          'SYSTEM_ADMINISTRATOR': { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' }
        }
        return roleMap[role] || { accessLevel: 'BASIC', documentLevel: 'PUBLIC' }
      }
      
      const roleConfig = getAccessLevelFromRole(userRole)
      
      const newUser = await tx.users.create({
        data: {
          id: randomUUID(),
          email: sanitizedData.email,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          department: sanitizedData.department,
          position: sanitizedData.position,
          role: userRole, // Use the selected role from the form
          supervisorId: supervisorUserId, // resolved supervisor user id (may be undefined)
          updatedAt: new Date()
        }
      })

      // Create employee record
      const newEmployee = await tx.employees.create({
        data: {
          id: randomUUID(),
          userId: newUser.id,
          employeeId: sanitizedData.employeeId,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          middleName: sanitizedData.middleName,
          dateOfBirth: sanitizedData.dateOfBirth,
          gender: sanitizedData.gender,
          marital_status: sanitizedData.maritalStatus,
          nationality: sanitizedData.nationality,
          country: sanitizedData.country,
          province: sanitizedData.province,
          nationalId: sanitizedData.nationalId,
          passportNumber: sanitizedData.passportNumber,
          email: sanitizedData.email,
          phoneNumber: sanitizedData.phoneNumber,
          alternativePhone: sanitizedData.alternativePhone,
          address: sanitizedData.address,
          emergencyContact: sanitizedData.emergencyContact,
          emergencyPhone: sanitizedData.emergencyPhone,
          department: sanitizedData.department,
          departmentId: sanitizedData.departmentId,
          position: sanitizedData.position,
          employmentType: sanitizedData.employmentType,
          startDate: sanitizedData.startDate,
          hireDate: sanitizedData.hireDate,
          work_location: sanitizedData.workLocation,
          salary: sanitizedData.salary,
          currency: sanitizedData.currency,
          status: sanitizedData.status,
          supervisor_id: supervisorEmployeeId, // resolved supervisor employee id
          reviewer_id: reviewerEmployeeId, // resolved reviewer employee id
          is_supervisor: sanitizedData.isSupervisor,
          is_reviewer: sanitizedData.isReviewer,
          
          // Role and security fields - properly sync with user account
          user_role: userRole,
          access_level: roleConfig.accessLevel,
          document_security_clearance: roleConfig.documentLevel,
          system_access: formData.systemAccess || [],
          
          // Benefits
          health_insurance: sanitizedData.healthInsurance,
          dental_coverage: sanitizedData.dentalCoverage,
          vision_coverage: sanitizedData.visionCoverage,
          life_insurance: sanitizedData.lifeInsurance,
          retirement_plan: sanitizedData.retirementPlan,
          flexible_pto: sanitizedData.flexiblePTO,
          medical_aid: sanitizedData.medicalAid,
          funeral_cover: sanitizedData.funeralCover,
          vehicle_benefit: sanitizedData.vehicleBenefit,
          fuel_allowance: sanitizedData.fuelAllowance,
          airtime_allowance: sanitizedData.airtimeAllowance,
          other_benefits: sanitizedData.otherBenefits,
          
          // Education & Skills fields
          education: formData.education || null,
          skills: Array.isArray(formData.skills) ? formData.skills : (typeof formData.skills === 'string' ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []),
          certifications: Array.isArray(formData.certifications) ? formData.certifications : (typeof formData.certifications === 'string' ? formData.certifications.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0) : []),
          
          // Training requirements
          orientation_training_required: formData.orientationTrainingRequired || false,
          security_training_required: formData.securityTrainingRequired || false,
          department_specific_training_required: formData.departmentSpecificTrainingRequired || false,
          
          // Additional notes
          additional_notes: formData.additionalNotes || null,
          
          // Security status
          contract_signed: formData.contractSigned || false,
          background_check_completed: formData.backgroundCheckCompleted || false,
          medical_check_completed: formData.medicalCheckCompleted || false,
          training_completed: formData.trainingCompleted || false,
          
          updatedAt: new Date()
        }
      })

      // Create job description record if provided
      let jobDescriptionRecord = null
      if (sanitizedData.jobDescription && sanitizedData.jobDescription.jobTitle) {
        jobDescriptionRecord = await tx.job_descriptions.create({
          data: {
            id: randomUUID(),
            employeeId: newEmployee.id,
            jobTitle: sanitizedData.jobDescription.jobTitle,
            location: sanitizedData.jobDescription.location,
            jobSummary: sanitizedData.jobDescription.jobSummary || '',
            keyResponsibilities: sanitizedData.jobDescription.keyResponsibilities || [],
            essentialExperience: sanitizedData.jobDescription.essentialExperience || '',
            essentialSkills: sanitizedData.jobDescription.essentialSkills || '',
            acknowledgment: sanitizedData.jobDescription.acknowledgment || false,
            signatureFileName: sanitizedData.jobDescription.signatureFileName || null,
            updatedAt: new Date()
          }
        })
      }

      // Create education qualification if provided
      let educationQualification = null
      if (formData.education && formData.education !== '') {
        educationQualification = await tx.qualifications.create({
          data: {
            id: randomUUID(),
            employeeId: newEmployee.id,
            type: 'EDUCATION',
            title: formData.education,
            institution: null,
            description: `Highest Education Level: ${formData.education}`,
            dateObtained: new Date(), // Use current date as we don't have specific date
            skillsGained: formData.skills ? formData.skills.split(',').map((skill: string) => skill.trim()) : [],
            updatedAt: new Date()
          }
        })
      }

      // Create certification qualifications if provided
      let certificationQualifications = []
      if (formData.certifications && formData.certifications !== '') {
        const certifications = formData.certifications.split(',').map((cert: string) => cert.trim())
        for (const cert of certifications) {
          if (cert) {
            const certQualification = await tx.qualifications.create({
              data: {
                id: randomUUID(),
                employeeId: newEmployee.id,
                type: 'CERTIFICATION',
                title: cert,
                institution: null,
                description: `Professional Certification: ${cert}`,
                dateObtained: new Date(), // Use current date as we don't have specific date
                skillsGained: [],
                updatedAt: new Date()
              }
            })
            certificationQualifications.push(certQualification)
          }
        }
      }

        return { newUser, newEmployee, educationQualification, certificationQualifications, jobDescriptionRecord }
      })
    )

    const { newEmployee, educationQualification, certificationQualifications, jobDescriptionRecord } = result

    const response = createSuccessResponse({
      id: newEmployee.id,
      employeeId: newEmployee.employeeId,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      department: newEmployee.department,
      position: newEmployee.position,
      status: newEmployee.status,
      qualifications: {
        education: educationQualification,
        certifications: certificationQualifications,
        jobDescription: jobDescriptionRecord
      }
    }, {
      message: `Employee ${newEmployee.firstName} ${newEmployee.lastName} created successfully with ${certificationQualifications.length} certifications`
    })

    return NextResponse.json(response, { status: HttpStatus.CREATED })
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/employees',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
