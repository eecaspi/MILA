import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.brand.name} | ${siteConfig.brand.tagline}`,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.brand.description,
  openGraph: {
    siteName: siteConfig.brand.name,
    locale: "he_IL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5b2a4e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.locale.lang} dir={siteConfig.locale.dir} className={heebo.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
