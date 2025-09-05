"use client";

import { signOut } from "next-auth/react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 shadow-md">
      <h1 className="text-2xl font-bold text-indigo-400">PodClip Pro</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium shadow-md transition"
      >
        Logout
      </button>
    </nav>
  );
}
