# Job Descriptions System Documentation

## Overview
The job descriptions system stores comprehensive job information for employees, including key responsibilities with weights and tasks. This data is crucial for performance plans and appraisals.

## Database Schema

### Table: `job_descriptions`

```sql
CREATE TABLE job_descriptions (
  id                  VARCHAR PRIMARY KEY,
  employeeId          VARCHAR UNIQUE NOT NULL,
  jobTitle            VARCHAR NOT NULL,
  location            VARCHAR NOT NULL,
  jobSummary          TEXT,
  keyResponsibilities JSON NOT NULL,
  essentialExperience TEXT,
  essentialSkills     TEXT,
  acknowledgment      BOOLEAN DEFAULT false,
  signatureFileName   VARCHAR,
  signatureFileUrl    VARCHAR,
  createdAt           TIMESTAMP DEFAULT NOW(),
  updatedAt           TIMESTAMP NOT NULL,
  version             INT DEFAULT 1,
  isActive            BOOLEAN DEFAULT true,
  
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
)
```

### Key Responsibilities Structure

The `keyResponsibilities` field is a JSON array with up to 10 items, each containing:

```typescript
interface KeyResponsibility {
  description: string;  // Description of the responsibility
  weight: number;       // Percentage weight (0-100)
  tasks: string;        // Specific tasks for this responsibility
}
```

**Important Rules:**
- Maximum 10 responsibilities per job description
- Total weight must equal 100%
- Each responsibility must have: description, weight, and tasks
- Weight must be between 0 and 100

### Example Data

```json
{
  "keyResponsibilities": [
    {
      "description": "Software Development and Architecture",
      "weight": 40,
      "tasks": "Design and implement scalable software solutions, conduct code reviews, ensure best practices"
    },
    {
      "description": "Team Leadership and Mentoring",
      "weight": 30,
      "tasks": "Mentor junior developers, conduct training sessions, provide technical guidance"
    },
    {
      "description": "Project Management",
      "weight": 20,
      "tasks": "Plan sprints, track project progress, coordinate with stakeholders"
    },
    {
      "description": "Documentation and Quality Assurance",
      "weight": 10,
      "tasks": "Maintain technical documentation, ensure code quality, implement testing strategies"
    }
  ]
}
```

## API Endpoints

### 1. Create/Update Job Description (via Employee Creation)

**Endpoint:** `POST /api/hr/employees`

```json
{
  "formData": {
    "jobDescription": {
      "jobTitle": "Senior Software Engineer",
      "location": "Kampala Office",
      "jobSummary": "Lead software development projects...",
      "keyResponsibilities": [
        {
          "description": "Software Development",
          "weight": 40,
          "tasks": "Design and implement..."
        }
      ],
      "essentialExperience": "5+ years...",
      "essentialSkills": "JavaScript, React..."
    }
  }
}
```

### 2. Get All Job Descriptions

**Endpoint:** `GET /api/hr/job-descriptions`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "jobTitle": "...",
      "keyResponsibilities": [...],
      "employees": {
        "firstName": "...",
        "lastName": "..."
      }
    }
  ],
  "count": 10
}
```

### 3. Get Job Description by Employee

**Endpoint:** `GET /api/hr/job-descriptions?employeeId=<uuid>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "jobTitle": "...",
    "keyResponsibilities": [...],
    "employees": {...}
  }
}
```

### 4. Get Job Description by ID

**Endpoint:** `GET /api/hr/job-descriptions/[id]`

### 5. Update Job Description

**Endpoint:** `PUT /api/hr/job-descriptions/[id]`

**Request Body:**
```json
{
  "jobTitle": "Updated Title",
  "keyResponsibilities": [...]
}
```

### 6. Get Employee with Job Description

**Endpoint:** `GET /api/hr/employees/[id]`

**Response includes:**
```json
{
  "id": "uuid",
  "firstName": "...",
  "jobDescription": {
    "id": "uuid",
    "jobTitle": "...",
    "keyResponsibilities": [
      {
        "description": "...",
        "weight": 40,
        "tasks": "..."
      }
    ],
    "version": 1,
    "isActive": true
  }
}
```

### 7. Create/Update Job Description

**Endpoint:** `POST /api/hr/job-descriptions`

**Request Body:**
```json
{
  "employeeId": "uuid",
  "jobTitle": "Senior Engineer",
  "location": "Kampala",
  "jobSummary": "...",
  "keyResponsibilities": [
    {
      "description": "Development",
      "weight": 50,
      "tasks": "..."
    },
    {
      "description": "Leadership",
      "weight": 50,
      "tasks": "..."
    }
  ],
  "essentialExperience": "...",
  "essentialSkills": "..."
}
```

**Validations:**
- Total weight must equal 100%
- Each responsibility must have description and tasks
- Weight must be 0-100
- Maximum 10 responsibilities

## Usage in Performance Management

### 1. Performance Plans

When creating a performance plan, fetch the employee's job description:

```typescript
// Fetch employee with job description
const response = await fetch(`/api/hr/employees/${employeeId}`)
const employee = await response.json()

// Use job description responsibilities as basis for performance objectives
const objectives = employee.jobDescription.keyResponsibilities.map(resp => ({
  objective: resp.description,
  weight: resp.weight,
  tasks: resp.tasks.split(',').map(t => t.trim())
}))
```

### 2. Performance Appraisals

During appraisal, evaluate based on job description:

```typescript
// Fetch job description
const response = await fetch(`/api/hr/job-descriptions?employeeId=${employeeId}`)
const jobDesc = await response.json()

// Create appraisal items based on responsibilities
const appraisalItems = jobDesc.data.keyResponsibilities.map(resp => ({
  area: resp.description,
  weight: resp.weight,
  expectedTasks: resp.tasks,
  rating: 0, // To be filled during appraisal
  comments: ''
}))
```

### 3. Key Performance Indicators (KPIs)

Extract KPIs from job responsibilities:

```typescript
// Convert responsibilities to KPIs
const kpis = keyResponsibilities.map((resp, index) => ({
  id: index + 1,
  kpi: resp.description,
  weight: resp.weight,
  deliverables: resp.tasks,
  measurementCriteria: 'To be defined during planning',
  target: 100
}))
```

## Data Validation

### Backend Validation (API)

1. **Weight Validation:**
   ```typescript
   const totalWeight = keyResponsibilities.reduce((sum, resp) => sum + resp.weight, 0)
   if (totalWeight !== 100) {
     throw new Error(`Total weight must equal 100%. Current: ${totalWeight}%`)
   }
   ```

2. **Structure Validation:**
   ```typescript
   for (const resp of keyResponsibilities) {
     if (!resp.description || !resp.tasks) {
       throw new Error('Each responsibility must have description and tasks')
     }
     if (resp.weight < 0 || resp.weight > 100) {
       throw new Error('Weight must be between 0 and 100')
     }
   }
   ```

3. **Count Validation:**
   ```typescript
   if (keyResponsibilities.length > 10) {
     throw new Error('Maximum 10 responsibilities allowed')
   }
   ```

### Frontend Validation

The employee form validates:
- Total weight equals 100% before submission
- Required fields (description, tasks, weight)
- Weight range (0-100)
- Maximum 10 responsibilities

## Versioning

Job descriptions support versioning:
- Each update increments the `version` field
- Version history can be tracked
- `updatedAt` timestamp records last modification

## Soft Delete

Job descriptions use soft delete:
- Set `isActive = false` instead of deleting
- Maintains historical data for reporting
- Can be reactivated if needed

## Integration Points

### 1. Employee Module
- Job description created/updated during employee onboarding
- Retrieved when viewing employee details
- Displayed in employee profile

### 2. Performance Plans
- Job responsibilities → Performance objectives
- Weight distribution → KPI weights
- Tasks → Deliverables

### 3. Performance Appraisals
- Job description → Appraisal criteria
- Responsibilities → Evaluation areas
- Tasks → Expected outputs

### 4. Reporting
- Job descriptions provide structure for performance reports
- Weights determine importance in overall evaluation
- Historical versions show job evolution

## Testing

Run the test script to verify:

```bash
node test-job-descriptions.js
```

This will:
1. Create a test job description
2. Verify responsibilities are stored correctly
3. Test weight calculations
4. Verify retrieval with employee data
5. Confirm JSON structure is preserved

## Best Practices

1. **Always validate total weight = 100%** before saving
2. **Use clear, specific responsibility descriptions**
3. **Break down tasks into measurable activities**
4. **Review and update job descriptions annually**
5. **Version control for tracking changes**
6. **Link to performance plans for consistency**

## Database Queries

### Get job description with employee:
```typescript
const jobDesc = await prisma.job_descriptions.findUnique({
  where: { employeeId },
  include: { employees: true }
})
```

### Get employee with job description:
```typescript
const employee = await prisma.employees.findUnique({
  where: { id },
  include: { job_descriptions: true }
})
```

### Get all active job descriptions:
```typescript
const jobDescs = await prisma.job_descriptions.findMany({
  where: { isActive: true },
  include: { employees: true },
  orderBy: { updatedAt: 'desc' }
})
```

## Troubleshooting

### Issue: Total weight not 100%
**Solution:** Validate weights on frontend before submission

### Issue: Responsibilities not saving
**Solution:** Ensure keyResponsibilities is an array of objects with correct structure

### Issue: Cannot retrieve job description
**Solution:** Check if job description exists for the employee and isActive = true

### Issue: Version not incrementing
**Solution:** Ensure update operation increments version: `version: existing.version + 1`

## Future Enhancements

1. **Competency Framework** - Link responsibilities to competencies
2. **Job Families** - Group similar roles
3. **Career Progression** - Show advancement paths
4. **Skills Matrix** - Map skills to responsibilities
5. **Approval Workflow** - Multi-level approval for job descriptions

