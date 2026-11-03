import { PerformanceSidebar } from '@/components/hr/performance-sidebar'

export default function PerformanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <PerformanceSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
