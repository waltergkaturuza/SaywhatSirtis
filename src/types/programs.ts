export interface Project {
  id: number
  name: string
  projectGoal?: string
  description: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'suspended'
  donor: string
  country: string
  province: string
  manager: string
  budget: number
  spent: number
  targetReach: number
  currentReach: number
  genderReach: {
    male: number
    female: number
    other?: number
  }
  ageGroups: {
    children: number
    youth: number
    adults: number
    elderly: number
  }
  progress: number
  sectors: string[]
  lastUpdate: string
  koboForms?: KoboForm[]
  indicators?: MEIndicator[]
}

export interface KoboForm {
  id: string
  name: string
  projectId: number
  url: string
  status: 'active' | 'inactive' | 'draft'
  submissions: number
  lastSync: string
}

export interface MEIndicator {
  id: number
  projectId: number
  name: string
  description: string
  target: number
  current: number
  unit: string
  measurementMethod: string
  dataSource: string
  frequency: 'monthly' | 'quarterly' | 'annually'
  status: 'on-track' | 'behind' | 'ahead' | 'completed'
  lastUpdated: string
}

export interface DataEntry {
  id: number
  projectId: number
  indicatorId: number
  value: number
  date: string
  location: string
  gender?: 'male' | 'female' | 'other'
  ageGroup?: 'children' | 'youth' | 'adults' | 'elderly'
  source: 'manual' | 'kobo' | 'api'
  verified: boolean
  enteredBy: string
}

export interface ProgramsFilters {
  searchTerm: string
  dateFrom: string
  dateTo: string
  country: string
  province: string
  status: string
  donor: string
  sector: string
  genderReach: string
}
