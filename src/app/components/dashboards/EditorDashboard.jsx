function EditorDashboard({ user }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Editor Dashboard
          </h1>
          <p className="text-gray-400">
            Access and download clips assigned to you
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-2xl border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Available Clips</p>
              <p className="text-2xl font-bold text-white">23</p>
            </div>
            <Video className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Downloaded</p>
              <p className="text-2xl font-bold text-white">18</p>
            </div>
            <Download className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-white">4</p>
            </div>
            <Settings className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Available Clips */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Available Clips</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {mockClips.map((clip) => (
            <div
              key={clip.id}
              className="p-4 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-green-500/40 transition-all duration-300"
            >
              <div className="w-full h-32 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-xl mb-4 flex items-center justify-center">
                <Video className="w-8 h-8 text-green-400" />
              </div>

              <h3 className="font-semibold text-white mb-1">{clip.title}</h3>
              <p className="text-sm text-gray-400 mb-1">
                From: {clip.podcastTitle}
              </p>
              <p className="text-sm text-gray-400 mb-3">
                {clip.duration} • {clip.size}
              </p>
              <p className="text-xs text-purple-400 mb-3">By: {clip.agency}</p>

              <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                Download Clip
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
