export type DocumentCategoryInfo = {
  key: string;
  label: string;
  enumValue: string;
  display: string;
};

const CATEGORY_OVERRIDES: Record<string, { enumValue: string; display: string }> = {
  general_document: { enumValue: 'OTHER', display: 'General Document' },
  activity_reports: { enumValue: 'REPORT', display: 'Activity Reports' },
  approval_documents: { enumValue: 'OTHER', display: 'Approval Documents' },
  assessment_reports: { enumValue: 'REPORT', display: 'Assessment Reports' },
  audit_documents: { enumValue: 'REPORT', display: 'Audit Documents' },
  board_meeting_minutes: { enumValue: 'REPORT', display: 'Board Meeting Minutes' },
  budget_financial_documents: { enumValue: 'INVOICE', display: 'Budget & Financial Documents' },
  certificates_credentials: { enumValue: 'FORM', display: 'Certificates & Credentials' },
  communication_correspondence: { enumValue: 'OTHER', display: 'Communication & Correspondence' },
  compliance_documents: { enumValue: 'OTHER', display: 'Compliance Documents' },
  contracts_agreements: { enumValue: 'CONTRACT', display: 'Contracts & Agreements' },
  data_collection_analysis: { enumValue: 'SPREADSHEET', display: 'Data Collection & Analysis' },
  employee_documents: { enumValue: 'FORM', display: 'Employee Documents' },
  event_planning_reports: { enumValue: 'REPORT', display: 'Event Planning & Reports' },
  external_communication: { enumValue: 'OTHER', display: 'External Communication' },
  feasibility_studies: { enumValue: 'REPORT', display: 'Feasibility Studies' },
  financial_statements: { enumValue: 'REPORT', display: 'Financial Statements' },
  grant_applications_reports: { enumValue: 'REPORT', display: 'Grant Applications & Reports' },
  hr_policies_procedures: { enumValue: 'POLICY', display: 'HR Policies & Procedures' },
  impact_assessment: { enumValue: 'REPORT', display: 'Impact Assessment' },
  internal_policies: { enumValue: 'POLICY', display: 'Internal Policies' },
  invoices_receipts: { enumValue: 'INVOICE', display: 'Invoices & Receipts' },
  job_descriptions: { enumValue: 'FORM', display: 'Job Descriptions' },
  legal_documents: { enumValue: 'CONTRACT', display: 'Legal Documents' },
  meeting_minutes: { enumValue: 'REPORT', display: 'Meeting Minutes' },
  monitoring_evaluation: { enumValue: 'REPORT', display: 'Monitoring & Evaluation' },
  partnership_agreements: { enumValue: 'CONTRACT', display: 'Partnership Agreements' },
  performance_reviews: { enumValue: 'REPORT', display: 'Performance Reviews' },
  project_documentation: { enumValue: 'REPORT', display: 'Project Documentation' },
  project_plans_proposals: { enumValue: 'REPORT', display: 'Project Plans & Proposals' },
  procurement_documents: { enumValue: 'OTHER', display: 'Procurement Documents' },
  progress_reports: { enumValue: 'REPORT', display: 'Progress Reports' },
  quality_assurance: { enumValue: 'REPORT', display: 'Quality Assurance' },
  research_studies: { enumValue: 'REPORT', display: 'Research & Studies' },
  risk_management: { enumValue: 'OTHER', display: 'Risk Management' },
  sops_standard_operating_procedures: { enumValue: 'PROCEDURE', display: 'SOPs' },
  strategic_plans: { enumValue: 'REPORT', display: 'Strategic Plans' },
  tender_documents: { enumValue: 'OTHER', display: 'Tender Documents' },
  training_materials: { enumValue: 'OTHER', display: 'Training Materials' },
  user_manuals_guides: { enumValue: 'OTHER', display: 'User Manuals & Guides' },
  vendor_supplier_records: { enumValue: 'OTHER', display: 'Vendor & Supplier Records' },
  volunteer_management_records: { enumValue: 'OTHER', display: 'Volunteer Management Records' },
  waste_management_plans: { enumValue: 'OTHER', display: 'Waste Management Plans' },
  workshop_conference_materials: { enumValue: 'REPORT', display: 'Workshop & Conference Materials' },
  workplans_activity_schedules: { enumValue: 'REPORT', display: 'Workplans & Activity Schedules' },
  // Employee profile specific categories
  cv: { enumValue: 'FORM', display: 'CVs' },
  cv_resume: { enumValue: 'FORM', display: 'CVs' },
  identification: { enumValue: 'FORM', display: 'Identification' },
  qualifications: { enumValue: 'FORM', display: 'Qualifications' },
  contracts: { enumValue: 'CONTRACT', display: 'Contracts' },
  medical: { enumValue: 'FORM', display: 'Medical Documents' },
  references: { enumValue: 'FORM', display: 'References' },
  bank: { enumValue: 'FORM', display: 'Bank Documents' },
  bank_details: { enumValue: 'FORM', display: 'Bank Documents' },
  other: { enumValue: 'OTHER', display: 'General Document' },
  // Programme and events specific categories
  project_document: { enumValue: 'REPORT', display: 'Project Documents' },
  project_documents: { enumValue: 'REPORT', display: 'Project Documents' },
  concept: { enumValue: 'REPORT', display: 'Event Concepts' },
  budget: { enumValue: 'SPREADSHEET', display: 'Event Budgets' },
  report: { enumValue: 'REPORT', display: 'Event Reports' },
  brochure: { enumValue: 'REPORT', display: 'Event Brochures' },
  agenda: { enumValue: 'REPORT', display: 'Event Agendas' },
  // Inventory / Audit
  audit_evidence: { enumValue: 'REPORT', display: 'Audit Evidence' },
};

const CATEGORY_HEURISTICS: Array<{ pattern: RegExp; enumValue: string }> = [
  { pattern: /(report|summary|narrative|minutes)/i, enumValue: 'REPORT' },
  { pattern: /(budget|financial|invoice|expenditure|finance)/i, enumValue: 'INVOICE' },
  { pattern: /(contract|agreement|mou|memorandum)/i, enumValue: 'CONTRACT' },
  { pattern: /(spreadsheet|data|analysis|log|tracker|sheet|csv|xls)/i, enumValue: 'SPREADSHEET' },
  { pattern: /(presentation|slide|deck|powerpoint)/i, enumValue: 'PRESENTATION' },
  { pattern: /(policy|procedure|guideline|manual|sop)/i, enumValue: 'POLICY' },
  { pattern: /(image|photo|picture|png|jpg|jpeg)/i, enumValue: 'IMAGE' },
  { pattern: /(video|mp4|recording)/i, enumValue: 'VIDEO' },
  { pattern: /(audio|mp3|recording)/i, enumValue: 'AUDIO' },
  { pattern: /(form|application|registration|resume|cv)/i, enumValue: 'FORM' },
];

const DEFAULT_CATEGORY: DocumentCategoryInfo = {
  key: 'general_document',
  label: 'General Document',
  enumValue: 'OTHER',
  display: 'General Document',
};

const slugifyCategoryKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'general_document';

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[_\s-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const resolveCategoryInfo = (label?: string | null): DocumentCategoryInfo => {
  if (!label || !label.trim()) {
    return DEFAULT_CATEGORY;
  }

  const normalizedLabel = label.trim();
  const key = slugifyCategoryKey(normalizedLabel);

  if (CATEGORY_OVERRIDES[key]) {
    const override = CATEGORY_OVERRIDES[key];
    return {
      key,
      label: normalizedLabel,
      enumValue: override.enumValue,
      display: override.display,
    };
  }

  const heuristic = CATEGORY_HEURISTICS.find((entry) => entry.pattern.test(normalizedLabel));

  return {
    key,
    label: normalizedLabel,
    enumValue: heuristic?.enumValue ?? DEFAULT_CATEGORY.enumValue,
    display: toTitleCase(normalizedLabel.replace(/[_-]+/g, ' ')) || DEFAULT_CATEGORY.display,
  };
};

export const sanitizeFolderSegment = (value: string | null | undefined) => {
  if (!value) return '';
  return value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[\\]+/g, '-')
    .replace(/\s{2,}/g, ' ');
};

export const sanitizeFolderPath = (value: string | null | undefined) => {
  if (!value) return '';
  return value
    .split('/')
    .map((segment) => sanitizeFolderSegment(segment))
    .filter(Boolean)
    .join('/');
};

export const buildFolderPath = ({
  department,
  subunit,
  categoryDisplay,
  fallbackDepartment = 'General',
  projectId,
  projectName,
  projectCode,
  year,
  date,
  version,
}: {
  department?: string | null;
  subunit?: string | null;
  categoryDisplay?: string | null;
  fallbackDepartment?: string;
  projectId?: string | null;
  projectName?: string | null;
  projectCode?: string | null;
  year?: number | string | null;
  date?: string | Date | null;
  version?: string | null;
} = {}) => {
  const segments: string[] = [];
  
  // For Programs/Projects: Use year/project/date/version structure
  if (projectId || projectName || projectCode) {
    // Year: Extract from date or use current year
    let yearSegment = '';
    if (year) {
      yearSegment = String(year);
    } else if (date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      yearSegment = dateObj.getFullYear().toString();
    } else {
      yearSegment = new Date().getFullYear().toString();
    }
    segments.push(yearSegment);

    // Project: Use project code, name, or ID
    const projectSegment = sanitizeFolderSegment(projectCode || projectName || projectId);
    if (projectSegment) {
      segments.push(projectSegment);
    }

    // Date: Format as YYYY-MM-DD or use upload date
    if (date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const dateSegment = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      segments.push(dateSegment);
    } else {
      const today = new Date().toISOString().split('T')[0];
      segments.push(today);
    }

    // Version: Add version folder if provided
    if (version) {
      const versionSegment = sanitizeFolderSegment(`v${version}`.replace(/^v+/, 'v'));
      segments.push(versionSegment);
    }

    return segments.join('/');
  }

  // Default structure: department/subunit/category
  const departmentSegment = sanitizeFolderSegment(department) || fallbackDepartment;
  segments.push(departmentSegment);

  if (subunit) {
    const subunitSegment = sanitizeFolderSegment(subunit);
    if (subunitSegment) {
      segments.push(subunitSegment);
    }
  }

  if (categoryDisplay) {
    const categorySegment = sanitizeFolderSegment(categoryDisplay);
    if (categorySegment) {
      segments.push(categorySegment);
    }
  }

  return segments.join('/');
};
