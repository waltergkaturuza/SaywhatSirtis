import { useState, useEffect, useCallback } from 'react'

interface PayrollData {
  employees: any[]
  periods: any[]
  totalGrossPay: number
  totalNetPay: number
  totalDeductions: number
  approvedCount: number
  loading: boolean
  error: string | null
}

export function usePayrollData() {
  const [data, setData] = useState<PayrollData>({
    employees: [],
    periods: [],
    totalGrossPay: 0,
    totalNetPay: 0,
    totalDeductions: 0,
    approvedCount: 0,
    loading: true,
    error: null
  })
  
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null)

  // Fetch payroll data
  const fetchPayrollData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      // Fetch periods
      const periodsResponse = await fetch('/api/hr/payroll?action=periods')
      if (!periodsResponse.ok) {
        throw new Error('Failed to fetch periods')
      }
      const periodsResult = await periodsResponse.json()
      const periods = periodsResult.periods || []
      
      // If we have periods, fetch records for the first period
      let employees = []
      let totalGrossPay = 0
      let totalNetPay = 0
      let totalDeductions = 0
      let approvedCount = 0
      
      if (periods.length > 0) {
        const firstPeriod = periods[0]
        const recordsResponse = await fetch(`/api/hr/payroll?action=records&periodId=${firstPeriod.id}`)
        if (recordsResponse.ok) {
          const recordsResult = await recordsResponse.json()
          const records = recordsResult.records || []
          
          // Transform records to match expected format
          employees = records.map((record: any) => ({
            id: record.employee.id,
            name: `${record.employee.firstName} ${record.employee.lastName}`,
            department: record.employee.department?.name || 'Unknown',
            position: record.employee.position || 'Unknown',
            employeeId: record.employee.employeeId,
            basicSalary: record.basicSalary || 0,
            allowances: record.allowances?.reduce((sum: number, a: any) => sum + (a.amount || 0), 0) || 0,
            deductions: record.deductions?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
            grossPay: record.grossPay || 0,
            netPay: record.netPay || 0,
            status: record.status?.toLowerCase() || 'pending'
          }))
          
          // Calculate totals
          totalGrossPay = employees.reduce((sum: number, emp: any) => sum + emp.grossPay, 0)
          totalNetPay = employees.reduce((sum: number, emp: any) => sum + emp.netPay, 0)  
          totalDeductions = employees.reduce((sum: number, emp: any) => sum + emp.deductions, 0)
          approvedCount = employees.filter((emp: any) => emp.status === 'approved').length
        }
      }
      
      setData(prev => ({
        ...prev,
        employees,
        periods,
        totalGrossPay,
        totalNetPay,
        totalDeductions,
        approvedCount,
        loading: false
      }))
      
      // Set default period if none selected
      if (!selectedPeriod && periods.length > 0) {
        setSelectedPeriod(periods[0])
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }, [selectedPeriod])

  // Process payroll
  const processPayroll = useCallback(async (periodId: string) => {
    try {
      const response = await fetch('/api/hr/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'calculate-payroll', periodId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to process payroll')
      }
      
      await fetchPayrollData()
      return true
    } catch (error) {
      console.error('Error processing payroll:', error)
      throw error
    }
  }, [fetchPayrollData])

  // Generate payslips
  const generatePayslips = useCallback(async (periodId: string, employeeIds?: string[]) => {
    try {
      const response = await fetch('/api/hr/payroll/payslips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodId, employeeIds })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate payslips')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslips-${periodId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Error generating payslips:', error)
      throw error
    }
  }, [])

  // Create pay period
  const createPayPeriod = useCallback(async (periodData: any) => {
    try {
      const response = await fetch('/api/hr/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-period', ...periodData })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create pay period')
      }
      
      const newPeriod = await response.json()
      await fetchPayrollData()
      setSelectedPeriod(newPeriod)
      return newPeriod
    } catch (error) {
      console.error('Error creating pay period:', error)
      throw error
    }
  }, [fetchPayrollData])

  // Approve payroll
  const approvePayroll = useCallback(async (periodId: string) => {
    try {
      const response = await fetch('/api/hr/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve-payroll', periodId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve payroll')
      }
      
      await fetchPayrollData()
      return true
    } catch (error) {
      console.error('Error approving payroll:', error)
      throw error
    }
  }, [fetchPayrollData])

  // Export data
  const exportData = useCallback(async (periodId: string, format: 'csv' | 'excel' = 'csv') => {
    try {
      const response = await fetch(`/api/hr/payroll/export?periodId=${periodId}&format=${format}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payroll-export-${periodId}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  }, [])

  // Generate report
  const generateReport = useCallback(async (reportType: string, periodId?: string) => {
    try {
      const response = await fetch('/api/hr/payroll/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportType, periodId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }, [])

  // Fetch employees for selected period
  const fetchEmployeesForPeriod = useCallback(async (periodId: string) => {
    try {
      const response = await fetch(`/api/hr/payroll/employees?periodId=${periodId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }
      
      const employees = await response.json()
      setData(prev => ({ ...prev, employees }))
      return employees
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  }, [])

  // Initialize data on mount
  useEffect(() => {
    fetchPayrollData()
  }, [fetchPayrollData])

  // Update employees when period changes
  useEffect(() => {
    if (selectedPeriod?.id) {
      fetchEmployeesForPeriod(selectedPeriod.id)
    }
  }, [selectedPeriod, fetchEmployeesForPeriod])

  return {
    data,
    selectedPeriod,
    setSelectedPeriod,
    processPayroll,
    generatePayslips,
    createPayPeriod,
    approvePayroll,
    exportData,
    generateReport,
    fetchPayrollData,
    fetchEmployeesForPeriod
  }
}
