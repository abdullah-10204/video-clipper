"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(email, password);
    if (!res.success) {
      alert(res.error || "Login failed");
      return;
    }

    const role = res?.user?.role;
    if (role === "STUDIO") router.push("/studio/dashboard");
    else if (role === "AGENCY") router.push("/agency/dashboard");
    else if (role === "EDITOR") router.push("/editor/dashboard");
    else router.push("/");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">
          Welcome Back
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold text-lg shadow-md transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-indigo-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
