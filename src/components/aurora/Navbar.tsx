"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavbarProps {
  onOpenGoogleLogin?: () => void;
}

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Company", href: "#company" },
  { label: "Sectors", href: "#sectors" },
  { label: "Offices", href: "#offices" },
  { label: "Compliance", href: "#compliance" },
];

export default function Navbar({ onOpenGoogleLogin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "26px 44px",
        background: scrolled
          ? "rgba(0, 0, 0, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "44px" }}>
        {/* Brand with Arabic Corporate Emblem & AL Houf Name */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          {/* Authentic Saudi Arabic Corporate Emblem */}
          <div
            style={{
              position: "relative",
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1.5px solid rgba(212, 175, 55, 0.45)",
              background: "linear-gradient(135deg, #021a0e 0%, #000000 100%)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo/arabic-logo.png"
              alt="AL HOUF Group Arabic Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: "scale(1.15)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: "#FFFFFF",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.1,
                }}
              >
                AL HOUF
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#10b981",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.1,
                }}
              >
                الهفوف
              </span>
            </div>
            <span
              style={{
                fontSize: "9.5px",
                letterSpacing: "0.16em",
                color: "rgba(255, 255, 255, 0.7)",
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Group • KSA
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div
          className="hidden md:flex"
          style={{ display: "flex", alignItems: "center", gap: "30px" }}
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                color: "rgba(255, 255, 255, 0.82)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#10b981";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.82)";
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Right Action Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* White Pill Action Link navigating to /login page */}
        <Link
          href="/login"
          style={{
            padding: "11px 24px",
            borderRadius: "999px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: "#111",
            textDecoration: "none",
            background: "#fff",
            boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          className="hover:scale-[1.03] active:scale-[0.97]"
        >
          {/* Subtle Google Icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
          Employee Login
        </Link>
      </div>
    </motion.nav>
  );
}
