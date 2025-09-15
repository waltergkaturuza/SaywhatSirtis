"use client"

import { useState } from "react"
import { ReportsAnalytics } from "@/components/inventory/reports-analytics-enhanced"
import { LocationTracking } from "@/components/inventory/location-tracking-enhanced"

// Sample asset data for rich visualizations
const sampleAssets = [
  {
    id: "1",
    name: "Dell Latitude 7420 Laptop",
    assetNumber: "IT-2024-0001",
    category: { name: "Information Technology (IT) Equipment" },
    type: { name: "Laptops" },
    brand: "Dell",
    model: "Latitude 7420",
    status: "active",
    condition: "excellent",
    location: { name: "Head Office" },
    department: "HR",
    assignedTo: "John Doe",
    procurementValue: 1500,
    currentValue: 1200,
    depreciationRate: 20,
    depreciationMethod: "straight-line",
    procurementDate: "2024-01-15",
    expectedLifespan: 4,
    coordinates: {
      lat: -17.8216,
      lng: 31.0492,
      lastUpdated: "2024-07-19T10:00:00Z"
    }
  },
  {
    id: "2", 
    name: "HP LaserJet Pro Printer",
    assetNumber: "OF-2024-0002",
    category: { name: "Office Equipment" },
    type: { name: "Printers" },
    brand: "HP",
    model: "LaserJet Pro M404n",
    status: "active",
    condition: "good",
    location: { name: "Branch Office A" },
    department: "Administration",
    assignedTo: "Jane Smith",
    procurementValue: 300,
    currentValue: 240,
    depreciationRate: 15,
    depreciationMethod: "straight-line",
    procurementDate: "2024-02-10",
    expectedLifespan: 5,
    coordinates: {
      lat: -17.8350,
      lng: 31.0650,
      lastUpdated: "2024-07-19T09:30:00Z"
    }
  },
  {
    id: "3",
    name: "Toyota Corolla Company Vehicle",
    assetNumber: "VH-2024-0003",
    category: { name: "Vehicles & Transport" },
    type: { name: "Cars" },
    brand: "Toyota",
    model: "Corolla 2024",
    status: "active",
    condition: "excellent",
    location: { name: "Head Office" },
    department: "Operations",
    assignedTo: "Mike Johnson",
    procurementValue: 25000,
    currentValue: 22000,
    depreciationRate: 12,
    depreciationMethod: "straight-line",
    procurementDate: "2024-01-05",
    expectedLifespan: 8,
    coordinates: {
      lat: -17.8100,
      lng: 31.0450,
      lastUpdated: "2024-07-19T08:45:00Z"
    }
  },
  {
    id: "4",
    name: "Industrial Generator",
    assetNumber: "MC-2024-0004",
    category: { name: "Machinery" },
    type: { name: "Power Equipment" },
    brand: "Caterpillar",
    model: "C9 Generator",
    status: "under-maintenance",
    condition: "good",
    location: { name: "Warehouse" },
    department: "Operations",
    assignedTo: "Technical Team",
    procurementValue: 45000,
    currentValue: 42000,
    depreciationRate: 10,
    depreciationMethod: "straight-line",
    procurementDate: "2023-08-15",
    expectedLifespan: 15,
    coordinates: {
      lat: -17.8280,
      lng: 31.0580,
      lastUpdated: "2024-07-19T07:15:00Z"
    }
  },
  {
    id: "5",
    name: "Conference Room Projector",
    assetNumber: "OF-2024-0005",
    category: { name: "Office Equipment" },
    type: { name: "Audio Visual" },
    brand: "Epson",
    model: "PowerLite 1795F",
    status: "active",
    condition: "excellent",
    location: { name: "Head Office" },
    department: "Administration",
    assignedTo: "Conference Room A",
    procurementValue: 800,
    currentValue: 650,
    depreciationRate: 18,
    depreciationMethod: "straight-line",
    procurementDate: "2023-11-20",
    expectedLifespan: 6,
    coordinates: {
      lat: -17.8216,
      lng: 31.0492,
      lastUpdated: "2024-07-19T10:00:00Z"
    }
  },
  {
    id: "6",
    name: "Server Rack Equipment",
    assetNumber: "IT-2024-0006",
    category: { name: "Information Technology (IT) Equipment" },
    type: { name: "Servers" },
    brand: "HPE",
    model: "ProLiant DL380 Gen10",
    status: "active",
    condition: "good",
    location: { name: "Data Center" },
    department: "HR",
    assignedTo: "Server Administrator",
    procurementValue: 8500,
    currentValue: 6000,
    depreciationRate: 25,
    depreciationMethod: "straight-line",
    procurementDate: "2023-05-10",
    expectedLifespan: 5,
    coordinates: {
      lat: -17.8216,
      lng: 31.0492,
      lastUpdated: "2024-07-19T10:00:00Z"
    }
  }
]

const samplePermissions = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canApprove: true,
  canAudit: true,
  canManageLocations: true,
  canManageCategories: true,
  canViewFinancials: true,
  canManageFinancials: true,
  canGenerateReports: true
}

export default function EnhancedInventoryDemo() {
  const [activeTab, setActiveTab] = useState("analytics")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Inventory Management</h1>
            <p className="text-gray-600">Real analytics, charts, spatial tracking, and comprehensive reporting</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "analytics"
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tracking"
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🗺️ Spatial Tracking
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === "analytics" && (
          <ReportsAnalytics assets={sampleAssets} permissions={samplePermissions} />
        )}
        
        {activeTab === "tracking" && (
          <LocationTracking assets={sampleAssets} permissions={samplePermissions} />
        )}
      </div>
    </div>
  )
}
