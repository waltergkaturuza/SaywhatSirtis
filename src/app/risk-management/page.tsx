"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  FileText,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const SAYWHAT_COLORS = {
  orange: '#ff6b35',
  red: '#dc2626', 
  grey: '#6b7280',
  dark: '#1f2937',
  lightGrey: '#f3f4f6'
}

interface Risk {
  id: string
  title: string
  description: string
  category: 'Operational' | 'Strategic' | 'Financial' | 'Compliance' | 'Reputational' | 'Environmental' | 'Cybersecurity' | 'HR/Personnel'
  department: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  riskScore: number
  status: 'Open' | 'Mitigated' | 'Escalated' | 'Closed'
  dateIdentified: string
  owner: string
  mitigationPlan?: string
  documents?: string[]
  lastReviewed?: string
  createdBy: string
}

interface RiskStats {
  totalRisks: number
  openRisks: number
  highRisks: number
  overdueMitigations: number
  risksByCategory: Record<string, number>
  risksByDepartment: Record<string, number>
}

const riskCategories = [
  'Operational',
  'Strategic', 
  'Financial',
  'Compliance',
  'Reputational',
  'Environmental',
  'Cybersecurity',
  'HR/Personnel'
]

const departments = [
  'Programs',
  'Finance',
  'HR',
  'Call Centre',
  'Management',
  'IT',
  'Operations'
]

const probabilityLevels = ['Low', 'Medium', 'High']
const impactLevels = ['Low', 'Medium', 'High']
const statusOptions = ['Open', 'Mitigated', 'Escalated', 'Closed']

export default function RiskManagementPage() {
  const { data: session, status } = useSession()
  const [risks, setRisks] = useState<Risk[]>([])
  const [stats, setStats] = useState<RiskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    status: '',
    probability: '',
    impact: ''
  })

  // Mock data for development
  useEffect(() => {
    const mockRisks: Risk[] = [
      {
        id: '1',
        title: 'Data Breach Risk',
        description: 'Potential unauthorized access to beneficiary personal data',
        category: 'Cybersecurity',
        department: 'IT',
        probability: 'Medium',
        impact: 'High',
        riskScore: 6,
        status: 'Open',
        dateIdentified: '2024-01-15',
        owner: 'IT Manager',
        createdBy: 'System Admin',
        lastReviewed: '2024-02-01'
      },
      {
        id: '2',
        title: 'Donor Funding Delay',
        description: 'Risk of delayed funding affecting program implementation',
        category: 'Financial',
        department: 'Finance',
        probability: 'High',
        impact: 'High',
        riskScore: 9,
        status: 'Open',
        dateIdentified: '2024-02-01',
        owner: 'Finance Director',
        createdBy: 'Finance Team'
      },
      {
        id: '3',
        title: 'Staff Turnover',
        description: 'High turnover in key program positions',
        category: 'HR/Personnel',
        department: 'HR',
        probability: 'Medium',
        impact: 'Medium',
        riskScore: 4,
        status: 'Mitigated',
        dateIdentified: '2024-01-10',
        owner: 'HR Manager',
        createdBy: 'HR Team',
        mitigationPlan: 'Implemented retention programs and competitive compensation review'
      }
    ]

    const mockStats: RiskStats = {
      totalRisks: 3,
      openRisks: 2,
      highRisks: 2,
      overdueMitigations: 1,
      risksByCategory: {
        'Cybersecurity': 1,
        'Financial': 1,
        'HR/Personnel': 1
      },
      risksByDepartment: {
        'IT': 1,
        'Finance': 1,
        'HR': 1
      }
    }

    setRisks(mockRisks)
    setStats(mockStats)
    setLoading(false)
  }, [])

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return 'text-red-600 bg-red-100'
    if (score >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800'
      case 'Mitigated': return 'bg-green-100 text-green-800'
      case 'Escalated': return 'bg-yellow-100 text-yellow-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
          <p className="mt-4 text-saywhat-grey">Loading Risk Management...</p>
        </div>
      </div>
    )
  }

  const filteredRisks = risks.filter(risk => {
    return (!filters.category || risk.category === filters.category) &&
           (!filters.department || risk.department === filters.department) &&
           (!filters.status || risk.status === filters.status) &&
           (!filters.probability || risk.probability === filters.probability) &&
           (!filters.impact || risk.impact === filters.impact)
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
            <p className="text-gray-600">Monitor, assess, and mitigate organizational risks</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-saywhat-orange hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register New Risk
          </Button>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-saywhat-orange" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Risks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRisks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Risks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.openRisks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.highRisks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue Actions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overdueMitigations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="register">Risk Register</TabsTrigger>
            <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Categories Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Risks by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && Object.entries(stats.risksByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Risks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risks.slice(0, 3).map(risk => (
                      <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{risk.title}</p>
                          <p className="text-sm text-gray-600">{risk.department}</p>
                        </div>
                        <Badge className={getRiskScoreColor(risk.riskScore)}>
                          Score: {risk.riskScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {riskCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => setFilters({category: '', department: '', status: '', probability: '', impact: ''})}>
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>

                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Risk Register Table */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Register ({filteredRisks.length} risks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Risk ID</th>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Risk Score</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Owner</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRisks.map(risk => (
                        <tr key={risk.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">#{risk.id}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{risk.title}</p>
                              <p className="text-sm text-gray-600 truncate max-w-xs">{risk.description}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{risk.category}</Badge>
                          </td>
                          <td className="p-3">{risk.department}</td>
                          <td className="p-3">
                            <Badge className={getRiskScoreColor(risk.riskScore)}>
                              {risk.riskScore}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(risk.status)}>
                              {risk.status}
                            </Badge>
                          </td>
                          <td className="p-3">{risk.owner}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedRisk(risk)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Heat Matrix</CardTitle>
                <p className="text-gray-600">Visual representation of risks by probability and impact</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 max-w-md">
                  <div className="p-2 text-sm font-medium">Impact →</div>
                  <div className="p-2 text-sm font-medium text-center">Low</div>
                  <div className="p-2 text-sm font-medium text-center">Medium</div>
                  <div className="p-2 text-sm font-medium text-center">High</div>
                  
                  <div className="p-2 text-sm font-medium">High</div>
                  <div className="p-4 bg-yellow-200 border rounded text-center">0</div>
                  <div className="p-4 bg-orange-200 border rounded text-center">0</div>
                  <div className="p-4 bg-red-200 border rounded text-center">2</div>
                  
                  <div className="p-2 text-sm font-medium">Medium</div>
                  <div className="p-4 bg-green-200 border rounded text-center">0</div>
                  <div className="p-4 bg-yellow-200 border rounded text-center">1</div>
                  <div className="p-4 bg-orange-200 border rounded text-center">0</div>
                  
                  <div className="p-2 text-sm font-medium">Low</div>
                  <div className="p-4 bg-green-100 border rounded text-center">0</div>
                  <div className="p-4 bg-green-200 border rounded text-center">0</div>
                  <div className="p-4 bg-yellow-200 border rounded text-center">0</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-saywhat-orange mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Risk Register Report</h3>
                    <p className="text-sm text-gray-600 mb-4">Complete list of all registered risks</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-saywhat-orange mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Quarterly Review</h3>
                    <p className="text-sm text-gray-600 mb-4">Risk assessment quarterly summary</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-saywhat-orange mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Risk Trends</h3>
                    <p className="text-sm text-gray-600 mb-4">Historical risk analysis and trends</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}