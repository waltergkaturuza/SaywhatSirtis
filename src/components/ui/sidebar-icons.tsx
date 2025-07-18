import { 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  FileText, 
  Activity,
  Database,
  Link,
  HelpCircle,
  Gauge,
  TrendingUp,
  Clock,
  CheckSquare
} from 'lucide-react'

export interface SidebarIconConfig {
  icon: React.ComponentType<{ className?: string }>
  color: string
  label: string
}

export function getSidebarIcons(sidebarContent: React.ReactNode): React.ReactNode {
  const icons: SidebarIconConfig[] = []
  
  // Try to extract text content from React nodes
  const extractTextFromNode = (node: any): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return node.toString()
    if (Array.isArray(node)) return node.map(extractTextFromNode).join(' ')
    if (node && typeof node === 'object' && node.props) {
      if (node.props.children) {
        return extractTextFromNode(node.props.children)
      }
      if (node.props.title) return node.props.title
      if (node.props.label) return node.props.label
    }
    return ''
  }
  
  const contentText = extractTextFromNode(sidebarContent).toLowerCase()
  
  // Analyze content to determine appropriate icons with better detection
  if (contentText.includes('quick stats') || contentText.includes('total employees') || contentText.includes('active') || contentText.includes('new hires')) {
    icons.push({
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      label: 'Quick Stats'
    })
  }
  
  if (contentText.includes('integration status') || contentText.includes('connected projects') || contentText.includes('api connection') || contentText.includes('sync')) {
    icons.push({
      icon: Link,
      color: 'text-green-600 bg-green-100', 
      label: 'Integration'
    })
  }
  
  if (contentText.includes('pending actions') || contentText.includes('reviews due') || contentText.includes('leave requests') || contentText.includes('awaiting approval')) {
    icons.push({
      icon: Clock,
      color: 'text-orange-600 bg-orange-100',
      label: 'Pending'
    })
  }
  
  if (contentText.includes('quick actions') || contentText.includes('test connection') || contentText.includes('export') || contentText.includes('documentation')) {
    icons.push({
      icon: Activity,
      color: 'text-purple-600 bg-purple-100',
      label: 'Actions'
    })
  }
  
  if (contentText.includes('quick links') || contentText.includes('employee directory') || contentText.includes('performance reviews')) {
    icons.push({
      icon: CheckSquare,
      color: 'text-indigo-600 bg-indigo-100',
      label: 'Links'
    })
  }
  
  if (contentText.includes('analytics') || contentText.includes('performance') || contentText.includes('trends')) {
    icons.push({
      icon: TrendingUp,
      color: 'text-pink-600 bg-pink-100',
      label: 'Analytics'
    })
  }
  
  if (contentText.includes('documents') || contentText.includes('files') || contentText.includes('storage')) {
    icons.push({
      icon: FileText,
      color: 'text-gray-600 bg-gray-100',
      label: 'Documents'
    })
  }
  
  // Default fallback icon if none match
  if (icons.length === 0) {
    icons.push({
      icon: Gauge,
      color: 'text-blue-600 bg-blue-100',
      label: 'Dashboard'
    })
  }
  
  return (
    <div className="flex flex-col items-center space-y-3 py-2">
      {icons.slice(0, 4).map((iconConfig, index) => {
        const IconComponent = iconConfig.icon
        return (
          <div key={index} className="group relative">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconConfig.color} hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105`}>
              <IconComponent className="h-5 w-5" />
            </div>
            {/* Tooltip */}
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              {iconConfig.label}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
