import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSignals from "@/components/SiteSignals";

export const metadata: Metadata = {
  title: {
    default: "New Concept Security",
    template: "%s - New Concept Security",
  },
  description:
    "New Concept Security is an SIA Approved Contractor based in Blackpool. Manned guarding, site security, healthcare security, key holding and CCTV across the UK.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Header />
        <main id="content" className="pt-[var(--header-h)]">
          {children}
        </main>
        <Footer />
        <SiteSignals />
      </body>
    </html>
  );
}
