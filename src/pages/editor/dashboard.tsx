import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function EditorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    } else if ((session as any).role !== "EDITOR") {
      router.push(`/${(session as any).role.toLowerCase()}/dashboard`);
    }
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      <h1>Hi Editor, welcome!</h1>
      <p>Logged in as: {session?.user?.email}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        style={{
          marginTop: "20px",
          padding: "8px 16px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>
    </div>
  );
}
