// Call Centre comprehensive types
export interface CallFormData {
  callerName: string
  callerPhone: string
  callerEmail: string
  callType: string
  category: string
  priority: string
  status: string
  assignedAgent: {
    id: string
    name: string
  }
  subject: string
  description: string
  notes: Array<{
    id: string
    content: string
    timestamp: string
    author: string
  }>
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
  duration: string
  followUpRequired: boolean
  followUpDate: string
  tags: string[]
  location: string
  department: string
  source: string
}

export interface CallRecord {
  id: string
  subject: string
  description: string | null
  callerName: string
  callerPhone: string | null
  callerEmail: string | null
  callType: string | null
  category: string | null
  priority: string | null
  status: string
  assignedAgent: any // JSON
  duration: number | null
  outcome: string | null
  followUpRequired: boolean
  followUpDate: Date | null
  tags: string[]
  location: string | null
  department: string | null
  source: string | null
  notes: any // JSON
  attachments: any // JSON
  createdAt: Date
  updatedAt: Date
}

export interface CaseRecord {
  id: string
  caseNumber: string
  title: string
  description: string | null
  category: string
  priority: string
  status: string
  assignedTo: string | null
  createdBy: string
  resolution: string | null
  closedAt: Date | null
  dueDate: Date | null
  tags: string[]
  relatedCalls: string[] // Array of call IDs
  attachments: any // JSON
  notes: any // JSON
  escalationLevel: number
  satisfaction: number | null
  createdAt: Date
  updatedAt: Date
}

export const defaultCallFormData: CallFormData = {
  callerName: '',
  callerPhone: '',
  callerEmail: '',
  callType: 'inbound',
  category: 'inquiry',
  priority: 'medium',
  status: 'new',
  assignedAgent: { id: '', name: '' },
  subject: '',
  description: '',
  notes: [],
  attachments: [],
  duration: '',
  followUpRequired: false,
  followUpDate: '',
  tags: [],
  location: '',
  department: '',
  source: 'phone'
}
