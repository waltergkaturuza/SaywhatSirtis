"use client"

import { useState, useEffect } from "react"
import { 
  WrenchScrewdriverIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Asset, InventoryPermissions } from '@/types/inventory'

interface MaintenanceManagementProps {
  assets: Asset[]
  permissions: InventoryPermissions
}

interface MaintenanceRecord {
  id: string
  assetId: string
  type: 'preventive' | 'corrective' | 'inspection' | 'calibration'
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled'
  title: string
  description: string
  scheduledDate: string
  completedDate?: string
  estimatedCost: number
  actualCost?: number
  technician?: string
  vendor?: string
  notes?: string
  attachments?: string[]
  nextDueDate?: string
  createdAt: string
  updatedAt: string
}

interface MaintenanceSchedule {
  id: string
  assetId: string
  name: string
  type: 'preventive' | 'inspection' | 'calibration'
  frequency: number // days
  lastPerformed?: string
  nextDue: string
  estimatedCost: number
  instructions?: string
  isActive: boolean
}

export function MaintenanceManagement({ assets, permissions }: MaintenanceManagementProps) {
  const [activeView, setActiveView] = useState<'overview' | 'records' | 'schedules' | 'calendar'>('overview')
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({})
  const [newSchedule, setNewSchedule] = useState<Partial<MaintenanceSchedule>>({})

  // Initialize sample data
  useEffect(() => {
    const sampleRecords: MaintenanceRecord[] = [
      {
        id: '1',
        assetId: '1',
        type: 'preventive',
        status: 'completed',
        title: 'Quarterly System Maintenance',
        description: 'Regular cleaning and software updates',
        scheduledDate: '2024-07-15',
        completedDate: '2024-07-15',
        estimatedCost: 50,
        actualCost: 45,
        technician: 'John Tech',
        notes: 'All systems running optimally',
        createdAt: '2024-07-10T10:00:00Z',
        updatedAt: '2024-07-15T15:30:00Z'
      },
      {
        id: '2',
        assetId: '3',
        type: 'inspection',
        status: 'overdue',
        title: 'Vehicle Safety Inspection',
        description: 'Annual safety and emissions inspection',
        scheduledDate: '2024-07-01',
        estimatedCost: 100,
        technician: 'Service Center',
        vendor: 'AutoCare Services',
        createdAt: '2024-06-20T10:00:00Z',
        updatedAt: '2024-07-01T10:00:00Z'
      },
      {
        id: '3',
        assetId: '2',
        type: 'corrective',
        status: 'scheduled',
        title: 'Printer Repair',
        description: 'Fix paper jam mechanism',
        scheduledDate: '2024-07-25',
        estimatedCost: 80,
        technician: 'HP Support',
        vendor: 'HP Service Center',
        createdAt: '2024-07-18T14:00:00Z',
        updatedAt: '2024-07-18T14:00:00Z'
      }
    ]

    const sampleSchedules: MaintenanceSchedule[] = [
      {
        id: '1',
        assetId: '1',
        name: 'Quarterly Maintenance',
        type: 'preventive',
        frequency: 90,
        lastPerformed: '2024-07-15',
        nextDue: '2024-10-15',
        estimatedCost: 50,
        instructions: 'Clean vents, update software, check hardware',
        isActive: true
      },
      {
        id: '2',
        assetId: '3',
        name: 'Annual Vehicle Inspection',
        type: 'inspection',
        frequency: 365,
        nextDue: '2025-07-01',
        estimatedCost: 100,
        instructions: 'Complete safety and emissions inspection',
        isActive: true
      },
      {
        id: '3',
        assetId: '2',
        name: 'Monthly Printer Check',
        type: 'preventive',
        frequency: 30,
        lastPerformed: '2024-06-20',
        nextDue: '2024-07-20',
        estimatedCost: 25,
        instructions: 'Clean print heads, check paper feed, test functionality',
        isActive: true
      }
    ]

    setMaintenanceRecords(sampleRecords)
    setMaintenanceSchedules(sampleSchedules)
  }, [])

  // Load data from backend
  useEffect(() => {
    const loadMaintenanceData = async () => {
      setLoading(true)
      try {
        const [recordsResponse, schedulesResponse] = await Promise.all([
          fetch('/api/inventory/maintenance/records'),
          fetch('/api/inventory/maintenance/schedules')
        ])

        if (recordsResponse.ok) {
          const records = await recordsResponse.json()
          setMaintenanceRecords(records)
        }

        if (schedulesResponse.ok) {
          const schedules = await schedulesResponse.json()
          setMaintenanceSchedules(schedules)
        }
      } catch (error) {
        console.log('Backend not available, using sample data')
      } finally {
        setLoading(false)
      }
    }

    loadMaintenanceData()
  }, [])

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    return asset ? asset.name : 'Unknown Asset'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
      case 'corrective':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'inspection':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'calibration':
        return <ClockIcon className="h-5 w-5 text-purple-600" />
      default:
        return <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const createMaintenanceRecord = async () => {
    if (!newRecord.title || !newRecord.assetId || !newRecord.scheduledDate) {
      alert('Please fill in all required fields')
      return
    }

    const record: MaintenanceRecord = {
      id: (maintenanceRecords.length + 1).toString(),
      assetId: newRecord.assetId || '',
      type: newRecord.type || 'preventive',
      status: 'scheduled',
      title: newRecord.title || '',
      description: newRecord.description || '',
      scheduledDate: newRecord.scheduledDate || '',
      estimatedCost: newRecord.estimatedCost || 0,
      technician: newRecord.technician,
      vendor: newRecord.vendor,
      notes: newRecord.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/inventory/maintenance/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })

      if (response.ok) {
        const savedRecord = await response.json()
        setMaintenanceRecords(prev => [...prev, savedRecord])
      } else {
        // Fallback to local state
        setMaintenanceRecords(prev => [...prev, record])
      }
    } catch (error) {
      // Fallback to local state
      setMaintenanceRecords(prev => [...prev, record])
    }

    setNewRecord({})
    setShowCreateModal(false)
  }

  const createMaintenanceSchedule = async () => {
    if (!newSchedule.name || !newSchedule.assetId || !newSchedule.frequency) {
      alert('Please fill in all required fields')
      return
    }

    const schedule: MaintenanceSchedule = {
      id: (maintenanceSchedules.length + 1).toString(),
      assetId: newSchedule.assetId || '',
      name: newSchedule.name || '',
      type: newSchedule.type || 'preventive',
      frequency: newSchedule.frequency || 30,
      nextDue: newSchedule.nextDue || '',
      estimatedCost: newSchedule.estimatedCost || 0,
      instructions: newSchedule.instructions,
      isActive: true
    }

    try {
      const response = await fetch('/api/inventory/maintenance/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      })

      if (response.ok) {
        const savedSchedule = await response.json()
        setMaintenanceSchedules(prev => [...prev, savedSchedule])
      } else {
        setMaintenanceSchedules(prev => [...prev, schedule])
      }
    } catch (error) {
      setMaintenanceSchedules(prev => [...prev, schedule])
    }

    setNewSchedule({})
    setShowScheduleModal(false)
  }

  const filteredRecords = selectedAsset 
    ? maintenanceRecords.filter(record => record.assetId === selectedAsset)
    : maintenanceRecords

  const upcomingMaintenance = maintenanceSchedules.filter(schedule => {
    const dueDate = new Date(schedule.nextDue)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDue <= 30 && daysUntilDue >= 0
  })

  const overdueMaintenance = maintenanceRecords.filter(record => {
    const scheduledDate = new Date(record.scheduledDate)
    const today = new Date()
    return record.status !== 'completed' && record.status !== 'cancelled' && scheduledDate < today
  })

  const totalMaintenanceCost = maintenanceRecords
    .filter(record => record.actualCost && record.status === 'completed')
    .reduce((sum, record) => sum + (record.actualCost || 0), 0)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              All maintenance activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Due within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMaintenanceCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Activities</CardTitle>
          <CardDescription>Latest maintenance records and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getTypeIcon(record.type)}
                  <div>
                    <p className="font-medium">{record.title}</p>
                    <p className="text-sm text-gray-600">{getAssetName(record.assetId)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{record.scheduledDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Maintenance Records</h3>
          <p className="text-gray-600">Track all maintenance activities</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Assets</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>{asset.name}</option>
            ))}
          </select>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {getTypeIcon(record.type)}
                  <div>
                    <h4 className="font-semibold">{record.title}</h4>
                    <p className="text-gray-600">{getAssetName(record.assetId)}</p>
                    <p className="text-sm text-gray-500 mt-1">{record.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Scheduled: {record.scheduledDate}</span>
                      {record.completedDate && <span>Completed: {record.completedDate}</span>}
                      {record.technician && <span>Technician: {record.technician}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  <p className="text-sm mt-2">
                    Cost: ${record.actualCost || record.estimatedCost}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-600">Track and schedule asset maintenance activities</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'records' ? 'default' : 'outline'}
            onClick={() => setActiveView('records')}
          >
            Records
          </Button>
          <Button
            variant={activeView === 'schedules' ? 'default' : 'outline'}
            onClick={() => setActiveView('schedules')}
          >
            Schedules
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'default' : 'outline'}
            onClick={() => setActiveView('calendar')}
          >
            Calendar
          </Button>
        </div>
      </div>

      {activeView === 'overview' && renderOverview()}
      {activeView === 'records' && renderRecords()}
      {activeView === 'schedules' && (
        <div className="text-center py-8">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Maintenance Schedules</h3>
          <p className="mt-1 text-sm text-gray-500">Schedule management coming soon</p>
        </div>
      )}
      {activeView === 'calendar' && (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Maintenance Calendar</h3>
          <p className="mt-1 text-sm text-gray-500">Calendar view coming soon</p>
        </div>
      )}

      {/* Create Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Maintenance Record</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset *
                </label>
                <select
                  value={newRecord.assetId || ''}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newRecord.title || ''}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newRecord.type || 'preventive'}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="inspection">Inspection</option>
                  <option value="calibration">Calibration</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={newRecord.scheduledDate || ''}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  value={newRecord.estimatedCost || ''}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createMaintenanceRecord}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
