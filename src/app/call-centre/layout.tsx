import { CallCentreSidebar } from '@/components/call-centre/call-centre-sidebar'

export default function CallCentreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <CallCentreSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
