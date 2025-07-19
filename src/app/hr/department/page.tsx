"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import DepartmentList from "../../../components/hr/department/DepartmentList";
import DepartmentForm from "../../../components/hr/department/DepartmentForm";

export default function DepartmentPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Departments</h1>
        <DepartmentForm />
        <div className="mt-8">
          <DepartmentList />
        </div>
      </div>
    </DashboardLayout>
  );
}
