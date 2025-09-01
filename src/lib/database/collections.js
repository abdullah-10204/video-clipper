import { connectToDatabase } from '../mongodb.js';

export class DatabaseManager {
    constructor() {
        this.db = null;
    }

    async connect() {
        if (!this.db) {
            const { db } = await connectToDatabase();
            this.db = db;
        }
        return this.db;
    }

    async initializeIndexes() {
        const db = await this.connect();

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
        await db.collection('podcast_access').createIndex({ podcastId: 1, agencyId: 1 }, { unique: true });
        await db.collection('podcast_access').createIndex({ agencyId: 1 });

        // Clip Access indexes
        await db.collection('clip_access').createIndex({ clipId: 1, editorId: 1 }, { unique: true });
        await db.collection('clip_access').createIndex({ editorId: 1 });
        await db.collection('clip_access').createIndex({ agencyId: 1 });

        // Invites indexes
        await db.collection('invites').createIndex({ token: 1 }, { unique: true });
        await db.collection('invites').createIndex({ recipientEmail: 1 });
        await db.collection('invites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }
}

// Initialize database
export const dbManager = new DatabaseManager();