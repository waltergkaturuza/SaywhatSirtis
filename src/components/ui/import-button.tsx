'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  Info
} from 'lucide-react'
import { importService, ImportOptions, ImportResult, ValidationRule } from '@/lib/import-service'

interface ImportButtonProps {
  onImportComplete?: (result: ImportResult) => void
  onImportStart?: () => void
  validationRules?: ValidationRule[]
  importOptions?: Partial<ImportOptions>
  acceptedFormats?: ('excel' | 'csv' | 'json')[]
  title?: string
  description?: string
  templateFields?: string[]
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function ImportButton({
  onImportComplete,
  onImportStart,
  validationRules,
  importOptions = {},
  acceptedFormats = ['excel', 'csv', 'json'],
  title = 'Import Data',
  description = 'Import data from Excel, CSV, or JSON files',
  templateFields,
  variant = 'outline',
  size = 'default',
  className
}: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file size
      if (file.size > importService.getMaxFileSize()) {
        setImportResult({
          success: false,
          data: [],
          errors: [`File size exceeds maximum limit of ${importService.getMaxFileSize() / 1024 / 1024}MB`],
          warnings: [],
          totalRows: 0,
          validRows: 0,
          skippedRows: 0
        })
        return
      }

      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = acceptedFormats.map(format => {
        switch (format) {
          case 'excel': return ['xlsx', 'xls']
          case 'csv': return ['csv']
          case 'json': return ['json']
          default: return []
        }
      }).flat()

      if (!allowedExtensions.includes(fileExtension || '')) {
        setImportResult({
          success: false,
          data: [],
          errors: [`File type .${fileExtension} is not supported. Allowed types: ${allowedExtensions.join(', ')}`],
          warnings: [],
          totalRows: 0,
          validRows: 0,
          skippedRows: 0
        })
        return
      }

      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setImportResult(null)
    
    if (onImportStart) {
      onImportStart()
    }

    try {
      // Determine format from file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      let format: ImportOptions['format'] = 'excel'
      
      if (fileExtension === 'csv') format = 'csv'
      else if (fileExtension === 'json') format = 'json'
      
      const options: ImportOptions = {
        format,
        hasHeaders: true,
        validateData: true,
        allowedExtensions: acceptedFormats.map(f => {
          switch (f) {
            case 'excel': return ['xlsx', 'xls']
            case 'csv': return ['csv']
            case 'json': return ['json']
            default: return []
          }
        }).flat(),
        ...importOptions
      }

      const result = await importService.importFromFile(
        selectedFile,
        options,
        validationRules
      )

      setImportResult(result)
      
      if (onImportComplete) {
        onImportComplete(result)
      }
    } catch (error) {
      const errorResult: ImportResult = {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Import failed'],
        warnings: [],
        totalRows: 0,
        validRows: 0,
        skippedRows: 0
      }
      setImportResult(errorResult)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const downloadTemplate = (format: 'excel' | 'csv' = 'excel') => {
    if (templateFields && templateFields.length > 0) {
      importService.generateTemplate(templateFields, format)
    }
  }

  const resetImport = () => {
    setSelectedFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSuccessRate = (): number => {
    if (!importResult || importResult.totalRows === 0) return 0
    return Math.round((importResult.validRows / importResult.totalRows) * 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="template">Download Template</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <p className="text-sm text-muted-foreground">{description}</p>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={importService.getSupportedTypes()}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    {selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') ? (
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    ) : selectedFile.name.endsWith('.csv') ? (
                      <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    ) : (
                      <FileJson className="h-8 w-8 text-purple-600" />
                    )}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button size="sm" onClick={handleImport} disabled={isImporting}>
                      {isImporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isImporting ? 'Processing...' : 'Import Data'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetImport}>
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Supports Excel (.xlsx, .xls), CSV (.csv), and JSON (.json) files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: {importService.getMaxFileSize() / 1024 / 1024}MB
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing file...</span>
                </div>
                <Progress value={50} className="w-full" />
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {importResult.success ? 'Import Completed' : 'Import Failed'}
                  </span>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{importResult.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.validRows}</div>
                    <div className="text-sm text-muted-foreground">Valid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.skippedRows}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{getSuccessRate()}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Import Progress</span>
                    <span>{getSuccessRate()}%</span>
                  </div>
                  <Progress value={getSuccessRate()} className="w-full" />
                </div>

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Import Errors:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {importResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {importResult.errors.length > 5 && (
                            <li>... and {importResult.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Warnings:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {importResult.warnings.slice(0, 3).map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                          {importResult.warnings.length > 3 && (
                            <li>... and {importResult.warnings.length - 3} more warnings</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetImport}>
                    Import Another File
                  </Button>
                  {importResult.success && (
                    <Button onClick={() => setIsOpen(false)}>
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Download Import Template</h4>
                <p className="text-sm text-muted-foreground">
                  Download a template file to ensure your data is formatted correctly for import.
                </p>
              </div>

              {templateFields && templateFields.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Template includes these fields:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {templateFields.map((field, index) => (
                        <Badge key={index} variant="outline">{field}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate('excel')}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Download Excel Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate('csv')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download CSV Template
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No template fields have been configured for this import.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
