"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, login, register } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      validateInvite();
    } else {
      setError("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  const validateInvite = async () => {
    try {
      const response = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setInviteData(data.invite);
        setFormData((prev) => ({ ...prev, email: data.invite.recipientEmail }));
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to validate invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let authResult;

      if (isLogin) {
        authResult = await login(formData.email, formData.password);
      } else {
        authResult = await register({
          ...formData,
          role: inviteData.type === "clip_access" ? "editor" : "agency",
        });
      }

      if (authResult.success) {
        // Accept the invitation
        const acceptResponse = await fetch("/api/invites/accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({ token, userEmail: formData.email }),
        });

        const acceptData = await acceptResponse.json();

        if (acceptData.success) {
          router.push("/dashboard");
        } else {
          setError(acceptData.error);
        }
      } else {
        setError(authResult.error);
      }
    } catch (error) {
      setError("Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Invalid Invitation
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            You're Invited!
          </h2>
          <p className="text-gray-400">
            {inviteData?.type === "clip_access"
              ? "You've been invited to access clips as an editor"
              : "You've been invited to access podcasts"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Company/Studio Name"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Sign In & Accept"
              : "Create Account & Accept"}
          </button>
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
      </div>
    </div>
  );
}
