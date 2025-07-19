'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Loader2,
  Settings,
  Image as ImageIcon
} from 'lucide-react'
import { exportService, ExportData, ExportOptions } from '@/lib/export-service'

interface ExportButtonProps {
  data?: ExportData
  elementId?: string
  title?: string
  filename?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showOptions?: boolean
}

export function ExportButton({
  data,
  elementId,
  title = 'Export',
  filename,
  variant = 'outline',
  size = 'default',
  className,
  showOptions = false
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    filename: filename || `export_${Date.now()}`,
    title: title,
    includeLogo: true,
    orientation: 'portrait',
    includeTimestamp: true,
    watermark: false,
    pageSize: 'a4'
  })

  const handleExport = async (format: ExportOptions['format'], customOptions?: Partial<ExportOptions>) => {
    setIsExporting(true)
    setError('')

    try {
      const options: ExportOptions = {
        ...exportOptions,
        format,
        ...customOptions
      }

      if (elementId) {
        await exportService.exportFromElement(elementId, options)
      } else if (data) {
        switch (format) {
          case 'pdf':
            await exportService.exportToPDF(data, options)
            break
          case 'excel':
            await exportService.exportToExcel(data, options)
            break
          case 'csv':
            await exportService.exportToCSV(data, options)
            break
          case 'json':
            await exportService.exportToJSON(data, options)
            break
          default:
            throw new Error(`Unsupported format: ${format}`)
        }
      } else {
        throw new Error('Either data or elementId must be provided')
      }
    } catch (error) {
      console.error('Export error:', error)
      setError(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const QuickExportButton = () => (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => handleExport(exportOptions.format)}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  )

  const FullExportDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        
        {elementId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('pdf', { title: 'Screenshot Export' })}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Export Screenshot
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowOptionsDialog(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Export Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (!showOptions) {
    return <QuickExportButton />
  }

  return (
    <>
      <FullExportDropdown />
      
      <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Export Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={exportOptions.filename}
                onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
                placeholder="Enter filename"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select 
                value={exportOptions.format} 
                onValueChange={(value: ExportOptions['format']) => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orientation">Page Orientation</Label>
              <Select 
                value={exportOptions.orientation} 
                onValueChange={(value: 'portrait' | 'landscape') => 
                  setExportOptions(prev => ({ ...prev, orientation: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select 
                value={exportOptions.pageSize} 
                onValueChange={(value: 'a4' | 'a3' | 'letter') => 
                  setExportOptions(prev => ({ ...prev, pageSize: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeLogo"
                  checked={exportOptions.includeLogo}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeLogo: checked }))
                  }
                />
                <Label htmlFor="includeLogo">Include SAYWHAT Logo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeTimestamp"
                  checked={exportOptions.includeTimestamp}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeTimestamp: checked }))
                  }
                />
                <Label htmlFor="includeTimestamp">Include Timestamp</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="watermark"
                  checked={exportOptions.watermark}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, watermark: checked }))
                  }
                />
                <Label htmlFor="watermark">Add SAYWHAT Watermark</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowOptionsDialog(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowOptionsDialog(false)
                  handleExport(exportOptions.format)
                }}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
