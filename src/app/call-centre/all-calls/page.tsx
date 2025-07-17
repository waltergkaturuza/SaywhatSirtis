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

// Sample call data
const callData = [
  {
    id: "CALL-001",
    caseNumber: "CASE-2024-001",
    callerName: "Maria Santos",
    callerPhone: "+1-555-0123",
    callerProvince: "Western Province",
    callerAge: "25-30",
    callerGender: "Female",
    communicationMode: "Inbound Call",
    purpose: "ARV Therapy Inquiry",
    validity: "Valid",
    officer: "John Doe",
    dateTime: "2024-01-15 09:30:00",
    duration: "12:45",
    status: "Completed",
    referredTo: "Health Clinic",
    notes: "Provided information about ARV therapy schedule and nearest clinic location."
  },
  {
    id: "CALL-002", 
    caseNumber: "CASE-2024-002",
    callerName: "David Mwale",
    callerPhone: "+1-555-0124",
    callerProvince: "Central Province",
    callerAge: "40-45",
    callerGender: "Male",
    communicationMode: "Outbound Call",
    purpose: "Follow-up Visit",
    validity: "Valid",
    officer: "Jane Smith",
    dateTime: "2024-01-15 10:15:00",
    duration: "8:20",
    status: "Completed",
    referredTo: "N/A",
    notes: "Follow-up on previous TB screening appointment. Patient confirmed attendance."
  },
  {
    id: "CALL-003",
    caseNumber: "CASE-2024-003", 
    callerName: "Sarah Banda",
    callerPhone: "+1-555-0125",
    callerProvince: "Eastern Province",
    callerAge: "30-35",
    callerGender: "Female",
    communicationMode: "WhatsApp",
    purpose: "Child Protection Report",
    validity: "Valid",
    officer: "Mike Johnson",
    dateTime: "2024-01-15 11:00:00",
    duration: "15:30",
    status: "In Progress",
    referredTo: "Social Services",
    notes: "Report of suspected child abuse. Case escalated to authorities."
  },
  {
    id: "CALL-004",
    caseNumber: "CASE-2024-004",
    callerName: "Peter Phiri",
    callerPhone: "+1-555-0126", 
    callerProvince: "Northern Province",
    callerAge: "50-55",
    callerGender: "Male",
    communicationMode: "Walk-in",
    purpose: "Nutrition Support",
    validity: "Valid",
    officer: "Lisa Brown",
    dateTime: "2024-01-15 14:30:00",
    duration: "20:15",
    status: "Completed",
    referredTo: "Nutrition Center",
    notes: "Provided nutritional guidance and referred to local nutrition support program."
  },
  {
    id: "CALL-005",
    caseNumber: "CASE-2024-005",
    callerName: "Grace Tembo",
    callerPhone: "+1-555-0127",
    callerProvince: "Southern Province", 
    callerAge: "18-25",
    callerGender: "Female",
    communicationMode: "Text Message",
    purpose: "Cancer Screening",
    validity: "Invalid",
    officer: "Tom Wilson",
    dateTime: "2024-01-15 16:45:00",
    duration: "3:10",
    status: "Cancelled",
    referredTo: "N/A",
    notes: "Caller disconnected before completing inquiry. Unable to reach back."
  }
];

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
  const [calls, setCalls] = useState(callData);
  const [filteredCalls, setFilteredCalls] = useState(callData);
  const [searchTerm, setSearchTerm] = useState("");
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
    let filtered = calls;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(call =>
        call.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.callerPhone.includes(searchTerm) ||
        call.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.purpose.toLowerCase().includes(searchTerm.toLowerCase())
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
      filtered = filtered.filter(call => call.dateTime >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(call => call.dateTime <= filters.dateTo + " 23:59:59");
    }

    setFilteredCalls(filtered);
  }, [searchTerm, filters, calls]);

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
                {filteredCalls.map((call) => {
                  const StatusIcon = statuses[call.status as keyof typeof statuses]?.icon || ClockIcon;
                  const CommunicationIcon = communicationModes[call.communicationMode as keyof typeof communicationModes]?.icon || PhoneIcon;
                  
                  return (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{call.caseNumber}</div>
                          <div className="text-gray-500">{call.id}</div>
                          <div className="text-gray-500">{new Date(call.dateTime).toLocaleString()}</div>
                          <div className="text-gray-500">Duration: {call.duration}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{call.callerName}</div>
                          <div className="text-gray-500">{call.callerPhone}</div>
                          <div className="text-gray-500">{call.callerProvince}</div>
                          <div className="text-gray-500">{call.callerGender}, {call.callerAge}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <CommunicationIcon className={`mr-2 h-5 w-5 ${communicationModes[call.communicationMode as keyof typeof communicationModes]?.color}`} />
                          <div>
                            <div className="font-medium text-gray-900">{call.communicationMode}</div>
                            <div className="text-gray-500">{call.purpose}</div>
                            <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              call.validity === 'Valid' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                            }`}>
                              {call.validity}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`mr-2 h-5 w-5 ${statuses[call.status as keyof typeof statuses]?.color.split(' ')[0]}`} />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statuses[call.status as keyof typeof statuses]?.color}`}>
                            {call.status}
                          </span>
                        </div>
                        {call.referredTo !== "N/A" && (
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
                          <button className="text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {canEdit && (
                            <>
                              <button className="text-indigo-600 hover:text-indigo-900">
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
                })}
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
    </ModulePage>
  );
}
