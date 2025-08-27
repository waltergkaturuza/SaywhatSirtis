export interface Project {
  id: string
  name: string
  title: string
  description: string
  status: string
  priority: string
  startDate: string
  endDate: string
  budget: number
  actualCost: number
  progress: number
  manager: string
  managerId: string
  team: Array<{
    id: string
    name: string
    role: string
  }>
  location: string
  category: string
  type: string
  expectedAttendees: number
  actualAttendees: number
  organizer: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}