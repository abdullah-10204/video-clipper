import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Podcast } from '@/lib/models/Podcast';

// Get podcasts for authenticated user
export const GET = withAuth(async (request) => {
    try {
        const { db } = await connectToDatabase();
        const user = request.user;
        let podcasts = [];

        if (user.role === 'studio') {
            // Studio sees their own podcasts
            podcasts = await db.collection('podcasts')
                .find({ studioId: new ObjectId(user.userId) })
                .sort({ createdAt: -1 })
                .toArray();

            // Add access count for each podcast
            for (let podcast of podcasts) {
                const accessCount = await db.collection('podcast_access')
                    .countDocuments({ podcastId: podcast._id, isActive: true });
                podcast.accessCount = accessCount;
            }

        } else if (user.role === 'agency') {
            // Agency sees podcasts they have access to
            const accessRecords = await db.collection('podcast_access')
                .find({
                    agencyId: new ObjectId(user.userId),
                    isActive: true
                })
                .toArray();

            if (accessRecords.length > 0) {
                const podcastIds = accessRecords.map(record => record.podcastId);
                podcasts = await db.collection('podcasts')
                    .find({ _id: { $in: podcastIds } })
                    .sort({ createdAt: -1 })
                    .toArray();

                // Add access permissions
                podcasts = podcasts.map(podcast => {
                    const access = accessRecords.find(record =>
                        record.podcastId.toString() === podcast._id.toString()
                    );
                    return {
                        ...podcast,
                        permissions: access?.permissions || {}
                    };
                });
            }
        }

        return NextResponse.json({
            success: true,
            podcasts
        });

    } catch (error) {
        console.error('Get podcasts error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch podcasts'
        }, { status: 500 });
    }
}, ['studio', 'agency']);

// Create new podcast (studio only)
export const POST = withAuth(async (request) => {
    try {
        const data = await request.json();
        const user = request.user;

        const podcast = new Podcast({
            ...data,
            studioId: new ObjectId(user.userId)
        });

        const { db } = await connectToDatabase();
        const result = await db.collection('podcasts').insertOne(podcast);

        return NextResponse.json({
            success: true,
            podcastId: result.insertedId,
            podcast: {
                ...podcast,
                _id: result.insertedId
            }
        });

    } catch (error) {
        console.error('Create podcast error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create podcast'
        }, { status: 500 });
    }
}, ['studio']);
