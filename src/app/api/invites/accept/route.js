import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    try {
        const { token, userEmail } = await request.json();

        if (!token || !userEmail) {
            return NextResponse.json({
                success: false,
                error: 'Token and user email are required'
            }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Find and validate invite
        const invite = await db.collection('invites').findOne({
            token,
            agencyEmail: userEmail,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!invite) {
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired invitation'
            }, { status: 400 });
        }

        // Check if user exists and has agency role
        const user = await db.collection('users').findOne({
            email: userEmail,
            role: 'agency'
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found or not an agency'
            }, { status: 404 });
        }

        // Create podcast access record
        const access = {
            podcastId: invite.podcastId,
            agencyId: user._id,
            studioId: invite.studioId,
            grantedAt: new Date(),
            isActive: true
        };

        await db.collection('podcast_access').insertOne(access);

        // Mark invite as used
        await db.collection('invites').updateOne(
            { _id: invite._id },
            { $set: { isUsed: true, usedAt: new Date() } }
        );

        return NextResponse.json({
            success: true,
            message: 'Access granted successfully'
        });

    } catch (error) {
        console.error('Invite acceptance error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to accept invitation'
        }, { status: 500 });
    }
}