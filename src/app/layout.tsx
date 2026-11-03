import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Great_Vibes, Heebo } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

// Script face for the "Likey" wordmark (matches the official logo artwork).
const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

// Elegant Hebrew serif for headings.
const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-frank",
  display: "swap",
});

const title = `Likey ${siteConfig.brand.name} | ${siteConfig.brand.slogan}`;

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
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "Likey – יש לי משהו בשבילך" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf7f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.locale.lang}
      dir={siteConfig.locale.dir}
      className={`${heebo.variable} ${frank.variable} ${script.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
