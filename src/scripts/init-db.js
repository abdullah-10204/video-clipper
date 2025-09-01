const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(process.env.MONGODB_DB_NAME || 'podclip-pro');

        // Create collections
        const collections = [
            'users',
            'podcasts',
            'clips',
            'podcast_access',
            'clip_access',
            'invites'
        ];

        for (const collectionName of collections) {
            try {
                await db.createCollection(collectionName);
                console.log(`Created collection: ${collectionName}`);
            } catch (error) {
                if (error.code === 48) {
                    console.log(`Collection ${collectionName} already exists`);
                } else {
                    throw error;
                }
            }
        }

        // Create indexes
        console.log('Creating indexes...');

        // Users indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ role: 1 });

        // Podcasts indexes
        await db.collection('podcasts').createIndex({ studioId: 1 });
        await db.collection('podcasts').createIndex({ status: 1 });
        await db.collection('podcasts').createIndex({ createdAt: -1 });

        // Clips indexes
        await db.collection('clips').createIndex({ podcastId: 1 });
        await db.collection('clips').createIndex({ agencyId: 1 });
        await db.collection('clips').createIndex({ studioId: 1 });
        await db.collection('clips').createIndex({ createdAt: -1 });

        // Podcast Access indexes
        await db.collection('podcast_access').createIndex(
            { podcastId: 1, agencyId: 1 },
            { unique: true }
        );
        await db.collection('podcast_access').createIndex({ agencyId: 1 });

        // Clip Access indexes
        await db.collection('clip_access').createIndex(
            { clipId: 1, editorId: 1 },
            { unique: true }
        );
        await db.collection('clip_access').createIndex({ editorId: 1 });
        await db.collection('clip_access').createIndex({ agencyId: 1 });

        // Invites indexes
        await db.collection('invites').createIndex({ token: 1 }, { unique: true });
        await db.collection('invites').createIndex({ recipientEmail: 1 });
        await db.collection('invites').createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0 }
        );

        console.log('Database initialization completed successfully!');

    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };