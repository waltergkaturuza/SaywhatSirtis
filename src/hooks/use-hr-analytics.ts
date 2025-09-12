import { useState, useCallback } from 'react'

interface UseHRAnalyticsProps {
  initialPeriod?: string
  initialDepartment?: string
}

export const useHRAnalytics = ({ 
  initialPeriod = '12months', 
  initialDepartment = 'all' 
}: UseHRAnalyticsProps = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (err) {
      console.error('Fetch error:', err)
      throw err
    }
  }, [])

  const refreshAllData = useCallback(async (period: string, department: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const [
        metricsData,
        departmentsData,
        turnoverData,
        performanceData,
        salaryData
      ] = await Promise.all([
        fetchData(`/api/hr/analytics/metrics?period=${period}&department=${department}`),
        fetchData(`/api/hr/analytics/departments?period=${period}`),
        fetchData(`/api/hr/analytics/turnover?period=${period}`),
        fetchData(`/api/hr/analytics/performance?period=${period}&department=${department}`),
        fetchData(`/api/hr/analytics/salary?department=${department}`)
      ])

      setLastUpdated(new Date())
      
      return {
        metrics: metricsData,
        departments: departmentsData,
        turnover: turnoverData,
        performance: performanceData,
        salary: salaryData
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  const exportData = useCallback(async (type: string, period: string, department: string) => {
    try {
      const response = await fetch(`/api/hr/analytics/export?type=${type}&period=${period}&department=${department}`)
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hr-${type}-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      throw err
    }
  }, [])

  return {
    loading,
    error,
    lastUpdated,
    refreshAllData,
    exportData,
    clearError: () => setError(null)
  }
}
