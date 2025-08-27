export interface Event {
  id: string
  name: string
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  status: string
  type: string
  category: string
  budget: number
  actualCost: number
  capacity: number
  expectedAttendees: number
  actualAttendees: number
  organizer: {
    name: string
    email: string
  }
  organizerUserId: string
  speakers: Array<{
    name: string
    bio: string
  }>
  instructor: string
  attendees: Array<{
    id: string
    name: string
    email: string
  }>
  registrations: Array<{
    id: string
    userId: string
    participantName: string
    participantEmail: string
    status: string
  }>
  createdAt: string
  updatedAt: string
}