"use client"

import React, { useState } from 'react'
import {
  PlusIcon,
  QrCodeIcon,
  TagIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  PhotoIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { Asset } from '@/types/inventory'
import { Button } from '@/components/ui/button'

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
const DEPARTMENTS = ['ICT', 'Finance', 'HR', 'Programs', 'Administration', 'Operations', 'Security']
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

  const handleSubmit = () => {
    if (validateStep(3)) {
      handleCreateAsset()
      setActiveStep(1)
      setCreateFormData({})
      setSelectedImages([])
      setSelectedDocuments([])
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Asset Registration</h2>
        <p className="text-gray-600">Register new assets with comprehensive tracking information</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Basic Information', description: 'Name, category, type' },
            { step: 2, title: 'Technical Details', description: 'Brand, model, serial' },
            { step: 3, title: 'Assignment & Value', description: 'Location, department, value' },
            { step: 4, title: 'Additional Info', description: 'Images, documents, tags' }
          ].map((item, index) => (
            <div key={item.step} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep >= item.step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {item.step}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  activeStep >= item.step ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.title}
                </div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
              {index < 3 && (
                <div className={`h-1 w-full mt-4 ${
                  activeStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        {activeStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name || ''}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter asset name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Number
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={createFormData.assetNumber || ''}
                    onChange={(e) => setCreateFormData({...createFormData, assetNumber: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-generated"
                  />
                  <button
                    onClick={() => setCreateFormData({...createFormData, assetNumber: generateAssetNumber()})}
                    className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {Object.keys(ASSET_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createFormData.description || ''}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter asset description"
                />
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={createFormData.brand || ''}
                  onChange={(e) => setCreateFormData({...createFormData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={createFormData.model || ''}
                  onChange={(e) => setCreateFormData({...createFormData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter model"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number *
                </label>
                <input
                  type="text"
                  value={createFormData.serialNumber || ''}
                  onChange={(e) => setCreateFormData({...createFormData, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter serial number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={createFormData.barcodeId || ''}
                    onChange={(e) => setCreateFormData({...createFormData, barcodeId: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Barcode"
                  />
                  <button
                    onClick={() => setCreateFormData({...createFormData, barcodeId: generateBarcode()})}
                    className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 hover:bg-gray-200 text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFID Tag
                </label>
                <input
                  type="text"
                  value={createFormData.rfidTag || ''}
                  onChange={(e) => setCreateFormData({...createFormData, rfidTag: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="RFID tag number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={createFormData.qrCode || ''}
                    onChange={(e) => setCreateFormData({...createFormData, qrCode: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="QR code"
                  />
                  <button
                    onClick={() => setCreateFormData({...createFormData, qrCode: generateQRCode(createFormData.assetNumber || '')})}
                    className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment & Value</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select location</option>
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={createFormData.department || ''}
                  onChange={(e) => setCreateFormData({...createFormData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={createFormData.assignedTo || ''}
                  onChange={(e) => setCreateFormData({...createFormData, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Employee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custodian
                </label>
                <input
                  type="text"
                  value={createFormData.custodian || ''}
                  onChange={(e) => setCreateFormData({...createFormData, custodian: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Custodian name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Value *
                </label>
                <input
                  type="number"
                  value={createFormData.procurementValue || ''}
                  onChange={(e) => setCreateFormData({...createFormData, procurementValue: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={createFormData.condition || 'excellent'}
                  onChange={(e) => setCreateFormData({...createFormData, condition: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {CONDITIONS.map(condition => (
                    <option key={condition} value={condition.toLowerCase()}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Type
                </label>
                <select
                  value={createFormData.procurementType || ''}
                  onChange={(e) => setCreateFormData({...createFormData, procurementType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  {PROCUREMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Source
                </label>
                <select
                  value={createFormData.fundingSource || ''}
                  onChange={(e) => setCreateFormData({...createFormData, fundingSource: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select source</option>
                  {FUNDING_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Date
                </label>
                <input
                  type="date"
                  value={createFormData.procurementDate || ''}
                  onChange={(e) => setCreateFormData({...createFormData, procurementDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  value={createFormData.warrantyExpiry || ''}
                  onChange={(e) => setCreateFormData({...createFormData, warrantyExpiry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Lifespan (years)
                </label>
                <input
                  type="number"
                  value={createFormData.expectedLifespan || ''}
                  onChange={(e) => setCreateFormData({...createFormData, expectedLifespan: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Type
                </label>
                <select
                  value={createFormData.usageType || ''}
                  onChange={(e) => setCreateFormData({...createFormData, usageType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Program
                </label>
                <input
                  type="text"
                  value={createFormData.assignedProgram || ''}
                  onChange={(e) => setCreateFormData({...createFormData, assignedProgram: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Program name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Project
                </label>
                <input
                  type="text"
                  value={createFormData.assignedProject || ''}
                  onChange={(e) => setCreateFormData({...createFormData, assignedProject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Project name"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {activeStep > 1 && (
            <Button
              onClick={prevStep}
              variant="outline"
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {activeStep < 4 ? (
            <Button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Register Asset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
