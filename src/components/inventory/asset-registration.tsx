"use client"

import { useState, useRef, useEffect } from "react"
import {
  CubeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  CameraIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline"
import type { Asset, InventoryPermissions } from "@/types/inventory"

// SAYWHAT brand colors
const COLORS = {
  primary: '#FF8C00',    // SAYWHAT orange
  secondary: '#228B22',  // SAYWHAT green
  accent: '#2F4F4F',     // Dark slate gray
  muted: '#708090'       // Slate gray
}

interface Department {
  id: string
  name: string
  code: string
}

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  department: string
}

interface AssetRegistrationProps {
  permissions: InventoryPermissions
  onSuccess: () => void
  editAsset?: Asset
}

export function AssetRegistration({ permissions, onSuccess, editAsset }: AssetRegistrationProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Backend data states
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: editAsset?.name || "",
    assetNumber: editAsset?.assetNumber || "",
    type: editAsset?.type?.id || "",
    category: editAsset?.category?.id || "",
    model: editAsset?.model || "",
    brand: editAsset?.brand || "",
    description: editAsset?.description || "",
    serialNumber: editAsset?.serialNumber || "",
    
    // Financial Information
    procurementValue: editAsset?.procurementValue || 0,
    depreciationRate: editAsset?.depreciationRate || 0,
    depreciationMethod: editAsset?.depreciationMethod || "straight-line",
    procurementDate: editAsset?.procurementDate || "",
    
    // Location & Allocation
    location: editAsset?.location?.id || "",
    department: editAsset?.department || "",
    assignedTo: editAsset?.assignedTo || "",
    assignedEmail: editAsset?.assignedEmail || "",
    
    // Status & Condition
    status: editAsset?.status || "active",
    condition: editAsset?.condition || "excellent",
    warrantyExpiry: editAsset?.warrantyExpiry || "",
    
    // Tracking
    rfidTag: editAsset?.rfidTag || "",
    qrCode: editAsset?.qrCode || "",
    barcodeId: editAsset?.barcodeId || "",
    
    // Insurance & Compliance
    insuranceValue: editAsset?.insuranceValue || 0,
    insurancePolicy: editAsset?.insurancePolicy || "",
    
    // Images and Documents
    images: [] as File[],
    documents: [] as File[]
  })

  const assetTypes = [
    { id: "it-equipment", name: "IT Equipment", depreciationRate: 20 },
    { id: "office-furniture", name: "Office Furniture", depreciationRate: 10 },
    { id: "vehicles", name: "Vehicles", depreciationRate: 15 },
    { id: "machinery", name: "Machinery", depreciationRate: 12 },
    { id: "real-estate", name: "Real Estate", depreciationRate: 2 },
    { id: "tools", name: "Tools & Equipment", depreciationRate: 8 },
    { id: "software", name: "Software Licenses", depreciationRate: 33 },
    { id: "other", name: "Other", depreciationRate: 10 }
  ]

  const categories = [
    { id: "computers", name: "Computers & Laptops" },
    { id: "servers", name: "Servers & Networking" },
    { id: "printers", name: "Printers & Scanners" },
    { id: "mobile", name: "Mobile Devices" },
    { id: "desks", name: "Desks & Tables" },
    { id: "chairs", name: "Chairs & Seating" },
    { id: "storage", name: "Storage & Filing" },
    { id: "cars", name: "Company Vehicles" },
    { id: "industrial", name: "Industrial Equipment" },
    { id: "security", name: "Security Systems" }
  ]

  const locations = [
    { id: "head-office", name: "Head Office" },
    { id: "branch-a", name: "Branch Office A" },
    { id: "branch-b", name: "Branch Office B" },
    { id: "warehouse", name: "Main Warehouse" },
    { id: "remote", name: "Remote/Mobile" }
  ]

  // Fetch departments and employees from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch departments
        const deptResponse = await fetch('/api/hr/department/list')
        if (deptResponse.ok) {
          const deptData = await deptResponse.json()
          if (deptData.success && deptData.data) {
            setDepartments(deptData.data)
          }
        }
        
        // Fetch employees
        const empResponse = await fetch('/api/hr/employees')
        if (empResponse.ok) {
          const empData = await empResponse.json()
          if (empData.success && empData.data) {
            setEmployees(empData.data)
          }
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        // Fallback data
        setDepartments([
          { id: 'hr', name: 'Human Resources', code: 'HR' },
          { id: 'it', name: 'Information Technology', code: 'IT' },
          { id: 'finance', name: 'Finance', code: 'FIN' },
          { id: 'operations', name: 'Operations', code: 'OPS' }
        ])
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-set depreciation rate when asset type changes
    if (field === "type") {
      const selectedType = assetTypes.find(type => type.id === value)
      if (selectedType) {
        setFormData(prev => ({
          ...prev,
          depreciationRate: selectedType.depreciationRate
        }))
      }
    }
  }

  const handleFileUpload = (type: 'images' | 'documents', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileArray]
      }))
    }
  }

  const removeFile = (type: 'images' | 'documents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const generateAssetNumber = () => {
    const type = assetTypes.find(t => t.id === formData.type)
    const typeCode = type ? type.name.substring(0, 2).toUpperCase() : "AS"
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${typeCode}-${year}-${random}`
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name && formData.type && formData.category && formData.model
      case 2:
        return formData.procurementValue > 0 && formData.procurementDate
      case 3:
        return formData.location && formData.department
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!permissions.canCreate && !permissions.canEdit) {
      alert("You don't have permission to register assets.")
      return
    }

    setLoading(true)
    try {
      // Generate asset number if not provided
      if (!formData.assetNumber) {
        formData.assetNumber = generateAssetNumber()
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Asset registration data:", formData)
      alert(editAsset ? "Asset updated successfully!" : "Asset registered successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error registering asset:", error)
      alert("Error registering asset. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4))
    } else {
      alert("Please fill in all required fields before continuing.")
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {editAsset ? "Edit Asset" : "Asset Registration"}
          </h2>
          <p className="text-gray-600">
            {editAsset ? "Update asset information" : "Register a new asset with comprehensive tracking details"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{(step / 4 * 100).toFixed(0)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: COLORS.primary,
                width: `${(step / 4) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-6">
                <CubeIcon 
                  className="h-6 w-6 mr-3" 
                  style={{ color: COLORS.primary }} 
                />
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Dell Laptop Inspiron 15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Number
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.assetNumber}
                      onChange={(e) => handleInputChange("assetNumber", e.target.value)}
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Auto-generated if empty"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange("assetNumber", generateAssetNumber())}
                      className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-700 hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select asset type</option>
                    {assetTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand/Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Dell, HP, Apple"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Inspiron 15 3000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Manufacturer serial number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional details about the asset..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Information */}
          {step === 2 && permissions.canViewFinancials && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-6">
                <CurrencyDollarIcon 
                  className="h-6 w-6 mr-3" 
                  style={{ color: COLORS.secondary }} 
                />
                <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procurement Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.procurementValue}
                      onChange={(e) => handleInputChange("procurementValue", parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procurement Date *
                  </label>
                  <input
                    type="date"
                    value={formData.procurementDate}
                    onChange={(e) => handleInputChange("procurementDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depreciation Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.depreciationRate}
                    onChange={(e) => handleInputChange("depreciationRate", parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depreciation Method
                  </label>
                  <select
                    value={formData.depreciationMethod}
                    onChange={(e) => handleInputChange("depreciationMethod", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="straight-line">Straight Line</option>
                    <option value="declining-balance">Declining Balance</option>
                    <option value="units-of-production">Units of Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.insuranceValue}
                      onChange={(e) => handleInputChange("insuranceValue", parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Policy Number
                  </label>
                  <input
                    type="text"
                    value={formData.insurancePolicy}
                    onChange={(e) => handleInputChange("insurancePolicy", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Policy number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location & Allocation */}
          {step === 3 && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-6">
                <MapPinIcon 
                  className="h-6 w-6 mr-3" 
                  style={{ color: COLORS.accent }} 
                />
                <h3 className="text-lg font-medium text-gray-900">Location & Allocation</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? 'Loading departments...' : 'Select department'}
                    </option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? 'Loading employees...' : 'Select employee (optional)'}
                    </option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Email
                  </label>
                  <input
                    type="email"
                    value={formData.assignedEmail}
                    onChange={(e) => handleInputChange("assignedEmail", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="employee@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="under-maintenance">Under Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange("condition", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="needs-repair">Needs Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Tracking & Documents */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Tracking Information */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <QrCodeIcon className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RFID Tag
                    </label>
                    <input
                      type="text"
                      value={formData.rfidTag}
                      onChange={(e) => handleInputChange("rfidTag", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="RFID tag number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code
                    </label>
                    <input
                      type="text"
                      value={formData.qrCode}
                      onChange={(e) => handleInputChange("qrCode", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="QR code data"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barcode ID
                    </label>
                    <input
                      type="text"
                      value={formData.barcodeId}
                      onChange={(e) => handleInputChange("barcodeId", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Barcode identifier"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <DocumentTextIcon 
                    className="h-6 w-6 mr-3" 
                    style={{ color: COLORS.primary }} 
                  />
                  <h3 className="text-lg font-medium text-gray-900">Images & Documents</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asset Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload('images', e.target.files)}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Upload Images
                      </button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.images.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('images', index)}
                              className="text-red-600 hover:text-red-700 ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('documents', e.target.files)}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        id="documents-upload"
                      />
                      <label
                        htmlFor="documents-upload"
                        className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Upload Documents
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS up to 50MB</p>
                    </div>
                    {formData.documents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('documents', index)}
                              className="text-red-600 hover:text-red-700 ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 border border-transparent rounded-md text-white hover:opacity-90"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(step)}
                  className="px-6 py-2 border border-transparent rounded-md text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  style={{ backgroundColor: COLORS.secondary }}
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {editAsset ? "Update Asset" : "Register Asset"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
