// src/app/components/ResumableUploader.jsx
"use client";

import { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import HomeButton from "@/components/HomeButton";

export default function ResumableUploader({
  onUploadSuccess,
  maxFileSize = 107374182400,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadId, setUploadId] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const createMultipartUpload = async (filename, fileType) => {
    const response = await fetch("/api/upload/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, fileType }),
    });
    return await response.json();
  };

  const getUploadUrls = async (uploadId, partNumbers, filename) => {
    const response = await fetch("/api/upload/parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, partNumbers, filename }),
    });
    return await response.json();
  };

  const completeMultipartUpload = async (uploadId, parts, filename) => {
    const response = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, parts, filename }),
    });
    return await response.json();
  };

  const getPlaybackUrl = async (filename) => {
    const response = await fetch("/api/upload/playback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    return await response.json();
  };

  // NEW: Save podcast metadata to DB and return the podcastId
  const savePodcastToDB = async ({
    filename,
    originalName,
    size,
    fileType,
  }) => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      return { success: false, error: "No auth token (not logged in)" };
    }

    const response = await fetch("/api/podcasts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename,
        originalName,
        fileSize: size,
        fileType,
        s3Key: filename,
      }),
    });

    return await response.json();
  };

  const abortUpload = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (uploadId && fileInfo) {
      await fetch("/api/upload/abort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, filename: fileInfo.filename }),
      });
    }
    resetUpload();
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadId(null);
    setFileInfo(null);
    abortControllerRef.current = null;
  };

  const handleFileSelect = async (file) => {
    if (file.size > maxFileSize) {
      alert(`File too large. Maximum size: ${formatFileSize(maxFileSize)}`);
      return;
    }

    setIsUploading(true);
    abortControllerRef.current = new AbortController();

    try {
      // Create unique filename
      const fileId = uuidv4();
      const fileExtension = file.name.split(".").pop();
      const filename = `podcast_${fileId}.${fileExtension}`;

      // Store file info immediately
      const currentFileInfo = {
        filename,
        originalName: file.name,
        size: file.size,
      };
      setFileInfo(currentFileInfo);

      // Create multipart upload
      const multipartResponse = await createMultipartUpload(
        filename,
        file.type
      );
      if (!multipartResponse.success)
        throw new Error("Failed to create upload session");

      setUploadId(multipartResponse.uploadId);

      // Prepare upload parts (5MB chunks)
      const chunkSize = 5 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / chunkSize);
      const partNumbers = Array.from({ length: totalChunks }, (_, i) => i + 1);

      // Get presigned URLs for all parts
      const urlsResponse = await getUploadUrls(
        multipartResponse.uploadId,
        partNumbers,
        filename
      );
      if (!urlsResponse.success) throw new Error("Failed to get upload URLs");

      // Upload parts with progress tracking and collect ETags
      let uploadedBytes = 0;
      const uploadedParts = [];

      for (let index = 0; index < urlsResponse.presignedUrls.length; index++) {
        const url = urlsResponse.presignedUrls[index];
        const partNumber = partNumbers[index];
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const response = await fetch(url, {
          method: "PUT",
          body: chunk,
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": file.type,
            "Content-Length": chunk.size.toString(),
          },
        });

        if (!response.ok) {
          throw new Error(
            `Upload failed for part ${partNumber}: ${response.status} ${response.statusText}`
          );
        }

        const etag = response.headers.get("ETag");
        if (!etag) {
          throw new Error(`No ETag received for part ${partNumber}`);
        }

        uploadedParts.push({
          PartNumber: partNumber,
          ETag: etag,
        });

        uploadedBytes += chunk.size;
        const progress = (uploadedBytes / file.size) * 100;
        setUploadProgress(progress);
      }

      // Complete multipart upload with actual ETags
      const completeResponse = await completeMultipartUpload(
        multipartResponse.uploadId,
        uploadedParts,
        filename
      );

      if (!completeResponse.success) {
        console.error("Complete response:", completeResponse);
        throw new Error(
          "Failed to complete upload: " +
            (completeResponse.error || "Unknown error")
        );
      }

      // Get playback URL
      const playbackResponse = await getPlaybackUrl(filename);
      if (!playbackResponse.success)
        throw new Error("Failed to get playback URL");

      // NEW: save podcast to DB to get a Mongo podcastId
      const saveResp = await savePodcastToDB({
        filename,
        originalName: file.name,
        size: file.size,
        fileType: file.type,
      });

      if (!saveResp.success) {
        throw new Error(saveResp.error || "Failed to save podcast");
      }

      // success: pass podcastId back up to parent
      onUploadSuccess({
        filename,
        url: playbackResponse.url,
        originalName: file.name,
        size: file.size,
        uploadId: multipartResponse.uploadId,
        podcastId: saveResp.podcastId, // <-- important: real Mongo ID string
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error.message}`);

        // Attempt to abort the upload on error
        if (uploadId && fileInfo) {
          try {
            await fetch("/api/upload/abort", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uploadId, filename: fileInfo.filename }),
            });
          } catch (abortError) {
            console.error("Error aborting upload:", abortError);
          }
        }
      }
    } finally {
      resetUpload();
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-4 flex justify-end">
        <HomeButton />
      </div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading
            ? "opacity-50 pointer-events-none"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    Uploading... {uploadProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {fileInfo?.originalName}
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                ></div>
              </div>
            </div>
            <button
              onClick={abortUpload}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Cancel Upload
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">🎧</div>
            <div>
              <p className="text-lg font-medium text-white-200 mb-2">
                Drop your podcast file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports files up to {formatFileSize(maxFileSize)}
              </p>
            </div>
            <input
              ref={fileInputRef}
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
