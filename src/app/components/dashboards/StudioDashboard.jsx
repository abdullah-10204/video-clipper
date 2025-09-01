


function StudioDashboard({ user }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  const handleShare = (podcastId) => {
    console.log(`Sharing podcast ${podcastId} with ${shareEmail}`);
    setShowShareModal(null);
    setShareEmail("");
    // Here you would send the actual invite
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Studio Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your podcasts and grant access to agencies
          </p>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Upload Podcast
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Podcasts</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            <Video className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Active Collaborations</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-2xl border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Clips Created</p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
            <Download className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-2xl border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm">Storage Used</p>
              <p className="text-2xl font-bold text-white">45.2 GB</p>
            </div>
            <Upload className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Your Podcasts</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {mockPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/40 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <Video className="w-8 h-8 text-purple-400" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {podcast.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>{podcast.duration}</span>
                    <span>{podcast.size}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        podcast.status === "processed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {podcast.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowShareModal(podcast.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-lg transition-colors"
                    >
                      <Share className="w-4 h-4" />
                      Share ({podcast.accessCount})
                    </button>

                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Grant Access
            </h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Agency email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleShare(showShareModal)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition-colors"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => setShowShareModal(null)}
                  className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
