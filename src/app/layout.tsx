import type { Metadata } from "next";
import "./globals.css";
import { storeConfig } from "@/lib/storeConfig";

export const metadata: Metadata = {
  title: storeConfig.seo.defaultTitle,
  description: storeConfig.seo.defaultDescription,
  keywords: storeConfig.seo.defaultKeywords.join(", "),
  authors: [{ name: storeConfig.store.name }],
  openGraph: {
    title: storeConfig.seo.defaultTitle,
    description: storeConfig.seo.defaultDescription,
    type: "website",
    images: storeConfig.seo.ogImage ? [storeConfig.seo.ogImage] : undefined,
  },
  twitter: {
    card: storeConfig.seo.twitterCard || "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
