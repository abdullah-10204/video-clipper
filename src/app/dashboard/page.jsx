"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StudioDashboard from "@/components/dashboards/StudioDashboard";
import AgencyDashboard from "@/components/dashboards/AgencyDashboard";
import EditorDashboard from "@/components/dashboards/EditorDashboard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  const getDashboardComponent = () => {
    switch (user.role) {
      case "studio":
        return <StudioDashboard user={user} />;
      case "agency":
        return <AgencyDashboard user={user} />;
      case "editor":
        return <EditorDashboard user={user} />;
      default:
        return <div className="text-white">Unknown user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-black">
      {getDashboardComponent()}
    </div>
  );
}
