import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIKE - Just Do It",
  description: "Shop the latest Nike shoes, clothing, and accessories. Free shipping on orders over $50.",
  keywords: "Nike, shoes, sneakers, athletic wear, running, basketball, sports",
  authors: [{ name: "Nike Inc." }],
  openGraph: {
    title: "NIKE - Just Do It",
    description: "Shop the latest Nike shoes, clothing, and accessories.",
    type: "website",
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
