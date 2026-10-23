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
    <div className="flex h-screen bg-[#F5F8F6] text-[#172B22] overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#004B28] text-white shrink-0 shadow-xl border-r border-[#00381E] z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#006034] bg-gradient-to-b from-[#003B20] to-[#004B28]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006C35] to-[#008C4A] border border-white/20 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">Iqama</span>
                <span className="text-emerald-400 font-extrabold text-lg">Track</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 uppercase tracking-widest font-semibold">
                Saudi Expiry System
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#006C35] text-white shadow-md shadow-[#00381E]/40 border-l-4 border-emerald-400 pl-3"
                    : "text-emerald-100/80 hover:bg-[#003E21] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-emerald-200/70"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-[#006034] bg-[#003B20]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-emerald-400/40">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.name || "Loading..."}</div>
                <div className="text-[10px] text-emerald-300 uppercase font-medium">{user?.role?.replace("_", " ") || "User"}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-md text-emerald-300 hover:text-white hover:bg-red-900/60 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2ECE5] flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Saudi Riyadh Live Time */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF8F3] border border-[#D0E5D8] text-xs text-[#006C35] font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Riyadh (KSA):</span>
              <span className="font-mono text-emerald-800">{riyadhTime || "00:00:00"}</span>
            </div>

            {/* Active Company Badge */}
            {user?.companyName && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                <span className="truncate max-w-[200px]">{user.companyName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Run Expiry Check Engine Button */}
            <button
              onClick={handleRunExpiryCheck}
              disabled={isRunningCron}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#006C35] text-white hover:bg-[#005228] transition shadow-sm disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunningCron ? "animate-spin" : "text-emerald-300"}`} />
              <span className="hidden sm:inline">{isRunningCron ? "Checking..." : "Run Expiry Engine"}</span>
            </button>

            {/* Notifications Button */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-gray-600 hover:bg-[#EFF8F3] hover:text-[#006C35] transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </Link>

            {/* User Dropdown / Name */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#006C35] text-white text-xs font-bold flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || "User"}</p>
                <p className="text-[10px] text-gray-500">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Global Alert Notification Banner if Cron Run */}
        {cronMessage && (
          <div className="bg-[#EFF8F3] border-b border-[#006C35]/20 px-6 py-2 flex items-center justify-between text-xs text-[#004B28] animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006C35]" />
              <span>{cronMessage}</span>
            </div>
            <button onClick={() => setCronMessage(null)} className="text-gray-500 hover:text-gray-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F5F8F6]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 bg-[#004B28] text-white h-full p-4 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="font-extrabold text-lg text-white">IqamaTrack</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-emerald-300">
                <X className="w-6 h-6" />
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "bg-[#006C35] text-white" : "text-emerald-100 hover:bg-[#003E21]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-200 hover:bg-red-950/40 w-full"
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
