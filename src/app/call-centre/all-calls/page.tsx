"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  MagnifyingGlassIcon,
  PhoneIcon,
  ClockIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon
} from "@heroicons/react/24/outline";

interface CallRecord {
  id: string
  callNumber: string
  caseNumber: string
  callerName?: string
  callerPhone?: string
  callerProvince?: string
  callerAge?: string
  callerGender?: string
  callerKeyPopulation?: string // Key population field for caller demographics
  callerAddress?: string
  clientName?: string
  clientAge?: string
  clientSex?: string
  clientAddress?: string
  clientProvince?: string
  communicationMode: string
  howDidYouHearAboutUs?: string
  validity: string
  newOrRepeatCall?: string
  language?: string
  callDescription?: string
  purpose: string
  isCase?: string
  perpetrator?: string
  servicesRecommended?: string
  officer: string
  dateTime: string
  duration?: string
  status: string
  referredTo?: string
  voucherIssued: string
  voucherValue?: string
  notes?: string
  comment?: string
}

const statuses = {
  "Completed": { color: "text-green-600 bg-green-100", icon: CheckBadgeIcon },
  "In Progress": { color: "text-yellow-600 bg-yellow-100", icon: ClockIcon },
  "Cancelled": { color: "text-red-600 bg-red-100", icon: ExclamationTriangleIcon }
};

const communicationModes = {
  "Inbound Call": { icon: PhoneArrowDownLeftIcon, color: "text-blue-600" },
  "Outbound Call": { icon: PhoneArrowUpRightIcon, color: "text-green-600" },
  "WhatsApp": { icon: ChatBubbleBottomCenterTextIcon, color: "text-green-500" },
  "Walk-in": { icon: UserIcon, color: "text-purple-600" },
  "Text Message": { icon: ChatBubbleBottomCenterTextIcon, color: "text-gray-600" }
};

export default function AllCallsPage() {
  const { data: session } = useSession();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [showCallDetail, setShowCallDetail] = useState(false);
  const [showEditCall, setShowEditCall] = useState(false);
  const [editingCall, setEditingCall] = useState<CallRecord | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/call-centre/calls');
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }
      const data = await response.json();
      setCalls(data.calls || []);
      setFilteredCalls(data.calls || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setError('Failed to load call records');
    } finally {
      setLoading(false);
    }
  };

  // Status color mapping
  const statusesMap = {
    'OPEN': { color: 'bg-blue-100 text-blue-800', icon: ExclamationTriangleIcon },
    'IN_PROGRESS': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    'RESOLVED': { color: 'bg-green-100 text-green-800', icon: CheckBadgeIcon },
    'CLOSED': { color: 'bg-gray-100 text-gray-800', icon: CheckBadgeIcon },
  };
  const [filters, setFilters] = useState({
    officer: "",
    province: "", 
    status: "",
    validity: "",
    communicationMode: "",
    dateFrom: "",
    dateTo: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Check permissions
  const hasAccess = session?.user?.permissions?.includes("callcentre.access");
  // Call editing should be less restrictive than case editing (for data capturers)
  const canEdit = session?.user?.permissions?.some(permission => 
    ['callcentre.access', 'calls.edit', 'calls.full_access', 'callcentre.officer', 'data_capturer', 'admin'].includes(permission)
  ) || session?.user?.roles?.some(role => 
    ['admin', 'manager', 'advance_user_1', 'call_center_officer', 'data_capturer', 'call_center_agent'].includes(role?.toLowerCase())
  ) || true; // Temporary: Always allow edit for now - remove this in production

  // Debug permissions
  console.log('User permissions:', session?.user?.permissions);
  console.log('User roles:', session?.user?.roles);
  console.log('Can edit:', canEdit);

  useEffect(() => {
    let filtered = calls || [];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(call =>
        call.callerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.callerPhone?.includes(searchTerm) ||
        call.callNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.officer) {
      filtered = filtered.filter(call => call.officer === filters.officer);
    }
    if (filters.province) {
      filtered = filtered.filter(call => call.callerProvince === filters.province);
    }
    if (filters.status) {
      filtered = filtered.filter(call => call.status === filters.status);
    }
    if (filters.validity) {
      filtered = filtered.filter(call => call.validity === filters.validity);
    }
    if (filters.communicationMode) {
      filtered = filtered.filter(call => call.communicationMode === filters.communicationMode);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(call => call.dateTime && call.dateTime >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(call => call.dateTime && call.dateTime <= filters.dateTo + " 23:59:59");
    }

    setFilteredCalls(filtered);
  }, [searchTerm, filters, calls]);

  const getStatusInfo = (status: string) => {
    return statusesMap[status as keyof typeof statusesMap] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: ExclamationTriangleIcon 
    };
  };

  const getCommunicationIcon = (mode: string) => {
    return communicationModes[mode as keyof typeof communicationModes] || {
      icon: PhoneIcon,
      color: "text-gray-600"
    };
  };

  if (!hasAccess) {
    return (
      <ModulePage
        metadata={{
          title: "Call Centre - All Calls",
          description: "Access Denied",
          breadcrumbs: [
            { name: "Call Centre", href: "/call-centre" },
            { name: "All Calls" }
          ]
        }}
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the Call Centre module.
          </p>
        </div>
      </ModulePage>
    );
  }

  const handleDeleteCall = (callId: string) => {
    if (confirm("Are you sure you want to delete this call record?")) {
      setCalls(calls.filter(call => call.id !== callId));
    }
  };

  const clearFilters = () => {
    setFilters({
      officer: "",
      province: "",
      status: "",
      validity: "",
      communicationMode: "",
      dateFrom: "",
      dateTo: ""
    });
    setSearchTerm("");
  };

  return (
    <ModulePage
      metadata={{
        title: "Call Centre - All Calls",
        description: "View and manage all call records",
        breadcrumbs: [
          { name: "Call Centre", href: "/call-centre" },
          { name: "All Calls" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Officer
                  </label>
                  <select
                    value={filters.officer}
                    onChange={(e) => setFilters({ ...filters, officer: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Officers</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Lisa Brown">Lisa Brown</option>
                    <option value="Tom Wilson">Tom Wilson</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province
                  </label>
                  <select
                    value={filters.province}
                    onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Provinces</option>
                    <option value="Western Province">Western Province</option>
                    <option value="Central Province">Central Province</option>
                    <option value="Eastern Province">Eastern Province</option>
                    <option value="Northern Province">Northern Province</option>
                    <option value="Southern Province">Southern Province</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity
                  </label>
                  <select
                    value={filters.validity}
                    onChange={(e) => setFilters({ ...filters, validity: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Validity</option>
                    <option value="Valid">Valid</option>
                    <option value="Invalid">Invalid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Communication Mode
                  </label>
                  <select
                    value={filters.communicationMode}
                    onChange={(e) => setFilters({ ...filters, communicationMode: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Modes</option>
                    <option value="Inbound Call">Inbound Call</option>
                    <option value="Outbound Call">Outbound Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Text Message">Text Message</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calls Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Call Records ({filteredCalls.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Details
                  </th>
                  <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caller Information
                  </th>
                  <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Information
                  </th>
                  <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Communication
                  </th>
                  <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-1/12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="w-16 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-3 text-gray-500">Loading call records...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-red-500">
                        <ExclamationTriangleIcon className="mx-auto h-12 w-12 mb-4" />
                        <p>{error}</p>
                        <button 
                          onClick={fetchCalls}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No call records found
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((call) => {
                    const statusInfo = getStatusInfo(call.status);
                    const commIcon = getCommunicationIcon(call.communicationMode);
                    
                    return (
                      <tr key={call.id} className="hover:bg-gray-50 align-top">
                        <td className="w-1/6 px-3 py-3">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 truncate">{call.callNumber}</div>
                            <div className="text-gray-500 text-xs truncate">{call.id}</div>
                            <div className="text-gray-500 text-xs">{call.dateTime ? new Date(call.dateTime).toLocaleDateString() : 'N/A'}</div>
                            <div className="text-gray-500 text-xs">Duration: {call.duration || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="w-1/6 px-3 py-3">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 truncate">{call.callerName || 'Unknown'}</div>
                            <div className="text-gray-500 text-xs truncate">{call.callerPhone || 'N/A'}</div>
                            <div className="text-gray-500 text-xs truncate">{call.callerProvince || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{call.callerGender || 'N/A'}, {call.callerAge || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="w-1/6 px-3 py-3">
                          <div className="text-sm">
                            {call.clientName ? (
                              <>
                                <div className="font-medium text-gray-900 truncate" title={call.clientName}>
                                  {call.clientName}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {call.clientSex || 'N/A'}, {call.clientAge || 'N/A'}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">Client</div>
                              </>
                            ) : (
                              <div className="text-gray-400 text-xs italic">
                                Same as caller
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="w-1/6 px-3 py-3">
                          <div className="text-sm">
                            <div className="flex items-center mb-1">
                              <commIcon.icon className={`mr-1 h-4 w-4 ${commIcon.color}`} />
                              <span className="font-medium text-gray-900 text-xs truncate">{call.communicationMode}</span>
                            </div>
                            <div className="text-gray-500 text-xs truncate mb-1">{call.purpose}</div>
                            <div className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              call.validity === 'Valid' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                            }`}>
                              {call.validity || 'invalid'}
                            </div>
                          </div>
                        </td>
                        <td className="w-1/6 px-3 py-3">
                          <div className="flex items-center mb-1">
                            <statusInfo.icon className={`mr-1 h-4 w-4 text-gray-400`} />
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                              {call.status}
                            </span>
                          </div>
                          {call.referredTo && call.referredTo !== "N/A" && (
                            <div className="text-xs text-gray-500 mt-1 leading-tight">
                              <div className="font-medium text-gray-600 mb-0.5">→ Referred to:</div>
                              <div 
                                className="break-words overflow-hidden" 
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  maxHeight: '3.6em',
                                  lineHeight: '1.2em'
                                }}
                                title={call.referredTo}
                              >
                                {call.referredTo}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="w-1/12 px-2 py-3 text-sm text-gray-900">
                          <div className="truncate" title={call.officer}>
                            {call.officer}
                          </div>
                        </td>
                        <td className="w-16 px-2 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button 
                              onClick={() => {
                                setSelectedCall(call);
                                setShowCallDetail(true);
                              }}
                              className="text-orange-600 hover:text-orange-700 p-1"
                              title="View Call Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {canEdit && (
                              <>
                                <button 
                                  className="text-indigo-600 hover:text-indigo-900 p-1"
                                  onClick={() => {
                                    setEditingCall(call);
                                    setShowEditCall(true);
                                  }}
                                  title="Edit Call"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCall(call.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Delete Call"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredCalls.length === 0 && (
            <div className="text-center py-12">
              <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No call records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? "Try adjusting your search or filters."
                  : "Get started by recording your first call."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Call Detail Modal */}
      {showCallDetail && selectedCall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowCallDetail(false)}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-saywhat-dark">Call Details - {selectedCall.callNumber}</h3>
              <button
                onClick={() => setShowCallDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Call Information */}
              <div className="bg-saywhat-light-grey rounded-lg p-4">
                <h4 className="text-lg font-semibold text-saywhat-dark mb-4">Call Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Call Number:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.callNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Case Number:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.caseNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date & Time:</span>
                    <span className="ml-2 text-saywhat-dark">{new Date(selectedCall.dateTime).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Officer:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.officer}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Communication Mode:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.communicationMode}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Purpose:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.purpose}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Validity:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      selectedCall.validity === 'Valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCall.validity}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${statuses[selectedCall.status as keyof typeof statuses]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {selectedCall.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Caller Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-saywhat-dark mb-4">Caller's Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.callerName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.callerPhone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Province:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.callerProvince}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Age Group:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.callerAge}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Gender:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.callerGender}</span>
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-saywhat-dark mb-4">Client's Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.clientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.clientAge}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Sex:</span>
                    <span className="ml-2 text-saywhat-dark">{selectedCall.clientSex}</span>
                  </div>
                </div>
              </div>

              {/* Voucher Information */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-saywhat-dark mb-4">Voucher Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Voucher Issued:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      selectedCall.voucherIssued === 'YES' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCall.voucherIssued}
                    </span>
                  </div>
                  {selectedCall.voucherIssued === 'YES' && (
                    <div>
                      <span className="font-medium text-gray-600">Value (USD):</span>
                      <span className="ml-2 text-saywhat-dark font-semibold">${selectedCall.voucherValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Referral and Notes */}
            <div className="mt-6 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-saywhat-dark mb-2">Referral</h4>
                <p className="text-saywhat-dark">{selectedCall.referredTo || 'No referral made'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-saywhat-dark mb-2">Notes</h4>
                <p className="text-saywhat-dark">{selectedCall.notes}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCallDetail(false)}
                className="px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saywhat-orange"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Call Popup */}
      {showEditCall && editingCall && (
        <EditCallPopup 
          call={editingCall}
          onClose={() => {
            setShowEditCall(false);
            setEditingCall(null);
          }}
          onSave={(updatedCall) => {
            // Update the call in the list
            setCalls(calls.map(c => c.id === updatedCall.id ? updatedCall : c));
            setFilteredCalls(filteredCalls.map(c => c.id === updatedCall.id ? updatedCall : c));
            setShowEditCall(false);
            setEditingCall(null);
          }}
        />
      )}
    </ModulePage>
  );
}

// Edit Call Popup Component
interface EditCallPopupProps {
  call: CallRecord;
  onClose: () => void;
  onSave: (updatedCall: CallRecord) => void;
}

function EditCallPopup({ call, onClose, onSave }: EditCallPopupProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Referral dropdown state
  const [referralOrganizations, setReferralOrganizations] = useState<any[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [showOtherReferral, setShowOtherReferral] = useState(false);
  const [otherReferralText, setOtherReferralText] = useState('');
  const [formData, setFormData] = useState({
    // Basic call info
    callerName: call.callerName || '',
    callerPhone: call.callerPhone || '',
    callerProvince: call.callerProvince || '',
    callerAge: call.callerAge || '',
    callerGender: call.callerGender || '',
    callerKeyPopulation: call.callerKeyPopulation || 'N/A',
    callerAddress: call.callerAddress || '',
    
    // Client info
    clientName: call.clientName || '',
    clientAge: call.clientAge || '',
    clientSex: call.clientSex || '',
    clientAddress: call.clientAddress || '',
    clientProvince: call.clientProvince || '',
    
    // Call details
    communicationMode: call.communicationMode || 'inbound',
    howDidYouHearAboutUs: call.howDidYouHearAboutUs || '',
    validity: call.validity || 'valid',
    newOrRepeatCall: call.newOrRepeatCall || 'new',
    language: call.language || 'English',
    callDescription: call.callDescription || '',
    purpose: call.purpose || '',
    isCase: call.isCase || 'NO',
    perpetrator: call.perpetrator || '',
    servicesRecommended: call.servicesRecommended || '',
    status: call.status || 'OPEN',
    referredTo: call.referredTo || '',
    notes: call.notes || '',
    comment: call.comment || '',
    duration: call.duration || '',
    
    // Voucher info
    voucherIssued: call.voucherIssued || 'NO',
    voucherValue: call.voucherValue || ''
  });

  // Fetch referral organizations
  const fetchReferralOrganizations = useCallback(async () => {
    setReferralLoading(true);
    try {
      const response = await fetch('/api/call-centre/referrals');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.organizations)) {
          setReferralOrganizations(data.organizations);
        }
      } else {
        console.error('Failed to fetch referral organizations');
      }
    } catch (error) {
      console.error('Error fetching referral organizations:', error);
    } finally {
      setReferralLoading(false);
    }
  }, []);

  // Load referral organizations on mount
  useEffect(() => {
    fetchReferralOrganizations();
  }, [fetchReferralOrganizations]);

  // Handle referral selection
  const handleReferralChange = (value: string) => {
    if (value === 'OTHER') {
      setShowOtherReferral(true);
      setFormData(prev => ({ ...prev, referredTo: '' }));
    } else {
      setShowOtherReferral(false);
      setOtherReferralText('');
      setFormData(prev => ({ ...prev, referredTo: value }));
    }
  };

  const handleOtherReferralChange = (value: string) => {
    setOtherReferralText(value);
    setFormData(prev => ({ ...prev, referredTo: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/call-centre/calls/${call.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update call');
      }

      const result = await response.json();
      
      // Create updated call object
      const updatedCall: CallRecord = {
        ...call,
        callerName: formData.callerName,
        callerPhone: formData.callerPhone,
        callerProvince: formData.callerProvince,
        callerAge: formData.callerAge,
        callerGender: formData.callerGender,
        callerKeyPopulation: formData.callerKeyPopulation,
        callerAddress: formData.callerAddress,
        clientName: formData.clientName,
        clientAge: formData.clientAge,
        clientSex: formData.clientSex,
        clientAddress: formData.clientAddress,
        clientProvince: formData.clientProvince,
        communicationMode: formData.communicationMode,
        howDidYouHearAboutUs: formData.howDidYouHearAboutUs,
        validity: formData.validity,
        newOrRepeatCall: formData.newOrRepeatCall,
        language: formData.language,
        callDescription: formData.callDescription,
        purpose: formData.purpose,
        isCase: formData.isCase,
        perpetrator: formData.perpetrator,
        servicesRecommended: formData.servicesRecommended,
        status: formData.status,
        referredTo: formData.referredTo,
        notes: formData.notes,
        comment: formData.comment,
        duration: formData.duration,
        voucherIssued: formData.voucherIssued,
        voucherValue: formData.voucherValue
      };

      onSave(updatedCall);
    } catch (error) {
      console.error('Error updating call:', error);
      alert('Failed to update call. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Call Record</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Call Number: {call.callNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Caller Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Caller Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caller Name</label>
                <input
                  type="text"
                  value={formData.callerName}
                  onChange={(e) => setFormData({...formData, callerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.callerPhone}
                  onChange={(e) => setFormData({...formData, callerPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  value={formData.callerProvince}
                  onChange={(e) => setFormData({...formData, callerProvince: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="N/A">Select Province</option>
                  <option value="Harare">Harare</option>
                  <option value="Bulawayo">Bulawayo</option>
                  <option value="Manicaland">Manicaland</option>
                  <option value="Mashonaland Central">Mashonaland Central</option>
                  <option value="Mashonaland East">Mashonaland East</option>
                  <option value="Mashonaland West">Mashonaland West</option>
                  <option value="Masvingo">Masvingo</option>
                  <option value="Matabeleland North">Matabeleland North</option>
                  <option value="Matabeleland South">Matabeleland South</option>
                  <option value="Midlands">Midlands</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select
                  value={formData.callerAge}
                  onChange={(e) => setFormData({...formData, callerAge: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="-14">Under 14</option>
                  <option value="15-19">15-19</option>
                  <option value="20-24">20-24</option>
                  <option value="25-29">25-29</option>
                  <option value="30-34">30-34</option>
                  <option value="35-39">35-39</option>
                  <option value="40-44">40-44</option>
                  <option value="45-49">45-49</option>
                  <option value="50+">50+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.callerGender}
                  onChange={(e) => setFormData({...formData, callerGender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="N/A">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Population</label>
                <select
                  value={formData.callerKeyPopulation}
                  onChange={(e) => setFormData({...formData, callerKeyPopulation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Child">Child</option>
                  <option value="Young Person">Young Person</option>
                  <option value="Adult">Adult</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.callerAddress}
                  onChange={(e) => setFormData({...formData, callerAddress: e.target.value})}
                  placeholder="Caller's address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information (if different from caller)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Leave empty if same as caller"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Age</label>
                <input
                  type="text"
                  value={formData.clientAge}
                  onChange={(e) => setFormData({...formData, clientAge: e.target.value})}
                  placeholder="e.g., 25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Sex</label>
                <select
                  value={formData.clientSex}
                  onChange={(e) => setFormData({...formData, clientSex: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="N/A">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Province</label>
                <select
                  value={formData.clientProvince}
                  onChange={(e) => setFormData({...formData, clientProvince: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="N/A">Select Province</option>
                  <option value="Harare">Harare</option>
                  <option value="Bulawayo">Bulawayo</option>
                  <option value="Manicaland">Manicaland</option>
                  <option value="Mashonaland Central">Mashonaland Central</option>
                  <option value="Mashonaland East">Mashonaland East</option>
                  <option value="Mashonaland West">Mashonaland West</option>
                  <option value="Masvingo">Masvingo</option>
                  <option value="Matabeleland North">Matabeleland North</option>
                  <option value="Matabeleland South">Matabeleland South</option>
                  <option value="Midlands">Midlands</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                  placeholder="Client's address (if different from caller)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Call Details */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Communication Mode</label>
                <select
                  value={formData.communicationMode}
                  onChange={(e) => setFormData({...formData, communicationMode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How Did You Hear About Us</label>
                <input
                  type="text"
                  value={formData.howDidYouHearAboutUs}
                  onChange={(e) => setFormData({...formData, howDidYouHearAboutUs: e.target.value})}
                  placeholder="e.g., Radio, TV, Friend referral..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Validity</label>
                <select
                  value={formData.validity}
                  onChange={(e) => setFormData({...formData, validity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New or Repeat Call</label>
                <select
                  value={formData.newOrRepeatCall}
                  onChange={(e) => setFormData({...formData, newOrRepeatCall: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="new">New</option>
                  <option value="repeat">Repeat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="English">English</option>
                  <option value="Shona">Shona</option>
                  <option value="Ndebele">Ndebele</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="HIV/AIDS">HIV/AIDS</option>
                  <option value="Information and Counselling">Information and Counselling</option>
                  <option value="In-house Case">In-house Case</option>
                  <option value="Cancer Screening">Cancer Screening</option>
                  <option value="Child Protection">Child Protection</option>
                  <option value="Contraception">Contraception</option>
                  <option value="DSA">DSA</option>
                  <option value="Dropped Call">Dropped Call</option>
                  <option value="GBV">GBV</option>
                  <option value="Legal Assistance">Legal Assistance</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="MHM">MHM</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Prank Call">Prank Call</option>
                  <option value="PrEP & PEP">PrEP & PEP</option>
                  <option value="Pre & Post Natal Care">Pre & Post Natal Care</option>
                  <option value="Relationship Issues">Relationship Issues</option>
                  <option value="Reproductive System Disorders">Reproductive System Disorders</option>
                  <option value="PAC">PAC</option>
                  <option value="STIs">STIs</option>
                  <option value="Sexual Harassment">Sexual Harassment</option>
                  <option value="TB">TB</option>
                  <option value="Test Call">Test Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 5 min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Description</label>
                <textarea
                  value={formData.callDescription}
                  onChange={(e) => setFormData({...formData, callDescription: e.target.value})}
                  rows={3}
                  placeholder="Describe the caller's inquiry or concern..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Is this a Case?</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCase"
                      value="YES"
                      checked={formData.isCase === 'YES'}
                      onChange={(e) => setFormData({...formData, isCase: e.target.value})}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm">YES</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isCase"
                      value="NO"
                      checked={formData.isCase === 'NO'}
                      onChange={(e) => setFormData({...formData, isCase: e.target.value})}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm">NO</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perpetrator</label>
                <input
                  type="text"
                  value={formData.perpetrator}
                  onChange={(e) => setFormData({...formData, perpetrator: e.target.value})}
                  placeholder="If relevant to the case"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services Recommended</label>
                <input
                  type="text"
                  value={formData.servicesRecommended}
                  onChange={(e) => setFormData({...formData, servicesRecommended: e.target.value})}
                  placeholder="Services provided or recommended"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral</label>
                <select
                  value={showOtherReferral ? 'OTHER' : formData.referredTo}
                  onChange={(e) => handleReferralChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={referralLoading}
                >
                  <option value="">Select organization or service...</option>
                  {referralLoading ? (
                    <option value="">Loading organizations...</option>
                  ) : (
                    <>
                      {referralOrganizations.map((org) => (
                        <option key={org.id} value={org.name}>
                          {org.name} {org.category && `(${org.category})`}
                        </option>
                      ))}
                      <option value="OTHER">Other (specify below)</option>
                    </>
                  )}
                </select>
                
                {/* Show organization details when selected */}
                {formData.referredTo && !showOtherReferral && (
                  (() => {
                    const selectedOrg = referralOrganizations.find(org => org.name === formData.referredTo);
                    return selectedOrg ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>{selectedOrg.name}</strong>
                          {selectedOrg.contact?.phone && (
                            <span className="block text-xs mt-1">
                              📞 {selectedOrg.contact.phone}
                            </span>
                          )}
                          {selectedOrg.contact?.email && (
                            <span className="block text-xs">
                              📧 {selectedOrg.contact.email}
                            </span>
                          )}
                          {selectedOrg.focusAreas && selectedOrg.focusAreas.length > 0 && (
                            <span className="block text-xs mt-1">
                              <strong>Focus:</strong> {selectedOrg.focusAreas.join(', ')}
                            </span>
                          )}
                        </p>
                      </div>
                    ) : null;
                  })()
                )}

                {/* Other referral text input */}
                {showOtherReferral && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={otherReferralText}
                      onChange={(e) => handleOtherReferralChange(e.target.value)}
                      placeholder="Please specify the referral organization or service..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voucher Information */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voucher Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Issued</label>
                <select
                  value={formData.voucherIssued}
                  onChange={(e) => setFormData({...formData, voucherIssued: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Value</label>
                <input
                  type="text"
                  value={formData.voucherValue}
                  onChange={(e) => setFormData({...formData, voucherValue: e.target.value})}
                  placeholder="e.g., 50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Comments</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Additional notes about the call..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  rows={3}
                  placeholder="Additional comments or notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
