"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, X, ArrowRight, Lock, Mail, CheckCircle2 } from "lucide-react";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GoogleLoginModal({ isOpen, onClose, onSuccess }: GoogleLoginModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email/password tab vs Google 1-click
  const [loginMode, setLoginMode] = useState<"google" | "credentials">("google");
  const [email, setEmail] = useState("ahmed.khan@alhouf.sa");
  const [password, setPassword] = useState("Employee@123456");

  if (!isOpen) return null;

  // Handle Google 1-Click Login
  const handleGoogleSignIn = async (selectedEmployee: { name: string; email: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedEmployee.email,
          name: selectedEmployee.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      onClose();
      if (onSuccess) onSuccess();
      router.push("/portal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle traditional employee credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      onClose();
      if (onSuccess) onSuccess();
      router.push("/portal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoGoogleAccounts = [
    { name: "Ahmed Khan", email: "ahmed.khan@alhouf.sa", role: "Senior Civil Engineer" },
    { name: "Maria Santos", email: "maria.s@alhouf.sa", role: "Talent Acquisition Specialist" },
    { name: "Omar Al-Khatib", email: "omar.khatib@alhouf.sa", role: "Project Safety Manager" },
    { name: "Zainab Al-Hassan", email: "zainab.h@alhouf.sa", role: "GRO Officer" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0c120f] rounded-3xl max-w-md w-full shadow-2xl border border-emerald-500/25 overflow-hidden relative text-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#031c10] via-[#052c18] to-[#041a0e] p-6 text-white text-center relative border-b border-emerald-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border border-emerald-500/40 bg-black flex items-center justify-center shadow-lg mb-2.5">
            <img
              src="/logo/arabic-logo.png"
              alt="AL HOUF Group Arabic Logo"
              className="w-full h-full object-contain scale-110"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">AL HOUF Employee Portal</h2>
            <span className="text-emerald-400 font-semibold text-sm">الهفوف</span>
          </div>
          <p className="text-xs text-emerald-300/80 mt-0.5">
            View your personal records, Iqama expiry status, and documents
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 text-xs font-semibold text-gray-400 bg-black/40">
          <button
            onClick={() => setLoginMode("google")}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-2 ${
              loginMode === "google"
                ? "border-b-2 border-emerald-500 text-emerald-400 bg-white/[0.04]"
                : "hover:text-gray-200"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
          <button
            onClick={() => setLoginMode("credentials")}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-2 ${
              loginMode === "credentials"
                ? "border-b-2 border-emerald-500 text-emerald-400 bg-white/[0.04]"
                : "hover:text-gray-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Work Email & Pass</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 text-xs text-red-300 rounded-xl">
              {error}
            </div>
          )}

          {loginMode === "google" ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 text-center">
                Select your verified corporate or Google account to access your employee information:
              </p>

              <div className="space-y-2">
                {demoGoogleAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleGoogleSignIn(account)}
                    disabled={loading}
                    className="w-full p-3 rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/[0.08] transition flex items-center justify-between text-left group bg-white/[0.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs group-hover:bg-emerald-500 group-hover:text-black transition">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{account.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{account.email}</p>
                        <p className="text-[10px] text-emerald-400">{account.role}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-white/10">
                <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Secured with AL Houf Corporate Google Directory &bull; Asia/Riyadh
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Employee Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:bg-white/[0.05] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:bg-white/[0.05] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="mt-1 flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Demo password: <code className="text-emerald-400 font-mono">Employee@123456</code></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>{loading ? "Authenticating..." : "Log In as Employee"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
