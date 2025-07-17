import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { AppraisalFormData } from "./appraisal-types"

interface AchievementsGoalsStepProps {
  formData: AppraisalFormData
  onArrayChange: (arrayName: keyof AppraisalFormData, index: number, field: string, value: any) => void
  onAddArrayItem: (arrayName: keyof AppraisalFormData, template: any) => void
  onRemoveArrayItem: (arrayName: keyof AppraisalFormData, index: number) => void
}

export function AchievementsGoalsStep({ 
  formData, 
  onArrayChange, 
  onAddArrayItem, 
  onRemoveArrayItem 
}: AchievementsGoalsStepProps) {
  return (
    <div className="space-y-8">
      {/* Key Achievements Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Achievements</h3>
          <button
            onClick={() => onAddArrayItem("achievements", { achievement: "", impact: "", evidence: "" })}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Achievement
          </button>
        </div>

        {formData.achievements.map((achievement, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium text-gray-900">Achievement {index + 1}</h4>
              {formData.achievements.length > 1 && (
                <button
                  onClick={() => onRemoveArrayItem("achievements", index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Achievement Description
              </label>
              <textarea
                value={achievement.achievement}
                onChange={(e) => onArrayChange("achievements", index, "achievement", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the key achievement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact & Results
              </label>
              <textarea
                value={achievement.impact}
                onChange={(e) => onArrayChange("achievements", index, "impact", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What was the impact or result of this achievement?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence/Metrics
              </label>
              <input
                type="text"
                value={achievement.evidence}
                onChange={(e) => onArrayChange("achievements", index, "evidence", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quantifiable evidence or metrics..."
              />
            </div>
          </div>
        ))}
      </div>

      {/* Goals Assessment Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Goals Assessment</h3>
          <button
            onClick={() => onAddArrayItem("goals", { goal: "", target: "", achieved: "", rating: 0, comments: "" })}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Goal
          </button>
        </div>

        {formData.goals.map((goal, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium text-gray-900">Goal {index + 1}</h4>
              {formData.goals.length > 1 && (
                <button
                  onClick={() => onRemoveArrayItem("goals", index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Description
                </label>
                <textarea
                  value={goal.goal}
                  onChange={(e) => onArrayChange("goals", index, "goal", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the goal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target/Expected Outcome
                </label>
                <textarea
                  value={goal.target}
                  onChange={(e) => onArrayChange("goals", index, "target", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What was the target outcome?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What Was Achieved
              </label>
              <textarea
                value={goal.achieved}
                onChange={(e) => onArrayChange("goals", index, "achieved", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what was actually achieved..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Achievement Rating
                </label>
                <select
                  value={goal.rating}
                  onChange={(e) => onArrayChange("goals", index, "rating", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Select Rating</option>
                  <option value={1}>1 - Not Achieved</option>
                  <option value={2}>2 - Partially Achieved</option>
                  <option value={3}>3 - Achieved</option>
                  <option value={4}>4 - Exceeded</option>
                  <option value={5}>5 - Outstanding Achievement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={goal.comments}
                  onChange={(e) => onArrayChange("goals", index, "comments", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional comments on goal achievement..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
