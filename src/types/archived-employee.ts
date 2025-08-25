export interface ArchivedEmployee {
  id: string
  email: string
  username?: string
  department?: string
  position?: string
  phone?: string
  archiveDate?: Date
  archiveReason?: string
  clearanceStatus?: string
  supervisor?: string
  exitInterview?: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
}

export interface ArchiveStats {
  totalArchived: number
  thisYear: number
  accessRevoked: number
  dataRetained: number
}

export interface ArchiveReasonsBreakdown {
  [reason: string]: number
}

export interface ArchivedEmployeeData {
  employees: ArchivedEmployee[]
  stats: ArchiveStats
  reasonsBreakdown: ArchiveReasonsBreakdown
}

export interface ArchiveEmployeeRequest {
  employeeId: string
  reason: string
  exitInterview?: boolean
  notes?: string
}

export interface RestoreEmployeeRequest {
  employeeId: string
  action: 'restore'
}
