"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// Removed unused Select imports
import { ResultsFramework, ResultsFrameworkData } from "./results-framework"
import { 
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from "@heroicons/react/24/outline"

interface NewProjectFormProps {
  onCancel: () => void
  onSuccess: () => void
}

const categories = [
  "Child protection",
  "Climate Action", 
  "Disaster and Emergency Preparedness",
  "Drug and Substance Abuse",
  "Education",
  "Empowerment and Livelihoods",
  "Maternal Health",
  "Mental Health",
  "Non-Communicable diseases",
  "SRHR"
]

const evaluationFrequencies = ["Midterm", "Endterm", "Annual", "Other"]
const methodologies = ["Narrative", "Financial", "Log frame", "Visibility", "Other"]

// African Countries and their Provinces/States
const africanCountriesData: Record<string, string[]> = {
  "Algeria": ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira"],
  "Angola": ["Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla"],
  "Benin": ["Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Donga", "Kouffo", "Littoral", "Mono", "Ouémé"],
  "Botswana": ["Central", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "North East", "North West", "South East", "Southern"],
  "Burkina Faso": ["Bam", "Banwa", "Bazèga", "Bougouriba", "Boulgou", "Boulkiemdé", "Comoé", "Ganzourgou", "Gnagna", "Gourma"],
  "Burundi": ["Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke", "Gitega", "Karuzi", "Kayanza", "Kirundo"],
  "Cameroon": ["Adamawa", "Centre", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest", "West"],
  "Cape Verde": ["Barlavento", "Sotavento"],
  "Central African Republic": ["Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haute-Kotto", "Haut-Mbomou", "Kémo", "Lobaye", "Mambéré-Kadéï", "Mbomou", "Nana-Grébizi"],
  "Chad": ["Batha", "Borkou", "Chari-Baguirmi", "Ennedi Est", "Ennedi Ouest", "Guéra", "Hadjer-Lamis", "Kanem", "Lac", "Logone Occidental"],
  "Comoros": ["Anjouan", "Grande Comore", "Mohéli"],
  "Democratic Republic of the Congo": ["Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Kasaï", "Kasaï Central", "Kasaï Oriental", "Sankuru", "Maniema", "South Kivu"],
  "Republic of the Congo": ["Bouenza", "Cuvette", "Cuvette-Ouest", "Kouilou", "Lékoumou", "Likouala", "Niari", "Plateaux", "Pool", "Sangha"],
  "Djibouti": ["Ali Sabieh", "Arta", "Dikhil", "Djibouti", "Obock", "Tadjourah"],
  "Egypt": ["Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta", "Faiyum", "Gharbia"],
  "Equatorial Guinea": ["Annobón", "Bioko Norte", "Bioko Sur", "Centro Sur", "Kié-Ntem", "Litoral", "Wele-Nzas"],
  "Eritrea": ["Anseba", "Debub", "Debubawi Keyih Bahri", "Gash-Barka", "Maekel", "Semenawi Keyih Bahri"],
  "Eswatini": ["Hhohho", "Lubombo", "Manzini", "Shiselweni"],
  "Ethiopia": ["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "Somali"],
  "Gabon": ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"],
  "Gambia": ["Banjul", "Central River", "Lower River", "North Bank", "Upper River", "West Coast"],
  "Ghana": ["Ashanti", "Brong-Ahafo", "Central", "Eastern", "Greater Accra", "Northern", "Upper East", "Upper West", "Volta", "Western"],
  "Guinea": ["Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "Nzérékoré"],
  "Guinea-Bissau": ["Bafatá", "Biombo", "Bissau", "Bolama", "Cacheu", "Gabú", "Oio", "Quinara", "Tombali"],
  "Ivory Coast": ["Agnéby-Tiassa", "Bafing", "Bagoué", "Béré", "Bounkani", "Cavally", "Folon", "Gbêkê", "Gbôklé", "Gôh"],
  "Kenya": ["Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado"],
  "Lesotho": ["Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru", "Mohale's Hoek", "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka"],
  "Liberia": ["Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland"],
  "Libya": ["Al Wahat", "Benghazi", "Derna", "Ghat", "Jabal al Akhdar", "Jabal al Gharbi", "Jafara", "Jufra", "Kufra", "Marj"],
  "Madagascar": ["Antananarivo", "Antsiranana", "Fianarantsoa", "Mahajanga", "Toamasina", "Toliara"],
  "Malawi": ["Central", "Northern", "Southern"],
  "Mali": ["Bamako", "Gao", "Kayes", "Kidal", "Koulikoro", "Mopti", "Ségou", "Sikasso", "Tombouctou"],
  "Mauritania": ["Adrar", "Assaba", "Brakna", "Dakhlet Nouadhibou", "Gorgol", "Guidimaka", "Hodh Ech Chargui", "Hodh El Gharbi", "Inchiri", "Nouakchott"],
  "Mauritius": ["Black River", "Flacq", "Grand Port", "Moka", "Pamplemousses", "Plaines Wilhems", "Port Louis", "Rivière du Rempart", "Savanne"],
  "Morocco": ["Béni Mellal-Khénifra", "Casablanca-Settat", "Drâa-Tafilalet", "Fès-Meknès", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Marrakech-Safi", "Oriental", "Rabat-Salé-Kénitra"],
  "Mozambique": ["Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo", "Maputo City", "Nampula", "Niassa", "Sofala", "Tete"],
  "Namibia": ["Erongo", "Hardap", "Karas", "Kavango East", "Kavango West", "Khomas", "Kunene", "Ohangwena", "Omaheke", "Omusati"],
  "Niger": ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"],
  "Nigeria": ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta"],
  "Rwanda": ["Eastern", "Kigali", "Northern", "Southern", "Western"],
  "São Tomé and Príncipe": ["Príncipe", "São Tomé"],
  "Senegal": ["Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga", "Matam", "Saint-Louis"],
  "Seychelles": ["Inner Islands", "Outer Islands"],
  "Sierra Leone": ["Eastern", "Northern", "Southern", "Western Area"],
  "Somalia": ["Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galguduud", "Gedo", "Hiiraan", "Lower Juba", "Lower Shabelle"],
  "South Africa": ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"],
  "South Sudan": ["Central Equatoria", "Eastern Equatoria", "Jonglei", "Lakes", "Northern Bahr el Ghazal", "Unity", "Upper Nile", "Warrap", "Western Bahr el Ghazal", "Western Equatoria"],
  "Sudan": ["Al Jazirah", "Blue Nile", "Central Darfur", "East Darfur", "Gedaref", "Kassala", "Khartoum", "North Darfur", "North Kordofan", "Northern"],
  "Tanzania": ["Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi", "Kigoma", "Kilimanjaro", "Lindi"],
  "Togo": ["Centrale", "Kara", "Maritime", "Plateaux", "Savanes"],
  "Tunisia": ["Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili"],
  "Uganda": ["Abim", "Adjumani", "Agago", "Alebtong", "Amolatar", "Amudat", "Amuria", "Amuru", "Apac", "Arua"],
  "Zambia": ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "Northern", "North-Western", "Southern", "Western"],
  "Zimbabwe": ["Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East", "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"]
}

export function NewProjectForm({ onCancel, onSuccess }: NewProjectFormProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Employee selection state
  const [employees, setEmployees] = useState<Array<{id: string, name: string, department: string, position: string}>>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  
  // Fetch employees when component mounts
  useEffect(() => {
    fetchEmployees()
  }, [])
  
  // Project Information State
  const [projectCode, setProjectCode] = useState("")
  const [projectTitle, setProjectTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectLead, setProjectLead] = useState<string>("")
  const [projectTeam, setProjectTeam] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Zimbabwe"]) // Default for SAYWHAT
  const [selectedProvinces, setSelectedProvinces] = useState<Record<string, string[]>>({ "Zimbabwe": [] })
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{id: string, name: string, size: number, type: string, uploadedAt: Date}>>([])
  const [implementingOrganizations, setImplementingOrganizations] = useState<string[]>([""])
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([])
  const [frequencyDates, setFrequencyDates] = useState<Record<string, string>>({})
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([])
  
  // Financial Details State
  const [totalBudget, setTotalBudget] = useState("")
  const [fundingSource, setFundingSource] = useState("")

  // Results Framework State
  const [resultsFramework, setResultsFramework] = useState<ResultsFrameworkData>({
    objectives: [],
    projectDuration: 3
  })

  const steps = [
    { number: 1, title: "Project Information", icon: DocumentTextIcon },
    { number: 2, title: "Financial Details", icon: BanknotesIcon },
    { number: 3, title: "Results Framework", icon: ChartBarIcon }
  ]

  const isCurrentUser = (role: string) => {
    return session?.user?.roles?.includes(role) || session?.user?.department === 'MEAL'
  }

  const canEdit = isCurrentUser('MEAL_PERSONNEL') || 
                  session?.user?.roles?.includes('admin') || 
                  session?.user?.roles?.includes('superuser') ||
                  session?.user?.permissions?.includes('programs.create') ||
                  session?.user?.permissions?.includes('programs.full_access')

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Helper function to handle country selection
  const handleCountryChange = (country: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCountries(prev => [...prev, country])
      setSelectedProvinces(prev => ({ ...prev, [country]: [] }))
    } else {
      setSelectedCountries(prev => prev.filter(c => c !== country))
      setSelectedProvinces(prev => {
        const newProvinces = { ...prev }
        delete newProvinces[country]
        return newProvinces
      })
    }
  }

  // Helper function to handle province selection
  const handleProvinceChange = (country: string, province: string, isSelected: boolean) => {
    setSelectedProvinces(prev => ({
      ...prev,
      [country]: isSelected 
        ? [...(prev[country] || []), province]
        : (prev[country] || []).filter(p => p !== province)
    }))
  }

  // Helper function to fetch employees for project lead selection
  const fetchEmployees = async () => {
    if (loadingEmployees) return // Don't fetch if already loading
    
    setLoadingEmployees(true)
    try {
      const response = await fetch('/api/hr/employees')
      if (!response.ok) throw new Error('Failed to fetch employees')
      
      const data = await response.json()
      if (data.data) {
        const employeeList = data.data.map((emp: any) => ({
          id: emp.id.toString(),
          name: `${emp.firstName} ${emp.lastName} ${emp.position ? `- ${emp.position}` : ''} ${emp.department?.name ? `(${emp.department.name})` : ''}`
        }))
        setEmployees(employeeList)
      } else {
        setError('No employee data received')
      }
    } catch (error) {
      setError('Failed to fetch employees')
      console.error('Error fetching employees:', error)
    } finally {
      setLoadingEmployees(false)
    }
  }

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Helper function to handle document upload
  const handleDocumentUpload = async (files: FileList) => {
    const newDocuments: Array<{id: string, name: string, size: number, type: string, uploadedAt: Date}> = []
    
    try {
      // Upload files to document repository with confidential classification
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`)
          return
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'text/plain'
        ]

        if (!allowedTypes.includes(file.type)) {
          setError(`File type ${file.type} is not allowed.`)
          return
        }
        
        // Upload to document repository
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', `Project Document: ${file.name}`)
        formData.append('category', 'PROJECT_DOCUMENT')
        formData.append('classification', 'CONFIDENTIAL')
        
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        
        const documentData = {
          id: result.document?.id || Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          documentId: result.document?.id // Store the actual document ID for linking
        }
        
        newDocuments.push(documentData)
      }
      
      setUploadedDocuments(prev => [...prev, ...newDocuments])
      setError(null)
      
      // Show success message could be implemented here
    } catch (error) {
      console.error('Document upload error:', error)
      setError(`Failed to upload documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper function to remove uploaded document
  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleFrequencyToggle = (frequency: string) => {
    setSelectedFrequencies(prev => {
      if (prev.includes(frequency)) {
        const newFreq = prev.filter(f => f !== frequency)
        const newDates = { ...frequencyDates }
        delete newDates[frequency]
        setFrequencyDates(newDates)
        return newFreq
      } else {
        return [...prev, frequency]
      }
    })
  }

  const handleMethodologyToggle = (methodology: string) => {
    setSelectedMethodologies(prev => 
      prev.includes(methodology) 
        ? prev.filter(m => m !== methodology)
        : [...prev, methodology]
    )
  }

  const handleSubmit = async () => {
    if (!canEdit) return
    
    setIsSubmitting(true)
    setError(null)

    // Validate required fields
    if (!projectCode.trim()) {
      setError('Project code is required')
      setIsSubmitting(false)
      return
    }
    
    if (!projectTitle.trim()) {
      setError('Project title is required')
      setIsSubmitting(false)
      return
    }

    if (!projectLead) {
      setError('Project Lead must be selected')
      setIsSubmitting(false)
      return
    }
    
    try {
      const projectData = {
        name: projectTitle,
        description,
        projectCode,
        startDate,
        endDate,
        countries: selectedCountries,
        provinces: selectedProvinces,
        uploadedDocuments: uploadedDocuments,
        budget: totalBudget ? parseFloat(totalBudget) : 0,
        fundingSource,
        categories: selectedCategories,
        projectLead: projectLead,
        projectTeam: projectTeam,
        implementingOrganizations: implementingOrganizations.filter(org => org.trim() !== ''),
        evaluationFrequency: selectedFrequencies,
        frequencyDates,
        methodologies: selectedMethodologies,
        resultsFramework: resultsFramework
      }

      const response = await fetch('/api/programs/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Project creation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProjectInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="projectCode">Project Code *</Label>
          <Input
            id="projectCode"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Enter project code"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="projectTitle">Project Title *</Label>
          <Input
            id="projectTitle"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Enter project title"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label>Project Lead *</Label>
          <select
            value={projectLead}
            onChange={(e) => setProjectLead(e.target.value)}
            disabled={!canEdit}
            className="mt-2 w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
          >
            <option value="">Select Project Lead</option>
            {loadingEmployees ? (
              <option disabled>Loading employees...</option>
            ) : employees.length === 0 ? (
              <option disabled>No employees available</option>
            ) : (
              employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
          rows={4}
          disabled={!canEdit}
          className="focus:ring-green-500 focus:border-green-500"
        />
        <div className="mt-2">
          <Label>Supporting Documents</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
            <div className="space-y-1 text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="description-files" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-700">
                  <span>Upload detailed project summary</span>
                  <input
                    id="description-files"
                    name="description-files"
                    type="file"
                    multiple
                    className="sr-only"
                    disabled={!canEdit}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label>Project Team</Label>
        <div className="mt-2 space-y-2">
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {loadingEmployees ? (
                <div className="text-center py-2 text-gray-500">Loading employees...</div>
              ) : employees.length === 0 ? (
                <div className="text-center py-2 text-gray-500">No employees found</div>
              ) : (
                employees.map((employee) => (
                  <label key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      checked={projectTeam.includes(employee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProjectTeam([...projectTeam, employee.id]);
                        } else {
                          setProjectTeam(projectTeam.filter(id => id !== employee.id));
                        }
                      }}
                      disabled={!canEdit}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{employee.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Selected team members: {projectTeam.length}
          </div>
          {projectTeam.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {projectTeam.map(id => {
                const employee = employees.find(e => e.id === id);
                return employee ? (
                  <span key={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {employee.name}
                    <button
                      type="button"
                      onClick={() => setProjectTeam(projectTeam.filter(pid => pid !== id))}
                      className="ml-1 inline-flex items-center p-0.5 hover:bg-orange-200 rounded-full"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Categories *</Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              disabled={!canEdit}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="col-span-2">
          <Label>Countries * (Select one or more African countries)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {Object.keys(africanCountriesData).map((country) => (
              <label key={country} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country)}
                  onChange={(e) => handleCountryChange(country, e.target.checked)}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="truncate">{country}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Selected: {selectedCountries.join(', ') || 'None'}
          </div>
        </div>
      </div>

      {/* Province Selection for each selected country */}
      {selectedCountries.length > 0 && (
        <div className="space-y-4">
          <Label>Provinces/States by Country</Label>
          {selectedCountries.map((country) => (
            <div key={country} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{country}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                {africanCountriesData[country].map((province) => (
                  <label key={province} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(selectedProvinces[country] || []).includes(province)}
                      onChange={(e) => handleProvinceChange(country, province, e.target.checked)}
                      disabled={!canEdit}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="truncate">{province}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Selected: {(selectedProvinces[country] || []).join(', ') || 'None'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Upload Section */}
      <div>
        <Label>Project Documents</Label>
        <div className="mt-2 space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
              onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
              disabled={!canEdit}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-orange-600 hover:text-orange-500">
                  Click to upload documents
                </span>
                {' '}or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, XLS, PPT, Images up to 10MB each
              </p>
            </label>
          </div>

          {/* Display uploaded documents */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Uploaded Documents ({uploadedDocuments.length})</h4>
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded {doc.uploadedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Uploaded Successfully
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Implementing Organizations (up to 10)</Label>
        {implementingOrganizations.map((org, index) => (
          <div key={index} className="flex mt-2 space-x-2">
            <Input
              value={org}
              onChange={(e) => {
                const newOrgs = [...implementingOrganizations]
                newOrgs[index] = e.target.value
                setImplementingOrganizations(newOrgs)
              }}
              placeholder={`Organization ${index + 1}`}
              disabled={!canEdit}
              className="focus:ring-green-500 focus:border-green-500"
            />
            {implementingOrganizations.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImplementingOrganizations(prev => prev.filter((_, i) => i !== index))
                }}
                disabled={!canEdit}
                className="hover:bg-red-50 hover:border-red-400"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {implementingOrganizations.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImplementingOrganizations(prev => [...prev, ""])}
            className="mt-2 hover:bg-green-50 hover:border-green-400"
            disabled={!canEdit}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        )}
      </div>

      <div>
        <Label>Evaluation Frequency</Label>
        <div className="mt-2 space-y-4">
          {evaluationFrequencies.map((frequency) => (
            <div key={frequency} className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFrequencies.includes(frequency)}
                  onChange={() => handleFrequencyToggle(frequency)}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{frequency}</span>
              </label>
              {selectedFrequencies.includes(frequency) && (
                <Input
                  type="date"
                  value={frequencyDates[frequency] || ''}
                  onChange={(e) => setFrequencyDates(prev => ({
                    ...prev,
                    [frequency]: e.target.value
                  }))}
                  placeholder={`${frequency} date`}
                  disabled={!canEdit}
                  className="ml-6 focus:ring-green-500 focus:border-green-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Methodologies</Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {methodologies.map((methodology) => (
            <button
              key={methodology}
              type="button"
              onClick={() => handleMethodologyToggle(methodology)}
              disabled={!canEdit}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                selectedMethodologies.includes(methodology)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {methodology}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFinancialDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="totalBudget">Total Budget *</Label>
          <Input
            id="totalBudget"
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="Enter total budget"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="fundingSource">Funding Source *</Label>
          <Input
            id="fundingSource"
            value={fundingSource}
            onChange={(e) => setFundingSource(e.target.value)}
            placeholder="Enter funding source"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <Label>Funding Source Details & Budget Breakdown</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="funding-files" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-700">
                <span>Upload budget breakdown documents</span>
                <input
                  id="funding-files"
                  name="funding-files"
                  type="file"
                  multiple
                  className="sr-only"
                  disabled={!canEdit}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PDF, XLSX, DOC up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Grants e-requisite Integration</h4>
        <p className="text-sm text-blue-700">
          This project will be connected to the Grants e-requisite platform for real-time budget tracking and performance monitoring.
        </p>
      </div>
    </div>
  )

  const renderResultsFramework = () => (
    <div className="space-y-6">
      <ResultsFramework
        data={resultsFramework}
        onChange={setResultsFramework}
        readonly={!canEdit}
      />
    </div>
  )

  return (
    <div className="max-w-full mx-auto p-6 w-full px-4 lg:px-8 xl:px-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Create New Project</h1>
        <p className="text-gray-600 mt-2">Set up a new program with comprehensive project information, financial details, and results framework.</p>
      </div>

      {!canEdit && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Read-only mode:</strong> Only authorized MEAL Personnel can edit project information. You have view-only access.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.number} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      currentStep >= step.number
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-gray-300 text-gray-500 hover:border-green-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-3 text-sm font-medium transition-colors ${
                    currentStep >= step.number ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-5 left-5 w-full h-0.5 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter basic project information and management details"}
            {currentStep === 2 && "Specify budget and funding source information"}
            {currentStep === 3 && "Define objectives, outcomes, and outputs with monitoring framework"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderProjectInformation()}
          {currentStep === 2 && renderFinancialDetails()}
          {currentStep === 3 && renderResultsFramework()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="hover:bg-gray-50"
            >
              Previous
            </Button>
          )}
        </div>
        <div className="flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canEdit}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
