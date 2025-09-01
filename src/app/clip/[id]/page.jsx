// src/app/clip/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ClipSuccessPage() {
  const params = useParams();
  const [clipData, setClipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedClip = sessionStorage.getItem(`clip_${params.id}`);
    if (savedClip) {
      setClipData(JSON.parse(savedClip));
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clip...</p>
        </div>
      </div>
    );
  }

  if (!clipData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Clip Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The clip may have expired or was not found.
          </p>
          <Link
            href="/"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-8">
          <Link
            href="/"
            className="inline-block mb-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Editor
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Clip Created Successfully!
          </h1>
          <p className="text-gray-600">
            Your podcast clip has been saved to cloud storage
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {clipData.clipName}
            </h2>
            <p className="text-gray-600">
              Duration: {clipData.duration} seconds
              {clipData.blobSize &&
                ` • Size: ${(clipData.blobSize / (1024 * 1024)).toFixed(2)} MB`}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Preview</h3>
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={clipData.clipUrl}
                controls
                className="w-full h-auto"
                preload="metadata"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={clipData.clipUrl}
              download={clipData.clipFilename || `${clipData.clipName}.webm`}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-center font-medium"
            >
              📥 Download Clip
            </a>

            <button
              onClick={() => navigator.clipboard.writeText(clipData.clipUrl)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              📋 Copy Direct Link
            </button>

            <Link
              href="/"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors text-center font-medium"
            >
              ✨ Create Another Clip
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Clip Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Original file:</strong> {clipData.originalFilename}
              </p>
              <p>
                <strong>Stored as:</strong> {clipData.clipFilename || "N/A"}
              </p>
              <p>
                <strong>Cloud storage:</strong> AWS S3
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
