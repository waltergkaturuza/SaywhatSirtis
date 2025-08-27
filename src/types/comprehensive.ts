// Comprehensive type definitions to match frontend usage
export interface ModulePageProps {
  metadata: {
    title: string
    description: string
    breadcrumbs?: Array<{
      name: string
      href?: string
    }>
  }
  actions?: React.ReactNode
  filters?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  name: string
  email: string
  phoneNumber: string | null
  phone: string | null
  department: string | null
  position: string
  manager: string | null
  supervisor: string | null
  hireDate: Date | null
  startDate: Date
  endDate: Date | null
  salary: number | null
  status: string
  employmentType: string
  gender: string | null
  nationality: string | null
  nationalId: string | null
  passportNumber: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  clearanceLevel: string | null
  clearanceStatus: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ArchivedEmployee extends Employee {
  archiveReason: string | null
  archivedAt: Date | null
  archivedBy: string | null
}

export interface EventRegistration {
  id: string
  eventId: string
  participantName: string
  participantEmail: string
  participantPhone: string | null
  organization: string | null
  position: string | null
  specialRequirements: string | null
  status: string
  registeredAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  name: string // Alias for title
  description: string | null
  startDate: Date
  endDate: Date | null
  location: string | null
  status: string
  type: string
  category: string | null
  capacity: number | null
  budget: number | null
  isPublic: boolean
  requiresApproval: boolean
  maxRegistrations: number | null
  registrationDeadline: Date | null
  tags: string[]
  speakers: any // JSON
  agenda: any // JSON
  materials: any // JSON
  feedback: any // JSON
  partners: any // JSON
  registrations: EventRegistration[]
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  title: string // Alias for name
  description: string | null
  status: string
  priority: string
  startDate: Date
  endDate: Date | null
  budget: number | null
  location: string | null
  tags: string[]
  objectives: any // JSON
  risks: any // JSON
  stakeholders: any // JSON
  milestones: any // JSON
  creatorId: string
  managerId: string | null
  creator: {
    id: string
    name: string | null
    email: string
  }
  activities: Array<{
    id: string
    name: string
    description: string | null
    status: string
    startDate: Date
    endDate: Date | null
  }>
  createdAt: Date
  updatedAt: Date
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewPeriod: string
  reviewType: string
  overallRating: number | null
  goals: any // JSON
  feedback: string | null
  reviewDate: Date
  nextReviewDate: Date | null
  employee: Employee
  createdAt: Date
  updatedAt: Date
}

export interface CallRecord {
  id: string
  subject: string
  description: string | null
  callType: string | null
  priority: string | null
  status: string
  duration: number | null
  outcome: string | null
  followUpRequired: boolean
  followUpDate: Date | null
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
}

// Form data interfaces that match frontend usage
export interface PerformancePlanFormData {
  employeeName: string
  employeeId: string
  department: string
  position: string
  manager: string
  supervisor: string
  reviewPeriod: string
  planPeriod: {
    startDate: string
    endDate: string
  }
  employee: {
    id: string
    name: string
    email: string
    department: string
    position: string
    manager: string
    supervisor: string
    planPeriod: {
      startDate: string
      endDate: string
    }
  }
  goals: Array<{
    id: string
    title: string
    description: string
    category: string
    priority: string
    targetDate: string
    status: string
    progress: number
    metrics: Array<{
      name: string
      target: string
      current: string
    }>
  }>
  competencies: Array<{
    name: string
    level: string
    target: string
    current: string
  }>
  developmentAreas: Array<{
    area: string
    actions: string
    timeline: string
    resources: string
  }>
  reviewSchedule: {
    frequency: string
    nextReview: string
    reviewType: string
  }
  additionalComments: string
}

export interface EmployeeFormData {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  department: string
  position: string
  hireDate: string
  salary: string
  status: string
  manager: string
  supervisor: string
}
