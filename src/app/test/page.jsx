"use client";

import { useState } from "react";

export default function TestPage() {
  const [status, setStatus] = useState("");
  const [details, setDetails] = useState("");

  const testS3Connection = async () => {
    try {
      setStatus("Testing S3 connection...");
      setDetails("");

      const response = await fetch("/api/upload/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "test-file.txt",
          fileType: "text/plain",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("✅ S3 connection successful!");
        setDetails(
          `Upload ID: ${result.uploadId}\nBucket: ${result.bucket}\nRegion: ${result.region}`
        );
      } else {
        setStatus("❌ S3 connection failed");
        setDetails(
          `Error: ${result.error}\nBucket: ${result.bucket}\nRegion: ${result.region}`
        );
      }
    } catch (error) {
      setStatus("❌ Network error");
      setDetails("Error: " + error.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AWS Setup Test</h1>
      <p className="mb-4 text-gray-600">
        Current region should be: <strong>eu-north-1</strong>
      </p>

      <button
        onClick={testS3Connection}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test S3 Connection
      </button>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p
          className={status.includes("✅") ? "text-green-600" : "text-red-600"}
        >
          {status || "Click the button to test your AWS setup"}
        </p>

        {details && (
          <div className="mt-4 p-3 bg-white rounded border">
            <h3 className="font-semibold mb-2">Details:</h3>
            <pre className="text-sm whitespace-pre-wrap">{details}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
