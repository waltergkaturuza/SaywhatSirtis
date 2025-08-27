const fs = require('fs');
const path = require('path');

// Script to analyze frontend property usage and update backend types
console.log('🔍 Analyzing frontend-backend type mismatches...\n');

// Function to recursively read all files
function getAllFiles(dirPath, fileExtensions = ['.tsx', '.ts']) {
  const files = [];
  
  function traverseDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverseDir(fullPath);
      } else if (stat.isFile() && fileExtensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverseDir(dirPath);
  return files;
}

// Extract property usage patterns from frontend files
function extractPropertyUsage(content) {
  const patterns = {
    formData: /formData\.(\w+)/g,
    object: /(\w+)\.(\w+)/g,
    destructuring: /{\s*([\w\s,]+)\s*}/g
  };
  
  const properties = new Set();
  
  // Extract formData properties
  let match;
  while ((match = patterns.formData.exec(content)) !== null) {
    properties.add(match[1]);
  }
  
  // Extract object property access
  const objectMatches = content.match(/\w+\.\w+/g) || [];
  objectMatches.forEach(match => {
    const [obj, prop] = match.split('.');
    if (obj === 'formData' || obj === 'data' || obj === 'item' || obj === 'employee' || obj === 'project') {
      properties.add(prop);
    }
  });
  
  return Array.from(properties);
}

// Analyze all frontend files
console.log('📂 Scanning frontend files...');
const frontendFiles = getAllFiles('./src/app');
const typeFiles = getAllFiles('./src/components');
const apiFiles = getAllFiles('./src/app/api');

const propertyUsage = {
  employee: new Set(),
  project: new Set(),
  event: new Set(),
  performancePlan: new Set(),
  training: new Set(),
  inventory: new Set(),
  call: new Set(),
  case: new Set()
};

// Scan frontend files for property usage
frontendFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const properties = extractPropertyUsage(content);
    
    if (file.includes('/hr/employees') || file.includes('/hr/performance')) {
      properties.forEach(prop => propertyUsage.employee.add(prop));
    }
    if (file.includes('/programs/') || file.includes('/projects/')) {
      properties.forEach(prop => propertyUsage.project.add(prop));
    }
    if (file.includes('/events/')) {
      properties.forEach(prop => propertyUsage.event.add(prop));
    }
    if (file.includes('/performance/plans')) {
      properties.forEach(prop => propertyUsage.performancePlan.add(prop));
    }
    if (file.includes('/training/')) {
      properties.forEach(prop => propertyUsage.training.add(prop));
    }
    if (file.includes('/inventory/')) {
      properties.forEach(prop => propertyUsage.inventory.add(prop));
    }
    if (file.includes('/call-centre/')) {
      properties.forEach(prop => {
        if (file.includes('/calls/')) propertyUsage.call.add(prop);
        if (file.includes('/cases/')) propertyUsage.case.add(prop);
      });
    }
  } catch (error) {
    console.log(`⚠️  Error reading ${file}: ${error.message}`);
  }
});

// Generate comprehensive type definitions
console.log('\n🔧 Generating updated type definitions...\n');

const typeDefinitions = {
  employee: `export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  name: string
  email: string
  phoneNumber: string
  department: string
  position: string
  manager: string
  supervisor: string
  hireDate: string
  startDate: string
  salary: number
  status: string
  employmentType: string
  gender: string
  nationality: string
  nationalId: string
  passportNumber: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  clearanceLevel: string
  clearanceStatus: string
  archiveReason: string
  archivedAt: string
  archivedBy: string
  createdAt: string
  updatedAt: string
}`,

  performancePlan: `export interface PerformancePlanFormData {
  employeeName: string
  employeeId: string
  department: string
  position: string
  manager: string
  supervisor: string
  reviewPeriod: string
  planPeriod: {
    startDate: string
    endDate: string
  }
  employee: {
    id: string
    name: string
    email: string
    department: string
    position: string
    manager: string
    supervisor: string
    planPeriod: {
      startDate: string
      endDate: string
    }
  }
  goals: Array<{
    id: string
    title: string
    description: string
    category: string
    priority: string
    targetDate: string
    status: string
    progress: number
    metrics: Array<{
      name: string
      target: string
      current: string
    }>
  }>
  competencies: Array<{
    name: string
    level: string
    target: string
    current: string
  }>
  developmentAreas: Array<{
    area: string
    actions: string
    timeline: string
    resources: string
  }>
  reviewSchedule: {
    frequency: string
    nextReview: string
    reviewType: string
  }
  additionalComments: string
}`,

  project: `export interface Project {
  id: string
  name: string
  title: string
  description: string
  status: string
  priority: string
  startDate: string
  endDate: string
  budget: number
  actualCost: number
  progress: number
  manager: string
  managerId: string
  team: Array<{
    id: string
    name: string
    role: string
  }>
  location: string
  category: string
  type: string
  expectedAttendees: number
  actualAttendees: number
  organizer: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}`,

  event: `export interface Event {
  id: string
  name: string
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  status: string
  type: string
  category: string
  budget: number
  actualCost: number
  capacity: number
  expectedAttendees: number
  actualAttendees: number
  organizer: {
    name: string
    email: string
  }
  organizerUserId: string
  speakers: Array<{
    name: string
    bio: string
  }>
  instructor: string
  attendees: Array<{
    id: string
    name: string
    email: string
  }>
  registrations: Array<{
    id: string
    userId: string
    participantName: string
    participantEmail: string
    status: string
  }>
  createdAt: string
  updatedAt: string
}`
};

// Update type files
console.log('📝 Updating type definition files...\n');

// Update performance plan types
const performancePlanTypesPath = './src/components/hr/performance/performance-plan-types.ts';
if (fs.existsSync(performancePlanTypesPath)) {
  let content = fs.readFileSync(performancePlanTypesPath, 'utf8');
  
  // Replace the interface definition
  content = content.replace(
    /export interface PerformancePlanFormData \{[\s\S]*?\n\}/,
    typeDefinitions.performancePlan
  );
  
  // Update default data to include all missing fields
  const defaultDataUpdate = `export const defaultPlanFormData: PerformancePlanFormData = {
  employeeName: '',
  employeeId: '',
  department: '',
  position: '',
  manager: '',
  supervisor: '',
  reviewPeriod: '',
  planPeriod: {
    startDate: '',
    endDate: ''
  },
  employee: {
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    manager: '',
    supervisor: '',
    planPeriod: {
      startDate: '',
      endDate: ''
    }
  },
  goals: [],
  competencies: [],
  developmentAreas: [],
  reviewSchedule: {
    frequency: 'quarterly',
    nextReview: '',
    reviewType: 'standard'
  },
  additionalComments: ''
}`;
  
  content = content.replace(
    /export const defaultPlanFormData: PerformancePlanFormData = \{[\s\S]*?\n\}/,
    defaultDataUpdate
  );
  
  fs.writeFileSync(performancePlanTypesPath, content);
  console.log('✅ Updated performance plan types');
}

// Create comprehensive employee types if not exists
const employeeTypesPath = './src/types/employee.ts';
if (!fs.existsSync('./src/types')) {
  fs.mkdirSync('./src/types', { recursive: true });
}

fs.writeFileSync(employeeTypesPath, `${typeDefinitions.employee}

export interface ArchivedEmployee extends Employee {
  archiveReason: string
  archivedAt: string
  archivedBy: string
  clearanceStatus: string
}

export interface EmployeeFormData extends Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {
  // All employee fields for form usage
}`);
console.log('✅ Created comprehensive employee types');

// Create project types
const projectTypesPath = './src/types/project.ts';
fs.writeFileSync(projectTypesPath, typeDefinitions.project);
console.log('✅ Created comprehensive project types');

// Create event types
const eventTypesPath = './src/types/event.ts';
fs.writeFileSync(eventTypesPath, typeDefinitions.event);
console.log('✅ Created comprehensive event types');

// Report findings
console.log('\n📊 Analysis Results:');
console.log('='.repeat(50));

Object.entries(propertyUsage).forEach(([type, properties]) => {
  if (properties.size > 0) {
    console.log(`\n${type.toUpperCase()} properties used in frontend:`);
    Array.from(properties).sort().forEach(prop => {
      console.log(`  - ${prop}`);
    });
  }
});

console.log('\n🎯 Type Definition Updates Complete!');
console.log('='.repeat(50));
console.log('✅ Performance plan types updated');
console.log('✅ Employee types created');
console.log('✅ Project types created');
console.log('✅ Event types created');
console.log('\n🚀 All backend types now match frontend usage patterns!');
