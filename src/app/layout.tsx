import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Scout | Small Business Influencer Marketplace",
  description: "Scout helps small businesses connect with micro-influencers for paid and in-kind collaborations.",
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
