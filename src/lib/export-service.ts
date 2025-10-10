import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface ExportOptions {
  filename?: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  title?: string
  includeLogo?: boolean
  orientation?: 'portrait' | 'landscape'
  includeTimestamp?: boolean
  watermark?: boolean
  pageSize?: 'a4' | 'a3' | 'letter'
}

export interface ExportData {
  headers: string[]
  rows: any[][]
  title?: string
  subtitle?: string
  metadata?: Record<string, any>
}

class ExportService {
  private logoBase64: string | null = null
  private readonly saywhatBranding = {
    organizationName: 'SAYWHAT',
    systemName: 'SIRTIS',
    tagline: 'SAYWHAT Integrated Real-Time Information System',
    website: 'www.saywhat.org',
    address: 'SAYWHAT Organization, Zimbabwe',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#f59e0b'
    }
  }

  private async getLogoBase64(): Promise<string | null> {
    if (this.logoBase64) {
      return this.logoBase64
    }

    try {
      // Load the actual SAYWHAT logo
      const response = await fetch('/assets/saywhat-logo.png')
      if (!response.ok) {
        console.warn('Could not load SAYWHAT logo for export')
        return null
      }
      
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          this.logoBase64 = reader.result as string
          resolve(this.logoBase64)
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error loading logo:', error)
      return null
    }
  }

  async exportToPDF(data: ExportData, options: ExportOptions = { format: 'pdf' }): Promise<void> {
    try {
      console.log('Starting PDF export with data:', { 
        headers: data.headers, 
        rowCount: data.rows?.length,
        title: data.title 
      })

      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.pageSize || 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20

      // Load logo if needed
      const logoBase64 = options.includeLogo !== false ? await this.getLogoBase64() : null

      // Add SAYWHAT logo and branding
      if (options.includeLogo !== false) {
        if (logoBase64) {
          try {
            // Add actual logo
            pdf.addImage(logoBase64, 'PNG', margin, margin, 30, 15)
            console.log('Logo added successfully')
          } catch (error) {
            console.warn('Could not add logo to PDF, using fallback', error)
            // Fallback to colored rectangle
            pdf.setFillColor(30, 64, 175) // SAYWHAT blue
            pdf.rect(margin, margin, 30, 15, 'F')
          }
        } else {
          // Fallback to colored rectangle if logo can't be loaded
          console.log('Using fallback rectangle for logo')
          pdf.setFillColor(30, 64, 175) // SAYWHAT blue
          pdf.rect(margin, margin, 30, 15, 'F')
        }
        
        // Add organization name
        pdf.setFontSize(16)
        pdf.setTextColor(30, 64, 175)
        pdf.text(this.saywhatBranding.organizationName, margin + 35, margin + 8)
        
        // Add system name
        pdf.setFontSize(12)
        pdf.setTextColor(100, 116, 139)
        pdf.text(this.saywhatBranding.systemName, margin + 35, margin + 15)
      }

    // Add title
    if (data.title || options.title) {
      pdf.setFontSize(18)
      pdf.setTextColor(0, 0, 0)
      pdf.text(data.title || options.title || 'Export Report', margin, margin + 40)
    }

    // Add subtitle
    if (data.subtitle) {
      pdf.setFontSize(12)
      pdf.setTextColor(100, 116, 139)
      pdf.text(data.subtitle, margin, margin + 50)
    }

    // Add timestamp
    if (options.includeTimestamp !== false) {
      const timestamp = new Date().toLocaleString()
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139)
      pdf.text(`Generated: ${timestamp}`, margin, margin + 60)
    }

    // Add table data
    if (data.headers && data.rows && data.rows.length > 0) {
      let yPosition = margin + 80
      const cellHeight = 10
      const cellPadding = 3

      // Calculate column widths - distribute available width
      const availableWidth = pageWidth - (2 * margin)
      const columnCount = data.headers.length
      const columnWidth = Math.max(availableWidth / columnCount, 25) // Minimum 25mm per column

      // Add headers with background
      pdf.setFillColor(30, 64, 175) // SAYWHAT blue
      pdf.rect(margin, yPosition, availableWidth, cellHeight, 'F')
      
      pdf.setFontSize(9)
      pdf.setTextColor(255, 255, 255)
      
      data.headers.forEach((header, index) => {
        const x = margin + (index * columnWidth) + cellPadding
        const maxWidth = columnWidth - (2 * cellPadding)
        
        // Wrap header text if needed
        const headerText = String(header || '').substring(0, 15)
        pdf.text(headerText, x, yPosition + 6)
      })

      yPosition += cellHeight

      // Add rows
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(8)
      
      data.rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = margin
          
          // Re-add headers on new page
          pdf.setFillColor(30, 64, 175)
          pdf.rect(margin, yPosition, availableWidth, cellHeight, 'F')
          pdf.setFontSize(9)
          pdf.setTextColor(255, 255, 255)
          
          data.headers.forEach((header, index) => {
            const x = margin + (index * columnWidth) + cellPadding
            const headerText = String(header || '').substring(0, 15)
            pdf.text(headerText, x, yPosition + 6)
          })
          
          yPosition += cellHeight
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(8)
        }

        // Alternate row colors for better readability
        if (rowIndex % 2 === 1) {
          pdf.setFillColor(248, 250, 252)
          pdf.rect(margin, yPosition, availableWidth, cellHeight, 'F')
        }

        // Add cell data
        row.forEach((cell, cellIndex) => {
          if (cellIndex < data.headers.length) { // Ensure we don't exceed column count
            const x = margin + (cellIndex * columnWidth) + cellPadding
            const maxWidth = columnWidth - (2 * cellPadding)
            
            // Format cell content
            let cellText = String(cell || '')
            
            // Truncate text to fit column width (approximate)
            const maxChars = Math.floor(maxWidth / 2) // Rough estimate
            if (cellText.length > maxChars) {
              cellText = cellText.substring(0, maxChars - 3) + '...'
            }
            
            pdf.text(cellText, x, yPosition + 6)
          }
        })

        yPosition += cellHeight
      })
    }

    // Add footer with branding
    const footerY = pageHeight - 20
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    pdf.text(this.saywhatBranding.tagline, margin, footerY)
    pdf.text(this.saywhatBranding.website, pageWidth - margin - 30, footerY, { align: 'right' })

    // Add watermark if requested
    if (options.watermark) {
      pdf.setGState(pdf.GState({ opacity: 0.1 }))
      pdf.setFontSize(50)
      pdf.setTextColor(30, 64, 175)
      pdf.text('SAYWHAT', pageWidth / 2, pageHeight / 2, { 
        align: 'center',
        angle: 45 
      })
    }

    // Save the PDF
    const filename = options.filename || `${data.title || 'export'}_${Date.now()}.pdf`
    console.log('Saving PDF with filename:', filename)
    pdf.save(filename)
    console.log('PDF export completed successfully')
    
    } catch (error) {
      console.error('Error in PDF export:', error)
      throw error
    }
  }

  async exportToExcel(data: ExportData, options: ExportOptions = { format: 'excel' }): Promise<void> {
    const workbook = XLSX.utils.book_new()
    
    // Create worksheet data with branding
    const wsData: any[][] = []
    
    // Add SAYWHAT branding header
    wsData.push([this.saywhatBranding.organizationName])
    wsData.push([this.saywhatBranding.systemName])
    wsData.push([this.saywhatBranding.tagline])
    wsData.push([]) // Empty row
    
    // Add title and metadata
    if (data.title) {
      wsData.push([data.title])
      wsData.push([]) // Empty row
    }
    
    if (data.subtitle) {
      wsData.push([data.subtitle])
      wsData.push([]) // Empty row
    }
    
    // Add timestamp
    if (options.includeTimestamp !== false) {
      wsData.push([`Generated: ${new Date().toLocaleString()}`])
      wsData.push([]) // Empty row
    }
    
    // Add headers and data
    if (data.headers) {
      wsData.push(data.headers)
    }
    
    if (data.rows) {
      wsData.push(...data.rows)
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData)
    
    // Style the worksheet (basic styling)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    
    // Set column widths
    const colWidths = data.headers?.map(() => ({ wch: 15 })) || []
    worksheet['!cols'] = colWidths
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export Data')
    
    // Generate filename
    const filename = options.filename || `${data.title || 'export'}_${Date.now()}.xlsx`
    
    // Save the file
    XLSX.writeFile(workbook, filename)
  }

  async exportToCSV(data: ExportData, options: ExportOptions = { format: 'csv' }): Promise<void> {
    let csvContent = ''
    
    // Add SAYWHAT branding header
    csvContent += `"${this.saywhatBranding.organizationName}"\n`
    csvContent += `"${this.saywhatBranding.systemName}"\n`
    csvContent += `"${this.saywhatBranding.tagline}"\n`
    csvContent += '\n'
    
    // Add title and metadata
    if (data.title) {
      csvContent += `"${data.title}"\n\n`
    }
    
    if (data.subtitle) {
      csvContent += `"${data.subtitle}"\n\n`
    }
    
    // Add timestamp
    if (options.includeTimestamp !== false) {
      csvContent += `"Generated: ${new Date().toLocaleString()}"\n\n`
    }
    
    // Add headers
    if (data.headers) {
      csvContent += data.headers.map(header => `"${header}"`).join(',') + '\n'
    }
    
    // Add data rows
    if (data.rows) {
      data.rows.forEach(row => {
        csvContent += row.map(cell => `"${String(cell || '')}"`).join(',') + '\n'
      })
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const filename = options.filename || `${data.title || 'export'}_${Date.now()}.csv`
    saveAs(blob, filename)
  }

  async exportToJSON(data: ExportData, options: ExportOptions = { format: 'json' }): Promise<void> {
    const exportData = {
      organization: this.saywhatBranding.organizationName,
      system: this.saywhatBranding.systemName,
      tagline: this.saywhatBranding.tagline,
      title: data.title,
      subtitle: data.subtitle,
      generatedAt: new Date().toISOString(),
      metadata: data.metadata,
      headers: data.headers,
      data: data.rows,
      totalRecords: data.rows?.length || 0
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
    const filename = options.filename || `${data.title || 'export'}_${Date.now()}.json`
    saveAs(blob, filename)
  }

  async exportFromElement(
    elementId: string, 
    options: ExportOptions = { format: 'pdf' }
  ): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`)
    }

    if (options.format === 'pdf') {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.pageSize || 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20

      // Add SAYWHAT branding header
      if (options.includeLogo !== false) {
        pdf.setFillColor(30, 64, 175)
        pdf.rect(margin, margin, 30, 15, 'F')
        pdf.setFontSize(16)
        pdf.setTextColor(30, 64, 175)
        pdf.text(this.saywhatBranding.organizationName, margin + 35, margin + 8)
        pdf.setFontSize(12)
        pdf.setTextColor(100, 116, 139)
        pdf.text(this.saywhatBranding.systemName, margin + 35, margin + 15)
      }

      // Add timestamp
      if (options.includeTimestamp !== false) {
        const timestamp = new Date().toLocaleString()
        pdf.setFontSize(10)
        pdf.setTextColor(100, 116, 139)
        pdf.text(`Generated: ${timestamp}`, margin, margin + 25)
      }

      // Calculate image dimensions
      const imgWidth = pageWidth - (2 * margin)
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const yPosition = margin + 35

      // Add the captured element
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)

      // Add footer
      const footerY = pageHeight - 20
      pdf.setFontSize(8)
      pdf.setTextColor(100, 116, 139)
      pdf.text(this.saywhatBranding.tagline, margin, footerY)
      pdf.text(this.saywhatBranding.website, pageWidth - margin - 30, footerY, { align: 'right' })

      const filename = options.filename || `${options.title || 'screenshot'}_${Date.now()}.pdf`
      pdf.save(filename)
    }
  }

  // Helper method to format data for export
  formatDataForExport(data: any[], columns: string[]): ExportData {
    const headers = columns
    const rows = data.map(item => 
      columns.map(column => {
        const value = item[column]
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        return value?.toString() || ''
      })
    )

    return { headers, rows }
  }

  // Utility method to get export statistics
  getExportStats(data: ExportData): Record<string, any> {
    return {
      totalRecords: data.rows?.length || 0,
      totalColumns: data.headers?.length || 0,
      generatedAt: new Date().toISOString(),
      organization: this.saywhatBranding.organizationName,
      system: this.saywhatBranding.systemName
    }
  }
}

export const exportService = new ExportService()
export default exportService
