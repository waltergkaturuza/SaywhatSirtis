/**
 * Phase 2: Frontend Enhancements
 * 
 * This file exports all the Phase 2 frontend enhancement components
 * for easy importing and consistent usage across the application.
 */

// Loading States and Skeletons
export * from './skeleton'
export { LoadingWrapper } from './skeleton'

// Dark Mode and Theme Support
export { useTheme } from '../providers/theme-provider'
export { ThemeToggle, ThemeSelector } from './theme-toggle'

// Accessibility Components
export * from './accessibility'
export { 
  ScreenReaderOnly, 
  SkipLink, 
  AccessibleButton, 
  AccessibleModal, 
  AccessibleField, 
  AccessibleTable 
} from './accessibility'

// Offline Support
export * from './offline-support'
export { 
  OfflineIndicator, 
  OfflineSyncStatus
} from './offline-support'

// Global Search
export * from './global-search'
export { GlobalSearchTrigger } from './global-search'

// Mobile Responsive Components
export * from './mobile-responsive'
export { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  MobileDrawer, 
  TouchButton, 
  MobileTable, 
  SwipeableCard, 
  PullToRefresh 
} from './mobile-responsive'

// Notification System (existing)
export * from './notifications'
export { NotificationContainer, useNotifications } from './notifications'

// Error Boundary (existing)
export { default as ErrorBoundary } from './error-boundary'

// Phase 2 Enhancement Configuration
export const phase2Config = {
  features: {
    darkMode: true,
    accessibility: true,
    offlineSupport: true,
    globalSearch: true,
    mobileResponsive: true,
    enhancedLoading: true,
    notifications: true,
    errorBoundaries: true
  },
  version: '2.0.0',
  description: 'Frontend UI/UX Enhancements',
  components: [
    'Enhanced Loading States',
    'Dark Mode Support',
    'Accessibility Improvements',
    'Offline Support',
    'Global Search',
    'Mobile Responsive Design',
    'Notification System',
    'Error Boundaries'
  ]
}

// Phase 2 Utility Functions
export const phase2Utils = {
  // Check if feature is enabled
  isFeatureEnabled: (feature: keyof typeof phase2Config.features) => {
    return phase2Config.features[feature]
  },

  // Get all enabled features
  getEnabledFeatures: () => {
    return Object.entries(phase2Config.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature)
  },

  // Phase 2 CSS classes
  classes: {
    // Common responsive classes
    responsive: {
      container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      flexStack: 'flex flex-col space-y-4',
      flexRow: 'flex flex-row items-center space-x-4'
    },

    // Dark mode classes
    darkMode: {
      bg: 'bg-white dark:bg-gray-900',
      card: 'bg-white dark:bg-gray-800',
      text: 'text-gray-900 dark:text-gray-100',
      border: 'border-gray-200 dark:border-gray-700'
    },

    // Accessibility classes
    accessibility: {
      srOnly: 'sr-only',
      focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500',
      skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
      touchTarget: 'min-h-[44px] min-w-[44px]'
    },

    // Loading states
    loading: {
      skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
      spinner: 'animate-spin rounded-full border-b-2 border-blue-600'
    }
  }
}

// Phase 2 Hooks Export
export { 
  useAnnouncement, 
  useHighContrastMode, 
  useReducedMotion, 
  useKeyboardNavigation, 
  useAriaLive 
} from './accessibility'

export { 
  useOffline, 
  useOfflineFetch, 
  useOfflineStorage, 
  useOfflineData 
} from './offline-support'

export { 
  useIsMobile, 
  useDeviceType, 
  useViewportHeight 
} from './mobile-responsive'

// Phase 2 Component Registry
export const phase2Components = {
  loading: {
    Skeleton: () => import('./skeleton').then(m => m.Skeleton),
    LoadingWrapper: () => import('./skeleton').then(m => m.LoadingWrapper),
    SkeletonCard: () => import('./skeleton').then(m => m.SkeletonCard),
    SkeletonTable: () => import('./skeleton').then(m => m.SkeletonTable),
    SkeletonList: () => import('./skeleton').then(m => m.SkeletonList)
  },

  theme: {
    ThemeProvider: () => import('../providers/theme-provider').then(m => m.ThemeProvider),
    ThemeToggle: () => import('./theme-toggle').then(m => m.ThemeToggle),
    ThemeSelector: () => import('./theme-toggle').then(m => m.ThemeSelector)
  },

  accessibility: {
    ScreenReaderOnly: () => import('./accessibility').then(m => m.ScreenReaderOnly),
    SkipLink: () => import('./accessibility').then(m => m.SkipLink),
    AccessibleButton: () => import('./accessibility').then(m => m.AccessibleButton),
    AccessibleModal: () => import('./accessibility').then(m => m.AccessibleModal),
    AccessibleField: () => import('./accessibility').then(m => m.AccessibleField),
    AccessibleTable: () => import('./accessibility').then(m => m.AccessibleTable)
  },

  offline: {
    OfflineProvider: () => import('./offline-support').then(m => m.OfflineProvider),
    OfflineIndicator: () => import('./offline-support').then(m => m.OfflineIndicator),
    OfflineSyncStatus: () => import('./offline-support').then(m => m.OfflineSyncStatus)
  },

  search: {
    GlobalSearch: () => import('./global-search').then(m => m.GlobalSearch),
    GlobalSearchTrigger: () => import('./global-search').then(m => m.GlobalSearchTrigger)
  },

  mobile: {
    ResponsiveContainer: () => import('./mobile-responsive').then(m => m.ResponsiveContainer),
    ResponsiveGrid: () => import('./mobile-responsive').then(m => m.ResponsiveGrid),
    MobileDrawer: () => import('./mobile-responsive').then(m => m.MobileDrawer),
    TouchButton: () => import('./mobile-responsive').then(m => m.TouchButton),
    MobileTable: () => import('./mobile-responsive').then(m => m.MobileTable),
    SwipeableCard: () => import('./mobile-responsive').then(m => m.SwipeableCard),
    PullToRefresh: () => import('./mobile-responsive').then(m => m.PullToRefresh)
  }
}

// Phase 2 Status Check
export const checkPhase2Status = () => {
  const features = phase2Utils.getEnabledFeatures()
  
  return {
    implemented: features.length,
    total: Object.keys(phase2Config.features).length,
    percentage: Math.round((features.length / Object.keys(phase2Config.features).length) * 100),
    features,
    version: phase2Config.version,
    description: phase2Config.description
  }
}
