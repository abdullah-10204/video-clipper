"use client"
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  Camera,
  Upload,
  Users,
  Video,
  Download,
  Share,
  Eye,
  Plus,
  Settings,
  LogOut,
  Bell,
  Search,
  Filter,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Edit,
  Trash2,
  Clock,
  Calendar,
  User,
  Building,
  Mail,
  Check,
  X,
  AlertCircle,
  Loader,
} from "lucide-react";

// Auth Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      verifyAndSetUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAndSetUser = async (token) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("auth-token");
      }
    } catch (error) {
      console.error("Auth verification error:", error);
      localStorage.removeItem("auth-token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Toast Context and Provider
const ToastContext = createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast }) {
  const typeStyles = {
    success: "bg-green-600 border-green-500",
    error: "bg-red-600 border-red-500",
    info: "bg-blue-600 border-blue-500",
    warning: "bg-yellow-600 border-yellow-500",
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div
      className={`p-4 rounded-lg border backdrop-blur-sm text-white ${
        typeStyles[toast.type]
      } animate-in slide-in-from-right`}
    >
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// UI Components
function LoadingSpinner({ size = "md", text = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-purple-500 ${sizeClasses[size]}`}
      ></div>
      {text && <p className="mt-2 text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-gray-900 rounded-2xl w-full ${sizeClasses[size]} border border-purple-500/20`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  ...props
}) {
  const baseClasses =
    "font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transform hover:scale-[1.02]",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    outline:
      "border border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    ghost: "hover:bg-gray-800 text-gray-300 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 ${
        hover ? "hover:border-purple-500/40 transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Navigation Component
function Navigation({ user, onLogout }) {
  return (
    <nav className="border-b border-gray-800 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PodClip Pro</h1>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role} Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">
                  {user?.companyName || user?.email}
                </p>
                <p className="text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, gradient, color }) {
  return (
    <Card className={`p-6 bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${color} opacity-80`}>{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`w-10 h-10 ${color} opacity-80`} />
      </div>
    </Card>
  );
}

// Enhanced Uploader Component
function EnhancedUploader({
  onUploadSuccess,
  maxFileSize = 107374182400,
  acceptedTypes = "video/*,audio/*",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (file.size > maxFileSize) {
      addToast(
        `File too large. Maximum size: ${formatFileSize(maxFileSize)}`,
        "error"
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      await simulateUpload();

      onUploadSuccess({
        filename: `upload_${Date.now()}_${file.name}`,
        originalName: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      });

      addToast("File uploaded successfully!", "success");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Upload error:", error);
        addToast(`Upload failed: ${error.message}`, "error");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const simulateUpload = async () => {
    for (let i = 0; i <= 100; i += 10) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error("Upload aborted");
      }
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const abortUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <Card className="p-8 text-center">
      <div
        className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
          dragActive
            ? "border-purple-500 bg-purple-500/10"
            : isUploading
            ? "border-gray-600"
            : "border-gray-600 hover:border-gray-500"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={abortUpload}>
              Cancel Upload
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Drop your files here or click to browse
              </h3>
              <p className="text-gray-400 text-sm">
                Supports files up to {formatFileSize(maxFileSize)}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={acceptedTypes}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// Video Player Component
function VideoPlayer({ src, onTimeUpdate, onLoadedMetadata }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onLoadedMetadata?.(videoRef.current.duration);
    }
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => seekTo(Math.max(0, currentTime - 10))}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full text-white transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-white" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setVolume(vol);
                    if (videoRef.current) videoRef.current.volume = vol;
                  }}
                  className="w-20"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Main App Component
export default function PodcastPlatformComplete() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState("landing");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleAuth = (userData) => {
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("landing");
    setUploadedFile(null);
  };

  const handleUploadSuccess = (fileData) => {
    setUploadedFile(fileData);
    setCurrentView("editor");
  };

  const handleClipCreated = (clipData) => {
    console.log("Clip created:", clipData);
    // Handle clip creation success
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-black">
          {/* Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
          </div>

          {/* Navigation */}
          {user && <Navigation user={user} onLogout={handleLogout} />}

          {/* Main Content */}
          <div className="relative z-10">
            {currentView === "landing" && (
              <LandingPage onGetStarted={() => setShowAuth(true)} />
            )}
            {currentView === "dashboard" && (
              <DashboardContent
                user={user}
                onUploadSuccess={handleUploadSuccess}
              />
            )}
            {currentView === "editor" && uploadedFile && (
              <EditorView
                fileData={uploadedFile}
                onClipCreated={handleClipCreated}
                onBack={() => setCurrentView("dashboard")}
              />
            )}
          </div>

          {/* Auth Modal */}
          <AuthModal
            isOpen={showAuth}
            onClose={() => setShowAuth(false)}
            onAuth={handleAuth}
          />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

// Landing Page Component
function LandingPage({ onGetStarted }) {
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl backdrop-blur-sm border border-purple-500/20">
              <Camera className="w-16 h-16 text-purple-400" />
            </div>
          </div>

          <h1 className="text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
            The Future of
            <br />
            Podcast Editing
          </h1>

          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Revolutionize your content workflow. Upload once, collaborate
            seamlessly, and create viral clips with precision. Built for
            studios, agencies, and editors.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button size="lg" onClick={onGetStarted}>
              Get Started Free
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:border-purple-500/40 transition-all duration-300">
              <Upload className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Upload
              </h3>
              <p className="text-gray-400">
                Upload your podcast once and grant access to multiple agencies
                instantly
              </p>
            </Card>

            <Card className="p-6 hover:border-blue-500/40 transition-all duration-300">
              <Users className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Team Collaboration
              </h3>
              <p className="text-gray-400">
                Seamless workflow between studios, agencies, and editors
              </p>
            </Card>

            <Card className="p-6 hover:border-green-500/40 transition-all duration-300">
              <Video className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Precision Clipping
              </h3>
              <p className="text-gray-400">
                Create perfect clips with frame-accurate editing tools
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth Modal Component
function AuthModal({ isOpen, onClose, onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "agency",
    companyName: "",
  });
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onAuth(formData);
      onClose();
      addToast(
        `${isLogin ? "Signed in" : "Account created"} successfully!`,
        "success"
      );
    } catch (error) {
      addToast("Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLogin ? "Welcome Back" : "Join the Platform"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        {!isLogin && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="studio">Podcast Studio</option>
                <option value="agency">Content Agency</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <Input
              type="text"
              placeholder="Company/Studio Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </Modal>
  );
}

// Dashboard Content Component
function DashboardContent({ user, onUploadSuccess }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [podcasts] = useState([
    {
      id: 1,
      title: "Tech Talk Episode #45",
      duration: "2:45:30",
      uploadDate: "2025-01-15",
      size: "1.2 GB",
      status: "processed",
      accessCount: 3,
    },
    {
      id: 2,
      title: "Marketing Insights Podcast",
      duration: "1:30:45",
      uploadDate: "2025-01-12",
      size: "890 MB",
      status: "processing",
      accessCount: 0,
    },
  ]);

  const [clips] = useState([
    {
      id: 1,
      title: "Best Marketing Tips",
      duration: "0:02:30",
      createdDate: "2025-01-16",
      size: "45 MB",
      podcastTitle: "Marketing Insights",
      agency: "Creative Agency Co.",
    },
    {
      id: 2,
      title: "Tech Prediction 2025",
      duration: "0:01:45",
      createdDate: "2025-01-15",
      size: "32 MB",
      podcastTitle: "Tech Talk Episode #45",
      agency: "Digital Media House",
    },
  ]);

  const renderStudioDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Studio Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your podcasts and grant access to agencies
          </p>
        </div>

        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-5 h-5" />
          Upload Podcast
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Podcasts"
          value="24"
          icon={Video}
          gradient="from-purple-900/50 to-purple-800/30"
          color="text-purple-200"
        />
        <StatsCard
          title="Active Collaborations"
          value="8"
          icon={Users}
          gradient="from-blue-900/50 to-blue-800/30"
          color="text-blue-200"
        />
        <StatsCard
          title="Clips Created"
          value="156"
          icon={Download}
          gradient="from-green-900/50 to-green-800/30"
          color="text-green-200"
        />
        <StatsCard
          title="Storage Used"
          value="45.2 GB"
          icon={Upload}
          gradient="from-orange-900/50 to-orange-800/30"
          color="text-orange-200"
        />
      </div>

      {/* Podcasts List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Your Podcasts</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAgencyDashboard = () => (
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

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Available Podcasts"
          value="12"
          icon={Video}
          gradient="from-blue-900/50 to-blue-800/30"
          color="text-blue-200"
        />
        <StatsCard
          title="Clips Created"
          value="89"
          icon={Download}
          gradient="from-green-900/50 to-green-800/30"
          color="text-green-200"
        />
        <StatsCard
          title="Active Editors"
          value="5"
          icon={Users}
          gradient="from-purple-900/50 to-purple-800/30"
          color="text-purple-200"
        />
        <StatsCard
          title="Projects"
          value="7"
          icon={Settings}
          gradient="from-orange-900/50 to-orange-800/30"
          color="text-orange-200"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("podcasts")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "podcasts"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Available Podcasts
        </button>
        <button
          onClick={() => setActiveTab("clips")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "clips"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          My Clips
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "podcasts" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} isAgency />
          ))}
        </div>
      )}

      {activeTab === "clips" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      )}
    </div>
  );

  const renderEditorDashboard = () => (
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

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard
          title="Available Clips"
          value="23"
          icon={Video}
          gradient="from-green-900/50 to-green-800/30"
          color="text-green-200"
        />
        <StatsCard
          title="Downloaded"
          value="18"
          icon={Download}
          gradient="from-blue-900/50 to-blue-800/30"
          color="text-blue-200"
        />
        <StatsCard
          title="Active Projects"
          value="4"
          icon={Settings}
          gradient="from-purple-900/50 to-purple-800/30"
          color="text-purple-200"
        />
      </div>

      {/* Available Clips */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Available Clips</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} isEditor />
          ))}
        </div>
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (user?.role) {
      case "studio":
        return renderStudioDashboard();
      case "agency":
        return renderAgencyDashboard();
      case "editor":
        return renderEditorDashboard();
      default:
        return renderAgencyDashboard();
    }
  };

  return (
    <main className="container mx-auto px-6 py-8">
      {getDashboardContent()}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Podcast"
        size="lg"
      >
        <EnhancedUploader
          onUploadSuccess={(data) => {
            onUploadSuccess(data);
            setShowUploadModal(false);
          }}
        />
      </Modal>
    </main>
  );
}

// Podcast Card Component
function PodcastCard({ podcast, isAgency = false }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const { addToast } = useToast();

  const handleShare = () => {
    if (!shareEmail) {
      addToast("Please enter an email address", "error");
      return;
    }

    addToast(`Invitation sent to ${shareEmail}`, "success");
    setShowShareModal(false);
    setShareEmail("");
  };

  return (
    <>
      <Card hover className="p-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
              {isAgency ? (
                <Button variant="success" size="sm">
                  <Edit className="w-4 h-4" />
                  Open Editor
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share className="w-4 h-4" />
                    Share ({podcast.accessCount})
                  </Button>

                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Grant Access"
      >
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Agency email address"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            label="Email Address"
          />

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1">
              Send Invite
            </Button>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Clip Card Component
function ClipCard({ clip, isEditor = false }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [editorEmails, setEditorEmails] = useState("");
  const { addToast } = useToast();

  const handleDownload = () => {
    addToast("Download started", "success");
  };

  const handleShare = () => {
    if (!editorEmails) {
      addToast("Please enter editor email addresses", "error");
      return;
    }

    addToast("Clips shared with editors", "success");
    setShowShareModal(false);
    setEditorEmails("");
  };

  return (
    <>
      <Card hover className="p-4">
        <div className="w-full h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl mb-4 flex items-center justify-center">
          <Video className="w-8 h-8 text-purple-400" />
        </div>

        <h3 className="font-semibold text-white mb-1">{clip.title}</h3>
        <p className="text-sm text-gray-400 mb-1">From: {clip.podcastTitle}</p>
        <p className="text-sm text-gray-400 mb-3">
          {clip.duration} • {clip.size}
        </p>
        {isEditor && (
          <p className="text-xs text-purple-400 mb-3">By: {clip.agency}</p>
        )}

        <div className="flex gap-2">
          {isEditor ? (
            <Button
              variant="success"
              size="sm"
              onClick={handleDownload}
              className="w-full"
            >
              <Download className="w-4 h-4" />
              Download Clip
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="flex-1"
              >
                <Share className="w-4 h-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share with Editors"
      >
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter editor emails (comma separated)"
            value={editorEmails}
            onChange={(e) => setEditorEmails(e.target.value)}
            label="Editor Email Addresses"
          />

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1">
              Send Invites
            </Button>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Editor View Component
function EditorView({ fileData, onClipCreated, onBack }) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipName, setClipName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();

  const handleLoadedMetadata = (videoDuration) => {
    setDuration(videoDuration);
    setEndTime(videoDuration);
  };

  const setStartPoint = () => {
    setStartTime(currentTime);
    addToast("Start point set", "success");
  };

  const setEndPoint = () => {
    setEndTime(currentTime);
    addToast("End point set", "success");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const createClip = async () => {
    if (startTime >= endTime) {
      addToast("Start time must be before end time", "error");
      return;
    }

    if (!clipName.trim()) {
      addToast("Please enter a name for the clip", "error");
      return;
    }

    setIsCreating(true);
    setProgress(0);

    try {
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const clipData = {
        title: clipName.trim(),
        startTime,
        endTime,
        duration: endTime - startTime,
        originalFilename: fileData.filename,
        createdAt: new Date().toISOString(),
      };

      onClipCreated(clipData);
      addToast("Clip created successfully!", "success");

      setClipName("");
      setStartTime(0);
      setEndTime(duration);
    } catch (error) {
      console.error("Error creating clip:", error);
      addToast("Failed to create clip", "error");
    } finally {
      setIsCreating(false);
      setProgress(0);
    }
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clip Editor</h1>
          <p className="text-gray-400">Editing: {fileData.originalName}</p>
        </div>

        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        {/* Video Player */}
        <VideoPlayer
          src={fileData.url}
          onTimeUpdate={setCurrentTime}
          onLoadedMetadata={handleLoadedMetadata}
        />

        {/* Timeline Controls */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Clip Selection
          </h3>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                readOnly
              />

              <div
                className="absolute top-0 w-1 h-8 bg-green-500 pointer-events-none"
                style={{ left: `${(startTime / duration) * 100}%` }}
              />
              <div
                className="absolute top-0 w-1 h-8 bg-red-500 pointer-events-none"
                style={{ left: `${(endTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-400">
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <span>
                Selection: {formatTime(startTime)} - {formatTime(endTime)} (
                {formatTime(endTime - startTime)})
              </span>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="success" size="sm" onClick={setStartPoint}>
                Set Start ({formatTime(startTime)})
              </Button>
              <Button variant="danger" size="sm" onClick={setEndPoint}>
                Set End ({formatTime(endTime)})
              </Button>
            </div>
          </div>
        </Card>

        {/* Clip Creation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Clip</h3>

          {isCreating && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Creating clip...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Clip Name"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
              placeholder="Enter clip name"
              disabled={isCreating}
            />

            <Button
              onClick={createClip}
              disabled={isCreating || !clipName.trim()}
              loading={isCreating}
              className="w-full"
            >
              {isCreating ? "Creating Clip..." : "Create Clip"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
