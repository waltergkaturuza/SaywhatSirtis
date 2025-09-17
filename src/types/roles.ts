// Role-Based Access Control Types for SIRTIS

export enum UserRole {
  BASIC_USER_1 = 'BASIC_USER_1',
  BASIC_USER_2 = 'BASIC_USER_2', 
  ADVANCE_USER_1 = 'ADVANCE_USER_1',
  ADVANCE_USER_2 = 'ADVANCE_USER_2',
  HR = 'HR',
  SYSTEM_ADMINISTRATOR = 'SYSTEM_ADMINISTRATOR'
}

export enum Department {
  EXECUTIVE_DIRECTORS_OFFICE = 'EXECUTIVE_DIRECTORS_OFFICE',
  HUMAN_RESOURCE_MANAGEMENT = 'HUMAN_RESOURCE_MANAGEMENT',
  FINANCE_AND_ADMINISTRATION = 'FINANCE_AND_ADMINISTRATION',
  PROGRAMS = 'PROGRAMS', 
  GRANTS_AND_COMPLIANCE = 'GRANTS_AND_COMPLIANCE',
  COMMUNICATIONS_AND_ADVOCACY = 'COMMUNICATIONS_AND_ADVOCACY',
  // Legacy departments for backward compatibility
  CALL_CENTER = 'CALL_CENTER',
  HR = 'HR',
  FINANCE = 'FINANCE',
  ADMIN = 'ADMIN',
  INVENTORY = 'INVENTORY',
  DOCUMENTS = 'DOCUMENTS'
}

export interface RolePermissions {
  // Module Access
  callCenter: 'none' | 'view' | 'edit' | 'full'
  dashboard: 'none' | 'view' | 'edit' | 'full'  
  personalProfile: 'none' | 'view' | 'edit' | 'full'
  programs: 'none' | 'view' | 'edit' | 'full'
  documents: 'none' | 'view' | 'edit' | 'full'
  inventory: 'none' | 'view' | 'edit' | 'full'
  hr: 'none' | 'view' | 'edit' | 'full'
  risks: 'none' | 'view' | 'edit' | 'full'
  
  // Document Security Levels
  documentLevel: 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET'
  
  // Special Permissions
  canViewOthersProfiles: boolean
  canManageUsers: boolean
  fullAccess: boolean
}

// Default role configurations based on the table structure
export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  [UserRole.BASIC_USER_1]: {
    callCenter: 'view', // Call Center access (view only)
    dashboard: 'view', // Main Dashboard (view only) 
    personalProfile: 'full', // Personal Profile: Performance plan, Performance Appraisal, Add/View/Download Documents
    programs: 'none', // No programs access
    documents: 'view', // Document Repo with public and confidential level
    inventory: 'none', // No inventory access
    hr: 'none', // No HR access
    risks: 'view', // View Risk only
    documentLevel: 'CONFIDENTIAL',
    canViewOthersProfiles: false,
    canManageUsers: false,
    fullAccess: false
  },
  
  [UserRole.BASIC_USER_2]: {
    callCenter: 'none', // All Basic User 1 except editing Call Center
    dashboard: 'view', // Programs but cannot edit or delete
    personalProfile: 'full', // Same as Basic User 1
    programs: 'view', // Programs view only
    documents: 'view', // Same document access
    inventory: 'view', // Inventory Module access
    hr: 'none', // No HR access
    risks: 'view', // Same risk access
    documentLevel: 'CONFIDENTIAL',
    canViewOthersProfiles: false,
    canManageUsers: false,
    fullAccess: false
  },
  
  [UserRole.ADVANCE_USER_1]: {
    callCenter: 'full', // ALL Basic User 1 and 2 access
    dashboard: 'view', // ALL Basic User 1 access
    personalProfile: 'full', // Personal profile access
    programs: 'edit', // Can Edit and View All Programs and Event
    documents: 'edit', // Add and Edit Document Repo with up to Secret Documents
    inventory: 'view', // Same inventory access
    hr: 'none', // No HR module access
    risks: 'edit', // Edit and Delete Risk
    documentLevel: 'SECRET',
    canViewOthersProfiles: false,
    canManageUsers: false,
    fullAccess: false
  },
  
  [UserRole.ADVANCE_USER_2]: {
    callCenter: 'view', // Programs access
    dashboard: 'view', // ALL Basic User 1 access  
    personalProfile: 'full', // Personal profile access
    programs: 'full', // Full programs access
    documents: 'edit', // Same document access as Advance User 1
    inventory: 'view', // Same inventory access
    hr: 'none', // No HR access
    risks: 'view', // View risks only
    documentLevel: 'SECRET',
    canViewOthersProfiles: false,
    canManageUsers: false,
    fullAccess: false
  },
  
  [UserRole.HR]: {
    callCenter: 'view', // All Basic User 1 and 2 access
    dashboard: 'view', // Main dashboard access
    personalProfile: 'full', // Personal profile management
    programs: 'view', // Programs viewing
    documents: 'edit', // Add and Edit Document Repo with up to Top Secret Documents
    inventory: 'view', // Inventory access
    hr: 'full', // HR Module - See other People's Profile
    risks: 'view', // View risks
    documentLevel: 'TOP_SECRET',
    canViewOthersProfiles: true,
    canManageUsers: false,
    fullAccess: false
  },
  
  [UserRole.SYSTEM_ADMINISTRATOR]: {
    callCenter: 'full', // Full Access to everything
    dashboard: 'full', // Full dashboard access
    personalProfile: 'full', // Full personal profile access
    programs: 'full', // Full programs access  
    documents: 'full', // Full document access
    inventory: 'full', // Full inventory access
    hr: 'full', // Full HR access
    risks: 'full', // Full risk management
    documentLevel: 'TOP_SECRET',
    canViewOthersProfiles: true,
    canManageUsers: true,
    fullAccess: true
  }
}

// Department to default role mapping based on SAYWHAT organizational structure
export const DEPARTMENT_DEFAULT_ROLES: Record<Department, UserRole> = {
  // Main SAYWHAT Departments
  [Department.EXECUTIVE_DIRECTORS_OFFICE]: UserRole.SYSTEM_ADMINISTRATOR,
  [Department.HUMAN_RESOURCE_MANAGEMENT]: UserRole.HR,
  [Department.FINANCE_AND_ADMINISTRATION]: UserRole.ADVANCE_USER_2,
  [Department.PROGRAMS]: UserRole.ADVANCE_USER_1, 
  [Department.GRANTS_AND_COMPLIANCE]: UserRole.ADVANCE_USER_2,
  [Department.COMMUNICATIONS_AND_ADVOCACY]: UserRole.ADVANCE_USER_1,
  // Legacy departments for backward compatibility
  [Department.CALL_CENTER]: UserRole.BASIC_USER_1,
  [Department.HR]: UserRole.HR,
  [Department.FINANCE]: UserRole.ADVANCE_USER_1,
  [Department.ADMIN]: UserRole.SYSTEM_ADMINISTRATOR,
  [Department.INVENTORY]: UserRole.BASIC_USER_2,
  [Department.DOCUMENTS]: UserRole.ADVANCE_USER_1
}

// Helper functions
export function hasPermission(
  userRole: UserRole, 
  module: keyof Omit<RolePermissions, 'documentLevel' | 'canViewOthersProfiles' | 'canManageUsers' | 'fullAccess'>,
  action: 'view' | 'edit' | 'full' = 'view'
): boolean {
  const permissions = ROLE_DEFINITIONS[userRole]
  const modulePermission = permissions[module] as 'none' | 'view' | 'edit' | 'full'
  
  if (modulePermission === 'none') return false
  
  switch (action) {
    case 'view':
      return ['view', 'edit', 'full'].includes(modulePermission)
    case 'edit':
      return ['edit', 'full'].includes(modulePermission)
    case 'full':
      return modulePermission === 'full'
    default:
      return false
  }
}

export function canAccessDocument(userRole: UserRole, documentLevel: 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET'): boolean {
  const userDocumentLevel = ROLE_DEFINITIONS[userRole].documentLevel
  
  const levelHierarchy = ['PUBLIC', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET']
  const userLevelIndex = levelHierarchy.indexOf(userDocumentLevel)
  const documentLevelIndex = levelHierarchy.indexOf(documentLevel)
  
  return userLevelIndex >= documentLevelIndex
}

export function getDefaultRoleForDepartment(department: Department): UserRole {
  return DEPARTMENT_DEFAULT_ROLES[department]
}

export function getRoleDisplayName(role: UserRole): string {
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

export function getDepartmentDisplayName(department: Department): string {
  return department.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}
