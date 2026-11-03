import type { Metadata, Viewport } from "next";
import { Heebo, Rubik } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

// Rounded, friendly display face for headings and the לייקי wordmark.
const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

const title = `${siteConfig.brand.name} | ${siteConfig.brand.slogan}`;

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
  },
};

export const viewport: Viewport = {
  themeColor: "#fff9f7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.locale.lang}
      dir={siteConfig.locale.dir}
      className={`${heebo.variable} ${rubik.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
