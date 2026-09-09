import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NESGESFinance.app v3.1",
  description:
    "NESGESFinance.app v3.1 unifies Bitcoin L1 mempool monitoring, Taproot Commit/Reveal flows, PSBT marketplace operations, and NGF•BTC•AM token gating.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
