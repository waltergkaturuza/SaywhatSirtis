import { Project, WBSNode, Milestone, Task, Resource, Risk } from '@/types/programs-enhanced'

export const enhancedProjects: Project[] = [
  {
    id: 1,
    projectCode: 'CHI-2025-001',
    name: 'Community Health Initiative',
    description: 'Comprehensive community health improvement program targeting maternal and child health outcomes in rural communities',
    category: 'development',
    startDate: '2025-01-15',
    endDate: '2025-09-15',
    status: 'active',
    priority: 'high',
    riskLevel: 'medium',
    donor: 'USAID',
    country: 'Kenya',
    province: 'Nairobi',
    manager: 'Sarah Johnson',
    budget: 650000,
    spent: 292500,
    targetReach: 25000,
    currentReach: 11250,
    genderReach: {
      male: 5100,
      female: 6150
    },
    ageGroups: {
      children: 4500,
      youth: 3375,
      adults: 2700,
      elderly: 675
    },
    progress: 45,
    sectors: ['Health', 'WASH', 'Nutrition'],
    lastUpdate: '2025-07-15',
    
    // Enhanced fields
    stakeholders: [
      {
        id: 'stakeholder-1',
        projectId: 1,
        name: 'Ministry of Health Kenya',
        role: 'Government Partner',
        organization: 'Government of Kenya',
        type: 'government',
        influence: 'high',
        interest: 'high',
        powerLevel: 'high',
        communicationFrequency: 'monthly',
        preferredCommunication: 'meeting',
        contact: {
          email: 'contact@health.go.ke',
          phone: '+254-20-2717077',
          address: 'Afya House, Cathedral Road, Nairobi'
        },
        expectations: 'Improved health outcomes and strengthened health systems',
        concerns: ['Sustainability', 'Local capacity building']
      }
    ],
    
    workBreakdownStructure: [],
    milestones: [
      {
        id: 'milestone-1',
        projectId: 1,
        name: 'Project Inception Complete',
        description: 'All inception activities completed and baseline established',
        dueDate: '2025-03-15',
        status: 'completed',
        type: 'phase_completion',
        criticality: 'high',
        dependencies: [],
        deliverables: ['Baseline Report', 'Stakeholder Map', 'Implementation Plan'],
        stakeholders: ['stakeholder-1'],
        approvalRequired: true,
        approver: 'Sarah Johnson',
        approvalDate: '2025-03-14',
        notes: 'Successfully completed all inception milestones ahead of schedule'
      },
      {
        id: 'milestone-2',
        projectId: 1,
        name: 'Mid-term Evaluation',
        description: 'External mid-term evaluation of project progress and outcomes',
        dueDate: '2025-07-30',
        status: 'upcoming',
        type: 'approval',
        criticality: 'critical',
        dependencies: ['milestone-1'],
        deliverables: ['Mid-term Report', 'Recommendations'],
        stakeholders: ['stakeholder-1'],
        approvalRequired: true,
        notes: 'External evaluator to be contracted by end of June'
      }
    ],
    
    tasks: [],
    resources: [
      {
        id: 'resource-1',
        projectId: 1,
        name: 'Dr. Michael Chen',
        type: 'human',
        role: 'Health Technical Advisor',
        department: 'Health',
        costPerHour: 75,
        availability: 80,
        allocation: [],
        skills: ['Public Health', 'M&E', 'Training'],
        location: 'Nairobi',
        contact: 'michael.chen@organization.org'
      }
    ],
    
    dependencies: [],
    risks: [
      {
        id: 'risk-1',
        projectId: 1,
        title: 'Weather-related access challenges',
        description: 'Heavy rains during rainy season may limit access to remote communities',
        category: 'environmental',
        probability: 'high',
        impact: 'medium',
        riskScore: 12,
        status: 'identified',
        owner: 'Sarah Johnson',
        identifiedDate: '2025-01-20',
        mitigationPlan: 'Develop alternative access routes and adjust implementation timeline',
        contingencyPlan: 'Use mobile health units and postpone activities to dry season',
        mitigationActions: [],
        reviewDate: '2025-04-01'
      }
    ],
    
    issues: [],
    changeRequests: [],
    documents: [],
    communications: [],
    budgetBreakdown: [
      {
        id: 'budget-1',
        projectId: 1,
        category: 'Personnel',
        subcategory: 'International Staff',
        budgeted: 350000,
        committed: 175000,
        spent: 131250,
        remaining: 218750,
        percentage: 37.5,
        variance: -6250,
        forecastSpend: 343750,
        approvedBy: 'Finance Director',
        notes: 'On track with slight under-spend due to delayed recruitment'
      }
    ],
    
    timeTracking: [],
    qualityMetrics: [
      {
        id: 'quality-1',
        projectId: 1,
        name: 'Beneficiary Satisfaction',
        description: 'Percentage of beneficiaries rating services as satisfactory or above',
        target: 85,
        actual: 88,
        unit: 'percentage',
        category: 'usability',
        measurementDate: '2025-06-30',
        status: 'above_target',
        trend: 'improving'
      }
    ]
  },
  
  {
    id: 2,
    projectCode: 'EDU-2025-002',
    name: 'Education Infrastructure Development',
    description: 'Construction and renovation of primary schools with focus on girl-friendly facilities',
    category: 'development',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    status: 'active',
    priority: 'critical',
    riskLevel: 'high',
    donor: 'World Bank',
    country: 'Tanzania',
    province: 'Arusha',
    manager: 'Emily Rodriguez',
    budget: 1200000,
    spent: 480000,
    targetReach: 15000,
    currentReach: 6750,
    genderReach: {
      male: 3240,
      female: 3510
    },
    ageGroups: {
      children: 6750,
      youth: 0,
      adults: 0,
      elderly: 0
    },
    progress: 40,
    sectors: ['Education', 'Infrastructure', 'Gender'],
    lastUpdate: '2025-07-14',
    
    stakeholders: [],
    workBreakdownStructure: [],
    milestones: [],
    tasks: [],
    resources: [],
    dependencies: [],
    risks: [
      {
        id: 'risk-2',
        projectId: 2,
        title: 'Construction material cost inflation',
        description: 'Rising costs of construction materials affecting project budget',
        category: 'financial',
        probability: 'high',
        impact: 'high',
        riskScore: 16,
        status: 'analyzed',
        owner: 'Emily Rodriguez',
        identifiedDate: '2025-03-01',
        mitigationPlan: 'Negotiate long-term contracts with suppliers and explore alternative materials',
        contingencyPlan: 'Request additional funding or reduce project scope',
        mitigationActions: [],
        reviewDate: '2025-07-01'
      }
    ],
    issues: [],
    changeRequests: [],
    documents: [],
    communications: [],
    budgetBreakdown: [],
    timeTracking: [],
    qualityMetrics: []
  }
]

export const sampleMilestones: Milestone[] = [
  {
    id: 'milestone-global-1',
    projectId: 1,
    name: 'Health System Assessment Complete',
    description: 'Comprehensive assessment of existing health systems and infrastructure',
    dueDate: '2025-04-30',
    status: 'at_risk',
    type: 'deliverable',
    criticality: 'high',
    dependencies: ['milestone-1'],
    deliverables: ['Health System Report', 'Infrastructure Assessment', 'Capacity Gap Analysis'],
    stakeholders: ['stakeholder-1'],
    approvalRequired: true,
    notes: 'Delayed due to access issues in remote areas'
  },
  {
    id: 'milestone-global-2',
    projectId: 2,
    name: 'Site Preparation Complete',
    description: 'All construction sites prepared and ready for building',
    dueDate: '2025-05-15',
    status: 'upcoming',
    type: 'phase_completion',
    criticality: 'critical',
    dependencies: [],
    deliverables: ['Site Clearance Certificates', 'Environmental Compliance', 'Safety Plans'],
    stakeholders: [],
    approvalRequired: true,
    notes: 'Weather conditions may affect timeline'
  }
]

export const sampleResources: Resource[] = [
  {
    id: 'resource-global-1',
    projectId: 1,
    name: 'Community Health Worker Team',
    type: 'human',
    role: 'Field Implementation',
    department: 'Health',
    costPerHour: 25,
    availability: 100,
    allocation: [],
    skills: ['Community Mobilization', 'Health Education', 'Data Collection'],
    location: 'Rural Kenya',
    contact: 'chw-coordinator@organization.org'
  },
  {
    id: 'resource-global-2',
    projectId: 2,
    name: 'Construction Equipment',
    type: 'equipment',
    role: 'Infrastructure Development',
    costPerHour: 150,
    availability: 75,
    allocation: [],
    skills: ['Heavy Construction', 'Earth Moving'],
    location: 'Arusha, Tanzania',
    contact: 'equipment-manager@organization.org'
  }
]

export const projectMetrics = {
  totalProjects: 47,
  activeProjects: 24,
  completedProjects: 18,
  onHoldProjects: 5,
  totalBudget: 8500000,
  totalSpent: 5950000,
  averageProgress: 68,
  overdueProjects: 3,
  upcomingMilestones: 23,
  highRiskProjects: 7,
  resourceUtilization: 82,
  deliverySuccess: 92
}
