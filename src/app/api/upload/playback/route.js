import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export async function POST(request) {
    try {
        const { filename } = await request.json();

        // console.log('Generating playback URL for:', filename);

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_UPLOAD_BUCKET,
            Key: filename
        });

        const url = await getSignedUrl(s3Client, command, {
            expiresIn: 86400 // 24 hours
        });

        return NextResponse.json({
            success: true,
            url,
            filename
        });

    } catch (error) {
        console.error('Playback URL generation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
}