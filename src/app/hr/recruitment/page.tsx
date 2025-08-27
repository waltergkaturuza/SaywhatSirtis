'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Trash2, Users, FileCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RecruitmentDocument {
  id: string
  name: string
  type: 'resume' | 'cover_letter' | 'certificate' | 'reference' | 'other'
  size: string
  uploadDate: string
  candidateName: string
  position: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
}

export default function RecruitmentPage() {
  const [documents, setDocuments] = useState<RecruitmentDocument[]>([
    {
      id: '1',
      name: 'john_doe_resume.pdf',
      type: 'resume',
      size: '2.1 MB',
      uploadDate: '2024-01-15',
      candidateName: 'John Doe',
      position: 'Software Developer',
      status: 'pending'
    },
    {
      id: '2',
      name: 'jane_smith_cover_letter.pdf',
      type: 'cover_letter',
      size: '1.5 MB',
      uploadDate: '2024-01-14',
      candidateName: 'Jane Smith',
      position: 'HR Manager',
      status: 'reviewed'
    }
  ])

  const [newDocument, setNewDocument] = useState({
    candidateName: '',
    position: '',
    type: 'resume' as const,
    notes: ''
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && newDocument.candidateName && newDocument.position) {
      const newDoc: RecruitmentDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: newDocument.type,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        candidateName: newDocument.candidateName,
        position: newDocument.position,
        status: 'pending'
      }
      setDocuments([...documents, newDoc])
      setNewDocument({ candidateName: '', position: '', type: 'resume', notes: '' })
    }
  }

  const updateDocumentStatus = (id: string, status: RecruitmentDocument['status']) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, status } : doc
    ))
  }

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resume': return '📄'
      case 'cover_letter': return '📝'
      case 'certificate': return '🏆'
      case 'reference': return '👥'
      default: return '📋'
    }
  }

  const summary = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    reviewed: documents.filter(d => d.status === 'reviewed').length,
    shortlisted: documents.filter(d => d.status === 'shortlisted').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruitment Management</h1>
            <p className="text-gray-600">Upload and manage recruitment documents</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviewed</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.reviewed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                  <p className="text-2xl font-bold text-green-600">{summary.shortlisted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Recruitment Document
            </CardTitle>
            <CardDescription>
              Upload candidate documents such as resumes, cover letters, and certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  value={newDocument.candidateName}
                  onChange={(e) => setNewDocument({...newDocument, candidateName: e.target.value})}
                  placeholder="Enter candidate's full name"
                />
              </div>
              <div>
                <Label htmlFor="position">Position Applied For</Label>
                <Input
                  id="position"
                  value={newDocument.position}
                  onChange={(e) => setNewDocument({...newDocument, position: e.target.value})}
                  placeholder="e.g., Software Developer, HR Manager"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select 
                  value={newDocument.type} 
                  onValueChange={(value: any) => setNewDocument({...newDocument, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume">Resume/CV</SelectItem>
                    <SelectItem value="cover_letter">Cover Letter</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="reference">Reference Letter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newDocument.notes}
                onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                placeholder="Additional notes about the candidate or application"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Recruitment Documents
            </CardTitle>
            <CardDescription>
              Manage and review uploaded recruitment documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">
                        {doc.candidateName} • {doc.position} • {doc.size} • {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                    <Select
                      value={doc.status}
                      onValueChange={(value: any) => updateDocumentStatus(doc.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recruitment documents uploaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}