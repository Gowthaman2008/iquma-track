"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Building2,
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [company, setCompany] = useState({
    companyName: "",
    email: "",
    hrContactEmail: "",
    commercialRegNo: "",
    saudiTimezone: "Asia/Riyadh",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    reminderDays: [30, 15, 7, 3, 1, 0],
    recipients: ["EMPLOYEE", "HR_MANAGER", "SUPER_ADMIN"],
    postExpiryFrequencyDays: 7,
  });

  useEffect(() => {
    fetch("/api/settings/company")
      .then((res) => res.json())
      .then((data) => {
        if (data.company) {
          setCompany({
            companyName: data.company.companyName || "",
            email: data.company.email || "",
            hrContactEmail: data.company.hrContactEmail || "",
            commercialRegNo: data.company.commercialRegNo || "",
            saudiTimezone: data.company.saudiTimezone || "Asia/Riyadh",
          });

          if (data.company.notificationSettings) {
            const ns = data.company.notificationSettings;
            setNotificationSettings({
              enabled: ns.enabled,
              reminderDays: JSON.parse(ns.reminderDays || "[30, 15, 7, 3, 1, 0]"),
              recipients: JSON.parse(ns.recipients || '["EMPLOYEE","HR_MANAGER"]'),
              postExpiryFrequencyDays: ns.postExpiryFrequencyDays || 7,
            });
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDay = (day: number) => {
    setNotificationSettings((prev) => {
      const exists = prev.reminderDays.includes(day);
      return {
        ...prev,
        reminderDays: exists
          ? prev.reminderDays.filter((d) => d !== day)
          : [...prev.reminderDays, day].sort((a, b) => b - a),
      };
    });
  };

  const handleToggleRecipient = (role: string) => {
    setNotificationSettings((prev) => {
      const exists = prev.recipients.includes(role);
      return {
        ...prev,
        recipients: exists
          ? prev.recipients.filter((r) => r !== role)
          : [...prev.recipients, role],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...company,
          ...notificationSettings,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setMessage({ type: "success", text: data.message });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-12 text-center text-gray-500 animate-pulse">
          Loading corporate settings...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#006C35]" />
            <span>Company & Regulatory Notification Settings</span>
          </h1>
          <p className="text-xs text-[#6B7C72] mt-0.5">
            Configure entity credentials, CR registry, notification schedules, and automated email rules.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Entity Details */}
          <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 md:p-8 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
              1. Saudi Corporate Registration Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Company Official Name *
                </label>
                <input
                  type="text"
                  required
                  value={company.companyName}
                  onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Commercial Registration (CR Number)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1010482910"
                  value={company.commercialRegNo}
                  onChange={(e) => setCompany({ ...company, commercialRegNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  HR Department Contact Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. hr@company.sa"
                  value={company.hrContactEmail}
                  onChange={(e) => setCompany({ ...company, hrContactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">Receives cc for all upcoming expiry reminders.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Standard Regulatory Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value="Asia/Riyadh (UTC+3:00 - Kingdom of Saudi Arabia)"
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Automated Notification Engine Configuration */}
          <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#006C35]" />
                  <span>2. Automated Email Notification Schedule</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  The notification engine evaluates deadlines daily and executes scheduled emails.
                </p>
              </div>

              {/* Master Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.enabled}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006C35]"></div>
                <span className="text-xs font-bold text-gray-800">
                  {notificationSettings.enabled ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            {/* Reminder Days Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Trigger Reminders at Specific Milestones:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { days: 30, label: "30 Days Before Expiry" },
                  { days: 15, label: "15 Days Before Expiry" },
                  { days: 7, label: "7 Days Before Expiry" },
                  { days: 3, label: "3 Days Before Expiry" },
                  { days: 1, label: "1 Day Before Expiry" },
                  { days: 0, label: "On the Expiry Date (Today)" },
                ].map((item) => {
                  const isChecked = notificationSettings.reminderDays.includes(item.days);
                  return (
                    <label
                      key={item.days}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        isChecked
                          ? "bg-[#EFF8F3] border-[#006C35] text-[#004B28]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDay(item.days)}
                        className="rounded text-[#006C35] focus:ring-[#006C35]"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Recipient Roles */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Notification Email Recipients:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { role: "EMPLOYEE", label: "Employee Direct Email" },
                  { role: "HR_MANAGER", label: "HR Manager / Contact Email" },
                  { role: "SUPER_ADMIN", label: "Company Administrator" },
                ].map((item) => {
                  const isChecked = notificationSettings.recipients.includes(item.role);
                  return (
                    <label
                      key={item.role}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        isChecked
                          ? "bg-[#EFF8F3] border-[#006C35] text-[#004B28]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRecipient(item.role)}
                        className="rounded text-[#006C35] focus:ring-[#006C35]"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Post Expiry Frequency */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Post-Expiry Overdue Reminder Frequency
              </label>
              <select
                value={notificationSettings.postExpiryFrequencyDays}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    postExpiryFrequencyDays: parseInt(e.target.value, 10),
                  })
                }
                className="w-full sm:w-64 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
              >
                <option value={7}>Weekly (Every 7 Days until renewed)</option>
                <option value={14}>Bi-weekly (Every 14 Days)</option>
                <option value={30}>Monthly (Every 30 Days)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-md shadow-[#006C35]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Configuration..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
