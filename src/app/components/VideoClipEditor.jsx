"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VideoClipEditor({ videoUrl, filename, originalName }) {
  const videoRef = useRef(null);
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipName, setClipName] = useState("");
  const [isCreatingClip, setIsCreatingClip] = useState(false);

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
  }, []);

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

  const createClip = async () => {
    if (startTime >= endTime) {
      alert("Start time must be before end time");
      return;
    }

    if (!clipName.trim()) {
      alert("Please enter a name for the clip");
      return;
    }

    setIsCreatingClip(true);

    try {
      const response = await fetch("/api/clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
          startTime,
          endTime,
          clipName: clipName.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Generate a unique ID for this clip
        const clipId = Date.now().toString();

        // Store clip data temporarily (in a real app, you'd save to database)
        sessionStorage.setItem(
          `clip_${clipId}`,
          JSON.stringify({
            ...result,
            clipName: clipName.trim(),
            originalFilename: filename,
          })
        );

        // Redirect to the clip preview page
        router.push(`/clip/${clipId}`);
      } else {
        alert("Failed to create clip: " + result.error);
      }
    } catch (error) {
      console.error("Error creating clip:", error);
      alert("Failed to create clip");
    } finally {
      setIsCreatingClip(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl ? videoUrl : ""}
          className="w-full h-auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <button
            onClick={togglePlayPause}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />

            {/* Start and End markers */}
            <div
              className="absolute top-0 w-1 h-8 bg-green-500 pointer-events-none"
              style={{ left: `${(startTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-0 w-1 h-8 bg-red-500 pointer-events-none"
              style={{ left: `${(endTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-600">
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
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Set Start ({formatTime(startTime)})
          </button>
          <button
            onClick={setEndPoint}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Set End ({formatTime(endTime)})
          </button>
        </div>

        {/* Clip Creation */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label
              htmlFor="clipName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Clip Name
            </label>
            <input
              type="text"
              id="clipName"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
              placeholder="Enter clip name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={createClip}
              disabled={isCreatingClip || !clipName.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingClip ? "Creating Clip..." : "Create Clip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
