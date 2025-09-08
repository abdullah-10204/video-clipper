import { NextResponse } from 'next/server';
import { S3Client, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

// Create S3 client with correct region
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1', // Default to eu-north-1
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export async function POST(request) {
    try {
        const { filename, fileType } = await request.json();

        // console.log('Creating multipart upload for:', filename);
        // console.log('Using bucket:', process.env.AWS_UPLOAD_BUCKET);
        // console.log('Using region:', process.env.AWS_REGION);

        const command = new CreateMultipartUploadCommand({
            Bucket: process.env.AWS_UPLOAD_BUCKET,
            Key: filename,
            ContentType: fileType
        });

        const response = await s3Client.send(command);

        return NextResponse.json({
            success: true,
            uploadId: response.UploadId,
            bucket: process.env.AWS_UPLOAD_BUCKET,
            region: process.env.AWS_REGION
        });

    } catch (error) {
        console.error('Multipart upload creation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            bucket: process.env.AWS_UPLOAD_BUCKET,
            region: process.env.AWS_REGION
        });
    }
}