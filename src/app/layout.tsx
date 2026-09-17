import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-nunito",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "ISRS // International Student Registration System",
  description: "Student registration and administrator QR verification console.",
  referrer: "no-referrer",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e7d7c3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${ibmPlexMono.variable} antialiased`}>
        <div className="crt-root">{children}</div>
      </body>
    </html>
  );
}
