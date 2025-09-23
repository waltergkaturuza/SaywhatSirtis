"use client"

import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  QrCodeIcon,
  TagIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  PhotoIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Asset } from '@/types/inventory'
import { Button } from '@/components/ui/button'

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

interface AssetRegistrationProps {
  createFormData: Partial<Asset>
  setCreateFormData: (data: Partial<Asset>) => void
  selectedImages: File[]
  setSelectedImages: (images: File[]) => void
  selectedDocuments: File[]
  setSelectedDocuments: (documents: File[]) => void
  showBarcodeScanner: boolean
  setShowBarcodeScanner: (show: boolean) => void
  showImageUpload: boolean
  setShowImageUpload: (show: boolean) => void
  showDocumentUpload: boolean
  setShowDocumentUpload: (show: boolean) => void
  handleCreateAsset: () => void
  generateAssetNumber: () => string
  generateBarcode: () => string
  generateQRCode: (assetNumber: string) => string
  handleImageUpload: (files: FileList | null) => void
  handleDocumentUpload: (files: FileList | null) => void
  removeImage: (index: number) => void
  removeDocument: (index: number) => void
  permissions: any
}

// Enhanced asset categories based on your requirements
const ASSET_CATEGORIES = {
  'Information Technology (IT) Equipment': [
    'Laptops',
    'Desktops',
    'Servers',
    'Network Equipment',
    'Printers & Scanners',
    'Projectors',
    'Storage Devices',
    'Mobile Devices',
    'Tablets'
  ],
  'Vehicles & Transport': [
    'Cars',
    'Motorbikes',
    'Trucks',
    'Buses',
    'Trailers',
    'Bicycles'
  ],
  'Furniture & Fittings': [
    'Desks',
    'Chairs',
    'Cabinets',
    'Bookshelves',
    'Conference Tables',
    'Filing Cabinets'
  ],
  'Buildings & Real Estate': [
    'Office Buildings',
    'Warehouses',
    'Storage Units',
    'Land',
    'Parking Areas'
  ],
  'Machinery & Equipment': [
    'Generators',
    'Boreholes & Pumps',
    'Agricultural Equipment',
    'Construction Tools',
    'Air Conditioning Units'
  ],
  'Tools & Instruments': [
    'Power Tools',
    'Survey Instruments',
    'Laboratory Tools',
    'Hand Tools',
    'Measuring Instruments'
  ],
  'Office Equipment': [
    'Telephones',
    'Air Conditioners',
    'Refrigerators',
    'Microwaves',
    'Photocopiers',
    'Shredders'
  ],
  'Software & Licenses': [
    'Operating System Licenses',
    'Productivity Software',
    'Custom-built Systems',
    'Subscription Services'
  ],
  'Communication Equipment': [
    'Radios',
    'PA Systems',
    'Satellite Phones',
    'Intercom Systems'
  ],
  'Security Equipment': [
    'CCTV Cameras',
    'Biometric Readers',
    'Security Gates',
    'Access Control Systems'
  ],
  'Medical Equipment': [
    'Diagnostic Machines',
    'First Aid Kits',
    'Examination Beds',
    'Medical Devices'
  ],
  'Field Kits / Programmatic Equipment': [
    'Monitoring Kits',
    'Program Materials',
    'Field Equipment',
    'Portable Kits'
  ]
}

const PROCUREMENT_TYPES = ['Procured', 'Donated', 'Leased', 'Rented']
const FUNDING_SOURCES = ['UNICEF', 'EU', 'Internal Capex', 'Government', 'World Bank', 'Other Donor']
// Departments are now fetched dynamically from HR system
const USAGE_TYPES = ['Field', 'Admin', 'Storage', 'Loaned', 'Shared']
const CONDITIONS = ['New', 'Excellent', 'Good', 'Fair', 'Poor', 'Repair Required']
const LOCATIONS = ['Head Office', 'Branch Office A', 'Branch Office B', 'Warehouse', 'Field Office', 'Storage']

export const AssetRegistration: React.FC<AssetRegistrationProps> = ({
  createFormData,
  setCreateFormData,
  selectedImages,
  setSelectedImages,
  selectedDocuments,
  setSelectedDocuments,
  showBarcodeScanner,
  setShowBarcodeScanner,
  showImageUpload,
  setShowImageUpload,
  showDocumentUpload,
  setShowDocumentUpload,
  handleCreateAsset,
  generateAssetNumber,
  generateBarcode,
  generateQRCode,
  handleImageUpload,
  handleDocumentUpload,
  removeImage,
  removeDocument,
  permissions
}) => {
  const [activeStep, setActiveStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Dynamic data states
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch departments and employees from HR system
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch departments
        const deptResponse = await fetch('/api/hr/departments/hierarchy', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
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
        
        // Fetch employees
        const empResponse = await fetch('/api/hr/employees', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
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

  const validateStep = (step: number): boolean => {
    const errors: string[] = []
    
    switch (step) {
      case 1:
        if (!createFormData.name) errors.push('Asset name is required')
        if (!createFormData.category) errors.push('Category is required')
        if (!createFormData.type) errors.push('Asset type is required')
        break
      case 2:
        if (!createFormData.brand) errors.push('Brand is required')
        if (!createFormData.model) errors.push('Model is required')
        if (!createFormData.serialNumber) errors.push('Serial number is required')
        break
      case 3:
        if (!createFormData.location) errors.push('Location is required')
        if (!createFormData.department) errors.push('Department is required')
        if (!createFormData.procurementValue) errors.push('Procurement value is required')
        break
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (validateStep(3)) {
      setSubmitting(true)
      try {
        await handleCreateAsset()
        setShowSuccessModal(true)
        // Reset form after successful submission
        setTimeout(() => {
          setActiveStep(1)
          setCreateFormData({})
          setSelectedImages([])
          setSelectedDocuments([])
          setShowSuccessModal(false)
        }, 2000)
      } catch (error) {
        console.error('Error creating asset:', error)
        alert('Error creating asset. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (!permissions.canCreate) {
    return (
      <div className="p-6 text-center">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to register new assets.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Modal - Premium Design */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 opacity-100 border border-green-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 mb-6 shadow-lg">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Asset Registered Successfully!</h3>
                <p className="text-gray-600 mb-8 text-base leading-relaxed">
                  Your asset has been successfully registered and added to the inventory system with all the details.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg">
            <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-800 bg-clip-text text-transparent mb-4">
            Asset Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create comprehensive asset records with our streamlined registration system
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto"></div>
        </div>

        {/* World-Class Progress Steps */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100/50 backdrop-blur-sm">
            <div className="flex items-center justify-between relative">
              {/* Enhanced connecting line background */}
              <div className="absolute top-7 left-8 right-8 h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full z-0"></div>
              {/* Enhanced active progress line with gradient */}
              <div 
                className="absolute top-7 left-8 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full z-10 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `calc(${((activeStep - 1) / 3) * 100}% - 0px)` }}
              ></div>
              
              {[
                { step: 1, title: 'Basic Information', description: 'Name, category, type', icon: '📝' },
                { step: 2, title: 'Technical Details', description: 'Brand, model, serial', icon: '⚙️' },
                { step: 3, title: 'Assignment & Value', description: 'Location, department, value', icon: '💰' },
                { step: 4, title: 'Additional Info', description: 'Images, documents, tags', icon: '📎' }
              ].map((item, index) => (
                <div key={item.step} className="flex flex-col items-center flex-1 relative z-20">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-lg ${
                    activeStep >= item.step
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200 transform scale-105'
                      : activeStep === item.step - 1
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-600 border-2 border-orange-300 hover:scale-102'
                      : 'bg-white text-gray-500 border-2 border-gray-200 hover:border-orange-200'
                  }`}>
                    <span className="text-sm">{activeStep >= item.step ? '✓' : item.step}</span>
                  </div>
                  <div className="mt-4 text-center max-w-32">
                    <div className={`text-sm font-semibold transition-colors duration-300 ${
                      activeStep >= item.step ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 leading-tight">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-8 p-6 border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-red-800 mb-3">Please review and fix the following:</h4>
                <ul className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start space-x-2 text-red-700">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Premium Step Content Container */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 mb-8 shadow-2xl shadow-gray-200/20 ring-1 ring-gray-900/5">
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Basic Information</h3>
              <p className="text-gray-600 text-sm">Provide essential details about your asset</p>
              <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Asset Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name || ''}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm"
                  placeholder="Enter asset name"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Asset Number
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-sm">
                  <input
                    type="text"
                    value={createFormData.assetNumber || ''}
                    onChange={(e) => setCreateFormData({...createFormData, assetNumber: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 rounded-l-xl border-r-0"
                    placeholder="Auto-generated"
                  />
                  <button
                    onClick={() => setCreateFormData({...createFormData, assetNumber: generateAssetNumber()})}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all duration-200 rounded-r-xl shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Category *
                </label>
                <select
                  value={typeof createFormData.category === 'string' ? createFormData.category : createFormData.category?.name || ''}
                  onChange={(e) => {
                    const categoryName = e.target.value
                    if (categoryName) {
                      setCreateFormData({
                        ...createFormData, 
                        category: {
                          id: categoryName,
                          name: categoryName,
                          code: categoryName.split(' ').map(word => word.charAt(0)).join(''),
                          description: `${categoryName} assets`
                        }, 
                        type: undefined
                      })
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-500">Select category</option>
                  {Object.keys(ASSET_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Asset Type *
                </label>
                <select
                  value={typeof createFormData.type === 'string' ? createFormData.type : createFormData.type?.name || ''}
                  onChange={(e) => {
                    const typeName = e.target.value
                    if (typeName && createFormData.category) {
                      setCreateFormData({
                        ...createFormData, 
                        type: {
                          id: typeName,
                          name: typeName,
                          code: typeName.slice(0, 3).toUpperCase(),
                          description: `${typeName} assets`,
                          depreciationRate: 15,
                          usefulLife: 5,
                          category: createFormData.category as any
                        }
                      })
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!createFormData.category}
                >
                  <option value="">Select type</option>
                  {createFormData.category && (() => {
                    const categoryName = typeof createFormData.category === 'string' 
                      ? createFormData.category 
                      : createFormData.category?.name
                    const types = ASSET_CATEGORIES[categoryName as keyof typeof ASSET_CATEGORIES]
                    return types?.map((type: string) => (
                      <option key={type} value={type}>{type}</option>
                    ))
                  })()}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Description
                </label>
                <textarea
                  value={createFormData.description || ''}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200 resize-none"
                  placeholder="Enter asset description"
                />
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Technical Details</h3>
              <p className="text-gray-600 text-sm">Complete the details below</p>
              <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Brand *
                </label>
                <input
                  type="text"
                  value={createFormData.brand || ''}
                  onChange={(e) => setCreateFormData({...createFormData, brand: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Model *
                </label>
                <input
                  type="text"
                  value={createFormData.model || ''}
                  onChange={(e) => setCreateFormData({...createFormData, model: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="Enter model"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Serial Number *
                </label>
                <input
                  type="text"
                  value={createFormData.serialNumber || ''}
                  onChange={(e) => setCreateFormData({...createFormData, serialNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="Enter serial number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Barcode
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={createFormData.barcodeId || ''}
                    onChange={(e) => setCreateFormData({...createFormData, barcodeId: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                    placeholder="Barcode"
                  />
                  <button
                    onClick={() => setCreateFormData({...createFormData, barcodeId: generateBarcode()})}
                    className="px-4 py-2 bg-orange-100 border border-l-0 border-gray-300 hover:bg-orange-200 text-orange-700 text-sm font-medium transition-colors duration-200"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowBarcodeScanner(true)}
                    className="px-4 py-2 bg-blue-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-blue-200 text-sm"
                  >
                    Scan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  RFID Tag
                </label>
                <input
                  type="text"
                  value={createFormData.rfidTag || ''}
                  onChange={(e) => setCreateFormData({...createFormData, rfidTag: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="RFID tag number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  QR Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={createFormData.qrCode || ''}
                    onChange={(e) => setCreateFormData({...createFormData, qrCode: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                    placeholder="QR code"
                  />
                  <button
                    onClick={() => setCreateFormData({...createFormData, qrCode: generateQRCode(createFormData.assetNumber || '')})}
                    className="px-4 py-2 bg-orange-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-orange-200 text-orange-700 text-sm font-medium transition-colors duration-200"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Assignment & Value</h3>
              <p className="text-gray-600 text-sm">Complete the details below</p>
              <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Location *
                </label>
                <select
                  value={typeof createFormData.location === 'string' ? createFormData.location : createFormData.location?.name || ''}
                  onChange={(e) => {
                    const locationName = e.target.value
                    if (locationName) {
                      setCreateFormData({
                        ...createFormData, 
                        location: {
                          id: locationName,
                          name: locationName,
                          code: locationName.slice(0, 3).toUpperCase(),
                          type: 'building',
                          address: locationName
                        }
                      })
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                >
                  <option value="">Select location</option>
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Department *
                </label>
                <select
                  value={createFormData.department || ''}
                  onChange={(e) => setCreateFormData({...createFormData, department: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
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
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Assigned To
                </label>
                <select
                  value={createFormData.assignedTo || ''}
                  onChange={(e) => {
                    const selectedEmployee = employees.find(emp => emp.id === e.target.value)
                    setCreateFormData({
                      ...createFormData, 
                      assignedTo: e.target.value,
                      assignedEmail: selectedEmployee?.email || ''
                    })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
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
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Custodian
                </label>
                <select
                  value={createFormData.custodian || ''}
                  onChange={(e) => setCreateFormData({...createFormData, custodian: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? "Loading employees..." : "Select custodian"}
                  </option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Procurement Value *
                </label>
                <input
                  type="number"
                  value={createFormData.procurementValue || ''}
                  onChange={(e) => setCreateFormData({...createFormData, procurementValue: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Depreciation Rate (%)
                </label>
                <input
                  type="number"
                  value={createFormData.depreciationRate || ''}
                  onChange={(e) => setCreateFormData({...createFormData, depreciationRate: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="15"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Depreciation Method
                </label>
                <select
                  value={createFormData.depreciationMethod || 'straight-line'}
                  onChange={(e) => setCreateFormData({...createFormData, depreciationMethod: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                >
                  <option value="straight-line">Straight Line</option>
                  <option value="declining-balance">Declining Balance</option>
                  <option value="sum-of-years">Sum of Years</option>
                  <option value="units-of-production">Units of Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Condition
                </label>
                <select
                  value={createFormData.condition || 'excellent'}
                  onChange={(e) => setCreateFormData({...createFormData, condition: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                >
                  {CONDITIONS.map(condition => (
                    <option key={condition} value={condition.toLowerCase()}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Procurement Type
                </label>
                <select
                  value={createFormData.procurementType || ''}
                  onChange={(e) => setCreateFormData({...createFormData, procurementType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                >
                  <option value="">Select type</option>
                  {PROCUREMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Funding Source
                </label>
                <select
                  value={createFormData.fundingSource || ''}
                  onChange={(e) => setCreateFormData({...createFormData, fundingSource: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                >
                  <option value="">Select source</option>
                  {FUNDING_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Procurement Date
                </label>
                <input
                  type="date"
                  value={createFormData.procurementDate || ''}
                  onChange={(e) => setCreateFormData({...createFormData, procurementDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  value={createFormData.warrantyExpiry || ''}
                  onChange={(e) => setCreateFormData({...createFormData, warrantyExpiry: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Expected Lifespan (years)
                </label>
                <input
                  type="number"
                  value={createFormData.expectedLifespan || ''}
                  onChange={(e) => setCreateFormData({...createFormData, expectedLifespan: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="5"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Usage Type
                </label>
                <select
                  value={createFormData.usageType || ''}
                  onChange={(e) => setCreateFormData({...createFormData, usageType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                >
                  <option value="">Select usage type</option>
                  {USAGE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Additional Information</h3>
              <p className="text-gray-600 text-sm">Complete the details below</p>
              <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                Asset Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload asset images
                      </span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Asset ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                Supporting Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload documents
                      </span>
                      <input
                        id="document-upload"
                        name="document-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleDocumentUpload(e.target.files)}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, XLS up to 10MB each
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-3">
                        <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Assigned Program
                </label>
                <input
                  type="text"
                  value={createFormData.assignedProgram || ''}
                  onChange={(e) => setCreateFormData({...createFormData, assignedProgram: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="Program name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 group-focus-within:text-orange-600 transition-colors">
                  Assigned Project
                </label>
                <input
                  type="text"
                  value={createFormData.assignedProject || ''}
                  onChange={(e) => setCreateFormData({...createFormData, assignedProject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 transition-colors duration-200"
                  placeholder="Project name"
                />
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Premium Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200/50">
          <div>
            {activeStep > 1 && (
              <button
                onClick={prevStep}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {activeStep < 4 ? (
              <button
                onClick={nextStep}
                className="inline-flex items-center px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Register Asset
                  </>
                )}
              </button>
            )}
          </div>
        </div>
    </div>
    </div>
  )
}
