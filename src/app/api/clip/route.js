import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function POST(request) {
  try {
    const { filename, fileType } = await request.json();

    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Filename required'
      });
    }

    // Generate a unique filename if not provided
    const finalFilename = filename || `clip_${uuidv4()}.webm`;

    // Create presigned URL for upload
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_CLIP_BUCKET,
      Key: finalFilename,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600 // 1 hour
    });

    // Also create a presigned URL for download
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_CLIP_BUCKET,
      Key: finalFilename
    });

    const downloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 86400 // 24 hours
    });

    return NextResponse.json({
      success: true,
      url: uploadUrl,
      downloadUrl: downloadUrl,
      filename: finalFilename
    });

  } catch (error) {
    console.error('Clip upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate upload URL'
    });
  }
}