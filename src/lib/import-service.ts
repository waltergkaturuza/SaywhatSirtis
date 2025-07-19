import * as XLSX from 'xlsx'

export interface ImportOptions {
  format: 'excel' | 'csv' | 'json'
  hasHeaders?: boolean
  delimiter?: string
  skipRows?: number
  validateData?: boolean
  allowedExtensions?: string[]
}

export interface ImportResult<T = any> {
  success: boolean
  data: T[]
  errors: string[]
  warnings: string[]
  totalRows: number
  validRows: number
  skippedRows: number
  metadata?: Record<string, any>
}

export interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'date' | 'email' | 'phone'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean | string
}

class ImportService {
  async importFromFile<T = any>(
    file: File,
    options: ImportOptions = { format: 'excel' },
    validationRules?: ValidationRule[]
  ): Promise<ImportResult<T>> {
    const result: ImportResult<T> = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      totalRows: 0,
      validRows: 0,
      skippedRows: 0
    }

    try {
      // Validate file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (options.allowedExtensions && !options.allowedExtensions.includes(fileExtension || '')) {
        result.errors.push(`File type .${fileExtension} is not allowed`)
        return result
      }

      let rawData: any[][] = []

      switch (options.format) {
        case 'excel':
          rawData = await this.parseExcelFile(file, options)
          break
        case 'csv':
          rawData = await this.parseCSVFile(file, options)
          break
        case 'json':
          rawData = await this.parseJSONFile(file, options)
          break
        default:
          result.errors.push(`Unsupported format: ${options.format}`)
          return result
      }

      result.totalRows = rawData.length

      // Skip header row if specified
      if (options.hasHeaders && rawData.length > 0) {
        const headers = rawData[0]
        rawData = rawData.slice(1)
        result.metadata = { headers }
      }

      // Skip additional rows if specified
      if (options.skipRows && options.skipRows > 0) {
        rawData = rawData.slice(options.skipRows)
        result.skippedRows = options.skipRows
      }

      // Process and validate data
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i]
        const rowNumber = i + 1 + (options.skipRows || 0) + (options.hasHeaders ? 1 : 0)

        try {
          const processedRow = this.processRow(row, rowNumber, validationRules)
          
          if (processedRow.isValid) {
            result.data.push(processedRow.data as T)
            result.validRows++
          } else {
            result.errors.push(...processedRow.errors)
            result.skippedRows++
          }

          if (processedRow.warnings.length > 0) {
            result.warnings.push(...processedRow.warnings)
          }
        } catch (error) {
          result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Processing error'}`)
          result.skippedRows++
        }
      }

      result.success = result.errors.length === 0 || result.validRows > 0

    } catch (error) {
      result.errors.push(`File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  private async parseExcelFile(file: File, options: ImportOptions): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to array of arrays
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          }) as any[][]
          
          resolve(jsonData)
        } catch (error) {
          reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      
      reader.onerror = () => reject(new Error('File reading error'))
      reader.readAsArrayBuffer(file)
    })
  }

  private async parseCSVFile(file: File, options: ImportOptions): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const delimiter = options.delimiter || ','
          
          // Simple CSV parsing (for production, consider using a proper CSV parser like papaparse)
          const lines = text.split('\n').filter(line => line.trim())
          const data = lines.map(line => {
            // Basic CSV parsing - handles quoted fields
            const fields: string[] = []
            let current = ''
            let inQuotes = false
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i]
              const nextChar = line[i + 1]
              
              if (char === '"' && !inQuotes) {
                inQuotes = true
              } else if (char === '"' && inQuotes && nextChar === '"') {
                current += '"'
                i++ // Skip next quote
              } else if (char === '"' && inQuotes) {
                inQuotes = false
              } else if (char === delimiter && !inQuotes) {
                fields.push(current.trim())
                current = ''
              } else {
                current += char
              }
            }
            
            fields.push(current.trim())
            return fields
          })
          
          resolve(data)
        } catch (error) {
          reject(new Error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      
      reader.onerror = () => reject(new Error('File reading error'))
      reader.readAsText(file)
    })
  }

  private async parseJSONFile(file: File, options: ImportOptions): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const jsonData = JSON.parse(text)
          
          if (Array.isArray(jsonData)) {
            // Convert array of objects to array of arrays
            if (jsonData.length > 0 && typeof jsonData[0] === 'object') {
              const keys = Object.keys(jsonData[0])
              const data = [keys, ...jsonData.map(obj => keys.map(key => obj[key]))]
              resolve(data)
            } else {
              resolve(jsonData.map(item => Array.isArray(item) ? item : [item]))
            }
          } else {
            reject(new Error('JSON file must contain an array'))
          }
        } catch (error) {
          reject(new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      
      reader.onerror = () => reject(new Error('File reading error'))
      reader.readAsText(file)
    })
  }

  private processRow(
    row: any[], 
    rowNumber: number, 
    validationRules?: ValidationRule[]
  ): { isValid: boolean; data: any; errors: string[]; warnings: string[] } {
    const result = {
      isValid: true,
      data: {} as any,
      errors: [] as string[],
      warnings: [] as string[]
    }

    if (!validationRules) {
      // If no validation rules, return row as-is
      result.data = row
      return result
    }

    // Validate each field according to rules
    validationRules.forEach((rule, index) => {
      const value = row[index]
      const fieldName = rule.field || `Column ${index + 1}`
      
      try {
        const validation = this.validateField(value, rule, fieldName, rowNumber)
        
        if (!validation.isValid) {
          result.errors.push(...validation.errors)
          result.isValid = false
        }
        
        if (validation.warnings.length > 0) {
          result.warnings.push(...validation.warnings)
        }
        
        result.data[rule.field] = validation.processedValue
      } catch (error) {
        result.errors.push(`Row ${rowNumber}, ${fieldName}: ${error instanceof Error ? error.message : 'Validation error'}`)
        result.isValid = false
      }
    })

    return result
  }

  private validateField(
    value: any, 
    rule: ValidationRule, 
    fieldName: string, 
    rowNumber: number
  ): { isValid: boolean; processedValue: any; errors: string[]; warnings: string[] } {
    const result = {
      isValid: true,
      processedValue: value,
      errors: [] as string[],
      warnings: [] as string[]
    }

    // Check required fields
    if (rule.required && (value === null || value === undefined || value === '')) {
      result.errors.push(`Row ${rowNumber}, ${fieldName}: Field is required`)
      result.isValid = false
      return result
    }

    // Skip validation for empty optional fields
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return result
    }

    // Type validation and conversion
    switch (rule.type) {
      case 'number':
        const numValue = Number(value)
        if (isNaN(numValue)) {
          result.errors.push(`Row ${rowNumber}, ${fieldName}: Must be a valid number`)
          result.isValid = false
        } else {
          result.processedValue = numValue
        }
        break

      case 'date':
        const dateValue = new Date(value)
        if (isNaN(dateValue.getTime())) {
          result.errors.push(`Row ${rowNumber}, ${fieldName}: Must be a valid date`)
          result.isValid = false
        } else {
          result.processedValue = dateValue
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          result.errors.push(`Row ${rowNumber}, ${fieldName}: Must be a valid email address`)
          result.isValid = false
        }
        break

      case 'phone':
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
        if (!phoneRegex.test(String(value))) {
          result.errors.push(`Row ${rowNumber}, ${fieldName}: Must be a valid phone number`)
          result.isValid = false
        }
        break

      case 'string':
      default:
        result.processedValue = String(value)
        break
    }

    // Length validation
    const stringValue = String(result.processedValue)
    if (rule.minLength && stringValue.length < rule.minLength) {
      result.errors.push(`Row ${rowNumber}, ${fieldName}: Must be at least ${rule.minLength} characters`)
      result.isValid = false
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      result.errors.push(`Row ${rowNumber}, ${fieldName}: Must be no more than ${rule.maxLength} characters`)
      result.isValid = false
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      result.errors.push(`Row ${rowNumber}, ${fieldName}: Does not match required pattern`)
      result.isValid = false
    }

    // Custom validation
    if (rule.customValidator) {
      const customResult = rule.customValidator(result.processedValue)
      if (customResult !== true) {
        result.errors.push(`Row ${rowNumber}, ${fieldName}: ${typeof customResult === 'string' ? customResult : 'Custom validation failed'}`)
        result.isValid = false
      }
    }

    return result
  }

  // Utility method to generate import template
  generateTemplate(fields: string[], format: 'excel' | 'csv' = 'excel'): void {
    const sampleData = [
      fields, // Headers
      fields.map(() => '') // Empty row for sample
    ]

    if (format === 'excel') {
      const worksheet = XLSX.utils.aoa_to_sheet(sampleData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
      XLSX.writeFile(workbook, `import_template_${Date.now()}.xlsx`)
    } else {
      const csvContent = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `import_template_${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  // Get supported file types for file input
  getSupportedTypes(): string {
    return '.xlsx,.xls,.csv,.json'
  }

  // Get max file size (in bytes)
  getMaxFileSize(): number {
    return 10 * 1024 * 1024 // 10MB
  }
}

export const importService = new ImportService()
export default importService
