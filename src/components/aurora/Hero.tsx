"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeroProps {
  onOpenGoogleLogin?: () => void;
}

const socials = [
  {
    label: "X",
    href: "https://x.com",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
];

export default function Hero({ onOpenGoogleLogin }: HeroProps) {
  return (
    <section
      id="overview"
      className="relative w-full min-h-screen min-h-[100svh] overflow-x-hidden flex flex-col justify-between"
    >
      {/* Arabic Architectural Masterpiece Background */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0.85 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/hero/arabic-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 38%",
        }}
      />

      {/* Layered Overlays for High-Contrast Text Legibility & Depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.6) 42%, rgba(0, 0, 0, 0.35) 75%, rgba(0, 0, 0, 0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, transparent 26%, transparent 62%, rgba(0, 0, 0, 0.9) 100%)",
        }}
      />

      {/* Aurora Emerald & Amber Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "25%",
          width: "900px",
          height: "650px",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.16) 0%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Left-anchored Content */}
      <div
        className="relative z-10 flex flex-col flex-1 justify-center pt-24 sm:pt-28 md:pt-36 pb-24 sm:pb-28 px-4 sm:px-8 md:px-16 max-w-4xl"
      >
        {/* Trusted-by avatar badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            borderRadius: "999px",
            padding: "5px 14px 5px 6px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            width: "fit-content",
          }}
        >
          <div style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #10b981, #047857)",
                  border: "2px solid rgba(10, 20, 16, 0.9)",
                  marginLeft: i === 0 ? 0 : "-8px",
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.9)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            We&apos;re trusted by{" "}
            <strong style={{ color: "#fff", fontWeight: 600 }}>
              1,450+ workforce in KSA
            </strong>
          </span>
        </motion.div>

        {/* Headline in Plus Jakarta Sans */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold tracking-tight text-white mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-6xl leading-[1.12]"
        >
          AL Houf Group
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #ffffff 40%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Engineering Saudi Tomorrow
          </span>
        </motion.h1>

        {/* Arabic Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="mt-2.5 sm:mt-3 text-sm sm:text-base text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif] font-semibold tracking-wide"
        >
          مجموعة الهفوف للتجارة والمقاولات • رؤية 2030
        </motion.div>

        {/* Subtitle in Inter */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-white/80 leading-relaxed font-['Inter',sans-serif] max-w-xl"
        >
          AL Houf delivers Grade-1 civil contracting, infrastructure, and platinum-rated Iqama compliance across the Kingdom of Saudi Arabia.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.58, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 sm:mt-8 w-full sm:w-auto"
        >
          {/* Dark Pill CTA navigating directly to /login page */}
          <Link
            href="/login"
            className="hover:scale-[1.02] active:scale-[0.98] px-5 sm:px-6 py-3.5 rounded-full bg-[#0a0a0a] text-white text-xs sm:text-sm font-semibold border border-white/20 inline-flex items-center justify-center gap-2.5 shadow-xl transition-all"
          >
            {/* Google Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
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
            <span>Employee Portal (Sign in)</span>
          </Link>

          {/* Secondary Pill CTA */}
          <motion.a
            href="#company"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 sm:px-6 py-3.5 rounded-full bg-white/10 text-white text-xs sm:text-sm font-medium border border-white/15 backdrop-blur-md inline-flex items-center justify-center transition-all hover:bg-white/15"
          >
            Company Details
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom Bar: Social Icons & Saudi Badge */}
      <div className="relative z-10 px-4 sm:px-8 md:px-16 pb-6 flex items-center justify-between gap-4">
        {/* Social Icons */}
        <div className="flex items-center gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-8 h-8 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-emerald-400 hover:border-emerald-400 transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>

        {/* Saudi Corporate HQ Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs text-white/80 font-['Inter',sans-serif]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>Kingdom of Saudi Arabia • Vision 2030</span>
        </div>
      </div>
    </section>
  );
}
