'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload, File, Download, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedBy: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface Risk {
  id: string
  riskId: string
  title: string
  description: string
}

export default function RiskDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const riskId = params.id as string
  
  const [risk, setRisk] = useState<Risk | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (riskId) {
      loadRiskAndDocuments()
    }
  }, [riskId])

  const loadRiskAndDocuments = async () => {
    try {
      setLoading(true)
      
      // Load risk details
      const riskResponse = await fetch(`/api/risk-management/risks/${riskId}`)
      if (riskResponse.ok) {
        const riskData = await riskResponse.json()
        if (riskData.success) {
          setRisk(riskData.data.risk)
        }
      }
      
      // Load documents (for now, we'll show placeholder data)
      // In a real implementation, this would fetch from an API
      setDocuments([])
      
    } catch (error) {
      console.error('Error loading risk and documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      
      for (const file of files) {
        // In a real implementation, this would upload to cloud storage
        // For now, we'll just show a placeholder
        console.log('Would upload file:', file.name)
      }
      
      // Reload documents after upload
      await loadRiskAndDocuments()
      
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/risk-management"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Management
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Risk Documents
            </h1>
            {risk && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Risk ID:</span> {risk.riskId}</p>
                <p><span className="font-medium">Title:</span> {risk.title}</p>
                <p className="mt-2">{risk.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-gray-600">
                Drag and drop files here, or click to select files
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {uploading && (
              <p className="text-blue-600 mt-2">Uploading files...</p>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Documents ({documents.length})
            </h2>
          </div>
          
          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No documents uploaded yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload your first document using the upload section above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <File className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.fileSize)} • Uploaded by {doc.uploadedBy.firstName} {doc.uploadedBy.lastName} • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600" title="Preview">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
