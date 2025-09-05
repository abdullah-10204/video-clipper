"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AgencyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/login");
    else if ((session as any).role !== "AGENCY") {
      const role = (session as any).role?.toLowerCase() || "";
      router.push(`/${role}/dashboard`);
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Hi Agency, welcome!</h1>
      <p>Logged in as: {session?.user?.email}</p>
    </div>
  );
}
