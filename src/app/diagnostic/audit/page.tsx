"use client"

import AuditLogDiagnostic from '@/components/diagnostic/audit-diagnostic'
import { EnhancedLayout } from '@/components/layout/enhanced-layout'

export default function AuditDiagnosticPage() {
  return (
    <EnhancedLayout>
      <AuditLogDiagnostic />
    </EnhancedLayout>
  )
}