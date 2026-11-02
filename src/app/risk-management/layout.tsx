import { RiskSidebar } from '@/components/risk-management/risk-sidebar'

export default function RiskManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <RiskSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
