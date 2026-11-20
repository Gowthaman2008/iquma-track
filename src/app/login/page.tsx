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
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("ahmed.khan@alhouf.sa");
  const [password, setPassword] = useState("Employee@123456");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          router.replace(data.user.role === "EMPLOYEE" ? "/portal" : "/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  // Reliable local corporate Saudi images for the left-side slider
  const sliderImages = [
    "/hero/arabic-hero.jpg",
    "/hero/riyadh-skyline.jpg",
    "/hero/saudi-corporate-tower.jpg",
    "/hero/alhouf-engineering.jpg",
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
  };

  return (
    <div className="w-full min-h-screen min-h-[100svh] flex flex-col items-center justify-center bg-background p-3 sm:p-6">
      <motion.div 
        className="w-full max-w-5xl h-auto min-h-0 sm:min-h-[580px] lg:h-[720px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
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
                Secure access for corporate staff, HR executives, and site engineers across Saudi Arabia.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full h-full bg-card text-card-foreground flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
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

            {/* Credentials Form */}
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
                  className="bg-secondary/40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/40 font-mono"
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

            {/* Quick Demo Test Credential Chips */}
            <motion.div variants={itemVariants} className="pt-5 border-t border-border mt-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Quick Test Credentials
              </p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setCredentials("ahmed.khan@alhouf.sa", "Employee@123456")}
                  className="px-1.5 sm:px-2 py-1.5 rounded-md border border-border bg-secondary/60 text-[10px] sm:text-[11px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer text-center truncate"
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials("hr@iqamatrack.sa", "Hr@123456")}
                  className="px-1.5 sm:px-2 py-1.5 rounded-md border border-border bg-secondary/60 text-[10px] sm:text-[11px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer text-center truncate"
                >
                  HR Manager
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials("admin@iqamatrack.sa", "Admin@123456")}
                  className="px-1.5 sm:px-2 py-1.5 rounded-md border border-border bg-secondary/60 text-[10px] sm:text-[11px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer text-center truncate"
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
