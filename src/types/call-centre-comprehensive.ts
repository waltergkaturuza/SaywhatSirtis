// Call Centre Comprehensive Types
export interface CallRecord {
  id: string
  callNumber: string
  subject: string
  description: string | null
  summary: string | null
  callerName: string
  callerFullName: string
  callerPhone: string | null
  callerPhoneNumber: string | null
  callerEmail: string | null
  callerAddress: string | null
  callerAge: number | null
  callerGender: string | null
  callerProvince: string | null
  callerKeyPopulation: string | null
  callType: string | null
  category: string | null
  priority: string | null
  status: string
  purpose: string | null
  validity: string | null
  communicationMode: string | null
  modeOfCommunication: string | null
  source: string | null
  newOrRepeatCall: string | null
  assignedAgent: any // JSON
  assignedOfficer: string | null
  assignedEmail: string | null
  assignedTo: string | null
  duration: number | null
  time: string | null
  dateTime: Date | null
  reportDate: Date | null
  outcome: string | null
  resolution: string | null
  followUpRequired: boolean
  followUpDate: Date | null
  estimatedResolutionTime: number | null
  referredTo: string | null
  servicesRecommended: string | null
  nextSteps: string | null
  tags: string[]
  location: string | null
  department: string | null
  supportDepartment: string | null
  officerName: string | null
  notes: any // JSON
  attachments: any // JSON
  perpetrator: string | null
  howDidYouHearAboutUs: string | null
  voucherIssued: boolean
  voucherValue: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CallFormData {
  callNumber: string
  callerName: string
  callerFullName: string
  callerPhone: string
  callerPhoneNumber: string
  callerEmail: string
  callerAddress: string
  callerAge: string
  callerGender: string
  callerProvince: string
  callerKeyPopulation: string
  callType: string
  category: string
  priority: string
  status: string
  purpose: string
  validity: string
  communicationMode: string
  modeOfCommunication: string
  source: string
  newOrRepeatCall: string
  assignedAgent: {
    id: string
    name: string
  }
  assignedOfficer: string
  assignedEmail: string
  assignedTo: string
  subject: string
  description: string
  summary: string
  duration: string
  time: string
  dateTime: string
  reportDate: string
  followUpRequired: boolean
  followUpDate: string
  estimatedResolutionTime: string
  referredTo: string
  servicesRecommended: string
  nextSteps: string
  tags: string[]
  location: string
  department: string
  supportDepartment: string
  officerName: string
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
  perpetrator: string
  howDidYouHearAboutUs: string
  voucherIssued: boolean
  voucherValue: string
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
  assignedOfficer: string | null
  createdBy: string
  resolution: string | null
  closedAt: Date | null
  dueDate: Date | null
  estimatedResolutionTime: number | null
  tags: string[]
  relatedCalls: string[]
  attachments: any // JSON
  notes: any // JSON
  escalationLevel: number
  satisfaction: number | null
  followUpRequired: boolean
  followUpDate: Date | null
  referredTo: string | null
  createdAt: Date
  updatedAt: Date
}

export const defaultCallFormData: CallFormData = {
  callNumber: '',
  callerName: '',
  callerFullName: '',
  callerPhone: '',
  callerPhoneNumber: '',
  callerEmail: '',
  callerAddress: '',
  callerAge: '',
  callerGender: '',
  callerProvince: '',
  callerKeyPopulation: '',
  callType: 'inbound',
  category: 'inquiry',
  priority: 'medium',
  status: 'new',
  purpose: '',
  validity: '',
  communicationMode: 'phone',
  modeOfCommunication: 'phone',
  source: 'phone',
  newOrRepeatCall: 'new',
  assignedAgent: { id: '', name: '' },
  assignedOfficer: '',
  assignedEmail: '',
  assignedTo: '',
  subject: '',
  description: '',
  summary: '',
  duration: '',
  time: '',
  dateTime: '',
  reportDate: '',
  followUpRequired: false,
  followUpDate: '',
  estimatedResolutionTime: '',
  referredTo: '',
  servicesRecommended: '',
  nextSteps: '',
  tags: [],
  location: '',
  department: '',
  supportDepartment: '',
  officerName: '',
  notes: [],
  attachments: [],
  perpetrator: '',
  howDidYouHearAboutUs: '',
  voucherIssued: false,
  voucherValue: ''
}
