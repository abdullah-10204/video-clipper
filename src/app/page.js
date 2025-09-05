// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          🎙️ PodClip Pro
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Upload your podcasts and create edited clips — collaborate with
          agencies and editors.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-indigo-600 rounded-2xl text-lg font-semibold shadow-lg hover:bg-indigo-700"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-white/10 rounded-2xl text-lg font-semibold hover:bg-white/20 border border-white/10"
          >
            Already a member? Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
