import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

// The one typeface for all site text (headings and body).
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const title = `${siteConfig.brand.nameEn} ${siteConfig.brand.name} | ${siteConfig.brand.slogan}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: title,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.brand.description,
  applicationName: siteConfig.brand.name,
  openGraph: {
    title,
    description: siteConfig.brand.description,
    siteName: siteConfig.brand.name,
    locale: "he_IL",
    type: "website",
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "Liky – יש לי קישור בשבילך" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fffafa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.locale.lang} dir={siteConfig.locale.dir} className={`${heebo.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
