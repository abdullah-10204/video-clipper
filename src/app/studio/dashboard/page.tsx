"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ResumableUploader from "@/components/ResumableUploader";
import VideoClipEditor from "@/components/VideoClipEditor";

export default function StudioDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uploadedPodcast, setUploadedPodcast] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/login");
    else if ((session as any).role !== "STUDIO") {
      const role = (session as any).role?.toLowerCase() || "";
      router.push(`/${role}/dashboard`);
    }
  }, [session, status, router]);

  if (status === "loading")
    return <div className="text-center mt-10 text-white">Loading...</div>;

  const handleUploadSuccess = (data: any) => {
    setUploadedPodcast(data);
  };

  const handleNewUpload = () => {
    setUploadedPodcast(null);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">
            Podcast Clip Editor
          </h1>
          <p className="text-gray-300">
            Upload your podcast and create clips with precise start and end
            points
          </p>
        </header>

        {!uploadedPodcast ? (
          <ResumableUploader onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-indigo-300">
                Editing: {uploadedPodcast.originalName}
              </h2>
              <button
                onClick={handleNewUpload}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg shadow transition"
              >
                Upload New File
              </button>
            </div>
            <VideoClipEditor
              videoUrl={uploadedPodcast.url}
              filename={uploadedPodcast.filename}
              originalName={uploadedPodcast.originalName}
              podcastId={uploadedPodcast.uploadId}
            />
          </div>
        )}
      </div>
    </main>
  );
}
