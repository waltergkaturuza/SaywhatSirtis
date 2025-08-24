'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { 
  ShareIcon, 
  FolderIcon, 
  DocumentIcon, 
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
  MagnifyingGlassIcon as SearchIcon,
  PlusIcon as AddIcon
} from '@heroicons/react/24/outline'
import { 
  FolderIcon as FolderIconSolid,
  DocumentIcon as DocumentIconSolid,
} from '@heroicons/react/24/solid'

export default function SharePointPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [sites, setSites] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [sharePermissions, setSharePermissions] = useState<'view' | 'edit' | 'admin'>('view')
  const [shareWith, setShareWith] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedItemForShare, setSelectedItemForShare] = useState<any>(null)

  const handleSiteSelect = (siteId: string) => {
    setSelectedSite(siteId)
    setCurrentPath('/')
    // Load site content
  }

  const handleFileAction = (action: string, fileId: string) => {
    console.log(`${action} on file ${fileId}`)
  }

  const handleShare = (item: any) => {
    setSelectedItemForShare(item)
    setShowShareModal(true)
  }

  const handleUpload = () => {
    setShowUploadModal(true)
  }

  const handleNewFolder = () => {
    setShowNewFolderModal(true)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <FolderIconSolid className="w-8 h-8 text-blue-500" />
      case 'document':
        return <DocumentIconSolid className="w-8 h-8 text-blue-600" />
      case 'spreadsheet':
        return <DocumentIconSolid className="w-8 h-8 text-green-600" />
      default:
        return <DocumentIconSolid className="w-8 h-8 text-gray-500" />
    }
  }

  const getPermissionBadge = (permission: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      edit: 'bg-yellow-100 text-yellow-800',
      view: 'bg-green-100 text-green-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[permission as keyof typeof colors]}`}>
        {permission}
      </span>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please sign in to access SharePoint integration.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SharePoint Integration</h1>
            <p className="text-gray-600">Access and manage your SharePoint sites and documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUpload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Upload
            </button>
            <button
              onClick={handleNewFolder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Folder
            </button>
          </div>
        </div>

        {/* Sites Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
                selectedSite === site.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleSiteSelect(site.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{site.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-500">{site.description}</p>
                  </div>
                </div>
                {getPermissionBadge(site.permissions)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{site.members}</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{site.storage.used}GB</div>
                  <div className="text-xs text-gray-500">of {site.storage.total}GB</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Modified {site.lastModified.toLocaleDateString()}</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* File Browser */}
        {selectedSite && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {sites.find(s => s.id === selectedSite)?.name || 'SharePoint'} - Documents
                </h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <SearchIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Current path: {currentPath}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">
                              {file.tags && file.tags.map((tag: string) => (
                                <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.modified.toLocaleDateString()}
                        <div className="text-xs text-gray-500">by {file.modifiedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleShare(file)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ShareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFileAction('download', file.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <DocumentIcon className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium">Create Document</span>
            </button>
            <button className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FolderIcon className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="text-sm font-medium">New Folder</span>
            </button>
            <button className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ShareIcon className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium">Share Link</span>
            </button>
            <button className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ShieldCheckIcon className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium">Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
