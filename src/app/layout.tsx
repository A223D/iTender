import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "iTender | Discover Campaigns",
  description: "Explore influencer campaigns with fast filtering and brief search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
