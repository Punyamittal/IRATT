import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Registration",
  description:
    "Complete your IRATT international student registration. Enter name, registration number, category, country of residence, and phone to receive a QR code.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: "IRATT Student Registration",
    description: "Register on IRATT and get your verification QR code.",
    url: "https://iratt.vercel.app/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
