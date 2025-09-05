"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function EditorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/login");
    else if ((session as any).role !== "EDITOR") {
      const role = (session as any).role?.toLowerCase() || "";
      router.push(`/${role}/dashboard`);
    }
  }, [session, status, router]);

  if (status === "loading")
    return <div className="text-center mt-10 text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-gray-900 p-10 rounded-2xl shadow-xl w-full max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-indigo-400 mb-4">
            Welcome back, Editor!
          </h2>
          <p className="text-gray-300 text-lg">
            Logged in as{" "}
            <span className="font-semibold">{session?.user?.email}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
