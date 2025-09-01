import cloudinary from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const { filename, startTime, endTime, clipName } = await request.json();

        if (!filename || startTime === undefined || endTime === undefined) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        // Upload to Cloudinary first (if not already there)
        const uploadResult = await cloudinary.v2.uploader.upload(
            `./public/uploads/${filename}`,
            {
                resource_type: 'video',
                public_id: `podcast_clips/${filename}_${Date.now()}`
            }
        );

        // Create clip using Cloudinary's transformation
        const clipUrl = cloudinary.v2.url(uploadResult.public_id, {
            resource_type: 'video',
            transformation: [
                {
                    flags: 'splice',
                    start_offset: startTime,
                    duration: endTime - startTime
                },
                { format: 'mp4' }
            ],
            sign_url: true // Generate signed URL for security
        });

        // Generate a download URL
        const downloadUrl = cloudinary.v2.url(uploadResult.public_id, {
            resource_type: 'video',
            transformation: [
                {
                    flags: 'splice',
                    start_offset: startTime,
                    duration: endTime - startTime
                },
                { format: 'mp4' }
            ],
            flags: 'attachment', // This triggers download instead of streaming
            sign_url: true
        });

        return NextResponse.json({
            success: true,
            clipUrl,
            downloadUrl,
            clipName: clipName || 'clip',
            duration: (endTime - startTime).toFixed(2)
        });
    } catch (error) {
        console.error('Cloudinary error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create clip: ' + error.message
        });
    }
}