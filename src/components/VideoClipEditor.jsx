// src/app/components/VideoClipEditor.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VideoClipEditor({
  videoUrl,
  filename,
  originalName,
  podcastId,
  onClipCreated,
}) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipName, setClipName] = useState("");
  const [clipDescription, setClipDescription] = useState("");
  const [isCreatingClip, setIsCreatingClip] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setEndTime(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoUrl]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const setStartPoint = () => {
    setStartTime(currentTime);
  };

  const setEndPoint = () => {
    setEndTime(currentTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const uploadClipToS3 = async (blob, clipFilename) => {
    try {
      // Get presigned URL for upload
      const response = await fetch("/api/clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: clipFilename,
          fileType: "video/webm",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Failed to get upload URL");
      }

      // Upload the clip to S3
      const uploadResponse = await fetch(result.url, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "video/webm",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      return {
        downloadUrl: result.downloadUrl,
        s3Key: clipFilename,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw error;
    }
  };

  const saveClipToDatabase = async (clipData) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/clips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clipData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to save clip");
      }

      return result;
    } catch (error) {
      console.error("Database save error:", error);
      throw error;
    }
  };

  const createClip = async () => {
    if (startTime >= endTime) {
      alert("Start time must be before end time");
      return;
    }

    if (!clipName.trim()) {
      alert("Please enter a name for the clip");
      return;
    }

    if (!podcastId) {
      alert("No podcast ID provided");
      return;
    }

    setIsCreatingClip(true);
    setProgress(0);

    try {
      const video = videoRef.current;
      if (!video) throw new Error("Video element not found");

      // Create a stream from the video element
      const stream = video.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9,opus",
        videoBitsPerSecond: 2500000,
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });

          // Generate clip filename
          const clipId = Date.now();
          const clipFilename = `clip_${clipId}_${clipName
            .trim()
            .replace(/\s+/g, "_")}.webm`;

          // Upload to S3
          setProgress(70);
          const uploadResult = await uploadClipToS3(blob, clipFilename);

          // Save to database
          setProgress(90);
          const clipData = {
            podcastId: podcastId,
            title: clipName.trim(),
            description: clipDescription.trim(),
            filename: clipFilename,
            s3Key: uploadResult.s3Key,
            duration: (endTime - startTime).toFixed(2),
            fileSize: blob.size,
            startTime: startTime,
            endTime: endTime,
            downloadUrl: uploadResult.downloadUrl,
            status: "processed",
          };

          await saveClipToDatabase(clipData);

          setProgress(100);

          // Notify parent component
          if (onClipCreated) {
            onClipCreated();
          }

          // Show success message
          alert("Clip created successfully!");
        } catch (error) {
          console.error("Error creating clip:", error);
          alert("Failed to create clip: " + error.message);
        } finally {
          setIsCreatingClip(false);
          setProgress(0);
        }
      };

      // Set up progress monitoring
      const totalDuration = endTime - startTime;
      let elapsed = 0;
      const progressInterval = setInterval(() => {
        elapsed += 0.1;
        const currentProgress = Math.min((elapsed / totalDuration) * 60, 60); // 60% for recording
        setProgress(currentProgress);
      }, 100);

      // Start recording
      video.currentTime = startTime;

      await new Promise((resolve) => {
        video.onseeked = resolve;
        setTimeout(resolve, 500);
      });

      mediaRecorder.start();
      video.play();
      setIsPlaying(true);

      // Stop recording after clip duration
      setTimeout(() => {
        clearInterval(progressInterval);
        mediaRecorder.stop();
        video.pause();
        setIsPlaying(false);
        setProgress(65); // Move to upload phase
      }, totalDuration * 1000);
    } catch (error) {
      console.error("Error creating clip:", error);
      alert("Failed to create clip: " + error.message);
      setIsCreatingClip(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Bar */}
      {isCreatingClip && (
        <div className="bg-purple-50/10 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20">
          <h3 className="font-medium text-purple-300 mb-2">Creating Clip</h3>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-purple-400 mt-2">
            {progress < 60
              ? `Recording... ${progress.toFixed(1)}%`
              : progress < 95
              ? `Uploading... ${progress.toFixed(1)}%`
              : "Saving... 100%"}
          </p>
        </div>
      )}

      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <button
            onClick={togglePlayPause}
            disabled={isCreatingClip}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isPlaying ? "⏸️ Pause" : "▶️ Play"}
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isCreatingClip}
            />

            <div
              className="absolute top-0 w-1 h-8 bg-green-500 pointer-events-none"
              style={{ left: `${(startTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-0 w-1 h-8 bg-red-500 pointer-events-none"
              style={{ left: `${(endTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <span>
              Selection: {formatTime(startTime)} - {formatTime(endTime)} (
              {formatTime(endTime - startTime)})
            </span>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={setStartPoint}
            disabled={isCreatingClip}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
          >
            Set Start ({formatTime(startTime)})
          </button>
          <button
            onClick={setEndPoint}
            disabled={isCreatingClip}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
          >
            Set End ({formatTime(endTime)})
          </button>
        </div>

        {/* Clip Creation */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 space-y-4">
          <div>
            <label
              htmlFor="clipName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Clip Title *
            </label>
            <input
              type="text"
              id="clipName"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
              placeholder="Enter clip title"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled={isCreatingClip}
              required
            />
          </div>

          <div>
            <label
              htmlFor="clipDescription"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="clipDescription"
              value={clipDescription}
              onChange={(e) => setClipDescription(e.target.value)}
              placeholder="Enter clip description"
              rows="3"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
              disabled={isCreatingClip}
            />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={createClip}
              disabled={isCreatingClip || !clipName.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isCreatingClip ? "Creating Clip..." : "Create Clip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
