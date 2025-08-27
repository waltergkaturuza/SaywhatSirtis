// Project Management Comprehensive Types
export interface Project {
  id: string
  name: string
  title: string // Alias for name
  description: string | null
  status: string
  priority: string
  health: string | null
  startDate: Date
  endDate: Date | null
  dueDate: Date | null
  budget: number | null
  spent: number | null
  actualSpent: number | null
  location: string | null
  country: string | null
  province: string | null
  tags: string[]
  objectives: any // JSON
  risks: any // JSON
  stakeholders: any // JSON
  milestones: any // JSON
  indicators: any // JSON
  documents: any // JSON
  department: string | null
  donor: string | null
  targetReach: number | null
  currentReach: number | null
  directBeneficiaries: number | null
  indirectBeneficiaries: number | null
  koboIntegration: boolean
  creatorId: string
  managerId: string | null
  projectManager: string | null
  manager: string | null
  lastUpdate: Date | null
  thisWeek: string | null
  progress: number
  creator: {
    id: string
    name: string | null
    email: string
    lastName: string | null
  }
  activities: Array<{
    id: string
    name: string
    description: string | null
    status: string
    startDate: Date
    endDate: Date | null
    progress: number
    budget: number | null
    spent: number | null
    totalTime: number | null
  }>
  tasks: Array<{
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    assignedTo: string | null
    dueDate: Date | null
    estimatedEffort: number | null
    dependencies: string[]
  }>
  progressReports: Array<{
    id: string
    period: string
    progress: number
    achievements: string
    challenges: string
    nextSteps: string
    budgetUpdate: number | null
    reachUpdate: number | null
  }>
  createdAt: Date
  updatedAt: Date
  _count?: {
    activities: number
    tasks: number
  }
}

export interface ProjectFormData {
  name: string
  title: string
  description: string
  status: string
  priority: string
  health: string
  startDate: string
  endDate: string
  dueDate: string
  budget: string
  location: string
  country: string
  province: string
  tags: string[]
  objectives: string[]
  risks: string[]
  stakeholders: string[]
  department: string
  donor: string
  targetReach: string
  directBeneficiaries: string
  indirectBeneficiaries: string
  projectManager: string
  manager: string
  koboIntegration: boolean
}

export interface Activity {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date
  endDate: Date | null
  progress: number
  budget: number | null
  spent: number | null
  allocation: number | null
  estimatedEffort: number | null
  keyDeliverable: string | null
  dependencies: string[]
  totalTime: number | null
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export interface ActivityFormData {
  name: string
  description: string
  status: string
  startDate: string
  endDate: string
  budget: string
  allocation: string
  estimatedEffort: string
  keyDeliverable: string
  dependencies: string[]
}
