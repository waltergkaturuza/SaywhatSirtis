export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  name: string
  email: string
  phoneNumber: string
  department: string
  position: string
  manager: string
  supervisor: string
  supervisorId?: string
  isSupervisor?: boolean
  isReviewer?: boolean
  hireDate: string
  startDate: string
  salary: number
  status: string
  employmentType: string
  gender: string
  nationality: string
  nationalId: string
  passportNumber: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  clearanceLevel: string
  clearanceStatus: string
  archiveReason: string
  archivedAt: string
  archivedBy: string
  accessRevoked?: boolean
  // Benefits
  medicalAid?: boolean
  funeralCover?: boolean
  vehicleBenefit?: boolean
  fuelAllowance?: boolean
  airtimeAllowance?: boolean
  otherBenefits?: string[]
  createdAt: string
  updatedAt: string
}

export interface ArchivedEmployee extends Employee {
  archiveReason: string
  archivedAt: string
  archivedBy: string
  clearanceStatus: string
  accessRevoked: boolean
}

export interface EmployeeFormData extends Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {
  // All employee fields for form usage
}

// Archive reasons for employee management
export const ARCHIVE_REASONS = {
  RESIGNATION: 'Resignation',
  TERMINATION: 'Termination', 
  RETIREMENT: 'Retirement',
  TRANSFER: 'Transfer',
  INTERNSHIP_COMPLETED: 'Internship/Attachment/Graduate Training Completed',
  OTHER: 'Other'
} as const

export type ArchiveReason = typeof ARCHIVE_REASONS[keyof typeof ARCHIVE_REASONS]

export const ARCHIVE_REASON_OPTIONS = Object.entries(ARCHIVE_REASONS).map(([key, value]) => ({
  value: key,
  label: value
}))

// Benefits options
export const STANDARD_BENEFITS = [
  'Health Insurance',
  'Dental Coverage', 
  'Vision Coverage',
  'Retirement Plan',
  'Life Insurance',
  'Flexible PTO'
] as const

export const SPECIFIC_BENEFITS = {
  MEDICAL_AID: 'Medical Aid',
  FUNERAL_COVER: 'Funeral Cover',
  VEHICLE_BENEFIT: 'Vehicle Benefit',
  FUEL_ALLOWANCE: 'Fuel Allowance',
  AIRTIME_ALLOWANCE: 'Airtime Allowance'
} as const

export type SpecificBenefit = typeof SPECIFIC_BENEFITS[keyof typeof SPECIFIC_BENEFITS]