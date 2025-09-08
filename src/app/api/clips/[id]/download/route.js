import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Track clip download
export const POST = withAuth(async (request, { params }) => {
    try {
        const user = request.user;
        const clipId = params.id;

        const { db } = await connectToDatabase();

        // Verify access
        let hasAccess = false;

        if (user.role === 'editor') {
            // Check clip access
            const access = await db.collection('clip_access').findOne({
                clipId: new ObjectId(clipId),
                editorId: new ObjectId(user.userId),
                isActive: true
            });

            if (access) {
                hasAccess = true;
                // Update download count
                await db.collection('clip_access').updateOne(
                    { _id: access._id },
                    {
                        $inc: { downloadCount: 1 },
                        $set: { lastDownloadAt: new Date() }
                    }
                );
            }
        } else if (user.role === 'agency') {
            // Agency can download their own clips
            const clip = await db.collection('clips').findOne({
                _id: new ObjectId(clipId),
                agencyId: new ObjectId(user.userId)
            });
            hasAccess = !!clip;
        } else if (user.role === 'studio') {
            // Studio can download clips from their podcasts
            const clip = await db.collection('clips').findOne({
                _id: new ObjectId(clipId),
                studioId: new ObjectId(user.userId)
            });
            hasAccess = !!clip;
        }

        if (!hasAccess) {
            return NextResponse.json({
                success: false,
                error: 'Access denied'
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            message: 'Download tracked successfully'
        });

    } catch (error) {
        console.error('Track download error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to track download'
        }, { status: 500 });
    }
}, ['studio', 'agency', 'editor']);