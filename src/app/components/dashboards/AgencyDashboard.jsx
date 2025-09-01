function AgencyDashboard({ user }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Agency Dashboard
          </h1>
          <p className="text-gray-400">
            Access podcasts and create clips for your clients
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Available Podcasts</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <Video className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-2xl border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Clips Created</p>
              <p className="text-2xl font-bold text-white">89</p>
            </div>
            <Download className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Active Editors</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <Users className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-2xl border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm">Projects</p>
              <p className="text-2xl font-bold text-white">7</p>
            </div>
            <Settings className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Available Podcasts */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Available Podcasts</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {mockPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-blue-500/40 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                  <Video className="w-8 h-8 text-blue-400" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {podcast.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>{podcast.duration}</span>
                    <span>{podcast.size}</span>
                  </div>

                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Open Editor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Clips */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Your Clips</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {mockClips.map((clip) => (
            <div
              key={clip.id}
              className="p-4 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700"
            >
              <div className="w-full h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl mb-4 flex items-center justify-center">
                <Video className="w-8 h-8 text-purple-400" />
              </div>

              <h3 className="font-semibold text-white mb-1">{clip.title}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {clip.duration} • {clip.size}
              </p>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-lg transition-colors">
                  Share to Editor
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
