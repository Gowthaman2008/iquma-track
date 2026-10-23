import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IqamaTrack — Saudi Employee Document Management System",
  description:
    "Enterprise-level Saudi Iqama expiry tracking, document storage, and automated notification system for HR and corporate administrators.",
  keywords: [
    "Saudi Iqama Expiry",
    "Iqama Tracker",
    "Muqeem Qiwa Management",
    "Saudi HR Portal",
    "Expatriate Document Management",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${jakarta.className} min-h-screen flex flex-col bg-[#F5F8F6] text-[#172B22] antialiased`}>
        {children}
      </body>
    </html>
  );
}
