export const USER_ROLES = {
    STUDIO: 'studio',
    AGENCY: 'agency',
    EDITOR: 'editor'
};

export const PODCAST_STATUS = {
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    FAILED: 'failed'
};

export const CLIP_STATUS = {
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    FAILED: 'failed'
};

export const INVITE_TYPES = {
    PODCAST_ACCESS: 'podcast_access',
    CLIP_ACCESS: 'clip_access'
};

export const FILE_LIMITS = {
    MAX_PODCAST_SIZE: 10 * 1024 * 1024 * 1024, // 10GB
    MAX_CLIP_SIZE: 1 * 1024 * 1024 * 1024, // 1GB
    CHUNK_SIZE: 5 * 1024 * 1024, // 5MB chunks for multipart upload
    SUPPORTED_FORMATS: [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'audio/mp3',
        'audio/wav',
        'audio/mpeg',
        'audio/mp4'
    ]
};

export const PERMISSIONS = {
    STUDIO: {
        canUpload: true,
        canShare: true,
        canManagePodcasts: true,
        canViewAnalytics: true,
        canDeletePodcasts: true
    },
    AGENCY: {
        canCreateClips: true,
        canShareClips: true,
        canManageEditors: true,
        canViewAssignedPodcasts: true,
        canDeleteOwnClips: true
    },
    EDITOR: {
        canDownloadClips: true,
        canViewAssignedClips: true
    }
};