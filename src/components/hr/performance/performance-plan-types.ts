export interface PerformancePlanFormData {
  employee: {
    id: string
    name: string
    email: string
    department: string
    position: string
    manager: string
    planPeriod: {
      startDate: string
      endDate: string
    }
  }
  // Plan details
  planType: string
  planTitle: string
  planDescription: string
  status: string
  supervisor: string
  reviewerId: string
  planYear: string
  startDate: string
  endDate: string
  planPeriod: {
    startDate: string
    endDate: string
  }
  // Goals and objectives
  goals: {
    id: string
    title: string
    description: string
    category: 'professional' | 'personal' | 'technical' | 'leadership'
    priority: 'high' | 'medium' | 'low'
    status: 'not-started' | 'in-progress' | 'completed' | 'on-hold'
    targetDate: string
    progress: number
    metrics: string[]
    resources: string[]
    comments: string
  }[]
  // Development areas
  development: {
    strengths: string[]
    areasForImprovement: string[]
    skillGaps: string[]
    trainingNeeds: string[]
    careerObjectives: string
    mentorshipNeeds: string
  }
  developmentObjectives: {
    objective: string
    description: string
    competencyArea: string
    developmentActivities: string
    resources: string
    timeline: string
    successCriteria: string
    targetDate: string
    priority: string
    status: string
  }[]
  // Key Performance Indicators
  kpis: {
    id: string
    name: string
    indicator: string
    description: string
    target: string
    currentValue: string
    measurement: string
    frequency: string
    weight: number
  }[]
  // Competencies
  competencies: {
    id: string
    name: string
    currentLevel: number
    targetLevel: number
    description: string
    developmentActions: string[]
  }[]
  // Milestones
  milestones: {
    id: string
    title: string
    description: string
    targetDate: string
    status: 'pending' | 'achieved' | 'missed'
    impact: string
  }[]
  // Review and feedback
  review: {
    reviewFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
    nextReviewDate: string
    checkInNotes: string
    managerComments: string
    employeeComments: string
  }
  // Agreement and approval
  employeeAgreement: boolean
  managerApproval: boolean
  hrApproval: boolean
  // Additional fields commonly used in forms
  behavioralExpectations: any[]
  resourcesNeeded: string
  trainingRequirements: string
  mentorshipNeeds: string
  supportFromManager: string
  reviewMilestones: {
    milestone: string
    date: string
    reviewType: string
    expectedOutcomes: string
  }[]
  employeeComments: string
  supervisorComments: string
}

export const defaultPlanFormData: PerformancePlanFormData = {
  employee: {
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    manager: '',
    planPeriod: {
      startDate: '',
      endDate: ''
    }
  },
  planType: 'annual',
  planTitle: '',
  planDescription: '',
  status: 'draft',
  supervisor: '',
  reviewerId: '',
  planYear: new Date().getFullYear().toString(),
  startDate: '',
  endDate: '',
  planPeriod: {
    startDate: '',
    endDate: ''
  },
  goals: [
    {
      id: '1',
      title: '',
      description: '',
      category: 'professional',
      priority: 'medium',
      status: 'not-started',
      targetDate: '',
      progress: 0,
      metrics: [''],
      resources: [''],
      comments: ''
    }
  ],
  development: {
    strengths: [''],
    areasForImprovement: [''],
    skillGaps: [''],
    trainingNeeds: [''],
    careerObjectives: '',
    mentorshipNeeds: ''
  },
  developmentObjectives: [
    {
      objective: '',
      description: '',
      competencyArea: '',
      developmentActivities: '',
      resources: '',
      timeline: '',
      successCriteria: '',
      targetDate: '',
      priority: 'medium',
      status: 'not-started'
    }
  ],
  kpis: [
    {
      id: '1',
      name: '',
      indicator: '',
      description: '',
      target: '',
      currentValue: '',
      measurement: '',
      frequency: 'monthly',
      weight: 0
    }
  ],
  competencies: [
    {
      id: '1',
      name: '',
      currentLevel: 1,
      targetLevel: 3,
      description: '',
      developmentActions: ['']
    }
  ],
  milestones: [
    {
      id: '1',
      title: '',
      description: '',
      targetDate: '',
      status: 'pending',
      impact: ''
    }
  ],
  review: {
    reviewFrequency: 'monthly',
    nextReviewDate: '',
    checkInNotes: '',
    managerComments: '',
    employeeComments: ''
  },
  employeeAgreement: false,
  managerApproval: false,
  hrApproval: false,
  behavioralExpectations: [],
  resourcesNeeded: '',
  trainingRequirements: '',
  mentorshipNeeds: '',
  supportFromManager: '',
  reviewMilestones: [
    {
      milestone: '',
      date: '',
      reviewType: 'informal',
      expectedOutcomes: ''
    }
  ],
  employeeComments: '',
  supervisorComments: ''
}

export const performancePlanSteps = [
  {
    id: 1,
    title: 'Employee Information',
    description: 'Basic employee details and plan period'
  },
  {
    id: 2,
    title: 'Goals & Objectives',
    description: 'Set performance goals and objectives'
  },
  {
    id: 3,
    title: 'Development Areas',
    description: 'Identify strengths and improvement areas'
  },
  {
    id: 4,
    title: 'Milestones',
    description: 'Define key milestones and checkpoints'
  },
  {
    id: 5,
    title: 'Review Schedule',
    description: 'Set up review frequency and schedule'
  }
]

export const goalCategories = [
  { value: 'professional', label: 'Professional Development', color: 'blue' },
  { value: 'personal', label: 'Personal Growth', color: 'green' },
  { value: 'technical', label: 'Technical Skills', color: 'purple' },
  { value: 'leadership', label: 'Leadership', color: 'orange' }
]

export const priorityLevels = [
  { value: 'high', label: 'High Priority', color: 'red' },
  { value: 'medium', label: 'Medium Priority', color: 'yellow' },
  { value: 'low', label: 'Low Priority', color: 'gray' }
]

export const goalStatuses = [
  { value: 'not-started', label: 'Not Started', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'on-hold', label: 'On Hold', color: 'yellow' }
]

export const milestoneStatuses = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'achieved', label: 'Achieved', color: 'green' },
  { value: 'missed', label: 'Missed', color: 'red' }
]

export const reviewFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
]

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'not-started':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'achieved':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'missed':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}
