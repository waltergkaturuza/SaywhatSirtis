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
  QrCodeIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import type { Asset, InventoryPermissions } from "@/types/inventory"

interface Department {
  id: string
  name: string
  parentId?: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department?: string
}

interface FundingSource {
  id: string
  name: string
  isOther?: boolean
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
  
  // Dynamic data states
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
  const [customFundingSource, setCustomFundingSource] = useState("")
  const [loadingData, setLoadingData] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
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
    fundingSource: editAsset?.fundingSource || "",
    
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

  // Initialize funding sources with predefined options
  useEffect(() => {
    const initialFundingSources: FundingSource[] = [
      { id: "unicef", name: "UNICEF" },
      { id: "eu", name: "EU" },
      { id: "internal-capex", name: "Internal Capex" },
      { id: "government", name: "Government" },
      { id: "world-bank", name: "World Bank" },
      { id: "other", name: "Other", isOther: true }
    ]
    setFundingSources(initialFundingSources)
  }, [])

  // Fetch departments and employees from HR system
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch departments from HR API
        const deptResponse = await fetch('/api/hr/departments/hierarchy')
        if (deptResponse.ok) {
          const deptData = await deptResponse.json()
          
          // Use the flat structure from the API response
          if (deptData.success && deptData.data && deptData.data.flat) {
            const departments = deptData.data.flat.map((dept: any) => ({
              id: dept.id,
              name: dept.name,
              parentId: dept.parentId || null
            }))
            setDepartments(departments)
          } else {
            console.error('Unexpected department data structure:', deptData)
            setDepartments([])
          }
        } else {
          console.error('Failed to fetch departments:', deptResponse.status)
          setDepartments([])
        }
        
        // Fetch employees from HR API
        const empResponse = await fetch('/api/hr/employees')
        if (empResponse.ok) {
          const empData = await empResponse.json()
          
          // Handle the employees data structure
          if (empData.success && empData.data) {
            setEmployees(empData.data)
          } else if (Array.isArray(empData)) {
            setEmployees(empData)
          } else {
            console.error('Unexpected employee data structure:', empData)
            setEmployees([])
          }
        } else {
          console.error('Failed to fetch employees:', empResponse.status)
          setEmployees([])
        }
      } catch (error) {
        console.error('Error fetching HR data:', error)
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

      // Prepare data for API call
      const assetData = {
        ...formData,
        // Handle custom funding source
        fundingSource: formData.fundingSource === "other" ? customFundingSource : formData.fundingSource
      }
      
      // Call the API
      const response = await fetch('/api/inventory/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register asset')
      }
      
      const result = await response.json()
      console.log("Asset registration successful:", result)
      setShowSuccessModal(true)
      
      // Auto-close modal and call onSuccess after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false)
        onSuccess()
      }, 2000)
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
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
              <div className="text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {editAsset ? "Asset Updated Successfully!" : "Asset Registered Successfully!"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {editAsset 
                    ? "Your asset information has been updated in the inventory system."
                    : "Your asset has been registered and added to the inventory system."
                  }
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-6">
                <CubeIcon className="h-6 w-6 text-blue-600 mr-3" />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
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
                    Funding Source *
                  </label>
                  <select
                    value={formData.fundingSource}
                    onChange={(e) => {
                      handleInputChange("fundingSource", e.target.value)
                      if (e.target.value !== "other") {
                        setCustomFundingSource("")
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select funding source</option>
                    {fundingSources.map(source => (
                      <option key={source.id} value={source.id}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                  {formData.fundingSource === "other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customFundingSource}
                        onChange={(e) => setCustomFundingSource(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Specify other funding source"
                        required
                      />
                    </div>
                  )}
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
                <MapPinIcon className="h-6 w-6 text-purple-600 mr-3" />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? "Loading departments..." : "Select department"}
                    </option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.parentId ? `└ ${dept.name}` : dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => {
                      const selectedEmployee = employees.find(emp => emp.id === e.target.value)
                      handleInputChange("assignedTo", e.target.value)
                      if (selectedEmployee) {
                        handleInputChange("assignedEmail", selectedEmployee.email)
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? "Loading employees..." : "Select employee"}
                    </option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.email})
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <DocumentTextIcon className="h-6 w-6 text-orange-600 mr-3" />
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
                  className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(step)}
                  className="px-6 py-2 bg-green-600 border border-transparent rounded-md text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
