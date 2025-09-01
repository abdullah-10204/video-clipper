// src/app/api/upload/complete/route.js
import { NextResponse } from 'next/server';
import { S3Client, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export async function POST(request) {
    try {
        const { uploadId, parts, filename } = await request.json();

        // console.log('Completing upload for:', filename);
        // console.log('Upload ID:', uploadId);
        // console.log('Parts received:', parts);

        // Validate parts structure
        if (!Array.isArray(parts) || parts.length === 0) {
            throw new Error('Invalid parts array');
        }

        // Validate each part has required fields
        for (const part of parts) {
            if (!part.PartNumber || !part.ETag) {
                console.error('Invalid part structure:', part);
                throw new Error(`Invalid part structure - missing PartNumber or ETag`);
            }

            // Ensure ETag is properly quoted (S3 requirement)
            if (!part.ETag.startsWith('"') || !part.ETag.endsWith('"')) {
                // console.log(`ETag not quoted for part ${part.PartNumber}: ${part.ETag}`);
                // ETags should already be quoted from S3 response, but double-check
            }
        }

        // Sort parts by PartNumber to ensure correct order
        const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

        // console.log('Sorted parts for completion:', sortedParts);

        const command = new CompleteMultipartUploadCommand({
            Bucket: process.env.AWS_UPLOAD_BUCKET,
            Key: filename,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: sortedParts
            }
        });

        const result = await s3Client.send(command);

        // console.log('Upload completed successfully:', result.Location);

        return NextResponse.json({
            success: true,
            message: 'Upload completed successfully',
            location: result.Location,
            etag: result.ETag
        });

    } catch (error) {
        console.error('Multipart completion error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.Code,
            statusCode: error.$metadata?.httpStatusCode
        });

        return NextResponse.json({
            success: false,
            error: error.message,
            errorCode: error.Code,
            errorName: error.name
        }, { status: 500 });
    }
}