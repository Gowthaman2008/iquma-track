import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AL HOUF Group | Enterprise Saudi Contracting & Workforce Management",
  description:
    "AL Houf Trading & Contracting Group — Pioneering civil engineering, industrial contracting, and Saudi Iqama workforce compliance under Vision 2030.",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: [
    "AL Houf Group",
    "Saudi Contracting",
    "Saudi Iqama Expiry",
    "IqamaTrack",
    "Muqeem Qiwa Management",
    "Saudi HR Portal",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${jakarta.variable} ${inter.variable} ${jakarta.className} min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF] antialiased selection:bg-[#10b981] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
