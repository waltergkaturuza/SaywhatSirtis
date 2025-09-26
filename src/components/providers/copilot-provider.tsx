"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageContext, MODULE_CONFIGS } from '@/lib/copilot-context'

interface CopilotContextValue {
  pageContext: PageContext
  updateContext: (updates: Partial<PageContext>) => void
  isContextReady: boolean
}

const CopilotContext = createContext<CopilotContextValue | null>(null)

interface CopilotProviderProps {
  children: React.ReactNode
  initialContext?: Partial<PageContext>
}

export function CopilotProvider({ children, initialContext }: CopilotProviderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [pageContext, setPageContext] = useState<PageContext>(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const module = pathSegments[0] || 'dashboard'
    const subpage = pathSegments[1] || undefined
    
    return {
      module,
      subpage,
      data: initialContext?.data,
      permissions: (session?.user as any)?.permissions || [],
      features: MODULE_CONFIGS[module]?.capabilities || [],
      ...initialContext
    }
  })
  const [isContextReady, setIsContextReady] = useState(false)

  // Update context when pathname or session changes
  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const module = pathSegments[0] || 'dashboard'
    const subpage = pathSegments[1] || undefined
    
    setPageContext(prev => ({
      ...prev,
      module,
      subpage,
      permissions: (session?.user as any)?.permissions || [],
      features: MODULE_CONFIGS[module]?.capabilities || []
    }))
    
    setIsContextReady(true)
  }, [pathname, session])

  const updateContext = (updates: Partial<PageContext>) => {
    setPageContext(prev => ({ ...prev, ...updates }))
  }

  return (
    <CopilotContext.Provider value={{ pageContext, updateContext, isContextReady }}>
      {children}
    </CopilotContext.Provider>
  )
}

export function useCopilotContext() {
  const context = useContext(CopilotContext)
  if (!context) {
    throw new Error('useCopilotContext must be used within a CopilotProvider')
  }
  return context
}

// Hook for easy context updates in components
export function useUpdateCopilotContext() {
  const { updateContext } = useCopilotContext()
  return updateContext
}