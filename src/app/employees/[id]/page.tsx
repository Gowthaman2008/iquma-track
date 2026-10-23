"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RenewModal } from "@/components/modals/RenewModal";
import { UploadDocModal } from "@/components/modals/UploadDocModal";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Building,
  Briefcase,
  Globe,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Send,
  Edit,
  Download,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function EmployeeProfileContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlainIqama, setShowPlainIqama] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "documents" | "renewals" | "notifications">("details");
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const fetchEmployeeData = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data.employee);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const handleSendReminder = async () => {
    try {
      setReminderStatus("Sending reminder email...");
      const res = await fetch(`/api/employees/${id}/remind`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setReminderStatus(`Reminder sent successfully! ${data.duplicate ? "(Duplicate alert skipped)" : ""}`);
        fetchEmployeeData();
        setTimeout(() => setReminderStatus(null), 5000);
      } else {
        setReminderStatus(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setReminderStatus(`Failed: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto py-12 text-center text-gray-500 animate-pulse">
          Loading employee profile & document records...
        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <p className="text-gray-600">Employee record not found.</p>
          <Link href="/employees" className="text-sm text-[#006C35] font-bold underline">
            Return to Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  const evaluation = employee.evaluation;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#006C35] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/employees/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-xs transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </Link>
            <button
              onClick={() => setRenewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#006C35] text-white hover:bg-[#004B28] shadow-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Iqama</span>
            </button>
          </div>
        </div>

        {/* Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg">
                {employee.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">{employee.fullName}</h1>
                  <span className="font-mono text-xs bg-white/20 px-2 py-0.5 rounded text-emerald-100 font-semibold">
                    {employee.employeeId}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  {employee.jobPosition} &bull; {employee.department} &bull; {employee.company?.companyName}
                </p>
              </div>
            </div>

            {/* Expiry Badge Hero */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-right shrink-0">
              <div className="text-[11px] text-emerald-100 uppercase tracking-wider font-semibold">
                Expiry Status
              </div>
              <div className="mt-1 flex items-center justify-end gap-2">
                <StatusBadge
                  status={evaluation.status}
                  daysRemaining={evaluation.daysRemaining}
                />
              </div>
              <div className="text-xs text-white/90 font-mono mt-1">
                Expires: {evaluation.formattedDate}
              </div>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="bg-[#F8FAF9] border-b border-[#E2ECE5] px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <a href={`mailto:${employee.email}`} className="hover:underline">{employee.email}</a>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{employee.mobileNumber || "—"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>{employee.nationality}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition"
              >
                <Upload className="w-3.5 h-3.5 text-[#006C35]" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={handleSendReminder}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger Email Reminder</span>
              </button>
            </div>
          </div>

          {/* Alert status if sent */}
          {reminderStatus && (
            <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{reminderStatus}</span>
              </div>
              <button onClick={() => setReminderStatus(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 px-6 text-xs font-bold text-gray-500 overflow-x-auto">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-3.5 px-4 border-b-2 transition ${
                activeTab === "details"
                  ? "border-[#006C35] text-[#006C35]"
                  : "border-transparent hover:text-gray-900"
              }`}
            >
              Overview & Iqama
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`py-3.5 px-4 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "documents"
                  ? "border-[#006C35] text-[#006C35]"
                  : "border-transparent hover:text-gray-900"
              }`}
            >
              <span>Uploaded Documents</span>
              <span className="px-1.5 py-0.2 bg-gray-100 rounded-full text-[10px]">
                {employee.documents?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("renewals")}
              className={`py-3.5 px-4 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "renewals"
                  ? "border-[#006C35] text-[#006C35]"
                  : "border-transparent hover:text-gray-900"
              }`}
            >
              <span>Renewal History</span>
              <span className="px-1.5 py-0.2 bg-gray-100 rounded-full text-[10px]">
                {employee.renewalHistory?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-3.5 px-4 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "notifications"
                  ? "border-[#006C35] text-[#006C35]"
                  : "border-transparent hover:text-gray-900"
              }`}
            >
              <span>Email Logs</span>
              <span className="px-1.5 py-0.2 bg-gray-100 rounded-full text-[10px]">
                {employee.notificationLogs?.length || 0}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Iqama Residence Details Card */}
                <div className="bg-[#EFF8F3] rounded-2xl p-6 border border-[#D0E5D8]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-[#004B28] uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#006C35]" />
                      <span>Saudi Arabia Residence Permit (Iqama)</span>
                    </h3>
                    <button
                      onClick={() => setShowPlainIqama(!showPlainIqama)}
                      className="inline-flex items-center gap-1 text-xs text-[#006C35] font-semibold hover:underline"
                    >
                      {showPlainIqama ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPlainIqama ? "Mask Number" : "Decrypt Full Iqama"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="text-[11px] text-gray-500 uppercase font-semibold">Iqama Number</span>
                      <div className="font-mono text-lg font-bold text-gray-900 mt-1">
                        {showPlainIqama ? employee.plainIqamaNumber : employee.iqamaNumberMasked}
                      </div>
                      <span className="text-[10px] text-emerald-700">AES-256-GCM Server Encrypted</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-500 uppercase font-semibold">Issue Date</span>
                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {evaluation.formattedIssueDate || "Recorded"}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-500 uppercase font-semibold">Official Expiry Date</span>
                      <div className="text-sm font-bold text-red-800 mt-1">
                        {evaluation.formattedDate}
                      </div>
                      <span className="text-[11px] font-bold text-amber-700">
                        {evaluation.daysRemaining < 0
                          ? `${Math.abs(evaluation.daysRemaining)} Days Overdue`
                          : `${evaluation.daysRemaining} Days Remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid of Other Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Workforce & Organization
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Department</span>
                        <span className="font-semibold text-gray-800">{employee.department}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Job Position</span>
                        <span className="font-semibold text-gray-800">{employee.jobPosition}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Employment Status</span>
                        <span className="font-semibold text-emerald-700">{employee.status}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Sponsoring Entity</span>
                        <span className="font-semibold text-gray-800">{employee.company?.companyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Passport & Personal Data
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Passport Number</span>
                        <span className="font-mono font-semibold text-gray-800">{employee.passportNumber || "Not on file"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Passport Expiry</span>
                        <span className="font-semibold text-gray-800">
                          {employee.passportExpiryDate ? new Date(employee.passportExpiryDate).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Gender</span>
                        <span className="font-semibold text-gray-800">{employee.gender || "—"}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Date of Birth</span>
                        <span className="font-semibold text-gray-800">
                          {employee.dob ? new Date(employee.dob).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                {employee.notes && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Internal HR / Qiwa / Muqeem Notes
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {employee.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Official Uploaded Documents</h3>
                    <p className="text-xs text-gray-500">Stored in private, encrypted directory with restricted access</p>
                  </div>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006C35] text-white text-xs font-semibold hover:bg-[#004B28]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Iqama Scan</span>
                  </button>
                </div>

                {employee.documents?.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs font-semibold text-gray-700">No documents uploaded yet</p>
                    <p className="text-[11px] text-gray-500 mt-1">Upload PDF or high resolution scan of the employee's Saudi Iqama card.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {employee.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-[#006C35]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate text-xs">
                            <p className="font-bold text-gray-900 truncate">{doc.originalName || doc.fileName}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {Math.round((doc.fileSize || 0) / 1024)} KB &bull; {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/documents/${doc.id}/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#006C35] transition"
                            title="Preview Inline"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#006C35] transition"
                            title="Download Secure File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Renewal History Tab */}
            {activeTab === "renewals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Iqama Renewal Audit Trail</h3>
                    <p className="text-xs text-gray-500">Historical records of previous Iqama expiry terms and processing costs</p>
                  </div>
                  <button
                    onClick={() => setRenewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006C35] text-white text-xs font-semibold hover:bg-[#004B28]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Record New Renewal</span>
                  </button>
                </div>

                {employee.renewalHistory?.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
                    No previous renewals recorded yet. First issue term currently active.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employee.renewalHistory.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              Renewed on {new Date(item.renewalDate).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Processed
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">
                            Previous Expiry: <span className="font-mono">{new Date(item.previousExpiryDate).toLocaleDateString()}</span> &rarr;{" "}
                            New Expiry: <span className="font-mono font-bold text-emerald-800">{new Date(item.newExpiryDate).toLocaleDateString()}</span>
                          </p>
                          {item.notes && <p className="text-[11px] text-gray-500 mt-1 italic">{item.notes}</p>}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-sm text-[#006C35]">
                            {item.cost ? `SAR ${item.cost.toLocaleString()}` : "SAR 9,650"}
                          </span>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            By {item.updatedByName || "HR Manager"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Email Logs Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Automated Notification Reminders Log</h3>
                  <p className="text-xs text-gray-500">Log of automated 30d, 15d, 7d, 3d, 1d, 0d and weekly emails sent for this Iqama</p>
                </div>

                {employee.notificationLogs?.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
                    No notifications have been triggered yet for this employee.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {employee.notificationLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{log.notificationType}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SENT" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">To: {log.recipient}</p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">Key: {log.uniqueNotificationKey}</p>
                        </div>
                        <div className="text-right text-[11px] text-gray-500">
                          {log.sentAt ? new Date(log.sentAt).toLocaleString() : "Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renew Modal */}
      <RenewModal
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        employeeId={employee.id}
        employeeName={employee.fullName}
        currentExpiryStr={evaluation.formattedDate}
        onSuccess={fetchEmployeeData}
      />

      {/* Upload Document Modal */}
      <UploadDocModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        employeeId={employee.id}
        employeeName={employee.fullName}
        onSuccess={fetchEmployeeData}
      />
    </AppLayout>
  );
}

export default function EmployeeProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-xs">
          Loading employee profile...
        </div>
      }
    >
      <EmployeeProfileContent />
    </React.Suspense>
  );
}

