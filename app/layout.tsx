import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import { REPO } from "@/lib/site";
import "./globals.css";

const head = Bricolage_Grotesque({ variable: "--font-head", subsets: ["latin"] });
const body = Geist({ variable: "--font-body", subsets: ["latin"] });
const code = Geist_Mono({ variable: "--font-code", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://leakybyte.xyz"),
  title: "LeakyByte: a privacy layer for AI apps",
  description:
    "LeakyByte sits between your app and the Claude API. It swaps secrets and personal data for placeholders before the prompt leaves, and restores them in the reply.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${head.variable} ${body.variable} ${code.variable} antialiased`}>
      <body className="min-h-screen">
        <SiteHeader />
        {children}
        <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-muted">
          © 2026 LeakyByte. Not affiliated with Anthropic. <a className="underline" href={REPO}>Source on GitHub</a>.
        </footer>
      </body>
    </html>
  );
}
