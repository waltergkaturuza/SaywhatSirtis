export interface TrainingFormData {
  title: string
  category: string
  duration: string
  format: string
  capacity: string
  instructor: string
  status: string
  startDate: string
  endDate: string
  description: string
  certificationAvailable: boolean
  level: string
  prerequisites: string
  location: string
  cost: string
  provider: string
  materials: string[]
  objectives: string[]
  audience: string
  language: string
  equipment: string[]
  assessment: string
  followUp: string
  budget: string
  approval: string
  notes: string
}

export const defaultTrainingFormData: TrainingFormData = {
  title: '',
  category: '',
  duration: '',
  format: '',
  capacity: '',
  instructor: '',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  description: '',
  certificationAvailable: false,
  level: '',
  prerequisites: '',
  location: '',
  cost: '',
  provider: '',
  materials: [],
  objectives: [],
  audience: '',
  language: 'English',
  equipment: [],
  assessment: '',
  followUp: '',
  budget: '',
  approval: 'pending',
  notes: ''
}