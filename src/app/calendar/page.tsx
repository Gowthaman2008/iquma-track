"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: any[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?year=${year}&month=${month + 1}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    return true;
  });

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredEvents.filter((e) => e.dateStr === dayStr);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-[#006C35]" />
              <span>Iqama Expiry Calendar</span>
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Visualize monthly expatriate residence permit deadlines and renewal milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E2ECE5] rounded-xl text-xs font-semibold text-gray-700 shadow-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical (1-7d)</option>
              <option value="EXPIRES_TODAY">Expires Today</option>
              <option value="EXPIRING_SOON">Expiring Soon (8-30d)</option>
              <option value="EXPIRED">Expired</option>
              <option value="VALID">Valid (&gt;30d)</option>
            </select>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1 bg-white border border-[#E2ECE5] rounded-xl p-1 shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-[#006C35] hover:bg-[#EFF8F3] rounded-lg transition"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E2ECE5] shadow-xs flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
          <span className="font-bold text-gray-900">Urgency Key:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span>Valid (&gt;30d)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>Expiring Soon (8-30d)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            <span>Critical (1-7d)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
            <span>Expires Today</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
            <span>Expired</span>
          </span>
        </div>

        {/* Month Title Banner */}
        <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] text-white px-6 py-3 rounded-2xl shadow-xs flex items-center justify-between">
          <h2 className="text-base font-extrabold tracking-wide">
            {monthNames[month]} {year}
          </h2>
          <span className="text-xs text-emerald-100 font-medium">
            {filteredEvents.length} Expiries in records
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-[#F8FAF9] border-b border-[#E2ECE5] text-center py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 min-h-[550px]">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50/50 p-2 min-h-[90px]" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ day, events: dayEvents })}
                  className={`p-2 min-h-[90px] transition relative flex flex-col justify-between cursor-pointer hover:bg-gray-50 ${
                    isToday ? "bg-[#EFF8F3]/50 ring-2 ring-[#006C35] ring-inset" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? "bg-[#006C35] text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#004B28]">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev: any) => (
                      <div
                        key={ev.id}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white truncate shadow-2xs"
                        style={{ backgroundColor: ev.badgeColor }}
                        title={`${ev.title} - ${ev.statusLabel}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-gray-500 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Events Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  Expiries on {selectedDayEvents.day} {monthNames[month]} {year}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 rounded-md text-emerald-100 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDayEvents.events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <Link
                      href={`/employees/${ev.id}`}
                      className="font-bold text-gray-900 hover:text-[#006C35]"
                    >
                      {ev.title}
                    </Link>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Iqama: {ev.maskedIqama} &bull; {ev.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: ev.badgeColor }}
                    >
                      {ev.statusLabel}
                    </span>
                    <div className="mt-1">
                      <Link
                        href={`/employees/${ev.id}`}
                        className="text-[11px] text-[#006C35] font-semibold hover:underline"
                      >
                        View Profile &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
