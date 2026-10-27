"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/aurora/Navbar";
import Hero from "@/components/aurora/Hero";
import {
  ShieldCheck,
  Building2,
  HardHat,
  Truck,
  FileCheck2,
  Users,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Send,
  Lock,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Civil Engineering Contracting",
    message: "",
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 5000);
    setInquiryForm({
      name: "",
      email: "",
      phone: "",
      subject: "Civil Engineering Contracting",
      message: "",
    });
  };

  const sectors = [
    {
      id: "civil",
      title: "Civil Engineering & Mega Construction",
      arabic: "الهندسة المدنية والإنشاءات الكبرى",
      icon: Building2,
      desc: "Turnkey delivery of commercial towers, industrial manufacturing facilities, and residential masterplans adhering to Grade-1 Saudi building codes.",
      projects: ["KAFD Commercial Tower 4B", "Diriyah Gate Ancillary Works", "Sudair Industrial Complex"],
    },
    {
      id: "infra",
      title: "Infrastructure & Energy Networks",
      arabic: "البنية التحتية وشبكات الطاقة",
      icon: Zap,
      desc: "High-voltage transmission lines, potable water distributions, arterial roadway networks, and smart utility ducting for gigaprojects.",
      projects: ["Riyadh Metro Feeder Utilities", "Eastern Province Water Corridor", "Al-Kharj Power Substation"],
    },
    {
      id: "mep",
      title: "Commercial Electromechanical (MEP)",
      arabic: "الكهروميكانيك والأنظمة الذكية",
      icon: HardHat,
      desc: "District cooling chillers, intelligent building management systems (BMS), life-safety fire suppression, and data center electrical conditioning.",
      projects: ["King Salman Park MEP Packages", "Riyadh Airport Logistics Terminal", "Dammam Medical Complex MEP"],
    },
    {
      id: "tfm",
      title: "Total Facilities Management (TFM)",
      arabic: "إدارة المرافق والتشغيل والصيانة",
      icon: ShieldCheck,
      desc: "Comprehensive 24/7 technical operations, predictive HVAC asset maintenance, certified HSE auditing, and workforce accommodation management.",
      projects: ["Jeddah Corporate Business Parks", "Ministry of Transport Regional Assets", "Al-Khobar Commercial Hub"],
    },
  ];

  const offices = [
    {
      city: "Riyadh (Corporate HQ)",
      arabic: "المقر الرئيسي — الرياض",
      address: "King Fahd Road, Al Olaya District, Floor 18, Al Houf Tower",
      phone: "+966 11 480 9200",
      email: "hq@alhouf.sa",
      hours: "Sun – Thu: 8:00 AM – 5:30 PM",
    },
    {
      city: "Jeddah (Western Region)",
      arabic: "فرع المنطقة الغربية — جدة",
      address: "Al Madinah Al Munawwarah Road, Al Salamah District",
      phone: "+966 12 667 4430",
      email: "western@alhouf.sa",
      hours: "Sun – Thu: 8:00 AM – 5:00 PM",
    },
    {
      city: "Eastern Province (Dammam / Khobar)",
      arabic: "فرع المنطقة الشرقية — الخبر والدمام",
      address: "King Abdulaziz Road, Al Yarmouk, Khobar Business Gateway",
      phone: "+966 13 898 1120",
      email: "eastern@alhouf.sa",
      hours: "Sun – Thu: 8:00 AM – 5:00 PM",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-['Inter',sans-serif] selection:bg-[#10b981] selection:text-black">
      {/* 1. Aurora Top Navigation Bar */}
      <Navbar />

      {/* 2. Aurora Landing Hero (Left-anchored, video background, layered glass overlays) */}
      <Hero />

      {/* 3. Company Credentials & Key Metrics Section */}
      <section id="company" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] overflow-hidden">
        {/* Subtle background emerald glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Corporate Story & Official Registration */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] backdrop-blur-md text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Commercial Registration • CR 1010778899</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                Rooted in Saudi Heritage,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-300 to-emerald-500">
                  Building National Scale
                </span>
              </h2>

              <p className="text-base sm:text-lg text-gray-300/90 leading-relaxed font-light">
                Established over 28 years ago, <strong>AL Houf Group (مجموعة الهفوف للتجارة والمقاولات)</strong> has grown from an Eastern Province pioneer into one of Saudi Arabia’s foremost multi-disciplinary contracting and engineering powerhouses.
              </p>

              <p className="text-sm text-gray-400 leading-relaxed">
                Operating directly under the regulations of the Ministry of Commerce, the Ministry of Human Resources, and the Saudi Contractors Authority (SCA), AL Houf maintains Grade-1 contractor status and an exemplary Platinum Nitaqat rating across its national workforce.
              </p>

              {/* Badges / Credentials Row */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-start gap-3.5 hover:border-emerald-500/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Platinum Nitaqat Rating</h4>
                    <p className="text-xs text-emerald-400 font-arabic font-medium">نطاق بلاتيني معتمد</p>
                    <p className="text-xs text-gray-400 mt-1">High Saudization & flawless regulatory standing</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-start gap-3.5 hover:border-emerald-500/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Chamber of Commerce</h4>
                    <p className="text-xs text-emerald-400 font-medium">Riyadh & Eastern Chamber</p>
                    <p className="text-xs text-gray-400 mt-1">Certified membership & ISO 9001/45001 accredited</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Key Statistics Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 grid grid-cols-2 gap-4"
            >
              {[
                { number: "1,450+", label: "Certified Workforce", sub: "Engineers, managers & technicians" },
                { number: "120+", label: "Active Megaprojects", sub: "Civil, MEP & infrastructure" },
                { number: "28+", label: "Years in Kingdom", sub: "Pioneering Saudi development" },
                { number: "99.4%", label: "Iqama Compliance", sub: "Muqeem & Qiwa automated audits" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] transition group"
                >
                  <p className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans',sans-serif] tracking-tight group-hover:text-emerald-300 transition">
                    {stat.number}
                  </p>
                  <h4 className="text-sm font-semibold text-gray-200 mt-2">{stat.label}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">{stat.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Core Business Sectors */}
      <section id="sectors" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-black/60">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Core Capabilities & Sectors</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Engineering Solutions for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                  Every Sector
                </span>
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-md font-light">
              From foundational earthworks to complex electromechanical automation, AL Houf delivers unmatched execution speed, safety, and regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -6, borderColor: "rgba(16, 185, 129, 0.45)" }}
                  className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-gray-500">0{idx + 1} // SECTOR</span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-emerald-300 transition">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-emerald-400 font-arabic font-medium mt-1 mb-3">{sec.arabic}</p>
                    <p className="text-sm text-gray-300/80 leading-relaxed font-light">{sec.desc}</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06]">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                      Representative Engagements:
                    </span>
                    <ul className="space-y-1.5">
                      {sec.projects.map((proj, pIdx) => (
                        <li key={pIdx} className="text-xs text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{proj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Employee Self-Service & Admin Access Portals Section */}
      <section id="compliance" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-900/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Digital Workforce Portals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Instant Access for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">
                Employees & Admins
              </span>
            </h2>
            <p className="text-sm text-gray-400 mt-4 font-light">
              Log in securely to review personal residency permits, expiry countdowns, and renewal requests, or access the HR command center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Employee Portal Card (Google Sign-In) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-white/[0.02] to-black border border-emerald-500/30 backdrop-blur-md relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold">
                    Self-Service Portal
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Employee Self-Service Portal
                </h3>
                <p className="text-xs text-emerald-400 font-arabic font-medium mt-1">بوابة الموظف للخدمات الذاتية</p>

                <p className="text-sm text-gray-300 mt-4 leading-relaxed font-light">
                  AL Houf employees can sign in with their corporate Google credentials to inspect their personal record, days remaining until Iqama expiry, uploaded document copies, and submit 1-click renewal requests to HR.
                </p>

                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Asia/Riyadh Iqama countdown timer</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Instant Google 1-Click single sign-on</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Secure encrypted document vault (Iqama & Passport)</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-6 rounded-full bg-white text-black font-semibold text-sm hover:bg-emerald-300 transition flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 group-hover:scale-[1.02]"
                >
                  {/* Google SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>

            {/* HR Administrator Console Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white">
                    <Lock className="w-6 h-6 text-gray-300" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-[11px] text-gray-300 font-semibold">
                    HR & Admin Console
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  IqamaTrack Admin Suite
                </h3>
                <p className="text-xs text-gray-400 font-arabic font-medium mt-1">لوحة إدارة الإقامات والموارد البشرية</p>

                <p className="text-sm text-gray-300 mt-4 leading-relaxed font-light">
                  HR managers and compliance officers can access comprehensive dashboards, real-time expiry calendars, batch renewal processing, and automated email trigger engines.
                </p>

                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Dynamic multi-stage expiry triggers (30, 15, 7, 3, 1, 0 days)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Muqeem fee tracking & renewal logs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>CSV / Excel employee export and audit trails</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-6 rounded-full bg-white/[0.08] text-white font-semibold text-sm hover:bg-white/20 transition flex items-center justify-center gap-2.5 border border-white/[0.15]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin & HR Manager Login</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Kingdom-Wide Offices & Contact Information */}
      <section id="offices" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-black/40">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Presence Across Saudi Arabia</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Strategic Offices in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                Key Economic Hubs
              </span>
            </h2>
            <p className="text-sm text-gray-400 mt-3 font-light">
              Connect with our regional engineering teams and executive management across the Kingdom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((office, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md hover:border-emerald-500/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    {office.city}
                  </h3>
                  <p className="text-xs text-emerald-400 font-arabic font-medium mb-4">{office.arabic}</p>

                  <div className="space-y-3 text-xs text-gray-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                      <a href={`tel:${office.phone}`} className="hover:text-emerald-400 transition font-mono">
                        {office.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                      <a href={`mailto:${office.email}`} className="hover:text-emerald-400 transition">
                        {office.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-gray-400">{office.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Corporate Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md"
          >
            <div className="max-w-2xl mb-8">
              <h3 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Direct Corporate Inquiries & Tenders
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Reach our procurement, pre-qualification, and commercial partnerships team.
              </p>
            </div>

            {inquirySent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Thank you. Your message has been routed to AL Houf Executive Inquiries. We will respond within 24 business hours.</span>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="Eng. Abdullah Al-Otaibi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="name@company.sa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="+966 50 123 4567"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Executive Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* 7. Aurora Minimalist Dark Footer */}
      <footer className="relative py-14 px-6 lg:px-16 border-t border-white/[0.08] bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-black flex items-center justify-center shadow-lg shrink-0">
              <img
                src="/logo/arabic-logo.png"
                alt="AL HOUF Group Arabic Logo"
                className="w-full h-full object-contain scale-110"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-white font-['Plus_Jakarta_Sans',sans-serif] tracking-wider">
                  AL HOUF TRADING & CONTRACTING GROUP
                </p>
                <span className="text-emerald-400 font-semibold text-xs">الهفوف</span>
              </div>
              <p className="text-[11px] text-gray-400">
                CR 1010778899 &bull; Saudi Arabia &bull; Under Vision 2030
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#overview" className="hover:text-emerald-400 transition">Overview</a>
            <a href="#company" className="hover:text-emerald-400 transition">Company</a>
            <a href="#sectors" className="hover:text-emerald-400 transition">Sectors</a>
            <a href="#offices" className="hover:text-emerald-400 transition">Offices</a>
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Employee Portal
            </Link>
            <Link href="/login" className="hover:text-white transition">Admin</Link>
          </div>

          <div>
            <p>&copy; {new Date().getFullYear()} AL Houf Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
