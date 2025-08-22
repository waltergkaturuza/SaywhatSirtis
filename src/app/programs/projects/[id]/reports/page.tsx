"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline"

export default function ProjectReportsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const projectId = params.id

  const [filters, setFilters] = useState({
    dateFrom: '2024-01-01',
    dateTo: '2025-07-15',
    location: 'all',
    gender: 'all',
    ageGroup: 'all'
  })

  // Sample project and data
  const project = {
    id: projectId,
    name: "Action for Choice 2",
    indicators: [
      {
        id: 1,
        name: "Youth SRHR Knowledge",
        target: 5000,
        current: 3250,
        unit: "youth",
        trend: "up",
        change: 12.5
      },
      {
        id: 2,
        name: "Services Provided",
        target: 15000,
        current: 8500,
        unit: "services", 
        trend: "up",
        change: 8.3
      },
      {
        id: 3,
        name: "Community Outreach Activities",
        target: 200,
        current: 145,
        unit: "activities",
        trend: "down",
        change: -5.2
      },
      {
        id: 4,
        name: "Healthcare Facilities Engaged",
        target: 50,
        current: 32,
        unit: "facilities",
        trend: "up",
        change: 15.7
      }
    ]
  }

  // Sample analytics data
  const analytics = {
    genderBreakdown: {
      male: 3850,
      female: 4650,
      other: 125
    },
    ageGroupBreakdown: {
      children: 850,
      youth: 6200,
      adults: 1375,
      elderly: 200
    },
    locationBreakdown: [
      { location: "Lagos, Nigeria", value: 3200, percentage: 37.2 },
      { location: "Abuja, Nigeria", value: 2100, percentage: 24.4 },
      { location: "Kano, Nigeria", value: 1800, percentage: 20.9 },
      { location: "Port Harcourt, Nigeria", value: 950, percentage: 11.0 },
      { location: "Ibadan, Nigeria", value: 575, percentage: 6.7 }
    ],
    monthlyProgress: [
      { month: "Jan 2025", value: 1200, target: 1250 },
      { month: "Feb 2025", value: 1450, target: 1250 },
      { month: "Mar 2025", value: 1380, target: 1250 },
      { month: "Apr 2025", value: 1520, target: 1250 },
      { month: "May 2025", value: 1650, target: 1250 },
      { month: "Jun 2025", value: 1550, target: 1250 },
      { month: "Jul 2025", value: 1100, target: 1250 }
    ]
  }

  const filteredAnalytics = useMemo(() => {
    // Apply filters to analytics data
    const filtered = { ...analytics }
    
    if (filters.gender !== 'all') {
      // Filter gender breakdown
      const total = Object.values(analytics.genderBreakdown).reduce((sum, val) => sum + val, 0)
      const selectedGenderValue = analytics.genderBreakdown[filters.gender as keyof typeof analytics.genderBreakdown] || 0
      filtered.genderBreakdown = {
        [filters.gender]: selectedGenderValue,
        others: total - selectedGenderValue
      } as any
    }
    
    return filtered
  }, [filters, analytics])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const generateReport = () => {
    alert('Generating comprehensive report...')
  }

  const exportData = () => {
    alert('Exporting data to Excel...')
  }

  const metadata = {
    title: "Reports & Analytics",
    description: `Data analytics and reporting for ${project.name}`,
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: project.name, href: `/programs/projects/${projectId}` },
      { name: "Reports" }
    ]
  }

  const actions = (
    <>
      <Link
        href={`/programs/projects/${projectId}`}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Project
      </Link>
      <button
        onClick={exportData}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Export Data
      </button>
      <button
        onClick={generateReport}
        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
      >
        <ChartBarIcon className="h-4 w-4 mr-2" />
        Generate Report
      </button>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Locations</option>
              <option value="lagos">Lagos</option>
              <option value="abuja">Abuja</option>
              <option value="kano">Kano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
            <select
              value={filters.ageGroup}
              onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Ages</option>
              <option value="children">Children (0-14)</option>
              <option value="youth">Youth (15-24)</option>
              <option value="adults">Adults (25-64)</option>
              <option value="elderly">Elderly (65+)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(filteredAnalytics.genderBreakdown).reduce((sum, val) => sum + val, 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">Total Beneficiaries</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">
              {project.indicators.filter(i => i.trend === 'up').length}
            </div>
            <div className="text-sm text-green-800">Improving Indicators</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((project.indicators.reduce((sum, i) => sum + i.current, 0) / project.indicators.reduce((sum, i) => sum + i.target, 0)) * 100)}%
            </div>
            <div className="text-sm text-purple-800">Overall Progress</div>
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
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {project.indicators.map((indicator) => (
            <div key={indicator.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">{indicator.name}</h3>
                <div className={`flex items-center ${indicator.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {indicator.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4" />
                  )}
                  <span className="text-xs ml-1">{indicator.change}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">{indicator.current.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/ {indicator.target.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${indicator.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((indicator.current / indicator.target) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {Math.round((indicator.current / indicator.target) * 100)}% of target achieved
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Breakdown Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
            <div className="space-y-4">
              {Object.entries(filteredAnalytics.genderBreakdown).map(([gender, value]) => {
                const total = Object.values(filteredAnalytics.genderBreakdown).reduce((sum, val) => sum + val, 0)
                const percentage = (value / total) * 100
                
                return (
                  <div key={gender} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-3 ${
                        gender === 'male' ? 'bg-blue-500' : 
                        gender === 'female' ? 'bg-pink-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{gender}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Age Group Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Distribution</h3>
            <div className="space-y-4">
              {Object.entries(analytics.ageGroupBreakdown).map(([ageGroup, value]) => {
                const total = Object.values(analytics.ageGroupBreakdown).reduce((sum, val) => sum + val, 0)
                const percentage = (value / total) * 100
                
                return (
                  <div key={ageGroup} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-3 ${
                        ageGroup === 'children' ? 'bg-green-500' : 
                        ageGroup === 'youth' ? 'bg-blue-500' :
                        ageGroup === 'adults' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{ageGroup}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-4">
            {analytics.locationBreakdown.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{location.location}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{location.value.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{location.percentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Progress Trend */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress Trend</h3>
          <div className="grid grid-cols-7 gap-4">
            {analytics.monthlyProgress.map((month, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{month.month}</div>
                <div className="relative bg-gray-200 rounded h-24 flex items-end">
                  <div 
                    className="bg-blue-600 rounded w-full"
                    style={{ height: `${(month.value / 2000) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 w-full border-t-2 border-red-400"
                    style={{ top: `${100 - (month.target / 2000) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-gray-900 mt-1">{month.value}</div>
                <div className="text-xs text-gray-500">Target: {month.target}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Generation */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Automated Reporting</h3>
          <p className="text-blue-800 mb-4">
            Generate comprehensive reports with charts, tables, and analysis for stakeholders and donors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={generateReport}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 text-left"
            >
              <div className="font-medium text-blue-900">Executive Summary</div>
              <div className="text-sm text-blue-700">High-level overview for leadership</div>
            </button>
            <button 
              onClick={generateReport}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 text-left"
            >
              <div className="font-medium text-blue-900">Detailed Analytics</div>
              <div className="text-sm text-blue-700">Comprehensive data analysis</div>
            </button>
            <button 
              onClick={generateReport}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 text-left"
            >
              <div className="font-medium text-blue-900">Donor Report</div>
              <div className="text-sm text-blue-700">Formal report for donors</div>
            </button>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
