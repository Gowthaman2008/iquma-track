import React from "react";
import { ExpiryStatus } from "@/lib/expiryEngine";

interface StatusBadgeProps {
  status: ExpiryStatus | string;
  daysRemaining?: number;
  label?: string;
  className?: string;
}

export function StatusBadge({
  status,
  daysRemaining,
  label,
  className = "",
}: StatusBadgeProps) {
  let bgClass = "bg-gray-100 text-gray-700 border-gray-200";
  let dotClass = "bg-gray-400";
  let defaultLabel = status;

  switch (status) {
    case "EXPIRED":
      bgClass = "bg-red-50 text-red-800 border-red-200 ring-1 ring-red-300/40";
      dotClass = "bg-red-600";
      defaultLabel = daysRemaining !== undefined ? `Expired (${Math.abs(daysRemaining)}d ago)` : "Expired";
      break;
    case "EXPIRES_TODAY":
      bgClass = "bg-red-600 text-white font-bold animate-pulse shadow-sm";
      dotClass = "bg-white";
      defaultLabel = "Expires Today!";
      break;
    case "CRITICAL":
      bgClass = "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-300/40";
      dotClass = "bg-rose-500 animate-ping";
      defaultLabel = daysRemaining !== undefined ? `Critical (${daysRemaining}d)` : "Critical";
      break;
    case "EXPIRING_SOON":
      bgClass = "bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300/40";
      dotClass = "bg-amber-500";
      defaultLabel = daysRemaining !== undefined ? `Expiring Soon (${daysRemaining}d)` : "Expiring Soon";
      break;
    case "VALID":
      bgClass = "bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300/40";
      dotClass = "bg-emerald-500";
      defaultLabel = daysRemaining !== undefined ? `Valid (${daysRemaining}d)` : "Valid";
      break;
    case "ACTIVE":
      bgClass = "bg-green-50 text-green-700 border-green-200";
      dotClass = "bg-green-500";
      defaultLabel = "Active";
      break;
    case "INACTIVE":
      bgClass = "bg-gray-100 text-gray-600 border-gray-200";
      dotClass = "bg-gray-400";
      defaultLabel = "Inactive";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{label || defaultLabel}</span>
    </span>
  );
}
