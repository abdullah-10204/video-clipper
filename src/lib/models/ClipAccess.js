export class ClipAccess {
    constructor(data) {
        this.clipId = data.clipId;
        this.editorId = data.editorId;
        this.agencyId = data.agencyId;
        this.grantedAt = data.grantedAt || new Date();
        this.isActive = data.isActive ?? true;
        this.downloadCount = data.downloadCount || 0;
        this.lastDownloadAt = data.lastDownloadAt;
    }
}