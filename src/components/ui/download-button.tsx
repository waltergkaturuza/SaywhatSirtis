'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react'
import { exportService } from '@/lib/export-service'
import { toast } from 'sonner'

interface DownloadButtonProps {
  data: any[]
  filename?: string
  format?: 'pdf' | 'excel' | 'csv' | 'json'
  headers?: string[]
  title?: string
  description?: string
  metadata?: {
    title?: string
    author?: string
    subject?: string
    department?: string
    [key: string]: any
  }
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  disabled?: boolean
  iconOnly?: boolean
  onDownloadStart?: () => void
  onDownloadComplete?: (success: boolean) => void
  onDownloadError?: (error: string) => void
}

export function DownloadButton({
  data,
  filename,
  format = 'pdf',
  headers,
  title,
  description,
  metadata = {},
  variant = 'outline',
  size = 'default',
  className,
  disabled = false,
  iconOnly = false,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (isDownloading || disabled || !data || data.length === 0) {
      return
    }

    setIsDownloading(true)
    
    try {
      if (onDownloadStart) {
        onDownloadStart()
      }

      // Generate filename if not provided
      const downloadFilename = filename || `saywhat-export-${format}-${Date.now()}`
      
      // Prepare metadata with SAYWHAT branding
      const exportMetadata = {
        title: title || 'SAYWHAT Export',
        author: 'SAYWHAT Organization',
        subject: description || 'Data Export',
        department: 'SAYWHAT',
        creator: 'SIRTIS Platform',
        ...metadata
      }

      // Prepare export data in the expected format
      const exportData = {
        headers: headers || (data.length > 0 ? Object.keys(data[0]) : []),
        rows: data.map(item => {
          if (headers) {
            // Map display headers to actual object properties
            return headers.map(header => {
              switch (header) {
                case 'Name': return item.name || item.fullName || ''
                case 'Email': return item.email || ''
                case 'Phone': return item.phone || item.phoneNumber || ''
                case 'Department': return item.department || item.departmentName || ''
                case 'Position': return item.position || item.jobTitle || ''
                case 'Employee ID': return item.employeeId || item.employee_id || ''
                case 'Status': return item.status || ''
                case 'Hire Date': return item.hireDate || item.hire_date || ''
                default: 
                  // Try to find property with similar name (case insensitive)
                  const key = Object.keys(item).find(k => 
                    k.toLowerCase() === header.toLowerCase() ||
                    k.toLowerCase().replace(/[_\s]/g, '') === header.toLowerCase().replace(/[_\s]/g, '')
                  )
                  return key ? item[key] : ''
              }
            })
          } else {
            // Use object keys directly
            return Object.keys(item).map(key => item[key] || '')
          }
        }),
        title: exportMetadata.title,
        metadata: exportMetadata
      }

      const baseOptions = {
        filename: downloadFilename,
        format: format as any,
        title: exportMetadata.title,
        includeLogo: true,
        includeTimestamp: true,
        watermark: true
      }

      console.log('PDF export data preparation:', {
        originalData: data,
        headers: exportData.headers,
        rows: exportData.rows,
        title: exportData.title
      })

      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(exportData, {
            ...baseOptions,
            format: 'pdf'
          })
          break

        case 'excel':
          await exportService.exportToExcel(exportData, {
            ...baseOptions,
            format: 'excel'
          })
          break

        case 'csv':
          await exportService.exportToCSV(exportData, {
            ...baseOptions,
            format: 'csv'
          })
          break

        case 'json':
          await exportService.exportToJSON(exportData, {
            ...baseOptions,
            format: 'json'
          })
          break

        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      toast.success(`Successfully downloaded ${format.toUpperCase()} file`, {
        description: `${data.length} records exported to ${downloadFilename}.${format}`
      })
      
      if (onDownloadComplete) {
        onDownloadComplete(true)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      
      toast.error('Download failed', {
        description: errorMessage
      })
      
      if (onDownloadError) {
        onDownloadError(errorMessage)
      }
      
      if (onDownloadComplete) {
        onDownloadComplete(false)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const getFormatLabel = () => {
    switch (format) {
      case 'pdf': return 'PDF'
      case 'excel': return 'Excel'
      case 'csv': return 'CSV'
      case 'json': return 'JSON'
      default: return 'Download'
    }
  }

  const isDisabled = disabled || isDownloading || !data || data.length === 0

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isDisabled}
      title={iconOnly ? `Download ${getFormatLabel()}` : undefined}
    >
      {isDownloading ? (
        iconOnly ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Downloading...
          </>
        )
      ) : (
        iconOnly ? (
          <Download className="h-4 w-4" />
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download {getFormatLabel()}
          </>
        )
      )}
    </Button>
  )
}

// Convenience components for specific formats
export function DownloadPDFButton(props: Omit<DownloadButtonProps, 'format'>) {
  return <DownloadButton {...props} format="pdf" />
}

export function DownloadExcelButton(props: Omit<DownloadButtonProps, 'format'>) {
  return <DownloadButton {...props} format="excel" />
}

export function DownloadCSVButton(props: Omit<DownloadButtonProps, 'format'>) {
  return <DownloadButton {...props} format="csv" />
}

export function DownloadJSONButton(props: Omit<DownloadButtonProps, 'format'>) {
  return <DownloadButton {...props} format="json" />
}
