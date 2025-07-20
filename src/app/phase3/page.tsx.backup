'use client'

import React, { useState, useEffect } from 'react'
import { Brain, Zap, Activity, Users, TrendingUp, FileText, Bell, Wifi, Clock, Star } from 'lucide-react'
import { PredictiveAnalytics, AIDocumentAnalysis, WorkflowAutomation } from '@/components/ai/phase3-ai-components'
import { RealTimeStatusIndicator, LiveNotifications, UserPresenceIndicator, LiveActivityFeed, CollaborativeEditing } from '@/components/realtime/phase3-realtime-components'
import { RealTimeProvider, defaultRealTimeConfig } from '@/lib/realtime-service'

// Mock data for demonstration
const mockEmployeeData = [
  {
    id: '1',
    name: 'John Doe',
    department: 'HR',
    role: 'Senior HR Manager',
    performanceHistory: [85, 87, 82, 90, 88],
    skillsRating: { leadership: 8, communication: 9, analytics: 7 },
    projectsCompleted: 12,
    attendanceRate: 96,
    lastReviewScore: 88
  },
  {
    id: '2',
    name: 'Jane Smith',
    department: 'Finance',
    role: 'Financial Analyst',
    performanceHistory: [92, 94, 89, 91, 93],
    skillsRating: { analytics: 9, attention: 8, excel: 9 },
    projectsCompleted: 8,
    attendanceRate: 98,
    lastReviewScore: 92
  },
  {
    id: '3',
    name: 'Mike Johnson',
    department: 'IT',
    role: 'Software Developer',
    performanceHistory: [78, 82, 85, 88, 84],
    skillsRating: { programming: 9, problemSolving: 8, teamwork: 7 },
    projectsCompleted: 15,
    attendanceRate: 94,
    lastReviewScore: 85
  }
] as const

const mockWorkflows = [
  {
    id: '1',
    name: 'Employee Onboarding',
    steps: ['Document Collection', 'Background Check', 'IT Setup', 'Orientation', 'Training'],
    metrics: { averageTime: 5.2, completionRate: 94, satisfaction: 4.3 },
    bottlenecks: ['Background Check', 'IT Setup']
  },
  {
    id: '2',
    name: 'Leave Request Processing',
    steps: ['Request Submission', 'Manager Approval', 'HR Review', 'Final Approval'],
    metrics: { averageTime: 2.1, completionRate: 98, satisfaction: 4.7 },
    bottlenecks: ['Manager Approval']
  },
  {
    id: '3',
    name: 'Project Delivery Process',
    steps: ['Planning', 'Development', 'Testing', 'Review', 'Deployment'],
    metrics: { averageTime: 15.8, completionRate: 87, satisfaction: 4.1 },
    bottlenecks: ['Testing', 'Review']
  }
]

interface Phase3Feature {
  id: string
  name: string
  category: 'ai' | 'realtime'
  status: 'active' | 'beta' | 'coming-soon'
  description: string
  icon: React.ReactNode
  metrics?: {
    usage: number
    performance: number
    satisfaction: number
  }
}

const phase3Features: Phase3Feature[] = [
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    category: 'ai',
    status: 'active',
    description: 'AI-powered employee performance predictions and insights',
    icon: <Brain className="w-5 h-5" />,
    metrics: { usage: 78, performance: 94, satisfaction: 87 }
  },
  {
    id: 'document-analysis',
    name: 'Document Analysis',
    category: 'ai',
    status: 'active',
    description: 'Automatic document categorization and content extraction',
    icon: <FileText className="w-5 h-5" />,
    metrics: { usage: 65, performance: 91, satisfaction: 82 }
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    category: 'ai',
    status: 'beta',
    description: 'AI-driven process optimization and automation suggestions',
    icon: <Zap className="w-5 h-5" />,
    metrics: { usage: 42, performance: 88, satisfaction: 79 }
  },
  {
    id: 'realtime-collaboration',
    name: 'Real-time Collaboration',
    category: 'realtime',
    status: 'active',
    description: 'Live document editing and team collaboration',
    icon: <Users className="w-5 h-5" />,
    metrics: { usage: 89, performance: 96, satisfaction: 92 }
  },
  {
    id: 'live-notifications',
    name: 'Live Notifications',
    category: 'realtime',
    status: 'active',
    description: 'Real-time alerts and activity updates',
    icon: <Bell className="w-5 h-5" />,
    metrics: { usage: 93, performance: 98, satisfaction: 88 }
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    category: 'realtime',
    status: 'active',
    description: 'Live stream of organizational activities and updates',
    icon: <Activity className="w-5 h-5" />,
    metrics: { usage: 71, performance: 95, satisfaction: 85 }
  }
]

export default function Phase3Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'realtime'>('overview')
  const [phase3Status, setPhase3Status] = useState({
    totalFeatures: phase3Features.length,
    activeFeatures: phase3Features.filter(f => f.status === 'active').length,
    overallPerformance: 0,
    userSatisfaction: 0
  })

  useEffect(() => {
    // Calculate overall metrics
    const activeFeatures = phase3Features.filter(f => f.status === 'active' && f.metrics)
    const avgPerformance = activeFeatures.reduce((sum, f) => sum + (f.metrics?.performance || 0), 0) / activeFeatures.length
    const avgSatisfaction = activeFeatures.reduce((sum, f) => sum + (f.metrics?.satisfaction || 0), 0) / activeFeatures.length
    
    setPhase3Status(prev => ({
      ...prev,
      overallPerformance: Math.round(avgPerformance),
      userSatisfaction: Math.round(avgSatisfaction)
    }))
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">Active</span>
      case 'beta':
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Beta</span>
      case 'coming-soon':
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">Coming Soon</span>
      default:
        return null
    }
  }

  const handleDocumentAnalyze = (file: File) => {
    console.log('Document analyzed:', file.name)
  }

  return (
    <RealTimeProvider config={defaultRealTimeConfig} userId="current-user">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      SIRTIS Phase 3
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Advanced AI & Real-time Features
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <RealTimeStatusIndicator />
                <UserPresenceIndicator roomId="phase3-dashboard" />
                <LiveNotifications />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
                { id: 'ai', label: 'AI Features', icon: <Brain className="w-4 h-4" /> },
                { id: 'realtime', label: 'Real-time', icon: <Wifi className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {phase3Status.totalFeatures}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Features</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {phase3Status.activeFeatures}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Features</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {phase3Status.overallPerformance}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {phase3Status.userSatisfaction}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Phase 3 Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phase3Features.map((feature) => (
                    <div key={feature.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            feature.category === 'ai' 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                              : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                          }`}>
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {feature.name}
                            </h3>
                          </div>
                        </div>
                        {getStatusBadge(feature.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {feature.description}
                      </p>
                      
                      {feature.metrics && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {feature.metrics.usage}%
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">Usage</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {feature.metrics.performance}%
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">Performance</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {feature.metrics.satisfaction}%
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">Satisfaction</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Activity */}
              <LiveActivityFeed />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-8">
              <PredictiveAnalytics employeeData={mockEmployeeData as any} />
              <AIDocumentAnalysis onAnalyze={handleDocumentAnalyze} />
              <WorkflowAutomation workflows={mockWorkflows} />
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LiveActivityFeed />
                <CollaborativeEditing documentId="phase3-demo-doc" />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Real-time Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Wifi className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">Connection</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">Active Users</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">12 online</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">Latency</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">&lt; 50ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RealTimeProvider>
  )
}
