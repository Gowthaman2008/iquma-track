"use client";

import React, { useState } from "react";
import { RefreshCw, X, Calendar, DollarSign, FileText, CheckCircle2 } from "lucide-react";

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  currentExpiryStr: string;
  onSuccess: () => void;
}

export function RenewModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  currentExpiryStr,
  onSuccess,
}: RenewModalProps) {
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split("T")[0]);
  const [cost, setCost] = useState("9650"); // Typical Saudi Work Permit + Iqama fee
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpiryDate) {
      setError("Please select the new Iqama expiry date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/employees/${employeeId}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newExpiryDate,
          renewalDate,
          cost,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to renew Iqama");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Renew Employee Iqama</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-[#EFF8F3] border border-[#D0E5D8] rounded-xl p-3 text-xs text-[#004B28]">
            <p className="font-semibold text-sm">{employeeName}</p>
            <p className="mt-0.5">Current Expiry: <span className="font-bold">{currentExpiryStr}</span></p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              New Iqama Expiry Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                required
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006C35] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Select 1 year or 2 years in advance per Muqeem regulations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006C35] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cost (SAR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 9650"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Renewal Notes / Muqeem SADAD Reference
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Qiwa contract validated, SADAD bill 10293 paid."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006C35] focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#006C35] text-white hover:bg-[#004B28] transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Processing..." : "Confirm Renewal"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
