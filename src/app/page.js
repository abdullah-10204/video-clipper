'use client';

import { useState } from 'react';
import ResumableUploader from './components/ResumableUploader';
import VideoClipEditor from './components/VideoClipEditor';

export default function Home() {
  const [uploadedPodcast, setUploadedPodcast] = useState(null);

  const handleUploadSuccess = (data) => {
    setUploadedPodcast(data);
  };

  const handleNewUpload = () => {
    setUploadedPodcast(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Podcast Clip Editor
          </h1>
          <p className="text-gray-600">
            Upload your podcast and create clips with precise start and end points
          </p>
        </header>

        {!uploadedPodcast ? (
          <ResumableUploader onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Editing: {uploadedPodcast.originalName}
              </h2>
              <button
                onClick={handleNewUpload}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Upload New File
              </button>
            </div>
            <VideoClipEditor
              videoUrl={uploadedPodcast.url}
              filename={uploadedPodcast.filename}
              originalName={uploadedPodcast.originalName}
            />
          </div>
        )}
      </div>
    </main>
  );
}