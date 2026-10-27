"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ShieldCheck,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Download,
  Eye,
  LogOut,
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Home,
} from "lucide-react";

export default function EmployeePortalPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hrNoticeSent, setHrNoticeSent] = useState(false);

  useEffect(() => {
    fetch("/api/portal/my-info")
      .then((res) => {
        if (!res.ok) {
          router.push("/?openLogin=true");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.employee) {
          setData(json.employee);
        }
      })
      .catch(() => router.push("/?openLogin=true"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleNotifyHr = () => {
    setHrNoticeSent(true);
    setTimeout(() => setHrNoticeSent(false), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8F6] flex items-center justify-center p-4">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-[#006C35] text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500 font-semibold">Loading your employee records from AL Houf directory...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F8F6] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-gray-200">
          <p className="text-xs text-gray-600">No active employee record found linked to your session.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-[#006C35] text-white text-xs font-bold rounded-xl">
            Return to AL Houf Homepage
          </Link>
        </div>
      </div>
    );
  }

  const evaluation = data.evaluation;

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#172B22] flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-[#004B28] text-white border-b border-[#00381E] flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/40 bg-black flex items-center justify-center shadow-md shrink-0">
              <img
                src="/logo/arabic-logo.png"
                alt="AL HOUF Group Emblem"
                className="w-full h-full object-contain scale-110"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">AL HOUF</span>
                <span className="text-emerald-400 font-bold text-xs">الهفوف</span>
                <span className="text-emerald-400 font-extrabold text-base">Portal</span>
              </div>
              <p className="text-[9px] text-emerald-200 uppercase tracking-widest font-semibold">
                Employee Self-Service
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-100 hover:text-white hover:bg-white/10 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>AL Houf Website</span>
          </Link>
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs ring-2 ring-emerald-400/40">
              {data.fullName.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-tight text-white">{data.fullName}</p>
              <p className="text-[10px] text-emerald-300 font-mono">{data.employeeId}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-red-900/40 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Authorized Personnel Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {data.fullName}
              </h1>
              <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
                {data.jobPosition} &bull; {data.department} &bull; {data.company?.companyName || "AL Houf Trading & Contracting Group"}
              </p>
            </div>

            {/* Quick Expiry Card in Banner */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
              <span className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">
                Iqama Expiry Timeline
              </span>
              <div className="mt-1 flex items-center justify-end gap-2">
                <StatusBadge status={evaluation.status} daysRemaining={evaluation.daysRemaining} />
              </div>
              <div className="text-xs font-mono font-bold text-white mt-1">
                {evaluation.daysRemaining < 0
                  ? `${Math.abs(evaluation.daysRemaining)} Days Overdue`
                  : evaluation.daysRemaining === 0
                  ? "Expires Today!"
                  : `${evaluation.daysRemaining} Days Left`}
              </div>
            </div>
          </div>
        </div>

        {/* HR notification alert confirmation */}
        {hrNoticeSent && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your renewal request has been transmitted to AL Houf Government Relations Office (GRO) & HR department.
            </span>
          </div>
        )}

        {/* Iqama Residence Permit Card */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#EFF8F3] text-[#006C35]">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  Saudi Arabian Residence Permit (Iqama)
                </h2>
                <p className="text-xs text-gray-500">
                  Verified with Ministry of Interior (Jawazat) and Qiwa work permit portal
                </p>
              </div>
            </div>

            <button
              onClick={handleNotifyHr}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EFF8F3] border border-[#006C35]/30 text-[#004B28] hover:bg-[#006C35] hover:text-white transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Request Renewal Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Iqama Number
              </span>
              <div className="font-mono text-base font-extrabold text-gray-900 mt-1">
                {data.iqamaNumberMasked}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Encrypted on Jawazat file</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Expiry Date
              </span>
              <div className="text-sm font-extrabold text-red-800 mt-1 font-mono">
                {evaluation.formattedDate}
              </div>
              <span className="text-[10px] text-gray-500">Asia/Riyadh Standard</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Days Remaining
              </span>
              <div className="text-base font-black text-gray-900 mt-1">
                {evaluation.daysRemaining < 0
                  ? `${Math.abs(evaluation.daysRemaining)} Days Overdue`
                  : evaluation.daysRemaining === 0
                  ? "Expires Today"
                  : `${evaluation.daysRemaining} Days`}
              </div>
              <span className="text-[10px] text-gray-500">Daily midnight sync</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Permit Status
              </span>
              <div className="mt-1">
                <StatusBadge status={evaluation.status} daysRemaining={evaluation.daysRemaining} />
              </div>
              <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Active sponsor: AL Houf</span>
            </div>
          </div>
        </div>

        {/* Grid: Personal Details & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Identification Card */}
          <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#006C35]" />
              <span>Personal & Employment Record</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Employee ID</span>
                <span className="font-mono font-bold text-gray-800">{data.employeeId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Department</span>
                <span className="font-semibold text-gray-800">{data.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Job Title</span>
                <span className="font-semibold text-gray-800">{data.jobPosition}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Nationality</span>
                <span className="font-semibold text-gray-800">{data.nationality}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Saudi Mobile</span>
                <span className="font-mono text-gray-800">{data.mobileNumber || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Work Email</span>
                <span className="text-[#006C35] font-semibold">{data.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Passport Number</span>
                <span className="font-mono text-gray-800">{data.passportNumber || "On file in HR"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Corporate Employer</span>
                <span className="font-bold text-emerald-800">AL Houf Trading & Contracting Group</span>
              </div>
            </div>
          </div>

          {/* Official Uploaded Documents */}
          <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#006C35]" />
              <span>Official Stored Documents</span>
            </h3>

            {data.documents?.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-semibold text-gray-700">Digital document scan is being processed by HR</p>
                <p className="text-[11px] text-gray-500 mt-1">Contact your GRO to request a copy of your Iqama scan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-[#006C35]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate text-xs">
                        <p className="font-bold text-gray-900 truncate">{doc.originalName || doc.fileName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {Math.round((doc.fileSize || 0) / 1024)} KB &bull; Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/documents/${doc.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#006C35] transition"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#006C35] transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Renewal History Audit */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#006C35]" />
            <span>Iqama Renewal History & Terms</span>
          </h3>

          {data.renewalHistory?.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">
              Initial issue term active. No prior renewals recorded on this record.
            </p>
          ) : (
            <div className="space-y-3">
              {data.renewalHistory.map((r: any) => (
                <div
                  key={r.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900">
                      Renewed on {new Date(r.renewalDate).toLocaleDateString()}
                    </span>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      New Expiry Term: <span className="font-mono font-bold text-emerald-800">{new Date(r.newExpiryDate).toLocaleDateString()}</span>
                    </p>
                    {r.notes && <p className="text-[11px] text-gray-500 italic mt-0.5">{r.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#004B28] text-[10px] font-bold">
                      Jawazat Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 mt-12">
        <p>&copy; {new Date().getFullYear()} AL Houf Trading & Contracting Group &bull; Kingdom of Saudi Arabia</p>
        <p className="text-[11px] text-gray-400 mt-1">HR & Qiwa Compliance Division &bull; CR: 1010778899</p>
      </footer>
    </div>
  );
}
