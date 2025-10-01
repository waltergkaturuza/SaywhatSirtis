"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
  clientName?: string
  clientAge?: string
  clientSex?: string
  communicationMode: string
  purpose: string
  validity: string
  officer: string
  dateTime: string
  duration?: string
  status: string
  referredTo?: string
  voucherIssued: string
  voucherValue?: string
  notes?: string
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
  const canEdit = session?.user?.permissions?.includes("callcentre.officer");

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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caller Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Communication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-3 text-gray-500">Loading call records...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No call records found
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((call) => {
                    const statusInfo = getStatusInfo(call.status);
                    const commIcon = getCommunicationIcon(call.communicationMode);
                    
                    return (
                      <tr key={call.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{call.callNumber}</div>
                            <div className="text-gray-500">{call.id}</div>
                            <div className="text-gray-500">{call.dateTime ? new Date(call.dateTime).toLocaleString() : 'N/A'}</div>
                            <div className="text-gray-500">Duration: {call.duration || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{call.callerName || 'Unknown'}</div>
                            <div className="text-gray-500">{call.callerPhone || 'N/A'}</div>
                            <div className="text-gray-500">{call.callerProvince || 'N/A'}</div>
                            <div className="text-gray-500">{call.callerGender || 'N/A'}, {call.callerAge || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            <commIcon.icon className={`mr-2 h-5 w-5 ${commIcon.color}`} />
                            <div>
                              <div className="font-medium text-gray-900">{call.communicationMode}</div>
                              <div className="text-gray-500">{call.purpose}</div>
                              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                call.validity === 'Valid' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                              }`}>
                                {call.validity || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <statusInfo.icon className={`mr-2 h-5 w-5`} />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                              {call.status}
                            </span>
                          </div>
                          {call.referredTo && call.referredTo !== "N/A" && (
                            <div className="text-xs text-gray-500 mt-1">
                              Referred to: {call.referredTo}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.officer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedCall(call);
                                setShowCallDetail(true);
                              }}
                              className="text-orange-600 hover:text-orange-700"
                              title="View Call Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {canEdit && (
                              <>
                                <button 
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    // Navigate to edit page
                                    window.location.href = `/call-centre/cases/${call.id}/edit`;
                                  }}
                                  title="Edit Call"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCall(call.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-5 w-5" />
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
    </ModulePage>
  );
}
