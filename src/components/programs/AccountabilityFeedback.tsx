"use client"

import { useState, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleOvalLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  BellIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface Feedback {
  id: string
  type: 'suggestion' | 'complaint' | 'compliment' | 'report' | 'question'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  title: string
  description: string
  submittedBy: string
  submittedAt: string
  isAnonymous: boolean
  contactMethod: 'email' | 'phone' | 'whatsapp' | 'sms' | 'web'
  project: string
  location?: string
  tags: string[]
  assignedTo?: string
  resolution?: string
  resolvedAt?: string
  escalationLevel: number
  attachments?: string[]
  responses: FeedbackResponse[]
}

interface FeedbackResponse {
  id: string
  feedbackId: string
  respondedBy: string
  respondedAt: string
  message: string
  isInternal: boolean
  attachments?: string[]
}

interface EscalationRule {
  id: string
  name: string
  conditions: {
    type?: string[]
    priority?: string[]
    project?: string[]
    keywords?: string[]
  }
  actions: {
    assignTo: string
    notify: string[]
    deadline: number // hours
    autoEscalate: boolean
  }
  isActive: boolean
}

export default function AccountabilityFeedback() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'reports' | 'analytics' | 'settings'>('feedback')
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewFeedback, setShowNewFeedback] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    loadFeedbacks()
    loadEscalationRules()
    loadAnalytics()
  }, [])

  const loadFeedbacks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/meal/feedback')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFeedbacks(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEscalationRules = async () => {
    try {
      const response = await fetch('/api/meal/escalation')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setEscalationRules(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to load escalation rules:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/meal/feedback/analytics')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnalyticsData(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesType = selectedType === 'all' || feedback.type === selectedType
    const matchesStatus = selectedStatus === 'all' || feedback.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || feedback.priority === selectedPriority
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesStatus && matchesPriority && matchesSearch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <LightBulbIcon className="h-5 w-5 text-blue-600" />
      case 'complaint': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'compliment': return <HeartIcon className="h-5 w-5 text-green-600" />
      case 'report': return <FlagIcon className="h-5 w-5 text-orange-600" />
      case 'question': return <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
      default: return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email': return <EnvelopeIcon className="h-4 w-4" />
      case 'phone': return <PhoneIcon className="h-4 w-4" />
      case 'whatsapp': return <ChatBubbleOvalLeftIcon className="h-4 w-4" />
      case 'sms': return <DevicePhoneMobileIcon className="h-4 w-4" />
      case 'web': return <GlobeAltIcon className="h-4 w-4" />
      default: return <UserIcon className="h-4 w-4" />
    }
  }

  const getAnalyticsData = () => {
    if (analyticsData) {
      return {
        total: analyticsData.overview.totalFeedback,
        byType: analyticsData.byType,
        byStatus: analyticsData.byStatus,
        byPriority: analyticsData.byPriority,
        resolutionRate: analyticsData.overview.resolutionRate,
        avgResponseTime: analyticsData.overview.avgResponseTime
      }
    }
    
    // Fallback to calculated data if analytics not loaded
    const total = feedbacks.length
    const byType = feedbacks.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byStatus = feedbacks.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byPriority = feedbacks.reduce((acc, f) => {
      acc[f.priority] = (acc[f.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resolved = feedbacks.filter(f => f.status === 'resolved').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    return {
      total,
      byType,
      byStatus,
      byPriority,
      resolutionRate,
      avgResponseTime: '2.5 hours'
    }
  }

  const analytics = getAnalyticsData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accountability & Feedback</h2>
            <p className="text-gray-600 mt-1">Digital suggestion box, anonymous reporting, and feedback tracking</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowNewFeedback(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Submit Feedback</span>
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <FlagIcon className="h-5 w-5" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'feedback', label: 'Feedback', icon: ChatBubbleLeftRightIcon },
            { id: 'reports', label: 'Reports', icon: FlagIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'settings', label: 'Settings', icon: ShieldCheckIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <ChatBubbleLeftRightIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Types</option>
            <option value="suggestion">Suggestions</option>
            <option value="complaint">Complaints</option>
            <option value="compliment">Compliments</option>
            <option value="report">Reports</option>
            <option value="question">Questions</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Feedback Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.resolutionRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgResponseTime}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.byPriority.critical || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Feedback ({filteredFeedbacks.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getTypeIcon(feedback.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{feedback.title}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                            {feedback.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{feedback.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            {getContactIcon(feedback.contactMethod)}
                            <span>{feedback.contactMethod}</span>
                          </span>
                          <span>Project: {feedback.project}</span>
                          {feedback.location && <span>Location: {feedback.location}</span>}
                          <span>Submitted: {new Date(feedback.submittedAt).toLocaleDateString()}</span>
                          {feedback.isAnonymous ? (
                            <span className="flex items-center space-x-1 text-orange-600">
                              <EyeSlashIcon className="h-4 w-4" />
                              <span>Anonymous</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-green-600">
                              <EyeIcon className="h-4 w-4" />
                              <span>{feedback.submittedBy}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          {feedback.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        {feedback.assignedTo && (
                          <div className="mt-2 text-sm text-blue-600">
                            Assigned to: {feedback.assignedTo}
                          </div>
                        )}
                        {feedback.responses.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-2">Latest Response:</h5>
                            <p className="text-sm text-blue-800">{feedback.responses[feedback.responses.length - 1].message}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              By {feedback.responses[feedback.responses.length - 1].respondedBy} on {new Date(feedback.responses[feedback.responses.length - 1].respondedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedFeedback(feedback)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <FlagIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback by Type</h3>
              <div className="space-y-3">
                {Object.entries(analytics.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(status).replace('text-', 'bg-').replace('-800', '-500')}`}></span>
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.byPriority).map(([priority, count]) => (
                <div key={priority} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(priority)} mb-2`}>
                    {priority}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalation Rules</h3>
            <div className="space-y-4">
              {escalationRules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Conditions:</strong> {Object.entries(rule.conditions).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(', ')}</p>
                    <p><strong>Actions:</strong> Assign to {rule.actions.assignTo}, Notify: {rule.actions.notify.join(', ')}, Deadline: {rule.actions.deadline}h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
