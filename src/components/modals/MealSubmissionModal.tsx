"use client"

import { useState } from 'react'
import { ImageDisplay } from '../ui/image-display'
import { MealSubmissionParser } from '../../lib/meal-submission-parser'
import { MealExportService } from '../../lib/meal-export'

interface MealSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export default function MealSubmissionModal({ isOpen, onClose, submission }: MealSubmissionModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen || !submission) return null

  const handleExport = async () => {
    setIsExporting(true)
    try {
      switch (exportFormat) {
        case 'json':
          MealExportService.exportToJSON(submission, { 
            format: 'json', 
            includePhotos: false, 
            includeMetadata: true 
          })
          break
        case 'csv':
          MealExportService.exportToCSV(submission, { 
            format: 'csv' 
          })
          break
        case 'pdf':
          await MealExportService.exportToPDF(submission, { 
            format: 'pdf' 
          })
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">📋 Submission Details</h3>
              <p className="text-sm text-gray-600 mt-1">
                {submission.formName} • {submission.submittedAt}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-green-600 font-semibold">{submission.status}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted By</p>
                  <p className="text-sm text-gray-600">{submission.submittedByName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Data Size</p>
                  <p className="text-sm text-gray-600">{submission.dataSize}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location and GPS */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📍</span>
              Location Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {submission.location}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country/Region</label>
                <p className="text-sm text-gray-900">
                  {submission.country} • {submission.region}
                </p>
              </div>
              {submission.coordinates && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPS Coordinates</label>
                  <p className="text-sm text-gray-900 font-mono bg-blue-50 p-2 rounded">
                    {submission.coordinates}
                  </p>
                  {submission.gpsAccuracy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Accuracy: ±{submission.gpsAccuracy}m
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Device Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📱</span>
              Device Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <p className="text-sm text-gray-900">{submission.deviceInfo.platform}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Browser</label>
                <p className="text-sm text-gray-900">{submission.deviceInfo.browser}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating System</label>
                <p className="text-sm text-gray-900">{submission.deviceInfo.os}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <p className="text-sm text-gray-900">{submission.deviceInfo.language}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Screen Resolution</label>
                <p className="text-sm text-gray-900">{submission.deviceInfo.screenResolution}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <p className="text-sm text-gray-900">
                  {submission.deviceInfo.isMobile ? '📱 Mobile' : 
                   submission.deviceInfo.isTablet ? '📱 Tablet' : '🖥️ Desktop'}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments and Photos */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📎</span>
              Attachments ({submission.attachments})
            </h4>
            
            {submission.attachments > 0 ? (
              <div className="space-y-4">
                {/* Photo Display */}
                {submission.formData && submission.formData.hasPhoto && submission.formData.photo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📸 Photo</label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <ImageDisplay
                        src={submission.formData.photo}
                        alt="Submission Photo"
                        className="w-full"
                        maxHeight="24rem"
                        onError={(error) => {
                          console.error('Photo display error:', error)
                        }}
                      />
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Photo size: {Math.round(submission.formData.photo.length / 1024)} KB
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Attachment Types */}
                {submission.attachmentTypes && submission.attachmentTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Types</label>
                    <div className="flex flex-wrap gap-2">
                      {submission.attachmentTypes.map((type: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📎</span>
                <p>No attachments found</p>
              </div>
            )}
          </div>

          {/* Dynamic Form Data */}
          {submission.formData && Object.keys(submission.formData).length > 2 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">📝</span>
                Form Data
              </h4>
              {(() => {
                const categories = MealSubmissionParser.categorizeFormData(submission.formData)
                return Object.keys(categories).map(categoryKey => {
                  const category = categories[categoryKey]
                  if (Object.keys(category).length === 0) return null
                  
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
                  
                  return (
                    <div key={categoryKey} className="mb-6">
                      <h5 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">{categoryNames[categoryKey] || '📋 Information'}</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(category).map(fieldKey => {
                          const value = category[fieldKey]
                          if (value === null || value === undefined || value === '') return null
                          
                          return (
                            <div key={fieldKey}>
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {fieldKey.replace(/_/g, ' ')}
                              </label>
                              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                {fieldKey === 'photo' && value ? (
                                  <div className="flex items-center space-x-2">
                                    <span>📷 Photo attached</span>
                                    <span className="text-xs text-gray-500">
                                      ({Math.round(value.length / 1024)} KB)
                                    </span>
                                  </div>
                                ) : (
                                  MealSubmissionParser.formatFieldValue(fieldKey, value)
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {/* Technical Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">⚙️</span>
              Technical Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <p className="text-gray-900 font-mono">{submission.ipAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Source</label>
                <p className="text-gray-900">{submission.submissionSource}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Version</label>
                <p className="text-gray-900">{submission.formVersion}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Time</label>
                <p className="text-gray-900">{submission.completionTime}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referer</label>
                <p className="text-gray-900 text-xs break-all">{submission.referer}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <p className="text-gray-900 text-xs break-all">{submission.origin}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Export Options */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Export as:</label>
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'pdf')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF (HTML)</option>
              </select>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                📊 Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
