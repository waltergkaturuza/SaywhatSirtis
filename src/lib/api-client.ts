// Enhanced API utilities with proper error handling and types

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status?: number
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('Content-Type')
    const isJson = contentType?.includes('application/json')
    
    let data: any
    try {
      data = isJson ? await response.json() : await response.text()
    } catch (error) {
      data = null
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: data?.code,
        details: data?.details
      }
      
      throw error
    }

    return {
      success: true,
      data,
      status: response.status,
      message: data?.message
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        // Re-throw ApiError
        throw error
      }
      
      // Network or other errors
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async get<T>(endpoint: string, options: Omit<RequestInit, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T>(endpoint: string, data?: any, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string, options: Omit<RequestInit, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Default API client instance
export const apiClient = new ApiClient()

// Specific API functions for common operations
export const hrApi = {
  // Appraisals
  createAppraisal: async (data: any) => {
    return apiClient.post('/api/hr/appraisals', data)
  },
  
  getAppraisals: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`/api/hr/appraisals${query}`)
  },
  
  getAppraisal: async (id: string) => {
    return apiClient.get(`/api/hr/appraisals/${id}`)
  },
  
  updateAppraisal: async (id: string, data: any) => {
    return apiClient.put(`/api/hr/appraisals/${id}`, data)
  },
  
  deleteAppraisal: async (id: string) => {
    return apiClient.delete(`/api/hr/appraisals/${id}`)
  },

  // Performance Plans
  createPlan: async (data: any) => {
    return apiClient.post('/api/hr/plans', data)
  },
  
  getPlans: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`/api/hr/plans${query}`)
  },
  
  getPlan: async (id: string) => {
    return apiClient.get(`/api/hr/plans/${id}`)
  },
  
  updatePlan: async (id: string, data: any) => {
    return apiClient.put(`/api/hr/plans/${id}`, data)
  },

  // Employees
  getEmployees: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`/api/hr/employees${query}`)
  },
  
  getEmployee: async (id: string) => {
    return apiClient.get(`/api/hr/employees/${id}`)
  },
  
  createEmployee: async (data: any) => {
    return apiClient.post('/api/hr/employees', data)
  },
  
  updateEmployee: async (id: string, data: any) => {
    return apiClient.put(`/api/hr/employees/${id}`, data)
  },

  // Analytics
  getAnalytics: async (type: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`/api/hr/analytics/${type}${query}`)
  }
}

export const programsApi = {
  // Projects
  getProjects: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`/api/programs/projects${query}`)
  },
  
  getProject: async (id: string) => {
    return apiClient.get(`/api/programs/projects/${id}`)
  },
  
  createProject: async (data: any) => {
    return apiClient.post('/api/programs/projects', data)
  },
  
  updateProject: async (id: string, data: any) => {
    return apiClient.put(`/api/programs/projects/${id}`, data)
  },
  
  deleteProject: async (id: string) => {
    return apiClient.delete(`/api/programs/projects/${id}`)
  },

  // Milestones
  getMilestones: async (projectId: string) => {
    return apiClient.get(`/api/programs/projects/${projectId}/milestones`)
  },
  
  createMilestone: async (projectId: string, data: any) => {
    return apiClient.post(`/api/programs/projects/${projectId}/milestones`, data)
  },
  
  updateMilestone: async (projectId: string, milestoneId: string, data: any) => {
    return apiClient.put(`/api/programs/projects/${projectId}/milestones/${milestoneId}`, data)
  },
  
  deleteMilestone: async (projectId: string, milestoneId: string) => {
    return apiClient.delete(`/api/programs/projects/${projectId}/milestones/${milestoneId}`)
  }
}

export const documentsApi = {
  upload: async (file: File, metadata?: any) => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    
    return apiClient.post('/api/documents/upload', formData, {
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
      }
    })
  },
  
  getDocuments: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`/api/documents${query}`)
  },
  
  getDocument: async (id: string) => {
    return apiClient.get(`/api/documents/${id}`)
  },
  
  deleteDocument: async (id: string) => {
    return apiClient.delete(`/api/documents/${id}`)
  },
  
  search: async (query: string, filters?: any) => {
    return apiClient.post('/api/documents/search', { query, filters })
  }
}

// Utility functions for error handling
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'message' in error && 'status' in error
}

// Response helpers
export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message
})

export const createErrorResponse = (error: string, status: number = 400): ApiResponse => ({
  success: false,
  error,
  status
})

// Retry mechanism
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries - 1) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  
  throw lastError
}
