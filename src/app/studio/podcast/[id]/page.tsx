"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import VideoClipEditor from "@/components/VideoClipEditor";

export default function PodcastPage() {
  const { id } = useParams();
  const [podcast, setPodcast] = useState<any>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      const res = await fetch(`/api/podcasts/${id}`);
      const data = await res.json();
      if (data.success) setPodcast(data.podcast);
    };
    fetchPodcast();
  }, [id]);

  if (!podcast) return <div className="text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-indigo-400 mb-6">
          {podcast.originalName}
        </h1>
        <VideoClipEditor
          videoUrl={podcast.url}
          filename={podcast.filename}
          originalName={podcast.originalName}
          podcastId={podcast._id}
          onClipCreated={(clip) => {
            console.log("Clip created:", clip);
          }}
        />
      </div>
    </main>
  );
}
