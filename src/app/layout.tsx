import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Nunito } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://iratt.vercel.app";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IRATT | International Student Registration & QR Verification",
    template: "%s | IRATT",
  },
  description:
    "IRATT is the International Student Registration portal for OCI, NRI, and foreign students. Register online, get a secure QR code, and verify with coordinators.",
  applicationName: "IRATT",
  keywords: [
    "IRATT",
    "IRATT registration",
    "IRATT VIT",
    "international student registration",
    "OCI NRI foreign student",
    "student QR verification",
    "IRATT portal",
  ],
  authors: [{ name: "IRATT" }],
  creator: "IRATT",
  publisher: "IRATT",
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "IRATT",
    title: "IRATT | International Student Registration",
    description:
      "Register as an international student on IRATT. Submit details, receive a QR credential, and complete coordinator verification.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "IRATT | International Student Registration",
    description:
      "Official IRATT portal for international student registration and QR verification.",
  },
  category: "education",
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
