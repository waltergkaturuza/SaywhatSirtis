// SIRTIS Global Copilot Context Configuration
// This file defines page-specific contexts, prompts, and behaviors for the AI assistant

export interface PageContext {
  module: string
  subpage?: string
  data?: any
  permissions?: string[]
  features?: string[]
}

export interface ModuleConfig {
  name: string
  icon: string
  description: string
  quickActions: string[]
  capabilities: string[]
  commonQuestions: string[]
  integrations: string[]
  permissions: string[]
}

// Module configurations for context-aware assistance
export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  dashboard: {
    name: 'Dashboard',
    icon: '📊',
    description: 'System overview and analytics hub',
    quickActions: [
      'Show today\'s key metrics',
      'What alerts need attention?',
      'Performance trends analysis',
      'System health check'
    ],
    capabilities: [
      'Real-time metrics visualization',
      'Alert monitoring and management',
      'Performance trend analysis',
      'System status overview',
      'Quick navigation assistance'
    ],
    commonQuestions: [
      'What are the current system alerts?',
      'How is overall performance today?',
      'Where can I find specific reports?',
      'How do I navigate to other modules?'
    ],
    integrations: ['HR Analytics', 'Call Centre Metrics', 'Program KPIs', 'Inventory Status'],
    permissions: []
  },

  hr: {
    name: 'Human Resources',
    icon: '🧑‍💼',
    description: 'Employee management and HR analytics',
    quickActions: [
      'Employee performance overview',
      'Attendance tracking analysis',
      'Training program status',
      'Payroll processing help'
    ],
    capabilities: [
      'Employee data analysis',
      'Performance tracking insights',
      'Attendance pattern recognition',
      'Training program management',
      'HR policy guidance',
      'Payroll assistance'
    ],
    commonQuestions: [
      'How do I track employee performance?',
      'What are the attendance trends?',
      'How to schedule training sessions?',
      'Where are HR policy documents?'
    ],
    integrations: ['Payroll Systems', 'Training Platforms', 'Performance Management', 'Document Repository'],
    permissions: ['hr.access', 'employee.view']
  },

  'call-centre': {
    name: 'Call Centre',
    icon: '📞',
    description: 'Customer service and call analytics',
    quickActions: [
      'Call volume analysis',
      'Agent performance metrics',
      'Customer satisfaction trends',
      'Case resolution insights'
    ],
    capabilities: [
      'Call analytics and reporting',
      'Agent performance monitoring',
      'Customer sentiment analysis',
      'Case management optimization',
      'Queue management assistance',
      'Service level tracking'
    ],
    commonQuestions: [
      'What are today\'s call volumes?',
      'How are agents performing?',
      'What\'s the average resolution time?',
      'How to improve customer satisfaction?'
    ],
    integrations: ['Phone Systems', 'CRM Platforms', 'Ticketing Systems', 'Quality Monitoring'],
    permissions: ['callcentre.access', 'agent.metrics.view']
  },

  programs: {
    name: 'Program Management',
    icon: '📋',
    description: 'Project tracking and KPI monitoring',
    quickActions: [
      'Project status overview',
      'KPI performance analysis',
      'Resource allocation review',
      'Timeline optimization'
    ],
    capabilities: [
      'Project progress tracking',
      'KPI analysis and reporting',
      'Resource management insights',
      'Risk assessment guidance',
      'Timeline optimization',
      'Budget tracking assistance'
    ],
    commonQuestions: [
      'What\'s the status of current projects?',
      'How are KPIs performing?',
      'Are there any resource conflicts?',
      'Which projects are at risk?'
    ],
    integrations: ['Project Management Tools', 'Budget Systems', 'Resource Planning', 'Risk Management'],
    permissions: ['programs.access', 'project.view']
  },

  inventory: {
    name: 'Inventory Management',
    icon: '📦',
    description: 'Asset tracking and inventory optimization',
    quickActions: [
      'Stock levels overview',
      'Asset maintenance schedules',
      'Procurement analysis',
      'Usage pattern insights'
    ],
    capabilities: [
      'Inventory tracking and alerts',
      'Asset lifecycle management',
      'Maintenance scheduling',
      'Procurement optimization',
      'Cost analysis reporting',
      'Usage pattern recognition'
    ],
    commonQuestions: [
      'What items are low in stock?',
      'When are assets due for maintenance?',
      'How to optimize procurement?',
      'What are the usage trends?'
    ],
    integrations: ['RFID Systems', 'Procurement Platforms', 'Maintenance Systems', 'Financial Systems'],
    permissions: ['inventory.access', 'assets.view']
  },

  documents: {
    name: 'Document Management',
    icon: '📄',
    description: 'Document repository and AI analysis',
    quickActions: [
      'Document search assistance',
      'Content analysis insights',
      'Compliance status check',
      'Archive management help'
    ],
    capabilities: [
      'Document search and retrieval',
      'Content analysis and insights',
      'Compliance monitoring',
      'Version control guidance',
      'Access control management',
      'Archive organization'
    ],
    commonQuestions: [
      'How to find specific documents?',
      'What does this document contain?',
      'Are documents compliant?',
      'How to organize archives?'
    ],
    integrations: ['AI Analysis Engine', 'Compliance Systems', 'Version Control', 'Access Management'],
    permissions: ['documents.access', 'content.view']
  },

  settings: {
    name: 'System Settings',
    icon: '⚙️',
    description: 'System configuration and administration',
    quickActions: [
      'Configuration help',
      'User management guide',
      'Integration setup',
      'Security settings'
    ],
    capabilities: [
      'System configuration guidance',
      'User management assistance',
      'Integration setup help',
      'Security configuration',
      'Backup and maintenance',
      'Performance optimization'
    ],
    commonQuestions: [
      'How to configure system settings?',
      'How to manage user access?',
      'How to set up integrations?',
      'What are security best practices?'
    ],
    integrations: ['Auth Systems', 'Database Management', 'API Gateways', 'Monitoring Tools'],
    permissions: ['admin.access', 'system.configure']
  }
}

// Context-aware prompt generation
export function generateContextPrompt(pageContext: PageContext, userRole?: string): string {
  const config = MODULE_CONFIGS[pageContext.module] || MODULE_CONFIGS.dashboard
  
  return `You are SIRTIS Copilot for the ${config.name} module. ${config.description}

Available capabilities in this module:
${config.capabilities.map(cap => `• ${cap}`).join('\n')}

Common user questions:
${config.commonQuestions.map(q => `• ${q}`).join('\n')}

Key integrations: ${config.integrations.join(', ')}

Context Details:
- Module: ${pageContext.module}
- Subpage: ${pageContext.subpage || 'main'}
- User Role: ${userRole || 'user'}
- Available Features: ${pageContext.features?.join(', ') || 'standard'}

Instructions:
- Provide contextual, actionable assistance
- Reference specific module capabilities
- Suggest relevant quick actions when appropriate
- Be concise but comprehensive
- Use professional, helpful tone
- Focus on SAYWHAT/SIRTIS workflows and best practices`
}

// Get quick actions based on page context
export function getContextualQuickActions(pageContext: PageContext): string[] {
  const config = MODULE_CONFIGS[pageContext.module] || MODULE_CONFIGS.dashboard
  return config.quickActions
}

// Get module-specific capabilities
export function getModuleCapabilities(module: string): string[] {
  const config = MODULE_CONFIGS[module] || MODULE_CONFIGS.dashboard
  return config.capabilities
}

// Check if user has required permissions for module features
export function hasModulePermissions(module: string, userPermissions: string[] = []): boolean {
  const config = MODULE_CONFIGS[module] || MODULE_CONFIGS.dashboard
  
  if (config.permissions.length === 0) return true
  
  return config.permissions.some(permission => 
    userPermissions.includes(permission) || 
    userPermissions.includes('admin.access')
  )
}

// Generate contextual suggestions based on user input and current page
export function generateContextualSuggestions(
  userMessage: string, 
  pageContext: PageContext,
  conversationHistory: any[] = []
): string[] {
  const config = MODULE_CONFIGS[pageContext.module] || MODULE_CONFIGS.dashboard
  const lowerMessage = userMessage.toLowerCase()
  
  // Analyze user intent and provide relevant suggestions
  let suggestions: string[] = []
  
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    suggestions = [
      `How to use ${config.name} effectively`,
      'Best practices guide',
      'Common workflows'
    ]
  } else if (lowerMessage.includes('show') || lowerMessage.includes('display')) {
    suggestions = [
      'Show key metrics',
      'Display recent activities',
      'View performance trends'
    ]
  } else if (lowerMessage.includes('find') || lowerMessage.includes('search')) {
    suggestions = [
      'Advanced search tips',
      'Filter options guide',
      'Quick navigation shortcuts'
    ]
  } else {
    // Default to module-specific quick actions
    suggestions = config.quickActions.slice(0, 3)
  }
  
  return suggestions
}

// Get contextual welcome message
export function getContextualWelcome(
  pageContext: PageContext, 
  userName: string = 'there'
): string {
  const config = MODULE_CONFIGS[pageContext.module] || MODULE_CONFIGS.dashboard
  const user = userName.split(' ')[0]
  
  return `Hello ${user}! 👋 Welcome to the ${config.name} module. ${config.icon}

${config.description}

I can help you with:
${config.capabilities.slice(0, 3).map(cap => `• ${cap}`).join('\n')}

What would you like to explore today?`
}

// Module-specific data context helpers
export const CONTEXT_HELPERS = {
  dashboard: {
    getMetrics: () => ({
      activeAlerts: 3,
      systemHealth: 'Good',
      activeUsers: 247,
      responseTime: '1.2s'
    }),
    getRecentActivities: () => [
      'New employee onboarded',
      'Inventory update completed',
      'Monthly report generated'
    ]
  },
  
  hr: {
    getEmployeeStats: () => ({
      totalEmployees: 156,
      activeEmployees: 152,
      onLeave: 4,
      newHires: 8
    }),
    getTrainingStatus: () => ({
      inProgress: 23,
      completed: 89,
      pending: 12
    })
  },
  
  'call-centre': {
    getCallStats: () => ({
      totalCalls: 342,
      answered: 328,
      avgWaitTime: '2:34',
      satisfaction: '4.2/5'
    }),
    getAgentStatus: () => ({
      available: 12,
      busy: 8,
      break: 3
    })
  }
  // Add more context helpers as needed
}

export default {
  MODULE_CONFIGS,
  generateContextPrompt,
  getContextualQuickActions,
  getModuleCapabilities,
  hasModulePermissions,
  generateContextualSuggestions,
  getContextualWelcome,
  CONTEXT_HELPERS
}