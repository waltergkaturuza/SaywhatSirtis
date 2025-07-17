"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import FilterPanel from "@/components/programs/filter-panel"
import ProjectTable from "@/components/programs/project-table"
import { realProjects } from "@/data/projects"
import { ProgramsFilters } from "@/types/programs"
import {
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline"

export default function ProgramsPage() {
  const { data: session } = useSession()
  
  // Check user permissions
  const userPermissions = session?.user?.permissions || []
  const canCreateProject = userPermissions.includes('programs.me_access')
  const canUploadDocuments = userPermissions.includes('programs.upload')
  const canAccessProgress = userPermissions.includes('programs.progress')

  const [filters, setFilters] = useState<ProgramsFilters>({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    country: 'all',
    province: 'all',
    donor: 'all',
    sector: 'all',
    status: 'all',
    genderReach: 'all'
  })

  // Get unique countries and provinces from projects
  const countries = [...new Set(realProjects.map(p => p.country))]
  const provinces = [...new Set(realProjects.map(p => p.province))]

  const handleFilterChange = (key: keyof ProgramsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      country: 'all',
      province: 'all',
      donor: 'all',
      sector: 'all',
      status: 'all',
      genderReach: 'all'
    })
  }

  // Filter projects based on current filters
  const filteredProjects = realProjects.filter(project => {
    const matchesSearch = filters.searchTerm === '' || 
      project.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(filters.searchTerm.toLowerCase())

    const matchesCountry = filters.country === 'all' || project.country === filters.country

    const matchesProvince = filters.province === 'all' || project.province === filters.province

    const matchesDonor = filters.donor === 'all' || project.donor === filters.donor

    const matchesSector = filters.sector === 'all' || 
      project.sectors.includes(filters.sector)

    const matchesStatus = filters.status === 'all' || project.status === filters.status

    const matchesGender = filters.genderReach === 'all' || 
      (project.genderReach.male > 0 && filters.genderReach === 'male') ||
      (project.genderReach.female > 0 && filters.genderReach === 'female')

    return matchesSearch && matchesCountry && matchesProvince && 
           matchesDonor && matchesSector && matchesStatus && matchesGender
  })

  // Calculate statistics
  const statistics = {
    totalProjects: realProjects.length,
    activeProjects: realProjects.filter(p => p.status === 'active').length,
    completedProjects: realProjects.filter(p => p.status === 'completed').length,
    totalBudget: realProjects.reduce((sum, p) => sum + p.budget, 0),
    totalBeneficiaries: realProjects.reduce((sum, p) => sum + p.targetReach, 0)
  }

  const metadata = {
    title: "Programs Management",
    description: "Comprehensive M&E system for program tracking, data collection, and reporting",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs" }
    ]
  }

  const actions = (
    <>
      <Link
        href="/programs/data-summary"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ChartBarIcon className="h-4 w-4 mr-2" />
        Data Summary
      </Link>
      <Link
        href="/programs/kobo-integration"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
        Kobo Integration
      </Link>
      {canCreateProject && (
        <Link
          href="/programs/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Link>
      )}
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalProjects}</div>
            <div className="text-sm text-blue-800">Total Projects</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{statistics.activeProjects}</div>
            <div className="text-sm text-green-800">Active Projects</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <div className="text-2xl font-bold text-yellow-600">{statistics.completedProjects}</div>
            <div className="text-sm text-yellow-800">Completed</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              ${(statistics.totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-purple-800">Total Budget</div>
          </div>
          <div className="bg-indigo-50 p-3 rounded">
            <div className="text-2xl font-bold text-indigo-600">
              {statistics.totalBeneficiaries.toLocaleString()}
            </div>
            <div className="text-sm text-indigo-800">Beneficiaries</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {canCreateProject && (
            <Link 
              href="/programs/new"
              className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded block"
            >
              Create New Project
            </Link>
          )}
          <Link 
            href="/programs/data-summary"
            className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded block"
          >
            View Data Analytics
          </Link>
          <Link 
            href="/programs/kobo-integration"
            className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded block"
          >
            Kobo Integration
          </Link>
          {canUploadDocuments && (
            <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
              Bulk Document Upload
            </button>
          )}
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            Export Projects Data
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>New data entry: Action for Choice 2</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            <span>Report generated: STOP TB Q4</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            <span>Form updated: LEAD project</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Filter Panel */}
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          countries={countries}
          provinces={provinces}
        />

        {/* Projects Table */}
        <ProjectTable 
          projects={filteredProjects}
          canEditProjects={canCreateProject}
          canUploadProgress={canUploadDocuments}
        />

        {/* Programs Information */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">SAYWHAT Programs Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Current Active Projects</h4>
              <ul className="space-y-1">
                <li>• Action for Choice 2 - Sexual and reproductive health</li>
                <li>• LEAD - Leadership and advocacy development</li>
                <li>• STOP TB - Tuberculosis prevention and treatment</li>
                <li>• REAPS - Rural health strengthening</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Focus Areas</h4>
              <ul className="space-y-1">
                <li>• Health system strengthening</li>
                <li>• Community health improvement</li>
                <li>• Capacity building and training</li>
                <li>• Research and evidence generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
