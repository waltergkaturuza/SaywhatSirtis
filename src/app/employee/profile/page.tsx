"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  GlobeAltIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

interface EmployeeProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  alternativePhone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  nationalId?: string;
  passportNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  position: string;
  department: string;
  startDate: string;
  profilePicture?: string;
  supervisor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProfileFormData {
  phoneNumber?: string;
  alternativePhone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  profilePicture?: string;
}

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load employee profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        phoneNumber: data.phoneNumber,
        alternativePhone: data.alternativePhone,
        address: data.address,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        profilePicture: data.profilePicture
      });

    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      setError('Failed to save profile changes');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/employee/profile/picture', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, profilePicture: result.url }));
      setSuccessMessage('Profile picture updated successfully!');

    } catch (err) {
      setError('Failed to upload profile picture');
      console.error('Error uploading profile picture:', err);
    }
  };

  useEffect(() => {
    if (session) {
      loadProfile();
    }
  }, [session]);

  // Redirect if not authenticated
  if (!session) {
    router.push('/auth/signin');
    return null;
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
      <div className="space-y-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
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
            {/* Profile Header */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-saywhat-orange hover:bg-saywhat-orange/90 disabled:opacity-50"
                    >
                      <CheckIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          phoneNumber: profile.phoneNumber,
                          alternativePhone: profile.alternativePhone,
                          address: profile.address,
                          emergencyContact: profile.emergencyContact,
                          emergencyPhone: profile.emergencyPhone,
                          profilePicture: profile.profilePicture
                        });
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {(formData.profilePicture || profile.profilePicture) ? (
                          <img 
                            src={formData.profilePicture || profile.profilePicture} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      {editMode && (
                        <label className="absolute bottom-0 right-0 h-8 w-8 bg-saywhat-orange rounded-full flex items-center justify-center cursor-pointer hover:bg-saywhat-orange/90">
                          <CameraIcon className="h-4 w-4 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleProfilePictureUpload(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employee ID</label>
                        <p className="text-sm text-gray-900">{profile.employeeId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm text-gray-900">
                          {profile.firstName} {profile.middleName} {profile.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Position</label>
                        <p className="text-sm text-gray-900">{profile.position}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-sm text-gray-900">{profile.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <p className="text-sm text-gray-900">
                          {new Date(profile.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <PhoneIcon className="inline h-4 w-4 mr-2" />
                      Primary Phone
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <PhoneIcon className="inline h-4 w-4 mr-2" />
                      Alternative Phone
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.alternativePhone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, alternativePhone: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        placeholder="Enter alternative phone"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.alternativePhone || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <MapPinIcon className="inline h-4 w-4 mr-2" />
                      Address
                    </label>
                    {editMode ? (
                      <textarea
                        rows={3}
                        value={formData.address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <UserGroupIcon className="inline h-4 w-4 mr-2" />
                      Emergency Contact Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.emergencyContact || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        placeholder="Enter emergency contact name"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.emergencyContact || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <PhoneIcon className="inline h-4 w-4 mr-2" />
                      Emergency Contact Phone
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.emergencyPhone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-saywhat-orange focus:border-saywhat-orange sm:text-sm"
                        placeholder="Enter emergency contact phone"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.emergencyPhone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details (Read-only) */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
                <p className="text-sm text-gray-500">Contact HR to update these details</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <CalendarIcon className="inline h-4 w-4 mr-2" />
                      Date of Birth
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <UserIcon className="inline h-4 w-4 mr-2" />
                      Gender
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{profile.gender || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <GlobeAltIcon className="inline h-4 w-4 mr-2" />
                      Nationality
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{profile.nationality || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <IdentificationIcon className="inline h-4 w-4 mr-2" />
                      National ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{profile.nationalId || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <IdentificationIcon className="inline h-4 w-4 mr-2" />
                      Passport Number
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{profile.passportNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor Information */}
            {profile.supervisor && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Reporting Structure</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-gray-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Supervisor: {profile.supervisor.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {profile.supervisor.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ModulePage>
  );
}
