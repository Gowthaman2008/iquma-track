"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ImageSlider } from "@/components/ui/image-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, AlertCircle, Building2, UserCircle2 } from "lucide-react";

const GoogleIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();

  // Mode: "credentials" (for both admin and employee) or "google" (1-click directory)
  const [authMode, setAuthMode] = useState<"credentials" | "google">("credentials");
  const [email, setEmail] = useState("ahmed.khan@alhouf.sa");
  const [password, setPassword] = useState("Employee@123456");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reliable local corporate Saudi images for the left-side slider (100% guaranteed uptime, zero latency)
  const sliderImages = [
    "/hero/arabic-hero.jpg",
    "/hero/riyadh-skyline.jpg",
    "/hero/saudi-corporate-tower.jpg",
    "/hero/alhouf-engineering.jpg",
  ];

  // Directory accounts for 1-Click Google Sign In
  const demoGoogleAccounts = [
    { name: "Ahmed Khan", email: "ahmed.khan@alhouf.sa", role: "Senior Civil Engineer" },
    { name: "Maria Santos", email: "maria.s@alhouf.sa", role: "Talent Acquisition Specialist" },
    { name: "Omar Al-Khatib", email: "omar.khatib@alhouf.sa", role: "Project Safety Manager" },
    { name: "Zainab Al-Hassan", email: "zainab.h@alhouf.sa", role: "GRO Officer" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Google 1-Click Sign-in handler
  const handleGoogleSignIn = async (account: { name: string; email: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      router.push("/portal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Standard Credentials submit handler (for both Admins and Employees)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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

      // Route according to role: employees go to /portal, admins go to /dashboard
      if (data.user?.role === "EMPLOYEE") {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
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
    setAuthMode("credentials");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 relative">
      {/* Return to Home link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-secondary transition backdrop-blur-md shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to AL Houf Homepage</span>
      </Link>

      <motion.div 
        className="w-full max-w-5xl h-auto min-h-[640px] lg:h-[720px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left side: Image Slider with Brand Overlay */}
        <div className="hidden lg:block relative w-full h-full">
          <ImageSlider images={sliderImages} interval={4500} className="w-full h-full" />
          
          {/* Subtle gradient vignette & Corporate badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none flex flex-col justify-between p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 border border-white/20 p-1 flex items-center justify-center backdrop-blur-md">
                <img
                  src="/logo/arabic-logo.png"
                  alt="AL HOUF Group"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide">AL HOUF GROUP</h3>
                <p className="text-[11px] text-emerald-400 font-medium">مجموعة الهفوف للإنشاءات والمقاولات</p>
              </div>
            </div>

            <div className="space-y-1.5 mb-6">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
                Saudi Vision 2030 Compliant
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Unified Workforce &amp; Iqama Intelligence
              </h2>
              <p className="text-xs text-gray-300/90 leading-relaxed max-w-sm">
                Single sign-on access for corporate staff, HR executives, and site engineers across Saudi Arabia.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full h-full bg-card text-card-foreground flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
          <motion.div 
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-emerald-950/40 border border-emerald-500/30 p-1 flex items-center justify-center lg:hidden">
                <img
                  src="/logo/arabic-logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <motion.h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome Back
                </motion.h1>
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-6">
              Enter your credentials to access your employee or admin workspace.
            </motion.p>

            {/* Error Message */}
            {error && (
              <motion.div 
                variants={itemVariants}
                className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Mode / Identity Switcher */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-5">
              <Button 
                type="button"
                variant={authMode === "credentials" ? "default" : "outline"}
                onClick={() => setAuthMode("credentials")}
                className="w-full text-xs font-semibold"
              >
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Credentials
              </Button>
              <Button 
                type="button"
                variant={authMode === "google" ? "default" : "outline"}
                onClick={() => setAuthMode("google")}
                className="w-full text-xs font-semibold"
              >
                <GoogleIcon className="mr-1.5 w-3.5 h-3.5" />
                Google SSO
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-card px-2 text-muted-foreground">
                  {authMode === "google" ? "1-Click Directory Login" : "Work Email & Password"}
                </span>
              </div>
            </motion.div>

            {/* Google 1-Click Sign In Directory */}
            {authMode === "google" ? (
              <motion.div variants={itemVariants} className="space-y-2 mb-6">
                <p className="text-xs text-muted-foreground mb-2">
                  Select your corporate Google account to sign in immediately:
                </p>
                {demoGoogleAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleGoogleSignIn(account)}
                    disabled={loading}
                    className="w-full p-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-accent hover:border-primary/50 transition-all flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {account.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{account.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-primary/80 font-medium px-2 py-0.5 rounded bg-primary/10">
                      {account.role}
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : (
              /* Credentials Form */
              <motion.form variants={itemVariants} onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@alhouf.sa" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <Label htmlFor="rememberMe" className="text-xs text-muted-foreground font-normal cursor-pointer">
                    Remember this workstation
                  </Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2">
                  {loading ? "Authenticating..." : "Log In to Workspace"}
                </Button>
              </motion.form>
            )}

            {/* Quick Demo Test Credential Chips */}
            <motion.div variants={itemVariants} className="pt-5 border-t border-border mt-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Quick Test Credentials
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCredentials("ahmed.khan@alhouf.sa", "Employee@123456")}
                  className="px-2 py-1.5 rounded-md border border-border bg-secondary/60 text-[11px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer text-center"
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials("hr@iqamatrack.sa", "Hr@123456")}
                  className="px-2 py-1.5 rounded-md border border-border bg-secondary/60 text-[11px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer text-center"
                >
                  HR Manager
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials("admin@iqamatrack.sa", "Admin@123456")}
                  className="px-2 py-1.5 rounded-md border border-border bg-secondary/60 text-[11px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer text-center"
                >
                  Super Admin
                </button>
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground mt-6">
              Need platform access?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Contact HR Operations
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
