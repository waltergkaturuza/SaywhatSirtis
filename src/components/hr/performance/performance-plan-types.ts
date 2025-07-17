export interface PerformancePlanFormData {
  // Employee Information
  employeeId: string
  employeeName: string
  position: string
  department: string
  supervisor: string
  planPeriod: string
  
  // Plan Details
  planYear: string
  startDate: string
  endDate: string
  planType: string
  
  // Strategic Goals
  strategicGoals: {
    goal: string
    description: string
    priority: string
    successMetrics: string
    targetDate: string
    progress: number
    status: string
  }[]
  
  // Key Performance Indicators (KPIs)
  kpis: {
    indicator: string
    description: string
    target: string
    measurement: string
    frequency: string
    weight: number
    currentValue: string
  }[]
  
  // Development Objectives
  developmentObjectives: {
    objective: string
    description: string
    competencyArea: string
    developmentActivities: string
    resources: string
    timeline: string
    successCriteria: string
  }[]
  
  // Behavioral Expectations
  behavioralExpectations: {
    behavior: string
    description: string
    examples: string
    importance: string
  }[]
  
  // Resources and Support
  resourcesNeeded: string
  trainingRequirements: string
  mentorshipNeeds: string
  supportFromManager: string
  
  // Review Schedule
  reviewMilestones: {
    milestone: string
    date: string
    reviewType: string
    expectedOutcomes: string
  }[]
  
  // Signatures and Approval
  employeeAgreement: boolean
  employeeComments: string
  supervisorComments: string
  approvalDate: string
  status: string
}

export const defaultPlanFormData: PerformancePlanFormData = {
  employeeId: "",
  employeeName: "",
  position: "",
  department: "",
  supervisor: "",
  planPeriod: "",
  planYear: new Date().getFullYear().toString(),
  startDate: "",
  endDate: "",
  planType: "annual",
  strategicGoals: [
    {
      goal: "",
      description: "",
      priority: "high",
      successMetrics: "",
      targetDate: "",
      progress: 0,
      status: "not-started"
    }
  ],
  kpis: [
    {
      indicator: "",
      description: "",
      target: "",
      measurement: "",
      frequency: "monthly",
      weight: 20,
      currentValue: ""
    }
  ],
  developmentObjectives: [
    {
      objective: "",
      description: "",
      competencyArea: "",
      developmentActivities: "",
      resources: "",
      timeline: "",
      successCriteria: ""
    }
  ],
  behavioralExpectations: [
    {
      behavior: "Professional Communication",
      description: "",
      examples: "",
      importance: "high"
    },
    {
      behavior: "Team Collaboration",
      description: "",
      examples: "",
      importance: "high"
    },
    {
      behavior: "Customer Focus",
      description: "",
      examples: "",
      importance: "medium"
    }
  ],
  resourcesNeeded: "",
  trainingRequirements: "",
  mentorshipNeeds: "",
  supportFromManager: "",
  reviewMilestones: [
    {
      milestone: "Quarter 1 Review",
      date: "",
      reviewType: "formal",
      expectedOutcomes: ""
    },
    {
      milestone: "Mid-Year Review",
      date: "",
      reviewType: "formal",
      expectedOutcomes: ""
    },
    {
      milestone: "Quarter 3 Review",
      date: "",
      reviewType: "informal",
      expectedOutcomes: ""
    },
    {
      milestone: "Annual Review",
      date: "",
      reviewType: "formal",
      expectedOutcomes: ""
    }
  ],
  employeeAgreement: false,
  employeeComments: "",
  supervisorComments: "",
  approvalDate: "",
  status: "draft"
}

export const performancePlanSteps = [
  { id: 1, title: "Plan Setup", description: "Employee details and plan period" },
  { id: 2, title: "Strategic Goals", description: "Define key strategic objectives" },
  { id: 3, title: "KPIs & Metrics", description: "Set measurable performance indicators" },
  { id: 4, title: "Development Objectives", description: "Professional growth and skills" },
  { id: 5, title: "Behavioral Expectations", description: "Expected behaviors and values" },
  { id: 6, title: "Resources & Support", description: "Required resources and support" },
  { id: 7, title: "Review Schedule", description: "Plan review milestones and dates" },
  { id: 8, title: "Final Review", description: "Submit and finalize the plan" }
]

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800'
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'not-started':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
