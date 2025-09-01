export class Clip {
    constructor(data) {
        this.title = data.title;
        this.description = data.description || '';
        this.podcastId = data.podcastId;
        this.agencyId = data.agencyId;
        this.studioId = data.studioId;
        this.filename = data.filename;
        this.s3Key = data.s3Key;
        this.duration = data.duration;
        this.fileSize = data.fileSize;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.thumbnailUrl = data.thumbnailUrl;
        this.downloadUrl = data.downloadUrl;
        this.status = data.status || 'processing'; // 'processing', 'processed', 'failed'
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
}
