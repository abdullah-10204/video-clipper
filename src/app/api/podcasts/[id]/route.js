import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get specific podcast
export async function GET(request, { params }) {
    return withAuth(async (req) => {
        try {
            const { db } = await connectToDatabase();
            const user = req.user;
            const podcastId = params.id;

            let podcast = null;

            if (user.role === 'studio') {
                podcast = await db.collection('podcasts').findOne({
                    _id: new ObjectId(podcastId),
                    studioId: new ObjectId(user.userId)
                });
            } else if (user.role === 'agency') {
                // Check if agency has access
                const access = await db.collection('podcast_access').findOne({
                    podcastId: new ObjectId(podcastId),
                    agencyId: new ObjectId(user.userId),
                    isActive: true
                });

                if (access) {
                    podcast = await db.collection('podcasts').findOne({
                        _id: new ObjectId(podcastId)
                    });
                    podcast.permissions = access.permissions;
                }
            }

            if (!podcast) {
                return NextResponse.json({
                    success: false,
                    error: 'Podcast not found or access denied'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                podcast
            });

        } catch (error) {
            console.error('Get podcast error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch podcast'
            }, { status: 500 });
        }
    }, ['studio', 'agency'])(request);
}

// Update podcast (studio only)
export async function PUT(request, { params }) {
    return withAuth(async (req) => {
        try {
            const data = await req.json();
            const user = req.user;
            const podcastId = params.id;

            const { db } = await connectToDatabase();

            const result = await db.collection('podcasts').updateOne(
                {
                    _id: new ObjectId(podcastId),
                    studioId: new ObjectId(user.userId)
                },
                {
                    $set: {
                        ...data,
                        updatedAt: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Podcast not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                message: 'Podcast updated successfully'
            });

        } catch (error) {
            console.error('Update podcast error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update podcast'
            }, { status: 500 });
        }
    }, ['studio'])(request);
}

// Delete podcast (studio only)
export async function DELETE(request, { params }) {
    return withAuth(async (req) => {
        try {
            const user = req.user;
            const podcastId = params.id;

            const { db } = await connectToDatabase();

            // Delete podcast and all related data
            await db.collection('podcasts').deleteOne({
                _id: new ObjectId(podcastId),
                studioId: new ObjectId(user.userId)
            });

            await db.collection('podcast_access').deleteMany({
                podcastId: new ObjectId(podcastId)
            });

            await db.collection('clips').deleteMany({
                podcastId: new ObjectId(podcastId)
            });

            return NextResponse.json({
                success: true,
                message: 'Podcast deleted successfully'
            });

        } catch (error) {
            console.error('Delete podcast error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete podcast'
            }, { status: 500 });
        }
    }, ['studio'])(request);
}
