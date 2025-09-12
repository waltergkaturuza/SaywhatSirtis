"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  EyeIcon,
  CloudArrowUpIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  StarIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

interface Qualification {
  id: string;
  type: 'education' | 'certification' | 'skill' | 'training';
  title: string;
  institution?: string;
  issuer?: string;
  dateObtained: string;
  expiryDate?: string;
  level?: string;
  grade?: string;
  description?: string;
  certificateUrl?: string;
  status: 'active' | 'expired' | 'pending';
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

interface QualificationFormData {
  type: 'education' | 'certification' | 'skill' | 'training';
  title: string;
  institution?: string;
  issuer?: string;
  dateObtained: string;
  expiryDate?: string;
  level?: string;
  grade?: string;
  description?: string;
}

export default function QualificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [formData, setFormData] = useState<QualificationFormData>({
    type: 'education',
    title: '',
    institution: '',
    issuer: '',
    dateObtained: '',
    expiryDate: '',
    level: '',
    grade: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'education' | 'certification' | 'skill' | 'training'>('all');

  // Load qualifications
  const loadQualifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee/qualifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch qualifications');
      }

      const data = await response.json();
      setQualifications(data);

    } catch (err) {
      setError('Failed to load qualifications');
      console.error('Error loading qualifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save qualification
  const handleSaveQualification = async () => {
    try {
      setSaving(true);
      setError('');

      const url = editingQualification 
        ? `/api/employee/qualifications/${editingQualification.id}`
        : '/api/employee/qualifications';
      
      const method = editingQualification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save qualification');
      }

      const savedQualification = await response.json();
      
      if (editingQualification) {
        setQualifications(prev => prev.map(q => 
          q.id === savedQualification.id ? savedQualification : q
        ));
        setSuccessMessage('Qualification updated successfully!');
      } else {
        setQualifications(prev => [...prev, savedQualification]);
        setSuccessMessage('Qualification added successfully!');
      }

      // Reset form
      setShowAddForm(false);
      setEditingQualification(null);
      setFormData({
        type: 'education',
        title: '',
        institution: '',
        issuer: '',
        dateObtained: '',
        expiryDate: '',
        level: '',
        grade: '',
        description: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      setError('Failed to save qualification');
      console.error('Error saving qualification:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete qualification
  const handleDeleteQualification = async (qualificationId: string) => {
    if (!confirm('Are you sure you want to delete this qualification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employee/qualifications/${qualificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete qualification');
      }

      setQualifications(prev => prev.filter(q => q.id !== qualificationId));
      setSuccessMessage('Qualification deleted successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      setError('Failed to delete qualification');
      console.error('Error deleting qualification:', err);
    }
  };

  // Upload certificate
  const handleCertificateUpload = async (qualificationId: string, file: File) => {
    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await fetch(`/api/employee/qualifications/${qualificationId}/certificate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload certificate');
      }

      const result = await response.json();
      
      // Update qualification with certificate URL
      setQualifications(prev => prev.map(q => 
        q.id === qualificationId 
          ? { ...q, certificateUrl: result.url }
          : q
      ));

      setSuccessMessage('Certificate uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      setError('Failed to upload certificate');
      console.error('Error uploading certificate:', err);
    }
  };

  // Start editing
  const startEdit = (qualification: Qualification) => {
    setEditingQualification(qualification);
    setFormData({
      type: qualification.type,
      title: qualification.title,
      institution: qualification.institution || '',
      issuer: qualification.issuer || '',
      dateObtained: qualification.dateObtained.split('T')[0],
      expiryDate: qualification.expiryDate ? qualification.expiryDate.split('T')[0] : '',
      level: qualification.level || '',
      grade: qualification.grade || '',
      description: qualification.description || ''
    });
    setShowAddForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingQualification(null);
    setFormData({
      type: 'education',
      title: '',
      institution: '',
      issuer: '',
      dateObtained: '',
      expiryDate: '',
      level: '',
      grade: '',
      description: ''
    });
  };

  // Filter qualifications by type
  const filteredQualifications = qualifications.filter(q => 
    activeTab === 'all' || q.type === activeTab
  );

  // Get qualification icon
  const getQualificationIcon = (type: string) => {
    switch (type) {
      case 'education':
        return <AcademicCapIcon className="h-5 w-5" />;
      case 'certification':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'skill':
        return <StarIcon className="h-5 w-5" />;
      case 'training':
        return <DocumentIcon className="h-5 w-5" />;
      default:
        return <DocumentIcon className="h-5 w-5" />;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string, verificationStatus: string) => {
    if (verificationStatus === 'rejected') {
      return 'bg-red-100 text-red-800';
    }
    if (verificationStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (status === 'expired') {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-green-100 text-green-800';
  };

  useEffect(() => {
    if (session) {
      loadQualifications();
    }
  }, [session]);

  // Redirect if not authenticated
  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <ModulePage
      metadata={{
        title: "My Qualifications",
        description: "Manage your education, certifications, skills, and training records",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" },
          { name: "Qualifications", href: "/employee/qualifications" }
        ]
      }}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Qualifications</h1>
            <p className="text-sm text-gray-500">Manage your education, certifications, and skills</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-saywhat-orange hover:bg-saywhat-orange/90"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Qualification
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: qualifications.length },
              { key: 'education', label: 'Education', count: qualifications.filter(q => q.type === 'education').length },
              { key: 'certification', label: 'Certifications', count: qualifications.filter(q => q.type === 'certification').length },
              { key: 'skill', label: 'Skills', count: qualifications.filter(q => q.type === 'skill').length },
              { key: 'training', label: 'Training', count: qualifications.filter(q => q.type === 'training').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-saywhat-orange text-saywhat-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingQualification ? 'Edit Qualification' : 'Add New Qualification'}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                  >
                    <option value="education">Education</option>
                    <option value="certification">Certification</option>
                    <option value="skill">Skill</option>
                    <option value="training">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    required
                  />
                </div>

                {(formData.type === 'education' || formData.type === 'training') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                      placeholder="e.g., University of Technology"
                    />
                  </div>
                )}

                {(formData.type === 'certification' || formData.type === 'skill') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issuer</label>
                    <input
                      type="text"
                      value={formData.issuer}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                      placeholder="e.g., Microsoft, Google, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Obtained *</label>
                  <input
                    type="date"
                    value={formData.dateObtained}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateObtained: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    required
                  />
                </div>

                {formData.type === 'certification' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Level/Grade</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    placeholder="e.g., Bachelor's, Professional, Expert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade/Score</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    placeholder="e.g., First Class, 85%, A+"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                    placeholder="Additional details about this qualification..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveQualification}
                  disabled={saving || !formData.title || !formData.dateObtained}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90 disabled:opacity-50"
                >
                  <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : (editingQualification ? 'Update' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Qualifications List */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading qualifications...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredQualifications.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No qualifications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'all' 
                    ? 'Get started by adding your first qualification.' 
                    : `No ${activeTab} records found.`}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Qualification
                  </button>
                </div>
              </div>
            ) : (
              filteredQualifications.map((qualification) => (
                <div key={qualification.id} className="bg-white shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 text-gray-400">
                            {getQualificationIcon(qualification.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{qualification.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {qualification.institution && (
                                <span>📍 {qualification.institution}</span>
                              )}
                              {qualification.issuer && (
                                <span>🏢 {qualification.issuer}</span>
                              )}
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(qualification.dateObtained).toLocaleDateString()}
                              </span>
                              {qualification.expiryDate && (
                                <span className="flex items-center">
                                  ⏰ Expires: {new Date(qualification.expiryDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {qualification.level && (
                              <p className="mt-1 text-sm text-gray-600">Level: {qualification.level}</p>
                            )}
                            {qualification.grade && (
                              <p className="mt-1 text-sm text-gray-600">Grade: {qualification.grade}</p>
                            )}
                            {qualification.description && (
                              <p className="mt-2 text-sm text-gray-600">{qualification.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Status Badges */}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(qualification.status, qualification.verificationStatus)}`}>
                          {qualification.verificationStatus === 'verified' ? qualification.status : qualification.verificationStatus}
                        </span>

                        {/* Certificate Upload/View */}
                        {qualification.certificateUrl ? (
                          <a
                            href={qualification.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-saywhat-orange hover:text-saywhat-orange/80"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                        ) : (
                          <label className="text-gray-400 hover:text-saywhat-orange cursor-pointer">
                            <CloudArrowUpIcon className="h-5 w-5" />
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleCertificateUpload(qualification.id, file);
                                }
                              }}
                            />
                          </label>
                        )}

                        {/* Actions */}
                        <button
                          onClick={() => startEdit(qualification)}
                          className="text-gray-400 hover:text-saywhat-orange"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQualification(qualification.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ModulePage>
  );
}
