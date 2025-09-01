import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Token is required'
            }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const invite = await db.collection('invites').findOne({
            token,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!invite) {
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired invitation'
            }, { status: 404 });
        }

        // Get additional context based on invite type
        let context = {};

        if (invite.podcastId) {
            const podcast = await db.collection('podcasts').findOne({
                _id: invite.podcastId
            });
            context.podcastTitle = podcast?.title;
        }

        if (invite.clipId) {
            const clip = await db.collection('clips').findOne({
                _id: invite.clipId
            });
            context.clipTitle = clip?.title;
        }

        return NextResponse.json({
            success: true,
            invite: {
                type: invite.type,
                recipientEmail: invite.recipientEmail,
                createdAt: invite.createdAt,
                expiresAt: invite.expiresAt,
                ...context
            }
        });

    } catch (error) {
        console.error('Validate invite error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to validate invitation'
        }, { status: 500 });
    }
}
