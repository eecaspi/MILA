import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-frank",
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
  themeColor: "#0b0a09",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.locale.lang}
      dir={siteConfig.locale.dir}
      className={`${heebo.variable} ${frank.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
