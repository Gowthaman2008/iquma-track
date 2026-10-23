"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@iqamatrack.sa");
  const [password, setPassword] = useState("Admin@123456");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003B20] via-[#004B28] to-[#006C35] p-4 sm:p-6">
      {/* Background Decorative Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#008C4A]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-900/10">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-b from-[#004B28] to-[#006C35] px-8 pt-8 pb-6 text-white text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">IqamaTrack</h1>
          <p className="text-xs text-emerald-200 mt-1">Saudi Employee Document & Expiry Portal</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. hr@company.sa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#006C35] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#006C35] border-gray-300 rounded focus:ring-[#006C35]"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-gray-600">
                Remember this workstation for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#006C35] to-[#008C4A] text-white hover:from-[#004B28] hover:to-[#006C35] transition shadow-lg shadow-[#006C35]/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Instant Testing */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCredentials("admin@iqamatrack.sa", "Admin@123456")}
                className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-[#004B28] hover:bg-emerald-100 text-center transition"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setCredentials("hr@iqamatrack.sa", "Hr@123456")}
                className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-[#004B28] hover:bg-emerald-100 text-center transition"
              >
                HR Manager
              </button>
              <button
                type="button"
                onClick={() => setCredentials("ahmed.khan@iqamatrack.sa", "Employee@123456")}
                className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-[#004B28] hover:bg-emerald-100 text-center transition"
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100">
          <p className="text-[11px] text-gray-500">
            Compliant with Saudi Ministry of Human Resources (Qiwa & Muqeem)
          </p>
        </div>
      </div>
    </div>
  );
}
