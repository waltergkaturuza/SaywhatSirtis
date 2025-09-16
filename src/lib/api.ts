// API utilities for HR module
export const hrApi = {
  async createAppraisal(data: { formData: any; isDraft: boolean }) {
    try {
      const response = await fetch('/api/hr/appraisals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating appraisal:', error)
      throw error
    }
  },

  async getAppraisals() {
    try {
      const response = await fetch('/api/hr/appraisals')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching appraisals:', error)
      throw error
    }
  },

  async getAppraisal(id: string) {
    try {
      const response = await fetch(`/api/hr/appraisals/${id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching appraisal:', error)
      throw error
    }
  },

  async updateAppraisal(id: string, data: any) {
    try {
      const response = await fetch(`/api/hr/appraisals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating appraisal:', error)
      throw error
    }
  },

  async deleteAppraisal(id: string) {
    try {
      const response = await fetch(`/api/hr/appraisals/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error deleting appraisal:', error)
      throw error
    }
  }
}
