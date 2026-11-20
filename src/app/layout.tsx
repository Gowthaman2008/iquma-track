import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function cleanNode(node) {
                  if (!node || node.nodeType !== 1) return;
                  for (var i = node.attributes.length - 1; i >= 0; i--) {
                    var name = node.attributes[i].name;
                    if (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0) {
                      node.removeAttribute(name);
                    }
                  }
                  var children = node.querySelectorAll ? node.querySelectorAll('*') : [];
                  for (var j = 0; j < children.length; j++) {
                    var el = children[j];
                    for (var k = el.attributes.length - 1; k >= 0; k--) {
                      var attr = el.attributes[k].name;
                      if (attr.indexOf('bis_') === 0 || attr.indexOf('__processed_') === 0) {
                        el.removeAttribute(attr);
                      }
                    }
                  }
                }
                cleanNode(document.documentElement);
                if (typeof MutationObserver !== 'undefined') {
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes') {
                        var attr = m.attributeName;
                        if (attr && (attr.indexOf('bis_') === 0 || attr.indexOf('__processed_') === 0) && m.target.hasAttribute(attr)) {
                          m.target.removeAttribute(attr);
                        }
                      } else if (m.addedNodes && m.addedNodes.length > 0) {
                        for (var n = 0; n < m.addedNodes.length; n++) {
                          cleanNode(m.addedNodes[n]);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${jakarta.variable} ${inter.variable} ${jakarta.className} min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF] antialiased selection:bg-[#10b981] selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
