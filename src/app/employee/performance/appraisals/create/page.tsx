"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeAppraisalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified appraisal form in HR with self-assessment mode
    router.push("/hr/performance/appraisals/create?mode=self");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to appraisal form...</p>
      </div>
    </div>
  );
}
