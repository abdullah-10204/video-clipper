export class User {
    constructor(data) {
        this.email = data.email;
        this.password = data.password;
        this.role = data.role; // 'studio', 'agency', 'editor'
        this.companyName = data.companyName;
        this.isActive = data.isActive ?? true;
        this.permissions = data.permissions || {};
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    static getDefaultPermissions(role) {
        switch (role) {
            case 'studio':
                return {
                    canUpload: true,
                    canShare: true,
                    canManagePodcasts: true,
                    canViewAnalytics: true,
                    canDeletePodcasts: true
                };
            case 'agency':
                return {
                    canCreateClips: true,
                    canShareClips: true,
                    canManageEditors: true,
                    canViewAssignedPodcasts: true,
                    canDeleteOwnClips: true
                };
            case 'editor':
                return {
                    canDownloadClips: true,
                    canViewAssignedClips: true
                };
            default:
                return {};
        }
    }
}
