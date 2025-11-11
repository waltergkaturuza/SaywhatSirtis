'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { ModulePage } from "@/components/layout/enhanced-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ClockIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ArrowPathIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CloudArrowDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import DocumentViewModal from '@/components/modals/DocumentViewModal'

interface DocumentVersion {
  id: string
  version: string
  filename: string
  originalName: string
  size: number
  uploadedBy: string
  uploadedByUser?: {
    firstName: string
    lastName: string
    email: string
  }
  versionComment?: string
  createdAt: string
  updatedAt: string
  isLatestVersion: boolean
  classification: string
  category: string
  viewCount: number
  downloadCount: number
  path: string
}

interface ComparisonData {
  field: string
  oldValue: string
  newValue: string
  changed: boolean
}

function VersionHistoryContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const documentId = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)
  const [compareVersion, setCompareVersion] = useState<DocumentVersion | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null)

  useEffect(() => {
    if (documentId) {
      fetchVersionHistory()
    }
  }, [documentId])

  const fetchVersionHistory = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/documents/versions?documentId=${documentId}`)
      
      if (response.ok) {
        const data = await response.json()
        setVersions(data.versions || [])
      } else {
        setError('Failed to load version history')
      }
    } catch (err) {
      console.error('Error fetching version history:', err)
      setError('Unable to load version history')
    } finally {
      setLoading(false)
    }
  }

  const compareVersions = (v1: DocumentVersion, v2: DocumentVersion) => {
    const comparison: ComparisonData[] = [
      {
        field: 'File Name',
        oldValue: v1.originalName,
        newValue: v2.originalName,
        changed: v1.originalName !== v2.originalName
      },
      {
        field: 'Size',
        oldValue: formatFileSize(v1.size),
        newValue: formatFileSize(v2.size),
        changed: v1.size !== v2.size
      },
      {
        field: 'Classification',
        oldValue: v1.classification,
        newValue: v2.classification,
        changed: v1.classification !== v2.classification
      },
      {
        field: 'Category',
        oldValue: v1.category || 'N/A',
        newValue: v2.category || 'N/A',
        changed: v1.category !== v2.category
      },
      {
        field: 'Uploaded By',
        oldValue: v1.uploadedBy,
        newValue: v2.uploadedBy,
        changed: v1.uploadedBy !== v2.uploadedBy
      }
    ]

    setComparisonData(comparison)
  }

  const handleCompare = () => {
    if (selectedVersion && compareVersion) {
      compareVersions(selectedVersion, compareVersion)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${bytes} B`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleDownloadVersion = async (versionId: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${versionId}/download`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download version')
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new version based on this historical version.')) {
      return
    }

    try {
      const response = await fetch('/api/documents/versions/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, documentId })
      })

      if (response.ok) {
        alert('Version restored successfully!')
        fetchVersionHistory()
      } else {
        alert('Failed to restore version')
      }
    } catch (err) {
      console.error('Restore error:', err)
      alert('Failed to restore version')
    }
  }

  const metadata = {
    title: "Version History",
    description: "Track changes and manage document versions",
    breadcrumbs: [
      { name: "SIRTIS", href: "/" },
      { name: "Documents", href: "/documents" },
      { name: "Version History" }
    ]
  }

  const latestVersion = versions.find(v => v.isLatestVersion)

  if (!documentId) {
    return (
      <ModulePage metadata={metadata}>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <InformationCircleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Document Selected</h3>
              <p className="text-gray-600">Please select a document to view its version history.</p>
              <Button 
                onClick={() => window.location.href = '/documents'}
                className="mt-4 bg-saywhat-orange hover:bg-orange-600"
              >
                Go to Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </ModulePage>
    )
  }

  if (loading) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ArrowPathIcon className="h-12 w-12 text-saywhat-orange animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading version history...</p>
          </div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">×</button>
            </div>
          </div>
        )}

        {/* Current Version Overview */}
        {latestVersion && (
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-blue-900">
                  <DocumentTextIcon className="h-6 w-6 mr-2" />
                  Current Version
                </CardTitle>
                <Badge className="bg-green-600 text-white">v{latestVersion.version}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">File Name</h4>
                  <p className="text-sm font-medium text-gray-900">{latestVersion.originalName}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Size</h4>
                  <p className="text-sm font-medium text-gray-900">{formatFileSize(latestVersion.size)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Last Modified</h4>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(latestVersion.updatedAt)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Button
                  onClick={() => {
                    setViewingVersionId(latestVersion.id)
                    setShowViewModal(true)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  onClick={() => handleDownloadVersion(latestVersion.id, latestVersion.originalName)}
                  variant="outline"
                  size="sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Version Comparison Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
              Compare Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version 1</label>
                <select
                  value={selectedVersion?.id || ''}
                  onChange={(e) => {
                    const version = versions.find(v => v.id === e.target.value)
                    setSelectedVersion(version || null)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange"
                >
                  <option value="">Select version...</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version} - {formatDateTime(v.createdAt)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version 2</label>
                <select
                  value={compareVersion?.id || ''}
                  onChange={(e) => {
                    const version = versions.find(v => v.id === e.target.value)
                    setCompareVersion(version || null)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-orange"
                >
                  <option value="">Select version...</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version} - {formatDateTime(v.createdAt)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleCompare}
                  disabled={!selectedVersion || !compareVersion}
                  className="w-full bg-saywhat-orange hover:bg-orange-600"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>

            {/* Comparison Results */}
            {comparisonData.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Comparison Results</h4>
                <div className="space-y-2">
                  {comparisonData.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-md ${
                        item.changed ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {item.changed ? (
                          <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{item.field}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-right">
                          <span className="text-gray-500 text-xs">v{selectedVersion?.version}</span>
                          <p className="text-gray-900">{item.oldValue}</p>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="text-right">
                          <span className="text-gray-500 text-xs">v{compareVersion?.version}</span>
                          <p className={item.changed ? 'text-yellow-700 font-semibold' : 'text-gray-900'}>{item.newValue}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Version Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-saywhat-orange" />
                Version Timeline ({versions.length} version{versions.length === 1 ? '' : 's'})
              </CardTitle>
              <Button onClick={fetchVersionHistory} variant="outline" size="sm">
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {versions.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Version History</h3>
                <p className="text-gray-500">This document has no version history yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version, index) => {
                  const uploaderName = version.uploadedByUser 
                    ? `${version.uploadedByUser.firstName} ${version.uploadedByUser.lastName}`
                    : version.uploadedBy || 'Unknown'

                  return (
                    <div 
                      key={version.id}
                      className={`relative border-l-4 pl-6 pb-6 ${
                        version.isLatestVersion 
                          ? 'border-green-500' 
                          : 'border-gray-300'
                      } ${index === versions.length - 1 ? 'pb-0' : ''}`}
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white ${
                        version.isLatestVersion ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>

                      {/* Version Card */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                version.isLatestVersion ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <DocumentTextIcon className={`h-5 w-5 ${
                                  version.isLatestVersion ? 'text-green-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900">Version {version.version}</h4>
                                  {version.isLatestVersion && (
                                    <Badge className="bg-green-600 text-white">Current</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{version.originalName}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(version.size)}
                            </Badge>
                          </div>

                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Uploaded By</p>
                              <div className="flex items-center space-x-1">
                                <UserIcon className="h-3 w-3 text-gray-400" />
                                <p className="text-sm text-gray-900">{uploaderName}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Date</p>
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-3 w-3 text-gray-400" />
                                <p className="text-sm text-gray-900">{formatDateTime(version.createdAt)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Views</p>
                              <div className="flex items-center space-x-1">
                                <EyeIcon className="h-3 w-3 text-gray-400" />
                                <p className="text-sm text-gray-900">{version.viewCount || 0}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Downloads</p>
                              <div className="flex items-center space-x-1">
                                <ArrowDownTrayIcon className="h-3 w-3 text-gray-400" />
                                <p className="text-sm text-gray-900">{version.downloadCount || 0}</p>
                              </div>
                            </div>
                          </div>

                          {/* Version Comment */}
                          {version.versionComment && (
                            <div className="bg-gray-50 rounded-md p-3 mb-4">
                              <p className="text-xs text-gray-500 mb-1">Version Notes</p>
                              <p className="text-sm text-gray-700">{version.versionComment}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                            <Button
                              onClick={() => {
                                setViewingVersionId(version.id)
                                setShowViewModal(true)
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              onClick={() => handleDownloadVersion(version.id, version.originalName)}
                              variant="outline"
                              size="sm"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            {!version.isLatestVersion && (
                              <Button
                                onClick={() => handleRestoreVersion(version.id)}
                                variant="outline"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                if (selectedVersion?.id === version.id) {
                                  setSelectedVersion(null)
                                } else if (compareVersion?.id === version.id) {
                                  setCompareVersion(null)
                                } else if (!selectedVersion) {
                                  setSelectedVersion(version)
                                } else if (!compareVersion) {
                                  setCompareVersion(version)
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className={
                                selectedVersion?.id === version.id || compareVersion?.id === version.id
                                  ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                                  : ''
                              }
                            >
                              {selectedVersion?.id === version.id || compareVersion?.id === version.id ? (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                <>
                                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                                  Select to Compare
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-saywhat-orange">{versions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {versions.reduce((sum, v) => sum + (v.viewCount || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {versions.reduce((sum, v) => sum + (v.downloadCount || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">First Version</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-gray-900">
                {versions.length > 0 ? formatDateTime(versions[versions.length - 1].createdAt) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document View Modal */}
      {showViewModal && viewingVersionId && (
        <DocumentViewModal
          documentId={viewingVersionId}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setViewingVersionId(null)
          }}
        />
      )}
    </ModulePage>
  )
}

export default function VersionHistoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading version history...</p>
        </div>
      </div>
    }>
      <VersionHistoryContent />
    </Suspense>
  )
}

