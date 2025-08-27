export interface PerformancePlanFormData {
  // Employee Information
  employeeName: string
  employeeId: string
  department: string
  position: string
  manager: string
  supervisor: string
  reviewPeriod: string
  planYear: string
  planType: string
  startDate: string
  endDate: string
  resourcesNeeded: string
  trainingRequirements: string
  mentorshipNeeds: string
  supportFromManager: string
  status: string
  employeeComments: string
  supervisorComments: string
  employeeAgreement: boolean
  
  // Plan Structure
  planPeriod: {
    startDate: string
    endDate: string
  }
  
  // Employee Object
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
  
  // Goals with ALL properties
  goals: Array<{
    id: string
    title: string
    description: string
    category: string
    priority: string
    targetDate: string
    status: string
    progress: number
    comments: string
    weight: number
    measurementCriteria: string
    successIndicators: string[]
    challenges: string
    supportNeeded: string
    milestones: Array<{
      name: string
      date: string
      status: string
    }>
    metrics: Array<{
      name: string
      target: string
      current: string
      unit: string
    }>
    resources: string[]
  }>
  
  // KPIs with ALL properties
  kpis: Array<{
    id: string
    name: string
    description: string
    indicator: string
    target: string
    current: string
    currentValue: string
    weight: number
    measurement: string
    frequency: string
    dataSource: string
    formula: string
    threshold: {
      green: string
      yellow: string
      red: string
    }
    progress: number
    comments: string
    lastUpdated: string
  }>
  
  // Development Objectives
  developmentObjectives: Array<{
    id: string
    title: string
    description: string
    category: string
    targetDate: string
    status: string
    priority: string
    skills: string[]
    methods: string[]
    resources: string[]
    mentor: string
    progress: number
    comments: string
    milestones: Array<{
      name: string
      date: string
      completed: boolean
    }>
    objective: string
    competencyArea: string
    developmentActivities: string
    timeline: string
    successCriteria: string
  }>
  
  // Behavioral Expectations
  behavioralExpectations: Array<{
    id: string
    behavior: string
    description: string
    level: string
    examples: string | string[]
    measurement: string
    frequency: string
    comments: string
    rating: number
    importance: string
    developmentArea: boolean
  }>
  
  // Review Milestones
  reviewMilestones: Array<{
    id: string
    milestone: string
    date: string
    reviewType: string
    expectedOutcomes: string
  }>
  
  // Core Competencies
  competencies: Array<{
    id: string
    name: string
    description: string
    level: string
    target: string
    current: string
    category: string
    weight: number
    evidence: string[]
    developmentPlan: string
    assessmentMethod: string
    lastAssessed: string
    comments: string
  }>
  
  // Development Areas
  developmentAreas: Array<{
    id: string
    area: string
    description: string
    actions: string
    timeline: string
    resources: string
    mentor: string
    budget: number
    priority: string
    method: string
    successCriteria: string
    progress: number
    comments: string
    status: string
  }>
  
  // Review Schedule
  reviewSchedule: {
    frequency: string
    nextReview: string
    reviewType: string
    reviewers: string[]
    location: string
    duration: number
    agenda: string[]
    preparation: string[]
    followUp: string[]
  }
  
  // Additional Fields
  additionalComments: string
  approvalStatus: string
  approvedBy: string
  approvedDate: string
  version: number
  lastModified: string
  createdBy: string
  acknowledgment: {
    employee: boolean
    manager: boolean
    hr: boolean
  }
}

export const defaultPlanFormData: PerformancePlanFormData = {
  employeeName: '',
  employeeId: '',
  department: '',
  position: '',
  manager: '',
  supervisor: '',
  reviewPeriod: '',
  planYear: '',
  planType: '',
  startDate: '',
  endDate: '',
  resourcesNeeded: '',
  trainingRequirements: '',
  mentorshipNeeds: '',
  supportFromManager: '',
  status: 'draft',
  employeeComments: '',
  supervisorComments: '',
  employeeAgreement: false,
  planPeriod: {
    startDate: '',
    endDate: ''
  },
  employee: {
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    manager: '',
    supervisor: '',
    planPeriod: {
      startDate: '',
      endDate: ''
    }
  },
  goals: [],
  kpis: [],
  developmentObjectives: [],
  behavioralExpectations: [],
  reviewMilestones: [],
  competencies: [],
  developmentAreas: [],
  reviewSchedule: {
    frequency: 'quarterly',
    nextReview: '',
    reviewType: 'standard',
    reviewers: [],
    location: '',
    duration: 60,
    agenda: [],
    preparation: [],
    followUp: []
  },
  additionalComments: '',
  approvalStatus: 'draft',
  approvedBy: '',
  approvedDate: '',
  version: 1,
  lastModified: '',
  createdBy: '',
  acknowledgment: {
    employee: false,
    manager: false,
    hr: false
  }
}

// Helper functions for creating new items
export const createNewGoal = (): Goal => ({
  id: Date.now().toString(),
  title: '',
  description: '',
  category: 'professional',
  priority: 'medium',
  targetDate: '',
  status: 'not-started',
  progress: 0,
  comments: '',
  weight: 0,
  measurementCriteria: '',
  successIndicators: [],
  challenges: '',
  supportNeeded: '',
  milestones: [],
  metrics: [],
  resources: []
})

export const createNewKPI = () => ({
  id: Date.now().toString(),
  name: '',
  description: '',
  indicator: '',
  target: '',
  current: '',
  currentValue: '',
  weight: 0,
  measurement: '',
  frequency: 'monthly',
  dataSource: '',
  formula: '',
  threshold: {
    green: '',
    yellow: '',
    red: ''
  },
  progress: 0,
  comments: '',
  lastUpdated: ''
})

export const createNewDevelopmentObjective = () => ({
  id: Date.now().toString(),
  title: '',
  description: '',
  category: '',
  targetDate: '',
  status: 'not-started',
  priority: 'medium',
  skills: [],
  methods: [],
  resources: '',
  mentor: '',
  progress: 0,
  comments: '',
  milestones: [],
  objective: '',
  competencyArea: '',
  developmentActivities: '',
  timeline: '',
  successCriteria: ''
})

export const createNewBehavioralExpectation = () => ({
  id: Date.now().toString(),
  behavior: '',
  description: '',
  level: '',
  examples: '',
  measurement: '',
  frequency: '',
  comments: '',
  rating: 0,
  importance: 'medium',
  developmentArea: false
})

export const createNewReviewMilestone = () => ({
  id: Date.now().toString(),
  milestone: '',
  date: '',
  reviewType: 'informal',
  expectedOutcomes: ''
})

export interface Goal {
  id: string
  title: string
  description: string
  category: string
  priority: string
  targetDate: string
  status: string
  progress: number
  comments: string
  weight: number
  measurementCriteria: string
  successIndicators: string[]
  challenges: string
  supportNeeded: string
  milestones: Array<{
    name: string
    date: string
    status: string
  }>
  metrics: Array<{
    name: string
    target: string
    current: string
    unit: string
  }>
  resources: string[]
}

// Performance Plan Steps Configuration
export const performancePlanSteps = [
  {
    id: 1,
    title: 'Employee Information',
    description: 'Basic employee and plan details'
  },
  {
    id: 2,
    title: 'Goals & Objectives',
    description: 'Set performance goals and key objectives'
  },
  {
    id: 3,
    title: 'Key Performance Indicators',
    description: 'Define measurable KPIs and metrics'
  },
  {
    id: 4,
    title: 'Development Objectives',
    description: 'Professional development and growth areas'
  },
  {
    id: 5,
    title: 'Behavioral Expectations',
    description: 'Expected behaviors and competencies'
  },
  {
    id: 6,
    title: 'Resources & Support',
    description: 'Identify resources, training, and support needed'
  },
  {
    id: 7,
    title: 'Review Schedule',
    description: 'Plan regular review milestones and feedback'
  },
  {
    id: 8,
    title: 'Final Review',
    description: 'Review all information and finalize plan'
  }
]

// Utility Functions
export const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'text-red-600 bg-red-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'low':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'achieved':
    case 'approved':
      return 'text-green-600 bg-green-50'
    case 'in-progress':
    case 'active':
    case 'in_progress':
      return 'text-blue-600 bg-blue-50'
    case 'not-started':
    case 'draft':
    case 'pending':
      return 'text-gray-600 bg-gray-50'
    case 'overdue':
    case 'delayed':
    case 'at-risk':
      return 'text-red-600 bg-red-50'
    case 'on-track':
    case 'on_track':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}