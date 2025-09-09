export class Podcast {
    constructor(data) {
        this.title = data.title;
        this.description = data.description || '';
        this.filename = data.filename;
        this.originalName = data.originalName;
        this.fileSize = data.fileSize;
        this.duration = data.duration;
        this.fileType = data.fileType;
        this.studioId = data.studioId;
        this.s3Key = data.s3Key;
        this.thumbnailUrl = data.thumbnailUrl;
        this.status = data.status || 'processing'; // 'processing', 'processed', 'failed'
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
}