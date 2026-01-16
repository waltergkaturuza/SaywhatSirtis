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
      rating: number // Employee's self-rating
      comment: string // Employee's comment
      weight: number
      description?: string
      // Supervisor's rating and comment
      supervisorRating?: number
      supervisorComment?: string
      // Reviewer's final rating (overrides both)
      reviewerRating?: number
      reviewerComment?: string
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
        target: number
        actualValue: number // Employee's actual value
        weight: number
        measurement: string
        achievementPercentage?: number
        // Supervisor's actual value
        supervisorActualValue?: number
        // Reviewer's actual value
        reviewerActualValue?: number
      }[]
      totalScore?: number
      achievedScore?: number
      achievementPercentage?: number
      // Supervisor's assessment
      supervisorAchievementPercentage?: number
      supervisorAchievedScore?: number
      supervisorTotalScore?: number
      // Reviewer's final assessment
      reviewerAchievementPercentage?: number
      reviewerAchievedScore?: number
      reviewerTotalScore?: number
    }[]
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
    actualPoints: number
    maxPoints: number
    percentage: number
    ratingCode: string
    recommendation: 'promotion' | 'lateral-move' | 'improvement-plan' | 'maintain-current'
    salaryRecommendation: string
  }
  signatures: {
    supervisorSignature: string
    supervisorSignedAt?: string
    supervisorMeetingDate?: string
    supervisorMeetingConfirmed: boolean
    reviewerSignature: string
    reviewerSignedAt?: string
    reviewerMeetingDate?: string
    reviewerMeetingConfirmed: boolean
  }
  status?: string
  workflowStatus?: string
  appraisalType?: string
  recommendations?: any
  submittedAt?: string
  approvedAt?: string
  createdAt?: string
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
      { id: '1', name: 'Teamwork', rating: 0, comment: '', weight: 20, description: 'Working collaboratively with others to achieve common goals and support team success.' },
      { id: '2', name: 'Responsiveness and Effectiveness', rating: 0, comment: '', weight: 20, description: 'Acting promptly and efficiently to meet stakeholder needs and deliver quality results.' },
      { id: '3', name: 'Accountability', rating: 0, comment: '', weight: 20, description: 'Taking ownership of responsibilities and being answerable for actions and outcomes.' },
      { id: '4', name: 'Professionalism and Integrity', rating: 0, comment: '', weight: 20, description: 'Maintaining high ethical standards, honesty, and professional conduct in all interactions.' },
      { id: '5', name: 'Innovation', rating: 0, comment: '', weight: 20, description: 'Embracing creativity and new ideas to improve processes, services, and outcomes.' }
    ],
    strengths: [],
    areasForImprovement: []
  },
  achievements: {
    keyResponsibilities: []
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
    actualPoints: 0,
    maxPoints: 0,
    percentage: 0,
    ratingCode: '',
    recommendation: 'maintain-current',
    salaryRecommendation: ''
  },
  signatures: {
    supervisorSignature: '',
    supervisorSignedAt: undefined,
    supervisorMeetingDate: undefined,
    supervisorMeetingConfirmed: false,
    reviewerSignature: '',
    reviewerSignedAt: undefined,
    reviewerMeetingDate: undefined,
    reviewerMeetingConfirmed: false
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

// SAYWHAT Performance Appraisal Rating Scale
export const ratingScale = [
  { value: 50, code: 'A1', label: 'Outstanding performance, High expertise', description: 'Outstanding performance. High levels of expertise', points: 50, range: '90 - 100%' },
  { value: 40, code: 'A2', label: 'Consistently exceeds requirements', description: 'Consistently exceeds requirements', points: 40, range: '75 - 89%' },
  { value: 30, code: 'B1', label: 'Meets and occasionally exceeds requirements', description: 'Meets requirements. Occasionally exceeds them', points: 30, range: '60 - 74%' },
  { value: 25, code: 'B2', label: 'Meets requirements', description: 'Meets requirements', points: 25, range: '50 - 59%' },
  { value: 15, code: 'C1', label: 'Partially meets requirements; needs improvement', description: 'Partially meets requirements. Improvement required', points: 15, range: '40 - 49%' },
  { value: 10, code: 'C2', label: 'Unacceptable; below standard', description: 'Unacceptable. Well below standard required', points: 10, range: '39% and below' }
]

// Helper function to get rating label from points
export const getRatingFromPoints = (points: number) => {
  return ratingScale.find(scale => scale.value === points) || ratingScale[ratingScale.length - 1]
}

// Helper function to calculate percentage
export const calculatePerformancePercentage = (actualPoints: number, maxPoints: number): number => {
  if (maxPoints === 0) return 0
  return Math.round((actualPoints / maxPoints) * 100)
}

// Helper function to get rating code from percentage
export const getRatingCodeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A1'
  if (percentage >= 75) return 'A2'
  if (percentage >= 60) return 'B1'
  if (percentage >= 50) return 'B2'
  if (percentage >= 40) return 'C1'
  return 'C2'
}

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
