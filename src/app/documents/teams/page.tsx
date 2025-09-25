"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  CloudArrowDownIcon,
  LinkIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarIcon,
  FolderIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface TeamsFile {
  id: string;
  name: string;
  size: string;
  modifiedDateTime: string;
  modifiedBy: string;
  webUrl: string;
  downloadUrl: string;
  parentFolder: string;
  teamName: string;
  channelName: string;
  classification: string;
}

export default function TeamsIntegrationPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<TeamsFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState<any[]>([]);

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("documents.teams") ||
                   session?.user?.permissions?.includes("documents.external_platforms") ||
                   session?.user?.permissions?.includes("documents.full_access");

  const loadTeams = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual Microsoft Graph API integration
      const mockTeams = [
        { id: '1', displayName: 'SAYWHAT Development Team', description: 'Main development team' },
        { id: '2', displayName: 'Project Management', description: 'Project coordination team' },
        { id: '3', displayName: 'Executive Board', description: 'Executive decision making' },
      ];
      
      setTeams(mockTeams);
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamFiles = async (teamId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Simulated API call - replace with actual Microsoft Graph API integration
      const mockFiles: TeamsFile[] = [
        {
          id: '1',
          name: 'Project Timeline 2025.xlsx',
          size: '2.3 MB',
          modifiedDateTime: '2025-09-20T10:30:00Z',
          modifiedBy: 'John Doe',
          webUrl: 'https://teams.microsoft.com/l/file/...',
          downloadUrl: 'https://api.teams.com/download/...',
          parentFolder: 'General',
          teamName: 'SAYWHAT Development Team',
          channelName: 'General',
          classification: 'CONFIDENTIAL'
        },
        {
          id: '2',
          name: 'Meeting Notes - September.docx',
          size: '856 KB',
          modifiedDateTime: '2025-09-18T14:15:00Z',
          modifiedBy: 'Jane Smith',
          webUrl: 'https://teams.microsoft.com/l/file/...',
          downloadUrl: 'https://api.teams.com/download/...',
          parentFolder: 'Meetings',
          teamName: 'SAYWHAT Development Team',
          channelName: 'General',
          classification: 'PUBLIC'
        },
        {
          id: '3',
          name: 'Budget Report Q3.pdf',
          size: '1.8 MB',
          modifiedDateTime: '2025-09-15T09:45:00Z',
          modifiedBy: 'Michael Johnson',
          webUrl: 'https://teams.microsoft.com/l/file/...',
          downloadUrl: 'https://api.teams.com/download/...',
          parentFolder: 'Finance',
          teamName: 'Executive Board',
          channelName: 'Finance',
          classification: 'SECRET'
        }
      ];

      // Filter files based on selected team
      const teamFiles = teamId === '' ? mockFiles : mockFiles.filter(file => 
        file.teamName.includes('Development') && teamId === '1' ||
        file.teamName.includes('Project') && teamId === '2' ||
        file.teamName.includes('Executive') && teamId === '3'
      );

      setFiles(teamFiles);
    } catch (err) {
      setError('Failed to load team files');
    } finally {
      setLoading(false);
    }
  };

  const linkToRepository = async (file: TeamsFile) => {
    try {
      // API call to create a link in our document repository
      const response = await fetch('/api/documents/external-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: file.name,
          externalUrl: file.webUrl,
          downloadUrl: file.downloadUrl,
          classification: file.classification,
          source: 'teams',
          sourceId: file.id,
          metadata: {
            teamName: file.teamName,
            channelName: file.channelName,
            parentFolder: file.parentFolder,
            modifiedBy: file.modifiedBy,
            modifiedDateTime: file.modifiedDateTime
          }
        }),
      });

      if (response.ok) {
        alert('File linked to document repository successfully!');
      } else {
        throw new Error('Failed to link file');
      }
    } catch (err) {
      alert('Error linking file to repository');
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'PUBLIC':
        return 'bg-green-100 text-green-800';
      case 'CONFIDENTIAL':
        return 'bg-orange-100 text-orange-800';
      case 'SECRET':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadTeams();
      loadTeamFiles('');
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Microsoft Teams Integration",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Documents", href: "/documents" },
            { name: "Teams Integration" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access Teams integration.
          </p>
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage
      metadata={{
        title: "Microsoft Teams Integration",
        description: "Access and link files from Microsoft Teams channels",
        breadcrumbs: [
          { name: "Documents", href: "/documents" },
          { name: "Teams Integration" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-sm">
          <div className="px-6 py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">Microsoft Teams</h1>
                <p className="text-purple-100">
                  Access files from Teams channels and link them to your document repository
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Selector */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Select Team
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSelectedTeam('');
                  loadTeamFiles('');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === '' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <FolderIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900">All Teams</p>
                  <p className="text-xs text-gray-500">Show all accessible files</p>
                </div>
              </button>

              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    setSelectedTeam(team.id);
                    loadTeamFiles(team.id);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTeam === team.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <UserGroupIcon className="mx-auto h-8 w-8 text-purple-500" />
                    <p className="mt-2 text-sm font-medium text-gray-900">{team.displayName}</p>
                    <p className="text-xs text-gray-500">{team.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Team Files
            </h3>
            <button
              onClick={() => selectedTeam ? loadTeamFiles(selectedTeam) : loadTeamFiles('')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading Teams files...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Files</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => selectedTeam ? loadTeamFiles(selectedTeam) : loadTeamFiles('')}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Try again
                </button>
              </div>
            ) : files.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                <p className="mt-1 text-sm text-gray-500">No files available in the selected team(s).</p>
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(file.classification)}`}>
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            {file.classification}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {file.teamName} → {file.channelName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {file.size} • Modified by {file.modifiedBy}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(file.modifiedDateTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={file.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-600 p-1 rounded-md hover:bg-purple-50 transition-colors"
                        title="Open in Teams"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      </a>
                      <a
                        href={file.downloadUrl}
                        className="text-gray-400 hover:text-purple-600 p-1 rounded-md hover:bg-purple-50 transition-colors"
                        title="Download file"
                      >
                        <CloudArrowDownIcon className="h-5 w-5" />
                      </a>
                      <button
                        onClick={() => linkToRepository(file)}
                        className="text-gray-400 hover:text-saywhat-orange p-1 rounded-md hover:bg-orange-50 transition-colors"
                        title="Link to document repository"
                      >
                        <LinkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Teams Integration</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This integration allows you to browse and link files from Microsoft Teams channels directly into your SIRTIS document repository. 
                  Files remain in Teams but are accessible through the unified document interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
