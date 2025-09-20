"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChartBarIcon,
  DocumentTextIcon,
  StarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface ProfileData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  departmentName?: string;
  startDate?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  alternativePhone?: string;
  personalEmail?: string;
  alternativeEmail?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyContactAddress?: string;
  emergencyContactRelationship?: string;
  profilePicture?: string;
}

export default function EmployeeProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    alternativePhone: '',
    personalEmail: '',
    alternativeEmail: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyContactAddress: '',
    emergencyContactRelationship: '',
    profilePicture: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/employee/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
      setFormData({
        phoneNumber: data.phoneNumber || '',
        alternativePhone: data.alternativePhone || '',
        personalEmail: data.personalEmail || '',
        alternativeEmail: data.alternativeEmail || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        emergencyContactAddress: data.emergencyContactAddress || '',
        emergencyContactRelationship: data.emergencyContactRelationship || '',
        profilePicture: data.profilePicture || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      loadProfile();
    }
  }, [session, status]);

  // Show loading while checking authentication or if no session
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ModulePage
      metadata={{
        title: "My Profile",
        description: "Manage your personal information and contact details",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Employee Portal", href: "/employee" },
          { name: "Profile", href: "/employee/profile" }
        ]
      }}
    >
      <div className="space-y-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange"></div>
            <span className="ml-2 text-sm text-gray-500">Loading profile...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {profile && (
          <>
            {/* Hero Profile Header with Gradient */}
            <div className="relative bg-gradient-to-br from-saywhat-orange via-orange-500 to-green-600 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative px-8 py-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="h-40 w-40 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-2xl">
                      <div className="h-full w-full bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                        {(formData.profilePicture || profile.profilePicture) ? (
                          <img 
                            src={formData.profilePicture || profile.profilePicture} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-20 w-20 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {editMode && (
                      <label className="absolute bottom-2 right-2 h-10 w-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-lg transition-all duration-200 hover:scale-110">
                        <CameraIcon className="h-5 w-5 text-saywhat-orange" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setFormData(prev => ({ ...prev, profilePicture: e.target?.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Employee Information */}
                  <div className="text-center lg:text-left text-white flex-1">
                    <h1 className="text-4xl font-bold mb-2">{profile.firstName} {profile.lastName}</h1>
                    <div className="space-y-2 mb-6">
                      <p className="text-xl text-white/90 font-medium">{profile.position || 'System Administrator'}</p>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-2 lg:space-y-0">
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
                          <span className="text-white/80">Employee ID: {profile.employeeId}</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <EnvelopeIcon className="h-4 w-4 text-white/80" />
                          <span className="text-white/80">{profile.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        <PencilIcon className="mr-2 h-5 w-5" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="inline-flex items-center px-6 py-3 bg-green-600 border-2 border-green-500 rounded-xl text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          <CheckIcon className="mr-2 h-5 w-5" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              phoneNumber: profile.phoneNumber || '',
                              alternativePhone: profile.alternativePhone || '',
                              personalEmail: profile.personalEmail || '',
                              alternativeEmail: profile.alternativeEmail || '',
                              address: profile.address || '',
                              emergencyContact: profile.emergencyContact || '',
                              emergencyPhone: profile.emergencyPhone || '',
                              emergencyContactAddress: profile.emergencyContactAddress || '',
                              emergencyContactRelationship: profile.emergencyContactRelationship || '',
                              profilePicture: profile.profilePicture || ''
                            });
                          }}
                          className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          <XMarkIcon className="mr-2 h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Information Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* Left Column - Contains Personal Information and Contact Information */}
              <div className="lg:col-span-3 space-y-8">
                {/* Personal Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-gray-900 to-black px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <UserIcon className="mr-3 h-6 w-6 text-saywhat-orange" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-saywhat-orange/10 to-transparent rounded-xl border-l-4 border-saywhat-orange">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Employee ID</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.employeeId}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-100 to-transparent rounded-xl border-l-4 border-green-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Position</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.position || 'System Administrator'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-transparent rounded-xl border-l-4 border-gray-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Department</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.departmentName || 'Unassigned'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-pink-100 to-transparent rounded-xl border-l-4 border-pink-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date of Birth</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-100 to-transparent rounded-xl border-l-4 border-blue-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Start Date</label>
                          <p className="text-lg font-medium text-gray-900 mt-1">{profile.startDate ? new Date(profile.startDate).toLocaleDateString() : '14/9/2025'}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-100 to-transparent rounded-xl border-l-4 border-purple-500">
                          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                          <div className="flex items-center mt-1">
                            <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <p className="text-lg font-medium text-green-700">Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section - Now in Left Column */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-saywhat-orange to-orange-500 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <PhoneIcon className="mr-3 h-6 w-6" />
                      Contact Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <PhoneIcon className="inline h-4 w-4 mr-2 text-saywhat-orange" />
                          Primary Phone
                        </label>
                        {editMode ? (
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border-l-4 border-blue-400">
                            <p className="text-lg font-medium text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <PhoneIcon className="inline h-4 w-4 mr-2 text-green-600" />
                          Alternative Phone
                        </label>
                        {editMode ? (
                          <input
                            type="tel"
                            value={formData.alternativePhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, alternativePhone: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter alternative phone"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border-l-4 border-green-400">
                            <p className="text-lg font-medium text-gray-900">{profile.alternativePhone || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <EnvelopeIcon className="inline h-4 w-4 mr-2 text-blue-600" />
                          Personal Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            value={formData.personalEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter personal email"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border-l-4 border-blue-400">
                            <p className="text-lg font-medium text-gray-900">{profile.personalEmail || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <EnvelopeIcon className="inline h-4 w-4 mr-2 text-indigo-600" />
                          Alternative Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            value={formData.alternativeEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, alternativeEmail: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            placeholder="Enter alternative email"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-indigo-50 to-transparent rounded-xl border-l-4 border-indigo-400">
                            <p className="text-lg font-medium text-gray-900">{profile.alternativeEmail || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div className="group md:col-span-2 lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          <MapPinIcon className="inline h-4 w-4 mr-2 text-purple-600" />
                          Home Address
                        </label>
                        {editMode ? (
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors resize-none"
                            placeholder="Enter home address"
                          />
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border-l-4 border-purple-400">
                            <p className="text-lg font-medium text-gray-900">{profile.address || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-red-25 rounded-xl border border-red-200">
                      <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Contact Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={formData.emergencyContact}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                              placeholder="Emergency contact name"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyContact || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Contact Phone
                          </label>
                          {editMode ? (
                            <input
                              type="tel"
                              value={formData.emergencyPhone}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                              placeholder="Emergency contact phone"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyPhone || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Relationship
                          </label>
                          {editMode ? (
                            <select
                              value={formData.emergencyContactRelationship}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors"
                            >
                              <option value="">Select relationship</option>
                              <option value="spouse">Spouse</option>
                              <option value="parent">Parent</option>
                              <option value="child">Child</option>
                              <option value="sibling">Sibling</option>
                              <option value="friend">Friend</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyContactRelationship || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Contact Address
                          </label>
                          {editMode ? (
                            <textarea
                              value={formData.emergencyContactAddress}
                              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactAddress: e.target.value }))}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saywhat-orange focus:border-saywhat-orange transition-colors resize-none"
                              placeholder="Emergency contact address"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-lg font-medium text-gray-900">{profile.emergencyContactAddress || 'Not provided'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Quick Stats and Quick Actions */}
              <div className="space-y-6">
                {/* Quick Stats Card - Natural Height */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <ChartBarIcon className="mr-2 h-5 w-5" />
                      Quick Stats
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-center p-3 bg-gradient-to-br from-saywhat-orange/20 to-saywhat-orange/5 rounded-lg">
                      <div className="text-2xl font-bold text-saywhat-orange">5</div>
                      <div className="text-xs font-medium text-gray-600">Years of Service</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-xs font-medium text-gray-600">Performance Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-xs font-medium text-gray-600">Trainings Completed</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-black to-gray-800 px-4 py-3">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <StarIcon className="mr-2 h-5 w-5 text-saywhat-orange" />
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <Link
                    href="/employee/performance"
                    className="group flex items-center p-3 bg-gradient-to-br from-saywhat-orange/10 via-saywhat-orange/5 to-transparent rounded-lg border-2 border-saywhat-orange/20 hover:border-saywhat-orange/40 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <ChartBarIcon className="h-5 w-5 text-saywhat-orange mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Performance</p>
                      <p className="text-xs text-gray-600">View plans & appraisals</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee/performance/plans/create"
                    className="group flex items-center p-3 bg-gradient-to-br from-green-100 via-green-50 to-transparent rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">New Plan</p>
                      <p className="text-xs text-gray-600">Create performance plan</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee/performance/appraisals/create"
                    className="group flex items-center p-3 bg-gradient-to-br from-blue-100 via-blue-50 to-transparent rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <StarIcon className="h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Self Appraisal</p>
                      <p className="text-xs text-gray-600">Complete assessment</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee/qualifications"
                    className="group flex items-center p-3 bg-gradient-to-br from-purple-100 via-purple-50 to-transparent rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <AcademicCapIcon className="h-5 w-5 text-purple-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Qualifications</p>
                      <p className="text-xs text-gray-600">Manage certifications</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/hr/training/enroll"
                    className="group flex items-center p-3 bg-gradient-to-br from-yellow-100 via-yellow-50 to-transparent rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Training</p>
                      <p className="text-xs text-gray-600">Browse & enroll</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/employee"
                    className="group flex items-center p-3 bg-gradient-to-br from-gray-100 via-gray-50 to-transparent rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <ArrowTrendingUpIcon className="h-5 w-5 text-gray-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Dashboard</p>
                      <p className="text-xs text-gray-600">Employee portal home</p>
                    </div>
                  </Link>
                </div>
              </div>
              </div>
            </div>

          </>
        )}
      </div>
    </ModulePage>
  );
}