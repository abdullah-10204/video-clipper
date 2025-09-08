import { NextResponse } from 'next/server';
import { S3Client, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export async function POST(request) {
    try {
        const { uploadId, filename } = await request.json();

        // console.log('Aborting multipart upload:', uploadId);

        const command = new AbortMultipartUploadCommand({
            Bucket: process.env.AWS_UPLOAD_BUCKET,
            Key: filename,
            UploadId: uploadId
        });

        await s3Client.send(command);

        return NextResponse.json({
            success: true,
            message: 'Upload aborted successfully'
        });

    } catch (error) {
        console.error('Multipart abort error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
}