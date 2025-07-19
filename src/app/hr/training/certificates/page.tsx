"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeftIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline"

interface Certificate {
  id: string
  employeeName: string
  employeeId: string
  program: string
  category: string
  issuedDate: string
  expiryDate?: string
  certificateNumber: string
  instructor: string
  grade?: string
  status: 'valid' | 'expired' | 'revoked'
  verificationCode: string
}

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Sample certificates data
  const certificates: Certificate[] = [
    {
      id: "1",
      employeeName: "Sarah Johnson",
      employeeId: "EMP001",
      program: "Leadership Development Program",
      category: "Leadership",
      issuedDate: "2024-01-15",
      expiryDate: "2027-01-15",
      certificateNumber: "SAYWHAT-LEAD-2024-001",
      instructor: "Dr. Sarah Johnson",
      grade: "A",
      status: "valid",
      verificationCode: "VERIFY123456"
    },
    {
      id: "2",
      employeeName: "Michael Adebayo",
      employeeId: "EMP002",
      program: "Data Analysis with Python",
      category: "Technical Skills",
      issuedDate: "2024-01-10",
      certificateNumber: "SAYWHAT-TECH-2024-002",
      instructor: "Michael Chen",
      grade: "B+",
      status: "valid",
      verificationCode: "VERIFY789012"
    },
    {
      id: "3",
      employeeName: "David Okonkwo",
      employeeId: "EMP003",
      program: "Workplace Safety Training",
      category: "Safety",
      issuedDate: "2023-12-20",
      expiryDate: "2024-12-20",
      certificateNumber: "SAYWHAT-SAFE-2023-045",
      instructor: "Safety Team",
      grade: "Pass",
      status: "expired",
      verificationCode: "VERIFY345678"
    },
    {
      id: "4",
      employeeName: "Grace Mwangi",
      employeeId: "EMP004",
      program: "Financial Management Basics",
      category: "Professional Development",
      issuedDate: "2024-01-08",
      certificateNumber: "SAYWHAT-FIN-2024-003",
      instructor: "Jennifer Smith",
      grade: "A-",
      status: "valid",
      verificationCode: "VERIFY901234"
    }
  ]

  const categories = [...new Set(certificates.map(cert => cert.category))]
  const statuses = ['valid', 'expired', 'revoked']

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = certificate.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || certificate.status === statusFilter
    const matchesCategory = !categoryFilter || certificate.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowModal(true)
  }

  const handleDownloadCertificate = (certificateId: string) => {
    // TODO: Implement certificate download
    console.log('Downloading certificate:', certificateId)
    alert('Certificate download functionality will be implemented with backend integration.')
  }

  const handleVerifyCertificate = (verificationCode: string) => {
    // TODO: Implement certificate verification
    console.log('Verifying certificate:', verificationCode)
    alert('Certificate verification functionality will be implemented with backend integration.')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800 border-green-200'
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      case 'revoked': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircleIcon className="h-4 w-4" />
      case 'expired': return <XCircleIcon className="h-4 w-4" />
      case 'revoked': return <XCircleIcon className="h-4 w-4" />
      default: return <CheckCircleIcon className="h-4 w-4" />
    }
  }

  const sidebarContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Total Certificates:</span>
            <span className="font-medium">{certificates.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Valid:</span>
            <span className="font-medium text-green-600">
              {certificates.filter(c => c.status === 'valid').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Expired:</span>
            <span className="font-medium text-red-600">
              {certificates.filter(c => c.status === 'expired').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Revoked:</span>
            <span className="font-medium text-gray-600">
              {certificates.filter(c => c.status === 'revoked').length}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex justify-between text-sm">
              <span>{category}:</span>
              <span className="font-medium">
                {certificates.filter(c => c.category === category).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <TrophyIcon className="h-4 w-4 mr-2" />
            Issue Certificate
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Bulk Export
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Verify Certificate
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={{
        title: "Certificates",
        description: "Manage training certificates and verifications",
        breadcrumbs: [
          { name: "HR", href: "/hr" },
          { name: "Training", href: "/hr/training" },
          { name: "Certificates" }
        ]
      }}
      sidebar={sidebarContent}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/hr/training" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Training Programs
          </Link>
        </div>

        <div className="bg-white shadow-sm border rounded-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Training Certificates</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredCertificates.length} of {certificates.length} certificates
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  Issue Certificate
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm("")
                setStatusFilter("")
                setCategoryFilter("")
              }}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Certificates List */}
          <div className="p-6">
            {filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <TrophyIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
                <p className="text-gray-600">No certificates match your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map(certificate => (
                  <div key={certificate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-yellow-500" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(certificate.status)}`}>
                          {getStatusIcon(certificate.status)}
                          <span className="ml-1 capitalize">{certificate.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2">{certificate.program}</h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3 w-3" />
                        <span>{certificate.employeeName} ({certificate.employeeId})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3" />
                        <span>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</span>
                      </div>
                      {certificate.expiryDate && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Expires: {new Date(certificate.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <AcademicCapIcon className="h-3 w-3" />
                        <span>Grade: {certificate.grade || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Certificate #: {certificate.certificateNumber}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCertificate(certificate)}
                        className="flex-1"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadCertificate(certificate.id)}
                        className="flex-1"
                      >
                        <DocumentArrowDownIcon className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Details Modal */}
        {showModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Certificate Details</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-8 mb-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <TrophyIcon className="h-16 w-16 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
                    <p className="text-lg text-gray-700 mb-4">This certifies that</p>
                    <h3 className="text-xl font-bold text-blue-900 mb-4">{selectedCertificate.employeeName}</h3>
                    <p className="text-gray-700 mb-2">has successfully completed</p>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{selectedCertificate.program}</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p className="font-medium">Instructor:</p>
                        <p>{selectedCertificate.instructor}</p>
                      </div>
                      <div>
                        <p className="font-medium">Grade:</p>
                        <p>{selectedCertificate.grade || 'Pass'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Issue Date:</p>
                        <p>{new Date(selectedCertificate.issuedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Certificate #:</p>
                        <p>{selectedCertificate.certificateNumber}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-blue-200 pt-4">
                      <p className="text-sm text-gray-600">SAYWHAT Organization</p>
                      <p className="text-xs text-gray-500">Verification Code: {selectedCertificate.verificationCode}</p>
                    </div>
                  </div>
                </div>
                
                {/* Certificate Metadata */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Certificate Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="ml-2 font-medium">{selectedCertificate.employeeId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium">{selectedCertificate.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedCertificate.status)}`}>
                        {selectedCertificate.status.charAt(0).toUpperCase() + selectedCertificate.status.slice(1)}
                      </span>
                    </div>
                    {selectedCertificate.expiryDate && (
                      <div>
                        <span className="text-gray-600">Expires:</span>
                        <span className="ml-2 font-medium">{new Date(selectedCertificate.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Close
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleVerifyCertificate(selectedCertificate.verificationCode)}
                  >
                    Verify Certificate
                  </Button>
                  <Button 
                    onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
