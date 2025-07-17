"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import Link from "next/link"
import {
  AcademicCapIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("programs")

  const metadata = {
    title: "Training Management",
    description: "Manage training programs, courses, and certifications",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Training" }
    ]
  }

  const actions = (
    <>
      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Training Report
      </button>
      <Link href="/hr/training/create">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Program
        </button>
      </Link>
    </>
  )

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active Programs</span>
            <span className="font-semibold text-blue-600">12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Enrollments</span>
            <span className="font-semibold text-green-600">387</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Completions</span>
            <span className="font-semibold text-purple-600">234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Certifications</span>
            <span className="font-semibold text-yellow-600">156</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Categories</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Leadership</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <span className="text-xs text-gray-500">65%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Technical Skills</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
              <span className="text-xs text-gray-500">80%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Compliance</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
              <span className="text-xs text-gray-500">45%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Safety</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "90%" }}></div>
              </div>
              <span className="text-xs text-gray-500">90%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/hr/training/create" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Create Program
          </Link>
          <Link href="/hr/training/enroll" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Enroll Employees
          </Link>
          <Link href="/hr/training/calendar" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Training Calendar
          </Link>
          <Link href="/hr/training/certificates" className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Certificates
          </Link>
        </div>
      </div>
    </div>
  )

  const trainingPrograms = [
    {
      id: 1,
      title: "Leadership Development Program",
      category: "Leadership",
      description: "Comprehensive leadership training for management roles",
      instructor: "Dr. Sarah Johnson",
      duration: "6 weeks",
      format: "Blended",
      enrolled: 25,
      capacity: 30,
      startDate: "2024-02-01",
      endDate: "2024-03-15",
      status: "active",
      completion: 68,
      certificationAvailable: true
    },
    {
      id: 2,
      title: "Data Analysis with Python",
      category: "Technical Skills",
      description: "Learn data analysis techniques using Python and pandas",
      instructor: "Michael Chen",
      duration: "4 weeks",
      format: "Online",
      enrolled: 18,
      capacity: 25,
      startDate: "2024-01-15",
      endDate: "2024-02-12",
      status: "active",
      completion: 45,
      certificationAvailable: true
    },
    {
      id: 3,
      title: "Workplace Safety Training",
      category: "Safety",
      description: "Mandatory safety training for all employees",
      instructor: "Safety Team",
      duration: "2 hours",
      format: "In-person",
      enrolled: 150,
      capacity: 200,
      startDate: "2024-01-20",
      endDate: "2024-01-20",
      status: "completed",
      completion: 95,
      certificationAvailable: true
    },
    {
      id: 4,
      title: "Financial Management Basics",
      category: "Professional Development",
      description: "Basic financial management concepts for non-finance staff",
      instructor: "Jennifer Smith",
      duration: "3 weeks",
      format: "Hybrid",
      enrolled: 12,
      capacity: 20,
      startDate: "2024-02-05",
      endDate: "2024-02-26",
      status: "upcoming",
      completion: 0,
      certificationAvailable: false
    }
  ]

  const enrollments = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      employeeId: "EMP001",
      program: "Leadership Development Program",
      enrollDate: "2024-01-28",
      progress: 85,
      status: "in-progress",
      expectedCompletion: "2024-03-10",
      grade: null,
      certificateIssued: false
    },
    {
      id: 2,
      employeeName: "Michael Adebayo",
      employeeId: "EMP002",
      program: "Data Analysis with Python",
      enrollDate: "2024-01-14",
      progress: 60,
      status: "in-progress",
      expectedCompletion: "2024-02-08",
      grade: null,
      certificateIssued: false
    },
    {
      id: 3,
      employeeName: "David Okonkwo",
      employeeId: "EMP004",
      program: "Workplace Safety Training",
      enrollDate: "2024-01-19",
      progress: 100,
      status: "completed",
      expectedCompletion: "2024-01-20",
      grade: "A",
      certificateIssued: true
    },
    {
      id: 4,
      employeeName: "Fatima Bello",
      employeeId: "EMP005",
      program: "Leadership Development Program",
      enrollDate: "2024-01-30",
      progress: 25,
      status: "in-progress",
      expectedCompletion: "2024-03-12",
      grade: null,
      certificateIssued: false
    }
  ]

  const certificates = [
    {
      id: 1,
      employeeName: "David Okonkwo",
      program: "Workplace Safety Training",
      issueDate: "2024-01-20",
      expiryDate: "2025-01-20",
      grade: "A",
      certificateNumber: "WS-2024-001",
      status: "active"
    },
    {
      id: 2,
      employeeName: "Alice Brown",
      program: "Data Analysis with Python",
      issueDate: "2024-01-10",
      expiryDate: "2026-01-10",
      grade: "B+",
      certificateNumber: "DA-2024-002",
      status: "active"
    },
    {
      id: 3,
      employeeName: "John Smith",
      program: "Leadership Development Program",
      issueDate: "2023-12-15",
      expiryDate: "2025-12-15",
      grade: "A-",
      certificateNumber: "LD-2023-015",
      status: "active"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "upcoming":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "not-started":
        return "bg-gray-100 text-gray-800"
      case "dropped":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "Online":
        return <PlayIcon className="h-4 w-4 text-blue-600" />
      case "In-person":
        return <UserGroupIcon className="h-4 w-4 text-green-600" />
      case "Hybrid":
      case "Blended":
        return <BookOpenIcon className="h-4 w-4 text-purple-600" />
      default:
        return <BookOpenIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const tabs = [
    { id: "programs", name: "Training Programs", icon: AcademicCapIcon },
    { id: "enrollments", name: "Enrollments", icon: UserGroupIcon },
    { id: "certificates", name: "Certificates", icon: TrophyIcon }
  ]

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Training Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">12</h3>
                <p className="text-sm text-gray-500">Active Programs</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Running</span>
                <span className="text-blue-600 font-medium">+2 New</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">387</h3>
                <p className="text-sm text-gray-500">Total Enrollments</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This month</span>
                <span className="text-green-600 font-medium">+15%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">234</h3>
                <p className="text-sm text-gray-500">Completions</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">60% completion rate</span>
                <span className="text-purple-600 font-medium">Good</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">156</h3>
                <p className="text-sm text-gray-500">Certificates Issued</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This year</span>
                <span className="text-yellow-600 font-medium">+23%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "programs" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Training Programs</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Categories</option>
                      <option>Leadership</option>
                      <option>Technical Skills</option>
                      <option>Safety</option>
                      <option>Compliance</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Completed</option>
                      <option>Upcoming</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trainingPrograms.map((program) => (
                    <div key={program.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getFormatIcon(program.format)}
                            <h4 className="font-semibold text-gray-900">{program.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.status)}`}>
                          {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Instructor:</span>
                            <span className="ml-1 text-gray-900">{program.instructor}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-1 text-gray-900">{program.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Format:</span>
                            <span className="ml-1 text-gray-900">{program.format}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-1 text-gray-900">{program.category}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Enrollment</span>
                            <span className="font-medium">{program.enrolled}/{program.capacity}</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {program.status === "active" && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Completion</span>
                              <span className="font-medium">{program.completion}%</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${program.completion}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            {program.certificationAvailable && (
                              <TrophyIcon className="h-4 w-4 text-yellow-500" title="Certification Available" />
                            )}
                            <Link href={`/hr/training/programs/${program.id}`}>
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/hr/training/programs/${program.id}/edit`}>
                              <button className="text-gray-600 hover:text-gray-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "enrollments" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Training Enrollments</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Programs</option>
                      <option>Leadership Development Program</option>
                      <option>Data Analysis with Python</option>
                      <option>Workplace Safety Training</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>In Progress</option>
                      <option>Not Started</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Completion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{enrollment.employeeName}</div>
                            <div className="text-sm text-gray-500">{enrollment.employeeId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {enrollment.program}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    enrollment.progress === 100 ? 'bg-green-500' :
                                    enrollment.progress >= 70 ? 'bg-blue-500' :
                                    enrollment.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{enrollment.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnrollmentStatusColor(enrollment.status)}`}>
                              {enrollment.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(enrollment.enrollDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(enrollment.expectedCompletion).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {enrollment.grade ? (
                              <span className="text-sm font-medium text-gray-900">{enrollment.grade}</span>
                            ) : (
                              <span className="text-sm text-gray-400">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link href={`/hr/training/enrollments/${enrollment.id}`}>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              {enrollment.certificateIssued && (
                                <TrophyIcon className="h-4 w-4 text-yellow-500" title="Certificate Issued" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Training Certificates</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Programs</option>
                      <option>Leadership Development</option>
                      <option>Data Analysis</option>
                      <option>Safety Training</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="bg-white border-2 border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <TrophyIcon className="h-8 w-8 text-yellow-600" />
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          certificate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{certificate.program}</h4>
                          <p className="text-sm text-gray-600">{certificate.employeeName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Grade:</span>
                            <span className="ml-1 font-medium text-gray-900">{certificate.grade}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Certificate #:</span>
                            <span className="ml-1 font-mono text-xs text-gray-900">{certificate.certificateNumber}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Issued:</span>
                            <span className="text-gray-900">{new Date(certificate.issueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expires:</span>
                            <span className="text-gray-900">{new Date(certificate.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <button className="text-sm text-blue-600 hover:text-blue-800">Download PDF</button>
                          <button className="text-sm text-gray-600 hover:text-gray-800">Verify</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
