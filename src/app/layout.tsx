import type { Metadata, Viewport } from "next";
import { BRAND, SITE_URL } from "@/lib/brand";
import "./globals.css";

const DEFAULT_TITLE = "Lavni — Handmade Maharashtrian Jewellery in Nagpur";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${BRAND.legalName}` },
  description: BRAND.description,
  keywords: BRAND.keywords,
  applicationName: BRAND.legalName,
  authors: [{ name: BRAND.legalName }],
  creator: BRAND.legalName,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND.legalName,
    title: DEFAULT_TITLE,
    description: BRAND.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: BRAND.description },
  robots: { index: true, follow: true },
  category: "shopping",
  // Local SEO hints for Nagpur, Maharashtra.
  other: {
    "geo.region": BRAND.address.regionCode,
    "geo.placename": `${BRAND.address.city}, ${BRAND.address.region}`,
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
