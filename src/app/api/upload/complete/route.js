// src/app/api/upload/complete/route.js
import { NextResponse } from "next/server";
import {
  S3Client,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { uploadId, parts, filename } = await request.json();

    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error("Invalid parts array");
    }

    const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: filename,
      UploadId: uploadId,
      MultipartUpload: { Parts: sortedParts },
    });

    const result = await s3Client.send(command);

    // 🔑 Generate playback URL
    const getCmd = new GetObjectCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: filename,
    });

    const playbackUrl = await getSignedUrl(s3Client, getCmd, {
      expiresIn: 86400, // 24h
    });

    return NextResponse.json({
      success: true,
      message: "Upload completed successfully",
      location: result.Location,
      etag: result.ETag,
      s3Key: filename,
      playbackUrl, // 👈 return this so frontend can store in Mongo
    });
  } catch (error) {
    console.error("Multipart completion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
