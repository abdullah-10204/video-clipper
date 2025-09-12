"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/hooks/useAuth";

export default function StudioDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [clips, setClips] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
    } else if (user.role !== "STUDIO") {
      const role = user.role?.toLowerCase() || "";
      router.push(`/${role}/dashboard`);
    } else {
      fetchPodcasts();
      fetchClips();
    }
  }, [user, loading]);

  const fetchPodcasts = async () => {
    const res = await fetch("/api/podcasts");
    const data = await res.json();
    if (data.success) setPodcasts(data.podcasts);
  };

  const fetchClips = async () => {
    const res = await fetch("/api/clips");
    const data = await res.json();
    if (data.success) setClips(data.clips);
  };

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">
            Studio Dashboard
          </h1>
          <button
            onClick={() => router.push("/studio/upload")}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow transition"
          >
            Upload Podcast
          </button>
        </header>

        {/* Podcasts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Podcasts</h2>
          {podcasts.length === 0 ? (
            <p className="text-gray-400">No podcasts uploaded yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {podcasts.map((p) => (
                <div
                  key={p._id}
                  className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 cursor-pointer"
                  onClick={() => router.push(`/studio/podcast/${p._id}`)}
                >
                  <h3 className="text-xl font-medium text-indigo-300">
                    {p.originalName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Uploaded on {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Clips */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Clips</h2>
          {clips.length === 0 ? (
            <p className="text-gray-400">No clips created yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {clips.map((c) => (
                <div
                  key={c._id}
                  className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700"
                >
                  <h3 className="text-lg font-medium">
                    {c.title || "Untitled Clip"}
                  </h3>
                  <video
                    src={c.url}
                    controls
                    className="mt-2 rounded-lg"
                  ></video>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
