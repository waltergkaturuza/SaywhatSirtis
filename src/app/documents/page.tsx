"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to enhanced repository
    router.replace('/documents/enhanced-repository');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Redirecting to Document Repository...</p>
      </div>
    </div>
  );
}
