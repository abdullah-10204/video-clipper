"use client";

import { useState } from "react";

export default function PodcastUploader({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;

    // Check if file is video/audio
    const validTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
    ];
    if (!validTypes.some((type) => file.type.includes(type.split("/")[1]))) {
      alert("Please upload a valid video or audio file");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("podcast", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadSuccess(result);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">Uploading podcast...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">🎧</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your podcast file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports MP4, AVI, MOV, MP3, WAV, M4A files
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              id="podcast-upload"
              accept="video/*,audio/*"
              onChange={handleFileInput}
            />
            <label
              htmlFor="podcast-upload"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
            >
              Choose File
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
