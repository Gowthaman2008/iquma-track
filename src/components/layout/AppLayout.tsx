"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  RefreshCw,
  Bell,
  MailCheck,
  FileBarChart2,
  UserCog,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    companyName?: string;
  } | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [riyadhTime, setRiyadhTime] = useState("");
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);

  // Fetch current user and unread alerts
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login");
      });

    // Fetch alerts count
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) {
          setUnreadAlerts(data.stats.criticalAlerts + data.stats.expiringSoonAlerts + data.stats.expiredAlerts);
        }
      })
      .catch(() => {});
  }, [router]);

  // Live Riyadh clock (Asia/Riyadh, UTC+3)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setRiyadhTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      console.error(e);
      router.push("/login");
    }
  };

  const handleRunExpiryCheck = async () => {
    setIsRunningCron(true);
    setCronMessage(null);
    try {
      const res = await fetch("/api/cron/expiry-check", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCronMessage(`Scanned ${data.report.totalScanned} employees. ${data.report.triggered} notices sent, ${data.report.skippedDuplicates} duplicates prevented.`);
        setTimeout(() => setCronMessage(null), 5000);
      } else {
        setCronMessage(data.error || "Execution failed.");
      }
    } catch (err: any) {
      setCronMessage("Network error triggering check.");
    } finally {
      setIsRunningCron(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Add Employee", href: "/employees/new", icon: UserPlus, hideFor: ["EMPLOYEE"] },
    { label: "Expiry Calendar", href: "/calendar", icon: Calendar },
    { label: "Renewal History", href: "/renewals", icon: RefreshCw },
    { label: "Notification Center", href: "/notifications", icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { label: "Email Logs", href: "/email-logs", icon: MailCheck, hideFor: ["EMPLOYEE"] },
    { label: "Reports & Export", href: "/reports", icon: FileBarChart2 },
    { label: "User Management", href: "/users", icon: UserCog, showOnly: ["SUPER_ADMIN"] },
    { label: "Company Settings", href: "/settings/company", icon: Building2, hideFor: ["EMPLOYEE"] },
    { label: "Profile Settings", href: "/settings/profile", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-['Inter',sans-serif]">
      {/* Sidebar Desktop - Modern Enterprise Light (Linear / Stripe style) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-700 shrink-0 border-r border-slate-200/80 z-20 shadow-xs">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center shadow-xs overflow-hidden p-1">
              <img
                src="/logo/arabic-logo.png"
                alt="AL HOUF Group"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">Iqama</span>
                <span className="text-emerald-600 font-extrabold text-base">Track</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                AL HOUF &bull; Enterprise
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            if (item.showOnly && user && !item.showOnly.includes(user.role)) return null;
            if (item.hideFor && user && item.hideFor.includes(user.role)) return null;

            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50/90 text-emerald-800 border border-emerald-200/70 shadow-xs"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">{user?.name || "Loading..."}</div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">{user?.role?.replace("_", " ") || "User"}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Saudi Riyadh Live Time */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-xs text-slate-700 font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Riyadh (KSA):</span>
              <span className="font-mono text-emerald-700">{riyadhTime || "00:00:00"}</span>
            </div>

            {/* Active Company Badge */}
            {user?.companyName && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[220px]">{user.companyName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Run Expiry Check Engine Button */}
            <button
              onClick={handleRunExpiryCheck}
              disabled={isRunningCron}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunningCron ? "animate-spin" : "text-white"}`} />
              <span className="hidden sm:inline">{isRunningCron ? "Checking..." : "Run Expiry Engine"}</span>
            </button>

            {/* Notifications Button */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Global Alert Notification Banner if Cron Run */}
        {cronMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{cronMessage}</span>
            </div>
            <button onClick={() => setCronMessage(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white text-slate-800 h-full p-4 z-10 shadow-2xl border-r border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center">
                  <img src="/logo/arabic-logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-base text-slate-900">IqamaTrack</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                if (item.showOnly && user && !item.showOnly.includes(user.role)) return null;
                if (item.hideFor && user && item.hideFor.includes(user.role)) return null;
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
