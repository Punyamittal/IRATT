import type { Metadata } from "next";
import Link from "next/link";
import { TerminalShell } from "@/components/TerminalShell";

export const metadata: Metadata = {
  title: "IRATT Home",
  description:
    "Welcome to IRATT — International Student Registration. Start registration for OCI, NRI, and foreign students and receive a secure QR verification code.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "IRATT | International Student Registration",
    description:
      "Official IRATT student registration portal. Register once and present your QR code to the coordinator.",
    url: "https://iratt.vercel.app/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://iratt.vercel.app/#website",
      url: "https://iratt.vercel.app/",
      name: "IRATT",
      alternateName: [
        "IRATT Registration",
        "International Student Registration",
        "IRATT Portal",
      ],
      description:
        "IRATT is the international student registration and QR verification portal for OCI, NRI, and foreign students.",
      inLanguage: "en",
      potentialAction: {
        "@type": "RegisterAction",
        target: "https://iratt.vercel.app/register",
        name: "Start IRATT Registration",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://iratt.vercel.app/#organization",
      name: "IRATT",
      url: "https://iratt.vercel.app/",
      logo: "https://iratt.vercel.app/iratt-site-qr.png",
    },
    {
      "@type": "WebPage",
      "@id": "https://iratt.vercel.app/#webpage",
      url: "https://iratt.vercel.app/",
      name: "IRATT | International Student Registration",
      isPartOf: { "@id": "https://iratt.vercel.app/#website" },
      about: { "@id": "https://iratt.vercel.app/#organization" },
      description:
        "Register on IRATT for international student verification with a secure QR credential.",
    },
  ],
};

export default function HomePage() {
  return (
    <TerminalShell title="IRATT — International Student Registration" footer={<LandingFooter />}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bezel mx-auto max-w-2xl px-6 py-10 sm:px-10 sm:py-14">
        <p className="clay-chip text-[var(--phosphor-bright)]">IRATT student registration portal</p>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[var(--text)] sm:text-4xl">
          IRATT — register once, verify with QR
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
          <strong className="text-[var(--text)]">IRATT</strong> is the International Student Registration portal for
          OCI, NRI, and Foreign Student categories. Submit your details on IRATT to receive a unique QR credential,
          then present it to the coordinator for verification.
        </p>
        <ul className="mt-5 space-y-2 text-sm font-bold text-[var(--text)]">
          <li>Fast IRATT online registration</li>
          <li>Secure QR verification token</li>
          <li>Admin coordinator scan workflow</li>
        </ul>
        <div className="mt-8">
          <Link href="/register" className="btn btn-amber btn-large">
            Start IRATT Registration
          </Link>
        </div>
        <div className="mt-8 text-sm font-bold text-[var(--muted)]">
          Authorized personnel only —{" "}
          <Link href="/admin/login">Admin access</Link>
        </div>
      </section>
    </TerminalShell>
  );
}

function LandingFooter() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span>IRATT public desk · iratt.vercel.app</span>
      <span>One-tap registration</span>
    </div>
  );
}
