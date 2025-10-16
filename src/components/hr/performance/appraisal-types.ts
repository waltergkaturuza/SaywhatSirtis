// Workflow comment types
export interface WorkflowComment {
  id: string
  name: string
  userId: string
  comment: string
  action: 'comment' | 'request_changes' | 'approve' | 'final_approve'
  timestamp: string
}

export interface AppraisalFormData {
  id?: string
  employee: {
    id: string
    name: string
    email: string
    department: string
    position: string
    manager: string
    reviewer?: string
    hireDate: string
    reviewPeriod: {
      startDate: string
      endDate: string
    }
  }
  performance: {
    overallRating: number
    categories: {
      id: string
      name: string
      rating: number
      comment: string
      weight: number
    }[]
    strengths: string[]
    areasForImprovement: string[]
  }
  achievements: {
    keyResponsibilities: {
      id: string
      description: string
      tasks: string
      weight: number
      targetDate?: string
      status?: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
      achievementStatus: 'achieved' | 'partially-achieved' | 'not-achieved'
      comment: string
      successIndicators: {
        id: string
        indicator: string
        target: string
        actualValue: string
        measurement: string
        achieved: boolean
      }[]
    }[]
    goals: never[]
    keyAccomplishments: never[]
    additionalContributions: never[]
  }
  development: {
    trainingNeeds: string[]
    careerAspirations: string
    skillsToImprove: string[]
    developmentPlan: {
      objective: string
      actions: string[]
      timeline: string
      resources: string[]
    }[]
  }
  comments: {
    employeeComments: string
    managerComments: string
    hrComments: string
  }
  ratings: {
    finalRating: number
    recommendation: 'promotion' | 'lateral-move' | 'improvement-plan' | 'maintain-current'
    salaryRecommendation: string
  }
}

export const defaultFormData: AppraisalFormData = {
  employee: {
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    manager: '',
    hireDate: '',
    reviewPeriod: {
      startDate: '',
      endDate: ''
    }
  },
  performance: {
    overallRating: 0,
    categories: [
      { id: '1', name: 'Job Knowledge', rating: 0, comment: '', weight: 20 },
      { id: '2', name: 'Quality of Work', rating: 0, comment: '', weight: 20 },
      { id: '3', name: 'Productivity', rating: 0, comment: '', weight: 15 },
      { id: '4', name: 'Communication', rating: 0, comment: '', weight: 15 },
      { id: '5', name: 'Teamwork', rating: 0, comment: '', weight: 15 },
      { id: '6', name: 'Initiative', rating: 0, comment: '', weight: 15 }
    ],
    strengths: [],
    areasForImprovement: []
  },
  achievements: {
    keyResponsibilities: [],
    goals: [],
    keyAccomplishments: [],
    additionalContributions: []
  },
  development: {
    trainingNeeds: [],
    careerAspirations: '',
    skillsToImprove: [],
    developmentPlan: []
  },
  comments: {
    employeeComments: '',
    managerComments: '',
    hrComments: ''
  },
  ratings: {
    finalRating: 0,
    recommendation: 'maintain-current',
    salaryRecommendation: ''
  }
}

export const appraisalSteps = [
  {
    id: 1,
    title: 'Employee Details',
    description: 'Basic employee information and review period'
  },
  {
    id: 2,
    title: 'Key Responsibility and Achievements',
    description: 'Review key responsibilities and achievements'
  },
  {
    id: 3,
    title: 'Development Planning',
    description: 'Identify development needs and career plans'
  },
  {
    id: 4,
    title: 'Performance Assessment',
    description: 'Rate performance in key areas'
  },
  {
    id: 5,
    title: 'Comments & Feedback',
    description: 'Add comments and feedback'
  },
  {
    id: 6,
    title: 'Final Review',
    description: 'Overall rating and recommendations'
  }
]

export const performanceCategories = [
  { id: 'job-knowledge', name: 'Job Knowledge', weight: 20 },
  { id: 'quality', name: 'Quality of Work', weight: 20 },
  { id: 'productivity', name: 'Productivity', weight: 15 },
  { id: 'communication', name: 'Communication', weight: 15 },
  { id: 'teamwork', name: 'Teamwork', weight: 15 },
  { id: 'initiative', name: 'Initiative', weight: 15 }
]

export const ratingScale = [
  { value: 1, label: 'Below Expectations', description: 'Performance consistently below required standards' },
  { value: 2, label: 'Partially Meets Expectations', description: 'Performance sometimes meets required standards' },
  { value: 3, label: 'Meets Expectations', description: 'Performance consistently meets required standards' },
  { value: 4, label: 'Exceeds Expectations', description: 'Performance consistently exceeds required standards' },
  { value: 5, label: 'Outstanding', description: 'Performance significantly exceeds all expectations' }
]

export const recommendationTypes = [
  { value: 'promotion', label: 'Promotion', description: 'Ready for advancement' },
  { value: 'lateral-move', label: 'Lateral Move', description: 'Consider for different role at same level' },
  { value: 'improvement-plan', label: 'Improvement Plan', description: 'Requires performance improvement plan' },
  { value: 'maintain-current', label: 'Maintain Current', description: 'Continue in current role' }
]

export const goalStatuses = [
  { value: 'achieved', label: 'Fully Achieved', color: 'green' },
  { value: 'partially-achieved', label: 'Partially Achieved', color: 'yellow' },
  { value: 'not-achieved', label: 'Not Achieved', color: 'red' }
]
