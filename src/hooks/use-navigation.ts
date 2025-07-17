"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"

export interface NavigationInfo {
  currentModule: string | null
  isHomePage: boolean
  pathSegments: string[]
  canGoBack: boolean
  moduleHomePath: string | null
  parentPath: string | null
}

export function useNavigation(): NavigationInfo & {
  goHome: () => void
  goBack: () => void
  goToModule: (moduleId: string) => void
  goToModuleHome: () => void
  goToParent: () => void
} {
  const router = useRouter()
  const pathname = usePathname()

  const navigationInfo = useMemo((): NavigationInfo => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentModule = pathSegments[0] || null
    const isHomePage = pathname === "/"
    const canGoBack = typeof window !== 'undefined' && window.history.length > 1
    
    const moduleHomePath = currentModule ? `/${currentModule}` : null
    const parentPath = pathSegments.length > 1 
      ? `/${pathSegments.slice(0, -1).join('/')}`
      : null

    return {
      currentModule,
      isHomePage,
      pathSegments,
      canGoBack,
      moduleHomePath,
      parentPath
    }
  }, [pathname])

  const goHome = useCallback(() => {
    router.push('/')
  }, [router])

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const goToModule = useCallback((moduleId: string) => {
    router.push(`/${moduleId}`)
  }, [router])

  const goToModuleHome = useCallback(() => {
    if (navigationInfo.moduleHomePath) {
      router.push(navigationInfo.moduleHomePath)
    }
  }, [router, navigationInfo.moduleHomePath])

  const goToParent = useCallback(() => {
    if (navigationInfo.parentPath) {
      router.push(navigationInfo.parentPath)
    }
  }, [router, navigationInfo.parentPath])

  return {
    ...navigationInfo,
    goHome,
    goBack,
    goToModule,
    goToModuleHome,
    goToParent
  }
}

// Breadcrumb generation utility
export function generateBreadcrumbs(pathname: string, moduleNames?: Record<string, string>): Array<{ name: string; href?: string }> {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: Array<{ name: string; href?: string }> = [{ name: "Dashboard", href: "/" }]

  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const segment = segments[i]
    
    // Format segment name
    let name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Use custom module names if provided
    if (i === 0 && moduleNames?.[segment]) {
      name = moduleNames[segment]
    }

    // Don't add href to the last segment (current page)
    const isLast = i === segments.length - 1
    if (isLast) {
      breadcrumbs.push({ name })
    } else {
      breadcrumbs.push({ name, href: currentPath })
    }
  }

  return breadcrumbs
}

// Navigation state hook for components
export function useNavigationState() {
  const navigation = useNavigation()
  
  return {
    showHomeButton: !navigation.isHomePage,
    showBackButton: navigation.canGoBack,
    showModuleHomeButton: navigation.pathSegments.length > 2 && navigation.moduleHomePath,
    ...navigation
  }
}
