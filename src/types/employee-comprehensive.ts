// Employee Management Comprehensive Types
export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  middleName?: string
  name: string
  email: string
  phoneNumber: string | null
  phone: string | null
  department: string | null
  position: string
  manager: string | null
  supervisor: string | null
  reportingManager: string | null
  hireDate: Date | null
  joinDate: Date | null
  startDate: Date
  endDate: Date | null
  salary: number | null
  baseSalary: number | null
  payGrade: string | null
  payFrequency: string | null
  benefits: string | null
  status: string
  employmentType: string
  gender: string | null
  dateOfBirth: Date | null
  nationality: string | null
  nationalId: string | null
  passportNumber: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelationship: string | null
  clearanceLevel: string | null
  clearanceStatus: string | null
  securityClearance: string | null
  accessLevel: string | null
  systemAccess: boolean
  biometricEnabled: boolean
  mfaEnabled: boolean
  isActive: boolean
  lastLogin: Date | null
  workLocation: string | null
  supervisoryLevel: string | null
  education: string | null
  skills: string[]
  certifications: string[]
  performanceRating: number | null
  archiveReason: string | null
  archiveDate: Date | null
  enrolledPrograms: string[]
  trainingCompleted: boolean
  trainingRequired: string | null
  backgroundCheckCompleted: boolean
  medicalCheckCompleted: boolean
  contractSigned: boolean
  documents: string[]
  permissions: string[]
  customRoles: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ArchivedEmployee extends Employee {
  archiveReason: string
  archiveDate: Date
  archivedBy: string
}

export interface EmployeeFormData {
  employeeId: string
  firstName: string
  lastName: string
  middleName: string
  email: string
  phoneNumber: string
  phone: string
  department: string
  position: string
  manager: string
  supervisor: string
  reportingManager: string
  hireDate: string
  joinDate: string
  salary: string
  baseSalary: string
  payGrade: string
  payFrequency: string
  benefits: string
  status: string
  employmentType: string
  gender: string
  dateOfBirth: string
  nationality: string
  nationalId: string
  passportNumber: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  clearanceLevel: string
  securityClearance: string
  accessLevel: string
  systemAccess: boolean
  biometricEnabled: boolean
  mfaEnabled: boolean
  workLocation: string
  supervisoryLevel: string
  education: string
  skills: string[]
  certifications: string[]
  trainingRequired: string
}
