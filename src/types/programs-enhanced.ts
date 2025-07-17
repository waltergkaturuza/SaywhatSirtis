// Enhanced Project Management Types with Gantt Charts, WBS, and Advanced Features

export interface Project {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'suspended' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
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
  
  // Enhanced Project Management Features
  projectCode: string
  category: 'development' | 'humanitarian' | 'advocacy' | 'research'
  riskLevel: 'low' | 'medium' | 'high'
  stakeholders: Stakeholder[]
  workBreakdownStructure: WBSNode[]
  milestones: Milestone[]
  tasks: Task[]
  resources: Resource[]
  dependencies: Dependency[]
  risks: Risk[]
  issues: Issue[]
  changeRequests: ChangeRequest[]
  documents: ProjectDocument[]
  communications: Communication[]
  budgetBreakdown: BudgetCategory[]
  timeTracking: TimeEntry[]
  qualityMetrics: QualityMetric[]
}

export interface WBSNode {
  id: string
  projectId: number
  parentId?: string
  code: string
  name: string
  description: string
  level: number
  type: 'phase' | 'deliverable' | 'work_package' | 'activity' | 'task'
  assignee?: string
  startDate: string
  endDate: string
  estimatedHours: number
  actualHours: number
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  budget: number
  spent: number
  children: WBSNode[]
  dependencies: string[]
  risks: string[]
  deliverables: string[]
}

export interface Task {
  id: string
  projectId: number
  wbsNodeId?: string
  name: string
  description: string
  assignee: string
  reviewer?: string
  startDate: string
  endDate: string
  duration: number
  progress: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  estimatedHours: number
  actualHours: number
  remainingHours: number
  predecessors: string[]
  successors: string[]
  type: 'task' | 'milestone' | 'summary'
  isBlocking: boolean
  tags: string[]
  attachments: string[]
  comments: TaskComment[]
  timeEntries: TimeEntry[]
}

export interface Milestone {
  id: string
  projectId: number
  name: string
  description: string
  dueDate: string
  status: 'upcoming' | 'at_risk' | 'completed' | 'missed'
  type: 'project_start' | 'phase_completion' | 'deliverable' | 'approval' | 'project_end'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  dependencies: string[]
  deliverables: string[]
  stakeholders: string[]
  approvalRequired: boolean
  approver?: string
  approvalDate?: string
  notes: string
}

export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  type: 'task' | 'milestone' | 'summary'
  dependencies: string[]
  assignee: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  isBlocking: boolean
  parent?: string
  children?: GanttTask[]
}

export interface Resource {
  id: string
  projectId: number
  name: string
  type: 'human' | 'equipment' | 'material' | 'facility' | 'software'
  role?: string
  department?: string
  costPerHour?: number
  availability: number
  allocation: ResourceAllocation[]
  skills: string[]
  location: string
  contact: string
}

export interface ResourceAllocation {
  taskId: string
  startDate: string
  endDate: string
  allocatedHours: number
  allocatedPercentage: number
}

export interface Dependency {
  id: string
  projectId: number
  predecessorId: string
  successorId: string
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
  lag: number
  description: string
}

export interface Risk {
  id: string
  projectId: number
  title: string
  description: string
  category: 'technical' | 'financial' | 'operational' | 'external' | 'legal' | 'environmental'
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  riskScore: number
  status: 'identified' | 'analyzed' | 'mitigated' | 'closed' | 'occurred'
  owner: string
  identifiedDate: string
  mitigationPlan: string
  contingencyPlan: string
  mitigationActions: RiskAction[]
  reviewDate: string
}

export interface RiskAction {
  id: string
  riskId: string
  action: string
  assignee: string
  dueDate: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  notes: string
}

export interface Issue {
  id: string
  projectId: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  category: 'technical' | 'scope' | 'schedule' | 'budget' | 'quality' | 'communication'
  reportedBy: string
  assignedTo: string
  reportedDate: string
  resolvedDate?: string
  resolutionNotes?: string
  impact: string
  attachments: string[]
  comments: IssueComment[]
}

export interface ChangeRequest {
  id: string
  projectId: number
  title: string
  description: string
  requestedBy: string
  requestDate: string
  type: 'scope' | 'schedule' | 'budget' | 'quality' | 'resource'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented'
  impact: {
    schedule: number
    budget: number
    scope: string
    resources: string
    risks: string
  }
  justification: string
  approver?: string
  approvalDate?: string
  implementationDate?: string
  reviewComments: string[]
}

export interface Stakeholder {
  id: string
  projectId: number
  name: string
  role: string
  organization: string
  type: 'internal' | 'external' | 'donor' | 'beneficiary' | 'government'
  influence: 'low' | 'medium' | 'high'
  interest: 'low' | 'medium' | 'high'
  powerLevel: 'low' | 'medium' | 'high'
  communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'as_needed'
  preferredCommunication: 'email' | 'phone' | 'meeting' | 'report'
  contact: {
    email: string
    phone: string
    address: string
  }
  expectations: string
  concerns: string[]
}

export interface ProjectDocument {
  id: string
  projectId: number
  name: string
  type: 'proposal' | 'contract' | 'report' | 'plan' | 'specification' | 'other'
  category: 'planning' | 'execution' | 'monitoring' | 'closure'
  version: string
  status: 'draft' | 'review' | 'approved' | 'obsolete'
  author: string
  createdDate: string
  lastModified: string
  filePath: string
  fileSize: number
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  tags: string[]
  description: string
}

export interface Communication {
  id: string
  projectId: number
  type: 'meeting' | 'email' | 'report' | 'presentation' | 'call'
  subject: string
  participants: string[]
  date: string
  duration?: number
  agenda?: string
  summary: string
  actionItems: ActionItem[]
  attachments: string[]
  followUpRequired: boolean
  followUpDate?: string
}

export interface ActionItem {
  id: string
  communicationId: string
  description: string
  assignee: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
}

export interface BudgetCategory {
  id: string
  projectId: number
  category: string
  subcategory: string
  budgeted: number
  committed: number
  spent: number
  remaining: number
  percentage: number
  variance: number
  forecastSpend: number
  approvedBy: string
  notes: string
}

export interface TimeEntry {
  id: string
  projectId: number
  taskId?: string
  userId: string
  date: string
  hours: number
  description: string
  category: 'development' | 'management' | 'meeting' | 'documentation' | 'testing' | 'other'
  billable: boolean
  approved: boolean
  approvedBy?: string
  approvalDate?: string
}

export interface QualityMetric {
  id: string
  projectId: number
  name: string
  description: string
  target: number
  actual: number
  unit: string
  category: 'defects' | 'performance' | 'usability' | 'reliability' | 'maintainability'
  measurementDate: string
  status: 'on_target' | 'below_target' | 'above_target'
  trend: 'improving' | 'stable' | 'declining'
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  comment: string
  timestamp: string
  attachments: string[]
}

export interface IssueComment {
  id: string
  issueId: string
  userId: string
  comment: string
  timestamp: string
  attachments: string[]
}

// Filter and Search Interfaces
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
  priority: string
  category: string
  manager: string
  riskLevel: string
}

export interface ProjectMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  totalBudget: number
  totalSpent: number
  averageProgress: number
  overdueProjects: number
  upcomingMilestones: number
  highRiskProjects: number
  resourceUtilization: number
  deliverySuccess: number
}

// Reporting Interfaces
export interface ProjectReport {
  id: string
  projectId: number
  type: 'status' | 'progress' | 'financial' | 'risk' | 'milestone' | 'resource'
  period: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  generatedDate: string
  generatedBy: string
  recipients: string[]
  data: Record<string, unknown>
  charts: ReportChart[]
  recommendations: string[]
}

export interface ReportChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'gantt' | 'burndown'
  title: string
  data: Record<string, unknown>
  config: Record<string, unknown>
}

// Dashboard Configuration
export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'gantt' | 'calendar'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  config: Record<string, unknown>
  dataSource: string
  refreshInterval: number
}

// Legacy types for compatibility
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
