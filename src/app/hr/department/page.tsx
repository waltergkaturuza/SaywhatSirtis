"use client";

import DepartmentList from "../../../components/hr/department/DepartmentList";
import DepartmentForm from "../../../components/hr/department/DepartmentForm";

export default function DepartmentPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Departments</h1>
        <DepartmentForm />
        <div className="mt-8">
          <DepartmentList />
        </div>
      </div>
    </div>
  );
}
