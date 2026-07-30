import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/session";
import "./globals.css";
import "../styles/stor24-brand.css";

const satoshi = localFont({
  src: "../../public/brand/Satoshi-Variable.ttf",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  title: {
    default: "Stor24 CRM",
    template: "%s | Stor24 CRM",
  },
  description: "Cloud operations platform for Stor24 self-storage facilities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
