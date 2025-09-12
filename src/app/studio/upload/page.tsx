"use client";

import Navbar from "@/components/Navbar";
import ResumableUploader from "@/components/ResumableUploader";
import { useState } from "react";
import VideoClipEditor from "@/components/VideoClipEditor";

export default function UploadPodcastPage() {
  const [uploadedPodcast, setUploadedPodcast] = useState<any>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadedPodcast(data);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {!uploadedPodcast ? (
          <ResumableUploader onUploadSuccess={handleUploadSuccess} />
        ) : (
          <VideoClipEditor
            videoUrl={uploadedPodcast.url}
            filename={uploadedPodcast.filename}
            originalName={uploadedPodcast.originalName}
            podcastId={uploadedPodcast.podcastId}
            onClipCreated={(clip) => {
              console.log("Clip created:", clip);
            }}
          />
        )}
      </div>
    </main>
  );
}
