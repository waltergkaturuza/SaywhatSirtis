export interface Asset {
  id: string
  assetNumber: string
  name: string
  type: AssetType
  category: AssetCategory
  model: string
  brand: string
  description?: string
  
  // Financial Information
  procurementValue: number
  currentValue: number
  depreciationRate: number
  depreciationMethod: 'straight-line' | 'declining-balance' | 'units-of-production'
  procurementDate: string
  lastValuationDate?: string
  
  // Location & Allocation
  location: Location
  department: string
  assignedTo?: string
  assignedEmail?: string
  
  // Status & Condition
  status: AssetStatus
  condition: AssetCondition
  warrantyExpiry?: string
  maintenanceSchedule?: MaintenanceSchedule[]
  
  // Tracking & Audit
  rfidTag?: string
  qrCode?: string
  serialNumber?: string
  barcodeId?: string
  
  // Audit Trail
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  lastAuditDate?: string
  nextAuditDate?: string
  
  // Documents & Images
  documents?: Document[]
  images?: string[]
  
  // Insurance & Compliance
  insuranceValue?: number
  insurancePolicy?: string
  complianceStatus?: ComplianceStatus
  certifications?: Certification[]
}

export interface AssetType {
  id: string
  name: string
  code: string
  description?: string
  depreciationRate: number
  usefulLife: number // in years
  category: AssetCategory
}

export interface AssetCategory {
  id: string
  name: string
  code: string
  description?: string
  icon?: string
  color?: string
}

export interface Location {
  id: string
  name: string
  code: string
  type: 'building' | 'floor' | 'room' | 'area' | 'vehicle' | 'external'
  address?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  parentLocation?: string
  capacity?: number
  manager?: string
}

export interface MaintenanceSchedule {
  id: string
  type: 'preventive' | 'corrective' | 'inspection'
  frequency: number // in days
  lastMaintenance?: string
  nextMaintenance: string
  cost?: number
  vendor?: string
  notes?: string
}

export interface Document {
  id: string
  name: string
  type: 'purchase-order' | 'invoice' | 'warranty' | 'manual' | 'certificate' | 'other'
  url: string
  uploadedAt: string
  uploadedBy: string
  size: number
}

export interface Certification {
  id: string
  name: string
  issuedBy: string
  issuedDate: string
  expiryDate?: string
  certificateNumber: string
  status: 'active' | 'expired' | 'pending'
}

export interface InventoryTransaction {
  id: string
  assetId: string
  type: 'procurement' | 'disposal' | 'transfer' | 'maintenance' | 'audit' | 'valuation'
  description: string
  value?: number
  quantity?: number
  fromLocation?: string
  toLocation?: string
  performedBy: string
  performedAt: string
  approvedBy?: string
  approvedAt?: string
  documents?: string[]
  notes?: string
}

export interface AssetValuation {
  id: string
  assetId: string
  valuationDate: string
  currentValue: number
  previousValue: number
  method: 'market' | 'cost' | 'income' | 'depreciation'
  valuedBy: string
  approvedBy?: string
  notes?: string
  nextValuationDate?: string
}

export interface InventoryReport {
  id: string
  title: string
  type: 'asset-register' | 'depreciation' | 'location' | 'category' | 'maintenance' | 'audit'
  generatedAt: string
  generatedBy: string
  parameters: Record<string, any>
  data: any[]
  totalValue: number
  totalAssets: number
}

export interface InventoryAudit {
  id: string
  title: string
  auditDate: string
  auditor: string
  type: 'physical' | 'financial' | 'compliance' | 'full'
  status: 'planned' | 'in-progress' | 'completed' | 'reviewed'
  location?: string
  scope: string[]
  findings: AuditFinding[]
  recommendations: string[]
  completedAt?: string
}

export interface AuditFinding {
  id: string
  assetId: string
  type: 'missing' | 'damaged' | 'mislocated' | 'unauthorized' | 'discrepancy'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendedAction: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  assignedTo?: string
  dueDate?: string
}

export type AssetStatus = 
  | 'active' 
  | 'inactive' 
  | 'disposed' 
  | 'stolen' 
  | 'lost' 
  | 'under-maintenance' 
  | 'retired' 
  | 'pending-disposal'

export type AssetCondition = 
  | 'excellent' 
  | 'good' 
  | 'fair' 
  | 'poor' 
  | 'damaged' 
  | 'broken' 
  | 'needs-repair'

export type ComplianceStatus = 
  | 'compliant' 
  | 'non-compliant' 
  | 'pending-review' 
  | 'expired' 
  | 'not-applicable'

export interface InventoryDashboardStats {
  totalAssets: number
  totalValue: number
  avgAssetValue: number
  assetsByStatus: Record<AssetStatus, number>
  assetsByCategory: Array<{ name: string; count: number; value: number }>
  assetsByLocation: Array<{ name: string; count: number; value: number }>
  depreciationThisYear: number
  maintenanceCosts: number
  upcomingMaintenances: number
  overdueAudits: number
  complianceScore: number
  recentTransactions: InventoryTransaction[]
  topAssetsByValue: Asset[]
  criticalAssets: Asset[]
}

export interface InventoryFilters {
  search?: string
  status?: AssetStatus[]
  category?: string[]
  type?: string[]
  location?: string[]
  department?: string[]
  valueRange?: [number, number]
  dateRange?: [string, string]
  assignedTo?: string[]
  condition?: AssetCondition[]
  complianceStatus?: ComplianceStatus[]
}

export interface InventoryPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
  canAudit: boolean
  canManageLocations: boolean
  canManageCategories: boolean
  canViewFinancials: boolean
  canManageFinancials: boolean
  canGenerateReports: boolean
  restrictedToLocations?: string[]
  restrictedToDepartments?: string[]
}
