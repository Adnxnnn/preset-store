import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { UIProvider } from "./components/UIFeedback";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LUMA Presets | Premium Digital Presets & LUTs",
  description: "One-click cinematic color grading tools for Lightroom, Photoshop, and mobile creators. Instant secure download, no account required.",
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "LUMA Presets | Premium Digital Presets & LUTs",
    description: "Professional photo presets for Lightroom Mobile & Desktop.",
    type: "website",
    images: ["/images/luma.png"],
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,700&family=Google+Sans+Text:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full h-full bg-[#050505] text-[#ededed] font-sans">
        <UIProvider>
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
