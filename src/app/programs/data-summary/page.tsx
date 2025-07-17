"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  UsersIcon,
  MapPinIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon
} from "@heroicons/react/24/outline"

export default function DataSummaryPage() {
  const { data: session } = useSession()
  const [searchParams, setSearchParams] = useState({
    projectName: "",
    country: "all",
    province: "all",
    dateFrom: "",
    dateTo: "",
    gender: "all",
    ageGroup: "all",
    status: "all"
  })

  const metadata = {
    title: "Programs Data Summary",
    description: "Comprehensive data analysis and reporting for all programs",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Programs", href: "/programs" },
      { name: "Data Summary" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <PrinterIcon className="h-4 w-4 mr-2" />
        Print Report
      </button>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
        Export Data
      </button>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
        <ShareIcon className="h-4 w-4 mr-2" />
        Share Report
      </button>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              placeholder="Search by project name..."
              value={searchParams.projectName}
              onChange={(e) => setSearchParams({...searchParams, projectName: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={searchParams.country}
              onChange={(e) => setSearchParams({...searchParams, country: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Countries</option>
              <option value="nigeria">Nigeria</option>
              <option value="ghana">Ghana</option>
              <option value="kenya">Kenya</option>
              <option value="uganda">Uganda</option>
              <option value="senegal">Senegal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province/State</label>
            <select
              value={searchParams.province}
              onChange={(e) => setSearchParams({...searchParams, province: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Provinces</option>
              <option value="lagos">Lagos</option>
              <option value="kano">Kano</option>
              <option value="abuja">FCT Abuja</option>
              <option value="rivers">Rivers</option>
              <option value="ogun">Ogun</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={searchParams.dateFrom}
              onChange={(e) => setSearchParams({...searchParams, dateFrom: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={searchParams.dateTo}
              onChange={(e) => setSearchParams({...searchParams, dateTo: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender Reach</label>
            <select
              value={searchParams.gender}
              onChange={(e) => setSearchParams({...searchParams, gender: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
            <select
              value={searchParams.ageGroup}
              onChange={(e) => setSearchParams({...searchParams, ageGroup: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Ages</option>
              <option value="children">Children (0-17)</option>
              <option value="youth">Youth (18-35)</option>
              <option value="adults">Adults (36-60)</option>
              <option value="elderly">Elderly (60+)</option>
            </select>
          </div>

          <button className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">161,440</div>
            <div className="text-sm text-blue-800">Total Reach</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">45</div>
            <div className="text-sm text-green-800">Active Projects</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-purple-800">Countries</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Sample summary data
  const summaryData = {
    totalProjects: 45,
    totalReach: 161440,
    totalBudget: 12850000,
    averageProgress: 68,
    completedProjects: 12,
    ongoingProjects: 33,
    countries: 5,
    provinces: 23
  }

  const genderBreakdown = [
    { category: "Male", count: 78720, percentage: 48.8 },
    { category: "Female", count: 82720, percentage: 51.2 }
  ]

  const ageBreakdown = [
    { category: "Children (0-17)", count: 48432, percentage: 30.0 },
    { category: "Youth (18-35)", count: 64576, percentage: 40.0 },
    { category: "Adults (36-60)", count: 40360, percentage: 25.0 },
    { category: "Elderly (60+)", count: 8072, percentage: 5.0 }
  ]

  const countryData = [
    {
      country: "Nigeria",
      projects: 18,
      reach: 72650,
      budget: 5200000,
      progress: 75,
      provinces: ["Lagos", "Kano", "Abuja", "Rivers", "Ogun"],
      topSectors: ["Health", "Education", "Agriculture"]
    },
    {
      country: "Ghana", 
      projects: 12,
      reach: 38500,
      budget: 3100000,
      progress: 68,
      provinces: ["Greater Accra", "Ashanti", "Northern"],
      topSectors: ["Education", "Water", "Health"]
    },
    {
      country: "Kenya",
      projects: 8,
      reach: 28740,
      budget: 2800000,
      progress: 82,
      provinces: ["Nairobi", "Mombasa", "Kisumu"],
      topSectors: ["Water", "Agriculture", "Health"]
    },
    {
      country: "Uganda",
      projects: 5,
      reach: 15250,
      budget: 1200000,
      progress: 60,
      provinces: ["Kampala", "Entebbe"],
      topSectors: ["Youth", "Agriculture", "Health"]
    },
    {
      country: "Senegal",
      projects: 2,
      reach: 6300,
      budget: 550000,
      progress: 85,
      provinces: ["Dakar"],
      topSectors: ["Agriculture", "Water"]
    }
  ]

  const sectorData = [
    { sector: "Health", projects: 15, reach: 62500, budget: 4200000 },
    { sector: "Education", projects: 12, reach: 45800, budget: 3800000 },
    { sector: "Water & Sanitation", projects: 8, reach: 28900, budget: 2900000 },
    { sector: "Agriculture", projects: 6, reach: 15240, budget: 1400000 },
    { sector: "Youth Development", projects: 4, reach: 9000, budget: 550000 }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{summaryData.totalProjects}</h3>
                <p className="text-sm text-gray-500">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{summaryData.totalReach.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">People Reached</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{summaryData.countries}</h3>
                <p className="text-sm text-gray-500">Countries</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DocumentChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{summaryData.averageProgress}%</h3>
                <p className="text-sm text-gray-500">Avg Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gender & Age Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Breakdown</h3>
            <div className="space-y-4">
              {genderBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.count.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Breakdown</h3>
            <div className="space-y-4">
              {ageBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.count.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country Analysis */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Country-wise Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    People Reached
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Sectors
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {countryData.map((country) => (
                  <tr key={country.country} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{country.country}</div>
                          <div className="text-xs text-gray-500">{country.provinces.length} provinces</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{country.projects}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{country.reach.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">${country.budget.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 mr-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${country.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-900">{country.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {country.topSectors.map((sector) => (
                          <span key={sector} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Analysis */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector-wise Performance</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {sectorData.map((sector) => (
                <div key={sector.sector} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{sector.sector}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Projects</div>
                      <div className="font-medium text-gray-900">{sector.projects}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Reach</div>
                      <div className="font-medium text-gray-900">{sector.reach.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Budget</div>
                      <div className="font-medium text-gray-900">${sector.budget.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Investment by Sector</h4>
              <div className="space-y-3">
                {sectorData.map((sector) => {
                  const percentage = (sector.budget / summaryData.totalBudget) * 100
                  return (
                    <div key={sector.sector}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{sector.sector}</span>
                        <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
