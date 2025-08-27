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
  createdAt: string
  updatedAt: string
}

export interface ArchivedEmployee extends Employee {
  archiveReason: string
  archivedAt: string
  archivedBy: string
  clearanceStatus: string
}

export interface EmployeeFormData extends Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {
  // All employee fields for form usage
}