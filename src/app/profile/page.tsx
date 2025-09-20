"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not authenticated, redirect to login
      router.push("/auth/signin");
      return;
    }

    // Check user roles and redirect accordingly
    const userRoles = session.user?.roles || [];
    
    if (userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN")) {
      // Admin users might want to see their admin profile or employee profile
      router.push("/employee/profile");
    } else {
      // Regular employees go to employee profile
      router.push("/employee/profile"); 
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
}