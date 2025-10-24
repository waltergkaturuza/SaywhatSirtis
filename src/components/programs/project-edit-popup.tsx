"use client"

import { useState, useEffect } from "react"
import { 
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  FlagIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { ResultsFramework, ResultsFrameworkData } from "./results-framework"

interface ProjectEditPopupProps {
  projectId: string | null
  isOpen: boolean
  onClose: () => void
  onSave: (projectId: string) => void
  permissions: any
}

interface ProjectFormData {
  name: string
  projectGoal?: string
  description: string
  status: string
  priority: string
  progress: number
  startDate: string
  endDate: string
  budget: number
  actualSpent: number
  managerId: string
  country: string
  province: string
  currency: string
  timeframe: string
  objectives: string
}

interface Manager {
  id: string           // employeeId
  userId?: string      // linked users.id (if available)
  firstName: string
  lastName: string
  email?: string
}

export function ProjectEditPopup({ projectId, isOpen, onClose, onSave, permissions }: ProjectEditPopupProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    projectGoal: '',
    description: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    progress: 0,
    startDate: '',
    endDate: '',
    budget: 0,
    actualSpent: 0,
    managerId: '',
    country: '',
    province: '',
    currency: 'USD',
    timeframe: '',
    objectives: ''
  })
  // Additional fields to mirror project creation
  const [projectCode, setProjectCode] = useState<string>('')
  const [projectLead, setProjectLead] = useState<string>('')
  const [projectTeam, setProjectTeam] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [availableCategories] = useState<string[]>([
    "Child protection","Climate Action","Disaster and Emergency Preparedness","Drug and Substance Abuse","Education","Empowerment and Livelihoods","Maternal Health","Mental Health","Non-Communicable diseases","SRHR"
  ])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedProvinces, setSelectedProvinces] = useState<Record<string, string[]>>({})
  const [implementingOrganizations, setImplementingOrganizations] = useState<string[]>([])
  const [evaluationFrequency, setEvaluationFrequency] = useState<string[]>([])
  const [frequencyDates, setFrequencyDates] = useState<Record<string, string>>({})
  const [methodologies, setMethodologies] = useState<string[]>([])
  const [resultsFramework, setResultsFramework] = useState<ResultsFrameworkData>({ objectives: [], projectDuration: 3 })

  // African country/province dataset (subset; extend as needed)
  const africanCountriesData: Record<string, string[]> = {
    Algeria: ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Blida","Bouira"],
    Angola: ["Bengo","Benguela","Bié","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul","Cunene","Huambo","Huíla"],
    Botswana: ["Central","Ghanzi","Kgalagadi","Kgatleng","Kweneng","North East","North West","South East","Southern"],
    Egypt: ["Alexandria","Aswan","Asyut","Beheira","Beni Suef","Cairo","Dakahlia","Damietta","Faiyum","Gharbia"],
    Ghana: ["Ashanti","Brong-Ahafo","Central","Eastern","Greater Accra","Northern","Upper East","Upper West","Volta","Western"],
    Kenya: ["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado"],
    Mozambique: ["Cabo Delgado","Gaza","Inhambane","Manica","Maputo","Maputo City","Nampula","Niassa","Sofala","Tete"],
    Namibia: ["Erongo","Hardap","Karas","Kavango East","Kavango West","Khomas","Kunene","Ohangwena","Omaheke","Omusati"],
    Nigeria: ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta"],
    Rwanda: ["Eastern","Kigali","Northern","Southern","Western"],
    "South Africa": ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"],
    Tanzania: ["Arusha","Dar es Salaam","Dodoma","Geita","Iringa","Kagera","Katavi","Kigoma","Kilimanjaro","Lindi"],
    Uganda: ["Abim","Adjumani","Agago","Alebtong","Amolatar","Amudat","Amuria","Amuru","Apac","Arua"],
    Zambia: ["Central","Copperbelt","Eastern","Luapula","Lusaka","Muchinga","Northern","North-Western","Southern","Western"],
    Zimbabwe: ["Bulawayo","Harare","Manicaland","Mashonaland Central","Mashonaland East","Mashonaland West","Masvingo","Matabeleland North","Matabeleland South","Midlands"]
  }
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(1)

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails()
      fetchManagers()
    }
  }, [isOpen, projectId])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/programs/projects/${projectId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch project details')
      }
      
      if (result.success) {
        const project = result.data
        setFormData({
          name: project.name || '',
          projectGoal: project.projectGoal || '',
          description: project.description || '',
          status: project.status || 'PLANNING',
          priority: project.priority || 'MEDIUM',
          progress: project.progress || 0,
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          budget: project.budget || 0,
          actualSpent: project.actualSpent || 0,
          managerId: project.users_projects_managerIdTousers?.id || '',
          country: project.country || '',
          province: project.province || '',
          currency: project.currency || 'USD',
          timeframe: project.timeframe || '',
          objectives: typeof project.objectives === 'string' ? project.objectives : JSON.stringify(project.objectives || '')
        })

        // Load Results Framework from the dedicated field (NEW WAY - separate JSONB field)
        console.log('Loading resultsFramework from project:', project.resultsFramework)
        console.log('Type of resultsFramework:', typeof project.resultsFramework)
        if (project.resultsFramework) {
          let framework = project.resultsFramework
          // Handle string case for backwards compatibility
          if (typeof framework === 'string') {
            try {
              framework = JSON.parse(framework)
              console.log('Parsed resultsFramework from string')
            } catch (parseError) {
              console.error('Failed to parse resultsFramework:', parseError)
              framework = { objectives: [], projectDuration: 3 }
            }
          }
          if (framework && typeof framework === 'object') {
            console.log('✓ Setting resultsFramework with', framework.objectives?.length || 0, 'objectives')
            setResultsFramework(framework as ResultsFrameworkData)
          }
        }

        // Parse extended fields from objectives JSON (OLD WAY - for backwards compatibility)
        try {
          const obj = typeof project.objectives === 'string' ? JSON.parse(project.objectives || '{}') : (project.objectives || {})
          setProjectCode(obj.projectCode || '')
          setProjectLead(obj.projectLead || project.users_projects_managerIdTousers?.id || '')
          setProjectTeam(Array.isArray(obj.projectTeam) ? obj.projectTeam : [])
          setCategories(Array.isArray(obj.categories) ? obj.categories : [])
          setSelectedCountries(Array.isArray(obj.countries) ? obj.countries : (project.country ? [project.country] : []))
          setSelectedProvinces(typeof obj.provinces === 'object' && obj.provinces ? obj.provinces : (project.country ? { [project.country]: project.province ? String(project.province).split(',').map((s:string)=>s.trim()).filter(Boolean) : [] } : {}))
          setImplementingOrganizations(Array.isArray(obj.implementingOrganizations) ? obj.implementingOrganizations : [])
          setEvaluationFrequency(Array.isArray(obj.evaluationFrequency) ? obj.evaluationFrequency : [])
          setFrequencyDates(typeof obj.frequencyDates === 'object' && obj.frequencyDates ? obj.frequencyDates : {})
          setMethodologies(Array.isArray(obj.methodologies) ? obj.methodologies : [])
          // Fallback: If no resultsFramework in dedicated field, try from objectives JSON
          if (!project.resultsFramework && obj.resultsFramework && typeof obj.resultsFramework === 'object') {
            console.log('Using resultsFramework from objectives JSON (fallback)')
            setResultsFramework(obj.resultsFramework as ResultsFrameworkData)
          }
        } catch {}
      } else {
        throw new Error(result.error || 'Failed to load project details')
      }
    } catch (error) {
      console.error('Project fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/hr/employees')
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Normalize to include potential userId if API provides 'users' relation
        const normalized: Manager[] = (result.data || []).map((e: any) => ({
          id: e.id,
          userId: e.users?.id || e.userId || undefined,
          firstName: e.firstName || e.firstname || e.first_name || '',
          lastName: e.lastName || e.lastname || e.last_name || '',
          email: e.email || e.users?.email
        }))
        setManagers(normalized)
      }
    } catch (error) {
      console.error('Failed to fetch managers:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      const objectivesPayload = {
        projectCode,
        projectLead,
        projectTeam,
        categories,
        implementingOrganizations,
        evaluationFrequency,
        frequencyDates,
        methodologies,
        countries: selectedCountries,
        provinces: selectedProvinces
        // resultsFramework removed - saved separately
      }

      console.log('Saving project with resultsFramework:', resultsFramework)
      console.log('Results Framework has', resultsFramework?.objectives?.length || 0, 'objectives')

      const response = await fetch(`/api/programs/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          managerId: formData.managerId || projectLead || undefined,
          country: selectedCountries?.[0] || formData.country,
          province: selectedCountries?.[0] && selectedProvinces[selectedCountries[0]] ? selectedProvinces[selectedCountries[0]].join(', ') : formData.province,
          objectives: JSON.stringify(objectivesPayload),
          resultsFramework: resultsFramework // Save to dedicated field
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to update project')
      }
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSave(projectId!)
          onClose()
        }, 1500)
      } else {
        throw new Error(result.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Project update error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-[95vw] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">Edit Project</h2>
              <p className="text-orange-100 text-sm">Update project information and settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-200px)]">
          {/* Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[
                { id: 1, label: 'Basic Info' },
                { id: 2, label: 'Timeline' },
                { id: 3, label: 'Location & Lead' },
                { id: 4, label: 'Budget & Objectives' }
              ].map(step => (
                <div
                  key={step.id}
                  className={`flex-1 text-center text-xs md:text-sm py-2 border-b-2 mx-1 ${currentStep === step.id ? 'border-orange-600 text-orange-600' : 'border-gray-200 text-gray-500'}`}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Loading project details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-green-800">Project updated successfully!</p>
              </div>
            </div>
          )}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Goal *</label>
                  <textarea
                    name="projectGoal"
                    value={formData.projectGoal || ''}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter the main goal of this project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      value={formData.progress}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="ZAR">ZAR</option>
                      <option value="ZWL">ZWL</option>
                    </select>
                  </div>
                </div>
                {/* Implementing Organizations */}
                <div className="mt-6 space-y-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Implementing Organizations (up to 10)</h4>
                  {/* Quick add selector with preset partners and Other */}
                  <div className="flex items-center gap-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md"
                      onChange={(e) => {
                        const val = e.target.value
                        if (!val) return
                        if (val === 'Other') return
                        setImplementingOrganizations(prev => prev.includes(val) ? prev : [...prev, val])
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select organization</option>
                      <option>Centre for Youth Empowerment and Civic Education ( CYECE)</option>
                      <option>National Action for Quality Education in Zambia  ( NAQEZ)</option>
                      <option>Associação Mwana Pwo                                                  ( Mwana Pwo)</option>
                      <option>Girls Activist Youth Organization                                 ( GAYO)</option>
                      <option>Associacao Mulher,Lei e Desenvolvimento    ( MULEIDE)</option>
                      <option>Plataforma Mulheres em Acção Angola            ( PLATAFORMA)</option>
                      <option>MWANASIKANA WANHASI</option>
                      <option>Centre for Reproductive Health and Education ( CRHE)</option>
                      <option>Farming Communities Educational Trust           ( FACET)</option>
                      <option value="Other">Other</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Other organization"
                      className="px-3 py-2 border border-gray-300 rounded-md"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = (e.target as HTMLInputElement).value.trim()
                          if (v) {
                            setImplementingOrganizations(prev => prev.includes(v) ? prev : [...prev, v])
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border rounded-md"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement)
                        const v = input.value.trim()
                        if (v) {
                          setImplementingOrganizations(prev => prev.includes(v) ? prev : [...prev, v])
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {implementingOrganizations.map((org, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={org}
                        onChange={(e) => setImplementingOrganizations(prev => prev.map((o, i) => i === idx ? e.target.value : o))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        placeholder={`Organization ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setImplementingOrganizations(prev => prev.filter((_, i) => i !== idx))}
                        className="px-2 py-2 text-sm text-red-600 hover:text-red-800"
                        aria-label="Remove organization"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setImplementingOrganizations(prev => prev.length < 10 ? [...prev, ""] : prev)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    + Add Organization
                  </button>
                </div>

                {/* Evaluation Frequency */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Evaluation Frequency</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Midterm','Endterm','Annual','Other'].map(f => {
                      const active = evaluationFrequency.includes(f)
                      return (
                        <button
                          type="button"
                          key={f}
                          onClick={() => setEvaluationFrequency(prev => active ? prev.filter(x => x !== f) : [...prev, f])}
                          className={`px-2 py-1 rounded border text-xs ${active ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                          {f}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Methodologies */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Methodologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Narrative','Financial','Log frame','Visibility','Other'].map(m => {
                      const active = methodologies.includes(m)
                      return (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setMethodologies(prev => active ? prev.filter(x => x !== m) : [...prev, m])}
                          className={`px-2 py-1 rounded border text-xs ${active ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                          {m}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Project Team */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {managers.map(m => {
                      const selected = projectTeam.includes(m.id)
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setProjectTeam(prev => selected ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                          className={`px-2 py-1 rounded border text-xs ${selected ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                          {m.firstName} {m.lastName}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Selected team members: {projectTeam.length}</p>
                </div>

                {/* Categories */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(cat => {
                      const active = categories.includes(cat)
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setCategories(prev => active ? prev.filter(c => c !== cat) : [...prev, cat])}
                          className={`px-3 py-2 rounded-md border text-xs ${active ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              )}

              {/* Step 2: Timeline */}
              {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Timeline</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                    <input
                      type="text"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      placeholder="e.g., 6 months, 1 year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Step 3: Location & Lead */}
              {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Location & Lead</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={(selectedCountries[0] || formData.country || 'Zimbabwe')}
                      onChange={(e) => {
                        const c = e.target.value
                        setSelectedCountries(c ? [c] : [])
                        setFormData(prev => ({ ...prev, country: c }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      {Object.keys(africanCountriesData).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province/State</label>
                    <div className="flex flex-wrap gap-2">
                      {(africanCountriesData[(selectedCountries[0] || formData.country || 'Zimbabwe')] || []).map(p => {
                        const country = (selectedCountries[0] || formData.country || 'Zimbabwe')
                        const isSelected = (selectedProvinces[country] || []).includes(p)
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => {
                              const current = selectedProvinces[country] || []
                              const next = isSelected ? current.filter(x => x !== p) : [...current, p]
                              setSelectedProvinces(prev => ({ ...prev, [country]: next }))
                              setFormData(prev => ({ ...prev, province: next.join(', ') }))
                            }}
                            className={`px-2 py-1 rounded border text-xs ${isSelected ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}
                          >
                            {p}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Lead</label>
                    <select
                      name="managerId"
                      value={formData.managerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select Lead</option>
                      {managers.map((m) => (
                        <option key={`${m.userId || m.id}`} value={m.userId || m.id}>
                          {m.firstName} {m.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              )}

              {/* Step 4: Budget & Objectives */}
              {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Budget</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actual Spent</label>
                      <input
                        type="number"
                        name="actualSpent"
                        value={formData.actualSpent}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Objectives, Outcomes & Outputs</h4>
                  <ResultsFramework
                    data={resultsFramework}
                    onChange={setResultsFramework}
                  />
                </div>
                {/* Documentation Uploads */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Documentation</h4>
                  <p className="text-sm text-gray-600">Attach relevant files (budgets, logframes, contracts). Stored as metadata in the objectives payload.</p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).map(f => ({ name: f.name, size: f.size, type: f.type, uploadedAt: new Date() }))
                      setFrequencyDates(prev => ({ ...prev, __docs__: JSON.stringify(files) }))
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">PDF, XLSX, DOC up to 10MB each.</p>
                </div>

                {/* Step Controls inside last step show submit */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Save</button>
                </div>
              </div>
              )}

              {/* Step Controls (for steps 1-3) */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    disabled={currentStep === 1}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Project ID: {projectId}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
