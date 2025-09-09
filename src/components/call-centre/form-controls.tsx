"use client";

import { useState, useEffect } from 'react';
import { zimbabweProvinces, districtsByProvince } from '@/lib/call-centre-utils';

interface LocationSelectorProps {
  selectedProvince?: string;
  selectedDistrict?: string;
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  className?: string;
  required?: boolean;
  prefix?: string; // 'caller' or 'client'
}

export function LocationSelector({
  selectedProvince,
  selectedDistrict,
  onProvinceChange,
  onDistrictChange,
  className = "",
  required = false,
  prefix = ""
}: LocationSelectorProps) {
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      setAvailableDistricts(districtsByProvince[selectedProvince] || []);
      // Clear district if it's not available in the new province
      if (selectedDistrict && !districtsByProvince[selectedProvince]?.includes(selectedDistrict)) {
        onDistrictChange('');
      }
    } else {
      setAvailableDistricts([]);
      onDistrictChange('');
    }
  }, [selectedProvince, selectedDistrict, onDistrictChange]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {prefix ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Province` : 'Province'}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={selectedProvince || ''}
          onChange={(e) => onProvinceChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Province</option>
          {zimbabweProvinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {prefix ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} District` : 'District'}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={selectedDistrict || ''}
          onChange={(e) => onDistrictChange(e.target.value)}
          required={required}
          disabled={!selectedProvince}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select District</option>
          {availableDistricts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface AddressSelectorProps {
  value?: string;
  onChange: (address: string) => void;
  placeholder?: string;
  required?: boolean;
  prefix?: string;
  className?: string;
}

export function AddressSelector({
  value,
  onChange,
  placeholder = "Enter full address",
  required = false,
  prefix = "",
  className = ""
}: AddressSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {prefix ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Address` : 'Address'}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
      />
    </div>
  );
}

interface GenderSelectorProps {
  value?: string;
  onChange: (gender: string) => void;
  required?: boolean;
  prefix?: string;
  className?: string;
}

export function GenderSelector({
  value,
  onChange,
  required = false,
  prefix = "",
  className = ""
}: GenderSelectorProps) {
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {prefix ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Gender` : 'Gender'}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Gender</option>
        {genderOptions.map((gender) => (
          <option key={gender} value={gender}>
            {gender}
          </option>
        ))}
      </select>
    </div>
  );
}

interface PhoneInputProps {
  value?: string;
  onChange: (phone: string) => void;
  required?: boolean;
  prefix?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  required = false,
  prefix = "",
  className = ""
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (phone: string) => {
    onChange(phone);
    
    // Basic validation for Zimbabwe phone numbers
    if (phone.trim() === '') {
      setIsValid(true);
      return;
    }
    
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const patterns = [
      /^\+2637\d{8}$/,  // +2637xxxxxxxx
      /^2637\d{8}$/,    // 2637xxxxxxxx  
      /^07\d{8}$/       // 07xxxxxxxx
    ];
    
    setIsValid(patterns.some(pattern => pattern.test(cleanPhone)));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {prefix ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Phone Number` : 'Phone Number'}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="tel"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="e.g., +263771234567 or 0771234567"
        required={required}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          !isValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
        }`}
      />
      {!isValid && (
        <p className="mt-1 text-sm text-red-600">
          Please enter a valid Zimbabwe phone number (e.g., +263771234567 or 0771234567)
        </p>
      )}
    </div>
  );
}
