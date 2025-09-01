export class PodcastAccess {
    constructor(data) {
        this.podcastId = data.podcastId;
        this.agencyId = data.agencyId;
        this.studioId = data.studioId;
        this.grantedAt = data.grantedAt || new Date();
        this.isActive = data.isActive ?? true;
        this.permissions = data.permissions || {
            canCreateClips: true,
            canViewMetadata: true
        };
    }
}