"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { DepartmentList } from "../../../components/hr/department/DepartmentList";
import { DepartmentForm } from "../../../components/hr/department/DepartmentForm";

interface Department {
  id?: string
  name: string
  description: string
  manager: string
  employeeCount: number
  budget: number
  status: 'active' | 'inactive'
}

export default function DepartmentPage() {
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const handleSubmit = (department: Department) => {
    // Add the new department to the list
    const newDepartment = {
      ...department,
      id: Date.now().toString(), // Simple ID generation
    };
    setDepartments(prev => [...prev, newDepartment]);
    setShowForm(false);
    console.log('Department created:', newDepartment);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {showForm ? 'Cancel' : 'Add Department'}
          </button>
        </div>
        
        {showForm && (
          <div className="mb-8">
            <DepartmentForm 
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}
        
        <div>
          <DepartmentList />
        </div>
      </div>
    </DashboardLayout>
  );
}
