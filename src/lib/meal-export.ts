import { ParsedSubmission } from './meal-submission-parser'

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf'
  includePhotos?: boolean
  includeMetadata?: boolean
  filename?: string
}

export class MealExportService {
  /**
   * Export submission data to JSON
   */
  static exportToJSON(submission: ParsedSubmission, options: ExportOptions = { format: 'json' }) {
    const exportData = {
      submissionId: submission.id,
      formName: submission.formName,
      submittedAt: submission.submittedAt,
      submittedBy: submission.submittedByName || submission.submittedBy,
      status: submission.status,
      location: submission.location,
      coordinates: submission.coordinates,
      country: submission.country,
      region: submission.region,
      city: submission.city,
      ipAddress: submission.ipAddress,
      deviceInfo: submission.deviceInfo,
      attachments: submission.attachments,
      attachmentTypes: submission.attachmentTypes,
      dataSize: submission.dataSize,
      completionTime: submission.completionTime,
      submissionSource: submission.submissionSource,
      formVersion: submission.formVersion,
      timestamp: submission.timestamp,
      formData: options.includePhotos ? submission.formData : this.sanitizeFormData(submission.formData),
      metadata: options.includeMetadata ? {
        referer: submission.referer,
        origin: submission.origin,
        gpsSource: submission.gpsSource,
        gpsAccuracy: submission.gpsAccuracy
      } : undefined
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = options.filename || `submission_${submission.id}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Export submission data to CSV
   */
  static exportToCSV(submission: ParsedSubmission, options: ExportOptions = { format: 'csv' }) {
    const csvData = this.flattenSubmissionData(submission)
    const headers = Object.keys(csvData)
    const values = Object.values(csvData)
    
    const csvContent = [
      headers.join(','),
      values.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = options.filename || `submission_${submission.id}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Export submission data to PDF
   */
  static async exportToPDF(submission: ParsedSubmission, options: ExportOptions = { format: 'pdf' }) {
    // This would require a PDF library like jsPDF or Puppeteer
    // For now, we'll create a simple HTML representation
    const htmlContent = this.generateHTMLReport(submission)
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = options.filename || `submission_${submission.id}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Sanitize form data by removing large binary data
   */
  private static sanitizeFormData(formData: any) {
    const sanitized = { ...formData }
    
    // Remove photo data but keep metadata
    if (sanitized.photo) {
      sanitized.photo = `[Photo data removed - ${Math.round(sanitized.photo.length / 1024)} KB]`
    }
    
    // Remove other large binary fields
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 10000) {
        sanitized[key] = `[Large data removed - ${Math.round(sanitized[key].length / 1024)} KB]`
      }
    })
    
    return sanitized
  }

  /**
   * Flatten submission data for CSV export
   */
  private static flattenSubmissionData(submission: ParsedSubmission) {
    const flat: any = {
      'Submission ID': submission.id,
      'Form Name': submission.formName,
      'Submitted At': submission.submittedAt,
      'Submitted By': submission.submittedByName || submission.submittedBy,
      'Status': submission.status,
      'Location': submission.location,
      'Coordinates': submission.coordinates,
      'Country': submission.country,
      'Region': submission.region,
      'City': submission.city,
      'IP Address': submission.ipAddress,
      'Device Platform': submission.deviceInfo?.platform || 'Unknown',
      'Device OS': submission.deviceInfo?.os || 'Unknown',
      'Device Browser': submission.deviceInfo?.browser || 'Unknown',
      'Attachments Count': submission.attachments,
      'Attachment Types': submission.attachmentTypes?.join(', ') || 'None',
      'Data Size': submission.dataSize,
      'Completion Time': submission.completionTime,
      'Submission Source': submission.submissionSource,
      'Form Version': submission.formVersion,
      'Timestamp': submission.timestamp
    }

    // Add form data fields
    if (submission.formData) {
      Object.keys(submission.formData).forEach(key => {
        if (key !== 'photo' && key !== 'hasPhoto') {
          const value = submission.formData[key]
          if (value !== null && value !== undefined && value !== '') {
            flat[`Form_${key}`] = typeof value === 'object' ? JSON.stringify(value) : String(value)
          }
        }
      })
    }

    return flat
  }

  /**
   * Generate HTML report for PDF export
   */
  private static generateHTMLReport(submission: ParsedSubmission) {
    const categories = require('./meal-submission-parser').MealSubmissionParser.categorizeFormData(submission.formData)
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MEAL Submission Report - ${submission.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #6b7280; }
        .category { background: #f9fafb; padding: 10px; margin-bottom: 15px; border-radius: 6px; }
        .category-title { font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 MEAL Submission Report</h1>
        <p><strong>Submission ID:</strong> ${submission.id}</p>
        <p><strong>Form:</strong> ${submission.formName}</p>
        <p><strong>Submitted:</strong> ${submission.submittedAt}</p>
        <p><strong>By:</strong> ${submission.submittedByName || submission.submittedBy}</p>
    </div>

    <div class="section">
        <h2>📍 Location Information</h2>
        <div class="field"><span class="label">Location:</span> <span class="value">${submission.location || 'Unknown'}</span></div>
        <div class="field"><span class="label">Coordinates:</span> <span class="value">${submission.coordinates || 'No GPS data'}</span></div>
        <div class="field"><span class="label">Country:</span> <span class="value">${submission.country || 'Unknown'}</span></div>
        <div class="field"><span class="label">Region:</span> <span class="value">${submission.region || 'Unknown'}</span></div>
        <div class="field"><span class="label">City:</span> <span class="value">${submission.city || 'Unknown'}</span></div>
    </div>

    <div class="section">
        <h2>📱 Device Information</h2>
        <div class="field"><span class="label">Platform:</span> <span class="value">${submission.deviceInfo?.platform || 'Unknown'}</span></div>
        <div class="field"><span class="label">OS:</span> <span class="value">${submission.deviceInfo?.os || 'Unknown'}</span></div>
        <div class="field"><span class="label">Browser:</span> <span class="value">${submission.deviceInfo?.browser || 'Unknown'}</span></div>
        <div class="field"><span class="label">IP Address:</span> <span class="value">${submission.ipAddress || 'Unknown'}</span></div>
    </div>

    <div class="section">
        <h2>📎 Attachments</h2>
        <div class="field"><span class="label">Count:</span> <span class="value">${submission.attachments || 0}</span></div>
        <div class="field"><span class="label">Types:</span> <span class="value">${submission.attachmentTypes?.join(', ') || 'None'}</span></div>
        <div class="field"><span class="label">Data Size:</span> <span class="value">${submission.dataSize || 'Unknown'}</span></div>
    </div>

    ${Object.keys(categories).map(categoryKey => {
      const category = categories[categoryKey]
      if (Object.keys(category).length === 0) return ''
      
      const categoryNames: any = {
        personal: '👤 Personal Information',
        contact: '📞 Contact Information',
        location: '📍 Location Information',
        demographic: '📊 Demographic Information',
        assessment: '📈 Assessment Data',
        technical: '⚙️ Technical Data',
        attachments: '📎 Attachments',
        other: '📋 Other Information'
      }
      
      return `
        <div class="category">
          <div class="category-title">${categoryNames[categoryKey] || '📋 Information'}</div>
          ${Object.keys(category).map(fieldKey => {
            const value = category[fieldKey]
            if (value === null || value === undefined || value === '') return ''
            return `<div class="field"><span class="label">${fieldKey.replace(/_/g, ' ')}:</span> <span class="value">${typeof value === 'object' ? JSON.stringify(value) : String(value)}</span></div>`
          }).join('')}
        </div>
      `
    }).join('')}

    <div class="section">
        <h2>⚙️ Technical Details</h2>
        <div class="field"><span class="label">Completion Time:</span> <span class="value">${submission.completionTime || 'Unknown'}</span></div>
        <div class="field"><span class="label">Submission Source:</span> <span class="value">${submission.submissionSource || 'Unknown'}</span></div>
        <div class="field"><span class="label">Form Version:</span> <span class="value">${submission.formVersion || 'Unknown'}</span></div>
        <div class="field"><span class="label">Timestamp:</span> <span class="value">${submission.timestamp || 'Unknown'}</span></div>
    </div>

    <div style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: center; color: #6b7280;">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>MEAL System - SAYWHAT Organization</p>
    </div>
</body>
</html>
    `
  }
}
