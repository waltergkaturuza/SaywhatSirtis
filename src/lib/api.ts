// API utilities for HR module
export const hrApi = {
  async createAppraisal(data: { formData: any; isDraft: boolean }) {
    // Mock API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: data.isDraft 
            ? 'Draft saved successfully' 
            : 'Appraisal created successfully',
          id: Math.random().toString(36).substr(2, 9)
        })
      }, 1000)
    })
  },

  async getAppraisals() {
    // Mock API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: []
        })
      }, 500)
    })
  },

  async getAppraisal(id: string) {
    // Mock API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: null
        })
      }, 500)
    })
  },

  async updateAppraisal(id: string, data: any) {
    // Mock API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Appraisal updated successfully'
        })
      }, 1000)
    })
  },

  async deleteAppraisal(id: string) {
    // Mock API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Appraisal deleted successfully'
        })
      }, 500)
    })
  }
}
