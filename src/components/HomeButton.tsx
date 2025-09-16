"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function HomeButton() {
  const { user } = useAuth();

  // Default to root if user is missing
  const role = user?.role?.toLowerCase() || "";
  const dashboardPath = role ? `/${role}/dashboard` : "/";

  return (
    <Link
      href={dashboardPath}
      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-medium rounded-lg shadow transition cursor-pointer"
    >
      Home
    </Link>
  );
}
