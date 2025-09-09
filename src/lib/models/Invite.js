export class Invite {
    constructor(data) {
        this.token = data.token;
        this.type = data.type; // 'podcast_access', 'clip_access'
        this.podcastId = data.podcastId;
        this.clipId = data.clipId;
        this.studioId = data.studioId;
        this.agencyId = data.agencyId;
        this.recipientEmail = data.recipientEmail;
        this.createdAt = data.createdAt || new Date();
        this.expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        this.isUsed = data.isUsed || false;
        this.usedAt = data.usedAt;
    }
}