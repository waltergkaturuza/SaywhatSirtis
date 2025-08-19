"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ExclamationTriangleIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline"

interface Risk {
  id: string
  title: string
  description: string
  department: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Mitigated' | 'Closed'
  dateIdentified: string
  dateUpdated: string
  assignedTo: string
}

const mockRisks: Risk[] = [
  {
    id: '1',
    title: 'Data Security Breach',
    description: 'Potential vulnerability in user data protection systems',
    department: 'IT Department',
    riskLevel: 'High',
    status: 'Open',
    dateIdentified: '2024-12-01',
    dateUpdated: '2024-12-15',
    assignedTo: 'John Doe'
  },
  {
    id: '2',
    title: 'Budget Overrun Risk',
    description: 'Current spending trends may exceed allocated budget',
    department: 'Finance Department',
    riskLevel: 'Medium',
    status: 'Mitigated',
    dateIdentified: '2024-11-15',
    dateUpdated: '2024-12-10',
    assignedTo: 'Jane Smith'
  },
  {
    id: '3',
    title: 'Staff Retention Issues',
    description: 'High turnover rate in key departments',
    department: 'Human Resources',
    riskLevel: 'High',
    status: 'Open',
    dateIdentified: '2024-10-20',
    dateUpdated: '2024-12-01',
    assignedTo: 'Mike Johnson'
  }
]

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'Low': return 'bg-green-100 text-green-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Critical': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open': return 'bg-red-100 text-red-800'
    case 'Mitigated': return 'bg-yellow-100 text-yellow-800'
    case 'Closed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function RiskManagementPage() {
  const [risks] = useState<Risk[]>(mockRisks)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All')

  const departments = ['All', 'IT Department', 'Finance Department', 'Human Resources', 'Operations', 'Programs']
  
  const filteredRisks = selectedDepartment === 'All' 
    ? risks 
    : risks.filter(risk => risk.department === selectedDepartment)

  const riskStats = {
    total: risks.length,
    high: risks.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Critical').length,
    open: risks.filter(r => r.status === 'Open').length,
    mitigated: risks.filter(r => r.status === 'Mitigated').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
          <p className="text-gray-600 mt-2">
            Manage organizational and departmental risks across SAYWHAT
          </p>
        </div>
        <Button className="bg-saywhat-orange hover:bg-saywhat-orange/90">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Risk
        </Button>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{riskStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High/Critical Risks</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskStats.high}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Risks</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{riskStats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitigated Risks</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{riskStats.mitigated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Filter */}
      <div className="flex space-x-2">
        {departments.map((dept) => (
          <Button
            key={dept}
            variant={selectedDepartment === dept ? "default" : "outline"}
            onClick={() => setSelectedDepartment(dept)}
            className={selectedDepartment === dept ? "bg-saywhat-orange hover:bg-saywhat-orange/90" : ""}
          >
            {dept}
          </Button>
        ))}
      </div>

      {/* Risk List */}
      <div className="grid gap-4">
        {filteredRisks.map((risk) => (
          <Card key={risk.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{risk.title}</CardTitle>
                  <CardDescription>{risk.description}</CardDescription>
                  <div className="flex space-x-2">
                    <Badge className={getRiskLevelColor(risk.riskLevel)}>
                      {risk.riskLevel}
                    </Badge>
                    <Badge className={getStatusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                    <Badge variant="outline">
                      {risk.department}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Identified:</span> {risk.dateIdentified}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {risk.dateUpdated}
                </div>
                <div>
                  <span className="font-medium">Assigned to:</span> {risk.assignedTo}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
