"use client";

import React, { useState } from "react";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";

interface UploadDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

export function UploadDocModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}: UploadDocModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setError("File exceeds 10MB limit.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
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
        <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Upload Iqama Document</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-emerald-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            Uploading document for <span className="font-bold text-gray-900">{employeeName}</span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#006C35] transition cursor-pointer">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-[#006C35] mb-2" />
              <p className="text-xs font-semibold text-gray-700">
                {file ? file.name : "Click to select Iqama PDF or Image"}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#006C35] text-white hover:bg-[#004B28] transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Uploading..." : "Save Document"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
