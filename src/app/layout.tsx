import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { AgeGate } from "@/components/store/age-gate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Force all pages to be dynamically rendered (database-backed app, no static prerendering)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Phased Research Group — Premium Research Peptides",
    template: "%s | Phased Research Group",
  },
  description:
    "Premium research peptides supplied exclusively for lawful laboratory research use by qualified personnel. Every batch is third-party tested with Certificates of Analysis available.",
  keywords: [
    "research peptides",
    "laboratory supplies",
    "phased research group",
    "peptide synthesis",
    "research chemicals",
    "certificate of analysis",
  ],
  authors: [{ name: "Phased Research Group" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Phased Research Group — Premium Research Peptides",
    description: "Laboratory-grade research peptides. Third-party tested. COA available.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${oswald.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Providers>
          <AgeGate />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
