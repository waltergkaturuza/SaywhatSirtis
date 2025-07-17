export interface AppraisalFormData {
  // Employee Information
  employeeId: string
  employeeName: string
  position: string
  department: string
  supervisor: string
  reviewer: string
  
  // Appraisal Period
  appraisalPeriod: string
  startDate: string
  endDate: string
  appraisalType: string
  
  // Performance Areas
  performanceAreas: {
    area: string
    description: string
    weight: number
    rating: number
    comments: string
    evidence: string
  }[]
  
  // Key Achievements
  achievements: {
    achievement: string
    impact: string
    evidence: string
  }[]
  
  // Development Areas
  developmentAreas: {
    area: string
    currentLevel: string
    targetLevel: string
    developmentPlan: string
    timeline: string
  }[]
  
  // Goals Assessment
  goals: {
    goal: string
    target: string
    achieved: string
    rating: number
    comments: string
  }[]
  
  // Overall Assessment
  overallRating: number
  overallComments: string
  strengths: string
  areasForImprovement: string
  
  // Development Planning
  careerAspirations: string
  trainingNeeds: string
  recommendedActions: string
  
  // Supervisor Comments
  supervisorComments: string
  supervisorRecommendations: string
  
  // Employee Self-Assessment
  selfAssessmentComments: string
  employeeAgreement: boolean
  employeeComments: string
  
  // Status
  status: string
  submissionDate: string
  reviewDate: string
}

export const defaultFormData: AppraisalFormData = {
  employeeId: "",
  employeeName: "",
  position: "",
  department: "",
  supervisor: "",
  reviewer: "",
  appraisalPeriod: "",
  startDate: "",
  endDate: "",
  appraisalType: "annual",
  performanceAreas: [
    {
      area: "Job Knowledge & Technical Skills",
      description: "",
      weight: 20,
      rating: 0,
      comments: "",
      evidence: ""
    },
    {
      area: "Quality of Work",
      description: "",
      weight: 20,
      rating: 0,
      comments: "",
      evidence: ""
    },
    {
      area: "Communication Skills",
      description: "",
      weight: 15,
      rating: 0,
      comments: "",
      evidence: ""
    },
    {
      area: "Team Collaboration",
      description: "",
      weight: 15,
      rating: 0,
      comments: "",
      evidence: ""
    },
    {
      area: "Initiative & Innovation",
      description: "",
      weight: 15,
      rating: 0,
      comments: "",
      evidence: ""
    },
    {
      area: "Leadership & Management",
      description: "",
      weight: 15,
      rating: 0,
      comments: "",
      evidence: ""
    }
  ],
  achievements: [{ achievement: "", impact: "", evidence: "" }],
  developmentAreas: [{ area: "", currentLevel: "", targetLevel: "", developmentPlan: "", timeline: "" }],
  goals: [{ goal: "", target: "", achieved: "", rating: 0, comments: "" }],
  overallRating: 0,
  overallComments: "",
  strengths: "",
  areasForImprovement: "",
  careerAspirations: "",
  trainingNeeds: "",
  recommendedActions: "",
  supervisorComments: "",
  supervisorRecommendations: "",
  selfAssessmentComments: "",
  employeeAgreement: false,
  employeeComments: "",
  status: "draft",
  submissionDate: "",
  reviewDate: ""
}

export const getRatingLabel = (rating: number) => {
  const labels = {
    1: "Needs Improvement",
    2: "Below Expectations", 
    3: "Meets Expectations",
    4: "Exceeds Expectations",
    5: "Outstanding"
  }
  return labels[rating as keyof typeof labels] || "Not Rated"
}

export const calculateOverallRating = (performanceAreas: AppraisalFormData['performanceAreas']) => {
  const totalWeight = performanceAreas.reduce((sum, area) => sum + area.weight, 0)
  const weightedScore = performanceAreas.reduce((sum, area) => sum + (area.rating * area.weight), 0)
  return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(2) : "0.00"
}

export const appraisalSteps = [
  { id: 1, title: "Employee Details", description: "Basic information and period" },
  { id: 2, title: "Performance Assessment", description: "Rate performance areas" },
  { id: 3, title: "Achievements & Goals", description: "Key achievements and goal assessment" },
  { id: 4, title: "Development Planning", description: "Growth areas and career planning" },
  { id: 5, title: "Comments & Review", description: "Supervisor and employee feedback" },
  { id: 6, title: "Final Review", description: "Submit and finalize appraisal" }
]
