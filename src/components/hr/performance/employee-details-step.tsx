import { AppraisalFormData } from "./appraisal-types"

interface EmployeeDetailsStepProps {
  formData: AppraisalFormData
  onInputChange: (field: string, value: any) => void
}

export function EmployeeDetailsStep({ formData, onInputChange }: EmployeeDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee Name
          </label>
          <input
            type="text"
            value={formData.employeeName}
            onChange={(e) => onInputChange("employeeName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter employee name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee ID
          </label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => onInputChange("employeeId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter employee ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position/Job Title
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => onInputChange("position", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter position"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={formData.department}
            onChange={(e) => onInputChange("department", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            <option value="programs">Programs</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
            <option value="operations">Operations</option>
            <option value="communications">Communications</option>
            <option value="monitoring">M&E</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Direct Supervisor
          </label>
          <select
            value={formData.supervisor}
            onChange={(e) => onInputChange("supervisor", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Supervisor</option>
            <option value="john.doe">John Doe - Programs Director</option>
            <option value="jane.smith">Jane Smith - HR Manager</option>
            <option value="mike.johnson">Mike Johnson - Operations Manager</option>
            <option value="sarah.williams">Sarah Williams - Finance Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Reviewer
          </label>
          <select
            value={formData.reviewer}
            onChange={(e) => onInputChange("reviewer", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Reviewer</option>
            <option value="ceo">Chief Executive Officer</option>
            <option value="deputy.ceo">Deputy CEO</option>
            <option value="hr.director">HR Director</option>
            <option value="programs.head">Head of Programs</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appraisal Type
            </label>
            <select
              value={formData.appraisalType}
              onChange={(e) => onInputChange("appraisalType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">Annual Appraisal</option>
              <option value="midyear">Mid-Year Review</option>
              <option value="probation">Probation Review</option>
              <option value="special">Special Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onInputChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => onInputChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
