import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACN — Agentic Clearing Network | PayPal Sandbox mLoC & B2B Escrow Engine",
  description:
    "Autonomous Micro-Letter-of-Credit & B2B Escrow Engine built on PayPal Sandbox (Orders v2, Invoicing v2, Tracking v1, Payouts v1, Disputes/Refunds) + AG Grid + APIMatic + Channel3.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060911] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
