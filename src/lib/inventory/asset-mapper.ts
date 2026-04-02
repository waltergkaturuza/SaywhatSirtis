import type { AssetCondition, assets } from '@prisma/client'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isLikelyUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

/** DB status strings — `assets.status` is a plain String in schema */
export function mapStatusToDb(input: string): string {
  const s = String(input || 'active')
    .toLowerCase()
    .replace(/_/g, '-')
  if (s === 'active') return 'ACTIVE'
  if (s === 'inactive') return 'INACTIVE'
  if (s === 'under-maintenance' || s === 'maintenance') return 'MAINTENANCE'
  if (s === 'retired' || s === 'disposed') return 'DISPOSED'
  return 'ACTIVE'
}

/** Values must match inventory UI Selects (assets-management, registration). */
export function mapStatusToApi(db: string): string {
  const u = String(db || 'ACTIVE').toUpperCase()
  if (u === 'MAINTENANCE') return 'maintenance'
  if (u === 'INACTIVE') return 'inactive'
  if (u === 'DISPOSED' || u === 'RETIRED') return 'disposed'
  return 'active'
}

export function mapConditionToDb(input: string): AssetCondition {
  const c = String(input || 'good').toLowerCase().replace(/_/g, '-')
  if (c === 'excellent') return 'EXCELLENT'
  if (c === 'good' || c === 'new') return 'GOOD'
  if (c === 'fair') return 'FAIR'
  if (c === 'poor' || c === 'needs-repair' || c === 'repair required') return 'POOR'
  if (c === 'damaged') return 'DAMAGED'
  return 'GOOD'
}

export function mapConditionToApi(c: AssetCondition | string): string {
  return String(c || 'GOOD').toLowerCase()
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return ''
  return d.toISOString().split('T')[0]
}

export function assetRowToClientApi(a: assets) {
  return {
    id: a.id,
    assetNumber: a.assetTag,
    physicalAssetTag: a.physicalAssetTag ?? '',
    /** Alias for forms that still bind `assetTag` to the on-asset label */
    assetTag: a.physicalAssetTag ?? '',
    name: a.name,
    description: a.description ?? '',
    category: a.category,
    type: a.assetType ?? a.category,
    brand: a.brand ?? '',
    model: a.model ?? '',
    serialNumber: a.serialNumber ?? '',
    procurementValue: a.purchasePrice ?? 0,
    currentValue: a.currentValue ?? a.purchasePrice ?? 0,
    depreciationRate: a.depreciationRate ?? 0,
    depreciationMethod: (a.depreciationMethod ?? 'straight-line') as
      | 'straight-line'
      | 'declining-balance'
      | 'units-of-production'
      | 'sum-of-years',
    procurementDate: fmtDate(a.purchaseDate),
    fundingSource: a.fundingSource ?? '',
    procurementType: a.procurementType ?? '',
    expectedLifespan: a.expectedLifespan ?? undefined,
    usageType: a.usageType ?? '',
    assignedProgram: a.assignedProgram ?? '',
    assignedProject: a.assignedProject ?? '',
    location: a.location ?? '',
    department: a.department ?? '',
    assignedTo: a.assignedTo ?? '',
    assignedEmail: a.assignedEmail ?? '',
    custodian: a.custodian ?? '',
    status: mapStatusToApi(a.status),
    condition: mapConditionToApi(a.condition),
    warrantyExpiry: fmtDate(a.warrantyExpiry),
    lastAuditDate: fmtDate(a.lastAuditDate),
    nextMaintenanceDate: fmtDate(a.nextMaintenanceDate),
    rfidTag: a.rfidTag ?? '',
    qrCode: a.qrCode ?? '',
    barcodeId: a.barcodeId ?? '',
    insuranceValue: a.insuranceValue ?? 0,
    insurancePolicy: a.insurancePolicy ?? '',
    images: a.images ?? [],
    documents: a.documents ?? [],
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }
}
