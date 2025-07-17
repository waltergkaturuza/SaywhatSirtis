"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState } from "react"
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  EyeIcon,
  HeartIcon
} from "@heroicons/react/24/outline"

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const metadata = {
    title: "Help & Support Center",
    description: "Comprehensive help center with AI-powered assistance",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "Help Center" }
    ]
  }

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Support</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">AI Assistant</div>
              <div className="text-xs">Get instant answers</div>
            </div>
          </button>
          
          <button className="w-full flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <PhoneIcon className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Call Support</div>
              <div className="text-xs">24/7 available</div>
            </div>
          </button>
          
          <button className="w-full flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <EnvelopeIcon className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Email Support</div>
              <div className="text-xs">Response in 2-4 hrs</div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Stats</h3>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-blue-600">98.5%</div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">2.3 hrs</div>
            <div className="text-sm text-gray-600">Avg. Response Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">4.8/5</div>
            <div className="text-sm text-gray-600">Satisfaction Score</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Articles</h3>
        <div className="space-y-2">
          <a href="#" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Getting Started Guide
          </a>
          <a href="#" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            User Account Management
          </a>
          <a href="#" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Troubleshooting Login Issues
          </a>
          <a href="#" className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Data Security & Privacy
          </a>
        </div>
      </div>
    </div>
  )

  const helpTabs = [
    { id: "overview", name: "Overview", icon: QuestionMarkCircleIcon },
    { id: "guides", name: "User Guides", icon: BookOpenIcon },
    { id: "tutorials", name: "Video Tutorials", icon: VideoCameraIcon },
    { id: "faq", name: "FAQ", icon: ChatBubbleLeftRightIcon },
    { id: "documentation", name: "Documentation", icon: DocumentTextIcon },
    { id: "training", name: "Training", icon: AcademicCapIcon },
    { id: "contact", name: "Contact Support", icon: PhoneIcon }
  ]

  const quickActions = [
    {
      title: "Getting Started",
      description: "Complete setup guide for new users",
      icon: PlayIcon,
      color: "blue",
      estimatedTime: "15 min",
      href: "/help/getting-started"
    },
    {
      title: "User Manual",
      description: "Comprehensive platform documentation",
      icon: BookOpenIcon,
      color: "green",
      estimatedTime: "45 min",
      href: "/help/user-manual"
    },
    {
      title: "Video Training",
      description: "Interactive video tutorials",
      icon: VideoCameraIcon,
      color: "purple",
      estimatedTime: "30 min",
      href: "/help/video-training"
    },
    {
      title: "Contact Support",
      description: "Get personalized assistance",
      icon: ChatBubbleLeftRightIcon,
      color: "orange",
      estimatedTime: "2-4 hrs",
      href: "/help/contact"
    }
  ]

  const userGuides = [
    {
      id: 1,
      title: "Dashboard Navigation",
      description: "Learn how to navigate and customize your dashboard",
      category: "Getting Started",
      readTime: "5 min",
      difficulty: "Beginner",
      views: 2847,
      rating: 4.8,
      lastUpdated: "2024-01-10"
    },
    {
      id: 2,
      title: "Program Management",
      description: "Complete guide to managing programs and projects",
      category: "Programs",
      readTime: "15 min",
      difficulty: "Intermediate",
      views: 1956,
      rating: 4.9,
      lastUpdated: "2024-01-08"
    },
    {
      id: 3,
      title: "Call Centre Operations",
      description: "Handle calls, cases, and customer interactions",
      category: "Call Centre",
      readTime: "12 min",
      difficulty: "Intermediate",
      views: 1634,
      rating: 4.7,
      lastUpdated: "2024-01-05"
    },
    {
      id: 4,
      title: "HR Management Guide",
      description: "Manage employees, payroll, and performance tracking",
      category: "HR",
      readTime: "20 min",
      difficulty: "Advanced",
      views: 1123,
      rating: 4.6,
      lastUpdated: "2024-01-03"
    },
    {
      id: 5,
      title: "Document Management",
      description: "Organize, share, and collaborate on documents",
      category: "Documents",
      readTime: "10 min",
      difficulty: "Beginner",
      views: 1456,
      rating: 4.8,
      lastUpdated: "2024-01-02"
    },
    {
      id: 6,
      title: "Analytics & Reporting",
      description: "Generate insights and custom reports",
      category: "Analytics",
      readTime: "18 min",
      difficulty: "Advanced",
      views: 923,
      rating: 4.9,
      lastUpdated: "2023-12-28"
    }
  ]

  const videoTutorials = [
    {
      id: 1,
      title: "SIRTIS Platform Overview",
      description: "Complete introduction to all platform features",
      duration: "8:34",
      category: "Overview",
      views: 3245,
      thumbnail: "/api/placeholder/320/180"
    },
    {
      id: 2,
      title: "Setting Up Your First Program",
      description: "Step-by-step program creation walkthrough",
      duration: "12:15",
      category: "Programs",
      views: 2156,
      thumbnail: "/api/placeholder/320/180"
    },
    {
      id: 3,
      title: "Call Centre Best Practices",
      description: "Effective call handling and case management",
      duration: "15:42",
      category: "Call Centre",
      views: 1834,
      thumbnail: "/api/placeholder/320/180"
    },
    {
      id: 4,
      title: "Advanced Analytics Features",
      description: "Create custom dashboards and reports",
      duration: "18:23",
      category: "Analytics",
      views: 1567,
      thumbnail: "/api/placeholder/320/180"
    }
  ]

  const faqCategories = [
    {
      category: "General",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "You can reset your password by clicking the 'Forgot Password' link on the login page, or by contacting your system administrator."
        },
        {
          question: "Can I access SIRTIS on mobile devices?",
          answer: "Yes, SIRTIS is fully responsive and optimized for mobile devices. You can access it through any modern web browser."
        },
        {
          question: "How often is data backed up?",
          answer: "Data is automatically backed up every 6 hours with additional real-time replication for critical data."
        }
      ]
    },
    {
      category: "Programs",
      questions: [
        {
          question: "How do I create a new program?",
          answer: "Navigate to Programs > Create New, fill in the required information including objectives, budget, and timeline, then submit for approval."
        },
        {
          question: "Can I track program performance in real-time?",
          answer: "Yes, the platform provides real-time analytics and performance tracking for all active programs through the Analytics module."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          question: "What browsers are supported?",
          answer: "SIRTIS supports all modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+."
        },
        {
          question: "Is there an API available?",
          answer: "Yes, we provide a comprehensive REST API for integration with external systems. Contact support for API documentation."
        }
      ]
    }
  ]

  const filteredGuides = userGuides.filter(guide => 
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ModulePage
      metadata={metadata}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Help Center Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">How can we help you today?</h1>
              <p className="text-blue-100">Find answers, guides, and get support for the SIRTIS platform</p>
            </div>
            <SparklesIcon className="h-16 w-16 text-white opacity-30" />
          </div>
          
          {/* AI-Powered Search */}
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask AI Assistant anything about SIRTIS..."
              className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-25"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                <SparklesIcon className="h-3 w-3" />
                <span>AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${action.color}-100 mb-4`}>
                <action.icon className={`h-6 w-6 text-${action.color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {action.estimatedTime}
                </span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Help Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap">
              {helpTabs.map((tab) => (
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
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <BookOpenIcon className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">User Guides</h3>
                    <p className="text-sm text-gray-600 mb-4">Step-by-step instructions for all platform features</p>
                    <span className="text-sm text-blue-600">24 guides available</span>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <VideoCameraIcon className="h-8 w-8 text-green-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
                    <p className="text-sm text-gray-600 mb-4">Interactive video training sessions</p>
                    <span className="text-sm text-green-600">12 videos available</span>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
                    <p className="text-sm text-gray-600 mb-4">Get instant answers to your questions</p>
                    <span className="text-sm text-purple-600">Available 24/7</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Analytics Guide Added</p>
                        <p className="text-sm text-gray-500">Comprehensive guide for advanced analytics features - 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <VideoCameraIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Video Tutorial Updated</p>
                        <p className="text-sm text-gray-500">Call Centre best practices video refreshed - 5 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <QuestionMarkCircleIcon className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">FAQ Section Expanded</p>
                        <p className="text-sm text-gray-500">Added 15 new frequently asked questions - 1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "guides" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">User Guides</h3>
                  <div className="flex items-center space-x-3">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Categories</option>
                      <option>Getting Started</option>
                      <option>Programs</option>
                      <option>Call Centre</option>
                      <option>HR</option>
                      <option>Analytics</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Levels</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredGuides.map((guide) => (
                    <div key={guide.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {guide.difficulty}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                          {guide.rating}
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{guide.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {guide.readTime}
                        </span>
                        <span className="flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          {guide.views} views
                        </span>
                        <span>Updated {guide.lastUpdated}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {guide.category}
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-900 font-medium">
                          Read Guide →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "tutorials" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Video Tutorials</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    Request Tutorial
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials.map((video) => (
                    <div key={video.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <PlayIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{video.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {video.category}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <EyeIcon className="h-3 w-3 mr-1" />
                            {video.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    Ask Question
                  </button>
                </div>

                <div className="space-y-6">
                  {faqCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">{category.category}</h4>
                      <div className="space-y-4">
                        {category.questions.map((faq, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                            <h5 className="font-medium text-gray-900 mb-2">{faq.question}</h5>
                            <p className="text-sm text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "documentation" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Technical Documentation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "API Reference", description: "Complete API documentation and examples", icon: ComputerDesktopIcon, type: "Technical" },
                    { title: "System Architecture", description: "Platform architecture and infrastructure overview", icon: GlobeAltIcon, type: "Technical" },
                    { title: "Security Guidelines", description: "Security best practices and compliance", icon: QuestionMarkCircleIcon, type: "Security" },
                    { title: "Integration Guide", description: "Third-party integrations and webhooks", icon: DocumentTextIcon, type: "Integration" },
                    { title: "Mobile App Guide", description: "Mobile application setup and usage", icon: DevicePhoneMobileIcon, type: "Mobile" },
                    { title: "Troubleshooting", description: "Common issues and solutions", icon: QuestionMarkCircleIcon, type: "Support" }
                  ].map((doc, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <doc.icon className="h-8 w-8 text-blue-600 mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {doc.type}
                        </span>
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "training" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Training Programs</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    Enroll Now
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "SIRTIS Foundation Course",
                      description: "Complete introduction to SIRTIS platform for new users",
                      duration: "2 hours",
                      modules: 8,
                      difficulty: "Beginner",
                      enrolled: 245
                    },
                    {
                      title: "Advanced Analytics Training",
                      description: "Deep dive into analytics, reporting, and data visualization",
                      duration: "4 hours",
                      modules: 12,
                      difficulty: "Advanced",
                      enrolled: 89
                    },
                    {
                      title: "Program Management Masterclass",
                      description: "Best practices for program planning and execution",
                      duration: "3 hours",
                      modules: 10,
                      difficulty: "Intermediate",
                      enrolled: 156
                    },
                    {
                      title: "System Administration Training",
                      description: "Complete system setup, configuration, and maintenance",
                      duration: "6 hours",
                      modules: 15,
                      difficulty: "Advanced",
                      enrolled: 34
                    }
                  ].map((course, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.difficulty}
                        </span>
                        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {course.duration}
                        </div>
                        <div className="flex items-center">
                          <BookOpenIcon className="h-3 w-3 mr-1" />
                          {course.modules} modules
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="h-3 w-3 mr-1" />
                          {course.enrolled} enrolled
                        </div>
                      </div>
                      
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Start Learning
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <PhoneIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Phone Support</h4>
                    <p className="text-sm text-gray-600 mb-4">Speak directly with our support team</p>
                    <p className="text-sm font-medium text-blue-600">+234 803 123 4567</p>
                    <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <EnvelopeIcon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-4">Send us detailed questions or feedback</p>
                    <p className="text-sm font-medium text-green-600">support@saywhat.org</p>
                    <p className="text-xs text-gray-500 mt-1">Response within 2-4 hours</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
                    <p className="text-sm text-gray-600 mb-4">Get instant help through live chat</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">
                      Start Chat
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Usually responds instantly</p>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Submit Support Request</h4>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Brief description of your issue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please provide detailed information about your issue..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <PlusIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Drag and drop files here, or click to browse
                        </p>
                      </div>
                    </div>
                    
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700">
                      Submit Request
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModulePage>
  )
}
