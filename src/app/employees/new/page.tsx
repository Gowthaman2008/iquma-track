"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  ArrowLeft,
  Calendar,
  CreditCard,
  Building,
  Briefcase,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  Hash,
  Wallet,
  Clock,
  Sparkles,
} from "lucide-react";

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; companyName: string }>>([]);

  const [formData, setFormData] = useState({
    no: "",
    fullName: "",
    nameArb: "",
    iqamaNumber: "",
    nationality: "Bangladesh",
    gender: "Male",
    iqamaIssueDate: new Date().toISOString().split("T")[0],
    iqamaExpiryDate: "",
    status: "ACTIVE",
    bank: "",
    bankAc: "",
    salary: "",
    department: "Raja",
    companyId: "cmvla9fqc0000r7tkb82ni1l4",
    jobPosition: "Civil Site Specialist",
    email: "",
    mobileNumber: "+966 5",
    passportNumber: "",
    internalNotes: "",
  });

  // Load companies
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (data.companies && data.companies.length > 0) {
          setCompanies(data.companies);
          if (!formData.companyId) {
            setFormData((prev) => ({ ...prev, companyId: data.companies[0].id }));
          }
        }
      })
      .catch(() => { });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Live Defrance calculation
  const calculateDefrance = () => {
    if (!formData.iqamaExpiryDate) return null;
    const expiry = new Date(`${formData.iqamaExpiryDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const defrance = calculateDefrance();
  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanIqama = formData.iqamaNumber.trim();
    if (cleanIqama.length !== 10 || !/^\d+$/.test(cleanIqama)) {
      setError("Saudi Iqama/ID number must be exactly 10 numeric digits.");
      setLoading(false);
      return;
    }

    if (!formData.iqamaExpiryDate) {
      setError("Please select the Iqama expiry date.");
      setLoading(false);
      return;
    }

    const rawNo = formData.no ? parseInt(formData.no, 10) : Math.floor(1000 + Math.random() * 9000);
    const employeeId = `EMP-${String(rawNo).padStart(4, "0")}`;

    const emailToUse =
      formData.email.trim() ||
      `${formData.fullName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@alhouf.sa`;

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employeeId,
          email: emailToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee.");
      }

      // Replace history entry so browser back button does not re-open the intake form!
      router.replace("/employees");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nationalities = [
    "Bangladesh",
    "India",
    "Pakistan",
    "Sudan",
    "Egypt",
    "Morocco",
    "Sri Lanka",
    "Yemen",
    "Saudi Arabia",
    "Philippines",
    "Jordan",
    "Syria",
    "Other",
  ];

  const departments = [
    "Raja",
    "Head Office",
    "Ibra",
    "Operations",
    "Maintenance",
    "Civil Construction",
  ];

  const banks = [
    "NCBK",
    "RJHI",
    "INMA",
    "SABB",
    "RIBL",
    "ANBI",
    "BSFR",
    "SNB",
    "ALBILAD",
    "ALJAZIRA",
    "Other",
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb with Direct Return to Employee Section */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link
              href="/employees"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 hover:text-[#006C35] hover:border-emerald-200 text-gray-700 shadow-2xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel and Return to Employee Section</span>
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 hover:text-[#006C35] hover:border-emerald-200 text-gray-700 shadow-2xs transition"
            >
              <span>Dashboard</span>
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/employees"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 hover:text-[#006C35] hover:border-emerald-200 text-gray-700 shadow-2xs transition"
            >
              <span>Employee Section</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">New Employee</span>
          </div>

          <span className="text-xs text-gray-400 font-medium">Master Roster Intake</span>
        </div>

        {/* New Employee Container */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] p-6 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  New Workforce Record
                </span>
              </div>
              <h1 className="text-xl font-bold flex items-center gap-2 mt-1">
                <UserPlus className="w-5 h-5 text-emerald-300" />
                <span>Add Employee to Roster</span>
              </h1>
              <p className="text-xs text-emerald-100 mt-1">
                Register employee details, banking info, department assignment, and Saudi residence permit.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. MASTER WORKFORCE IDENTITY (Headers: NO, ID Number, Nationality, Name Eng, Name Arb) */}
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#006C35]" />
                  <span>1. Workforce Identity & Roster Details</span>
                </h3>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  Headers: NO &bull; ID Number &bull; Nationality &bull; Name Eng &bull; Name Arb
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    NO (Roster Serial #)
                  </label>
                  <input
                    type="number"
                    name="no"
                    placeholder="e.g. 177"
                    value={formData.no}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Excel sequence number</span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ID Number (10 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    name="iqamaNumber"
                    placeholder="e.g. 2619409580"
                    value={formData.iqamaNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Saudi 10-digit Iqama or National Citizen ID</span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Name Eng (Employee Full Name - English) *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    placeholder="e.g. YEASIN ARAFAT"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Name Arb (الاسم باللغة العربية)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    name="nameArb"
                    placeholder="الاسم بالعربي"
                    value={formData.nameArb}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-arabic focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    {nationalities.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    <option value="ACTIVE">Active (Working)</option>
                    <option value="VACATION">Annual Vacation</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. SAUDI IQAMA & EXPIRY DETAILS (Headers: Iqama End Date, Today, Defrance) */}
            <div className="bg-[#EFF8F3] p-6 rounded-2xl border border-[#D0E5D8] space-y-4">
              <div className="flex items-center justify-between border-b border-[#006C35]/15 pb-2">
                <h3 className="text-xs font-bold text-[#004B28] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#006C35]" />
                  <span>2. Iqama Validity & Expiry Tracking</span>
                </h3>
                <span className="text-[10px] text-[#004B28]/70 uppercase font-semibold">
                  Headers: Iqama End Date &bull; Today &bull; Defrance
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#004B28] mb-1">
                    Iqama End Date (Expiry Date) *
                  </label>
                  <input
                    type="date"
                    required
                    name="iqamaExpiryDate"
                    value={formData.iqamaExpiryDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#006C35]/30 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Official expiration registered on Absher / Muqeem</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#004B28] mb-1">
                    Iqama Issue Date
                  </label>
                  <input
                    type="date"
                    name="iqamaIssueDate"
                    value={formData.iqamaIssueDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#006C35]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Permit issuance date</span>
                </div>
              </div>

              {/* Live Defrance Preview Indicator */}
              <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3.5 border border-[#006C35]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#006C35]" />
                  <div className="text-xs">
                    <span className="text-gray-500 font-medium">Evaluation Date (Today): </span>
                    <span className="font-mono font-bold text-gray-800">{todayFormatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    Defrance (Days):
                  </span>
                  {defrance !== null ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono ${defrance < 0
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : defrance <= 7
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : defrance <= 30
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                    >
                      {defrance < 0 ? `${defrance}d (Overdue)` : `${defrance}d Remaining`}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Select expiry date</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. BANKING & PAYROLL DETAILS (Headers: Bank, Bank A/C, Salary) */}
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#006C35]" />
                  <span>3. Banking & Payroll Details</span>
                </h3>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  Headers: Bank &bull; Bank A/C &bull; Salary
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bank (Bank Name)
                  </label>
                  <input
                    type="text"
                    name="bank"
                    placeholder="e.g. NCBK, RJHI, INMA"
                    value={formData.bank}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {banks.slice(0, 5).map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormData((prev) => ({ ...prev, bank: b }))}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-[#EFF8F3] hover:text-[#006C35] transition font-bold"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bank A/C (Account # / IBAN)
                  </label>
                  <input
                    type="text"
                    name="bankAc"
                    placeholder="e.g. SA7410000066800000631908"
                    value={formData.bankAc}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Official IBAN for wage protection (WPS)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Salary (Base Salary SAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">SAR</span>
                    <input
                      type="number"
                      step="any"
                      name="salary"
                      placeholder="e.g. 2500"
                      value={formData.salary}
                      onChange={handleChange}
                      className="w-full pl-12 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Monthly basic wage in SAR</span>
                </div>
              </div>
            </div>

            {/* 4. ORGANIZATION & CONTACT INFORMATION (Headers: department, Company Name) */}
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#006C35]" />
                  <span>4. Organization & Assignment</span>
                </h3>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  Headers: department &bull; Company Name
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    department (Department / Division) *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Company Name (Sponsoring Entity) *
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    name="jobPosition"
                    placeholder="e.g. Civil Site Specialist"
                    value={formData.jobPosition}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Saudi Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="+966 50 123 4567"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@alhouf.sa"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. INTERNAL NOTES */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Internal HR / Qiwa / Muqeem Notes
              </label>
              <textarea
                name="internalNotes"
                rows={2}
                placeholder="Additional administrative or sponsor notes..."
                value={formData.internalNotes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link
                href="/employees"
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer inline-flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-md shadow-[#006C35]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "Creating Employee..." : "Save to Roster"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
