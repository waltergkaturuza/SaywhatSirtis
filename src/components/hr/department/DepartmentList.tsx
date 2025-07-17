
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Department } from "../../../types/hr/department";

const fetchDepartments = async (): Promise<Department[]> => {
  const res = await fetch("/api/hr/department");
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
};

export default function DepartmentList() {
  const { data, isLoading, isError, error } = useQuery<Department[], Error>({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading departments...</div>;
  }
  if (isError) {
    return <div className="text-red-500">Error: {error?.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-gray-500">No departments found.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((dept) => (
            <tr key={dept.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">{dept.name}</td>
              <td className="px-4 py-2 text-gray-700">{dept.description}</td>
              <td className="px-4 py-2 text-right">
                {/* Edit/Delete actions can go here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
